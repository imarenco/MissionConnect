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
  },
};

