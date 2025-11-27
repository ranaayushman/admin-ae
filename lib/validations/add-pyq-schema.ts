// lib/validation/add-pyq-schema.ts
import { z } from "zod";

export const questionTypes = [
  "SINGLE_CORRECT",
  "MULTI_CORRECT",
  "INTEGER",
  "NUMERICAL",
] as const;

export type QuestionType = (typeof questionTypes)[number];

export const roundingModes = [
  "NONE",
  "ONE_DECIMAL",
  "TWO_DECIMALS",
  "THREE_DECIMALS",
  "FLOOR",
  "CEIL",
] as const;

export type RoundingMode = (typeof roundingModes)[number];

export const addPyqSchema = z
  .object({
    subject: z.string().min(1, "Subject is required"),
    chapter: z.string().min(1, "Chapter is required"),
    difficulty: z.enum(["EASY", "MEDIUM", "HARD"], {
      message: "Difficulty is required",
    }),

    question: z.string().min(1, "Question text is required"),
    solution: z.string().min(1, "Solution is required"),

    questionType: z.enum(questionTypes, {
      message: "Question type is required",
    }),

    // For MCQ / Single Correct
    options: z
      .array(
        z.object({
          id: z.string(),
          text: z.string().min(1, "Option cannot be empty"),
          isCorrect: z.boolean(),
        })
      )
      .optional(),

    // For Integer Type
    integerAnswer: z.string().optional(),

    // For Numerical Type
    numericalAnswer: z.string().optional(),
    tolerance: z.string().optional(),
    roundingMode: z.enum(roundingModes).optional(),
  })
  .superRefine((data, ctx) => {
    const { questionType } = data;

    if (questionType === "SINGLE_CORRECT" || questionType === "MULTI_CORRECT") {
      if (!data.options || data.options.length < 2) {
        ctx.addIssue({
          path: ["options"],
          code: z.ZodIssueCode.custom,
          message: "At least 2 options are required",
        });
      }

      if (!data.options?.some((o) => o.isCorrect)) {
        ctx.addIssue({
          path: ["options"],
          code: z.ZodIssueCode.custom,
          message: "At least one correct option is required",
        });
      }

      if (questionType === "SINGLE_CORRECT") {
        const correctCount =
          data.options?.filter((o) => o.isCorrect).length ?? 0;
        if (correctCount !== 1) {
          ctx.addIssue({
            path: ["options"],
            code: z.ZodIssueCode.custom,
            message: "Exactly one option must be marked correct",
          });
        }
      }
    }

    if (questionType === "INTEGER") {
      if (!data.integerAnswer || data.integerAnswer.trim() === "") {
        ctx.addIssue({
          path: ["integerAnswer"],
          code: z.ZodIssueCode.custom,
          message: "Integer answer is required",
        });
      } else if (!/^-?\d+$/.test(data.integerAnswer.trim())) {
        ctx.addIssue({
          path: ["integerAnswer"],
          code: z.ZodIssueCode.custom,
          message: "Answer must be a valid integer",
        });
      }
    }

    if (questionType === "NUMERICAL") {
      if (!data.numericalAnswer || data.numericalAnswer.trim() === "") {
        ctx.addIssue({
          path: ["numericalAnswer"],
          code: z.ZodIssueCode.custom,
          message: "Numerical answer is required",
        });
      } else if (isNaN(Number(data.numericalAnswer))) {
        ctx.addIssue({
          path: ["numericalAnswer"],
          code: z.ZodIssueCode.custom,
          message: "Answer must be a valid number",
        });
      }

      if (!data.tolerance || data.tolerance.trim() === "") {
        ctx.addIssue({
          path: ["tolerance"],
          code: z.ZodIssueCode.custom,
          message: "Tolerance is required",
        });
      } else if (isNaN(Number(data.tolerance)) || Number(data.tolerance) < 0) {
        ctx.addIssue({
          path: ["tolerance"],
          code: z.ZodIssueCode.custom,
          message: "Tolerance must be a non-negative number",
        });
      }

      if (!data.roundingMode) {
        ctx.addIssue({
          path: ["roundingMode"],
          code: z.ZodIssueCode.custom,
          message: "Rounding mode is required",
        });
      }
    }
  });

export type AddPyqFormValues = z.infer<typeof addPyqSchema>;
