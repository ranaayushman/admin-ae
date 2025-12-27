"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { questionService } from "@/lib/services/question.service";
import { Question } from "@/lib/types";
import { QuestionRenderer } from "@/components/QuestionRenderer";
import { toast } from "sonner";

export default function QuestionEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editData, setEditData] = useState({
    difficulty: "MEDIUM",
    marks: 4,
    chapter: "",
    topic: "",
  });

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const data = await questionService.getQuestionById(id);
        console.log("✅ Question loaded:", data);
        setQuestion(data);
        setEditData({
          difficulty: data.difficulty,
          marks: data.metadata.marks,
          chapter: data.chapter,
          topic: data.topic,
        });
      } catch (err: any) {
        console.error("❌ Failed:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestion();
  }, [id]);

  const handleSave = async () => {
    if (!question) return;
    setSaving(true);
    try {
      await questionService.updateQuestion(id, {
        difficulty: editData.difficulty.toLowerCase() as
          | "EASY"
          | "MEDIUM"
          | "HARD",
        metadata: { marks: editData.marks, year: question.metadata.year },
        chapter: editData.chapter,
        topic: editData.topic,
      });
      toast.success("Question updated!");
      router.push(`/questions/${id}`);
    } catch (err: any) {
      toast.error("Failed: " + err.message);
    } finally {
      setSaving(false);
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
              Back
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
          <Link href={`/questions/${id}`}>
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Cancel
            </Button>
          </Link>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Edit Question</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-lg border">
              <p className="text-sm font-medium text-gray-600 mb-2">
                Question (Read-only)
              </p>
              <QuestionRenderer
                content={question.questionText}
                className="text-sm"
              />
            </div>

            {question.options && question.options.length > 0 && (
              <div className="p-4 bg-gray-50 rounded-lg border">
                <p className="text-sm font-medium text-gray-600 mb-2">
                  Options (Read-only)
                </p>
                <div className="space-y-2 mt-2">
                  {question.options.map((opt, i) => {
                    const letter = String.fromCharCode(65 + i);
                    const isCorrect = question.correctAnswer.includes(letter);
                    return (
                      <div
                        key={i}
                        className={`p-2 rounded border ${
                          isCorrect
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 bg-white"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <span className="font-medium min-w-6 text-xs">
                            {letter}.
                          </span>
                          <div className="flex-1">
                            <QuestionRenderer
                              content={opt}
                              className="text-xs"
                            />
                          </div>
                          {isCorrect && (
                            <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded">
                              ✓
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-gray-600 mb-2">
                Solution (Read-only)
              </p>
              <QuestionRenderer
                content={question.solutionText}
                className="text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Chapter
                </label>
                <Input
                  value={editData.chapter}
                  onChange={(e) =>
                    setEditData({ ...editData, chapter: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Topic</label>
                <Input
                  value={editData.topic}
                  onChange={(e) =>
                    setEditData({ ...editData, topic: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Difficulty
                </label>
                <Select
                  value={editData.difficulty}
                  onValueChange={(v) =>
                    setEditData({ ...editData, difficulty: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EASY">Easy</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HARD">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Marks</label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={editData.marks}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      marks: parseInt(e.target.value) || 4,
                    })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
