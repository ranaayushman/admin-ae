// components/add-pyq/AddPyqForm.tsx
"use client";

import { useState } from "react";
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

export function AddPyqForm() {
  const [questionType, setQuestionType] =
    useState<QuestionType>("SINGLE_CORRECT");

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
      subject: "",
      chapter: "",
      difficulty: undefined,
      question: "",
      solution: "",
      questionType: "SINGLE_CORRECT",
      options: [
        { id: crypto.randomUUID(), text: "", isCorrect: false },
        { id: crypto.randomUUID(), text: "", isCorrect: false },
      ],
    },
  });

  const questionValue = watch("question");
  const solutionValue = watch("solution");

  const onSubmit = (data: AddPyqFormValues) => {
    // Build payload – including attachments
    const payload = {
      ...data,
      questionImages: Array.from(
        (document.getElementById("questionImages") as HTMLInputElement)
          ?.files || []
      ).map((f) => ({
        name: f.name,
        size: f.size,
        type: f.type,
      })),
      solutionImages: Array.from(
        (document.getElementById("solutionImages") as HTMLInputElement)
          ?.files || []
      ).map((f) => ({
        name: f.name,
        size: f.size,
        type: f.type,
      })),
    };

    console.log("Saved Question:", payload);

    toast.success("Question saved to local question bank", {
      description: "Data logged to console. Wire API when ready.",
      position: "bottom-center",
    });

    reset({
      subject: "",
      chapter: "",
      difficulty: undefined,
      question: "",
      solution: "",
      questionType,
      options:
        questionType === "SINGLE_CORRECT" || questionType === "MULTI_CORRECT"
          ? [
              { id: crypto.randomUUID(), text: "", isCorrect: false },
              { id: crypto.randomUUID(), text: "", isCorrect: false },
            ]
          : [],
      integerAnswer: "",
      numericalAnswer: "",
      tolerance: "",
      roundingMode: undefined,
    });
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
