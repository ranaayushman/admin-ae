import apiClient from "@/lib/services/api.client";
import { AxiosResponse } from "axios";
import {
  CounsellingPackage,
  CounsellingPackagesResponse,
  CreateCounsellingPackagePayload,
  UpdateCounsellingPackagePayload,
  CounsellingInquiry,
  InquiriesResponse,
  UpdateInquiryPayload,
  CounsellingEnrollment,
  EnrollmentsResponse,
  ExamType,
} from "@/lib/types/counselling";

export interface GetPackagesParams {
  examType?: ExamType;
  isActive?: boolean;
  isFeatured?: boolean;
  sort?: string;
}

export interface GetInquiriesParams {
  exam?: string;
  status?: "new" | "contacted" | "converted" | "closed";
  assignedTo?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface GetEnrollmentsParams {
  packageId?: string;
  userId?: string;
  status?: "active" | "expired" | "cancelled" | "refunded";
  examType?: ExamType;
  page?: number;
  limit?: number;
}

export const counsellingService = {
  // ==================== PACKAGES ====================

  /**
   * Create a new counselling package
   * POST /counselling-packages
   */
  createPackage: async (
    payload: CreateCounsellingPackagePayload,
  ): Promise<CounsellingPackage> => {
    console.log(
      "🚀 [counsellingService] POST /counselling-packages",
      JSON.stringify(payload, null, 2),
    );
    const response: AxiosResponse<{
      success: boolean;
      data: CounsellingPackage;
    }> = await apiClient.post("/counselling-packages", payload);
    console.log("✅ [counsellingService] Response:", response.data);
    return response.data.data || response.data;
  },

  /**
   * Get all counselling packages
   * GET /counselling-packages
   */
  getPackages: async (
    params?: GetPackagesParams,
  ): Promise<CounsellingPackage[]> => {
    console.log("🚀 [counsellingService] GET /counselling-packages", params);
    const response: AxiosResponse<
      CounsellingPackagesResponse | CounsellingPackage[]
    > = await apiClient.get("/counselling-packages", { params });
    console.log("✅ [counsellingService] Response:", response.data);

    // Handle both { success, data } and direct array responses
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data.data || [];
  },

  /**
   * Get a single package by ID
   * GET /counselling-packages/:id
   */
  getPackageById: async (id: string): Promise<CounsellingPackage> => {
    console.log(`🚀 [counsellingService] GET /counselling-packages/${id}`);
    const response: AxiosResponse<{
      success: boolean;
      data: CounsellingPackage;
    }> = await apiClient.get(`/counselling-packages/${id}`);
    console.log("✅ [counsellingService] Response:", response.data);
    return response.data.data || response.data;
  },

  /**
   * Get a package by slug
   * GET /counselling-packages/slug/:slug
   */
  getPackageBySlug: async (slug: string): Promise<CounsellingPackage> => {
    console.log(
      `🚀 [counsellingService] GET /counselling-packages/slug/${slug}`,
    );
    const response: AxiosResponse<{
      success: boolean;
      data: CounsellingPackage;
    }> = await apiClient.get(`/counselling-packages/slug/${slug}`);
    console.log("✅ [counsellingService] Response:", response.data);
    return response.data.data || response.data;
  },

  /**
   * Update a counselling package
   * PATCH /counselling-packages/:id
   */
  updatePackage: async (
    id: string,
    payload: UpdateCounsellingPackagePayload,
  ): Promise<CounsellingPackage> => {
    console.log(
      `🚀 [counsellingService] PATCH /counselling-packages/${id}`,
      JSON.stringify(payload, null, 2),
    );
    const response: AxiosResponse<{
      success: boolean;
      data: CounsellingPackage;
    }> = await apiClient.patch(`/counselling-packages/${id}`, payload);
    console.log("✅ [counsellingService] Response:", response.data);
    return response.data.data || response.data;
  },

  /**
   * Delete a counselling package
   * DELETE /counselling-packages/:id
   */
  deletePackage: async (id: string): Promise<void> => {
    console.log(`🚀 [counsellingService] DELETE /counselling-packages/${id}`);
    await apiClient.delete(`/counselling-packages/${id}`);
    console.log("✅ [counsellingService] Package deleted");
  },

  /**
   * Reorder packages
   * PATCH /counselling-packages/reorder
   */
  reorderPackages: async (
    packages: { id: string; displayOrder: number }[],
  ): Promise<void> => {
    console.log("🚀 [counsellingService] PATCH /counselling-packages/reorder");
    await apiClient.patch("/counselling-packages/reorder", { packages });
    console.log("✅ [counsellingService] Packages reordered");
  },

  // ==================== INQUIRIES ====================

  /**
   * Get all counselling inquiries
   * GET /counselling-inquiries
   */
  getInquiries: async (
    params?: GetInquiriesParams,
  ): Promise<InquiriesResponse> => {
    console.log("🚀 [counsellingService] GET /counselling-inquiries", params);
    const response: AxiosResponse<InquiriesResponse> = await apiClient.get(
      "/counselling-inquiries",
      { params },
    );
    console.log("✅ [counsellingService] Response:", response.data);
    return response.data;
  },

  /**
   * Get inquiry by ID
   * GET /counselling-inquiries/:id
   */
  getInquiryById: async (id: string): Promise<CounsellingInquiry> => {
    console.log(`🚀 [counsellingService] GET /counselling-inquiries/${id}`);
    const response: AxiosResponse<{
      success: boolean;
      data: CounsellingInquiry;
    }> = await apiClient.get(`/counselling-inquiries/${id}`);
    console.log("✅ [counsellingService] Response:", response.data);
    return response.data.data || response.data;
  },

  /**
   * Update inquiry status
   * PATCH /counselling-inquiries/:id
   */
  updateInquiry: async (
    id: string,
    payload: UpdateInquiryPayload,
  ): Promise<CounsellingInquiry> => {
    console.log(
      `🚀 [counsellingService] PATCH /counselling-inquiries/${id}`,
      payload,
    );
    const response: AxiosResponse<{
      success: boolean;
      data: CounsellingInquiry;
    }> = await apiClient.patch(`/counselling-inquiries/${id}`, payload);
    console.log("✅ [counsellingService] Response:", response.data);
    return response.data.data || response.data;
  },

  // ==================== ENROLLMENTS ====================

  /**
   * Get all enrollments (admin)
   * GET /counselling-enrollments
   */
  getEnrollments: async (
    params?: GetEnrollmentsParams,
  ): Promise<EnrollmentsResponse> => {
    console.log("🚀 [counsellingService] GET /counselling-enrollments", params);
    const response: AxiosResponse<EnrollmentsResponse> = await apiClient.get(
      "/counselling-enrollments",
      { params },
    );
    console.log("✅ [counsellingService] Response:", response.data);
    return response.data;
  },

  /**
   * Assign counsellor to enrollment
   * PATCH /counselling-enrollments/:id/assign-counsellor
   */
  assignCounsellor: async (
    enrollmentId: string,
    counsellorId: string,
  ): Promise<CounsellingEnrollment> => {
    console.log(
      `🚀 [counsellingService] PATCH /counselling-enrollments/${enrollmentId}/assign-counsellor`,
    );
    const response: AxiosResponse<{
      success: boolean;
      data: CounsellingEnrollment;
    }> = await apiClient.patch(
      `/counselling-enrollments/${enrollmentId}/assign-counsellor`,
      { counsellorId },
    );
    console.log("✅ [counsellingService] Response:", response.data);
    return response.data.data || response.data;
  },

  /**
   * Manual enrollment (admin)
   * POST /counselling-enrollments/manual
   */
  createManualEnrollment: async (payload: {
    userId: string;
    packageId: string;
    counsellorId?: string;
    notes?: string;
    skipPayment?: boolean;
  }): Promise<CounsellingEnrollment> => {
    console.log(
      "🚀 [counsellingService] POST /counselling-enrollments/manual",
      payload,
    );
    const response: AxiosResponse<{
      success: boolean;
      data: CounsellingEnrollment;
    }> = await apiClient.post("/counselling-enrollments/manual", payload);
    console.log("✅ [counsellingService] Response:", response.data);
    return response.data.data || response.data;
  },
};

export default counsellingService;
