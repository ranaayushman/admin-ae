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
export type QuestionSubject =
  | 'physics'
  | 'chemistry'
  | 'mathematics'
  | 'botany'
  | 'zoology'
  | 'biology'
  | 'english'
  | 'hindi';

export type QuestionCategory = 'neet' | 'jee-main' | 'jee-advanced' | 'boards' | 'wbjee';

export const VALID_SUBJECTS_BY_CATEGORY: Record<QuestionCategory, QuestionSubject[]> = {
  'jee-main': ['physics', 'chemistry', 'mathematics'],
  'jee-advanced': ['physics', 'chemistry', 'mathematics'],
  'neet': ['physics', 'chemistry', 'botany', 'zoology'],
  'wbjee': ['physics', 'chemistry', 'mathematics'],
  'boards': ['physics', 'chemistry', 'mathematics', 'biology', 'english', 'hindi'],
};

export interface QuestionOption {
  text: string;
  isCorrect?: boolean;
  imageUrl?: string;
  imageBase64?: string; // Keep for backward compatibility/payload
}

export interface QuestionMetadata {
  marks: number;
  year?: number;
}

export interface Question {
  _id: string;
  category: string;
  subject?: QuestionSubject;
  chapter: string;
  topic: string;
  questionType?: 'single-correct' | 'multiple-correct' | 'integer' | 'numerical';
  questionText: string;
  options: { text: string; imageBase64?: string; imageUrl?: string }[];
  correctAnswer?: string;
  correctAnswers?: string[];
  solutionText: string;
  questionImageBase64?: string | null;
  questionImageUrl?: string | null;
  solutionImageBase64?: string | null;
  solutionImageUrl?: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
  metadata: QuestionMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuestionPayload {
  category: string;
  subject?: QuestionSubject;
  chapter: string;
  topic: string;
  questionText: string;
  questionType?: 'single-correct' | 'multiple-correct' | 'integer' | 'numerical';
  options: { text: string; imageBase64?: string }[];
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
  subject?: QuestionSubject;
  chapter?: string;
  topic?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  search?: string;
  page?: number;
  limit?: number;
}
