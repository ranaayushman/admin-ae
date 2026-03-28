// app/test-series/[id]/analytics/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, Users, Target, Clock } from "lucide-react";
import Link from "next/link";

interface AnalyticsData {
  totalAttempts: number;
  averageScore: number;
  totalMarks: number;
  averageTime: number;
  passRate: number;
}

export default function TestAnalyticsPage() {
  const params = useParams();
  const testId = params.id;

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with real API call once endpoint is ready
    // GET /api/admin/test-series/:id/analytics
    setLoading(false);
  }, [testId]);

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/test-series">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Test Analytics</h1>
            <p className="text-gray-500 mt-1">Detailed performance analysis</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="h-24 flex items-center justify-center">
                  <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : analytics ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Attempts
                  </CardTitle>
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalAttempts}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Average Score
                  </CardTitle>
                  <Target className="w-4 h-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.averageScore}/{analytics.totalMarks}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {((analytics.averageScore / analytics.totalMarks) * 100).toFixed(1)}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Average Time
                  </CardTitle>
                  <Clock className="w-4 h-4 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.averageTime} min</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Pass Rate
                  </CardTitle>
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.passRate}%</div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: "Total Attempts", icon: <Users className="w-4 h-4 text-blue-600" /> },
              { label: "Average Score", icon: <Target className="w-4 h-4 text-green-600" /> },
              { label: "Average Time", icon: <Clock className="w-4 h-4 text-orange-600" /> },
              { label: "Pass Rate", icon: <TrendingUp className="w-4 h-4 text-purple-600" /> },
            ].map(({ label, icon }) => (
              <Card key={label}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">{label}</CardTitle>
                    {icon}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-300">—</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Detailed Analytics */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-8 text-center text-gray-500">
              <p className="text-lg font-medium">Question-wise Analytics Coming Soon</p>
              <p className="mt-2">
                Will show: Most wrong questions, accuracy rates, time spent per question
              </p>
              <p className="mt-4 text-sm">
                Fetches analytics from:
                <code className="block mt-2 p-2 bg-gray-100 rounded">
                  GET /api/admin/test-series/{testId}/analytics
                </code>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
