import apiClient from "@/lib/services/api.client";
import { AxiosResponse } from "axios";
import {
  Counsellor,
  CounsellorsResponse,
  CreateCounsellorPayload,
  UpdateCounsellorPayload,
  ExamType,
} from "@/lib/types/counselling";

export interface GetCounsellorsParams {
  examType?: ExamType;
  isActive?: boolean;
  isFeatured?: boolean;
  sort?: string;
}

export const counsellorService = {
  /**
   * Create a new counsellor
   * POST /counsellors
   */
  createCounsellor: async (
    payload: CreateCounsellorPayload,
  ): Promise<Counsellor> => {    const response: AxiosResponse<{ success: boolean; data: Counsellor }> =
      await apiClient.post("/counselling/counsellors", payload);    return response.data.data || response.data;
  },

  /**
   * Get all counsellors
   * GET /counsellors
   */
  getCounsellors: async (
    params?: GetCounsellorsParams,
  ): Promise<Counsellor[]> => {    const response: AxiosResponse<CounsellorsResponse | Counsellor[]> =
      await apiClient.get("/counselling/counsellors", { params });
    // Handle both { success, data } and direct array responses
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data.data || [];
  },

  /**
   * Get a single counsellor by ID
   * GET /counsellors/:id
   */
  getCounsellorById: async (id: string): Promise<Counsellor> => {    const response: AxiosResponse<{ success: boolean; data: Counsellor }> =
      await apiClient.get(`/counselling/counsellors/${id}`);    return response.data.data || response.data;
  },

  /**
   * Update a counsellor
   * PATCH /counsellors/:id
   */
  updateCounsellor: async (
    id: string,
    payload: UpdateCounsellorPayload,
  ): Promise<Counsellor> => {    const response: AxiosResponse<{ success: boolean; data: Counsellor }> =
      await apiClient.patch(`/counselling/counsellors/${id}`, payload);    return response.data.data || response.data;
  },

  /**
   * Delete a counsellor
   * DELETE /counsellors/:id
   */
  deleteCounsellor: async (id: string): Promise<void> => {    await apiClient.delete(`/counselling/counsellors/${id}`);  },

  /**
   * Get counsellors by exam type
   */
  getCounsellorsByExamType: async (
    examType: ExamType,
  ): Promise<Counsellor[]> => {
    return counsellorService.getCounsellors({
      examType,
      isActive: true,
      sort: "displayOrder",
    });
  },

  /**
   * Update counsellor rating
   * PATCH /counsellors/:id/rating
   */
  updateCounsellorRating: async (
    id: string,
    newRating: number,
  ): Promise<Counsellor> => {    const response: AxiosResponse<{ success: boolean; data: Counsellor }> =
      await apiClient.patch(`/counselling/counsellors/${id}/rating`, { newRating });    return response.data.data || response.data;
  },
};

export default counsellorService;
