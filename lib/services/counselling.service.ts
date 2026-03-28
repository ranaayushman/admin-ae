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
  AdmissionGuidanceStats,
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
  ): Promise<CounsellingPackage> => {    const response: AxiosResponse<{
      success: boolean;
      data: CounsellingPackage;
    }> = await apiClient.post("/counselling/packages", payload);    return response.data.data || response.data;
  },

  /**
   * Get all counselling packages
   * GET /counselling/packages
   */
  getPackages: async (
    params?: GetPackagesParams,
  ): Promise<CounsellingPackage[]> => {    const response: AxiosResponse<
      CounsellingPackagesResponse | CounsellingPackage[]
    > = await apiClient.get("/counselling/packages", { params });
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
  getPackageById: async (id: string): Promise<CounsellingPackage> => {    const response: AxiosResponse<{
      success: boolean;
      data: CounsellingPackage;
    }> = await apiClient.get(`/counselling/packages/${id}`);    return response.data.data || response.data;
  },

  /**
   * Get a package by slug
   * GET /counselling/packages/slug/:slug
   */
  getPackageBySlug: async (slug: string): Promise<CounsellingPackage> => {    const response: AxiosResponse<{
      success: boolean;
      data: CounsellingPackage;
    }> = await apiClient.get(`/counselling/packages/slug/${slug}`);    return response.data.data || response.data;
  },

  /**
   * Update a counselling package
   * PATCH /counselling/packages/:id
   */
  updatePackage: async (
    id: string,
    payload: UpdateCounsellingPackagePayload,
  ): Promise<CounsellingPackage> => {    const response: AxiosResponse<{
      success: boolean;
      data: CounsellingPackage;
    }> = await apiClient.patch(`/counselling/packages/${id}`, payload);    return response.data.data || response.data;
  },

  /**
   * Delete a counselling package
   * DELETE /counselling/packages/:id
   */
  deletePackage: async (id: string): Promise<void> => {    await apiClient.delete(`/counselling/packages/${id}`);  },

  /**
   * Reorder packages
   * PATCH /counselling/packages/reorder
   */
  reorderPackages: async (
    packages: { id: string; displayOrder: number }[],
  ): Promise<void> => {    await apiClient.patch("/counselling/packages/reorder", { packages });  },

  // ==================== INQUIRIES ====================

  /**
   * Get all counselling inquiries
   * GET /counselling/inquiries
   */
  getInquiries: async (
    params?: GetInquiriesParams,
  ): Promise<InquiriesResponse> => {    const response: AxiosResponse<InquiriesResponse> = await apiClient.get(
      "/counselling/inquiries",
      { params },
    );    return response.data;
  },

  /**
   * Get inquiry by ID
   * GET /counselling/inquiries/:id
   */
  getInquiryById: async (id: string): Promise<CounsellingInquiry> => {    const response: AxiosResponse<{
      success: boolean;
      data: CounsellingInquiry;
    }> = await apiClient.get(`/counselling/inquiries/${id}`);    return response.data.data || response.data;
  },

  /**
   * Update inquiry status
   * PATCH /counselling/inquiries/:id
   */
  updateInquiry: async (
    id: string,
    payload: UpdateInquiryPayload,
  ): Promise<CounsellingInquiry> => {    const response: AxiosResponse<{
      success: boolean;
      data: CounsellingInquiry;
    }> = await apiClient.patch(`/counselling/inquiries/${id}`, payload);    return response.data.data || response.data;
  },

  // ==================== ENROLLMENTS ====================

  /**
   * Get all enrollments (admin)
   * GET /counselling/enrollments
   */
  getEnrollments: async (
    params?: GetEnrollmentsParams,
  ): Promise<EnrollmentsResponse> => {    const response: AxiosResponse<EnrollmentsResponse> = await apiClient.get(
      "/counselling/enrollments",
      { params },
    );    return response.data;
  },

  /**
   * Get current user's enrollments (user-facing)
   * GET /counselling/enrollments/my
   */
  getMyEnrollments: async (): Promise<CounsellingEnrollment[]> => {    const response: AxiosResponse<{
      success: boolean;
      data: CounsellingEnrollment[];
    }> = await apiClient.get("/counselling/enrollments/my");    return response.data.data || response.data;
  },

  /**
   * Assign counsellor to enrollment
   * PATCH /counselling/enrollments/:id/assign-counsellor
   */
  assignCounsellor: async (
    enrollmentId: string,
    counsellorId: string,
  ): Promise<CounsellingEnrollment> => {    const response: AxiosResponse<{
      success: boolean;
      data: CounsellingEnrollment;
    }> = await apiClient.patch(
      `/counselling/enrollments/${enrollmentId}/assign-counsellor`,
      { counsellorId },
    );    return response.data.data || response.data;
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
  }): Promise<CounsellingEnrollment> => {    const response: AxiosResponse<{
      success: boolean;
      data: CounsellingEnrollment;
    }> = await apiClient.post("/counselling/enrollments/manual", payload);    return response.data.data || response.data;
  },

  // ==================== SESSIONS ====================

  /**
   * Book a session
   * POST /counselling/sessions
   */
  createSession: async (payload: any): Promise<any> => {    const response: AxiosResponse<{ success: boolean; data: any }> = 
      await apiClient.post("/counselling/sessions", payload);    return response.data.data || response.data;
  },

  /**
   * Get current user's sessions
   * GET /counselling/sessions/my
   */
  getMySessions: async (params?: { status?: string; upcoming?: boolean }): Promise<any[]> => {    const response: AxiosResponse<any> = 
      await apiClient.get("/counselling/sessions/my", { params });    return response.data.data || response.data;
  },

  /**
   * Get sessions for a counsellor
   * GET /counselling/sessions/counsellor/:id
   */
  getSessionsByCounsellor: async (counsellorId: string): Promise<SessionsResponse> => {    const response: AxiosResponse<SessionsResponse> = 
      await apiClient.get(`/counselling/sessions/counsellor/${counsellorId}`);    return response.data;
  },

  /**
   * Update session status
   * PATCH /counselling/sessions/:id/status
   */
  updateSessionStatus: async (
    sessionId: string,
    payload: { status: string; notes?: string; nextSteps?: string }
  ): Promise<any> => {    const response: AxiosResponse<{ success: boolean; data: any }> = 
      await apiClient.patch(`/counselling/sessions/${sessionId}/status`, payload);    return response.data.data || response.data;
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
  ): Promise<any> => {    const response: AxiosResponse<{ success: boolean; data: any }> = 
      await apiClient.patch(`/counselling/sessions/${sessionId}/confirm`, payload);    return response.data.data || response.data;
  },

  /**
   * Cancel a session
   * PATCH /counselling/sessions/:id/cancel
   */
  cancelSession: async (
    sessionId: string,
    payload: { reason: string; reschedule?: boolean }
  ): Promise<any> => {    const response: AxiosResponse<{ success: boolean; data: any }> = 
      await apiClient.patch(`/counselling/sessions/${sessionId}/cancel`, payload);    return response.data.data || response.data;
  },

  // ==================== REVIEWS ====================

  /**
   * Submit a review
   * POST /counselling/reviews
   */
  createReview: async (payload: any): Promise<any> => {    const response: AxiosResponse<{ success: boolean; data: any }> = 
      await apiClient.post("/counselling/reviews", payload);    return response.data.data || response.data;
  },

  /**
   * Get reviews for a counsellor
   * GET /counselling/reviews/counsellor/:id
   */
  getCounsellorReviews: async (counsellorId: string): Promise<any[]> => {    const response: AxiosResponse<any> = 
      await apiClient.get(`/counselling/reviews/counsellor/${counsellorId}`);    return response.data.data || response.data;
  },

  /**
   * Get all reviews (admin)
   * GET /counselling/reviews
   */
  getAllReviews: async (params?: any): Promise<any> => {    const response: AxiosResponse<any> = 
      await apiClient.get("/counselling/reviews", { params });    return response.data;
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
  }): Promise<CounsellingSession[]> => {    const response: AxiosResponse<CounsellingSession[]> = await apiClient.get(
      "/counselling/sessions",
      { params }
    );    return response.data;
  },

  /**
   * Assign counsellor to session
   * PATCH /counselling/sessions/:id/assign-counsellor
   */
  assignSessionCounsellor: async (
    sessionId: string,
    counsellorId: string
  ): Promise<CounsellingSession> => {    const response: AxiosResponse<{
      success: boolean;
      data: CounsellingSession;
    }> = await apiClient.patch(
      `/counselling/sessions/${sessionId}/assign-counsellor`,
      { counsellorId }
    );    return response.data.data || response.data;
  },

  /**
   * Reschedule session
   * PATCH /counselling/sessions/:id/reschedule
   */
  rescheduleSession: async (
    sessionId: string,
    payload: { preferredDate: string; preferredTimeSlot: string }
  ): Promise<CounsellingSession> => {    const response: AxiosResponse<{
      success: boolean;
      data: CounsellingSession;
    }> = await apiClient.patch(
      `/counselling/sessions/${sessionId}/reschedule`,
      payload
    );    return response.data.data || response.data;
  },

  /**
   * Admin cancel session
   * PATCH /counselling/sessions/:id/admin-cancel
   */
  adminCancelSession: async (
    sessionId: string,
    payload: { reason: string }
  ): Promise<CounsellingSession> => {    const response: AxiosResponse<{
      success: boolean;
      data: CounsellingSession;
    }> = await apiClient.patch(
      `/counselling/sessions/${sessionId}/admin-cancel`,
      payload
    );    return response.data.data || response.data;
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
  }): Promise<AdmissionGuidanceResponse> => {    const response: AxiosResponse<AdmissionGuidanceResponse> = await apiClient.get(
      "/admission-guidance",
      { params }
    );    return response.data;
  },

  /**
   * Get single admission guidance by ID
   * GET /admission-guidance/:id
   */
  getAdmissionGuidanceById: async (id: string): Promise<AdmissionGuidance> => {    const response: AxiosResponse<{
      success: boolean;
      data: AdmissionGuidance;
    }> = await apiClient.get(`/admission-guidance/${id}`);    return response.data.data || response.data;
  },

  /**
   * Delete admission guidance submission
   * DELETE /admission-guidance/:id
   */
  deleteAdmissionGuidance: async (id: string): Promise<void> => {    await apiClient.delete(`/admission-guidance/${id}`);  },

  /**
   * Get admission guidance stats
   * GET /admission-guidance/stats
   */
  getAdmissionGuidanceStats: async (): Promise<AdmissionGuidanceStats> => {    const response: AxiosResponse<AdmissionGuidanceStats> = await apiClient.get(
      "/admission-guidance/stats"
    );    return response.data;
  },
};

export default counsellingService;
