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
  SessionsResponse,
  CounsellingSession,
  AdmissionGuidance,
  AdmissionGuidanceResponse,
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
   * POST /counselling/packages
   */
  createPackage: async (
    payload: CreateCounsellingPackagePayload,
  ): Promise<CounsellingPackage> => {
    console.log(
      "🚀 [counsellingService] POST /counselling/packages",
      JSON.stringify(payload, null, 2),
    );
    const response: AxiosResponse<{
      success: boolean;
      data: CounsellingPackage;
    }> = await apiClient.post("/counselling/packages", payload);
    console.log("✅ [counsellingService] Response:", response.data);
    return response.data.data || response.data;
  },

  /**
   * Get all counselling packages
   * GET /counselling/packages
   */
  getPackages: async (
    params?: GetPackagesParams,
  ): Promise<CounsellingPackage[]> => {
    console.log("🚀 [counsellingService] GET /counselling/packages", params);
    const response: AxiosResponse<
      CounsellingPackagesResponse | CounsellingPackage[]
    > = await apiClient.get("/counselling/packages", { params });
    console.log("✅ [counsellingService] Response:", response.data);

    // Handle both { success, data } and direct array responses
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data.data || [];
  },

  /**
   * Get a single package by ID
   * GET /counselling/packages/:id
   */
  getPackageById: async (id: string): Promise<CounsellingPackage> => {
    console.log(`🚀 [counsellingService] GET /counselling/packages/${id}`);
    const response: AxiosResponse<{
      success: boolean;
      data: CounsellingPackage;
    }> = await apiClient.get(`/counselling/packages/${id}`);
    console.log("✅ [counsellingService] Response:", response.data);
    return response.data.data || response.data;
  },

  /**
   * Get a package by slug
   * GET /counselling/packages/slug/:slug
   */
  getPackageBySlug: async (slug: string): Promise<CounsellingPackage> => {
    console.log(
      `🚀 [counsellingService] GET /counselling/packages/slug/${slug}`,
    );
    const response: AxiosResponse<{
      success: boolean;
      data: CounsellingPackage;
    }> = await apiClient.get(`/counselling/packages/slug/${slug}`);
    console.log("✅ [counsellingService] Response:", response.data);
    return response.data.data || response.data;
  },

  /**
   * Update a counselling package
   * PATCH /counselling/packages/:id
   */
  updatePackage: async (
    id: string,
    payload: UpdateCounsellingPackagePayload,
  ): Promise<CounsellingPackage> => {
    console.log(
      `🚀 [counsellingService] PATCH /counselling/packages/${id}`,
      JSON.stringify(payload, null, 2),
    );
    const response: AxiosResponse<{
      success: boolean;
      data: CounsellingPackage;
    }> = await apiClient.patch(`/counselling/packages/${id}`, payload);
    console.log("✅ [counsellingService] Response:", response.data);
    return response.data.data || response.data;
  },

  /**
   * Delete a counselling package
   * DELETE /counselling/packages/:id
   */
  deletePackage: async (id: string): Promise<void> => {
    console.log(`🚀 [counsellingService] DELETE /counselling/packages/${id}`);
    await apiClient.delete(`/counselling/packages/${id}`);
    console.log("✅ [counsellingService] Package deleted");
  },

  /**
   * Reorder packages
   * PATCH /counselling/packages/reorder
   */
  reorderPackages: async (
    packages: { id: string; displayOrder: number }[],
  ): Promise<void> => {
    console.log("🚀 [counsellingService] PATCH /counselling/packages/reorder");
    await apiClient.patch("/counselling/packages/reorder", { packages });
    console.log("✅ [counsellingService] Packages reordered");
  },

  // ==================== INQUIRIES ====================

  /**
   * Get all counselling inquiries
   * GET /counselling/inquiries
   */
  getInquiries: async (
    params?: GetInquiriesParams,
  ): Promise<InquiriesResponse> => {
    console.log("🚀 [counsellingService] GET /counselling/inquiries", params);
    const response: AxiosResponse<InquiriesResponse> = await apiClient.get(
      "/counselling/inquiries",
      { params },
    );
    console.log("✅ [counsellingService] Response:", response.data);
    return response.data;
  },

  /**
   * Get inquiry by ID
   * GET /counselling/inquiries/:id
   */
  getInquiryById: async (id: string): Promise<CounsellingInquiry> => {
    console.log(`🚀 [counsellingService] GET /counselling/inquiries/${id}`);
    const response: AxiosResponse<{
      success: boolean;
      data: CounsellingInquiry;
    }> = await apiClient.get(`/counselling/inquiries/${id}`);
    console.log("✅ [counsellingService] Response:", response.data);
    return response.data.data || response.data;
  },

  /**
   * Update inquiry status
   * PATCH /counselling/inquiries/:id
   */
  updateInquiry: async (
    id: string,
    payload: UpdateInquiryPayload,
  ): Promise<CounsellingInquiry> => {
    console.log(
      `🚀 [counsellingService] PATCH /counselling/inquiries/${id}`,
      payload,
    );
    const response: AxiosResponse<{
      success: boolean;
      data: CounsellingInquiry;
    }> = await apiClient.patch(`/counselling/inquiries/${id}`, payload);
    console.log("✅ [counsellingService] Response:", response.data);
    return response.data.data || response.data;
  },

  // ==================== ENROLLMENTS ====================

  /**
   * Get all enrollments (admin)
   * GET /counselling/enrollments
   */
  getEnrollments: async (
    params?: GetEnrollmentsParams,
  ): Promise<EnrollmentsResponse> => {
    console.log("🚀 [counsellingService] GET /counselling/enrollments", params);
    const response: AxiosResponse<EnrollmentsResponse> = await apiClient.get(
      "/counselling/enrollments",
      { params },
    );
    console.log("✅ [counsellingService] Response:", response.data);
    return response.data;
  },

  /**
   * Get current user's enrollments (user-facing)
   * GET /counselling/enrollments/my
   */
  getMyEnrollments: async (): Promise<CounsellingEnrollment[]> => {
    console.log("🚀 [counsellingService] GET /counselling/enrollments/my");
    const response: AxiosResponse<{
      success: boolean;
      data: CounsellingEnrollment[];
    }> = await apiClient.get("/counselling/enrollments/my");
    console.log("✅ [counsellingService] Response:", response.data);
    return response.data.data || response.data;
  },

  /**
   * Assign counsellor to enrollment
   * PATCH /counselling/enrollments/:id/assign-counsellor
   */
  assignCounsellor: async (
    enrollmentId: string,
    counsellorId: string,
  ): Promise<CounsellingEnrollment> => {
    console.log(
      `🚀 [counsellingService] PATCH /counselling/enrollments/${enrollmentId}/assign-counsellor`,
    );
    const response: AxiosResponse<{
      success: boolean;
      data: CounsellingEnrollment;
    }> = await apiClient.patch(
      `/counselling/enrollments/${enrollmentId}/assign-counsellor`,
      { counsellorId },
    );
    console.log("✅ [counsellingService] Response:", response.data);
    return response.data.data || response.data;
  },

  /**
   * Manual enrollment (admin)
   * POST /counselling/enrollments/manual
   */
  createManualEnrollment: async (payload: {
    userId: string;
    packageId: string;
    counsellorId?: string;
    notes?: string;
    skipPayment?: boolean;
  }): Promise<CounsellingEnrollment> => {
    console.log(
      "🚀 [counsellingService] POST /counselling/enrollments/manual",
      payload,
    );
    const response: AxiosResponse<{
      success: boolean;
      data: CounsellingEnrollment;
    }> = await apiClient.post("/counselling/enrollments/manual", payload);
    console.log("✅ [counsellingService] Response:", response.data);
    return response.data.data || response.data;
  },

  // ==================== SESSIONS ====================

  /**
   * Book a session
   * POST /counselling/sessions
   */
  createSession: async (payload: any): Promise<any> => {
    console.log("🚀 [counsellingService] POST /counselling/sessions", payload);
    const response: AxiosResponse<{ success: boolean; data: any }> = 
      await apiClient.post("/counselling/sessions", payload);
    console.log("✅ [counsellingService] Response:", response.data);
    return response.data.data || response.data;
  },

  /**
   * Get current user's sessions
   * GET /counselling/sessions/my
   */
  getMySessions: async (params?: { status?: string; upcoming?: boolean }): Promise<any[]> => {
    console.log("🚀 [counsellingService] GET /counselling/sessions/my", params);
    const response: AxiosResponse<any> = 
      await apiClient.get("/counselling/sessions/my", { params });
    console.log("✅ [counsellingService] Response:", response.data);
    return response.data.data || response.data;
  },

  /**
   * Get sessions for a counsellor
   * GET /counselling/sessions/counsellor/:id
   */
  getSessionsByCounsellor: async (counsellorId: string): Promise<SessionsResponse> => {
    console.log(`🚀 [counsellingService] GET /counselling/sessions/counsellor/${counsellorId}`);
    const response: AxiosResponse<SessionsResponse> = 
      await apiClient.get(`/counselling/sessions/counsellor/${counsellorId}`);
    console.log("✅ [counsellingService] Response:", response.data);
    return response.data;
  },

  /**
   * Update session status
   * PATCH /counselling/sessions/:id/status
   */
  updateSessionStatus: async (
    sessionId: string,
    payload: { status: string; notes?: string; nextSteps?: string }
  ): Promise<any> => {
    console.log(`🚀 [counsellingService] PATCH /counselling/sessions/${sessionId}/status`, payload);
    const response: AxiosResponse<{ success: boolean; data: any }> = 
      await apiClient.patch(`/counselling/sessions/${sessionId}/status`, payload);
    console.log("✅ [counsellingService] Response:", response.data);
    return response.data.data || response.data;
  },

  /**
   * Add meeting link (Confirm session)
   * PATCH /counselling/sessions/:id/confirm
   */
  addMeetingLink: async (
    sessionId: string,
    payload: { 
      meetingLink: string; 
      meetingPlatform?: string;
      counsellorId?: string;
    }
  ): Promise<any> => {
    console.log(`🚀 [counsellingService] PATCH /counselling/sessions/${sessionId}/confirm`, payload);
    const response: AxiosResponse<{ success: boolean; data: any }> = 
      await apiClient.patch(`/counselling/sessions/${sessionId}/confirm`, payload);
    console.log("✅ [counsellingService] Response:", response.data);
    return response.data.data || response.data;
  },

  /**
   * Cancel a session
   * PATCH /counselling/sessions/:id/cancel
   */
  cancelSession: async (
    sessionId: string,
    payload: { reason: string; reschedule?: boolean }
  ): Promise<any> => {
    console.log(`🚀 [counsellingService] PATCH /counselling/sessions/${sessionId}/cancel`, payload);
    const response: AxiosResponse<{ success: boolean; data: any }> = 
      await apiClient.patch(`/counselling/sessions/${sessionId}/cancel`, payload);
    console.log("✅ [counsellingService] Response:", response.data);
    return response.data.data || response.data;
  },

  // ==================== REVIEWS ====================

  /**
   * Submit a review
   * POST /counselling/reviews
   */
  createReview: async (payload: any): Promise<any> => {
    console.log("🚀 [counsellingService] POST /counselling/reviews", payload);
    const response: AxiosResponse<{ success: boolean; data: any }> = 
      await apiClient.post("/counselling/reviews", payload);
    console.log("✅ [counsellingService] Response:", response.data);
    return response.data.data || response.data;
  },

  /**
   * Get reviews for a counsellor
   * GET /counselling/reviews/counsellor/:id
   */
  getCounsellorReviews: async (counsellorId: string): Promise<any[]> => {
    console.log(`🚀 [counsellingService] GET /counselling/reviews/counsellor/${counsellorId}`);
    const response: AxiosResponse<any> = 
      await apiClient.get(`/counselling/reviews/counsellor/${counsellorId}`);
    console.log("✅ [counsellingService] Response:", response.data);
    return response.data.data || response.data;
  },

  /**
   * Get all reviews (admin)
   * GET /counselling/reviews
   */
  getAllReviews: async (params?: any): Promise<any> => {
    console.log("🚀 [counsellingService] GET /counselling/reviews", params);
    const response: AxiosResponse<any> = 
      await apiClient.get("/counselling/reviews", { params });
    console.log("✅ [counsellingService] Response:", response.data);
    return response.data;
  },
  /**
   * Get all sessions (admin)
   * GET /counselling/sessions
   */
  getAllSessions: async (params?: {
    status?: string;
    counsellorId?: string;
    enrollmentId?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<CounsellingSession[]> => {
    console.log("🚀 [counsellingService] GET /counselling/sessions", params);
    const response: AxiosResponse<CounsellingSession[]> = await apiClient.get(
      "/counselling/sessions",
      { params }
    );
    console.log("✅ [counsellingService] Response:", response.data);
    return response.data;
  },

  /**
   * Assign counsellor to session
   * PATCH /counselling/sessions/:id/assign-counsellor
   */
  assignSessionCounsellor: async (
    sessionId: string,
    counsellorId: string
  ): Promise<CounsellingSession> => {
    console.log(
      `🚀 [counsellingService] PATCH /counselling/sessions/${sessionId}/assign-counsellor`
    );
    const response: AxiosResponse<{
      success: boolean;
      data: CounsellingSession;
    }> = await apiClient.patch(
      `/counselling/sessions/${sessionId}/assign-counsellor`,
      { counsellorId }
    );
    console.log("✅ [counsellingService] Response:", response.data);
    return response.data.data || response.data;
  },

  /**
   * Reschedule session
   * PATCH /counselling/sessions/:id/reschedule
   */
  rescheduleSession: async (
    sessionId: string,
    payload: { preferredDate: string; preferredTimeSlot: string }
  ): Promise<CounsellingSession> => {
    console.log(
      `🚀 [counsellingService] PATCH /counselling/sessions/${sessionId}/reschedule`,
      payload
    );
    const response: AxiosResponse<{
      success: boolean;
      data: CounsellingSession;
    }> = await apiClient.patch(
      `/counselling/sessions/${sessionId}/reschedule`,
      payload
    );
    console.log("✅ [counsellingService] Response:", response.data);
    return response.data.data || response.data;
  },

  /**
   * Admin cancel session
   * PATCH /counselling/sessions/:id/admin-cancel
   */
  adminCancelSession: async (
    sessionId: string,
    payload: { reason: string }
  ): Promise<CounsellingSession> => {
    console.log(
      `🚀 [counsellingService] PATCH /counselling/sessions/${sessionId}/admin-cancel`,
      payload
    );
    const response: AxiosResponse<{
      success: boolean;
      data: CounsellingSession;
    }> = await apiClient.patch(
      `/counselling/sessions/${sessionId}/admin-cancel`,
      payload
    );
    console.log("✅ [counsellingService] Response:", response.data);
    return response.data.data || response.data;
  },

  // ==================== ADMISSION GUIDANCE ====================

  /**
   * Get all admission guidance submissions
   * GET /admission-guidance
   */
  getAdmissionGuidance: async (params?: {
    page?: number;
    limit?: number;
    exam?: string;
  }): Promise<AdmissionGuidanceResponse> => {
    console.log("🚀 [counsellingService] GET /admission-guidance", params);
    const response: AxiosResponse<AdmissionGuidanceResponse> = await apiClient.get(
      "/admission-guidance",
      { params }
    );
    console.log("✅ [counsellingService] Response:", response.data);
    return response.data;
  },

  /**
   * Get single admission guidance by ID
   * GET /admission-guidance/:id
   */
  getAdmissionGuidanceById: async (id: string): Promise<AdmissionGuidance> => {
    console.log(`🚀 [counsellingService] GET /admission-guidance/${id}`);
    const response: AxiosResponse<{
      success: boolean;
      data: AdmissionGuidance;
    }> = await apiClient.get(`/admission-guidance/${id}`);
    console.log("✅ [counsellingService] Response:", response.data);
    return response.data.data || response.data;
  },

  /**
   * Delete admission guidance submission
   * DELETE /admission-guidance/:id
   */
  deleteAdmissionGuidance: async (id: string): Promise<void> => {
    console.log(`🚀 [counsellingService] DELETE /admission-guidance/${id}`);
    await apiClient.delete(`/admission-guidance/${id}`);
    console.log("✅ [counsellingService] Admission guidance deleted");
  },
};

export default counsellingService;
