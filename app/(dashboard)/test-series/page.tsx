"use client";

import React, { useCallback, useEffect, useState } from "react";
import { BarChart3, Copy, Edit, Loader2, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { testService, type TestListItem } from "@/lib/services/test.service";

export default function TestSeriesPage() {
  const [tests, setTests] = useState<TestListItem[]>([]);
  const [loading, setLoading] = useState(true);

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
          <Link href="/test-series/create">
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Test Series
            </Button>
          </Link>
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
    </div>
  );
}
