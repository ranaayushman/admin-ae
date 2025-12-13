// lib/validations/test-series-schema.ts
import { z } from "zod";

export const testPackages = [
  "JEE_MAIN",
  "JEE_ADVANCED",
  "NEET",
  "BOARD_10",
  "BOARD_12",
  "WBJEE",
  "CUSTOM",
] as const;

export type TestPackage = (typeof testPackages)[number];

export const testSeriesSchema = z.object({
  name: z.string().min(1, "Test series name is required"),
  description: z.string().min(1, "Description is required"),
  testPackage: z.enum(testPackages, {
    message: "Please select a test package",
  }),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  totalMarks: z.number().min(1, "Total marks must be at least 1"),
  instructions: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isActive: z.boolean().default(true),
  isFree: z.boolean().default(false),
  price: z.number().min(0).optional(),
  questions: z.array(
    z.object({
      questionId: z.string(),
      order: z.number(),
      marks: z.number().min(0),
      negativeMarks: z.number().min(0),
    })
  ).min(1, "At least one question is required"),
});

export type TestSeriesFormValues = z.infer<typeof testSeriesSchema>;
