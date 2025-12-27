import apiClient, { handleApiError } from "./api.client";

/**
 * Test Service
 *
 * Handles test series related API calls
 */

export interface CreateTestPayload {
  title: string;
  description: string;
  category: string;
  questions: string[]; // Array of question IDs
  duration: number; // in minutes
  marksPerQuestion: number;
  negativeMarking: number;
  status: "draft" | "published";
  type: "mock" | "practice" | "previous_year";
  shuffleQuestions: boolean;
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
}

export interface Test {
  _id: string;
  title: string;
  description: string;
  category: string;
  questions: string[];
  duration: number;
  marksPerQuestion: number;
  totalMarks: number;
  negativeMarking: number;
  status: "draft" | "published";
  type: "mock" | "practice" | "previous_year";
  shuffleQuestions: boolean;
  startDate?: string;
  endDate?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTestResponse {
  success: boolean;
  message: string;
  data: Test;
}

export interface TestsListResponse {
  success: boolean;
  data: Test[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const testService = {
  /**
   * Create a new test
   * POST /tests
   */
  createTest: async (data: CreateTestPayload): Promise<Test> => {
    try {
      const response = await apiClient.post<CreateTestResponse>("/tests", data);

      console.log("✅ Test created successfully:", response.data.message);

      return response.data.data;
    } catch (error) {
      console.error("❌ Error creating test:", error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get all tests with filters
   * GET /tests
   */
  getTests: async (filters?: {
    category?: string;
    status?: string;
    type?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<TestsListResponse> => {
    try {
      const params = new URLSearchParams();

      if (filters?.category) params.append("category", filters.category);
      if (filters?.status) params.append("status", filters.status);
      if (filters?.type) params.append("type", filters.type);
      if (filters?.search) params.append("search", filters.search);
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());

      const queryString = params.toString();
      const url = queryString ? `/tests?${queryString}` : "/tests";

      const response = await apiClient.get<TestsListResponse>(url);

      console.log("✅ Tests fetched successfully");

      return response.data;
    } catch (error) {
      console.error("❌ Error fetching tests:", error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get test by ID
   * GET /tests/:id
   */
  getTestById: async (id: string): Promise<Test> => {
    try {
      const response = await apiClient.get(`/tests/${id}`);

      console.log("✅ Test fetched successfully");

      return response.data.data || response.data;
    } catch (error) {
      console.error("❌ Error fetching test:", error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Update test
   * PATCH /tests/:id
   */
  updateTest: async (
    id: string,
    data: Partial<CreateTestPayload>
  ): Promise<Test> => {
    try {
      const response = await apiClient.patch<CreateTestResponse>(
        `/tests/${id}`,
        data
      );

      console.log("✅ Test updated successfully");

      return response.data.data;
    } catch (error) {
      console.error("❌ Error updating test:", error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Delete test
   * DELETE /tests/:id
   */
  deleteTest: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/tests/${id}`);

      console.log("✅ Test deleted successfully");
    } catch (error) {
      console.error("❌ Error deleting test:", error);
      throw new Error(handleApiError(error));
    }
  },
};

export default testService;
