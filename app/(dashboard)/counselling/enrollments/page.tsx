"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { counsellingService } from "@/lib/services/counselling.service";
import { counsellorService } from "@/lib/services/counsellor.service";
import {
  CounsellingEnrollment,
  CounsellingPackage,
  Counsellor,
} from "@/lib/types/counselling";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
  Plus,
  User,
  Package,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserPlus,
} from "lucide-react";

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: "Active", color: "bg-green-500" },
  expired: { label: "Expired", color: "bg-gray-500" },
  cancelled: { label: "Cancelled", color: "bg-red-500" },
  refunded: { label: "Refunded", color: "bg-purple-500" },
};

// Manual Enrollment Schema
const manualEnrollmentSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  packageId: z.string().min(1, "Package ID is required"),
  counsellorId: z.string().optional(),
  notes: z.string().optional(),
  skipPayment: z.boolean().optional(),
});

type ManualEnrollmentFormValues = z.infer<typeof manualEnrollmentSchema>;

export default function CounsellingEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<CounsellingEnrollment[]>([]);
  const [packages, setPackages] = useState<CounsellingPackage[]>([]);
  const [counsellors, setCounsellors] = useState<Counsellor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Dialog states
  const [isManualEnrollDialogOpen, setIsManualEnrollDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] =
    useState<CounsellingEnrollment | null>(null);
  const [selectedCounsellorId, setSelectedCounsellorId] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Manual Enrollment Form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ManualEnrollmentFormValues>({
    resolver: zodResolver(manualEnrollmentSchema),
    defaultValues: {
      userId: "",
      packageId: "",
      counsellorId: "",
      notes: "Manual enrollment by admin",
      skipPayment: true,
    },
  });

  // Fetch Data
  const fetchData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const [enrollmentsRes, packagesRes, counsellorsRes] = await Promise.all([
        counsellingService.getEnrollments({
          status:
            filterStatus !== "all"
              ? (filterStatus as any)
              : undefined,
        }),
        counsellingService.getPackages({ isActive: true }),
        counsellorService.getCounsellors({ isActive: true }),
      ]);

      setEnrollments(enrollmentsRes.data || []);
      setPackages(packagesRes || []);
      setCounsellors(counsellorsRes || []);
    } catch (error: any) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handlers
  const handleOpenAssign = (enrollment: CounsellingEnrollment) => {
    setSelectedEnrollment(enrollment);
    setSelectedCounsellorId(enrollment.assignedCounsellor?._id || "");
    setIsAssignDialogOpen(true);
  };

  const handleAssignCounsellor = async () => {
    if (!selectedEnrollment || !selectedCounsellorId) return;
    try {
      setIsUpdating(true);
      await counsellingService.assignCounsellor(
        selectedEnrollment._id,
        selectedCounsellorId
      );
      toast.success("Counsellor assigned successfully");
      fetchData();
      setIsAssignDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to assign counsellor");
    } finally {
      setIsUpdating(false);
    }
  };

  const onManualEnrollmentSubmit = async (data: ManualEnrollmentFormValues) => {
    try {
      setIsUpdating(true);
      await counsellingService.createManualEnrollment(data);
      toast.success("User enrolled successfully");
      fetchData();
      setIsManualEnrollDialogOpen(false);
      reset();
    } catch (error: any) {
      toast.error(error.message || "Failed to enroll user");
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
          <h1 className="text-3xl font-bold">Enrollments</h1>
          <p className="text-muted-foreground">
            Manage student enrollments and counsellor assignments
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchData}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button onClick={() => setIsManualEnrollDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Manual Enrollment
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Enrollments List */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Package</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sessions</TableHead>
              <TableHead>Assigned Counsellor</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {enrollments.map((enrollment) => {
              const status = statusConfig[enrollment.status] || {
                label: enrollment.status,
                color: "bg-gray-500",
              };

              return (
                <TableRow key={enrollment._id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">
                        {enrollment.user?.name || "N/A"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {enrollment.user?.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {enrollment.package?.name || "N/A"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${status.color} text-white`}>
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <span className="font-medium">
                        {enrollment.sessionsUsed}
                      </span>{" "}
                      / {enrollment.sessionsUsed + enrollment.sessionsRemaining}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {enrollment.assignedCounsellor ? (
                        <>
                          <div className="text-sm">
                            {enrollment.assignedCounsellor.name}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleOpenAssign(enrollment)}
                          >
                            <RefreshCw className="w-3 h-3" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenAssign(enrollment)}
                        >
                          <UserPlus className="w-3 h-3 mr-1" />
                          Assign
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(enrollment.expiresAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {/* Add more actions if needed */}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {enrollments.length === 0 && (
          <div className="p-12 text-center text-muted-foreground">
            No enrollments found.
          </div>
        )}
      </Card>

      {/* Manual Enrollment Dialog */}
      <Dialog
        open={isManualEnrollDialogOpen}
        onOpenChange={setIsManualEnrollDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manual Enrollment</DialogTitle>
            <DialogDescription>
              Grant user access to a counselling package (Free)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>User ID</Label>
              <Input
                {...register("userId")}
                placeholder="User Object ID"
              />
              {errors.userId && (
                <p className="text-xs text-red-500">{errors.userId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Package</Label>
              <Select
                onValueChange={(val) => setValue("packageId", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Package" />
                </SelectTrigger>
                <SelectContent>
                  {packages.map((pkg) => (
                    <SelectItem key={pkg._id} value={pkg._id}>
                      {pkg.name} ({pkg.examType})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.packageId && (
                <p className="text-xs text-red-500">
                  {errors.packageId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Assign Counsellor (Optional)</Label>
              <Select
                onValueChange={(val) => setValue("counsellorId", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Counsellor" />
                </SelectTrigger>
                <SelectContent>
                  {counsellors.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea {...register("notes")} placeholder="Reason for free access" />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsManualEnrollDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit(onManualEnrollmentSubmit)}
              disabled={isUpdating}
            >
              {isUpdating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Enroll
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Counsellor Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Counsellor</DialogTitle>
            <DialogDescription>
              Pre-assign a counsellor to all sessions for this enrollment.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Counsellor</Label>
              <Select
                value={selectedCounsellorId}
                onValueChange={setSelectedCounsellorId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose counsellor..." />
                </SelectTrigger>
                <SelectContent>
                  {counsellors.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAssignDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAssignCounsellor} disabled={isUpdating}>
              {isUpdating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
