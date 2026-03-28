import { z } from "zod";
import { FREELANCE_STATUSES } from "@/lib/types/freelance";

export const updateFreelanceStatusSchema = z
  .object({
    status: z.enum(FREELANCE_STATUSES),
    adminNotes: z
      .string()
      .max(1000, "Admin notes must be at most 1000 characters")
      .optional()
      .or(z.literal("")),
    rejectionReason: z
      .string()
      .max(1000, "Rejection reason must be at most 1000 characters")
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (value) => {
      if (value.status !== "rejected") {
        return true;
      }
      return Boolean(value.rejectionReason && value.rejectionReason.trim().length > 0);
    },
    {
      message: "Rejection reason is required when status is rejected",
      path: ["rejectionReason"],
    },
  );

export type UpdateFreelanceStatusFormValues = z.infer<
  typeof updateFreelanceStatusSchema
>;

export const contactFreelancerSchema = z.object({
  contactMessage: z
    .string()
    .trim()
    .min(1, "Contact message is required")
    .max(2000, "Contact message must be at most 2000 characters"),
  internalNotes: z
    .string()
    .max(1000, "Internal notes must be at most 1000 characters")
    .optional()
    .or(z.literal("")),
});

export type ContactFreelancerFormValues = z.infer<typeof contactFreelancerSchema>;
