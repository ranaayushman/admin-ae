// app/test-series/create/page.tsx
"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  testSeriesSchema,
  TestSeriesFormValues,
  testPackages,
} from "@/lib/validations/test-series-schema";
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
import { Separator } from "@/components/ui/separator";
import { QuestionSelector } from "@/components/TestSeries/QuestionSelector";
import { toast } from "sonner";
import { Plus, Trash2, GripVertical } from "lucide-react";

// Mock question interface
interface SelectedQuestion {
  questionId: string;
  order: number;
  marks: number;
  negativeMarks: number;
  questionText?: string;
  subject?: string;
}

export default function CreateTestSeriesPage() {
  const [selectedQuestions, setSelectedQuestions] = useState<SelectedQuestion[]>([]);
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
      name: "",
      description: "",
      duration: 180,
      totalMarks: 300,
      instructions: "",
      isActive: true,
      isFree: false,
      price: 0,
      questions: [],
    },
  });

  const testPackage = watch("testPackage");
  const isFree = watch("isFree");

  const handleAddQuestion = (question: any) => {
    const newQuestion: SelectedQuestion = {
      questionId: question.id,
      order: selectedQuestions.length + 1,
      marks: 4,
      negativeMarks: 1,
      questionText: question.question,
      subject: question.subject,
    };

    const updated = [...selectedQuestions, newQuestion];
    setSelectedQuestions(updated);
    setValue("questions", updated);
    setShowQuestionSelector(false);

    toast.success("Question added to test series");
  };

  const handleRemoveQuestion = (index: number) => {
    const updated = selectedQuestions
      .filter((_, i) => i !== index)
      .map((q, i) => ({ ...q, order: i + 1 }));
    
    setSelectedQuestions(updated);
    setValue("questions", updated);
  };

  const handleQuestionChange = (index: number, field: keyof SelectedQuestion, value: any) => {
    const updated = [...selectedQuestions];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedQuestions(updated);
    setValue("questions", updated);
  };

  const onSubmit = (data: TestSeriesFormValues) => {
    const payload = {
      ...data,
      questions: selectedQuestions,
      createdAt: new Date().toISOString(),
    };

    console.log("Test Series Payload:", payload);
    toast.success("Test series created successfully!", {
      description: "Check console for complete payload",
    });

    // Reset form
    reset();
    setSelectedQuestions([]);
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Create Test Series</h1>
          <p className="text-gray-500 mt-1">
            Build a new test series by selecting questions from the question bank
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Details */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Details</CardTitle>
              <CardDescription>
                Enter the basic information for this test series
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Test Series Name *</Label>
                  <Input
                    id="name"
                    placeholder="JEE Main 2025 - Mock Test 1"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="testPackage">Test Package *</Label>
                  <Select
                    onValueChange={(value) => setValue("testPackage", value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select test package" />
                    </SelectTrigger>
                    <SelectContent>
                      {testPackages.map((pkg) => (
                        <SelectItem key={pkg} value={pkg}>
                          {pkg.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.testPackage && (
                    <p className="text-sm text-red-600">
                      {errors.testPackage.message}
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
                  placeholder="Full syllabus mock test covering all topics..."
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
                  <Label htmlFor="totalMarks">Total Marks *</Label>
                  <Input
                    id="totalMarks"
                    type="number"
                    {...register("totalMarks", { valueAsNumber: true })}
                  />
                  {errors.totalMarks && (
                    <p className="text-sm text-red-600">
                      {errors.totalMarks.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    disabled={isFree}
                    {...register("price", { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isActive"
                    {...register("isActive")}
                    onCheckedChange={(checked) =>
                      setValue("isActive", checked as boolean)
                    }
                  />
                  <Label htmlFor="isActive" className="cursor-pointer">
                    Active
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isFree"
                    {...register("isFree")}
                    onCheckedChange={(checked) =>
                      setValue("isFree", checked as boolean)
                    }
                  />
                  <Label htmlFor="isFree" className="cursor-pointer">
                    Free Test
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Questions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Questions</CardTitle>
                  <CardDescription>
                    Add questions from the question bank or create new ones
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
                  {selectedQuestions.map((q, index) => (
                    <div
                      key={q.questionId}
                      className="flex items-center gap-3 p-4 border rounded-lg bg-white"
                    >
                      <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-700">
                            Q{q.order}
                          </span>
                          {q.subject && (
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                              {q.subject}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1 truncate">
                          {q.questionText || `Question ID: ${q.questionId}`}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={q.marks}
                          onChange={(e) =>
                            handleQuestionChange(index, "marks", Number(e.target.value))
                          }
                          className="w-20"
                          placeholder="Marks"
                        />
                        <Input
                          type="number"
                          value={q.negativeMarks}
                          onChange={(e) =>
                            handleQuestionChange(
                              index,
                              "negativeMarks",
                              Number(e.target.value)
                            )
                          }
                          className="w-20"
                          placeholder="-ve"
                        />
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

              {errors.questions && (
                <p className="text-sm text-red-600 mt-2">
                  {errors.questions.message}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => reset()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Test Series"}
            </Button>
          </div>
        </form>

        {/* Question Selector Modal */}
        {showQuestionSelector && (
          <QuestionSelector
            onSelect={handleAddQuestion}
            onClose={() => setShowQuestionSelector(false)}
          />
        )}
      </div>
    </div>
  );
}
