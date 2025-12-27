// app/packages/[id]/add-tests/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  Plus,
  Check,
  Loader2,
  BookOpen,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePackageStore } from "@/lib/stores/packageStore";
import { testService, TestListItem } from "@/lib/services/test.service";
import { toast } from "sonner";

export default function AddTestsToPackagePage() {
  const params = useParams();
  const router = useRouter();
  const packageId = params.id as string;

  const {
    selectedPackage: pkg,
    fetchPackageById,
    addTestToPackage,
  } = usePackageStore();

  const [tests, setTests] = useState<TestListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingTestId, setAddingTestId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Get IDs of tests already in the package
  const existingTestIds = new Set(pkg?.tests?.map((t) => t._id) || []);

  // Fetch tests
  const fetchTests = useCallback(async () => {
    setLoading(true);
    try {
      const filters: Record<string, unknown> = {
        page: 1,
        limit: 50,
      };

      if (searchQuery.trim()) {
        filters.search = searchQuery.trim();
      }
      if (statusFilter !== "all") {
        filters.status = statusFilter;
      }
      if (categoryFilter !== "all") {
        filters.category = categoryFilter;
      }

      const response = await testService.getTests(
        filters as Parameters<typeof testService.getTests>[0]
      );
      setTests(response.data || []);
    } catch (error) {
      console.error("Error fetching tests:", error);
      toast.error("Failed to load tests");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, categoryFilter]);

  // Fetch package details on mount
  useEffect(() => {
    if (packageId) {
      fetchPackageById(packageId);
    }
  }, [packageId, fetchPackageById]);

  // Fetch tests with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTests();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchTests]);

  // Handle adding a test to the package
  const handleAddTest = async (testId: string) => {
    setAddingTestId(testId);
    try {
      await addTestToPackage(packageId, testId);
      toast.success("Test added to package");
      // Refresh package to update the existing tests list
      await fetchPackageById(packageId);
    } catch (err) {
      toast.error("Failed to add test", {
        description: err instanceof Error ? err.message : "Please try again",
      });
    } finally {
      setAddingTestId(null);
    }
  };

  // Get unique categories from tests for filter
  const categories = Array.from(
    new Set(tests.map((t) => t.category).filter(Boolean))
  );

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Add Tests to Package
              </h1>
              {pkg && (
                <p className="text-gray-500 mt-1">
                  Adding to: <span className="font-medium">{pkg.title}</span>
                </p>
              )}
            </div>
          </div>
          <Link href={`/packages/${packageId}`}>
            <Button variant="outline">Done</Button>
          </Link>
        </div>

        {/* Current Tests Count */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tests in Package</p>
                  <p className="text-xl font-bold">{existingTestIds.size}</p>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Tests already added are marked with a checkmark
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search tests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="UPCOMING">Upcoming</SelectItem>
                  <SelectItem value="LIVE">Live</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tests List */}
        <Card>
          <CardHeader>
            <CardTitle>Available Tests</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : tests.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No tests found</p>
                <p className="text-sm text-gray-400 mt-1">
                  Try adjusting your search or filters
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {tests.map((test) => {
                  const isAlreadyAdded = existingTestIds.has(test._id);
                  const isAdding = addingTestId === test._id;

                  return (
                    <div
                      key={test._id}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                        isAlreadyAdded
                          ? "bg-green-50 border-green-200"
                          : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            isAlreadyAdded ? "bg-green-100" : "bg-gray-100"
                          }`}
                        >
                          {isAlreadyAdded ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <BookOpen className="w-4 h-4 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {test.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {test.category}
                            {test.type && ` • ${test.type}`}
                            {test.totalQuestions &&
                              ` • ${test.totalQuestions} questions`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right text-sm">
                          <p className="text-gray-600">{test.duration} mins</p>
                          {test.totalMarks && (
                            <p className="text-gray-500">
                              {test.totalMarks} marks
                            </p>
                          )}
                        </div>
                        {isAlreadyAdded ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 text-sm font-medium rounded-lg">
                            <Check className="w-4 h-4" />
                            Added
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleAddTest(test._id)}
                            disabled={isAdding}
                          >
                            {isAdding ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Plus className="w-4 h-4 mr-1" />
                                Add
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
