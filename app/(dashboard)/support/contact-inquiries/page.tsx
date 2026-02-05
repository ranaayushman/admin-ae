"use client";

import React, { useState, useEffect, useCallback } from "react";
import { contactService } from "@/lib/services/contact.service";
import { ContactInquiry } from "@/lib/types/contact";
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
  MessageSquare,
  Eye,
  ChevronLeft,
  ChevronRight,
  Clock,
  CalendarDays,
} from "lucide-react";

export default function ContactInquiriesPage() {
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // View modal
  const [selectedInquiry, setSelectedInquiry] =
    useState<ContactInquiry | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Fetch inquiries
  const fetchInquiries = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const data = await contactService.getContactInquiries({
        page: currentPage,
        limit,
      });
      setInquiries(data.data || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (error: any) {
      console.error("Failed to fetch inquiries:", error);
      toast.error("Failed to load contact inquiries", {
        description: error.message || "Please try again",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  // Open view dialog
  const handleView = (inquiry: ContactInquiry) => {
    setSelectedInquiry(inquiry);
    setIsViewDialogOpen(true);
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
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MessageSquare className="w-8 h-8 text-primary" />
            Contact Inquiries
          </h1>
          <p className="text-muted-foreground">
            View and manage user inquiries and support requests
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

      {/* Stats Cards (Simplified) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{total}</div>
            <p className="text-sm text-muted-foreground">Total Inquiries</p>
          </CardContent>
        </Card>
      </div>

      {/* Inquiries Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Message Preview</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inquiries.map((inquiry) => (
              <TableRow key={inquiry._id}>
                <TableCell>
                  <div className="font-medium">{inquiry.fullName}</div>
                  <div className="text-xs text-muted-foreground">{inquiry.email}</div>
                  {inquiry.phone && (
                    <div className="text-xs text-muted-foreground">{inquiry.phone}</div>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{inquiry.subject}</Badge>
                </TableCell>
                <TableCell className="max-w-xs truncate text-muted-foreground">
                  {inquiry.message}
                </TableCell>
                <TableCell>
                  {inquiry.isRead ? (
                     <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400">Read</Badge>
                  ) : (
                    <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">New</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {new Date(inquiry.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(inquiry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleView(inquiry)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {inquiries.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No inquiries found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-4 border-t">
             <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Inquiry Details</DialogTitle>
            <DialogDescription>
              Received on {selectedInquiry && new Date(selectedInquiry.createdAt).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          
          {selectedInquiry && (
            <div className="grid gap-6 py-4">
              {/* User Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Full Name</label>
                  <div className="font-medium flex items-center gap-2">
                    {selectedInquiry.fullName}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Email</label>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3 text-muted-foreground" />
                    <a href={`mailto:${selectedInquiry.email}`} className="hover:underline text-blue-500">
                      {selectedInquiry.email}
                    </a>
                  </div>
                </div>
                {selectedInquiry.phone && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Phone</label>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3 text-muted-foreground" />
                      <a href={`tel:${selectedInquiry.phone}`} className="hover:underline">
                        {selectedInquiry.phone}
                      </a>
                    </div>
                  </div>
                )}
                <div>
                   <label className="text-xs font-medium text-muted-foreground">Subject</label>
                   <div>
                     <Badge variant="outline" className="mt-1">{selectedInquiry.subject}</Badge>
                   </div>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="text-sm font-medium mb-2 block">Message</label>
                <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm whitespace-pre-wrap">
                  {selectedInquiry.message}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
                if(selectedInquiry) {
                    window.location.href = `mailto:${selectedInquiry.email}?subject=Re: ${selectedInquiry.subject}`;
                }
            }}>
              Reply via Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
