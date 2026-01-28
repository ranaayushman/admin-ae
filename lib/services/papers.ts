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

// Mock data for boards and sample papers (until API is ready)
const MOCK_PAPERS: Paper[] = [
  // Class 10 PYQ
  {
    _id: "boards-10-pyq-1",
    category: "boards-10",
    year: 2025,
    title: "CBSE Class 10 Mathematics PYQ 2025",
    type: "PYQ",
    subject: "Mathematics",
    board: "CBSE",
    paperDriveLink: "https://drive.google.com/file/d/example1/view",
    solutionDriveLink: "https://drive.google.com/file/d/example1-sol/view",
    displayOrder: 1,
    createdAt: "2025-03-01",
    updatedAt: "2025-03-01",
  },
  {
    _id: "boards-10-pyq-2",
    category: "boards-10",
    year: 2025,
    title: "CBSE Class 10 Science PYQ 2025",
    type: "PYQ",
    subject: "Science",
    board: "CBSE",
    paperDriveLink: "https://drive.google.com/file/d/example2/view",
    solutionDriveLink: "https://drive.google.com/file/d/example2-sol/view",
    displayOrder: 2,
    createdAt: "2025-03-01",
    updatedAt: "2025-03-01",
  },
  // Class 12 PYQ
  {
    _id: "boards-12-pyq-1",
    category: "boards-12",
    year: 2025,
    title: "CBSE Class 12 Physics PYQ 2025",
    type: "PYQ",
    subject: "Physics",
    board: "CBSE",
    paperDriveLink: "https://drive.google.com/file/d/example6/view",
    solutionDriveLink: "https://drive.google.com/file/d/example6-sol/view",
    displayOrder: 1,
    createdAt: "2025-03-01",
    updatedAt: "2025-03-01",
  },
  // Sample Papers
  {
    _id: "sample-10-1",
    category: "sample-10",
    year: 2026,
    title: "CBSE Class 10 Mathematics Sample Paper 2026",
    type: "Sample Paper",
    subject: "Mathematics",
    board: "CBSE",
    paperDriveLink: "https://drive.google.com/file/d/sample1/view",
    solutionDriveLink: "https://drive.google.com/file/d/sample1-sol/view",
    displayOrder: 1,
    createdAt: "2025-12-01",
    updatedAt: "2025-12-01",
  },
  {
    _id: "sample-12-1",
    category: "sample-12",
    year: 2026,
    title: "CBSE Class 12 Physics Sample Paper 2026",
    type: "Sample Paper",
    subject: "Physics",
    board: "CBSE",
    paperDriveLink: "https://drive.google.com/file/d/sample4/view",
    solutionDriveLink: "https://drive.google.com/file/d/sample4-sol/view",
    displayOrder: 1,
    createdAt: "2025-12-01",
    updatedAt: "2025-12-01",
  },
];

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

  // Get papers with advanced filtering
  getPapers: async (params: {
    category?: PaperCategory;
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
