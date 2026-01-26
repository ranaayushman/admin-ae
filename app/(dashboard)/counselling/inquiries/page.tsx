"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  counsellingService,
  GetInquiriesParams,
} from "@/lib/services/counselling.service";
import {
  CounsellingInquiry,
  UpdateInquiryPayload,
} from "@/lib/types/counselling";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  CheckCircle,
  Clock,
  XCircle,
  ArrowRight,
  Eye,
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

const statusConfig: Record<
  string,
  { label: string; color: string; icon: any }
> = {
  new: { label: "New", color: "bg-blue-500", icon: Clock },
  contacted: { label: "Contacted", color: "bg-yellow-500", icon: Phone },
  converted: { label: "Converted", color: "bg-green-500", icon: CheckCircle },
  closed: { label: "Closed", color: "bg-gray-500", icon: XCircle },
};

export default function CounsellingInquiriesPage() {
  const [inquiries, setInquiries] = useState<CounsellingInquiry[]>([]);
  const [stats, setStats] = useState<{
    total: number;
    new: number;
    contacted: number;
    converted: number;
    closed: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterExam, setFilterExam] = useState<string>("all");

  // View/Edit modal
  const [selectedInquiry, setSelectedInquiry] =
    useState<CounsellingInquiry | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch inquiries
  const fetchInquiries = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const params: GetInquiriesParams = {};
      if (filterStatus !== "all") {
        params.status = filterStatus as any;
      }
      if (filterExam !== "all") {
        params.exam = filterExam;
      }
      const response = await counsellingService.getInquiries(params);
      setInquiries(response.data || []);
      setStats(response.stats || null);
    } catch (error: any) {
      console.error("Failed to fetch inquiries:", error);
      toast.error("Failed to load inquiries", {
        description: error.message || "Please try again",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [filterStatus, filterExam]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  // Open view dialog
  const handleView = (inquiry: CounsellingInquiry) => {
    setSelectedInquiry(inquiry);
    setNotes(inquiry.notes || "");
    setIsViewDialogOpen(true);
  };

  // Update inquiry status
  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedInquiry) return;

    try {
      setIsUpdating(true);
      const payload: UpdateInquiryPayload = {
        status: newStatus as any,
        notes: notes,
      };

      await counsellingService.updateInquiry(selectedInquiry._id, payload);

      toast.success("Inquiry updated", {
        description: `Status changed to ${statusConfig[newStatus].label}`,
      });

      fetchInquiries();
      setIsViewDialogOpen(false);
    } catch (error: any) {
      console.error("Failed to update inquiry:", error);
      toast.error("Failed to update inquiry", {
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Save notes only
  const handleSaveNotes = async () => {
    if (!selectedInquiry) return;

    try {
      setIsUpdating(true);
      await counsellingService.updateInquiry(selectedInquiry._id, { notes });

      toast.success("Notes saved");
      fetchInquiries();
    } catch (error: any) {
      toast.error("Failed to save notes");
    } finally {
      setIsUpdating(false);
    }
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
          <h1 className="text-3xl font-bold">Counselling Inquiries</h1>
          <p className="text-muted-foreground">
            Manage leads from the admission guidance form
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchInquiries}
          disabled={isRefreshing}
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-sm text-muted-foreground">Total Inquiries</p>
            </CardContent>
          </Card>
          <Card className="border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">
                {stats.new}
              </div>
              <p className="text-sm text-muted-foreground">New</p>
            </CardContent>
          </Card>
          <Card className="border-yellow-200 dark:border-yellow-800">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-600">
                {stats.contacted}
              </div>
              <p className="text-sm text-muted-foreground">Contacted</p>
            </CardContent>
          </Card>
          <Card className="border-green-200 dark:border-green-800">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">
                {stats.converted}
              </div>
              <p className="text-sm text-muted-foreground">Converted</p>
            </CardContent>
          </Card>
          <Card className="border-gray-200 dark:border-gray-700">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-gray-600">
                {stats.closed}
              </div>
              <p className="text-sm text-muted-foreground">Closed</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="converted">Converted</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterExam} onValueChange={setFilterExam}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by exam" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Exams</SelectItem>
            <SelectItem value="jee-main">JEE Main</SelectItem>
            <SelectItem value="jee-advanced">JEE Advanced</SelectItem>
            <SelectItem value="neet">NEET</SelectItem>
            <SelectItem value="wbjee">WBJEE</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Inquiries Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Exam</TableHead>
              <TableHead>Rank</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Received</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inquiries.map((inquiry) => {
              const StatusIcon = statusConfig[inquiry.status]?.icon || Clock;
              return (
                <TableRow key={inquiry._id}>
                  <TableCell className="font-mono text-sm">
                    {inquiry.ticketNumber ||
                      inquiry._id.slice(-8).toUpperCase()}
                  </TableCell>
                  <TableCell className="font-medium">{inquiry.name}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="w-3 h-3" />
                        <span className="truncate max-w-[150px]">
                          {inquiry.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Phone className="w-3 h-3" />
                        {inquiry.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{inquiry.exam}</Badge>
                  </TableCell>
                  <TableCell>{inquiry.rank || "-"}</TableCell>
                  <TableCell>
                    <Badge
                      className={`${statusConfig[inquiry.status]?.color} text-white`}
                    >
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusConfig[inquiry.status]?.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(inquiry.createdAt))}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleView(inquiry)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {inquiries.length === 0 && (
          <div className="p-8 text-center">
            <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No inquiries found</h3>
            <p className="text-muted-foreground">
              {filterStatus !== "all" || filterExam !== "all"
                ? "Try adjusting your filters"
                : "No admission guidance inquiries yet"}
            </p>
          </div>
        )}
      </Card>

      {/* View/Edit Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Inquiry Details</DialogTitle>
            <DialogDescription>
              Ticket:{" "}
              {selectedInquiry?.ticketNumber ||
                selectedInquiry?._id.slice(-8).toUpperCase()}
            </DialogDescription>
          </DialogHeader>

          {selectedInquiry && (
            <div className="space-y-6">
              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Name</Label>
                  <p className="font-medium">{selectedInquiry.name}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{selectedInquiry.email}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Phone</Label>
                  <p className="font-medium">{selectedInquiry.phone}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">State</Label>
                  <p className="font-medium">{selectedInquiry.state || "-"}</p>
                </div>
              </div>

              {/* Exam Details */}
              <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-muted/50">
                <div className="space-y-1">
                  <Label className="text-muted-foreground flex items-center gap-1">
                    <GraduationCap className="w-4 h-4" />
                    Exam
                  </Label>
                  <p className="font-medium">{selectedInquiry.exam}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground flex items-center gap-1">
                    <Award className="w-4 h-4" />
                    Rank
                  </Label>
                  <p className="font-medium">{selectedInquiry.rank || "-"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Category</Label>
                  <p className="font-medium">
                    {selectedInquiry.category || "-"}
                  </p>
                </div>
              </div>

              {/* Message */}
              {selectedInquiry.message && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Message</Label>
                  <p className="p-3 rounded-lg bg-muted text-sm">
                    {selectedInquiry.message}
                  </p>
                </div>
              )}

              {/* Current Status */}
              <div className="space-y-2">
                <Label className="text-muted-foreground">Current Status</Label>
                <div className="flex items-center gap-2">
                  <Badge
                    className={`${statusConfig[selectedInquiry.status]?.color} text-white`}
                  >
                    {statusConfig[selectedInquiry.status]?.label}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Received {formatDistanceToNow(new Date(selectedInquiry.createdAt))}
                  </span>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Internal Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this inquiry..."
                  rows={3}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveNotes}
                  disabled={isUpdating}
                >
                  Save Notes
                </Button>
              </div>

              {/* Status Actions */}
              <div className="space-y-2">
                <Label>Update Status</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedInquiry.status !== "contacted" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateStatus("contacted")}
                      disabled={isUpdating}
                      className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                    >
                      <Phone className="w-4 h-4 mr-1" />
                      Mark Contacted
                    </Button>
                  )}
                  {selectedInquiry.status !== "converted" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateStatus("converted")}
                      disabled={isUpdating}
                      className="border-green-500 text-green-600 hover:bg-green-50"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Mark Converted
                    </Button>
                  )}
                  {selectedInquiry.status !== "closed" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateStatus("closed")}
                      disabled={isUpdating}
                      className="border-gray-500 text-gray-600 hover:bg-gray-50"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Close
                    </Button>
                  )}
                </div>
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
              <a href={`mailto:${selectedInquiry?.email}`}>
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
