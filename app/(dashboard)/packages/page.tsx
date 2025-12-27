// app/packages/page.tsx
"use client";

import React, { useState } from "react";
import { Plus, Edit, Trash2, Users, TrendingUp, Calendar } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toast } from "sonner";

// Mock packages
const mockPackages = [
  {
    id: "pkg_001",
    name: "JEE Main 2025 Complete Package",
    description: "Complete test series with 50 mock tests",
    price: 2999,
    testsCount: 50,
    enrollments: 245,
    maxEnrollments: 500,
    status: "active",
    validityPeriod: "12 months",
    revenue: 734755,
  },
  {
    id: "pkg_002",
    name: "NEET 2025 Crash Course",
    description: "30-day crash course with 25 tests",
    price: 1999,
    testsCount: 25,
    enrollments: 189,
    maxEnrollments: 300,
    status: "active",
    validityPeriod: "6 months",
    revenue: 377811,
  },
  {
    id: "pkg_003",
    name: "12th Board Practice Package",
    description: "Comprehensive board exam preparation",
    price: 999,
    testsCount: 15,
    enrollments: 67,
    maxEnrollments: 0,
    status: "active",
    validityPeriod: "3 months",
    revenue: 66933,
  },
  {
    id: "pkg_004",
    name: "JEE Advanced 2026 Early Bird",
    description: "Get ahead with advanced preparation",
    price: 3999,
    testsCount: 40,
    enrollments: 12,
    maxEnrollments: 100,
    status: "scheduled",
    validityPeriod: "18 months",
    revenue: 47988,
  },
];

export default function PackagesPage() {
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    packageId: string | null;
  }>({ isOpen: false, packageId: null });

  const handleDelete = (id: string) => {
    setDeleteDialog({ isOpen: true, packageId: id });
  };

  const confirmDelete = () => {
    console.log("Deleting package:", deleteDialog.packageId);
    toast.success("Package archived successfully");
    setDeleteDialog({ isOpen: false, packageId: null });
  };

  const totalRevenue = mockPackages.reduce((sum, pkg) => sum + pkg.revenue, 0);
  const totalEnrollments = mockPackages.reduce(
    (sum, pkg) => sum + pkg.enrollments,
    0
  );

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Packages</h1>
            <p className="text-gray-500 mt-1">
              Manage test series packages
            </p>
          </div>
          <Link href="/packages/create">
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Package
            </Button>
          </Link>
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
              <div className="text-2xl font-bold">{mockPackages.length}</div>
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
                {totalEnrollments}
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
                ₹{totalRevenue.toLocaleString()}
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
                {mockPackages.filter((p) => p.status === "active").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockPackages.map((pkg) => (
            <Card key={pkg.id} className="hover:shadow-lg transition">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{pkg.name}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      {pkg.description}
                    </p>
                  </div>
                  <StatusBadge status={pkg.status as any} />
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500">Tests</div>
                    <div className="text-lg font-semibold">
                      {pkg.testsCount}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Validity</div>
                    <div className="text-lg font-semibold">
                      {pkg.validityPeriod}
                    </div>
                  </div>
                </div>

                {/* Enrollment Progress */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Enrollments</span>
                    <span className="font-medium">
                      {pkg.enrollments}
                      {pkg.maxEnrollments > 0 && ` / ${pkg.maxEnrollments}`}
                    </span>
                  </div>
                  {pkg.maxEnrollments > 0 && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(pkg.enrollments / pkg.maxEnrollments) * 100}%`,
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
                        ₹{pkg.revenue.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="text-xs text-gray-500">Price</div>
                      <div className="text-sm font-semibold">
                        ₹{pkg.price.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  <Link href={`/packages/${pkg.id}/edit`} className="flex-1">
                    <Button variant="outline" className="w-full flex items-center gap-2">
                      <Edit className="w-4 h-4" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() => handleDelete(pkg.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, packageId: null })}
        onConfirm={confirmDelete}
        title="Archive Package"
        description="Are you sure you want to archive this package? Students with active enrollments will retain access."
        confirmText="Archive"
        variant="warning"
      />
    </div>
  );
}
