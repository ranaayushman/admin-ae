export const FREELANCE_DOMAINS = [
  "frontend",
  "backend",
  "full-stack",
  "technical-writer",
  "graphic-designer",
  "social-media-manager",
  "video-editor",
  "ui-ux-designer",
  "mobile-developer",
  "devops",
  "data-scientist",
  "qa-engineer",
] as const;

export const FREELANCE_STATUSES = [
  "submitted",
  "under-review",
  "verified",
  "rejected",
  "contacted",
  "archived",
] as const;

export type FreelanceDomain = (typeof FREELANCE_DOMAINS)[number];
export type FreelanceStatus = (typeof FREELANCE_STATUSES)[number];

export type SortOrder = "asc" | "desc";

export interface FreelanceProfile {
  id: string;
  userId?: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  bio: string;
  domain: FreelanceDomain;
  status: FreelanceStatus;
  portfolioUrl?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  cvFileBase64?: string;
  cvFileUrl?: string;
  cvFileName?: string;
  submittedAt?: string;
  yearsOfExperience?: number | null;
  skills?: string[];
  adminNotes?: string | null;
  rejectionReason?: string | null;
  contactedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FreelancePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminFreelanceProfilesQuery {
  status?: FreelanceStatus;
  domain?: FreelanceDomain;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: SortOrder;
}

export interface UpdateFreelanceProfileStatusDto {
  status: FreelanceStatus;
  adminNotes?: string;
  rejectionReason?: string;
}

export interface ContactFreelancerDto {
  contactMessage: string;
  internalNotes?: string;
}

export interface FreelanceStatistics {
  totalProfiles: number;
  byStatus: Partial<Record<FreelanceStatus, number>>;
  byDomain: Partial<Record<FreelanceDomain, number>>;
}
