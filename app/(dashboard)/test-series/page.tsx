"use client";

import React, { useCallback, useEffect, useState } from "react";
import { BarChart3, Copy, Edit, Loader2, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  testService,
  type AutoCreateTestPayload,
  type TestListItem,
} from "@/lib/services/test.service";

// Exam patterns — auto-fills questionCount + duration when useExamPattern is toggled
const EXAM_PATTERNS: Record<string, { questionCount: number; duration: number; sections: { subject: string; questions: number; duration: number; marks: string }[] }> = {
  'jee-main': {
    questionCount: 75,
    duration: 180,
    sections: [
      { subject: 'Physics', questions: 25, duration: 60, marks: '+4/−1' },
      { subject: 'Chemistry', questions: 25, duration: 60, marks: '+4/−1' },
      { subject: 'Mathematics', questions: 25, duration: 60, marks: '+4/−1' },
    ],
  },
  'jee-advanced': {
    questionCount: 54,
    duration: 180,
    sections: [
      { subject: 'Physics', questions: 18, duration: 60, marks: '+4/−1' },
      { subject: 'Chemistry', questions: 18, duration: 60, marks: '+4/−1' },
      { subject: 'Mathematics', questions: 18, duration: 60, marks: '+4/−1' },
    ],
  },
  'neet': {
    questionCount: 180,
    duration: 200,
    sections: [
      { subject: 'Physics', questions: 45, duration: 50, marks: '+4/−1' },
      { subject: 'Chemistry', questions: 45, duration: 50, marks: '+4/−1' },
      { subject: 'Botany', questions: 45, duration: 50, marks: '+4/−1' },
      { subject: 'Zoology', questions: 45, duration: 50, marks: '+4/−1' },
    ],
  },
  'wbjee': {
    questionCount: 100,
    duration: 120,
    sections: [
      { subject: 'Physics', questions: 30, duration: 40, marks: '+1/−0.25' },
      { subject: 'Chemistry', questions: 30, duration: 40, marks: '+1/−0.25' },
      { subject: 'Mathematics', questions: 40, duration: 40, marks: '+1/−0.25' },
    ],
  },
  'boards': {
    questionCount: 90,
    duration: 180,
    sections: [
      { subject: 'Physics', questions: 30, duration: 60, marks: '+4/0' },
      { subject: 'Chemistry', questions: 30, duration: 60, marks: '+4/0' },
      { subject: 'Mathematics', questions: 30, duration: 60, marks: '+4/0' },
    ],
  },
};

export default function TestSeriesPage() {
  const [tests, setTests] = useState<TestListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [autoCreateOpen, setAutoCreateOpen] = useState(false);
  const [autoCreateLoading, setAutoCreateLoading] = useState(false);
  const [autoCreateForm, setAutoCreateForm] = useState<AutoCreateTestPayload>({
    title: "",
    category: "",
    duration: 60,
    questionCount: 50,
    useExamPattern: false,
    chapter: "",
    difficulty: "",
    questionSelectionMode: "random",
    questionDeliveryPolicy: "fixed-per-user",
    questionsPerUser: 50,
    selectedQuestionIds: [],
    ensureSubjectDistribution: false,
    subjectQuestionCounts: {},
  });

  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    testId: string | null;
  }>({ isOpen: false, testId: null });

  const fetchTests = useCallback(async () => {
    setLoading(true);
    try {
      const response = await testService.getTests({
        search: searchQuery || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        page: currentPage,
        limit: pagination.limit,
      });

      setTests(response.data);
      setPagination(response.pagination);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch tests";
      toast.error("Failed to fetch tests", { description: message });
    } finally {
      setLoading(false);
    }
  }, [currentPage, pagination.limit, searchQuery, statusFilter]);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const handleDelete = (id: string) => {
    setDeleteDialog({ isOpen: true, testId: id });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.testId) return;

    try {
      await testService.deleteTest(deleteDialog.testId);
      toast.success("Test deleted successfully");
      setDeleteDialog({ isOpen: false, testId: null });
      fetchTests();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete test";
      toast.error("Failed to delete test", { description: message });
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const test = await testService.getTestById(id);
      await testService.createTest({
        title: `${test.title} (Copy)`,
        description: test.description,
        category: test.category,
        questions: test.questions,
        duration: test.duration,
        marksPerQuestion: test.marksPerQuestion,
        negativeMarking: test.negativeMarking,
        status: "draft",
        type: test.type,
        shuffleQuestions: test.shuffleQuestions,
      });

      toast.success("Test duplicated successfully");
      fetchTests();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to duplicate test";
      toast.error("Failed to duplicate test", { description: message });
    }
  };

  const stats = {
    total: pagination.total,
    published: tests.filter((t) => t.status === "published").length,
    draft: tests.filter((t) => t.status === "draft").length,
  };

  const submitAutoCreate = async () => {
    setAutoCreateLoading(true);
    try {
      const payload: AutoCreateTestPayload = {
        title: autoCreateForm.title.trim(),
        category: autoCreateForm.category.trim(),
        duration: Number(autoCreateForm.duration) || 0,
        questionCount: Number(autoCreateForm.questionCount) || 0,
        useExamPattern: autoCreateForm.useExamPattern,
        chapter: autoCreateForm.chapter?.trim() || undefined,
        difficulty: autoCreateForm.difficulty?.trim() || undefined,
        questionSelectionMode: autoCreateForm.questionSelectionMode || "random",
        questionDeliveryPolicy: autoCreateForm.questionDeliveryPolicy || "fixed-per-user",
        questionsPerUser: Number(autoCreateForm.questionsPerUser) || Number(autoCreateForm.questionCount),
        selectedQuestionIds: autoCreateForm.selectedQuestionIds || [],
        ensureSubjectDistribution: autoCreateForm.ensureSubjectDistribution || false,
        subjectQuestionCounts: autoCreateForm.subjectQuestionCounts || {},
      };

      await testService.autoCreateTest(payload);
      toast.success("Test auto-created successfully");
      setAutoCreateOpen(false);
      setAutoCreateForm({
        title: "",
        category: "",
        duration: 60,
        questionCount: 50,
        useExamPattern: false,
        chapter: "",
        difficulty: "",
        questionSelectionMode: "random",
        questionDeliveryPolicy: "fixed-per-user",
        questionsPerUser: 50,
        selectedQuestionIds: [],
        ensureSubjectDistribution: false,
        subjectQuestionCounts: {},
      });
      fetchTests();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to auto-create test";
      toast.error("Failed to auto-create test", { description: message });
    } finally {
      setAutoCreateLoading(false);
    }
  };

  /** When useExamPattern is toggled on for a known category, auto-fill count + duration */
  const handleExamPatternToggle = (checked: boolean) => {
    const pattern = EXAM_PATTERNS[autoCreateForm.category];
    setAutoCreateForm((p) => ({
      ...p,
      useExamPattern: checked,
      ...(checked && pattern
        ? { questionCount: pattern.questionCount, duration: pattern.duration }
        : {}),
    }));
  };

  const handleCategoryChange = (value: string) => {
    const pattern = EXAM_PATTERNS[value];
    setAutoCreateForm((p) => ({
      ...p,
      category: value,
      ...(p.useExamPattern && pattern
        ? { questionCount: pattern.questionCount, duration: pattern.duration }
        : {}),
    }));
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Test Series</h1>
            <p className="text-gray-500 mt-1">
              Manage all test series across packages
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/test-series/create">
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create Test Series
              </Button>
            </Link>
            <Button variant="outline" onClick={() => setAutoCreateOpen(true)}>
              Auto Create
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="text-sm text-gray-600">Total Tests</div>
            <div className="text-2xl font-bold mt-1">{stats.total}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Published</div>
            <div className="text-2xl font-bold text-green-600 mt-1">
              {stats.published}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Drafts</div>
            <div className="text-2xl font-bold text-yellow-600 mt-1">
              {stats.draft}
            </div>
          </Card>
        </div>
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search tests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-xs"
            />
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Loading tests...</span>
          </div>
        ) : tests.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-500">No tests found</p>
            <p className="text-sm text-gray-400 mt-2">
              {searchQuery
                ? "Try adjusting your search or filters"
                : "Create your first test to get started"}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {tests.map((test) => (
              <Card key={test._id} className="hover:shadow-md transition">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {test.title}
                        </h3>
                        <StatusBadge
                          status={
                            test.status === "published" ? "active" : "draft"
                          }
                        />
                      </div>
                      <p className="text-sm text-gray-600">{test.category}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {test.description ?? ""}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div>
                      <div className="text-xs text-gray-500">Questions</div>
                      <div className="text-lg font-semibold">
                        {test.totalQuestions ?? test.questions?.length ?? 0}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Duration</div>
                      <div className="text-lg font-semibold">
                        {test.duration} min
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Total Marks</div>
                      <div className="text-lg font-semibold">
                        {test.totalMarks ?? 0}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Type</div>
                      <div className="text-sm font-semibold capitalize">
                        {String(test.type ?? "").replace(/_/g, " ") || "-"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-6 pt-6 border-t">
                    <Link href={`/test-series/${test._id}/analytics`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <BarChart3 className="w-4 h-4" />
                        Analytics
                      </Button>
                    </Link>
                    <Link href={`/test-series/${test._id}/edit`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDuplicate(test._id)}
                      className="flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Duplicate
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(test._id)}
                      className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 ml-auto"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
        {!loading && tests.length > 0 && (
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {(currentPage - 1) * pagination.limit + 1} to{" "}
                {Math.min(currentPage * pagination.limit, pagination.total)} of{" "}
                {pagination.total} tests
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= pagination.totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, testId: null })}
        onConfirm={confirmDelete}
        title="Delete Test"
        description="Are you sure you want to delete this test? This action cannot be undone."
        confirmText="Delete"
        variant="warning"
      />

      {autoCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-2xl p-6 my-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Auto Create Test
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Randomly selects questions from the bank to build a test.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {/* Row 1: Title + Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Title *</label>
                  <Input
                    value={autoCreateForm.title}
                    onChange={(e) => setAutoCreateForm((p) => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. JEE Main Mock Test 1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Category *</label>
                  <Select value={autoCreateForm.category} onValueChange={handleCategoryChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jee-main">JEE Main</SelectItem>
                      <SelectItem value="jee-advanced">JEE Advanced</SelectItem>
                      <SelectItem value="neet">NEET</SelectItem>
                      <SelectItem value="wbjee">WBJEE</SelectItem>
                      <SelectItem value="boards">Boards</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 2: Use Exam Pattern toggle */}
              <div className="flex items-center gap-3 py-2 border rounded-lg px-4 bg-blue-50 border-blue-200">
                <Checkbox
                  id="useExamPattern"
                  checked={!!autoCreateForm.useExamPattern}
                  onCheckedChange={(checked) => handleExamPatternToggle(checked as boolean)}
                />
                <div>
                  <label htmlFor="useExamPattern" className="text-sm font-medium text-blue-900 cursor-pointer">
                    Use Exam Pattern
                  </label>
                  <p className="text-xs text-blue-600">
                    Auto-creates subject-wise sections matching the official exam structure.
                  </p>
                </div>
              </div>

              {/* Exam pattern preview table */}
              {autoCreateForm.useExamPattern && autoCreateForm.category && EXAM_PATTERNS[autoCreateForm.category] && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                  <p className="text-xs font-semibold text-green-800 mb-2 uppercase tracking-wide">
                    {autoCreateForm.category.toUpperCase().replace('-', ' ')} Pattern
                  </p>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-green-700">
                        <th className="text-left py-1">Subject</th>
                        <th className="text-center py-1">Questions</th>
                        <th className="text-center py-1">Duration</th>
                        <th className="text-center py-1">Marks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {EXAM_PATTERNS[autoCreateForm.category].sections.map((s) => (
                        <tr key={s.subject} className="border-t border-green-200 text-green-900">
                          <td className="py-1">{s.subject}</td>
                          <td className="text-center py-1">{s.questions}</td>
                          <td className="text-center py-1">{s.duration} min</td>
                          <td className="text-center py-1">{s.marks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Row 3: Question Count + Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Question Count *</label>
                  <Input
                    type="number"
                    min={1}
                    value={autoCreateForm.questionCount}
                    readOnly={!!autoCreateForm.useExamPattern && !!EXAM_PATTERNS[autoCreateForm.category]}
                    className={autoCreateForm.useExamPattern && EXAM_PATTERNS[autoCreateForm.category] ? 'bg-gray-100 cursor-not-allowed' : ''}
                    onChange={(e) => setAutoCreateForm((p) => ({ ...p, questionCount: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Duration (minutes) *</label>
                  <Input
                    type="number"
                    min={1}
                    value={autoCreateForm.duration}
                    readOnly={!!autoCreateForm.useExamPattern && !!EXAM_PATTERNS[autoCreateForm.category]}
                    className={autoCreateForm.useExamPattern && EXAM_PATTERNS[autoCreateForm.category] ? 'bg-gray-100 cursor-not-allowed' : ''}
                    onChange={(e) => setAutoCreateForm((p) => ({ ...p, duration: Number(e.target.value) }))}
                  />
                </div>
              </div>

              {/* Row 4: Optional filters (Chapter + Difficulty) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Chapter <span className="text-gray-400 font-normal">(optional)</span></label>
                  <Input
                    value={autoCreateForm.chapter ?? ""}
                    onChange={(e) => setAutoCreateForm((p) => ({ ...p, chapter: e.target.value }))}
                    placeholder="e.g. Mechanics"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Difficulty <span className="text-gray-400 font-normal">(optional)</span></label>
                  <Select
                    value={autoCreateForm.difficulty ?? "all"}
                    onValueChange={(v) => setAutoCreateForm((p) => ({ ...p, difficulty: v === "all" ? undefined : v }))}
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

              {/* Row 5: Question Selection Mode + Delivery Policy */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Question Selection Mode</label>
                  <Select
                    value={autoCreateForm.questionSelectionMode || "random"}
                    onValueChange={(v) => setAutoCreateForm((p) => ({ ...p, questionSelectionMode: v as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="random">Random</SelectItem>
                      <SelectItem value="selected">Selected</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Delivery Policy</label>
                  <Select
                    value={autoCreateForm.questionDeliveryPolicy || "fixed-per-user"}
                    onValueChange={(v) => setAutoCreateForm((p) => ({ ...p, questionDeliveryPolicy: v as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select policy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed-per-user">Fixed Per User</SelectItem>
                      <SelectItem value="fresh-each-attempt">Fresh Each Attempt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 6: Questions Per User (for random and mixed modes) */}
              {(autoCreateForm.questionSelectionMode === "random" || autoCreateForm.questionSelectionMode === "mixed") && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Questions Per User</label>
                  <Input
                    type="number"
                    min={1}
                    value={autoCreateForm.questionsPerUser}
                    onChange={(e) => setAutoCreateForm((p) => ({ ...p, questionsPerUser: Number(e.target.value) }))}
                    placeholder="e.g. 150"
                  />
                </div>
              )}

              {/* Row 7: Subject Distribution (for random and mixed modes) */}
              {(autoCreateForm.questionSelectionMode === "random" || autoCreateForm.questionSelectionMode === "mixed") && (
                <div className="flex items-center gap-3 py-2 border rounded-lg px-4 bg-blue-50 border-blue-200">
                  <Checkbox
                    id="ensureSubjectDist"
                    checked={!!autoCreateForm.ensureSubjectDistribution}
                    onCheckedChange={(checked) => setAutoCreateForm((p) => ({ ...p, ensureSubjectDistribution: checked as boolean }))}
                  />
                  <div>
                    <label htmlFor="ensureSubjectDist" className="text-sm font-medium text-blue-900 cursor-pointer">
                      Ensure Subject Distribution
                    </label>
                    <p className="text-xs text-blue-600">
                      Distribute questions evenly across subjects
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setAutoCreateOpen(false)}
                disabled={autoCreateLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={submitAutoCreate}
                disabled={
                  autoCreateLoading ||
                  !autoCreateForm.title.trim() ||
                  !autoCreateForm.category.trim() ||
                  Number(autoCreateForm.questionCount) <= 0 ||
                  Number(autoCreateForm.duration) <= 0 ||
                  ((autoCreateForm.questionSelectionMode === "random" || autoCreateForm.questionSelectionMode === "mixed") &&
                    Number(autoCreateForm.questionsPerUser) <= 0)
                }
              >
                {autoCreateLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </span>
                ) : (
                  "Auto Create"
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
