// app/packages/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Users,
  TrendingUp,
  Search,
  Filter,
  Loader2,
  RefreshCw,
  Eye,
} from "lucide-react";
import Link from "next/link";
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
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toast } from "sonner";
import { usePackageStore } from "@/lib/stores/packageStore";
import { PackageFilters } from "@/lib/services/package.service";

export default function PackagesPage() {
  const {
    packages,
    loading,
    loadingStats,
    error,
    pagination,
    stats,
    dashboardStats,
    fetchPackages,
    fetchDashboardStats,
    deletePackage: deletePackageAction,
    invalidateCache,
  } = usePackageStore();

  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    packageId: string | null;
    packageTitle: string;
  }>({ isOpen: false, packageId: null, packageTitle: "" });

  const [isDeleting, setIsDeleting] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Use dashboard stats from API if available, otherwise fallback to computed stats
  const displayStats = dashboardStats || stats;

  // Fetch packages and dashboard stats on mount
  useEffect(() => {
    fetchPackages();
    fetchDashboardStats();
  }, [fetchPackages, fetchDashboardStats]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      const filters: PackageFilters = {
        page: 1,
        limit: 10,
      };

      if (searchQuery.trim()) {
        filters.search = searchQuery.trim();
      }
      if (statusFilter !== "all") {
        filters.status = statusFilter as PackageFilters["status"];
      }
      if (typeFilter !== "all") {
        filters.type = typeFilter as PackageFilters["type"];
      }

      fetchPackages(filters, true);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter, typeFilter, fetchPackages]);

  const handleDelete = (id: string, title: string) => {
    setDeleteDialog({ isOpen: true, packageId: id, packageTitle: title });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.packageId) return;

    setIsDeleting(true);
    try {
      await deletePackageAction(deleteDialog.packageId);
      toast.success("Package deleted successfully");
      setDeleteDialog({ isOpen: false, packageId: null, packageTitle: "" });
    } catch (err) {
      toast.error("Failed to delete package", {
        description: err instanceof Error ? err.message : "Please try again",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRefresh = () => {
    invalidateCache();
    fetchPackages(undefined, true);
    fetchDashboardStats(true);
  };

  // Format validity days to readable format
  const formatValidity = (days: number): string => {
    if (days >= 365) {
      const years = Math.floor(days / 365);
      return `${years} year${years > 1 ? "s" : ""}`;
    } else if (days >= 30) {
      const months = Math.floor(days / 30);
      return `${months} month${months > 1 ? "s" : ""}`;
    }
    return `${days} days`;
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Packages</h1>
            <p className="text-gray-500 mt-1">Manage test series packages</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            </Button>
            <Link href="/packages/create">
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create Package
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Packages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading || loadingStats ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  displayStats.totalPackages
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Enrollments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {loading || loadingStats ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  displayStats.totalEnrollments.toLocaleString()
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {loading || loadingStats ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  `₹${displayStats.totalRevenue.toLocaleString()}`
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Active Packages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading || loadingStats ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  displayStats.activePackages
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search packages..."
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="test-series">Test Series</SelectItem>
                  <SelectItem value="course">Course</SelectItem>
                  <SelectItem value="bundle">Bundle</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={handleRefresh}
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && packages.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading packages...</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && packages.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <p className="text-gray-500 mb-4">No packages found</p>
              <Link href="/packages/create">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Package
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Packages Grid */}
        {packages.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <Card key={pkg._id} className="hover:shadow-lg transition">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{pkg.title}</CardTitle>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {pkg.description}
                      </p>
                    </div>
                    <StatusBadge
                      status={
                        pkg.status as
                          | "active"
                          | "inactive"
                          | "draft"
                          | "scheduled"
                      }
                    />
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-500">Tests</div>
                      <div className="text-lg font-semibold">
                        {pkg.totalTests}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Validity</div>
                      <div className="text-lg font-semibold">
                        {formatValidity(pkg.validityDays)}
                      </div>
                    </div>
                  </div>

                  {/* Enrollment Progress */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Enrollments</span>
                      <span className="font-medium">
                        {pkg.enrollments}
                        {pkg.maxEnrollments && pkg.maxEnrollments > 0
                          ? ` / ${pkg.maxEnrollments}`
                          : ""}
                      </span>
                    </div>
                    {pkg.maxEnrollments && pkg.maxEnrollments > 0 && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${Math.min(
                              (pkg.enrollments / pkg.maxEnrollments) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <div>
                        <div className="text-xs text-gray-500">Revenue</div>
                        <div className="text-sm font-semibold text-green-600">
                          ₹{(pkg.revenue ?? 0).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <div>
                        <div className="text-xs text-gray-500">Price</div>
                        <div className="text-sm font-semibold">
                          {pkg.discountPrice ? (
                            <span>
                              <span className="line-through text-gray-400 mr-1">
                                ₹{(pkg.price ?? 0).toLocaleString()}
                              </span>
                              ₹{(pkg.discountPrice ?? 0).toLocaleString()}
                            </span>
                          ) : (
                            `₹${(pkg.price ?? 0).toLocaleString()}`
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4">
                    <Link href={`/packages/${pkg._id}`} className="flex-1">
                      <Button
                        variant="outline"
                        className="w-full flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                    </Link>
                    <Link href={`/packages/${pkg._id}/edit`}>
                      <Button
                        variant="outline"
                        size="icon"
                        className="flex items-center"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(pkg._id, pkg.title)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              disabled={pagination.page === 1 || loading}
              onClick={() => fetchPackages({ page: pagination.page - 1 }, true)}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              disabled={pagination.page === pagination.totalPages || loading}
              onClick={() => fetchPackages({ page: pagination.page + 1 }, true)}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() =>
          setDeleteDialog({ isOpen: false, packageId: null, packageTitle: "" })
        }
        onConfirm={confirmDelete}
        title="Delete Package"
        description={`Are you sure you want to delete "${deleteDialog.packageTitle}"? This action cannot be undone.`}
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        variant="danger"
      />
    </div>
  );
}
