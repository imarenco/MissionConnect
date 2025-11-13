<<<<<<< HEAD
// mobile/services/mockApi.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  _id: string;
  name: string;
  email: string;
  token?: string;
}

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:5000/api';

async function getSavedToken(): Promise<string | null> {
  try {
    const u = await AsyncStorage.getItem('user');
    if (u) {
      const parsed = JSON.parse(u);
      return parsed?.token || parsed?.accessToken || null;
    }
    const token = await AsyncStorage.getItem('token');
    return token;
  } catch (err) {
    console.warn('getSavedToken error', err);
    return null;
  }
}

function normalizeUser(dataUser: any): User | null {
  if (!dataUser) return null;
  return {
    _id: dataUser._id || dataUser.id || String(dataUser),
    name: dataUser.name || '',
    email: dataUser.email || '',
  };
}

type AuthResult = { user: User | null; token?: string };

// ---------- AUTH (register/login) ----------
export const api = {
  register: async (name: string, email: string, password: string): Promise<AuthResult> => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => 'Register failed');
      throw new Error(txt || 'Register failed');
    }

    const parsed = await res.json().catch(() => ({}));
    // expected shapes: { user, token } or { token } or fallback to calling login
    const token = parsed.token || parsed.accessToken || parsed.refreshToken;
    const user = normalizeUser(parsed.user || parsed);

    if (user && token) return { user, token };

    // fallback: try login to get token/user
    return await api.login(email, password);
  },

  login: async (email: string, password: string): Promise<AuthResult> => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => 'Login failed');
      throw new Error(txt || 'Login failed');
    }

    const parsed = await res.json().catch(() => ({}));
    const token = parsed.token || parsed.accessToken || parsed.refreshToken;
    const user = normalizeUser(parsed.user || parsed);

    if (user && token) return { user, token };

    // some servers return directly { user, token } or the user object alone
    if (parsed && (parsed._id || parsed.id) && token) {
      return { user: normalizeUser(parsed), token };
    }

    return { user: null, token };
  },

  logout: async (): Promise<void> => {
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('token');
  },

  // Helper: get currently saved user (mobile uses AsyncStorage)
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const u = await AsyncStorage.getItem('user');
      if (!u) return null;
      return JSON.parse(u);
    } catch {
      return null;
    }
  },
};

// ---------- CONTACTS API (uses token saved in AsyncStorage) ----------
export const contactsApi = {
  getAll: async (): Promise<any[]> => {
    const token = await getSavedToken();
    const res = await fetch(`${API_URL}/contacts`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => 'Failed to load contacts');
      throw new Error(txt || 'Failed to load contacts');
    }
    return res.json();
  },

  getById: async (id: string): Promise<any> => {
    const token = await getSavedToken();
    const res = await fetch(`${API_URL}/contacts/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => 'Failed to load contact');
      throw new Error(txt || 'Failed to load contact');
    }
    return res.json();
  },

  create: async (contact: {
    firstName: string;
    lastName?: string;
    address?: string;
    phoneNumber: string;
    lat?: number;
    lng?: number;
    // other optional fields...
  }): Promise<any> => {
    const token = await getSavedToken();
    const body = {
      firstName: contact.firstName,
      lastName: contact.lastName,
      address: contact.address,
      phone: contact.phoneNumber, // backend expects 'phone'
      lat: contact.lat,
      lng: contact.lng,
    };

    const res = await fetch(`${API_URL}/contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => 'Failed to create contact');
      throw new Error(txt || 'Failed to create contact');
    }
    return res.json();
  },

  update: async (id: string, updates: any): Promise<any> => {
    const token = await getSavedToken();
    const res = await fetch(`${API_URL}/contacts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => 'Failed to update contact');
      throw new Error(txt || 'Failed to update contact');
    }
    return res.json();
  },

  delete: async (id: string): Promise<void> => {
    const token = await getSavedToken();
    const res = await fetch(`${API_URL}/contacts/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => 'Failed to delete contact');
      throw new Error(txt || 'Failed to delete contact');
    }
  },

  search: async (q: string): Promise<any[]> => {
    const token = await getSavedToken();
    const params = new URLSearchParams({ q });
    const res = await fetch(`${API_URL}/contacts?${params.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => 'Search failed');
      throw new Error(txt || 'Search failed');
    }
    return res.json();
  },
};

// ---------- VISITS API (Schedule feature) ----------
export const visitsApi = {
  create: async (visit: {
    contact: string;
    datetime: string; // ISO string
    notes?: string;
  }): Promise<any> => {
    const token = await getSavedToken();
    const res = await fetch(`${API_URL}/visits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(visit),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => 'Failed to create visit');
      throw new Error(txt || 'Failed to create visit');
    }
    return res.json();
  },

  getAll: async (): Promise<any[]> => {
    const token = await getSavedToken();
    const res = await fetch(`${API_URL}/visits`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => 'Failed to load visits');
      throw new Error(txt || 'Failed to load visits');
    }
    return res.json();
=======
// Mock API service for development
// This will be replaced with real API calls later

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  address: string;
  phoneNumber: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface Note {
  id: string;
  contactId: string;
  content: string;
  createdAt: string;
}

export interface Visit {
  id: string;
  contactId: string;
  contactName: string;
  date: string;
  time: string;
  notes: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

// Mock data storage
let contacts: Contact[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    address: '123 Main St, City, State',
    phoneNumber: '555-0101',
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    address: '456 Oak Ave, City, State',
    phoneNumber: '555-0102',
  },
];

let notes: Note[] = [
  {
    id: '1',
    contactId: '1',
    content: 'First meeting went well. Interested in learning more.',
    createdAt: new Date().toISOString(),
  },
];

let visits: Visit[] = [
  {
    id: '1',
    contactId: '1',
    contactName: 'John Doe',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    time: '14:00',
    notes: 'Follow-up visit',
  },
];

let currentUser: User | null = null;

// Auth API
export const authApi = {
  register: async (name: string, email: string, password: string): Promise<User> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const user: User = {
      id: Date.now().toString(),
      name,
      email,
    };
    currentUser = user;
    return user;
  },

  login: async (email: string, password: string): Promise<User> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Mock validation - accept any email/password for now
    if (email && password) {
      const user: User = {
        id: '1',
        name: 'Test User',
        email,
      };
      currentUser = user;
      return user;
    }
    throw new Error('Invalid credentials');
  },

  getCurrentUser: (): User | null => {
    return currentUser;
  },

  logout: (): void => {
    currentUser = null;
  },
};

// Contacts API
export const contactsApi = {
  getAll: async (): Promise<Contact[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [...contacts];
  },

  getById: async (id: string): Promise<Contact | null> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return contacts.find((c) => c.id === id) || null;
  },

  create: async (contact: Omit<Contact, 'id'>): Promise<Contact> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    
    // Check for duplicates (same name and phone)
    const duplicate = contacts.find(
      (c) =>
        c.firstName.toLowerCase() === contact.firstName.toLowerCase() &&
        c.lastName.toLowerCase() === contact.lastName.toLowerCase() &&
        c.phoneNumber === contact.phoneNumber
    );
    
    if (duplicate) {
      throw new Error('A contact with this name and phone number already exists');
    }

    const newContact: Contact = {
      ...contact,
      id: Date.now().toString(),
    };
    contacts.push(newContact);
    return newContact;
  },

  update: async (id: string, updates: Partial<Contact>): Promise<Contact> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const index = contacts.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new Error('Contact not found');
    }
    contacts[index] = { ...contacts[index], ...updates };
    return contacts[index];
  },

  delete: async (id: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    contacts = contacts.filter((c) => c.id !== id);
    // Also delete related notes
    notes = notes.filter((n) => n.contactId !== id);
  },

  search: async (query: string): Promise<Contact[]> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const lowerQuery = query.toLowerCase();
    return contacts.filter(
      (c) =>
        c.firstName.toLowerCase().includes(lowerQuery) ||
        c.lastName.toLowerCase().includes(lowerQuery) ||
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(lowerQuery)
    );
  },
};

// Notes API
export const notesApi = {
  getByContactId: async (contactId: string): Promise<Note[]> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return notes.filter((n) => n.contactId === contactId);
  },

  create: async (contactId: string, content: string): Promise<Note> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const newNote: Note = {
      id: Date.now().toString(),
      contactId,
      content,
      createdAt: new Date().toISOString(),
    };
    notes.push(newNote);
    return newNote;
  },

  delete: async (id: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    notes = notes.filter((n) => n.id !== id);
  },
};

// Visits API
export const visitsApi = {
  getAll: async (): Promise<Visit[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [...visits];
  },

  getUpcoming: async (): Promise<Visit[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const now = new Date();
    return visits
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

  create: async (visit: Omit<Visit, 'id' | 'contactName'>): Promise<Visit> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const contact = contacts.find((c) => c.id === visit.contactId);
    if (!contact) {
      throw new Error('Contact not found');
    }
    const newVisit: Visit = {
      ...visit,
      id: Date.now().toString(),
      contactName: `${contact.firstName} ${contact.lastName}`,
    };
    visits.push(newVisit);
    return newVisit;
  },

  delete: async (id: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    visits = visits.filter((v) => v.id !== id);
>>>>>>> origin/main
  },
};

