import apiClient, { handleApiError } from './api.client';
import { LoginCredentials, RegisterData, AuthResponse, User } from '@/lib/types';
import { storage, STORAGE_KEYS } from '@/lib/utils/storage';
import { tokenManager } from '@/lib/utils/tokenManager';

/**
 * Authentication Service
 * 
 * Handles all authentication-related API calls including:
 * - User registration
 * - User login
 * - Token refresh
 * - Profile management
 */

interface ApiRegisterResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      name: string;
      phone: string;
    };
    token: string;
    refreshToken: string;
  };
  message: string;
}

interface ApiLoginResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      phone: string;
    };
    token: string;
    refreshToken: string;
  };
  message: string;
}

export const authService = {
  /**
   * Register a new user account
   * POST /auth/register
   */
  register: async (data: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<ApiRegisterResponse>('/auth/register', data);
      
      // Success message from API
      console.log('✅ Registration successful:', response.data.message);
      
      // Map the API response to the AuthResponse format expected by the app
      const authResponse: AuthResponse = {
        user: {
          id: response.data.data.user.id,
          name: response.data.data.user.name,
          email: response.data.data.user.email,
          phone: response.data.data.user.phone,
          dateOfBirth: data.dateOfBirth,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        token: response.data.data.token,
        refreshToken: response.data.data.refreshToken,
      };

      return authResponse;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Login user
   * POST /auth/login
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<ApiLoginResponse>('/auth/login', credentials);
      
      // Success message from API
      console.log('✅ Login successful:', response.data.message);
      
      // CRITICAL: API returns 'token' field but we need to map it correctly
      // Check if API response has the token field
      const apiToken = response.data.data.token;
      
      if (!apiToken) {
        console.error('⚠️ No token in API response:', response.data);
        throw new Error('No authentication token received from server');
      }
      
      // Map the API response to the AuthResponse format expected by the app
      const authResponse: AuthResponse = {
        user: {
          id: response.data.data.user.id,
          name: response.data.data.user.name,
          email: response.data.data.user.email,
          phone: response.data.data.user.phone,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        token: apiToken,
        refreshToken: response.data.data.refreshToken,
      };

      console.log('🔐 Mapped auth response with token:', apiToken ? 'present' : 'MISSING');
      return authResponse;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get current user profile
   * GET /auth/profile
   */
  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await apiClient.get<{ _id: string; identifier: string; roles: string[] }>('/auth/profile');
      
      // API returns minimal data (_id, identifier, roles)
      // Get full user data from localStorage if available
      const savedUser = storage.get<User>(STORAGE_KEYS.USER);
      
      // Merge API data with saved user data
      const user: User = {
        ...savedUser,
        id: response.data._id,
        email: response.data.identifier,
        name: savedUser?.name || '',
        phone: savedUser?.phone || '',
        dateOfBirth: savedUser?.dateOfBirth || '',
        createdAt: savedUser?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      console.log('✅ Profile fetched successfully');
      return user;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Refresh access token
   * POST /auth/refresh
   * 
   * API may return:
   * - accessToken: new access token (always)
   * - refreshToken: new refresh token (optional, if API rotates refresh tokens)
   */
  refreshToken: async (refreshToken: string): Promise<{ accessToken: string; refreshToken?: string }> => {
    try {
      console.log('🔄 Calling token refresh API...');
      
      const response = await apiClient.post<{ accessToken: string; refreshToken?: string }>('/auth/refresh', {
        refreshToken,
      });
      
      console.log('✅ Token refresh API successful');
      
      const { accessToken, refreshToken: newRefreshToken } = response.data;
      
      // CRITICAL: Immediately store the new access token
      // This ensures all subsequent requests use the new token
      tokenManager.setAuthToken(accessToken);
      console.log('🔐 New access token stored in memory');
      
      // If API returns a new refresh token (token rotation), store it
      if (newRefreshToken) {
        tokenManager.setRefreshToken(newRefreshToken);
        console.log('🔐 New refresh token stored in memory (token rotation)');
      }
      
      return { 
        accessToken, 
        refreshToken: newRefreshToken 
      };
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Logout user
   * POST /auth/logout
   */
  logout: async (): Promise<void> => {
    try {
      // API uses Authorization header (added by interceptor), no body needed
      const response = await apiClient.post<{ success: boolean; message: string }>('/auth/logout', {});
      console.log('✅ Logout successful:', response.data.message);
    } catch (error) {
      // Ignore logout errors, still clear local storage
      console.error('⚠️ Logout API error (will still clear local storage):', error);
    }
  },

  /**
   * Update user profile
   * PATCH /auth/profile
   */
  updateProfile: async (data: Partial<User>): Promise<User> => {
    try {
      const response = await apiClient.patch<{ success: boolean; user: User }>('/auth/profile', data);
      return response.data.user;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

export default authService;
