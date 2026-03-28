import apiClient from "@/lib/services/api.client";
import { AxiosResponse } from "axios";

// Types based on the API spec provided
export type PaperCategory =
  | "neet"
  | "jee-main"
  | "jee-advanced"
  | "wbjee"
  | "boards"
  | "boards-10"
  | "boards-12"
  | "sample-10"
  | "sample-12";

export type BoardName = "CBSE" | "ICSE" | "ISC" | "WBCHSE" | "State";

export type SubjectClass10 =
  | "Mathematics"
  | "Science"
  | "English"
  | "Social Science"
  | "Hindi"
  | "Computer Applications";

export type SubjectClass12 =
  | "Physics"
  | "Chemistry"
  | "Mathematics"
  | "Biology"
  | "English"
  | "Computer Science"
  | "Accountancy"
  | "Business Studies"
  | "Economics";

export interface Paper {
  _id: string;
  category: PaperCategory;
  year: number;
  title: string;
  type: string;
  subject?: string;
  board?: BoardName;
  thumbnailUrl?: string;
  paperDriveLink: string;
  solutionDriveLink?: string;
  videoSolutionLink?: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedPapersResponse {
  data: Paper[];
  total: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface CreatePaperPayload {
  category: PaperCategory;
  year: number;
  title: string;
  paperDriveLink: string;
  solutionDriveLink?: string;
  videoSolutionLink?: string;
  thumbnailBase64?: string;
  displayOrder?: number;
  subject?: string;
  board?: BoardName;
}

// Keeping these for backward compatibility if needed, or aliasing them
export type CreatePaperWithSolutionPayload = CreatePaperPayload;
export type CreatePaperNoSolutionPayload = CreatePaperPayload;


export const papersService = {
  // Create paper with solution
  createWithSolution: async (payload: CreatePaperWithSolutionPayload) => {
    try {
      const response: AxiosResponse = await apiClient.post(
        "/papers", 
        payload
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create paper without solution (using the same unified endpoint or specific if backend requires)
  // Based on user request, it seems they want unified, but let's stick to what we see or standard Rest
  // The user prompt mentioned "Create Paper (Unified) ... Body: { ... }"
  // So we will use POST /papers for both
  createNoSolution: async (payload: CreatePaperNoSolutionPayload) => {
    try {
      const response: AxiosResponse = await apiClient.post(
        "/papers",
        payload
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get papers with advanced filtering (returns array only - backward compat)
  getPapers: async (params: {
    category?: PaperCategory;
    type?: string;
    board?: BoardName;
    subject?: string;
    year?: number;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get("/papers", { params });
    const data = response.data;
    // Handle both array and paginated response { data: Paper[], total: ... }
    return Array.isArray(data) ? data : (data.data || []);
  },

  // Get papers with full pagination info
  getPapersPaginated: async (params: {
    category?: PaperCategory;
    type?: string;
    board?: BoardName;
    subject?: string;
    year?: number;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedPapersResponse> => {
    const response = await apiClient.get("/papers", { params });
    const data = response.data;
    if (Array.isArray(data)) {
      return { data, total: data.length, page: 1, totalPages: 1, hasNextPage: false };
    }
    const papers: Paper[] = data.data || [];
    const total: number = data.total || papers.length;
    const page: number = data.page || params.page || 1;
    const totalPages: number = data.totalPages || data.pages || 1;
    return { data: papers, total, page, totalPages, hasNextPage: page < totalPages };
  },

  // Update paper (PATCH /papers/:id)
  updatePaper: async (
    paperId: string,
    data: Partial<CreatePaperPayload>
  ): Promise<Paper> => {
    try {
      const response: AxiosResponse = await apiClient.patch(
        `/papers/${paperId}`,
        data
      );
      return response.data.data || response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get statistics
  getStats: async () => {
    const response = await apiClient.get("/papers/stats");
    return response.data;
  },

  // Get papers by board (grouped)
  getByBoard: async (classLevel: "10" | "12", board: string) => {
    const response = await apiClient.get(`/papers/boards/${classLevel}/${board}`);
    return response.data; // Expected: { pyq: [], samplePapers: [], subjects: [] }
  },

  // Bulk create
  bulkCreate: async (papers: any[]) => {
    const response = await apiClient.post("/papers/bulk", { papers });
    return response.data;
  },

  // Delete paper
  deletePaper: async (paperId: string): Promise<void> => {
    await apiClient.delete(`/papers/${paperId}`);
  },
};
