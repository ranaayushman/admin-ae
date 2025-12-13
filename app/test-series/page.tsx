// app/test-series/page.tsx
"use client";

import React, { useState } from "react";
import { Plus, Edit, Trash2, BarChart3, Copy, Eye } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

// Mock test series
const mockTestSeries = [
  {
    id: "test_001",
    name: "JEE Main 2025 - Mock Test 1",
    package: "JEE Main Package",
    questionsCount: 75,
    duration: 180,
    totalMarks: 300,
    enrollments: 234,
    averageScore: 178,
    status: "active",
    createdAt: "2024-12-01",
  },
  {
    id: "test_002",
    name: "NEET Physics - Chapter-wise Test",
    package: "NEET Complete Package",
    questionsCount: 45,
    duration: 60,
    totalMarks: 180,
    enrollments: 189,
    averageScore: 132,
    status: "active",
    createdAt: "2024-12-05",
  },
  {
    id: "test_003",
    name: "Mathematics Full Syllabus - Advanced",
    package: "JEE Advanced Package",
    questionsCount: 60,
    duration: 120,
    totalMarks: 240,
    enrollments: 45,
    averageScore: 156,
    status: "draft",
    createdAt: "2024-12-10",
  },
];

export default function TestSeriesPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    testId: string | null;
  }>({ isOpen: false, testId: null });

  const filteredTests = mockTestSeries.filter(
    (test) => statusFilter === "all" || test.status === statusFilter
  );

  const handleDelete = (id: string) => {
    setDeleteDialog({ isOpen: true, testId: id });
  };

  const confirmDelete = () => {
    console.log("Archiving test series:", deleteDialog.testId);
    toast.success("Test series archived successfully");
    setDeleteDialog({ isOpen: false, testId: null });
  };

  const handleDuplicate = (id: string) => {
    console.log("Duplicating test series:", id);
    toast.success("Test series duplicated successfully");
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-sm text-gray-600">Total Tests</div>
            <div className="text-2xl font-bold mt-1">
              {mockTestSeries.length}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Active</div>
            <div className="text-2xl font-bold text-green-600 mt-1">
              {mockTestSeries.filter((t) => t.status === "active").length}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Total Attempts</div>
            <div className="text-2xl font-bold text-blue-600 mt-1">
              {mockTestSeries.reduce((sum, t) => sum + t.enrollments, 0)}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Drafts</div>
            <div className="text-2xl font-bold text-yellow-600 mt-1">
              {mockTestSeries.filter((t) => t.status === "draft").length}
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value=" archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Test Series Cards */}
        <div className="space-y-4">
          {filteredTests.map((test) => (
            <Card key={test.id} className="hover:shadow-md transition">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {test.name}
                      </h3>
                      <StatusBadge status={test.status as any} />
                    </div>
                    <p className="text-sm text-gray-600">{test.package}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
                  <div>
                    <div className="text-xs text-gray-500">Questions</div>
                    <div className="text-lg font-semibold">
                      {test.questionsCount}
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
                      {test.totalMarks}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Attempts</div>
                    <div className="text-lg font-semibold text-blue-600">
                      {test.enrollments}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Avg Score</div>
                    <div className="text-lg font-semibold text-green-600">
                      {test.averageScore}/{test.totalMarks}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-6 pt-6 border-t">
                  <Link href={`/test-series/${test.id}/analytics`}>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Analytics
                    </Button>
                  </Link>
                  <Link href={`/test-series/${test.id}/edit`}>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Edit className="w-4 h-4" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDuplicate(test.id)}
                    className="flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Duplicate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(test.id)}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 ml-auto"
                  >
                    <Trash2 className="w-4 h-4" />
                    Archive
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, testId: null })}
        onConfirm={confirmDelete}
        title="Archive Test Series"
        description="Are you sure you want to archive this test series? Students with active enrollments will retain access, but new enrollments will be blocked."
        confirmText="Archive"
        variant="warning"
      />
    </div>
  );
}
