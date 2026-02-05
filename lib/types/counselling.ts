// Counselling Types for Admin Panel

export type ExamType = "jee" | "neet" | "wbjee";

// Feature within a counselling package
export interface CounsellingFeature {
  title: string;
  description?: string;
  included: boolean;
}

// Counselling Package
export interface CounsellingPackage {
  _id: string;
  name: string;
  slug: string;
  examType: ExamType;
  description: string;
  shortDescription?: string;
  price: number;
  discountPrice?: number;
  discountPercentage?: number;
  currency: string;
  validityDays: number;
  features: CounsellingFeature[];
  maxSessions: number;
  sessionDuration: number; // in minutes
  highlights: string[];
  counsellorIds: string[];
  badge?: string;
  badgeColor?: string;
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: number;
  termsAndConditions?: string;
  totalEnrollments: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCounsellingPackagePayload {
  name: string;
  slug: string;
  examType: ExamType;
  description: string;
  shortDescription?: string;
  price: number;
  discountPrice?: number;
  discountPercentage?: number;
  currency?: string;
  validityDays: number;
  features: CounsellingFeature[];
  maxSessions: number;
  sessionDuration: number;
  highlights?: string[];
  counsellorIds?: string[];
  badge?: string;
  badgeColor?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  displayOrder?: number;
  termsAndConditions?: string;
}

export interface UpdateCounsellingPackagePayload extends Partial<CreateCounsellingPackagePayload> {}

// Counsellor Availability
export interface TimeSlot {
  start: string;
  end: string;
}

export interface Availability {
  monday: TimeSlot | null;
  tuesday: TimeSlot | null;
  wednesday: TimeSlot | null;
  thursday: TimeSlot | null;
  friday: TimeSlot | null;
  saturday: TimeSlot | null;
  sunday: TimeSlot | null;
}

// Counsellor
export interface Counsellor {
  _id: string;
  name: string;
  title: string;
  email: string;
  phone?: string;
  image: string;
  bio: string;
  shortBio?: string;
  qualifications: string[];
  specializations: string[];
  examTypes: ExamType[];
  experience: number;
  studentsGuided: number;
  rating: number;
  totalReviews: number;
  languages: string[];
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
  };
  availability?: Availability;
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCounsellorPayload {
  name: string;
  title: string;
  email: string;
  phone?: string;
  imageBase64: string;
  bio: string;
  shortBio?: string;
  qualifications: string[];
  specializations: string[];
  examTypes: ExamType[];
  experience: number;
  studentsGuided?: number;
  rating?: number;
  languages: string[];
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
  };
  availability?: Availability;
  isActive?: boolean;
  isFeatured?: boolean;
  displayOrder?: number;
}

export interface UpdateCounsellorPayload extends Partial<
  Omit<CreateCounsellorPayload, "imageBase64">
> {
  imageBase64?: string;
}

// Counselling Inquiry (from admission guidance form)
export interface CounsellingInquiry {
  _id: string;
  ticketNumber: string;
  name: string;
  email: string;
  phone: string;
  exam: string;
  rank?: string;
  category?: string;
  state?: string;
  message?: string;
  status: "new" | "contacted" | "converted" | "closed";
  assignedTo?: string;
  notes?: string;
  followUpDate?: string;
  source?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateInquiryPayload {
  status?: "new" | "contacted" | "converted" | "closed";
  assignedTo?: string;
  notes?: string;
  followUpDate?: string;
}

// Enrollment
export interface CounsellingEnrollment {
  _id: string;
  userId: string;
  user?: {
    name: string;
    email: string;
    phone: string;
  };
  packageId: string;
  package?: CounsellingPackage;
  status: "active" | "expired" | "cancelled" | "refunded";
  sessionsUsed: number;
  sessionsRemaining: number;
  paymentId?: string;
  amountPaid: number;
  couponCode?: string;
  assignedCounsellor?: Counsellor;
  enrolledAt: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  sessions?: CounsellingSession[];
}

// API Response Types
export interface CounsellingPackagesResponse {
  success: boolean;
  data: CounsellingPackage[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface CounsellorsResponse {
  success: boolean;
  data: Counsellor[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface InquiriesResponse {
  success: boolean;
  data: CounsellingInquiry[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
  };
  stats?: {
    total: number;
    new: number;
    contacted: number;
    converted: number;
    closed: number;
  };
}

export interface EnrollmentsResponse {
  success: boolean;
  data: CounsellingEnrollment[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
  };
}

// Session
export interface CounsellingSession {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  } | string; // Handle both populated and string ID cases
  enrolledAt?: string; // Optional if needed
  counsellorId: string | null;
  counsellor?: Counsellor;
  enrollmentId: {
    _id: string;
    packageId: string;
  } | string;
  enrollment?: CounsellingEnrollment; // Keep for backward compatibility if used elsewhere
  isDirectBooking?: boolean;
  scheduledDate?: string; // API returns this instead of preferredDate sometimes?
  duration?: number;
  paymentId?: string;
  amountPaid?: number;
  preferredDate: string;
  preferredTimeSlot: string;
  scheduledAt?: string;
  status: "scheduled" | "completed" | "cancelled" | "no-show" | "confirmed" | "pending_assignment";
  agenda?: string;
  meetingPreference?: string;
  meetingLink?: string;
  meetingPlatform?: string;
  notes?: string;
  nextSteps?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSessionPayload {
  enrollmentId?: string;
  counsellorId?: string;
  paymentId?: string;
  amountPaid?: number;
  preferredDate: string;
  preferredTimeSlot: string;
  agenda?: string;
  meetingPreference?: string;
}

export interface UpdateSessionStatusPayload {
  status: "completed" | "cancelled" | "no-show" | "scheduled" | "confirmed";
  notes?: string;
  nextSteps?: string;
}

export interface CancelSessionPayload {
  reason: string;
  reschedule?: boolean;
}

// Review
export interface CounsellingReview {
  _id: string;
  userId: string;
  user?: {
    name: string;
    email: string;
  };
  sessionId: string;
  session?: CounsellingSession;
  counsellorId: string;
  counsellor?: Counsellor;
  rating: number; // 1-5
  review?: string;
  wouldRecommend?: boolean;
  tags?: string[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewPayload {
  sessionId: string;
  counsellorId: string;
  rating: number;
  review?: string;
  wouldRecommend?: boolean;
  tags?: string[];
}

// Additional Response Types
export interface SessionsResponse {
  success: boolean;
  data: CounsellingSession[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface ReviewsResponse {
  success: boolean;
  data: CounsellingReview[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
  };
}

// Admission Guidance Submission
export interface AdmissionGuidance {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  exam: "jee-main" | "jee-advanced" | "neet-ug" | "wbjee" | "other-state-exam";
  rankScore?: string;
  category: "general" | "obc-ncl" | "sc" | "st" | "ews" | "pwd";
  homeState: string;
  class12Status: "appearing" | "passed";
  tenthPercentage: string;
  twelfthPercentageExpected?: string;
  collegeChoice?: string;
  additionalMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdmissionGuidanceResponse {
  data: AdmissionGuidance[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdmissionGuidanceStats {
  totalRequests: number;
  requestsToday: number;
  requestsThisWeek: number;
  byExam: Array<{ exam: string; count: number }>;
  byCategory: Array<{ category: string; count: number }>;
  byClass12Status: Array<{ status: string; count: number }>;
  topStates: Array<{ state: string; count: number }>;
  recentRequests: Array<{
    _id: string;
    fullName: string;
    email: string;
    phone: string;
    exam: string;
    category: string;
    homeState: string;
    createdAt: string;
  }>;
}

