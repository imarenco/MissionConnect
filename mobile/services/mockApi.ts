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
  },
};

