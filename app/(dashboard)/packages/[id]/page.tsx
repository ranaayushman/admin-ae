// app/packages/[id]/page.tsx
"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  Calendar,
  Users,
  TrendingUp,
  Clock,
  BookOpen,
  CheckCircle,
  Star,
  Tag,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { usePackageStore } from "@/lib/stores/packageStore";

export default function PackageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const packageId = params.id as string;

  const {
    packages,
    selectedPackage: pkg,
    loading,
    loadingDetails,
    error,
    fetchPackages,
    fetchPackageById,
    clearSelectedPackage,
  } = usePackageStore();

  useEffect(() => {
    // Ensure packages list is loaded (for fallback cache)
    if (packages.length === 0) {
      fetchPackages();
    }
  }, [packages.length, fetchPackages]);

  useEffect(() => {
    if (packageId && packages.length > 0) {
      fetchPackageById(packageId);
    }

    return () => {
      clearSelectedPackage();
    };
  }, [packageId, packages.length, fetchPackageById, clearSelectedPackage]);

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

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loadingDetails || loading) {
    return (
      <div className="min-h-screen p-6 bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading package details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6 text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="min-h-screen p-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-gray-500 mb-4">Package not found</p>
              <Link href="/packages">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Packages
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  {pkg.title}
                </h1>
                <StatusBadge
                  status={
                    pkg.status as "active" | "inactive" | "draft" | "scheduled"
                  }
                />
                {pkg.isFeatured && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                    <Star className="w-3 h-3" />
                    Featured
                  </span>
                )}
              </div>
              <p className="text-gray-500 mt-1">{pkg.packageId}</p>
            </div>
          </div>
          <Link href={`/packages/${packageId}/edit`}>
            <Button className="flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Edit Package
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Enrollments</p>
                  <p className="text-xl font-bold">
                    {pkg.enrollments ?? 0}
                    {pkg.maxEnrollments && pkg.maxEnrollments > 0 && (
                      <span className="text-sm font-normal text-gray-500">
                        {" "}
                        / {pkg.maxEnrollments}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Revenue</p>
                  <p className="text-xl font-bold text-green-600">
                    ₹{(pkg.revenue ?? 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Tests</p>
                  <p className="text-xl font-bold">{pkg.totalTests ?? 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Validity</p>
                  <p className="text-xl font-bold">
                    {formatValidity(pkg.validityDays ?? 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {pkg.description || "No description provided"}
                </p>
              </CardContent>
            </Card>

            {/* Tests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Included Tests</span>
                  <span className="text-sm font-normal text-gray-500">
                    {pkg.tests?.length || 0} tests
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pkg.tests && pkg.tests.length > 0 ? (
                  <div className="space-y-3">
                    {pkg.tests.map((test) => (
                      <div
                        key={test._id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-lg border">
                            <BookOpen className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {test.title}
                            </p>
                            <p className="text-sm text-gray-500">
                              {test.category} • {test.type}
                            </p>
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <p className="text-gray-600">{test.duration} mins</p>
                          <p className="text-gray-500">
                            {test.totalMarks} marks
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No tests added to this package
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Features */}
            {pkg.features && pkg.features.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-gray-500">Original Price</span>
                  <span
                    className={`text-lg ${
                      pkg.discountPrice
                        ? "line-through text-gray-400"
                        : "font-bold"
                    }`}
                  >
                    ₹{(pkg.price ?? 0).toLocaleString()}
                  </span>
                </div>
                {pkg.discountPrice && (
                  <div className="flex items-baseline justify-between">
                    <span className="text-gray-500">Discount Price</span>
                    <span className="text-xl font-bold text-green-600">
                      ₹{pkg.discountPrice.toLocaleString()}
                    </span>
                  </div>
                )}
                {pkg.discountPercentage && pkg.discountPercentage > 0 && (
                  <div className="flex items-baseline justify-between">
                    <span className="text-gray-500">Discount</span>
                    <span className="text-green-600 font-medium">
                      {pkg.discountPercentage}% OFF
                    </span>
                  </div>
                )}
                {pkg.earlyBirdPrice && pkg.earlyBirdPrice > 0 && (
                  <div className="flex items-baseline justify-between border-t pt-4">
                    <span className="text-gray-500">Early Bird Price</span>
                    <span className="text-lg font-bold text-blue-600">
                      ₹{pkg.earlyBirdPrice.toLocaleString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Details */}
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Category</span>
                  <span className="font-medium">{pkg.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Type</span>
                  <span className="font-medium capitalize">{pkg.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Currency</span>
                  <span className="font-medium">{pkg.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Questions</span>
                  <span className="font-medium">{pkg.totalQuestions ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Sequential Unlock</span>
                  <span className="font-medium">
                    {pkg.sequentialUnlock ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Waitlist</span>
                  <span className="font-medium">
                    {pkg.enableWaitlist ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Dates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Important Dates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Launch Date</span>
                  <span className="font-medium">
                    {formatDate(pkg.launchDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Access Start</span>
                  <span className="font-medium">
                    {formatDate(pkg.accessStartDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Expiry Date</span>
                  <span className="font-medium">
                    {formatDate(pkg.expiryDate)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span className="text-gray-500">Created</span>
                  <span className="font-medium">
                    {formatDate(pkg.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Last Updated</span>
                  <span className="font-medium">
                    {formatDate(pkg.updatedAt)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Subjects & Exam Types */}
            {((pkg.subjects && pkg.subjects.length > 0) ||
              (pkg.examTypes && pkg.examTypes.length > 0)) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Tags
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pkg.examTypes && pkg.examTypes.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Exam Types</p>
                      <div className="flex flex-wrap gap-2">
                        {pkg.examTypes.map((type, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {pkg.subjects && pkg.subjects.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Subjects</p>
                      <div className="flex flex-wrap gap-2">
                        {pkg.subjects.map((subject, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-purple-100 text-purple-700 text-sm rounded-full"
                          >
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
