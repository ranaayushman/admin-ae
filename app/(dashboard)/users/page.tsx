"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  adminUsersService,
  AdminUser,
} from "@/lib/services/adminUsers.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  Users,
  Search,
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
  Calendar,
  GraduationCap,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
  Target,
  UserCheck,
  UserX,
} from "lucide-react";

// Exam target display names
const examTargetLabels: Record<string, string> = {
  "jee-main": "JEE Main",
  JEE_MAIN: "JEE Main",
  "jee-advanced": "JEE Advanced",
  JEE_ADVANCED: "JEE Advanced",
  neet: "NEET",
  NEET: "NEET",
  WBJEE: "WBJEE",
  wbjee: "WBJEE",
};

// Get badge color for exam target
const getExamBadgeColor = (exam: string): string => {
  const lowerExam = exam.toLowerCase().replace(/[_-]/g, "");
  if (lowerExam.includes("jeeadvanced")) return "bg-purple-100 text-purple-800 border-purple-200";
  if (lowerExam.includes("jeemain")) return "bg-blue-100 text-blue-800 border-blue-200";
  if (lowerExam.includes("neet")) return "bg-green-100 text-green-800 border-green-200";
  if (lowerExam.includes("wbjee")) return "bg-orange-100 text-orange-800 border-orange-200";
  return "bg-gray-100 text-gray-800 border-gray-200";
};

// Format date
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  // Fetch users
  const fetchUsers = useCallback(async (page: number = 1) => {
    try {
      setIsRefreshing(true);
      const data = await adminUsersService.getAllUsers({ page, limit: 20 });
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error: any) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to load users", {
        description: error.message || "Please try again",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filter users based on search
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    
    const query = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.phone.includes(query)
    );
  }, [users, searchQuery]);

  // Calculate stats
  const stats = useMemo(() => {
    const verifiedCount = users.filter((u) => u.isEmailVerified).length;
    const examTargetCounts: Record<string, number> = {};
    const targetYearCounts: Record<number, number> = {};

    users.forEach((user) => {
      user.examTargets.forEach((exam) => {
        const normalizedExam = examTargetLabels[exam] || exam;
        examTargetCounts[normalizedExam] = (examTargetCounts[normalizedExam] || 0) + 1;
      });
      targetYearCounts[user.targetYear] = (targetYearCounts[user.targetYear] || 0) + 1;
    });

    return {
      total: pagination.total,
      verifiedCount,
      unverifiedCount: pagination.total - verifiedCount,
      examTargetCounts,
      targetYearCounts,
    };
  }, [users, pagination.total]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchUsers(newPage);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-gray-500">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="w-8 h-8" />
              All Users
            </h1>
            <p className="text-gray-500 mt-1">
              View and manage all registered users on the platform
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchUsers(pagination.page)}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <UserCheck className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email Verified</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.verifiedCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <UserX className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Not Verified</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.unverifiedCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Exam Targets</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Object.keys(stats.examTargetCounts).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Exam Target Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Users by Exam Target
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Object.entries(stats.examTargetCounts).map(([exam, count]) => (
                  <Badge
                    key={exam}
                    variant="outline"
                    className={`text-sm py-1 px-3 ${getExamBadgeColor(exam)}`}
                  >
                    {exam}: {count}
                  </Badge>
                ))}
                {Object.keys(stats.examTargetCounts).length === 0 && (
                  <p className="text-gray-500 text-sm">No exam targets data</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Users by Target Year
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Object.entries(stats.targetYearCounts)
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .map(([year, count]) => (
                    <Badge
                      key={year}
                      variant="outline"
                      className="text-sm py-1 px-3 bg-indigo-100 text-indigo-800 border-indigo-200"
                    >
                      {year}: {count} users
                    </Badge>
                  ))}
                {Object.keys(stats.targetYearCounts).length === 0 && (
                  <p className="text-gray-500 text-sm">No target year data</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Registered Users</CardTitle>
                <CardDescription>
                  Showing {filteredUsers.length} of {pagination.total} users
                </CardDescription>
              </div>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">
                  {searchQuery ? "No users match your search" : "No users found"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Exam Targets</TableHead>
                      <TableHead className="text-center">Target Year</TableHead>
                      <TableHead className="text-center">Verified</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                              {user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{user.name}</p>
                              <p className="text-xs text-gray-500 truncate max-w-[200px]">
                                ID: {user._id}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="w-3.5 h-3.5 text-gray-400" />
                              <span className="truncate max-w-[180px]">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Phone className="w-3.5 h-3.5 text-gray-400" />
                              <span>{user.phone}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.examTargets.map((exam, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className={`text-xs ${getExamBadgeColor(exam)}`}
                              >
                                {examTargetLabels[exam] || exam}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="font-mono">
                            {user.targetYear}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {user.isEmailVerified ? (
                            <div className="flex items-center justify-center gap-1 text-green-600">
                              <CheckCircle2 className="w-4 h-4" />
                              <span className="text-xs">Verified</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-1 text-red-500">
                              <XCircle className="w-4 h-4" />
                              <span className="text-xs">Pending</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-500">
                            {formatDate(user.createdAt)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <p className="text-sm text-gray-500">
                  Page {pagination.page} of {pagination.totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1 || isRefreshing}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages || isRefreshing}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
