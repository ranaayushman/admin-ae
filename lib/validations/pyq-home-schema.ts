import { z } from "zod";

const categoryEnum = z.enum([
  "neet",
  "jee-main",
  "jee-advanced",
  "boards",
  "wbjee",
]);

export const pyqWithSolutionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  category: categoryEnum,
  year: z.number().min(1900, "Year must be valid").max(new Date().getFullYear() + 1),
  questionPaperLink: z.string().url("Must be a valid URL"),
  videoSolutionLink: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  solutionDriveLink: z.string().url("Must be a valid URL"),
  bannerImage: z.string().optional().or(z.literal("")), // Made optional for edit mode
  displayOrder: z.number(),
  isActive: z.boolean().optional(), // Made optional
});

export type PyqWithSolutionFormValues = z.infer<typeof pyqWithSolutionSchema>;

export const pyqWithoutSolutionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  category: categoryEnum,
  year: z.number().min(1900, "Year must be valid").max(new Date().getFullYear() + 1),
  questionPaperLink: z.string().url("Must be a valid URL"),
  bannerImage: z.string().optional().or(z.literal("")), // Made optional for edit mode
  displayOrder: z.number(),
  isActive: z.boolean().optional(), // Made optional
});

export type PyqWithoutSolutionFormValues = z.infer<typeof pyqWithoutSolutionSchema>;
