// components/TestSeries/QuestionSelector.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Search, X, Filter, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuestionStore } from "@/lib/stores/questionStore";
import { Question } from "@/lib/types";
import { QuestionRenderer } from "@/components/QuestionRenderer";

interface QuestionSelectorProps {
  onSelect: (question: Question) => void;
  onClose: () => void;
  selectedQuestionIds?: string[];
}

export function QuestionSelector({
  onSelect,
  onClose,
  selectedQuestionIds = [],
}: QuestionSelectorProps) {
  const { questions, loading, error, fetchQuestions, pagination } =
    useQuestionStore();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch questions when filters or page changes
  useEffect(() => {
    fetchQuestions({
      page: currentPage,
      limit: 10,
      search: searchQuery || undefined,
      category: categoryFilter !== "all" ? categoryFilter : undefined,
      difficulty: difficultyFilter !== "all" ? (difficultyFilter as any) : undefined,
    });
  }, [currentPage, categoryFilter, difficultyFilter, searchQuery]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter, difficultyFilter, searchQuery]);

  // Extract unique categories (Note: this might only show categories from current page if not handled by API)
  // Ideally, API should provide global categories, but for now we use what's available
  const uniqueCategories = [
    "NEET", "JEE Main", "JEE Advanced", "Boards", "WBJEE", "Physics", "Chemistry", "Mathematics", "Biology"
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Select Question
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Search and add questions from the bank
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b bg-gray-50">
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
                {uniqueCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
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
                <SelectItem value="EASY">Easy</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HARD">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Questions List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Loading questions...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">
              <p>Error loading questions</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No questions found</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="space-y-3">
              {questions.map((question) => {
                const isSelected = selectedQuestionIds.includes(question._id);
                return (
                  <div
                    key={question._id}
                    className={`border rounded-lg p-4 transition ${isSelected ? 'opacity-50 bg-gray-50' : 'hover:bg-gray-50 cursor-pointer'}`}
                    onClick={() => !isSelected && onSelect(question)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                            {question.category}
                          </span>
                          <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded">
                            {question.options?.length > 0 ? "MCQ" : "Numerical"}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded ${
                              question.difficulty === "EASY"
                                ? "bg-green-100 text-green-700"
                                : question.difficulty === "MEDIUM"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {question.difficulty}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {question.chapter} • {question.topic}
                        </p>
                        <div className="text-sm text-gray-900 mt-2 line-clamp-2">
                          <QuestionRenderer content={question.questionText} />
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isSelected) onSelect(question);
                        }}
                        disabled={isSelected}
                      >
                        {isSelected ? "Added" : "Add"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer with Pagination */}
        <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} questions
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1 || loading}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            >
              Previous
            </Button>
            <span className="text-sm font-medium">
              Page {pagination.page} of {pagination.totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= pagination.totalPages || loading}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
