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
  ): Promise<Counsellor> => {
    console.log(
      "🚀 [counsellorService] POST /counsellors",
      JSON.stringify(payload, null, 2),
    );
    const response: AxiosResponse<{ success: boolean; data: Counsellor }> =
      await apiClient.post("/counselling/counsellors", payload);
    console.log("✅ [counsellorService] Response:", response.data);
    return response.data.data || response.data;
  },

  /**
   * Get all counsellors
   * GET /counsellors
   */
  getCounsellors: async (
    params?: GetCounsellorsParams,
  ): Promise<Counsellor[]> => {
    console.log("🚀 [counsellorService] GET /counsellors", params);
    const response: AxiosResponse<CounsellorsResponse | Counsellor[]> =
      await apiClient.get("/counselling/counsellors", { params });
    console.log("✅ [counsellorService] Response:", response.data);

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
  getCounsellorById: async (id: string): Promise<Counsellor> => {
    console.log(`🚀 [counsellorService] GET /counsellors/${id}`);
    const response: AxiosResponse<{ success: boolean; data: Counsellor }> =
      await apiClient.get(`/counsellors/${id}`);
    console.log("✅ [counsellorService] Response:", response.data);
    return response.data.data || response.data;
  },

  /**
   * Update a counsellor
   * PATCH /counsellors/:id
   */
  updateCounsellor: async (
    id: string,
    payload: UpdateCounsellorPayload,
  ): Promise<Counsellor> => {
    console.log(
      `🚀 [counsellorService] PATCH /counsellors/${id}`,
      JSON.stringify(payload, null, 2),
    );
    const response: AxiosResponse<{ success: boolean; data: Counsellor }> =
      await apiClient.patch(`/counsellors/${id}`, payload);
    console.log("✅ [counsellorService] Response:", response.data);
    return response.data.data || response.data;
  },

  /**
   * Delete a counsellor
   * DELETE /counsellors/:id
   */
  deleteCounsellor: async (id: string): Promise<void> => {
    console.log(`🚀 [counsellorService] DELETE /counsellors/${id}`);
    await apiClient.delete(`/counsellors/${id}`);
    console.log("✅ [counsellorService] Counsellor deleted");
  },

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
  ): Promise<Counsellor> => {
    console.log(`🚀 [counsellorService] PATCH /counsellors/${id}/rating`, { newRating });
    const response: AxiosResponse<{ success: boolean; data: Counsellor }> =
      await apiClient.patch(`/counsellors/${id}/rating`, { newRating });
    console.log("✅ [counsellorService] Response:", response.data);
    return response.data.data || response.data;
  },
};

export default counsellorService;
