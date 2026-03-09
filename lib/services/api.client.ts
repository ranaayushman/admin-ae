import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { tokenManager } from "@/lib/utils/tokenManager";
import { logger } from "@/lib/logger";

if (!process.env.NEXT_PUBLIC_API_URL) {}

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
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
    return config;
  },
  (error) => {
    logger.error("❌ API Request Error", {
      message: error instanceof Error ? error.message : String(error),
      url: (error as AxiosError)?.config?.url,
    });
    return Promise.reject(error);
  }
);

// --- Refresh token queue to handle concurrent 401s ---
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
}

function forceLogout() {
  tokenManager.clearTokens();
  if (typeof window !== "undefined") {
    try {
      sessionStorage.clear();
      localStorage.removeItem("user");
    } catch (_) {
      // Ignore storage errors
    }
    window.location.href = "/login";
  }
}

// Response interceptor - handle 401 with single-attempt refresh + queue
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only handle 401 and only retry once
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // If a refresh is already in progress, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(apiClient(originalRequest));
            },
            reject,
          });
        });
      }

      isRefreshing = true;

      try {
        const refreshToken = tokenManager.getRefreshToken();

        if (!refreshToken) {          processQueue(new Error("No refresh token"), null);
          forceLogout();
          return Promise.reject(error);
        }        const response = await axios.post<{
          accessToken: string;
          refreshToken?: string;
        }>(`${process.env.NEXT_PUBLIC_API_URL || ""}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // Store new tokens
        tokenManager.setAuthToken(accessToken);
        if (newRefreshToken) {
          tokenManager.setRefreshToken(newRefreshToken);
        }
        // Process queued requests with new token
        processQueue(null, accessToken);

        // Retry the original request
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        logger.error("❌ Token refresh failed", refreshError);
        processQueue(refreshError, null);
        forceLogout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other errors
    logger.error("❌ API Response Error", {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
    });

    return Promise.reject(error);
  }
);

export default apiClient;

export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as any;
    if (data) {
      return data.message || data.error?.message || data.error || "An error occurred";
    } else if (error.request) {
      return "No response from server. Please check your connection.";
    }
    return error.message;
  }

  return error instanceof Error ? error.message : "An unexpected error occurred";
};
