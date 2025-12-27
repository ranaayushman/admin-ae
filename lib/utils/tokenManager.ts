/**
 * Token Manager with localStorage Persistence
 * 
 * Stores authentication tokens in localStorage to persist across page reloads.
 * 
 * Note: While localStorage is vulnerable to XSS attacks, it provides a better
 * user experience by maintaining sessions across page reloads. For production
 * apps, consider using httpOnly cookies for enhanced security.
 */

import { storage, STORAGE_KEYS } from './storage';

export const tokenManager = {
  /**
   * Get the current authentication token
   */
  getAuthToken: (): string | null => {
    return storage.get<string>(STORAGE_KEYS.AUTH_TOKEN);
  },

  /**
   * Set the authentication token
   */
  setAuthToken: (token: string): void => {
    storage.set(STORAGE_KEYS.AUTH_TOKEN, token);
    console.log('🔐 Auth token stored in localStorage');
  },

  /**
   * Get the current refresh token
   */
  getRefreshToken: (): string | null => {
    return storage.get<string>(STORAGE_KEYS.REFRESH_TOKEN);
  },

  /**
   * Set the refresh token
   */
  setRefreshToken: (token: string): void => {
    storage.set(STORAGE_KEYS.REFRESH_TOKEN, token);
    console.log('🔐 Refresh token stored in localStorage');
  },

  /**
   * Clear all tokens (used on logout)
   */
  clearTokens: (): void => {
    storage.remove(STORAGE_KEYS.AUTH_TOKEN);
    storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
    console.log('🔓 All tokens cleared from localStorage');
  },

  /**
   * Check if user has valid tokens
   */
  hasTokens: (): boolean => {
    const authToken = tokenManager.getAuthToken();
    const refreshToken = tokenManager.getRefreshToken();
    return authToken !== null && refreshToken !== null;
  },
};

export default tokenManager;
