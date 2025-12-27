"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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
import { TiptapEditor } from "@/components/AddQuestions/TipTapEditor";
import { OptionEditor } from "@/components/AddQuestions/OptionEditor";
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
    questionText: "",
    solutionText: "",
    options: [] as { text: string; isCorrect: boolean }[],
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

        // Parse options from the question
        const parsedOptions = data.options
          ? data.options.map((opt, idx) => {
              const letter = String.fromCharCode(65 + idx);
              return {
                text: opt,
                isCorrect: data.correctAnswer.includes(letter),
              };
            })
          : [];

        setEditData({
          questionText: data.questionText,
          solutionText: data.solutionText,
          options: parsedOptions,
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
      // Calculate correct answer from options
      let correctAnswer = "";
      if (editData.options.length > 0) {
        const correctIndices = editData.options
          .map((opt, idx) =>
            opt.isCorrect ? String.fromCharCode(65 + idx) : null
          )
          .filter((v) => v !== null);
        correctAnswer = correctIndices.join(",");
      } else {
        correctAnswer = question.correctAnswer; // Keep original for non-MCQ
      }

      await questionService.updateQuestion(id, {
        questionText: editData.questionText,
        solutionText: editData.solutionText,
        options: editData.options.map((opt) => opt.text),
        correctAnswer,
        difficulty: editData.difficulty.toLowerCase() as
          | "easy"
          | "medium"
          | "hard",
        metadata: { marks: editData.marks, year: question.metadata.year },
        chapter: editData.chapter,
        topic: editData.topic,
      });
      toast.success("Question updated successfully!");
      router.push(`/questions/${id}`);
    } catch (err: any) {
      toast.error("Failed to update: " + err.message);
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
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Edit Question</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Question Text */}
            <div>
              <TiptapEditor
                id="question"
                label="Question Text"
                description="Edit the question text with formatting and math support"
                value={editData.questionText}
                onChange={(val) =>
                  setEditData({ ...editData, questionText: val })
                }
              />
            </div>

            <Separator />

            {/* Options (if MCQ) */}
            {editData.options.length > 0 && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">Options</Label>
                <div className="space-y-3">
                  {editData.options.map((option, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold text-gray-600">
                          Option {String.fromCharCode(65 + index)}
                        </Label>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={option.isCorrect}
                            onCheckedChange={(checked) => {
                              const newOptions = [...editData.options];
                              newOptions[index].isCorrect = Boolean(checked);
                              setEditData({ ...editData, options: newOptions });
                            }}
                          />
                          <span className="text-xs text-muted-foreground">
                            Correct Answer
                          </span>
                        </div>
                      </div>
                      <OptionEditor
                        value={option.text}
                        onChange={(val) => {
                          const newOptions = [...editData.options];
                          newOptions[index].text = val;
                          setEditData({ ...editData, options: newOptions });
                        }}
                        placeholder={`Enter option ${String.fromCharCode(
                          65 + index
                        )} text`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {editData.options.length > 0 && <Separator />}

            {/* Solution */}
            <div>
              <TiptapEditor
                id="solution"
                label="Solution"
                description="Edit the solution with step-by-step explanation"
                value={editData.solutionText}
                onChange={(val) =>
                  setEditData({ ...editData, solutionText: val })
                }
              />
            </div>

            <Separator />

            {/* Metadata */}
            <div>
              <Label className="text-base font-semibold mb-4 block">
                Question Metadata
              </Label>
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
                  <label className="text-sm font-medium mb-2 block">
                    Topic
                  </label>
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
                  <label className="text-sm font-medium mb-2 block">
                    Marks
                  </label>
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
