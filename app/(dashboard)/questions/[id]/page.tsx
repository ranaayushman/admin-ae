"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { questionService } from "@/lib/services/question.service";
import { Question } from "@/lib/types";
import { QuestionRenderer } from "@/components/QuestionRenderer";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toast } from "sonner";

export default function QuestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState(false);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const data = await questionService.getQuestionById(id);
        console.log("✅ Question loaded:", data);
        setQuestion(data);
      } catch (err: any) {
        console.error("❌ Failed:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestion();
  }, [id]);

  const handleDelete = async () => {
    try {
      await questionService.deleteQuestion(id);
      toast.success("Question deleted successfully");
      router.push("/questions");
    } catch (err: any) {
      toast.error("Failed to delete: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <p className="text-gray-600">Loading question...</p>
        </div>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="min-h-screen p-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <Card className="p-6">
            <p className="text-red-600 font-semibold">
              Error: {error || "Question not found"}
            </p>
            <Button onClick={() => router.push("/questions")} className="mt-4">
              Back to Questions
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/questions">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
          <div className="flex gap-2">
            <Link href={`/questions/${id}/edit`}>
              <Button className="flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Edit
              </Button>
            </Link>
            <Button
              variant="outline"
              className="flex items-center gap-2 text-red-600 hover:text-red-700"
              onClick={() => setDeleteDialog(true)}
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Question Details</CardTitle>
            <div className="flex gap-2 mt-2">
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                {question.category}
              </span>
              <span
                className={`px-2 py-1 text-xs rounded ${question.difficulty === "EASY"
                    ? "bg-green-100 text-green-700"
                    : question.difficulty === "MEDIUM"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
              >
                {question.difficulty}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Chapter</p>
                <p className="text-sm mt-1">{question.chapter}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Topic</p>
                <p className="text-sm mt-1">{question.topic}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Marks</p>
                <p className="text-sm mt-1">{question.metadata.marks}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Question</p>
              <div className="p-4 bg-gray-50 rounded-lg">
                <QuestionRenderer
                  content={question.questionText}
                  className="text-base"
                />
              </div>
            </div>

            {question.options?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">
                  Options
                </p>
                <div className="space-y-2">
                  {question.options.map((opt, i) => {
                    const letter = String.fromCharCode(65 + i);
                    const isCorrect = question.correctAnswer.includes(letter);
                    // Handle both object { text: string } and plain string formats
                    const optionText = typeof opt === "string" ? opt : opt.text;
                    return (
                      <div
                        key={i}
                        className={`p-3 rounded-lg border ${isCorrect
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200"
                          }`}
                      >
                        <div className="flex items-start gap-2">
                          <span className="font-medium min-w-6">{letter}.</span>
                          <div className="flex-1">
                            <QuestionRenderer
                              content={optionText}
                              className="text-sm"
                            />
                          </div>
                          {isCorrect && (
                            <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded">
                              Correct
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Solution</p>
              <div className="p-4 bg-blue-50 rounded-lg">
                <QuestionRenderer
                  content={question.solutionText}
                  className="text-base"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        isOpen={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Question"
        description="Are you sure you want to delete this question? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
