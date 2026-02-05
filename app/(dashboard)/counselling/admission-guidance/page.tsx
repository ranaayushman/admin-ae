"use client";

import React, { useState, useEffect, useCallback } from "react";
import { counsellingService } from "@/lib/services/counselling.service";
import { AdmissionGuidance } from "@/lib/types/counselling";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Loader2,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Award,
  Calendar,
  MessageSquare,
  Eye,
  ChevronLeft,
  ChevronRight,
  User,
  Percent,
  BookOpen,
  Download,
  FileSpreadsheet,
  FileText,
} from "lucide-react";

// Simple time ago formatter
function formatDistanceToNow(date: Date | string): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? "s" : ""} ago`;
  return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
}

const examLabels: Record<string, string> = {
  "jee-main": "JEE Main",
  "jee-advanced": "JEE Advanced",
  "neet-ug": "NEET UG",
  "wbjee": "WBJEE",
  "other-state-exam": "Other State Exam",
};

const categoryLabels: Record<string, string> = {
  "general": "General",
  "obc-ncl": "OBC-NCL",
  "sc": "SC",
  "st": "ST",
  "ews": "EWS",
  "pwd": "PwD",
};

const class12StatusLabels: Record<string, { label: string; color: string }> = {
  "appearing": { label: "Appearing", color: "bg-blue-500" },
  "passed": { label: "Passed", color: "bg-green-500" },
};

export default function AdmissionGuidancePage() {
  const [submissions, setSubmissions] = useState<AdmissionGuidance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // Filters
  const [filterExam, setFilterExam] = useState<string>("all");

  // View modal
  const [selectedSubmission, setSelectedSubmission] =
    useState<AdmissionGuidance | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Fetch submissions
  const fetchSubmissions = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const params: { page: number; limit: number; exam?: string } = {
        page: currentPage,
        limit,
      };
      if (filterExam !== "all") {
        params.exam = filterExam;
      }
      const response = await counsellingService.getAdmissionGuidance(params);
      setSubmissions(response.data || []);
      setTotal(response.total || 0);
      setTotalPages(response.totalPages || 1);
    } catch (error: any) {
      console.error("Failed to fetch submissions:", error);
      toast.error("Failed to load admission guidance submissions", {
        description: error.message || "Please try again",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [currentPage, filterExam]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  // Open view dialog
  const handleView = (submission: AdmissionGuidance) => {
    setSelectedSubmission(submission);
    setIsViewDialogOpen(true);
  };

  // Pagination handlers
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    if (submissions.length === 0) {
      toast.warning("No data to export");
      return;
    }

    const headers = [
      "Full Name",
      "Email",
      "Phone",
      "Exam",
      "Rank/Score",
      "Category",
      "Home State",
      "Class 12 Status",
      "10th Percentage",
      "12th Percentage",
      "Additional Message",
      "Submitted At",
    ];

    const rows = submissions.map((s) => [
      s.fullName,
      s.email,
      s.phone,
      examLabels[s.exam] || s.exam,
      s.rankScore || "-",
      categoryLabels[s.category] || s.category,
      s.homeState,
      class12StatusLabels[s.class12Status]?.label || s.class12Status,
      s.tenthPercentage,
      s.twelfthPercentageExpected || "-",
      s.additionalMessage || "-",
      new Date(s.createdAt).toLocaleString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `admission_guidance_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("CSV exported successfully");
  };

  // Export to PDF (using print-friendly HTML)
  const exportToPDF = () => {
    if (submissions.length === 0) {
      toast.warning("No data to export");
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow popups for PDF export");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Admission Guidance Submissions</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
          }
          h1 {
            color: #333;
            border-bottom: 2px solid #2596be;
            padding-bottom: 10px;
          }
          .meta {
            color: #666;
            margin-bottom: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            font-size: 12px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #2596be;
            color: white;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 500;
          }
          .appearing { background: #3b82f6; color: white; }
          .passed { background: #22c55e; color: white; }
          @media print {
            body { padding: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <h1>Admission Guidance Submissions</h1>
        <p class="meta">Generated on: ${new Date().toLocaleString()} | Total: ${submissions.length} submissions</p>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Exam</th>
              <th>Rank/Score</th>
              <th>Category</th>
              <th>State</th>
              <th>Class 12</th>
              <th>10th %</th>
              <th>12th %</th>
              <th>Submitted</th>
            </tr>
          </thead>
          <tbody>
            ${submissions
              .map(
                (s) => `
              <tr>
                <td>${s.fullName}</td>
                <td>${s.email}</td>
                <td>${s.phone}</td>
                <td>${examLabels[s.exam] || s.exam}</td>
                <td>${s.rankScore || "-"}</td>
                <td>${categoryLabels[s.category] || s.category}</td>
                <td>${s.homeState}</td>
                <td><span class="badge ${s.class12Status}">${class12StatusLabels[s.class12Status]?.label || s.class12Status}</span></td>
                <td>${s.tenthPercentage}</td>
                <td>${s.twelfthPercentageExpected || "-"}</td>
                <td>${new Date(s.createdAt).toLocaleDateString()}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    toast.success("PDF export window opened - use Ctrl/Cmd + P to save as PDF");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admission Guidance Submissions</h1>
          <p className="text-muted-foreground">
            View all submissions from the admission guidance form
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchSubmissions}
          disabled={isRefreshing}
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{total}</div>
            <p className="text-sm text-muted-foreground">Total Submissions</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {submissions.filter((s) => s.class12Status === "appearing").length}
            </div>
            <p className="text-sm text-muted-foreground">Appearing</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {submissions.filter((s) => s.class12Status === "passed").length}
            </div>
            <p className="text-sm text-muted-foreground">Passed</p>
          </CardContent>
        </Card>
        <Card className="border-purple-200 dark:border-purple-800">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">
              {submissions.filter((s) => s.exam === "neet-ug").length}
            </div>
            <p className="text-sm text-muted-foreground">NEET Aspirants</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Export */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <Select value={filterExam} onValueChange={(value) => {
          setFilterExam(value);
          setCurrentPage(1);
        }}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by exam" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Exams</SelectItem>
            <SelectItem value="jee-main">JEE Main</SelectItem>
            <SelectItem value="jee-advanced">JEE Advanced</SelectItem>
            <SelectItem value="neet-ug">NEET UG</SelectItem>
            <SelectItem value="wbjee">WBJEE</SelectItem>
            <SelectItem value="other-state-exam">Other State Exam</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex-1" />

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={exportToCSV}
            disabled={submissions.length === 0}
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            onClick={exportToPDF}
            disabled={submissions.length === 0}
          >
            <FileText className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Submissions Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Exam</TableHead>
              <TableHead>Rank/Score</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Class 12</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.map((submission) => (
              <TableRow key={submission._id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    {submission.fullName}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm">
                      <Mail className="w-3 h-3" />
                      <span className="truncate max-w-[150px]">
                        {submission.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Phone className="w-3 h-3" />
                      {submission.phone}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {examLabels[submission.exam] || submission.exam}
                  </Badge>
                </TableCell>
                <TableCell>{submission.rankScore || "-"}</TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {categoryLabels[submission.category] || submission.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    className={`${class12StatusLabels[submission.class12Status]?.color || "bg-gray-500"} text-white`}
                  >
                    {class12StatusLabels[submission.class12Status]?.label || submission.class12Status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(submission.createdAt))}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleView(submission)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {submissions.length === 0 && (
          <div className="p-8 text-center">
            <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No submissions found</h3>
            <p className="text-muted-foreground">
              {filterExam !== "all"
                ? "Try adjusting your filters"
                : "No admission guidance submissions yet"}
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t">
            <p className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages} ({total} total)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
            <DialogDescription>
              Submitted {selectedSubmission && formatDistanceToNow(selectedSubmission.createdAt)}
            </DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-6">
              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{selectedSubmission.fullName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedSubmission.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedSubmission.phone}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Home State</p>
                  <p className="font-medium flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {selectedSubmission.homeState}
                  </p>
                </div>
              </div>

              {/* Exam Details */}
              <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-muted/50">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <GraduationCap className="w-4 h-4" />
                    Exam
                  </p>
                  <p className="font-medium">
                    {examLabels[selectedSubmission.exam] || selectedSubmission.exam}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Award className="w-4 h-4" />
                    Rank / Score
                  </p>
                  <p className="font-medium">{selectedSubmission.rankScore || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium">
                    {categoryLabels[selectedSubmission.category] || selectedSubmission.category}
                  </p>
                </div>
              </div>

              {/* Academic Details */}
              <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-muted/50">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    Class 12 Status
                  </p>
                  <Badge
                    className={`${class12StatusLabels[selectedSubmission.class12Status]?.color || "bg-gray-500"} text-white`}
                  >
                    {class12StatusLabels[selectedSubmission.class12Status]?.label || selectedSubmission.class12Status}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Percent className="w-4 h-4" />
                    10th %
                  </p>
                  <p className="font-medium">{selectedSubmission.tenthPercentage}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Percent className="w-4 h-4" />
                    12th % {selectedSubmission.class12Status === "appearing" ? "(Expected)" : ""}
                  </p>
                  <p className="font-medium">
                    {selectedSubmission.twelfthPercentageExpected || "-"}
                  </p>
                </div>
              </div>

              {/* Additional Message */}
              {selectedSubmission.additionalMessage && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Additional Message</p>
                  <p className="p-3 rounded-lg bg-muted text-sm">
                    {selectedSubmission.additionalMessage}
                  </p>
                </div>
              )}

              {/* Timestamps */}
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Submitted on {new Date(selectedSubmission.createdAt).toLocaleString()}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
            >
              Close
            </Button>
            <Button asChild>
              <a href={`mailto:${selectedSubmission?.email}`}>
                <Mail className="w-4 h-4 mr-2" />
                Send Email
              </a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
