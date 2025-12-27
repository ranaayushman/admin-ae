import apiClient, { handleApiError } from './api.client';
import { User } from '@/lib/types';

/**
 * User Service
 * 
 * Handles user profile and user-related API calls
 */

interface UserProfileResponse {
  success: boolean;
  data: {
    id: string;
    name: string;
    email: string;
    phone: string;
    profilePicture?: string;
    dateOfBirth?: string;
    stats?: {
      testsAttempted: number;
      averageScore: number;
      bestRank: number;
      totalStudyHours: number;
    };
    createdAt: string;
    updatedAt: string;
  };
}

export const userService = {
  /**
   * Get current user's detailed profile with statistics
   * GET /users/profile
   */
  getUserProfile: async (): Promise<User> => {
    try {
      const response = await apiClient.get<UserProfileResponse>('/users/profile');
      
      console.log('✅ User profile fetched successfully');
      
      // Map API response to User type
      const user: User = {
        id: response.data.data.id,
        name: response.data.data.name,
        email: response.data.data.email,
        phone: response.data.data.phone,
        profilePicture: response.data.data.profilePicture,
        dateOfBirth: response.data.data.dateOfBirth,
        stats: response.data.data.stats,
        createdAt: response.data.data.createdAt,
        updatedAt: response.data.data.updatedAt,
      };
      
      return user;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Update current user's profile information
   * PUT /users/profile
   */
  updateUserProfile: async (data: Partial<User>): Promise<User> => {
    try {
      const response = await apiClient.put<{
        success: boolean;
        data: { user: UserProfileResponse['data'] };
        message: string;
      }>('/users/profile', {
        name: data.name,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth,
        profilePicture: data.profilePicture,
      });
      
      console.log('✅ Profile updated successfully:', response.data.message);
      
      // Map API response to User type
      const user: User = {
        id: response.data.data.user.id,
        name: response.data.data.user.name,
        email: response.data.data.user.email,
        phone: response.data.data.user.phone,
        profilePicture: response.data.data.user.profilePicture,
        dateOfBirth: response.data.data.user.dateOfBirth,
        stats: response.data.data.user.stats,
        createdAt: response.data.data.user.createdAt,
        updatedAt: response.data.data.user.updatedAt,
      };
      
      return user;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Change user password
   * POST /users/change-password
   */
  changePassword: async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.post<{
        success: boolean;
        message: string;
      }>('/users/change-password', {
        currentPassword,
        newPassword,
      });
      
      console.log('✅ Password changed successfully:', response.data.message);
      
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

export default userService;
