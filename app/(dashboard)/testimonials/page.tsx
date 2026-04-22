"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Eye,
  Loader2,
  MessageSquareQuote,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ImageUploadWithPreview } from "@/components/ui/ImageUploadWithPreview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  testimonialService,
  type CreateTestimonialPayload,
  type TestimonialAdmin,
  type TestimonialStatus,
  type UpdateStatusPayload,
  type UpdateTestimonialPayload,
} from "@/lib/services/testimonial.service";

type StatusFilter = "all" | TestimonialStatus;
type FormMode = "create" | "edit";

type TestimonialFormState = {
  studentName: string;
  quote: string;
  achievementLine: string;
  institutionLine: string;
  rating: string;
  displayOrder: string;
  status: TestimonialStatus;
};

type StatusFormState = {
  status: TestimonialStatus;
  adminNotes: string;
  rejectionReason: string;
};

const DEFAULT_FORM: TestimonialFormState = {
  studentName: "",
  quote: "",
  achievementLine: "",
  institutionLine: "",
  rating: "5",
  displayOrder: "0",
  status: "approved",
};

const DEFAULT_STATUS_FORM: StatusFormState = {
  status: "pending",
  adminNotes: "",
  rejectionReason: "",
};

const PAGE_SIZE = 10;

const getStatusClassName = (status: TestimonialStatus) => {
  if (status === "approved") {
    return "bg-green-100 text-green-700 border-green-200";
  }
  if (status === "rejected") {
    return "bg-red-100 text-red-700 border-red-200";
  }
  return "bg-amber-100 text-amber-700 border-amber-200";
};

const formatDate = (isoDate?: string) => {
  if (!isoDate) return "-";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ratingOptions = ["1", "2", "3", "4", "5"];
const statusOptions: TestimonialStatus[] = ["pending", "approved", "rejected"];

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Please try again.";

export default function TestimonialsPage() {
  const [items, setItems] = useState<TestimonialAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("displayOrder");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("create");
  const [editingItem, setEditingItem] = useState<TestimonialAdmin | null>(null);
  const [formValues, setFormValues] = useState<TestimonialFormState>(DEFAULT_FORM);
  const [avatarBase64, setAvatarBase64] = useState("");
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof TestimonialFormState, string>>>({});
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState<TestimonialAdmin | null>(null);
  const [statusValues, setStatusValues] = useState<StatusFormState>(DEFAULT_STATUS_FORM);
  const [isStatusSubmitting, setIsStatusSubmitting] = useState(false);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<TestimonialAdmin | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<TestimonialAdmin | null>(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearchQuery(searchInput.trim());
    }, 400);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, searchQuery, sortBy, sortOrder]);

  const fetchTestimonials = useCallback(async () => {
    try {
      setIsRefreshing(true);
      if (isLoading) {
        setIsLoading(true);
      }

      const response = await testimonialService.listAdminTestimonials({
        status: statusFilter === "all" ? undefined : statusFilter,
        search: searchQuery || undefined,
        page,
        limit: PAGE_SIZE,
        sortBy,
        sortOrder,
      });

      setItems(response.data);
      setPagination(response.pagination);
    } catch (error: unknown) {
      toast.error("Failed to load testimonials", {
        description: getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [isLoading, page, searchQuery, sortBy, sortOrder, statusFilter]);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const statusCounts = useMemo(() => {
    return {
      all: pagination.total,
      pending: items.filter((item) => item.status === "pending").length,
      approved: items.filter((item) => item.status === "approved").length,
      rejected: items.filter((item) => item.status === "rejected").length,
    };
  }, [items, pagination.total]);

  const pageNumbers = useMemo(() => {
    const totalPages = pagination.totalPages;
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + 4);
    const adjustedStart = Math.max(1, end - 4);

    return Array.from(
      { length: end - adjustedStart + 1 },
      (_, index) => adjustedStart + index,
    );
  }, [page, pagination.totalPages]);

  const openCreateModal = () => {
    setFormMode("create");
    setEditingItem(null);
    setAvatarBase64("");
    setFormValues(DEFAULT_FORM);
    setFormErrors({});
    setIsFormOpen(true);
  };

  const openEditModal = (item: TestimonialAdmin) => {
    setFormMode("edit");
    setEditingItem(item);
    setAvatarBase64("");
    setFormErrors({});
    setFormValues({
      studentName: item.studentName,
      quote: item.quote,
      achievementLine: item.achievementLine,
      institutionLine: item.institutionLine,
      rating: String(item.rating ?? 5),
      displayOrder: String(item.displayOrder ?? 0),
      status: item.status,
    });
    setIsFormOpen(true);
  };

  const validateForm = () => {
    const errors: Partial<Record<keyof TestimonialFormState, string>> = {};

    if (!formValues.studentName.trim()) {
      errors.studentName = "Student name is required.";
    } else if (formValues.studentName.trim().length > 120) {
      errors.studentName = "Max 120 characters allowed.";
    }

    if (!formValues.quote.trim()) {
      errors.quote = "Quote is required.";
    } else if (formValues.quote.trim().length > 1000) {
      errors.quote = "Max 1000 characters allowed.";
    }

    if (!formValues.achievementLine.trim()) {
      errors.achievementLine = "Achievement line is required.";
    } else if (formValues.achievementLine.trim().length > 160) {
      errors.achievementLine = "Max 160 characters allowed.";
    }

    if (!formValues.institutionLine.trim()) {
      errors.institutionLine = "Institution line is required.";
    } else if (formValues.institutionLine.trim().length > 160) {
      errors.institutionLine = "Max 160 characters allowed.";
    }

    const rating = Number(formValues.rating);
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      errors.rating = "Rating must be between 1 and 5.";
    }

    const displayOrder = Number(formValues.displayOrder);
    if (!Number.isFinite(displayOrder)) {
      errors.displayOrder = "Display order must be a number.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix form errors before saving.");
      return;
    }

    setIsFormSubmitting(true);

    try {
      const basePayload = {
        studentName: formValues.studentName.trim(),
        quote: formValues.quote.trim(),
        achievementLine: formValues.achievementLine.trim(),
        institutionLine: formValues.institutionLine.trim(),
        rating: Number(formValues.rating),
        displayOrder: Number(formValues.displayOrder),
        status: formValues.status,
      };

      if (formMode === "create") {
        const payload: CreateTestimonialPayload = {
          ...basePayload,
          ...(avatarBase64 ? { avatarBase64 } : {}),
        };

        await testimonialService.createAdminTestimonial(payload);
        toast.success("Testimonial created successfully");
      }

      if (formMode === "edit" && editingItem) {
        const payload: UpdateTestimonialPayload = {
          ...basePayload,
          ...(avatarBase64 ? { avatarBase64 } : {}),
        };

        await testimonialService.updateAdminTestimonial(editingItem.id, payload);
        toast.success("Testimonial updated successfully");
      }

      setIsFormOpen(false);
      await fetchTestimonials();
    } catch (error: unknown) {
      toast.error("Failed to save testimonial", {
        description: getErrorMessage(error),
      });
    } finally {
      setIsFormSubmitting(false);
    }
  };

  const openStatusModal = (item: TestimonialAdmin) => {
    setStatusTarget(item);
    setStatusValues({
      status: item.status,
      adminNotes: "",
      rejectionReason: item.rejectionReason || "",
    });
    setIsStatusModalOpen(true);
  };

  const handleStatusSubmit = async () => {
    if (!statusTarget) return;

    if (
      statusValues.status === "rejected" &&
      !statusValues.rejectionReason.trim()
    ) {
      toast.error("Rejection reason is required for rejected status.");
      return;
    }

    setIsStatusSubmitting(true);

    try {
      const payload: UpdateStatusPayload = {
        status: statusValues.status,
        ...(statusValues.adminNotes.trim()
          ? { adminNotes: statusValues.adminNotes.trim() }
          : {}),
        ...(statusValues.status === "rejected" && statusValues.rejectionReason.trim()
          ? { rejectionReason: statusValues.rejectionReason.trim() }
          : {}),
      };

      const updated = await testimonialService.updateAdminTestimonialStatus(
        statusTarget.id,
        payload,
      );

      setItems((previous) => {
        const next = previous.map((item) =>
          item.id === updated.id ? updated : item,
        );

        if (statusFilter !== "all" && updated.status !== statusFilter) {
          return next.filter((item) => item.id !== updated.id);
        }

        return next;
      });

      if (detailItem?.id === updated.id) {
        setDetailItem(updated);
      }

      toast.success("Status updated successfully");
      setIsStatusModalOpen(false);
    } catch (error: unknown) {
      toast.error("Failed to update status", {
        description: getErrorMessage(error),
      });
    } finally {
      setIsStatusSubmitting(false);
    }
  };

  const openDetailModal = async (id: string) => {
    setIsDetailOpen(true);
    setIsDetailLoading(true);

    try {
      const data = await testimonialService.getAdminTestimonialById(id);
      setDetailItem(data);
    } catch (error: unknown) {
      toast.error("Failed to load testimonial details", {
        description: getErrorMessage(error),
      });
      setIsDetailOpen(false);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleteLoading(true);

    try {
      await testimonialService.deleteAdminTestimonial(deleteTarget.id);

      setItems((previous) =>
        previous.filter((item) => item.id !== deleteTarget.id),
      );
      setPagination((previous) => {
        const nextTotal = Math.max(0, previous.total - 1);
        const nextTotalPages = Math.max(1, Math.ceil(nextTotal / previous.limit));

        return {
          ...previous,
          total: nextTotal,
          totalPages: nextTotalPages,
          page: Math.min(previous.page, nextTotalPages),
        };
      });

      toast.success("Testimonial deleted");
      setDeleteTarget(null);

      if (items.length === 1 && page > 1) {
        setPage((previous) => previous - 1);
      }
    } catch (error: unknown) {
      toast.error("Failed to delete testimonial", {
        description: getErrorMessage(error),
      });
    } finally {
      setIsDeleteLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading testimonials...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <MessageSquareQuote className="h-7 w-7" />
              Testimonials
            </h1>
            <p className="text-gray-500 mt-1">
              Create, review, approve, and manage student testimonials.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={fetchTestimonials} disabled={isRefreshing}>
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Refresh
            </Button>
            <Button onClick={openCreateModal}>
              <Plus className="h-4 w-4 mr-2" />
              Add Testimonial
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as StatusFilter)}
            >
              <TabsList>
                <TabsTrigger value="all">All ({statusCounts.all})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({statusCounts.pending})</TabsTrigger>
                <TabsTrigger value="approved">Approved ({statusCounts.approved})</TabsTrigger>
                <TabsTrigger value="rejected">Rejected ({statusCounts.rejected})</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              <div className="md:col-span-2 relative">
                <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search by student, quote, achievement, institution"
                  className="pl-9"
                />
              </div>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort field" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="displayOrder">Display Order</SelectItem>
                  <SelectItem value="createdAt">Created Date</SelectItem>
                  <SelectItem value="updatedAt">Updated Date</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={sortOrder}
                onValueChange={(value) => setSortOrder(value as "asc" | "desc")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort direction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Avatar</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Achievement</TableHead>
                  <TableHead>Institution</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Display Order</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-gray-500">
                      No testimonials found for the selected filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {item.avatarUrl ? (
                          <img
                            src={item.avatarUrl}
                            alt={item.studentName}
                            className="h-10 w-10 rounded-full object-cover border"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600">
                            {item.studentName.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{item.studentName}</TableCell>
                      <TableCell className="max-w-[180px] truncate" title={item.achievementLine}>
                        {item.achievementLine}
                      </TableCell>
                      <TableCell className="max-w-[180px] truncate" title={item.institutionLine}>
                        {item.institutionLine}
                      </TableCell>
                      <TableCell>{item.rating}/5</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${getStatusClassName(item.status)}`}
                        >
                          {item.status}
                        </span>
                      </TableCell>
                      <TableCell>{item.displayOrder}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDetailModal(item.id)}
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(item)}
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openStatusModal(item)}
                            title="Change status"
                          >
                            <ShieldCheck className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteTarget(item)}
                            title="Delete"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-gray-600">
                Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
              </p>

              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1 || isRefreshing}
                  onClick={() => setPage((previous) => Math.max(1, previous - 1))}
                >
                  Previous
                </Button>

                {pageNumbers.map((pageNumber) => (
                  <Button
                    key={pageNumber}
                    variant={pageNumber === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pagination.totalPages || isRefreshing}
                  onClick={() =>
                    setPage((previous) => Math.min(pagination.totalPages, previous + 1))
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {formMode === "create" ? "Add Testimonial" : "Edit Testimonial"}
            </DialogTitle>
            <DialogDescription>
              {formMode === "create"
                ? "Create a new testimonial for the public website."
                : "Update testimonial details and review status."}
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleFormSubmit}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="studentName">Student Name</Label>
                <Input
                  id="studentName"
                  value={formValues.studentName}
                  onChange={(event) =>
                    setFormValues((previous) => ({
                      ...previous,
                      studentName: event.target.value,
                    }))
                  }
                />
                {formErrors.studentName ? (
                  <p className="text-sm text-red-600">{formErrors.studentName}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="achievementLine">Achievement Line</Label>
                <Input
                  id="achievementLine"
                  value={formValues.achievementLine}
                  onChange={(event) =>
                    setFormValues((previous) => ({
                      ...previous,
                      achievementLine: event.target.value,
                    }))
                  }
                />
                {formErrors.achievementLine ? (
                  <p className="text-sm text-red-600">{formErrors.achievementLine}</p>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="institutionLine">Institution Line</Label>
              <Input
                id="institutionLine"
                value={formValues.institutionLine}
                onChange={(event) =>
                  setFormValues((previous) => ({
                    ...previous,
                    institutionLine: event.target.value,
                  }))
                }
              />
              {formErrors.institutionLine ? (
                <p className="text-sm text-red-600">{formErrors.institutionLine}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quote">Quote</Label>
              <Textarea
                id="quote"
                rows={5}
                value={formValues.quote}
                onChange={(event) =>
                  setFormValues((previous) => ({ ...previous, quote: event.target.value }))
                }
              />
              {formErrors.quote ? (
                <p className="text-sm text-red-600">{formErrors.quote}</p>
              ) : null}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Rating</Label>
                <Select
                  value={formValues.rating}
                  onValueChange={(value) =>
                    setFormValues((previous) => ({ ...previous, rating: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent>
                    {ratingOptions.map((value) => (
                      <SelectItem value={value} key={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.rating ? (
                  <p className="text-sm text-red-600">{formErrors.rating}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayOrder">Display Order</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  value={formValues.displayOrder}
                  onChange={(event) =>
                    setFormValues((previous) => ({
                      ...previous,
                      displayOrder: event.target.value,
                    }))
                  }
                />
                {formErrors.displayOrder ? (
                  <p className="text-sm text-red-600">{formErrors.displayOrder}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formValues.status}
                  onValueChange={(value) =>
                    setFormValues((previous) => ({
                      ...previous,
                      status: value as TestimonialStatus,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((value) => (
                      <SelectItem key={value} value={value} className="capitalize">
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <ImageUploadWithPreview
              onImageChange={setAvatarBase64}
              currentImage={editingItem?.avatarUrl}
              maxSizeMB={2}
              label="Avatar"
              description="Upload student avatar image"
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
                disabled={isFormSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isFormSubmitting}>
                {isFormSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {formMode === "create" ? "Create" : "Update"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Update Testimonial Status</DialogTitle>
            <DialogDescription>
              Change testimonial review status and provide rejection reason if required.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={statusValues.status}
                onValueChange={(value) =>
                  setStatusValues((previous) => ({
                    ...previous,
                    status: value as TestimonialStatus,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((value) => (
                    <SelectItem key={value} value={value} className="capitalize">
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminNotes">Admin Notes (optional)</Label>
              <Textarea
                id="adminNotes"
                rows={3}
                value={statusValues.adminNotes}
                onChange={(event) =>
                  setStatusValues((previous) => ({
                    ...previous,
                    adminNotes: event.target.value,
                  }))
                }
              />
            </div>

            {statusValues.status === "rejected" ? (
              <div className="space-y-2">
                <Label htmlFor="rejectionReason">Rejection Reason</Label>
                <Textarea
                  id="rejectionReason"
                  rows={3}
                  value={statusValues.rejectionReason}
                  onChange={(event) =>
                    setStatusValues((previous) => ({
                      ...previous,
                      rejectionReason: event.target.value,
                    }))
                  }
                />
                {!statusValues.rejectionReason.trim() ? (
                  <p className="text-sm text-amber-700">
                    Rejection reason is required when status is rejected.
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsStatusModalOpen(false)}
              disabled={isStatusSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleStatusSubmit} disabled={isStatusSubmitting}>
              {isStatusSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDetailOpen}
        onOpenChange={(open) => {
          setIsDetailOpen(open);
          if (!open) {
            setDetailItem(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Testimonial Details</DialogTitle>
            <DialogDescription>
              Review content and audit metadata for this testimonial.
            </DialogDescription>
          </DialogHeader>

          {isDetailLoading ? (
            <div className="py-8 flex items-center justify-center gap-2 text-gray-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading details...
            </div>
          ) : detailItem ? (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                {detailItem.avatarUrl ? (
                  <img
                    src={detailItem.avatarUrl}
                    alt={detailItem.studentName}
                    className="h-16 w-16 rounded-full border object-cover"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-gray-200 border flex items-center justify-center font-semibold text-gray-700">
                    {detailItem.studentName.slice(0, 2).toUpperCase()}
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold">{detailItem.studentName}</h3>
                  <p className="text-gray-600">{detailItem.achievementLine}</p>
                  <p className="text-gray-500 text-sm">{detailItem.institutionLine}</p>
                </div>
              </div>

              <div className="rounded-lg border bg-gray-50 p-4">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{detailItem.quote}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Status:</span>{" "}
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${getStatusClassName(detailItem.status)}`}
                    >
                      {detailItem.status}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium">Rating:</span> {detailItem.rating}/5
                  </p>
                  <p>
                    <span className="font-medium">Display Order:</span> {detailItem.displayOrder}
                  </p>
                  <p>
                    <span className="font-medium">Rejected Reason:</span>{" "}
                    {detailItem.rejectionReason || "-"}
                  </p>
                </div>

                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Approved By:</span> {detailItem.approvedBy || "-"}
                  </p>
                  <p>
                    <span className="font-medium">Approved At:</span> {formatDate(detailItem.approvedAt)}
                  </p>
                  <p>
                    <span className="font-medium">Created At:</span> {formatDate(detailItem.createdAt)}
                  </p>
                  <p>
                    <span className="font-medium">Updated At:</span> {formatDate(detailItem.updatedAt)}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    openEditModal(detailItem);
                    setIsDetailOpen(false);
                  }}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    openStatusModal(detailItem);
                    setIsDetailOpen(false);
                  }}
                >
                  {detailItem.status === "approved" ? (
                    <XCircle className="h-4 w-4 mr-2" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  )}
                  Change Status
                </Button>
                <Button
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => {
                    setDeleteTarget(detailItem);
                    setIsDetailOpen(false);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          ) : (
            <p className="py-8 text-center text-gray-500">No details found.</p>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete testimonial"
        description={`Are you sure you want to delete ${deleteTarget?.studentName || "this testimonial"}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleteLoading}
      />
    </div>
  );
}
