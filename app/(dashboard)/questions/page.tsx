"use client";

import React, { useState, useEffect } from "react";
import { Search, Edit, Trash2, Eye, Plus, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { questionService } from "@/lib/services/question.service";
import { Question } from "@/lib/types";
import { QuestionRenderer } from "@/components/QuestionRenderer";

export default function QuestionsPage() {
  // Direct state - no fancy hooks
  const [questions, setQuestions] = useState<Question[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    questionId: string | null;
  }>({ isOpen: false, questionId: null });

  // Simple fetch function
  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await questionService.getQuestions({
        category:
          categoryFilter !== "all" ? categoryFilter.toLowerCase() : undefined,
        difficulty: difficultyFilter !== "all" ? difficultyFilter : undefined,
        search: searchQuery || undefined,
        page,
        limit: 20,
      });

      console.log("✅ Questions loaded:", response);

      setQuestions(response.data);
      setTotal(response.pagination.total);
      setTotalPages(response.pagination.totalPages);
    } catch (err: any) {
      console.error("❌ Failed to load questions:", err);
      setError(err.message || "Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchQuestions();
  }, [page, categoryFilter, difficultyFilter, searchQuery]);

  const handleDelete = async () => {
    if (!deleteDialog.questionId) return;

    try {
      await questionService.deleteQuestion(deleteDialog.questionId);
      toast.success("Question deleted");
      setDeleteDialog({ isOpen: false, questionId: null });
      fetchQuestions();
    } catch (err: any) {
      toast.error("Failed to delete: " + err.message);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Question Bank</h1>
            <p className="text-gray-500 mt-1">
              Manage all questions in your question bank
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={fetchQuestions}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Link href="/pyq">
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Question
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-sm text-gray-600">Total Questions</div>
            <div className="text-2xl font-bold mt-1">{total}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Loaded</div>
            <div className="text-2xl font-bold text-green-600 mt-1">
              {questions.length}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Page</div>
            <div className="text-2xl font-bold text-blue-600 mt-1">
              {page} of {totalPages}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Status</div>
            <div className="text-2xl font-bold mt-1">
              {loading ? "Loading..." : "Ready"}
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="neet">NEET</SelectItem>
                <SelectItem value="jee-main">JEE Main</SelectItem>
                <SelectItem value="jee-advanced">JEE Advanced</SelectItem>
                <SelectItem value="boards">Boards</SelectItem>
                <SelectItem value="wbjee">WBJEE</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={difficultyFilter}
              onValueChange={setDifficultyFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Difficulties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Error */}
        {error && (
          <Card className="p-6 bg-red-50 border-red-200">
            <p className="text-red-600 font-semibold">Error: {error}</p>
            <Button onClick={fetchQuestions} className="mt-2">
              Retry
            </Button>
          </Card>
        )}

        {/* Questions Table - ALWAYS SHOW */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Question
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Chapter
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Difficulty
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      Loading questions...
                    </td>
                  </tr>
                ) : questions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No questions found
                    </td>
                  </tr>
                ) : (
                  questions.map((q) => (
                    <tr key={q._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="max-w-md">
                          <QuestionRenderer
                            content={q.questionText}
                            className="text-sm font-medium text-gray-900 line-clamp-2"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {q.topic}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                          {q.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {q.chapter}
                      </td>
                      <td className="px-6 py-4">
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
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/questions/${q._id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Link href={`/questions/${q._id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setDeleteDialog({
                                isOpen: true,
                                questionId: q._id,
                              })
                            }
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <p className="text-sm text-gray-600">
                Page {page} of {totalPages} ({total} total)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, questionId: null })}
        onConfirm={handleDelete}
        title="Delete Question"
        description="Are you sure? This cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
