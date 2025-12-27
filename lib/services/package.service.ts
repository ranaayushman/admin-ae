import apiClient, { handleApiError } from "./api.client";

// Package status types
export type PackageStatus = "active" | "inactive" | "draft" | "archived";
export type PackageType = "test-series" | "course" | "bundle";

// Package metadata
export interface PackageMetadata {
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  targetYear?: number;
  instructors?: string[];
  rating?: number;
  totalStudents?: number;
  language?: string;
}

// Create package payload - matches API spec
export interface CreatePackagePayload {
  title: string;
  description: string;
  packageId?: string; // unique slug, auto-generated if not provided
  category: string;
  type: PackageType;
  status: PackageStatus;
  price: number;
  discountPrice?: number;
  discountPercentage?: number;
  earlyBirdPrice?: number;
  currency?: string;
  examTypes?: string[];
  subjects?: string[];
  thumbnail?: string;
  banner?: string;
  features?: string[];
  validityDays: number;
  totalTests?: number;
  totalQuestions?: number;
  enrollments?: number;
  maxEnrollments?: number;
  revenue?: number;
  launchDate?: string;
  accessStartDate?: string;
  expiryDate?: string;
  enableWaitlist?: boolean;
  sequentialUnlock?: boolean;
  isFeatured?: boolean;
  tests?: string[];
  metadata?: PackageMetadata;
}

// Populated test object (when fetched with package details)
export interface PackageTest {
  _id: string;
  title: string;
  category: string;
  type: string;
  duration: number;
  totalMarks: number;
}

// Package response from API
export interface Package {
  _id: string;
  title: string;
  description: string;
  packageId: string;
  category: string;
  type: PackageType;
  status: PackageStatus;
  price: number;
  discountPrice?: number;
  discountPercentage?: number;
  earlyBirdPrice?: number;
  currency: string;
  examTypes: string[];
  subjects: string[];
  thumbnail?: string;
  banner?: string;
  features: string[];
  validityDays: number;
  totalTests: number;
  totalQuestions: number;
  enrollments: number;
  maxEnrollments?: number;
  revenue: number;
  launchDate?: string;
  accessStartDate?: string;
  expiryDate?: string;
  enableWaitlist: boolean;
  sequentialUnlock: boolean;
  isFeatured: boolean;
  tests: string[] | PackageTest[]; // Can be IDs or populated objects
  metadata?: PackageMetadata;
  createdAt: string;
  updatedAt: string;
}

// Package with populated tests (for detail view)
export interface PackageDetails extends Omit<Package, "tests"> {
  tests: PackageTest[];
}

export interface GetPackageResponse {
  success: boolean;
  message: string;
  data: PackageDetails;
}

export interface CreatePackageResponse {
  success: boolean;
  message: string;
  data: Package;
}

export interface PackageListResponse {
  success: boolean;
  data: Package[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Generate a URL-friendly package ID from title
const generatePackageId = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

// Map form values to API payload
export const mapFormToApiPayload = (formData: {
  name: string;
  description: string;
  category: string;
  price: number;
  discountPercentage?: number;
  earlyBirdPrice?: number;
  validityPeriod: number;
  validityUnit: "DAYS" | "MONTHS" | "YEARS" | "LIFETIME";
  maxEnrollments?: number;
  enableWaitlist: boolean;
  enableSequentialUnlock: boolean;
  accessStartDate?: string;
  launchDate?: string;
  expiryDate?: string;
  testSeriesIds: string[];
  isActive: boolean;
  isFeatured: boolean;
  bannerImage?: string;
  features?: string[];
  subjects?: string[];
  examTypes?: string[];
}): CreatePackagePayload => {
  // Convert validity to days
  let validityDays = formData.validityPeriod;
  switch (formData.validityUnit) {
    case "MONTHS":
      validityDays = formData.validityPeriod * 30;
      break;
    case "YEARS":
      validityDays = formData.validityPeriod * 365;
      break;
    case "LIFETIME":
      validityDays = 36500; // 100 years
      break;
  }

  // Calculate discount price if discount percentage is provided
  const discountPrice =
    formData.discountPercentage && formData.discountPercentage > 0
      ? Math.round(formData.price * (1 - formData.discountPercentage / 100))
      : undefined;

  // Map category to examTypes
  const examTypes =
    formData.examTypes && formData.examTypes.length > 0
      ? formData.examTypes
      : [formData.category];

  // Build payload - match API sample exactly
  const tests = formData.testSeriesIds || [];
  const subjects =
    formData.subjects && formData.subjects.length > 0 ? formData.subjects : [];
  const featuresList =
    formData.features && formData.features.length > 0 ? formData.features : [];

  const payload: CreatePackagePayload = {
    title: formData.name,
    description: formData.description,
    packageId: generatePackageId(formData.name),
    category: formData.category,
    type: "test-series",
    status: formData.isActive ? "active" : "draft",
    price: formData.price,
    currency: "INR",
    examTypes,
    subjects,
    features: featuresList,
    validityDays,
    totalTests: tests.length,
    totalQuestions: tests.length * 75, // Estimate: 75 questions per test
    enrollments: 0,
    revenue: 0,
    enableWaitlist: formData.enableWaitlist ?? false,
    sequentialUnlock: formData.enableSequentialUnlock ?? false,
    isFeatured: formData.isFeatured ?? false,
    tests,
  };

  // Add optional fields only if they have values
  if (discountPrice !== undefined) {
    payload.discountPrice = discountPrice;
  }
  if (formData.discountPercentage && formData.discountPercentage > 0) {
    payload.discountPercentage = formData.discountPercentage;
  }
  if (formData.earlyBirdPrice && formData.earlyBirdPrice > 0) {
    payload.earlyBirdPrice = formData.earlyBirdPrice;
  }
  if (formData.bannerImage) {
    payload.banner = formData.bannerImage;
  }
  if (formData.maxEnrollments && formData.maxEnrollments > 0) {
    payload.maxEnrollments = formData.maxEnrollments;
  }
  if (formData.accessStartDate) {
    payload.accessStartDate = new Date(formData.accessStartDate).toISOString();
  }
  if (formData.launchDate) {
    payload.launchDate = new Date(formData.launchDate).toISOString();
  }
  if (formData.expiryDate) {
    payload.expiryDate = new Date(formData.expiryDate).toISOString();
  }

  return payload;
};

/**
 * Create a new package
 */
export const createPackage = async (
  payload: CreatePackagePayload
): Promise<CreatePackageResponse> => {
  try {
    const response = await apiClient.post<CreatePackageResponse>(
      "/packages/create",
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Error creating package:", error);
    throw new Error(handleApiError(error));
  }
};

// Query parameters for fetching packages
export interface PackageFilters {
  page?: number;
  limit?: number;
  type?: PackageType;
  status?: PackageStatus | "coming-soon" | "scheduled";
  examType?: string;
  search?: string;
}

/**
 * Get all packages with optional filters
 */
export const getPackages = async (
  params?: PackageFilters
): Promise<PackageListResponse> => {
  try {
    const response = await apiClient.get<PackageListResponse>("/packages", {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching packages:", error);
    throw new Error(handleApiError(error));
  }
};

/**
 * Get a single package by ID with populated tests
 */
export const getPackageById = async (id: string): Promise<PackageDetails> => {
  try {
    const response = await apiClient.get<GetPackageResponse>(`/packages/${id}`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching package:", error);
    throw new Error(handleApiError(error));
  }
};

/**
 * Update a package (PATCH)
 */
export const updatePackage = async (
  id: string,
  payload: Partial<CreatePackagePayload>
): Promise<Package> => {
  try {
    const response = await apiClient.patch<{ success: boolean; data: Package }>(
      `/packages/${id}`,
      payload
    );
    return response.data.data;
  } catch (error) {
    console.error("Error updating package:", error);
    throw new Error(handleApiError(error));
  }
};

/**
 * Delete a package
 */
export const deletePackage = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/packages/${id}`);
  } catch (error) {
    console.error("Error deleting package:", error);
    throw new Error(handleApiError(error));
  }
};

export default {
  createPackage,
  getPackages,
  getPackageById,
  updatePackage,
  deletePackage,
  mapFormToApiPayload,
};
