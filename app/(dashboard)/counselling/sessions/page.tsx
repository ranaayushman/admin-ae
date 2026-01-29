"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  counsellingService,
} from "@/lib/services/counselling.service";
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
  Video,
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Link as LinkIcon,
  Eye,
} from "lucide-react";

// Simple time ago formatter
function formatDistanceToNow(date: Date | string): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  scheduled: { label: "Scheduled", color: "bg-blue-500", icon: Calendar },
  completed: { label: "Completed", color: "bg-green-500", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-red-500", icon: XCircle },
  "no-show": { label: "No Show", color: "bg-orange-500", icon: AlertCircle },
};

interface Session {
  _id: string;
  userId: string;
  user?: {
    name: string;
    email: string;
    phone: string;
  };
  counsellorId: string;
  counsellor?: {
    _id: string;
    name: string;
    email: string;
  };
  enrollmentId?: string;
  preferredDate: string;
  preferredTimeSlot: string;
  status: "scheduled" | "completed" | "cancelled" | "no-show";
  meetingLink?: string;
  meetingPlatform?: string;
  agenda?: string;
  notes?: string;
  nextSteps?: string;
  createdAt: string;
}

export default function CounsellingSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Dialog states
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);

  // Form states
  const [meetingLink, setMeetingLink] = useState("");
  const [meetingPlatform, setMeetingPlatform] = useState("");
  const [notes, setNotes] = useState("");
  const [nextSteps, setNextSteps] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch sessions
  const fetchSessions = useCallback(async () => {
    try {
      setIsRefreshing(true);
      // Note: This endpoint doesn't exist yet in the service, using placeholder
      const response = await counsellingService.getMySessions({
        status: filterStatus !== "all" ? filterStatus : undefined,
      });
      setSessions(response || []);
    } catch (error: any) {
      console.error("Failed to fetch sessions:", error);
      toast.error("Failed to load sessions", {
        description: error.message || "Please try again",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleView = (session: Session) => {
    setSelectedSession(session);
    setIsViewDialogOpen(true);
  };

  const handleOpenStatusDialog = (session: Session) => {
    setSelectedSession(session);
    setNotes(session.notes || "");
    setNextSteps(session.nextSteps || "");
    setNewStatus(session.status);
    setIsStatusDialogOpen(true);
  };

  const handleOpenLinkDialog = (session: Session) => {
    setSelectedSession(session);
    setMeetingLink(session.meetingLink || "");
    setMeetingPlatform(session.meetingPlatform || "zoom");
    setIsLinkDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedSession) return;

    try {
      setIsUpdating(true);
      await counsellingService.updateSessionStatus(selectedSession._id, {
        status: newStatus,
        notes,
        nextSteps,
      });

      toast.success("Session updated", {
        description: `Status changed to ${statusConfig[newStatus].label}`,
      });

      fetchSessions();
      setIsStatusDialogOpen(false);
    } catch (error: any) {
      toast.error("Failed to update session", {
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddMeetingLink = async () => {
    if (!selectedSession) return;

    try {
      setIsUpdating(true);
      await counsellingService.addMeetingLink(selectedSession._id, {
        meetingLink,
        meetingPlatform,
      });

      toast.success("Meeting link added", {
        description: "Session updated successfully",
      });

      fetchSessions();
      setIsLinkDialogOpen(false);
    } catch (error: any) {
      toast.error("Failed to add meeting link", {
        description: error.response?.data?.message || error.message,
      });
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
          <h1 className="text-3xl font-bold">Counselling Sessions</h1>
          <p className="text-muted-foreground">
            Manage all counselling sessions
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchSessions}
          disabled={isRefreshing}
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="no-show">No Show</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sessions Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Counsellor</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Meeting Link</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map((session) => {
              const StatusIcon = statusConfig[session.status]?.icon || Clock;
              return (
                <TableRow key={session._id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{session.user?.name || "N/A"}</div>
                      <div className="text-sm text-muted-foreground">
                        {session.user?.email || ""}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {session.counsellor?.name || "Not assigned"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="w-3 h-3" />
                        {new Date(session.preferredDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {session.preferredTimeSlot}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`${statusConfig[session.status]?.color} text-white`}
                    >
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusConfig[session.status]?.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {session.meetingLink ? (
                      <a
                        href={session.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                      >
                        <Video className="w-3 h-3" />
                        {session.meetingPlatform || "Link"}
                      </a>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenLinkDialog(session)}
                      >
                        <LinkIcon className="w-3 h-3 mr-1" />
                        Add Link
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(session)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenStatusDialog(session)}
                      >
                        Update
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {sessions.length === 0 && (
          <div className="p-8 text-center">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No sessions found</h3>
            <p className="text-muted-foreground">
              {filterStatus !== "all"
                ? "Try adjusting your filters"
                : "No counselling sessions yet"}
            </p>
          </div>
        )}
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Session Details</DialogTitle>
          </DialogHeader>

          {selectedSession && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Student</Label>
                  <p className="font-medium">{selectedSession.user?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedSession.user?.email}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Counsellor</Label>
                  <p className="font-medium">
                    {selectedSession.counsellor?.name || "Not assigned"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Date</Label>
                  <p className="font-medium">
                    {new Date(selectedSession.preferredDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Time Slot</Label>
                  <p className="font-medium">{selectedSession.preferredTimeSlot}</p>
                </div>
              </div>

              {selectedSession.agenda && (
                <div>
                  <Label className="text-muted-foreground">Agenda</Label>
                  <p className="text-sm mt-1">{selectedSession.agenda}</p>
                </div>
              )}

              {selectedSession.notes && (
                <div>
                  <Label className="text-muted-foreground">Notes</Label>
                  <p className="text-sm mt-1">{selectedSession.notes}</p>
                </div>
              )}

              {selectedSession.nextSteps && (
                <div>
                  <Label className="text-muted-foreground">Next Steps</Label>
                  <p className="text-sm mt-1">{selectedSession.nextSteps}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Session Status</DialogTitle>
            <DialogDescription>
              Update the session status and add notes
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="no-show">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add session notes..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nextSteps">Next Steps</Label>
              <Textarea
                id="nextSteps"
                value={nextSteps}
                onChange={(e) => setNextSteps(e.target.value)}
                placeholder="Add next steps..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsStatusDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus} disabled={isUpdating}>
              {isUpdating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Meeting Link Dialog */}
      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Meeting Link</DialogTitle>
            <DialogDescription>
              Provide the meeting link for this session
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="meetingLink">Meeting Link</Label>
              <Input
                id="meetingLink"
                type="url"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="https://zoom.us/j/123456789"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <Select value={meetingPlatform} onValueChange={setMeetingPlatform}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zoom">Zoom</SelectItem>
                  <SelectItem value="google-meet">Google Meet</SelectItem>
                  <SelectItem value="microsoft-teams">Microsoft Teams</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsLinkDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddMeetingLink} disabled={isUpdating}>
              {isUpdating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
