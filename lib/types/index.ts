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

// Question Bank Types
export interface QuestionOption {
  text: string;
  isCorrect?: boolean;
}

export interface QuestionMetadata {
  marks: number;
  year?: number;
}

export interface Question {
  _id: string;
  category: string;
  chapter: string;
  topic: string;
  questionText: string;
  options: { text: string }[];
  correctAnswer: string;
  solutionText: string;
  questionImageBase64?: string | null;
  solutionImageBase64?: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
  metadata: QuestionMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuestionPayload {
  category: string;
  chapter: string;
  topic: string;
  questionText: string;
  options: { text: string }[];
  correctAnswer: string;
  solutionText: string;
  questionImageBase64?: string | null;
  solutionImageBase64?: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
  metadata: QuestionMetadata;
}

export interface CreateQuestionResponse {
  success: boolean;
  message: string;
  data: Question;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface QuestionsListResponse {
  success: boolean;
  data: Question[];
  pagination: PaginationMeta;
}

export interface QuestionFilters {
  category?: string;
  chapter?: string;
  topic?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  search?: string;
  page?: number;
  limit?: number;
}
