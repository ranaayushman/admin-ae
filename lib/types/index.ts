// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  profilePicture?: string;
  dateOfBirth?: string;
  stats?: UserStats;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  testsAttempted: number;
  averageScore: number;
  bestRank: number;
  totalStudyHours: number;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  dateOfBirth: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}
