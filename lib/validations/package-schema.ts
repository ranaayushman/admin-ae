// lib/validations/package-schema.ts
import { z } from "zod";

export const packageSchema = z.object({
  name: z.string().min(1, "Package name is required"),
  description: z.string().min(1, "Description is required"),
  bannerImage: z.string().optional(),
  category: z.string().min(1, "Category is required"),

  // Pricing
  price: z.number().min(0, "Price must be positive"),
  discountPercentage: z.number().min(0).max(100).optional(),
  earlyBirdPrice: z.number().min(0).optional(),

  // Validity
  validityPeriod: z.number().min(1, "Validity period is required"),
  validityUnit: z.enum(["DAYS", "MONTHS", "YEARS", "LIFETIME"]),

  // Enrollment
  maxEnrollments: z.number().min(0).optional(),
  enableWaitlist: z.boolean().default(false),

  // Access control
  accessStartDate: z.string().optional(),
  accessEndDate: z.string().optional(),
  enableSequentialUnlock: z.boolean().default(false),

  // Tests - now optional since tests can be added later
  testSeriesIds: z.array(z.string()).optional().default([]),

  // Status
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),

  // Additional fields for API compatibility
  features: z.array(z.string()).optional().default([]),
  subjects: z.array(z.string()).optional().default([]),
  examTypes: z.array(z.string()).optional().default([]),
  launchDate: z.string().optional(),
  expiryDate: z.string().optional(),
});

// Note: react-hook-form works with *input* values; Zod defaults mean the input
// can be undefined even if the parsed output is a boolean/number.
// Using z.input keeps zodResolver() and useForm<T>() types aligned.
export type PackageFormValues = z.input<typeof packageSchema>;

// Manual enrollment schema
export const manualEnrollmentSchema = z.object({
  studentEmail: z.string().email("Invalid email"),
  packageId: z.string().min(1, "Package is required"),
  enrollmentType: z.enum(["FREE", "DISCOUNTED", "PAID"]),
  customPrice: z.number().min(0).optional(),
  customValidity: z.number().optional(),
  notes: z.string().optional(),
});

export type ManualEnrollmentFormValues = z.infer<typeof manualEnrollmentSchema>;
