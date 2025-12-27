// LocalStorage wrapper with type safety and error handling

const STORAGE_PREFIX = 'admin_ae_';

export const storage = {
  // Get item from localStorage
  get: <T>(key: string, defaultValue?: T): T | null => {
    if (typeof window === 'undefined') return defaultValue || null;
    
    try {
      const item = window.localStorage.getItem(STORAGE_PREFIX + key);
      if (!item) return defaultValue || null;
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Error reading from localStorage for key "${key}":`, error);
      return defaultValue || null;
    }
  },

  // Set item in localStorage
  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return;
    
    try {
      window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage for key "${key}":`, error);
    }
  },

  // Remove item from localStorage
  remove: (key: string): void => {
    if (typeof window === 'undefined') return;
    
    try {
      window.localStorage.removeItem(STORAGE_PREFIX + key);
    } catch (error) {
      console.error(`Error removing from localStorage for key "${key}":`, error);
    }
  },

  // Clear all items with prefix
  clear: (): void => {
    if (typeof window === 'undefined') return;
    
    try {
      const keys = Object.keys(window.localStorage);
      keys.forEach((key) => {
        if (key.startsWith(STORAGE_PREFIX)) {
          window.localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },
};

// Specific storage keys
export const STORAGE_KEYS = {
  USER: 'user',
  THEME: 'theme',
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;
