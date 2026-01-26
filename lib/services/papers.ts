import apiClient from "@/lib/services/api.client";
import { AxiosResponse } from "axios";

// Types based on the API spec provided
export type PaperCategory =
  | "neet"
  | "jee-main"
  | "jee-advanced"
  | "wbjee"
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

export interface CreatePaperWithSolutionPayload {
  category: PaperCategory;
  year: number;
  title: string;
  paperDriveLink: string;
  solutionDriveLink: string;
  thumbnailBase64?: string;
  videoSolutionLink?: string;
  displayOrder?: number;
  subject?: string;
  board?: BoardName;
}

export interface CreatePaperNoSolutionPayload {
  category: PaperCategory;
  year: number;
  title: string;
  paperDriveLink: string;
  thumbnailBase64?: string;
  displayOrder?: number;
  subject?: string;
  board?: BoardName;
}

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
  createWithSolution: async (payload: CreatePaperWithSolutionPayload) => {
    console.log(
      "🚀 [papersService] Configured API URL:",
      process.env.NEXT_PUBLIC_API_URL,
    );
    console.log(
      "🚀 [papersService] POST /papers/with-solution",
      JSON.stringify(payload, null, 2),
    );
    const response: AxiosResponse = await apiClient.post(
      "/papers/with-solution",
      payload,
    );
    console.log("✅ [papersService] Response:", response.data);
    return response.data;
  },

  createNoSolution: async (payload: CreatePaperNoSolutionPayload) => {
    console.log(
      "🚀 [papersService] Configured API URL:",
      process.env.NEXT_PUBLIC_API_URL,
    );
    console.log(
      "🚀 [papersService] POST /papers/no-solution",
      JSON.stringify(payload, null, 2),
    );
    const response: AxiosResponse = await apiClient.post(
      "/papers/no-solution",
      payload,
    );
    console.log("✅ [papersService] Response:", response.data);
    return response.data;
  },

  // Get papers by category (mock for now)
  getPapersByCategory: async (category: PaperCategory): Promise<Paper[]> => {
    // TODO: Replace with real API call when ready
    // const response = await apiClient.get(`/papers?category=${category}`);
    // return response.data.data;
    return MOCK_PAPERS.filter((p) => p.category === category);
  },

  // Get all boards papers (mock for now)
  getBoardsPapers: async (classLevel: "10" | "12"): Promise<Paper[]> => {
    const category = classLevel === "10" ? "boards-10" : "boards-12";
    return MOCK_PAPERS.filter((p) => p.category === category);
  },

  // Get all sample papers (mock for now)
  getSamplePapers: async (classLevel: "10" | "12"): Promise<Paper[]> => {
    const category = classLevel === "10" ? "sample-10" : "sample-12";
    return MOCK_PAPERS.filter((p) => p.category === category);
  },

  // Delete paper (mock for now)
  deletePaper: async (paperId: string): Promise<void> => {
    console.log("🗑️ [papersService] DELETE /papers/" + paperId);
    // TODO: Replace with real API call when ready
    // await apiClient.delete(`/papers/${paperId}`);
  },
};
