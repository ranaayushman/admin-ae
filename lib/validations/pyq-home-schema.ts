// lib/validations/pyq-home-schema.ts
import { z } from "zod";

// Schema for PYQ with solution
export const pyqWithSolutionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  exam: z.string().min(1, "Exam name is required"),
  year: z.number().min(2000).max(2100, "Invalid year"),
  questionPaperLink: z.string().url("Please enter a valid URL"),
  videoSolutionLink: z.string().url("Please enter a valid URL"),
  bannerImage: z.string().min(1, "Banner image is required"),
  displayOrder: z.number().min(1).default(1),
  isActive: z.boolean().default(true),
});

// Schema for PYQ without solution
export const pyqWithoutSolutionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  exam: z.string().min(1, "Exam name is required"),
  year: z.number().min(2000).max(2100, "Invalid year"),
  questionPaperLink: z.string().url("Please enter a valid URL"),
  bannerImage: z.string().min(1, "Banner image is required"),
  displayOrder: z.number().min(1).default(1),
  isActive: z.boolean().default(true),
});

// react-hook-form works with input values; Zod defaults allow undefined input.
export type PyqWithSolutionFormValues = z.input<typeof pyqWithSolutionSchema>;
export type PyqWithoutSolutionFormValues = z.input<
  typeof pyqWithoutSolutionSchema
>;
