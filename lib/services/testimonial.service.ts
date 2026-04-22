import apiClient, { handleApiError } from "./api.client";

export type TestimonialStatus = "pending" | "approved" | "rejected";

export interface TestimonialAdmin {
  id: string;
  studentName: string;
  quote: string;
  achievementLine: string;
  institutionLine: string;
  rating: number;
  avatarUrl?: string;
  status: TestimonialStatus;
  displayOrder: number;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedTestimonialsResponse {
  success: boolean;
  message: string;
  data: TestimonialAdmin[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateTestimonialPayload {
  studentName: string;
  quote: string;
  achievementLine: string;
  institutionLine: string;
  rating?: number;
  avatarBase64?: string;
  displayOrder?: number;
  status?: TestimonialStatus;
}

export type UpdateTestimonialPayload = Partial<CreateTestimonialPayload>;

export interface UpdateStatusPayload {
  status: TestimonialStatus;
  adminNotes?: string;
  rejectionReason?: string;
}

export interface ListTestimonialsParams {
  status?: TestimonialStatus;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

type ApiRecord = Record<string, unknown>;

const asRecord = (value: unknown): ApiRecord =>
  typeof value === "object" && value !== null ? (value as ApiRecord) : {};

const getString = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value : fallback;

const getNumber = (value: unknown, fallback: number): number => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeTestimonial = (item: unknown): TestimonialAdmin => {
  const record = asRecord(item);

  return {
    id: getString(record.id ?? record._id),
    studentName: getString(record.studentName),
    quote: getString(record.quote),
    achievementLine: getString(record.achievementLine),
    institutionLine: getString(record.institutionLine),
    rating: getNumber(record.rating, 5),
    avatarUrl: typeof record.avatarUrl === "string" ? record.avatarUrl : undefined,
    status: (getString(record.status, "pending") as TestimonialStatus),
    displayOrder: getNumber(record.displayOrder, 0),
    approvedBy: typeof record.approvedBy === "string" ? record.approvedBy : undefined,
    approvedAt: typeof record.approvedAt === "string" ? record.approvedAt : undefined,
    rejectionReason:
      typeof record.rejectionReason === "string" ? record.rejectionReason : undefined,
    createdAt: getString(record.createdAt),
    updatedAt: getString(record.updatedAt),
  };
};

const unwrapListResponse = (payload: unknown): PaginatedTestimonialsResponse => {
  const record = asRecord(payload);
  const dataArray = Array.isArray(record.data)
    ? record.data
    : Array.isArray(payload)
      ? payload
      : [];

  const paginationRecord = asRecord(record.pagination);

  return {
    success: Boolean(record.success ?? true),
    message:
      typeof record.message === "string"
        ? record.message
        : "Testimonials retrieved successfully",
    data: dataArray.map(normalizeTestimonial),
    pagination: {
      page: getNumber(paginationRecord.page, 1),
      limit: getNumber(paginationRecord.limit, dataArray.length || 10),
      total: getNumber(paginationRecord.total, dataArray.length),
      totalPages: getNumber(paginationRecord.totalPages, 1),
    },
  };
};

const unwrapSingle = (payload: unknown): TestimonialAdmin => {
  const record = asRecord(payload);

  if (record.data !== undefined) {
    return normalizeTestimonial(record.data);
  }

  return normalizeTestimonial(payload);
};

export const testimonialService = {
  listAdminTestimonials: async (
    params: ListTestimonialsParams
  ): Promise<PaginatedTestimonialsResponse> => {
    try {
      const response = await apiClient.get("/testimonials/admin/all", {
        params,
      });
      return unwrapListResponse(response.data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getAdminTestimonialById: async (id: string): Promise<TestimonialAdmin> => {
    try {
      const response = await apiClient.get(`/testimonials/admin/${id}`);
      return unwrapSingle(response.data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  createAdminTestimonial: async (
    payload: CreateTestimonialPayload
  ): Promise<TestimonialAdmin> => {
    try {
      const response = await apiClient.post("/testimonials/admin", payload);
      return unwrapSingle(response.data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  updateAdminTestimonial: async (
    id: string,
    payload: UpdateTestimonialPayload
  ): Promise<TestimonialAdmin> => {
    try {
      const response = await apiClient.patch(`/testimonials/admin/${id}`, payload);
      return unwrapSingle(response.data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  updateAdminTestimonialStatus: async (
    id: string,
    payload: UpdateStatusPayload
  ): Promise<TestimonialAdmin> => {
    try {
      const response = await apiClient.patch(`/testimonials/admin/${id}/status`, payload);
      return unwrapSingle(response.data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  deleteAdminTestimonial: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/testimonials/admin/${id}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
