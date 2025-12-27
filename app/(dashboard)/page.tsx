"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImageUploadWithPreview } from "@/components/ui/ImageUploadWithPreview";
import { Input } from "@/components/ui/input";
import {
  Users,
  ShoppingCart,
  BookOpen,
  TrendingUp,
  Clock,
  CheckCircle2,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import {
  getDashboardStats,
  DashboardStats,
} from "@/lib/services/dashboard.service";

export default function DashboardPage() {
  const [bannerImage, setBannerImage] = useState("");
  const [bannerTitle, setBannerTitle] = useState("");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard stats
  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load dashboard";
      setError(errorMessage);
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleBannerUpdate = () => {
    if (!bannerImage || !bannerTitle) {
      toast.error("Please provide both banner image and title");
      return;
    }

    const payload = {
      bannerImage,
      title: bannerTitle,
      isActive: true,
      updatedAt: new Date().toISOString(),
    };

    console.log("Banner Update Payload:", payload);
    toast.success("Banner updated successfully", {
      description: "Check console for payload",
    });

    setBannerImage("");
    setBannerTitle("");
  };

  // Calculate total questions for percentage calculation
  const totalQuestions = stats?.totalQuestions?.count || 0;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen p-6 bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen p-6 bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Failed to Load Dashboard
            </h2>
            <p className="text-gray-500 mb-4">{error}</p>
            <Button onClick={fetchStats}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-1">
              Welcome back! Here&apos;s what&apos;s happening.
            </p>
          </div>
          <Button variant="outline" onClick={fetchStats}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Users
              </CardTitle>
              <Users className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.totalUsers?.count?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                {stats?.totalUsers?.growth || "0%"}{" "}
                {stats?.totalUsers?.label || ""}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Sales
              </CardTitle>
              <ShoppingCart className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{stats?.totalSales?.amount?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                {stats?.totalSales?.growth || "0%"}{" "}
                {stats?.totalSales?.label || ""}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Questions
              </CardTitle>
              <BookOpen className="w-4 h-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.totalQuestions?.count?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-blue-600 flex items-center mt-1">
                +{stats?.totalQuestions?.added || 0}{" "}
                {stats?.totalQuestions?.label || ""}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Active Tests
              </CardTitle>
              <CheckCircle2 className="w-4 h-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.activeTests?.count || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {stats?.activeTests?.label || "Across all packages"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Registrations */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Registrations</CardTitle>
              <CardDescription>Latest users who signed up</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.recentRegistrations?.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No recent registrations
                  </p>
                ) : (
                  stats?.recentRegistrations?.map((user, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.name}
                          </p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {user.timeAgo}
                        </p>
                        {user.verified && (
                          <span className="text-xs text-green-600 flex items-center gap-1 mt-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Purchases */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Purchases</CardTitle>
              <CardDescription>Latest course purchases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.recentPurchases?.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No recent purchases
                  </p>
                ) : (
                  stats?.recentPurchases?.map((purchase, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {purchase.packageName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {purchase.buyerName}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">
                          ₹{purchase.price?.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          {purchase.timeAgo}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Question Bank Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Question Bank Statistics</CardTitle>
            <CardDescription>Overview of questions by subject</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {stats?.questionsBySubject &&
                Object.entries(stats.questionsBySubject).map(
                  ([subject, count]) => (
                    <div
                      key={subject}
                      className="p-4 rounded-lg border border-gray-200 bg-gradient-to-br from-white to-gray-50"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            {subject}
                          </p>
                          <p className="text-2xl font-bold text-gray-900 mt-1">
                            {count.toLocaleString()}
                          </p>
                        </div>
                        <BookOpen className="w-8 h-8 text-gray-300" />
                      </div>
                      <div className="mt-3 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${
                              totalQuestions > 0
                                ? (count / totalQuestions) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  )
                )}
            </div>
          </CardContent>
        </Card>

        {/* Update Home Banner */}
        <Card>
          <CardHeader>
            <CardTitle>Update Home Screen Banner</CardTitle>
            <CardDescription>
              Change the main banner displayed on the home page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Banner Title
              </label>
              <Input
                placeholder="Enter banner title..."
                value={bannerTitle}
                onChange={(e) => setBannerTitle(e.target.value)}
              />
            </div>

            <ImageUploadWithPreview
              label="Banner Image"
              description="Upload banner image (Recommended: 1920x600px)"
              onImageChange={setBannerImage}
              currentImage={bannerImage}
            />

            <div className="flex justify-end">
              <Button onClick={handleBannerUpdate}>Update Banner</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
