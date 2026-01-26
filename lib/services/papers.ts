import apiClient from "@/lib/services/api.client";
import { AxiosResponse } from "axios";

// Types based on the API spec provided
export type PaperCategory =
  | "neet"
  | "jee-main"
  | "jee-advanced"
  | "boards"
  | "wbjee";

export interface CreatePaperWithSolutionPayload {
  category: PaperCategory;
  year: number;
  title: string;
  paperDriveLink: string;
  solutionDriveLink: string;
  thumbnailBase64: string;
  videoSolutionLink?: string;
  displayOrder?: number;
}

export interface CreatePaperNoSolutionPayload {
  category: PaperCategory;
  year: number;
  title: string;
  paperDriveLink: string;
  thumbnailBase64?: string;
  displayOrder?: number;
}

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
};
