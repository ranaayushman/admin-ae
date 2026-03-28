import { AxiosError } from "axios";
import apiClient from "@/lib/services/api.client";
import {
  AdminFreelanceProfilesQuery,
  ContactFreelancerDto,
  FreelancePagination,
  FreelanceProfile,
  FreelanceStatistics,
  UpdateFreelanceProfileStatusDto,
} from "@/lib/types/freelance";

interface ApiResponseEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface PaginatedApiResponseEnvelope<T> {
  success: boolean;
  data: T[];
  pagination?: FreelancePagination;
  message?: string;
}

interface BackendErrorResponse {
  message?: string;
  error?: {
    message?: string;
    code?: string;
    details?: unknown;
  };
}

const DEFAULT_PAGINATION: FreelancePagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
};

export class FreelanceServiceError extends Error {
  statusCode?: number;
  code?: string;
  details?: unknown;

  constructor(message: string, options?: { statusCode?: number; code?: string; details?: unknown }) {
    super(message);
    this.name = "FreelanceServiceError";
    this.statusCode = options?.statusCode;
    this.code = options?.code;
    this.details = options?.details;
  }
}

const buildServiceError = (error: unknown): FreelanceServiceError => {
  if (!(error instanceof AxiosError)) {
    return new FreelanceServiceError("Unexpected error while processing freelance request");
  }

  const responseData = error.response?.data as BackendErrorResponse | undefined;
  const message =
    responseData?.error?.message ||
    responseData?.message ||
    error.message ||
    "Failed to process freelance request";

  return new FreelanceServiceError(message, {
    statusCode: error.response?.status,
    code: responseData?.error?.code,
    details: responseData?.error?.details,
  });
};

const normalizeProfilePayload = (payload: unknown): FreelanceProfile => {
  const data = (payload || {}) as Partial<FreelanceProfile> & {
    _id?: string;
  };

  return {
    id: data.id || data._id || "",
    userId: data.userId,
    fullName: data.fullName || "",
    email: data.email || "",
    phoneNumber: data.phoneNumber || "",
    bio: data.bio || "",
    domain: (data.domain || "frontend") as FreelanceProfile["domain"],
    status: (data.status || "submitted") as FreelanceProfile["status"],
    portfolioUrl: data.portfolioUrl ?? null,
    githubUrl: data.githubUrl ?? null,
    linkedinUrl: data.linkedinUrl ?? null,
    cvFileBase64: data.cvFileBase64,
    cvFileUrl: data.cvFileUrl,
    cvFileName: data.cvFileName,
    submittedAt: data.submittedAt,
    yearsOfExperience: data.yearsOfExperience ?? null,
    skills: Array.isArray(data.skills) ? data.skills : [],
    adminNotes: data.adminNotes ?? null,
    rejectionReason: data.rejectionReason ?? null,
    contactedAt: data.contactedAt ?? null,
    createdAt: data.createdAt || "",
    updatedAt: data.updatedAt || "",
  };
};

const normalizeStatisticsPayload = (payload: unknown): FreelanceStatistics => {
  const stats = (payload || {}) as Partial<FreelanceStatistics>;
  return {
    totalProfiles: stats.totalProfiles ?? 0,
    byStatus: stats.byStatus ?? {},
    byDomain: stats.byDomain ?? {},
  };
};

export interface AdminFreelanceProfilesResult {
  profiles: FreelanceProfile[];
  pagination: FreelancePagination;
  message?: string;
}

export const freelanceService = {
  getAdminFreelanceProfiles: async (
    query: AdminFreelanceProfilesQuery = {},
  ): Promise<AdminFreelanceProfilesResult> => {
    try {
      const response = await apiClient.get<PaginatedApiResponseEnvelope<FreelanceProfile>>(
        "/freelance/admin/all",
        { params: query },
      );

      return {
        profiles: Array.isArray(response.data.data)
          ? response.data.data.map(normalizeProfilePayload)
          : [],
        pagination: response.data.pagination ?? DEFAULT_PAGINATION,
        message: response.data.message,
      };
    } catch (error) {
      throw buildServiceError(error);
    }
  },

  getAdminFreelanceProfileById: async (id: string): Promise<FreelanceProfile> => {
    try {
      const response = await apiClient.get<ApiResponseEnvelope<FreelanceProfile>>(
        `/freelance/admin/${id}`,
      );

      return normalizeProfilePayload(response.data.data);
    } catch (error) {
      throw buildServiceError(error);
    }
  },

  updateAdminFreelanceStatus: async (
    id: string,
    payload: UpdateFreelanceProfileStatusDto,
  ): Promise<FreelanceProfile> => {
    try {
      const response = await apiClient.patch<ApiResponseEnvelope<FreelanceProfile>>(
        `/freelance/admin/${id}/status`,
        payload,
      );

      return normalizeProfilePayload(response.data.data);
    } catch (error) {
      throw buildServiceError(error);
    }
  },

  contactFreelancer: async (
    id: string,
    payload: ContactFreelancerDto,
  ): Promise<FreelanceProfile> => {
    try {
      const response = await apiClient.post<ApiResponseEnvelope<FreelanceProfile>>(
        `/freelance/admin/${id}/contact`,
        payload,
      );

      return normalizeProfilePayload(response.data.data);
    } catch (error) {
      throw buildServiceError(error);
    }
  },

  archiveFreelanceProfile: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/freelance/admin/${id}`);
    } catch (error) {
      throw buildServiceError(error);
    }
  },

  getFreelanceStatistics: async (): Promise<FreelanceStatistics> => {
    try {
      const response = await apiClient.get<ApiResponseEnvelope<FreelanceStatistics>>(
        "/freelance/admin/statistics",
      );

      return normalizeStatisticsPayload(response.data.data);
    } catch (error) {
      throw buildServiceError(error);
    }
  },
};

export default freelanceService;
