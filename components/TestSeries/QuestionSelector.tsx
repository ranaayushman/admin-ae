// components/TestSeries/QuestionSelector.tsx
"use client";

import React, { useState } from "react";
import { Search, X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock questions - Replace with actual API
const mockQuestions = [
  {
    id: "q_001",
    subject: "Physics",
    chapter: "Electrostatics",
    difficulty: "Medium",
    question: "<p>Calculate the electric field at point P due to two charges...</p>",
    questionType: "SINGLE_CORRECT",
  },
  {
    id: "q_002",
    subject: "Chemistry",
    chapter: "Atomic Structure",
    difficulty: "Easy",
    question: "<p>What is the electronic configuration of Chromium?</p>",
    questionType: "SINGLE_CORRECT",
  },
  {
    id: "q_003",
    subject: "Mathematics",
    chapter: "Calculus",
    difficulty: "Hard",
    question: "<p>Integrate ∫ x² sin(x) dx</p>",
    questionType: "INTEGER",
  },
  {
    id: "q_004",
    subject: "Physics",
    chapter: "Mechanics",
    difficulty: "Medium",
    question: "<p>A block of mass 5kg is placed on an inclined plane...</p>",
    questionType: "NUMERICAL",
  },
  {
    id: "q_005",
    subject: "Chemistry",
    chapter: "Organic Chemistry",
    difficulty: "Hard",
    question: "<p>Which of the following reactions is an example of nucleophilic substitution?</p>",
    questionType: "MULTI_CORRECT",
  },
];

interface QuestionSelectorProps {
  onSelect: (question: any) => void;
  onClose: () => void;
}

export function QuestionSelector({ onSelect, onClose }: QuestionSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");

  const filteredQuestions = mockQuestions.filter((q) => {
    const matchesSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         q.chapter.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = subjectFilter === "all" || q.subject === subjectFilter;
    const matchesDifficulty = difficultyFilter === "all" || q.difficulty === difficultyFilter;
    
    return matchesSearch && matchesSubject && matchesDifficulty;
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Select Question</h2>
            <p className="text-sm text-gray-500 mt-1">
              Choose from the question bank
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

            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                <SelectItem value="Physics">Physics</SelectItem>
                <SelectItem value="Chemistry">Chemistry</SelectItem>
                <SelectItem value="Mathematics">Mathematics</SelectItem>
              </SelectContent>
            </Select>

            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Difficulties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Questions List */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No questions found</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredQuestions.map((question) => (
                <div
                  key={question.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => onSelect(question)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                          {question.subject}
                        </span>
                        <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded">
                          {question.questionType}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            question.difficulty === "Easy"
                              ? "bg-green-100 text-green-700"
                              : question.difficulty === "Medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {question.difficulty}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {question.chapter}
                      </p>
                      <div
                        className="text-sm text-gray-900 mt-2 line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: question.question }}
                      />
                    </div>
                    <Button size="sm" onClick={() => onSelect(question)}>
                      Add
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <p className="text-sm text-gray-500">
            Showing {filteredQuestions.length} of {mockQuestions.length} questions
          </p>
        </div>
      </div>
    </div>
  );
}
