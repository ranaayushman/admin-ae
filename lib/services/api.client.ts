import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { tokenManager } from '@/lib/utils/tokenManager';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://aspiring-engineers-api-dbbcfdascdezgvcx.centralindia-01.azurewebsites.net/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token and log requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // CRITICAL: Always fetch the most recent token from storage
    // This ensures we use the refreshed token after token refresh operations
    const token = tokenManager.getAuthToken();
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log API request
    console.log('🚀 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      headers: config.headers,
      data: config.data,
      token: token ? `${token.substring(0, 20)}...` : 'none', // Log token prefix for debugging
    });
    
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle common errors and log responses
apiClient.interceptors.response.use(
  (response) => {
    // Log API response
    console.log('✅ API Response:', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      data: response.data,
    });
    
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 - Unauthorized (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = tokenManager.getRefreshToken();
        
        if (refreshToken) {
          // Try to refresh token
          console.log('🔄 401 detected - Attempting to refresh token...');
          const response = await axios.post<{ accessToken: string; refreshToken?: string }>(
            `${process.env.NEXT_PUBLIC_API_URL || 'https://aspiring-engineers-api-dbbcfdascdezgvcx.centralindia-01.azurewebsites.net/api/v1'}/auth/refresh`,
            { refreshToken }
          );

          // CRITICAL: Immediately store the new tokens
          const { accessToken, refreshToken: newRefreshToken } = response.data;
          tokenManager.setAuthToken(accessToken);
          console.log('✅ New access token stored and will be used for retry');

          // If API returns a new refresh token (token rotation), store it
          if (newRefreshToken) {
            tokenManager.setRefreshToken(newRefreshToken);
            console.log('✅ New refresh token stored (token rotation)');
          }

          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          
          console.log('🔄 Retrying original request with new token...');
          return apiClient(originalRequest);
        } else {
          console.warn('⚠️ No refresh token available, cannot refresh');
        }
      } catch (refreshError) {
        console.error('❌ Token refresh failed in interceptor:', refreshError);
        // Refresh failed, logout user
        tokenManager.clearTokens();
        
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    console.error('❌ API Response Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message,
    });
    
    return Promise.reject(error);
  }
);

export default apiClient;

// Helper function to handle API errors
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ error: { message: string } }>;
    
    if (axiosError.response) {
      return axiosError.response.data?.error?.message || 'An error occurred';
    } else if (axiosError.request) {
      return 'No response from server. Please check your connection.';
    }
  }
  
  return 'An unexpected error occurred';
};
