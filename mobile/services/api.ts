// Real API service for connecting to the server
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL - adjust for your environment
// 
// Configuration options:
// 1. Set EXPO_PUBLIC_API_URL in .env file (recommended)
// 2. For iOS Simulator/Android Emulator: 'http://localhost:3001/api'
// 3. For physical devices: use your computer's IP, e.g., 'http://192.168.1.24:3001/api'
// 4. For production: use your production API URL
//
// To find your computer's IP: ifconfig (Mac/Linux) or ipconfig (Windows)
// Current detected IP: 192.168.1.24 (update if different)
const API_BASE_URL = __DEV__ 
  ? (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api')
  : (process.env.EXPO_PUBLIC_API_URL || 'https://your-production-api.com/api');

// Log API base URL in development for debugging
if (__DEV__) {
  console.log('🔗 API Base URL:', API_BASE_URL);
}

// Token storage key
const TOKEN_KEY = '@missionconnect:token';
const USER_KEY = '@missionconnect:user';

// Types matching server models
export interface Contact {
  _id: string;
  id?: string; // For compatibility
  firstName: string;
  lastName: string;
  address?: string;
  phone: string;
  phoneNumber?: string; // For compatibility
  lat?: number;
  lng?: number;
  owner?: string;
  missionary?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Note {
  _id: string;
  id?: string; // For compatibility
  contact: string;
  contactId?: string; // For compatibility
  text: string;
  content?: string; // For compatibility
  author?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Visit {
  _id: string;
  id?: string; // For compatibility
  contact: string | { _id: string; firstName: string; lastName: string; phone?: string };
  contactId?: string; // For compatibility
  contactName?: string; // For compatibility
  user?: string;
  datetime: string;
  date?: string; // For compatibility
  time?: string; // For compatibility
  notes: string;
  reminderScheduled?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  _id: string;
  id?: string; // For compatibility
  name: string;
  email: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Helper to get auth token
async function getToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
}

// Helper to set auth token
async function setToken(token: string): Promise<void> {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Error setting token:', error);
  }
}

// Helper to remove auth token
async function removeToken(): Promise<void> {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error('Error removing token:', error);
  }
}

// Helper to make API requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  // Handle empty responses (like DELETE requests)
  const contentType = response.headers.get('content-type');
  const text = await response.text();
  
  if (!text || text.trim() === '') {
    // For empty responses (DELETE, etc.), return empty object as T
    return {} as T;
  }
  
  if (contentType && contentType.includes('application/json')) {
    return JSON.parse(text) as T;
  }
  
  // For non-JSON responses, return text as T
  return text as unknown as T;
}

// Helper to normalize contact from server format to app format
function normalizeContact(contact: any): Contact {
  return {
    ...contact,
    id: contact._id || contact.id,
    phoneNumber: contact.phone || contact.phoneNumber,
  };
}

// Helper to normalize visit from server format to app format
function normalizeVisit(visit: any): Visit {
  const contact = typeof visit.contact === 'object' ? visit.contact : null;
  const datetime = new Date(visit.datetime);
  const date = datetime.toISOString().split('T')[0];
  const time = datetime.toTimeString().slice(0, 5); // HH:MM

  return {
    ...visit,
    id: visit._id || visit.id,
    contactId: typeof visit.contact === 'string' ? visit.contact : visit.contact?._id,
    contactName: contact ? `${contact.firstName} ${contact.lastName}` : undefined,
    date,
    time,
  };
}

// Helper to normalize note from server format to app format
function normalizeNote(note: any): Note {
  return {
    ...note,
    id: note._id || note.id,
    contactId: typeof note.contact === 'string' ? note.contact : note.contact?._id,
    content: note.text || note.content,
  };
}

// Auth API
export const authApi = {
  register: async (name: string, email: string, password: string): Promise<User> => {
    const response = await apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });

    await setToken(response.token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.user));
    
    return {
      ...response.user,
      id: response.user._id || response.user.id,
    };
  },

  login: async (email: string, password: string): Promise<User> => {
    const response = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    await setToken(response.token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.user));
    
    return {
      ...response.user,
      id: response.user._id || response.user.id,
    };
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      const userStr = await AsyncStorage.getItem(USER_KEY);
      if (userStr) {
        const user = JSON.parse(userStr);
        return {
          ...user,
          id: user._id || user.id,
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  logout: async (): Promise<void> => {
    await removeToken();
  },
};

// Contacts API
export const contactsApi = {
  getAll: async (): Promise<Contact[]> => {
    const contacts = await apiRequest<any[]>('/contacts');
    return contacts.map(normalizeContact);
  },

  getById: async (id: string): Promise<Contact | null> => {
    try {
      const contact = await apiRequest<any>(`/contacts/${id}`);
      return normalizeContact(contact);
    } catch (error: any) {
      if (error.message.includes('404') || error.message.includes('not found')) {
        return null;
      }
      throw error;
    }
  },

  create: async (contact: Omit<Contact, '_id' | 'id'>): Promise<Contact> => {
    const payload = {
      firstName: contact.firstName,
      lastName: contact.lastName,
      address: contact.address,
      phone: contact.phoneNumber || contact.phone,
      lat: contact.lat,
      lng: contact.lng,
    };

    const created = await apiRequest<any>('/contacts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return normalizeContact(created);
  },

  update: async (id: string, updates: Partial<Contact>): Promise<Contact> => {
    const payload: any = {};
    if (updates.firstName !== undefined) payload.firstName = updates.firstName;
    if (updates.lastName !== undefined) payload.lastName = updates.lastName;
    if (updates.address !== undefined) payload.address = updates.address;
    if (updates.phoneNumber !== undefined) payload.phone = updates.phoneNumber;
    if (updates.phone !== undefined) payload.phone = updates.phone;
    if (updates.lat !== undefined) payload.lat = updates.lat;
    if (updates.lng !== undefined) payload.lng = updates.lng;

    const updated = await apiRequest<any>(`/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    return normalizeContact(updated);
  },

  delete: async (id: string): Promise<void> => {
    await apiRequest(`/contacts/${id}`, {
      method: 'DELETE',
    });
  },

  search: async (query: string): Promise<Contact[]> => {
    const contacts = await apiRequest<any[]>(`/contacts?q=${encodeURIComponent(query)}`);
    return contacts.map(normalizeContact);
  },
};

// Notes API
export const notesApi = {
  getByContactId: async (contactId: string): Promise<Note[]> => {
    const notes = await apiRequest<any[]>(`/notes?contactId=${contactId}`);
    return notes.map(normalizeNote);
  },

  create: async (contactId: string, content: string): Promise<Note> => {
    const created = await apiRequest<any>('/notes', {
      method: 'POST',
      body: JSON.stringify({
        contact: contactId,
        text: content,
      }),
    });

    return normalizeNote(created);
  },

  delete: async (id: string): Promise<void> => {
    await apiRequest(`/notes/${id}`, {
      method: 'DELETE',
    });
  },
};

// Visits API
export const visitsApi = {
  getAll: async (): Promise<Visit[]> => {
    const visits = await apiRequest<any[]>('/visits');
    return visits.map(normalizeVisit);
  },

  getUpcoming: async (): Promise<Visit[]> => {
    const visits = await apiRequest<any[]>('/visits');
    const now = new Date();
    return visits
      .map(normalizeVisit)
      .filter((v) => {
        const visitDate = new Date(`${v.date}T${v.time}`);
        return visitDate >= now;
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA.getTime() - dateB.getTime();
      });
  },

  create: async (visit: Omit<Visit, '_id' | 'id' | 'contactName'>): Promise<Visit> => {
    // Convert date and time to datetime
    const datetime = new Date(`${visit.date}T${visit.time}:00`).toISOString();

    const created = await apiRequest<any>('/visits', {
      method: 'POST',
      body: JSON.stringify({
        contact: visit.contactId || visit.contact,
        datetime,
        notes: visit.notes || '',
      }),
    });

    return normalizeVisit(created);
  },

  delete: async (id: string): Promise<void> => {
    await apiRequest(`/visits/${id}`, {
      method: 'DELETE',
    });
  },
};

