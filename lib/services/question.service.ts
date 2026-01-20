import apiClient, { handleApiError } from './api.client';
import { CreateQuestionPayload, CreateQuestionResponse, Question } from '@/lib/types';

/**
 * Question Service
 * 
 * Handles question bank related API calls
 */

/**
 * Normalize question data from API to match our types
 * API returns lowercase difficulty, we expect uppercase
 */
const normalizeQuestion = (question: any): Question => {
  return {
    ...question,
    difficulty: question.difficulty?.toUpperCase() as 'EASY' | 'MEDIUM' | 'HARD',
    category: question.category || '',
    chapter: question.chapter || '',
    topic: question.topic || '',
  };
};

export const questionService = {
  /**
   * Create a new question in the question bank
   * POST /questions
   */
  createQuestion: async (data: CreateQuestionPayload): Promise<Question> => {
    try {
      const response = await apiClient.post<CreateQuestionResponse>('/questions', data);
      
      console.log('✅ Question created successfully:', response.data);
      
      // Handle different response structures:
      // API might return { data: question } or { data: { data: question, message: string } }
      // or even just the question directly
      const questionData = (response.data as any).data || response.data;
      
      // If questionData has _id, it's likely the question object
      if (questionData && ((questionData as any)._id || (questionData as any).id)) {
        return normalizeQuestion(questionData);
      }
      
      // If we got here, the structure is unexpected but the request succeeded
      // Return the normalized data anyway
      return normalizeQuestion(questionData);
    } catch (error) {
      console.error('❌ Error creating question:', error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get all questions (with filters and pagination)
   * GET /questions
   */
  getQuestions: async (filters?: {
    category?: string;
    chapter?: string;
    topic?: string;
    difficulty?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Question[]; pagination: { total: number; page: number; limit: number; totalPages: number } }> => {
    try {
      const params = new URLSearchParams();
      
      if (filters?.category) params.append('category', filters.category);
      if (filters?.chapter) params.append('chapter', filters.chapter);
      if (filters?.topic) params.append('topic', filters.topic);
      if (filters?.difficulty) params.append('difficulty', filters.difficulty);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const queryString = params.toString();
      const url = queryString ? `/questions?${queryString}` : '/questions';

      const response = await apiClient.get<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        totalPages?: number;
      }>(url);
      
      console.log('✅ Questions fetched successfully:', response.data);
      
      // Extract data and pagination from the response
      const { data: questions, total, page, limit, totalPages } = response.data;
      
      // Normalize all questions
      const normalizedQuestions = questions.map(normalizeQuestion);
      
      return {
        data: normalizedQuestions,
        pagination: {
          total,
          page,
          limit,
          totalPages: totalPages || Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('❌ Error fetching questions:', error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get question by ID
   * GET /questions/:id
   */
  getQuestionById: async (id: string): Promise<Question> => {
    try {
      const response = await apiClient.get(`/questions/${id}`);
      
      console.log('✅ Question fetched successfully:', response.data);
      
      // The API might return the question directly or nested under 'data'
      const questionData = response.data.data || response.data;
      return normalizeQuestion(questionData);
    } catch (error) {
      console.error('❌ Error fetching question:', error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Update question (partial update)
   * PATCH /questions/:id
   */
  updateQuestion: async (id: string, data: Partial<CreateQuestionPayload>): Promise<Question> => {
    try {
      const response = await apiClient.patch<CreateQuestionResponse>(`/questions/${id}`, data);
      
      console.log('✅ Question updated successfully:', response.data);
      
      // Handle different response structures
      const questionData = (response.data as any).data || response.data;
      return normalizeQuestion(questionData);
    } catch (error) {
      console.error('❌ Error updating question:', error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Delete question
   * DELETE /questions/:id
   */
  deleteQuestion: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/questions/${id}`);
      
      console.log('✅ Question deleted successfully');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

export default questionService;
