// components/add-pyq/AddPyqForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
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
import { X } from "lucide-react";

// LocalStorage keys
const STORAGE_KEY = "pyq-form-metadata";

interface SavedMetadata {
  subject: string;
  chapter: string;
  topic: string;
  difficulty?: "easy" | "medium" | "hard";
}

export function AddPyqForm() {
  const [questionType, setQuestionType] =
    useState<QuestionType>("SINGLE_CORRECT");

  const [questionImageBase64, setQuestionImageBase64] = useState<string | null>(null);
  const [solutionImageBase64, setSolutionImageBase64] = useState<string | null>(null);

  // Load saved metadata from localStorage
  const loadSavedMetadata = (): SavedMetadata => {
    if (typeof window === "undefined") return { subject: "", chapter: "", topic: "" };
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : { subject: "", chapter: "", topic: "" };
    } catch {
      return { subject: "", chapter: "", topic: "" };
    }
  };

  const savedMetadata = loadSavedMetadata();

  const methods = useForm<AddPyqFormValues>({
    resolver: zodResolver(addPyqSchema),
    defaultValues: {
      subject: savedMetadata.subject || "",
      chapter: savedMetadata.chapter || "",
      topic: savedMetadata.topic || "",
      difficulty: savedMetadata.difficulty || undefined,
      question: "",
      solution: "",
      questionType: "SINGLE_CORRECT",
      options: [
        { id: crypto.randomUUID(), text: "", isCorrect: false, imageBase64: "" },
        { id: crypto.randomUUID(), text: "", isCorrect: false, imageBase64: "" },
        { id: crypto.randomUUID(), text: "", isCorrect: false, imageBase64: "" },
        { id: crypto.randomUUID(), text: "", isCorrect: false, imageBase64: "" },
      ],
    },
    mode: "onBlur",
  });

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = methods;

  const questionValue = watch("question");
  const solutionValue = watch("solution");
  const subject = watch("subject");
  const chapter = watch("chapter");
  const topic = watch("topic");
  const difficulty = watch("difficulty");

  // Save metadata to localStorage whenever it changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const metadata: SavedMetadata = {
        subject: subject || "",
        chapter: chapter || "",
        topic: topic || "",
        difficulty: difficulty as "easy" | "medium" | "hard" | undefined,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(metadata));
    } catch (error) {
      console.error("Failed to save metadata to localStorage:", error);
    }
  }, [subject, chapter, topic, difficulty]);

  // Handle file select for question / solution
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setter(null);
      // Reset input value if empty
      e.target.value = "";
    }
  };

  const onSubmit = async (data: AddPyqFormValues) =>
    {
    try {
      // Map form data to API payload format
      let correctAnswer = "";
      let optionsArray: { text: string; imageBase64?: string }[] = [];

      if (data.questionType === "SINGLE_CORRECT" || data.questionType === "MULTI_CORRECT") {
        // For MCQ questions - map to { text, imageBase64 } format expected by backend
        optionsArray = data.options?.map((opt) => ({
          text: opt.text,
          ...(opt.imageBase64 ? { imageBase64: opt.imageBase64 } : {})
        })) || [];

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

      const typeMap: Record<string, string> = {
        SINGLE_CORRECT: "single-correct",
        MULTI_CORRECT: "multi-correct",
        INTEGER: "integer",
        NUMERICAL: "numerical",
      };

      const payload: CreateQuestionPayload = {
        category: data.subject, // Form now sends correct lowercase values
        chapter: data.chapter,
        topic: data.topic,
        questionType: typeMap[data.questionType] as any,
        questionText: data.question,
        options: optionsArray,
        correctAnswer,
        solutionText: data.solution,
        questionImageBase64: questionImageBase64,
        solutionImageBase64: solutionImageBase64,
        difficulty: data.difficulty as any, // Form now sends lowercase
        metadata: {
          marks: 4, // Default marks, can be made configurable
          year: new Date().getFullYear(),
        },
      };
      // Call the API
      const createdQuestion = await questionService.createQuestion(payload);
      toast.success("Question saved to question bank successfully!", {
        description: `Question ID: ${createdQuestion._id}`,
        position: "bottom-center",
      });

      // Reset form after successful submission, but keep metadata
      reset({
        subject: subject || "",
        chapter: chapter || "",
        topic: topic || "",
        difficulty: difficulty as any,
        question: "",
        solution: "",
        questionType,
        options:
          questionType === "SINGLE_CORRECT" || questionType === "MULTI_CORRECT"
            ? [
              { id: crypto.randomUUID(), text: "", isCorrect: false, imageBase64: "" },
              { id: crypto.randomUUID(), text: "", isCorrect: false, imageBase64: "" },
              { id: crypto.randomUUID(), text: "", isCorrect: false, imageBase64: "" },
              { id: crypto.randomUUID(), text: "", isCorrect: false, imageBase64: "" },
            ]
            : [],
        integerAnswer: "",
        numericalAnswer: "",
        tolerance: "",
        roundingMode: undefined,
      });
      setQuestionImageBase64(null);
      setSolutionImageBase64(null);
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
        <FormProvider {...methods}>
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
                Attach diagram / image (optional)
              </Label>
              <Input
                id="questionImages"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, setQuestionImageBase64)}
              />
              <p className="text-xs text-muted-foreground">
                You can upload a circuit diagram, graph, figure etc.
              </p>
              {questionImageBase64 && (
                <div className="relative inline-block mt-2">
                  <img src={questionImageBase64} alt="Question Diagram" className="h-20 rounded border bg-white" />
                  <button type="button" onClick={() => setQuestionImageBase64(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-80 hover:opacity-100 flex items-center justify-center">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
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
                Attach image in solution (optional)
              </Label>
              <Input
                id="solutionImages"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, setSolutionImageBase64)}
              />
              <p className="text-xs text-muted-foreground">
                Add a solution diagram, graph, or handwritten steps as an image.
              </p>
              {solutionImageBase64 && (
                <div className="relative inline-block mt-2">
                  <img src={solutionImageBase64} alt="Solution Diagram" className="h-20 rounded border bg-white" />
                  <button type="button" onClick={() => setSolutionImageBase64(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-80 hover:opacity-100 flex items-center justify-center">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
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
        </FormProvider>
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
