// app/(dashboard)/test-series/create/page.tsx
"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { QuestionSelector } from "@/components/TestSeries/QuestionSelector";
import { Question } from "@/lib/types";
import { testService } from "@/lib/services/test.service";
import { toast } from "sonner";
import { Plus, Trash2, GripVertical, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import { QuestionRenderer } from "@/components/QuestionRenderer";
import {
  testSeriesSchema,
  type TestSeriesFormValues,
  type QuestionSelectionMode,
  type QuestionDeliveryPolicy,
} from "@/lib/validations/test-series-schema";

interface SelectedQuestion extends Question {
  order: number;
}

// Helper function to get subjects for a category
function getSubjectsForCategory(category: string): string[] {
  const subjectsByCategory: Record<string, string[]> = {
    "jee-main": ["Physics", "Chemistry", "Mathematics"],
    "jee-advanced": ["Physics", "Chemistry", "Mathematics"],
    neet: ["Physics", "Chemistry", "Botany", "Zoology"],
    wbjee: ["Physics", "Chemistry", "Mathematics"],
    boards: ["Physics", "Chemistry", "Mathematics", "Biology", "English", "Hindi"],
    custom: ["Subject 1", "Subject 2", "Subject 3"],
  };

  return subjectsByCategory[category] || ["Subject 1", "Subject 2", "Subject 3"];
}

export default function CreateTestSeriesPage() {
  const router = useRouter();
  const [selectedQuestions, setSelectedQuestions] = useState<SelectedQuestion[]>([]);
  const [showQuestionSelector, setShowQuestionSelector] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TestSeriesFormValues>({
    resolver: zodResolver(testSeriesSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      category: "jee-main",
      duration: 180,
      marksPerQuestion: 4,
      negativeMarking: -1 as any,
      status: "draft",
      type: "mock",
      shuffleQuestions: true,
      useExamPattern: false,
      difficulty: "",
      questionSelectionMode: "random",
      questionDeliveryPolicy: "fixed-per-user",
      questionsPerUser: 100,
      selectedQuestionIds: [],
      ensureSubjectDistribution: false,
      subjectQuestionCounts: {},
    } as any,
  });

  const selectionMode = watch("questionSelectionMode");
  const deliveryPolicy = watch("questionDeliveryPolicy");
  const questionsPerUser = watch("questionsPerUser");
  const ensureSubjectDistribution = watch("ensureSubjectDistribution");

  const handleAddQuestion = (question: Question) => {
    const newQuestion: SelectedQuestion = {
      ...question,
      order: selectedQuestions.length + 1,
    };

    const updated = [...selectedQuestions, newQuestion];
    setSelectedQuestions(updated);
    setValue("selectedQuestionIds", updated.map((q) => q._id));

    toast.success("Question added to test");
  };

  const handleRemoveQuestion = (index: number) => {
    const updated = selectedQuestions
      .filter((_, i) => i !== index)
      .map((q, i) => ({ ...q, order: i + 1 }));

    setSelectedQuestions(updated);
    setValue("selectedQuestionIds", updated.map((q) => q._id));
  };

  // Mode-specific validation messages
  const modeInfo = useMemo(() => {
    switch (selectionMode) {
      case "random":
        return {
          title: "Random Mode",
          description:
            "Questions are randomly selected from the question bank for each user",
          requiresSelected: false,
        };
      case "selected":
        return {
          title: "Selected Mode",
          description: "Use only the questions you manually select below",
          requiresSelected: true,
        };
      case "mixed":
        return {
          title: "Mixed Mode",
          description:
            "Use selected questions as fixed part, fill remainder with random questions",
          requiresSelected: true,
        };
      default:
        return {
          title: "Mode",
          description: "",
          requiresSelected: false,
        };
    }
  }, [selectionMode]);

  const onSubmit = async (data: TestSeriesFormValues | any) => {
    setSubmitError(null);

    // Mode-specific validation
    if (data.questionSelectionMode === "selected") {
      if (!selectedQuestions || selectedQuestions.length === 0) {
        setSubmitError("Please add at least one question for 'Selected' mode");
        toast.error("Validation Error", {
          description: "Please add at least one question",
        });
        return;
      }
    } else if (data.questionSelectionMode === "mixed") {
      if (!selectedQuestions || selectedQuestions.length === 0) {
        setSubmitError("Please add selected questions for 'Mixed' mode");
        toast.error("Validation Error", {
          description: "Please add selected questions for mixed mode",
        });
        return;
      }
      if (
        !data.questionsPerUser ||
        data.questionsPerUser <= selectedQuestions.length
      ) {
        setSubmitError(
          `Total questions per user must be greater than selected questions (${selectedQuestions.length})`
        );
        toast.error("Validation Error", {
          description: `Total questions per user must be > ${selectedQuestions.length}`,
        });
        return;
      }
    }

    try {
      const payload: Record<string, unknown> = {
        title: data.title,
        description: data.description,
        category: data.category,
        duration: data.duration,
        marksPerQuestion: data.marksPerQuestion,
        negativeMarking: data.negativeMarking,
        status: data.status,
        type: data.type,
        shuffleQuestions: data.shuffleQuestions,
        useExamPattern: data.useExamPattern,
        difficulty: data.difficulty || undefined,
        startDate: data.startDate || undefined,
        endDate: data.endDate || undefined,
        // New: Mode and delivery policy
        questionSelectionMode: data.questionSelectionMode,
        questionDeliveryPolicy: data.questionDeliveryPolicy,
        questionsPerUser:
          data.questionSelectionMode === "random"
            ? data.questionsPerUser
            : data.questionSelectionMode === "mixed"
            ? data.questionsPerUser
            : undefined,
        selectedQuestionIds:
          data.questionSelectionMode === "selected" ||
          data.questionSelectionMode === "mixed"
            ? selectedQuestions.map((q) => q._id)
            : undefined,
        ensureSubjectDistribution: data.ensureSubjectDistribution,
        subjectQuestionCounts: data.subjectQuestionCounts || undefined,
        // Traditional: questions array
        questions:
          data.questionSelectionMode === "selected"
            ? selectedQuestions.map((q) => q._id)
            : undefined,
      };

      const result = await testService.createTest(payload as any);

      toast.success("Test created successfully!", {
        description: `Test ID: ${result?._id || (result as any)?.id || "Successfully created"}`,
      });

      // Reset and navigate
      reset();
      setSelectedQuestions([]);
      router.push("/test-series");
    } catch (error: any) {
      const errorMsg = error.message || "Failed to create test";
      setSubmitError(errorMsg);
      toast.error("Failed to create test", {
        description: errorMsg,
      });
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Test</h1>
            <p className="text-gray-500 mt-1">
              Build a new test with flexible question selection modes
            </p>
          </div>
          <Link href="/test-series">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Tests
            </Button>
          </Link>
        </div>

        {submitError && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="flex items-start gap-3 pt-6">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">{submitError}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Details */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Details</CardTitle>
              <CardDescription>
                Enter the basic information for this test
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Test Title *</Label>
                  <Input
                    id="title"
                    placeholder="JEE Main Mock Test 12"
                    {...register("title")}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    onValueChange={(value) =>
                      setValue("category", value as any)
                    }
                    defaultValue={watch("category")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="neet">NEET</SelectItem>
                      <SelectItem value="jee-main">JEE Main</SelectItem>
                      <SelectItem value="jee-advanced">JEE Advanced</SelectItem>
                      <SelectItem value="boards">Boards</SelectItem>
                      <SelectItem value="wbjee">WBJEE</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-red-600">
                      {errors.category.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <textarea
                  id="description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Comprehensive physics mock test covering all chapters..."
                  {...register("description")}
                />
                {errors.description && (
                  <p className="text-sm text-red-600">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    {...register("duration", { valueAsNumber: true })}
                  />
                  {errors.duration && (
                    <p className="text-sm text-red-600">
                      {errors.duration.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="marksPerQuestion">Marks Per Question *</Label>
                  <Input
                    id="marksPerQuestion"
                    type="number"
                    min="1"
                    {...register("marksPerQuestion", { valueAsNumber: true })}
                  />
                  {errors.marksPerQuestion && (
                    <p className="text-sm text-red-600">
                      {errors.marksPerQuestion.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="negativeMarking">Negative Marking</Label>
                  <Input
                    id="negativeMarking"
                    type="number"
                    step="any"
                    placeholder="-1"
                    {...register("negativeMarking", { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Test Type *</Label>
                  <Select
                    onValueChange={(value) => setValue("type", value as any)}
                    defaultValue="mock"
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mock">Mock Test</SelectItem>
                      <SelectItem value="practice">Practice Test</SelectItem>
                      <SelectItem value="previous_year">
                        Previous Year
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    onValueChange={(value) =>
                      setValue("status", value as any)
                    }
                    defaultValue="draft"
                  >
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
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty (Optional)</Label>
                  <Select
                    onValueChange={(value) =>
                      setValue("difficulty", value === "all" ? "" : value)
                    }
                    defaultValue={watch("difficulty") || "all"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any difficulty</SelectItem>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date (Optional)</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    {...register("startDate")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date (Optional)</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    {...register("endDate")}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="shuffleQuestions"
                  checked={watch("shuffleQuestions")}
                  onCheckedChange={(checked) =>
                    setValue("shuffleQuestions", checked as boolean)
                  }
                />
                <Label htmlFor="shuffleQuestions" className="cursor-pointer">
                  Shuffle Questions
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="useExamPattern"
                  checked={watch("useExamPattern")}
                  onCheckedChange={(checked) =>
                    setValue("useExamPattern", checked as boolean)
                  }
                />
                <Label htmlFor="useExamPattern" className="cursor-pointer">
                  Use Exam Pattern (Sections enabled)
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Question Selection Mode & Delivery Policy */}
          <Card>
            <CardHeader>
              <CardTitle>Question Selection & Delivery</CardTitle>
              <CardDescription>
                Configure how questions are selected and delivered to users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Selection Mode */}
              <div className="space-y-3">
                <Label htmlFor="questionSelectionMode">
                  Question Selection Mode *
                </Label>
                <Select
                  onValueChange={(value) =>
                    setValue(
                      "questionSelectionMode",
                      value as QuestionSelectionMode
                    )
                  }
                  defaultValue="random"
                >
                  <SelectTrigger id="questionSelectionMode">
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="random">Random</SelectItem>
                    <SelectItem value="selected">Selected</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-600">{modeInfo.description}</p>
              </div>

              {/* Delivery Policy */}
              <div className="space-y-3">
                <Label htmlFor="questionDeliveryPolicy">Delivery Policy *</Label>
                <Select
                  onValueChange={(value) =>
                    setValue(
                      "questionDeliveryPolicy",
                      value as QuestionDeliveryPolicy
                    )
                  }
                  defaultValue="fixed-per-user"
                >
                  <SelectTrigger id="questionDeliveryPolicy">
                    <SelectValue placeholder="Select policy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed-per-user">
                      Fixed Per User
                    </SelectItem>
                    <SelectItem value="fresh-each-attempt">
                      Fresh Each Attempt
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-600">
                  {deliveryPolicy === "fixed-per-user"
                    ? "Users get the same question set on all attempts"
                    : "Users can get different questions on each new attempt"}
                </p>
              </div>

              {/* Mode-specific fields */}
              {(selectionMode === "random" || selectionMode === "mixed") && (
                <div className="space-y-3">
                  <Label htmlFor="questionsPerUser">Questions Per User *</Label>
                  <Input
                    id="questionsPerUser"
                    type="number"
                    min="1"
                    placeholder="150"
                    {...register("questionsPerUser", { valueAsNumber: true })}
                  />
                  {errors.questionsPerUser && (
                    <p className="text-sm text-red-600">
                      {errors.questionsPerUser.message}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">
                    Total number of questions each user will take
                  </p>
                </div>
              )}

              {/* Subject Distribution */}
              {(selectionMode === "random" || selectionMode === "mixed") && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="ensureSubjectDistribution"
                      checked={ensureSubjectDistribution}
                      onCheckedChange={(checked) =>
                        setValue("ensureSubjectDistribution", checked as boolean)
                      }
                    />
                    <Label
                      htmlFor="ensureSubjectDistribution"
                      className="cursor-pointer"
                    >
                      Ensure Subject Distribution
                    </Label>
                  </div>
                  <p className="text-sm text-gray-600">
                    Maintain balanced question count across subjects
                  </p>

                  {ensureSubjectDistribution && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-sm font-medium text-blue-900 mb-3">
                        Subject Question Counts (for {watch("category")}{" "}
                        category)
                      </p>
                      <div className="space-y-3">
                        {getSubjectsForCategory(watch("category")).map(
                          (subject) => (
                            <div key={subject} className="flex items-center gap-2">
                              <Label className="w-20">{subject}</Label>
                              <Input
                                type="number"
                                min="0"
                                placeholder="50"
                                defaultValue={
                                  (watch("subjectQuestionCounts") as Record<
                                    string,
                                    number
                                  >)?.[subject] ?? ""
                                }
                                onChange={(e) => {
                                  const counts = (watch(
                                    "subjectQuestionCounts"
                                  ) || {}) as Record<string, number>;
                                  counts[subject] = Number(e.target.value) || 0;
                                  setValue("subjectQuestionCounts", counts);
                                }}
                                className="w-24"
                              />
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Questions Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {selectionMode === "selected" || selectionMode === "mixed"
                      ? `Selected Questions (${selectedQuestions.length})`
                      : `Test Questions (${selectedQuestions.length})`}
                  </CardTitle>
                  <CardDescription>
                    {selectionMode === "random"
                      ? "Questions will be randomly selected from the question bank for each user"
                      : selectionMode === "selected"
                      ? "Add the questions you want in this test"
                      : "Add core questions (rest will be filled with random questions)"}
                  </CardDescription>
                </div>
                {(selectionMode === "selected" ||
                  selectionMode === "mixed") && (
                  <Button
                    type="button"
                    onClick={() => setShowQuestionSelector(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Question
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {selectionMode === "random" && (
                <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg text-center">
                  <p className="text-blue-900 font-medium">
                    No manual question selection needed for Random Mode
                  </p>
                  <p className="text-sm text-blue-700 mt-2">
                    The backend will randomly select {questionsPerUser} questions
                    from the question bank for each user
                  </p>
                </div>
              )}

              {(selectionMode === "selected" || selectionMode === "mixed") && (
                <>
                  {selectedQuestions.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <p>No questions added yet</p>
                      <p className="text-sm mt-1">
                        Click "Add Question" to select from question bank
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-sm text-gray-600 mb-4">
                        Selected: {selectedQuestions.length}
                        {selectionMode === "mixed"
                          ? ` / ${questionsPerUser} total (${
                              (questionsPerUser || 0) - selectedQuestions.length
                            } will be randomly added)`
                          : ""}
                      </div>
                      {selectedQuestions.map((q, index) => (
                        <div
                          key={q._id}
                          className="flex items-center gap-3 p-4 border rounded-lg bg-white"
                        >
                          <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-gray-700">
                                Q{q.order}
                              </span>
                              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                                {q.category}
                              </span>
                              <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">
                                {q.chapter}
                              </span>
                              <span
                                className={`px-2 py-1 text-xs rounded ${
                                  (q.difficulty || "").toUpperCase() === "EASY"
                                    ? "bg-green-100 text-green-700"
                                    : (q.difficulty || "").toUpperCase() ===
                                      "MEDIUM"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {(q.difficulty || "").toUpperCase()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {q.topic}
                            </p>
                            <div className="text-sm text-gray-900 line-clamp-2">
                              <QuestionRenderer content={q.questionText} />
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 px-3 py-2 bg-gray-100 rounded">
                              {q.metadata?.marks || 4} marks
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveQuestion(index)}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/test-series")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Test"}
            </Button>
          </div>
        </form>

        {/* Question Selector Modal */}
        {showQuestionSelector && (
          <QuestionSelector
            onSelect={handleAddQuestion}
            onClose={() => setShowQuestionSelector(false)}
            selectedQuestionIds={selectedQuestions.map((q) => q._id)}
          />
        )}
      </div>
    </div>
  );
}
