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

// Question Selection Mode & Delivery Policy Enums
export const QUESTION_SELECTION_MODES = ["random", "selected", "mixed"] as const;
export const QUESTION_DELIVERY_POLICIES = ["fixed-per-user", "fresh-each-attempt"] as const;

export type QuestionSelectionMode = (typeof QUESTION_SELECTION_MODES)[number];
export type QuestionDeliveryPolicy = (typeof QUESTION_DELIVERY_POLICIES)[number];

// Base schema for all test series
const baseTestSeriesSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.enum(["neet", "jee-main", "jee-advanced", "boards", "wbjee", "custom"]),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  marksPerQuestion: z.number().min(1, "Marks per question must be at least 1"),
  negativeMarking: z.number().optional().default(-1),
  status: z.enum(["draft", "published"]).default("draft"),
  type: z.enum(["mock", "practice", "previous_year"]).default("mock"),
  shuffleQuestions: z.boolean().default(true),
  useExamPattern: z.boolean().default(false),
  difficulty: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  // New: Question selection and delivery
  questionSelectionMode: z.enum(QUESTION_SELECTION_MODES).default("random"),
  questionDeliveryPolicy: z.enum(QUESTION_DELIVERY_POLICIES).default("fixed-per-user"),
  questionsPerUser: z.number().min(1).optional(),
  selectedQuestionIds: z.array(z.string()).optional().default([]),
  ensureSubjectDistribution: z.boolean().optional().default(false),
  subjectQuestionCounts: z.record(z.string(), z.number()).optional(),
});

// Validation with mode-specific requirements
export const testSeriesSchema = baseTestSeriesSchema.superRefine((data, ctx) => {
  const mode = data.questionSelectionMode;

  // Mode-specific validations
  if (mode === "selected") {
    // selected mode: selectedQuestionIds must be provided and not empty
    if (!data.selectedQuestionIds || data.selectedQuestionIds.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["selectedQuestionIds"],
        message: "At least one question must be selected for 'Selected' mode",
      });
    }
  } else if (mode === "mixed") {
    // mixed mode: both selectedQuestionIds and questionsPerUser must be provided
    if (!data.selectedQuestionIds || data.selectedQuestionIds.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["selectedQuestionIds"],
        message: "Selected questions are required for 'Mixed' mode",
      });
    }
    if (!data.questionsPerUser || data.questionsPerUser <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["questionsPerUser"],
        message: "Total questions per user must be greater than selected questions count",
      });
    }
    // Ensure questionsPerUser > selectedQuestionIds.length
    if (
      data.questionsPerUser &&
      data.selectedQuestionIds &&
      data.questionsPerUser <= data.selectedQuestionIds.length
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["questionsPerUser"],
        message: `Total questions per user (${data.questionsPerUser}) must be greater than selected questions (${data.selectedQuestionIds.length})`,
      });
    }
  } else if (mode === "random") {
    // random mode: questionsPerUser must be provided
    if (!data.questionsPerUser || data.questionsPerUser <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["questionsPerUser"],
        message: "Number of questions per user is required for 'Random' mode",
      });
    }
  }
});

export type TestSeriesFormValues = z.infer<typeof testSeriesSchema>;

// Legacy schema for backward compatibility
export const testPackagesLegacy = testPackages;
export const testSeriesSchemaLegacy = z.object({
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

export type TestSeriesFormValuesLegacy = z.infer<typeof testSeriesSchemaLegacy>;
