// components/add-pyq/AddPyqForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  addPyqSchema,
  AddPyqFormValues,
  QuestionType,
} from "@/lib/validations/add-pyq-schema";
import { QuestionMetaForm } from "./QuestionMetaForm";
import { QuestionTypeSection } from "./QuestionTypeSelection";
import { TiptapEditor } from "@/components/AddQuestions/TipTapEditor";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Input } from "../ui/input";
import { questionService } from "@/lib/services/question.service";
import { CreateQuestionPayload } from "@/lib/types";

// LocalStorage keys
const STORAGE_KEY = "pyq-form-metadata";

interface SavedMetadata {
  subject: string;
  chapter: string;
  difficulty?: "easy" | "medium" | "hard";
}

export function AddPyqForm() {
  const [questionType, setQuestionType] =
    useState<QuestionType>("SINGLE_CORRECT");

  // Load saved metadata from localStorage
  const loadSavedMetadata = (): SavedMetadata => {
    if (typeof window === "undefined") return { subject: "", chapter: "" };
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : { subject: "", chapter: "" };
    } catch {
      return { subject: "", chapter: "" };
    }
  };

  const savedMetadata = loadSavedMetadata();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<AddPyqFormValues>({
    resolver: zodResolver(addPyqSchema),
    defaultValues: {
      subject: savedMetadata.subject || "",
      chapter: savedMetadata.chapter || "",
      difficulty: savedMetadata.difficulty || undefined,
      question: "",
      solution: "",
      questionType: "SINGLE_CORRECT",
      options: [
        { id: crypto.randomUUID(), text: "", isCorrect: false },
        { id: crypto.randomUUID(), text: "", isCorrect: false },
        { id: crypto.randomUUID(), text: "", isCorrect: false },
        { id: crypto.randomUUID(), text: "", isCorrect: false },
      ],
    },
    mode: "onBlur", // Validate on blur for better UX
  });

  const questionValue = watch("question");
  const solutionValue = watch("solution");
  const subject = watch("subject");
  const chapter = watch("chapter");
  const difficulty = watch("difficulty");

  // Save metadata to localStorage whenever it changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const metadata: SavedMetadata = {
        subject: subject || "",
        chapter: chapter || "",
        difficulty: difficulty as "easy" | "medium" | "hard" | undefined,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(metadata));
    } catch (error) {
      console.error("Failed to save metadata to localStorage:", error);
    }
  }, [subject, chapter, difficulty]);

  const onSubmit = async (data: AddPyqFormValues) => {
    try {
      // Map form data to API payload format
      let correctAnswer = "";
      let optionsArray: string[] = [];

      if (data.questionType === "SINGLE_CORRECT" || data.questionType === "MULTI_CORRECT") {
        // For MCQ questions
        optionsArray = data.options?.map((opt) => opt.text) || [];
        
        if (data.questionType === "SINGLE_CORRECT") {
          // Find the index of the correct option (A, B, C, D...)
          const correctIndex = data.options?.findIndex((opt) => opt.isCorrect);
          correctAnswer = correctIndex !== undefined && correctIndex !== -1 
            ? String.fromCharCode(65 + correctIndex) // 65 is 'A'
            : "A";
        } else {
          // For multi-correct, send comma-separated indices
          const correctIndices = data.options
            ?.map((opt, idx) => (opt.isCorrect ? String.fromCharCode(65 + idx) : null))
            .filter((v) => v !== null);
          correctAnswer = correctIndices?.join(",") || "A";
        }
      } else if (data.questionType === "INTEGER") {
        correctAnswer = data.integerAnswer || "0";
        optionsArray = [];
      } else if (data.questionType === "NUMERICAL") {
        correctAnswer = data.numericalAnswer || "0";
        optionsArray = [];
      }

      const payload: CreateQuestionPayload = {
        category: data.subject, // Form now sends correct lowercase values
        chapter: data.chapter,
        topic: data.chapter, // Using chapter as topic for now
        questionText: data.question,
        options: optionsArray,
        correctAnswer,
        solutionText: data.solution,
        questionImageBase64: null, // TODO: Handle image uploads
        solutionImageBase64: null, // TODO: Handle image uploads
        difficulty: data.difficulty as any, // Form now sends lowercase
        metadata: {
          marks: 4, // Default marks, can be made configurable
          year: new Date().getFullYear(),
        },
      };

      console.log("📤 Sending question to API:", payload);

      // Call the API
      const createdQuestion = await questionService.createQuestion(payload);

      console.log("✅ Question created successfully:", createdQuestion);

      toast.success("Question saved to question bank successfully!", {
        description: `Question ID: ${createdQuestion._id}`,
        position: "bottom-center",
      });

      // Reset form after successful submission, but keep metadata
      reset({
        subject: subject || "",
        chapter: chapter || "",
        difficulty: difficulty as any,
        question: "",
        solution: "",
        questionType,
        options:
          questionType === "SINGLE_CORRECT" || questionType === "MULTI_CORRECT"
            ? [
                { id: crypto.randomUUID(), text: "", isCorrect: false },
                { id: crypto.randomUUID(), text: "", isCorrect: false },
                { id: crypto.randomUUID(), text: "", isCorrect: false },
                { id: crypto.randomUUID(), text: "", isCorrect: false },
              ]
            : [],
        integerAnswer: "",
        numericalAnswer: "",
        tolerance: "",
        roundingMode: undefined,
      });
    } catch (error: any) {
      console.error("❌ Error creating question:", error);
      
      toast.error("Failed to save question", {
        description: error?.message || "Please try again or check the console for details.",
        position: "bottom-center",
      });
    }
  };

  const onError = () => {
    toast.error("Please fix the validation errors before saving", {
      position: "bottom-center",
    });
  };

  return (
    <Card className="max-w-5xl mx-auto">
      <CardHeader>
        <CardTitle>Add PYQ – JEE / NEET Question</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
          {/* Meta */}
          <section className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">
              Question Metadata
            </h3>
            <QuestionMetaForm
              register={register}
              control={control}
              errors={errors}
            />
          </section>

          <Separator />

          {/* Question + images */}

          <section className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">
              Question
            </h3>
            <TiptapEditor
              id="question"
              label="Question Text"
              description="Supports formatted text, math formulas (via LaTeX inside math blocks), and basic rich content."
              value={questionValue}
              onChange={(val) =>
                setValue("question", val, { shouldValidate: true })
              }
              error={errors.question?.message}
            />

            <div className="space-y-1.5">
              <Label htmlFor="questionImages">
                Attach diagrams / images (optional)
              </Label>
              <Input
                id="questionImages"
                type="file"
                multiple
                accept="image/*"
              />
              <p className="text-xs text-muted-foreground">
                You can upload circuit diagrams, graphs, figures etc.
              </p>
            </div>
          </section>

          <Separator />

          {/* Answer type */}
          <section className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">
              Answer Configuration
            </h3>
            <QuestionTypeSection
              control={control}
              register={register}
              questionType={questionType}
              setQuestionType={(t) => {
                setQuestionType(t);
                setValue("questionType", t, { shouldValidate: true });
              }}
              errors={errors}
            />
          </section>

          <Separator />

          {/* Solution */}
          <section className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">
              Solution
            </h3>
            <TiptapEditor
              id="solution"
              label="Solution Explanation"
              description="Write a step-by-step solution with rendered formulas. Double-click formulas to edit LaTeX."
              value={solutionValue}
              onChange={(val) =>
                setValue("solution", val, { shouldValidate: true })
              }
              error={errors.solution?.message}
            />

            <div className="space-y-1.5">
              <Label htmlFor="solutionImages">
                Attach images in solution (optional)
              </Label>
              <Input
                id="solutionImages"
                type="file"
                multiple
                accept="image/*"
              />
              <p className="text-xs text-muted-foreground">
                Add solution diagrams, graphs, or handwritten steps as images.
              </p>
            </div>
          </section>

          <Separator />

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => reset()}>
              Reset
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Question to Question Bank"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function Label({
  htmlFor,
  children,
}: {
  htmlFor?: string;
  children: React.ReactNode;
}) {
  // inline shim to avoid extra import; replace with shadcn Label if you want
  return (
    <label
      htmlFor={htmlFor}
      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
    >
      {children}
    </label>
  );
}
