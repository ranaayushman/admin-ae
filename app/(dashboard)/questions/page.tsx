// app/questions/page.tsx
"use client";

import React, { useState } from "react";
import { Search, Edit, Trash2, Eye, Plus, Filter } from "lucide-react";
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
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

// Mock data - Replace with API
const mockQuestions = [
  {
    id: "q_001",
    subject: "Physics",
    chapter: "Electrostatics",
    difficulty: "Medium",
    question: "Calculate the electric field at point P due to two charges...",
    questionType: "SINGLE_CORRECT",
    status: "active",
    createdAt: "2024-12-10",
    usedInTests: 3,
  },
  {
    id: "q_002",
    subject: "Chemistry",
    chapter: "Atomic Structure",
    difficulty: "Easy",
    question: "What is the electronic configuration of Chromium?",
    questionType: "SINGLE_CORRECT",
    status: "active",
    createdAt: "2024-12-11",
    usedInTests: 2,
  },
  {
    id: "q_003",
    subject: "Mathematics",
    chapter: "Calculus",
    difficulty: "Hard",
    question: "Integrate ∫ x² sin(x) dx",
    questionType: "INTEGER",
    status: "active",
    createdAt: "2024-12-12",
    usedInTests: 1,
  },
  {
    id: "q_004",
    subject: "Physics",
    chapter: "Mechanics",
    difficulty: "Medium",
    question: "A block of mass 5kg is placed on an inclined plane...",
    questionType: "NUMERICAL",
    status: "draft",
    createdAt: "2024-12-13",
    usedInTests: 0,
  },
];

export default function QuestionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    questionId: string | null;
  }>({ isOpen: false, questionId: null });

  const itemsPerPage = 10;

  // Filter questions
  const filteredQuestions = mockQuestions.filter((q) => {
    const matchesSearch =
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.chapter.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = subjectFilter === "all" || q.subject === subjectFilter;
    const matchesDifficulty =
      difficultyFilter === "all" || q.difficulty === difficultyFilter;
    const matchesStatus = statusFilter === "all" || q.status === statusFilter;

    return matchesSearch && matchesSubject && matchesDifficulty && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
  const paginatedQuestions = filteredQuestions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDelete = (id: string) => {
    setDeleteDialog({ isOpen: true, questionId: id });
  };

  const confirmDelete = () => {
    console.log("Deleting question:", deleteDialog.questionId);
    toast.success("Question deleted successfully");
    setDeleteDialog({ isOpen: false, questionId: null });
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
          <Link href="/pyq">
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Question
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-sm text-gray-600">Total Questions</div>
            <div className="text-2xl font-bold mt-1">{mockQuestions.length}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Active</div>
            <div className="text-2xl font-bold text-green-600 mt-1">
              {mockQuestions.filter((q) => q.status === "active").length}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Draft</div>
            <div className="text-2xl font-bold text-yellow-600 mt-1">
              {mockQuestions.filter((q) => q.status === "draft").length}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Reported</div>
            <div className="text-2xl font-bold text-red-600 mt-1">0</div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Questions Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Question
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Difficulty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Used In
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedQuestions.map((question) => (
                  <tr key={question.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="max-w-md">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {question.question}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {question.chapter}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                        {question.subject}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          question.difficulty === "Easy"
                            ? "bg-green-100 text-green-700"
                            : question.difficulty === "Medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {question.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {question.questionType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={question.status as any} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {question.usedInTests} tests
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" title="Preview">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Link href={`/questions/${question.id}/edit`}>
                          <Button variant="ghost" size="sm" title="Edit">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(question.id)}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="text-sm text-gray-600">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredQuestions.length)} of{" "}
              {filteredQuestions.length} questions
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, questionId: null })}
        onConfirm={confirmDelete}
        title="Delete Question"
        description="Are you sure you want to delete this question? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
