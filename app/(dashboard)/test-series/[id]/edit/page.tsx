"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { ArrowLeft, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { testSeriesSchema, type TestSeriesFormValues, type QuestionSelectionMode } from "@/lib/validations/test-series-schema";
import { testService } from "@/lib/services/test.service";
import { type Question } from "@/lib/types";

// Subject mapping by category
const SUBJECTS_BY_CATEGORY: Record<string, string[]> = {
  "jee-main": ["Physics", "Chemistry", "Mathematics"],
  "jee-advanced": ["Physics", "Chemistry", "Mathematics"],
  "neet": ["Physics", "Chemistry", "Botany", "Zoology"],
  "wbjee": ["Physics", "Chemistry", "Mathematics"],
  "boards": ["Physics", "Chemistry", "Mathematics", "Biology"],
};

interface SelectedQuestion extends Question {
  _serialNumber?: number;
}

function getSubjectsForCategory(category: string): string[] {
  return SUBJECTS_BY_CATEGORY[category] || [];
}

export default function EditTestSeriesPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params.id as string;

  const [selectedQuestions, setSelectedQuestions] = useState<SelectedQuestion[]>([]);
  const [showQuestionSelector, setShowQuestionSelector] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
    reset,
  } = useForm<TestSeriesFormValues>({
    resolver: zodResolver(testSeriesSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      category: "",
      duration: 180,
      marksPerQuestion: 4,
      negativeMarking: -1 as any,
      status: "draft",
      type: "mock",
      shuffleQuestions: false,
      questionSelectionMode: "random",
      questionDeliveryPolicy: "fixed-per-user",
      questionsPerUser: 100,
      ensureSubjectDistribution: false,
      subjectQuestionCounts: {} as any,
      selectedQuestionIds: [],
    } as any,
  });

  const selectionMode = watch("questionSelectionMode");
  const deliveryPolicy = watch("questionDeliveryPolicy");
  const questionsPerUser = watch("questionsPerUser");
  const ensureSubjectDistribution = watch("ensureSubjectDistribution");
  const category = watch("category");

  // Load test data on mount
  useEffect(() => {
    const fetchTestDetails = async () => {
      if (!testId) return;
      try {
        const test = await testService.getTestByIdAdmin(testId);

        reset({
          title: test.title,
          description: test.description ?? "",
          category: test.category,
          duration: test.duration,
          marksPerQuestion: test.marksPerQuestion,
          negativeMarking: test.negativeMarking,
          status: test.status,
          type: test.type as "mock" | "practice" | "sample",
          shuffleQuestions: test.shuffleQuestions,
          questionSelectionMode: (test.questionSelectionMode as QuestionSelectionMode) || "random",
          questionDeliveryPolicy: test.questionDeliveryPolicy || "fixed-per-user",
          questionsPerUser: test.questionsPerUser || 100,
          ensureSubjectDistribution: test.ensureSubjectDistribution ?? false,
          subjectQuestionCounts: test.subjectQuestionCounts || {},
          selectedQuestionIds: test.selectedQuestionIds || [],
        } as any);

        // Load questions if available
        if (test.questions && test.questions.length > 0) {
          const hydrated = test.questions.map((q, i) => ({
            ...q,
            _id: q.id,
            _serialNumber: i + 1,
          }));
          setSelectedQuestions(hydrated as any);
        }
      } catch (error: unknown) {
        toast.error("Failed to load test details", {
          description: error instanceof Error ? error.message : "Unknown error",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchTestDetails();
  }, [testId, reset]);

  const modeInfo = useMemo(() => {
    const modes: Record<QuestionSelectionMode, { title: string; description: string }> = {
      random: {
        title: "Random Selection",
        description: "Automatically select questions randomly from the bank. Optionally enforce subject distribution.",
      },
      selected: {
        title: "Manual Selection",
        description: "Manually choose specific questions. Same questions delivered to each user.",
      },
      mixed: {
        title: "Mixed Selection",
        description: "Combine manual selection with random questions. Fixed questions + random questions from bank.",
      },
    };
    return modes[selectionMode as QuestionSelectionMode];
  }, [selectionMode]);

  const handleAddQuestion = (question: Question) => {
    if (!selectedQuestions.find((q) => q._id === question._id)) {
      setSelectedQuestions([...selectedQuestions, { ...question, _serialNumber: selectedQuestions.length + 1 }]);
      setValue("selectedQuestionIds", [...(watch("selectedQuestionIds") || []), question._id]);
    }
  };

  const handleRemoveQuestion = (questionId: string) => {
    const updated = selectedQuestions.filter((q) => q._id !== questionId);
    setSelectedQuestions(updated.map((q, idx) => ({ ...q, _serialNumber: idx + 1 })));
    setValue(
      "selectedQuestionIds",
      updated.map((q) => q._id)
    );
  };

  const onSubmit = async (data: TestSeriesFormValues | any) => {
    setSubmitError(null);
    try {
      // Mode-specific validation
      if (selectionMode === "random" && !questionsPerUser) {
        setSubmitError("Questions per user is required for random mode");
        return;
      }
      if (selectionMode === "selected" && selectedQuestions.length === 0) {
        setSubmitError("Please select at least one question for selected mode");
        return;
      }
      if (selectionMode === "mixed") {
        if (selectedQuestions.length === 0) {
          setSubmitError("Please select at least one question for mixed mode");
          return;
        }
        if (!questionsPerUser || questionsPerUser <= selectedQuestions.length) {
          setSubmitError("Total questions must be greater than selected questions in mixed mode");
          return;
        }
      }

      // Build payload based on mode
      const selectedQuestionIds = selectedQuestions.map((q) => q._id);

      const payload: any = {
        title: data.title,
        description: data.description,
        category: data.category,
        duration: Number(data.duration),
        marksPerQuestion: Number(data.marksPerQuestion),
        negativeMarking: Number(data.negativeMarking),
        status: data.status,
        type: data.type,
        shuffleQuestions: data.shuffleQuestions,
        questionSelectionMode: selectionMode,
        questionDeliveryPolicy: deliveryPolicy,
        questions: selectionMode === "random" ? [] : selectedQuestionIds,
      };

      if (selectionMode === "random") {
        payload.questionsPerUser = Number(questionsPerUser);
        payload.selectedQuestionIds = [];
        if (ensureSubjectDistribution) {
          payload.ensureSubjectDistribution = true;
          payload.subjectQuestionCounts = data.subjectQuestionCounts || {};
        }
      } else if (selectionMode === "selected") {
        payload.selectedQuestionIds = selectedQuestionIds;
      } else if (selectionMode === "mixed") {
        payload.questionsPerUser = Number(questionsPerUser);
        payload.selectedQuestionIds = selectedQuestionIds;
        if (ensureSubjectDistribution) {
          payload.ensureSubjectDistribution = true;
          payload.subjectQuestionCounts = data.subjectQuestionCounts || {};
        }
      }

      await testService.updateTestAdmin(testId, payload);
      toast.success("Test updated successfully!");
      router.push("/test-series");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update test";
      setSubmitError(message);
      toast.error("Failed to update test", { description: message });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/test-series">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Test Series</h1>
            <p className="text-gray-500 mt-1">Update test details and settings</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Details Card */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Basic Details</h2>
            <div className="space-y-4">
              <div>
                <Label>Title *</Label>
                <Input {...register("title")} placeholder="e.g. JEE Main Test 1" />
                {errors.title && <p className="text-red-600 text-sm">{errors.title.message}</p>}
              </div>

              <div>
                <Label>Description</Label>
                <Input {...register("description")} placeholder="Test description" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Category *</Label>
                  <Select onValueChange={(v) => setValue("category", v as any)} defaultValue={watch("category") || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jee-main">JEE Main</SelectItem>
                      <SelectItem value="jee-advanced">JEE Advanced</SelectItem>
                      <SelectItem value="neet">NEET</SelectItem>
                      <SelectItem value="wbjee">WBJEE</SelectItem>
                      <SelectItem value="boards">Boards</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-red-600 text-sm">{errors.category.message}</p>}
                </div>

                <div>
                  <Label>Duration (minutes) *</Label>
                  <Input {...register("duration", { valueAsNumber: true })} type="number" min="1" />
                  {errors.duration && <p className="text-red-600 text-sm">{errors.duration.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Marks Per Question *</Label>
                  <Input {...register("marksPerQuestion", { valueAsNumber: true })} type="number" min="1" />
                </div>

                <div>
                  <Label>Negative Marking</Label>
                  <Input {...register("negativeMarking", { valueAsNumber: true })} type="number" step="0.25" />
                </div>

                <div>
                  <Label>Status</Label>
                  <Select onValueChange={(v) => setValue("status", v as any)} defaultValue={watch("status") || "draft"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <Select onValueChange={(v) => setValue("type", v as any)} defaultValue={watch("type") || "mock"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mock">Mock Test</SelectItem>
                      <SelectItem value="practice">Practice</SelectItem>
                      <SelectItem value="sample">Sample Paper</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2 mt-7">
                  <Checkbox {...register("shuffleQuestions")} id="shuffle" />
                  <Label htmlFor="shuffle" className="font-normal cursor-pointer">
                    Shuffle Questions
                  </Label>
                </div>
              </div>
            </div>
          </Card>

          {/* Question Selection Mode & Delivery Policy Card */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Question Selection & Delivery</h2>

            <div className="space-y-4">
              {/* Mode Selection */}
              <div>
                <Label>Question Selection Mode *</Label>
                <div className="mt-2 space-y-2">
                  {(["random", "selected", "mixed"] as const).map((mode) => (
                    <div key={mode} className="flex items-center gap-2">
                      <Checkbox
                        checked={selectionMode === mode}
                        onCheckedChange={() => setValue("questionSelectionMode", mode)}
                        id={`mode-${mode}`}
                      />
                      <label htmlFor={`mode-${mode}`} className="flex-1 cursor-pointer">
                        <div className="font-medium capitalize">{mode.replace("-", " ")} Mode</div>
                        {selectionMode === mode && (
                          <p className="text-xs text-gray-600">{modeInfo?.description}</p>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Policy */}
              <div>
                <Label>Delivery Policy *</Label>
                <Select value={deliveryPolicy} onValueChange={(v) => setValue("questionDeliveryPolicy", v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed-per-user">Fixed Per User</SelectItem>
                    <SelectItem value="fresh-each-attempt">Fresh Each Attempt</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-600 mt-2">
                  {deliveryPolicy === "fixed-per-user"
                    ? "Each user gets the same set of questions for all attempts."
                    : "Each attempt gets a fresh set of randomly selected questions."}
                </p>
              </div>

              {/* Questions Per User - Show for Random/Mixed */}
              {(selectionMode === "random" || selectionMode === "mixed") && (
                <div>
                  <Label>Questions Per User *</Label>
                  <Input
                    {...register("questionsPerUser", { valueAsNumber: true })}
                    type="number"
                    min="1"
                    placeholder="e.g. 150"
                  />
                  {errors.questionsPerUser && (
                    <p className="text-red-600 text-sm">{errors.questionsPerUser.message}</p>
                  )}
                </div>
              )}

              {/* Subject Distribution - Show for Random/Mixed */}
              {(selectionMode === "random" || selectionMode === "mixed") && (
                <div className="border rounded-lg p-4 bg-blue-50">
                  <div className="flex items-center gap-2 mb-3">
                    <Checkbox
                      {...register("ensureSubjectDistribution")}
                      id="subjectDist"
                    />
                    <Label htmlFor="subjectDist" className="font-medium cursor-pointer">
                      Ensure Subject Distribution
                    </Label>
                  </div>

                  {ensureSubjectDistribution && category && (
                    <div className="grid grid-cols-2 gap-3">
                      {getSubjectsForCategory(category).map((subject) => (
                        <div key={subject}>
                          <Label className="text-xs">{subject}</Label>
                          <Input
                            {...register(`subjectQuestionCounts.${subject}`, { valueAsNumber: true })}
                            type="number"
                            min="0"
                            placeholder="0"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Questions Section Card - Show for Selected/Mixed */}
          {(selectionMode === "selected" || selectionMode === "mixed") && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Questions</h2>

              {selectionMode === "selected" || selectionMode === "mixed" ? (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600">
                    {selectionMode === "mixed"
                      ? `Selected: ${selectedQuestions.length} / ${questionsPerUser || 100} total (${(questionsPerUser || 100) - selectedQuestions.length} will be randomly added)`
                      : `Selected: ${selectedQuestions.length} questions`}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowQuestionSelector(true)}
                  >
                    + Add Questions
                  </Button>

                  {selectedQuestions.length > 0 && (
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-100 px-4 py-3 flex gap-4 text-sm font-medium text-gray-700">
                        <div className="w-8">#</div>
                        <div className="flex-1">Question</div>
                        <div className="action">Action</div>
                      </div>
                      <div className="divide-y">
                        {selectedQuestions.map((q, idx) => (
                          <div key={q._id} className="px-4 py-3 flex gap-4 items-center text-sm">
                            <div className="w-8 text-gray-600">{idx + 1}</div>
                            <div className="flex-1 text-gray-900">
                              {q.questionText?.substring(0, 60)}...
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveQuestion(q._id)}
                              className="text-red-600"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-600 text-sm">No selection for random mode</p>
              )}
            </Card>
          )}

          {/* Error Display */}
          {submitError && (
            <Card className="p-4 border-red-300 bg-red-50">
              <p className="text-red-800 text-sm">{submitError}</p>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Link href="/test-series">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" className="flex items-center gap-2">
              <Loader2 className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
