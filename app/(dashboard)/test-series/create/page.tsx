// app/test-series/create/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Plus, Trash2, GripVertical, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { QuestionRenderer } from "@/components/QuestionRenderer";

// Validation schema
const testSeriesSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  marksPerQuestion: z.number().min(1, "Marks per question must be at least 1"),
  negativeMarking: z.number(),
  status: z.enum(["draft", "published"]),
  type: z.enum(["mock", "practice", "previous_year"]),
  shuffleQuestions: z.boolean(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

type TestSeriesFormValues = z.infer<typeof testSeriesSchema>;

interface SelectedQuestion extends Question {
  order: number;
}

export default function CreateTestSeriesPage() {
  const router = useRouter();
  const [selectedQuestions, setSelectedQuestions] = useState<
    SelectedQuestion[]
  >([]);
  const [showQuestionSelector, setShowQuestionSelector] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TestSeriesFormValues>({
    resolver: zodResolver(testSeriesSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      duration: 180,
      marksPerQuestion: 4,
      negativeMarking: -1,
      status: "draft",
      type: "mock",
      shuffleQuestions: true,
    },
  });

  const handleAddQuestion = (question: Question) => {
    const newQuestion: SelectedQuestion = {
      ...question,
      order: selectedQuestions.length + 1,
    };

    const updated = [...selectedQuestions, newQuestion];
    setSelectedQuestions(updated);
    setShowQuestionSelector(false);

    toast.success("Question added to test");
  };

  const handleRemoveQuestion = (index: number) => {
    const updated = selectedQuestions
      .filter((_, i) => i !== index)
      .map((q, i) => ({ ...q, order: i + 1 }));

    setSelectedQuestions(updated);
  };

  const onSubmit = async (data: TestSeriesFormValues) => {
    if (selectedQuestions.length === 0) {
      toast.error("Please add at least one question");
      return;
    }

    try {
      const payload = {
        title: data.title,
        description: data.description,
        category: data.category,
        questions: selectedQuestions.map((q) => q._id),
        duration: data.duration,
        marksPerQuestion: data.marksPerQuestion,
        negativeMarking: data.negativeMarking,
        status: data.status,
        type: data.type,
        shuffleQuestions: data.shuffleQuestions,
        startDate: data.startDate,
        endDate: data.endDate,
      };

      console.log("Creating test with payload:", payload);

      const result = await testService.createTest(payload);

      toast.success("Test created successfully!", {
        description: `Test ID: ${result._id}`,
      });

      // Reset and navigate
      reset();
      setSelectedQuestions([]);
      router.push("/test-series");
    } catch (error: any) {
      toast.error("Failed to create test", {
        description: error.message,
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
              Build a new test by selecting questions from the question bank
            </p>
          </div>
          <Link href="/test-series">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Tests
            </Button>
          </Link>
        </div>

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
                    placeholder="NEET Physics Mock Test 1"
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
                  <Input
                    id="category"
                    placeholder="NEET, JEE, etc."
                    {...register("category")}
                  />
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
                    onValueChange={(value) => setValue("status", value as any)}
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
                  defaultChecked={true}
                  onCheckedChange={(checked) =>
                    setValue("shuffleQuestions", checked as boolean)
                  }
                />
                <Label htmlFor="shuffleQuestions" className="cursor-pointer">
                  Shuffle Questions
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Questions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Questions ({selectedQuestions.length})</CardTitle>
                  <CardDescription>
                    Add questions from the question bank
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  onClick={() => setShowQuestionSelector(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Question
                </Button>
              </div>
            </CardHeader>
            <CardContent>
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
                    Total Marks:{" "}
                    {selectedQuestions.length * watch("marksPerQuestion")}
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
                              q.difficulty === "EASY"
                                ? "bg-green-100 text-green-700"
                                : q.difficulty === "MEDIUM"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {q.difficulty}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{q.topic}</p>
                        <div className="text-sm text-gray-900 line-clamp-2">
                          <QuestionRenderer content={q.questionText} />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 px-3 py-2 bg-gray-100 rounded">
                          {q.metadata.marks} marks
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
            <Button
              type="submit"
              disabled={isSubmitting || selectedQuestions.length === 0}
            >
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
