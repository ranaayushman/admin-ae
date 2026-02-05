import apiClient, { handleApiError } from './api.client';

/**
 * Admin Users Service
 * 
 * Handles fetching all users for admin panel
 */

// Types for Admin Users
export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  examTargets: string[];
  targetYear: number;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface AdminUsersResponse {
  success: boolean;
  data: {
    users: AdminUser[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface GetAllUsersParams {
  page?: number;
  limit?: number;
}

export const adminUsersService = {
  /**
   * Get all users with pagination (Admin only)
   * GET /users/admin/all
   */
  getAllUsers: async (params: GetAllUsersParams = {}): Promise<AdminUsersResponse['data']> => {
    try {
      const { page = 1, limit = 20 } = params;
      
      const response = await apiClient.get<AdminUsersResponse>('/users/admin/all', {
        params: { page, limit }
      });
      
      console.log('✅ Admin users fetched successfully');
      
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

export default adminUsersService;
