"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { counsellingService } from "@/lib/services/counselling.service";
import { counsellorService } from "@/lib/services/counsellor.service";
import {
  CounsellingPackage,
  CounsellingEnrollment,
  CounsellingSession,
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Loader2,
  RefreshCw,
  ArrowLeft,
  User,
  MoreHorizontal,
  Calendar,
  Clock,
  Video,
  CheckCircle,
  XCircle,
  AlertCircle,
  Link as LinkIcon,
  UserPlus,
  ArrowRightLeft,
} from "lucide-react";

// Status helpers
const getStatusColor = (status: string) => {
  switch (status) {
    case "active": return "bg-green-500";
    case "expired": return "bg-gray-500";
    case "cancelled": return "bg-red-500";
    case "refunded": return "bg-purple-500";
    default: return "bg-gray-500";
  }
};

const sessionStatusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending_assignment: { label: "Pending Assignment", color: "bg-yellow-500", icon: Clock },
  scheduled: { label: "Scheduled", color: "bg-blue-500", icon: Calendar },
  confirmed: { label: "Confirmed", color: "bg-indigo-500", icon: CheckCircle },
  completed: { label: "Completed", color: "bg-green-500", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-red-500", icon: XCircle },
  "no-show": { label: "No Show", color: "bg-orange-500", icon: AlertCircle },
};

export default function PackageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const packageId = params.id as string;

  const [pkg, setPkg] = useState<CounsellingPackage | null>(null);
  const [enrollments, setEnrollments] = useState<CounsellingEnrollment[]>([]);
  const [counsellors, setCounsellors] = useState<Counsellor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // === State for Session Management ===
  const [selectedEnrollment, setSelectedEnrollment] = useState<CounsellingEnrollment | null>(null);
  const [studentSessions, setStudentSessions] = useState<CounsellingSession[]>([]);
  const [isSessionManagerOpen, setIsSessionManagerOpen] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // === State for Actions ===
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [selectedCounsellorId, setSelectedCounsellorId] = useState("");
  const [selectedSession, setSelectedSession] = useState<CounsellingSession | null>(null);
  const [meetingLink, setMeetingLink] = useState("");
  const [meetingPlatform, setMeetingPlatform] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const [packageRes, enrollmentsRes, counsellorsRes] = await Promise.all([
        counsellingService.getPackageById(packageId),
        counsellingService.getEnrollments({ packageId, status: "active" }),
        counsellorService.getCounsellors({ isActive: true }),
      ]);
      setPkg(packageRes);
      setEnrollments(enrollmentsRes.data || []);
      setCounsellors(counsellorsRes || []);
    } catch (error) {
      console.error("Failed to fetch package details", error);
      toast.error("Failed to load package details");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [packageId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // === Handlers for Enrollments ===

  const handleOpenAssignCounsellor = (enrollment: CounsellingEnrollment) => {
    setSelectedEnrollment(enrollment);
    setSelectedCounsellorId(enrollment.assignedCounsellor?._id || "");
    setIsAssignDialogOpen(true);
  };

  const handleAssignCounsellorToEnrollment = async () => {
    if (!selectedEnrollment || !selectedCounsellorId) return;
    try {
      setIsUpdating(true);
      await counsellingService.assignCounsellor(selectedEnrollment._id, selectedCounsellorId);
      toast.success("Counsellor assigned to enrollment");
      fetchData(); // Refresh enrollments list
      setIsAssignDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to assign counsellor");
    } finally {
      setIsUpdating(false);
    }
  };

  // === Handlers for Sessions ===

  const handleOpenSessionManager = async (enrollment: CounsellingEnrollment) => {
    setSelectedEnrollment(enrollment);
    setIsSessionManagerOpen(true);
    setLoadingSessions(true);
    try {
       // Ideally specific endpoint, but using getAllSessions filter for now
      // Assuming getAllSessions supports filtering by enrollmentId or userId
       // Note: enrollmentId filter was added to service in previous step
      const sessions = await counsellingService.getAllSessions({ 
        enrollmentId: enrollment._id 
      });
      // response is now directly the array based on my service update
      setStudentSessions(sessions || []);
    } catch (error) {
      console.error("Failed to fetch student sessions", error);
      toast.error("Failed to load sessions");
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleOpenLinkDialog = (session: CounsellingSession) => {
    setSelectedSession(session);
    setMeetingLink(session.meetingLink || "");
    setMeetingPlatform(session.meetingPlatform || "zoom");
    setIsLinkDialogOpen(true);
  };

  const handleAddMeetingLink = async () => {
    if (!selectedSession) return;
    try {
      setIsUpdating(true);
      await counsellingService.addMeetingLink(selectedSession._id, {
        meetingLink,
        meetingPlatform
      });
      toast.success("Meeting link added");
      
      // Refresh user sessions
      if (selectedEnrollment) {
        handleOpenSessionManager(selectedEnrollment); 
      }
      setIsLinkDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to add link");
    } finally {
      setIsUpdating(false);
    }
  };


  if (loading) {
     return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
  }

  if (!pkg) {
    return <div className="p-8">Package not found</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4 pl-0">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </Button>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{pkg.name}</h1>
            <Badge className={pkg.isActive ? "bg-green-600" : "bg-gray-400"}>
              {pkg.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="text-muted-foreground">{pkg.examType.toUpperCase()} • ₹{pkg.price}</p>
        </div>
        <Button variant="outline" onClick={fetchData} disabled={isRefreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Enrollments</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{enrollments.length}</div></CardContent>
        </Card>
        {/* Placeholder stats */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Sessions Delivered</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{enrollments.reduce((acc, curr) => acc + curr.sessionsUsed, 0)}</div></CardContent>
        </Card>
         <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Pending Sessions</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{enrollments.reduce((acc, curr) => acc + curr.sessionsRemaining, 0)}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enrolled Students</CardTitle>
          <CardDescription>Manage students, assign counsellors, and schedule sessions</CardDescription>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Enrolled Date</TableHead>
              <TableHead>Assigned Counsellor</TableHead>
              <TableHead>Sessions (Used/Total)</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {enrollments.map((enrollment) => (
              <TableRow key={enrollment._id}>
                <TableCell>
                  <div className="font-medium">{enrollment.user?.name || "N/A"}</div>
                  <div className="text-xs text-muted-foreground">{enrollment.user?.email}</div>
                </TableCell>
                <TableCell>{new Date(enrollment.enrolledAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  {enrollment.assignedCounsellor ? (
                     <div className="flex items-center gap-2">
                       <span>{enrollment.assignedCounsellor.name}</span>
                       <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleOpenAssignCounsellor(enrollment)}>
                         <RefreshCw className="w-3 h-3" />
                       </Button>
                     </div>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => handleOpenAssignCounsellor(enrollment)}>
                      Assign
                    </Button>
                  )}
                </TableCell>
                <TableCell>{enrollment.sessionsUsed} / {enrollment.sessionsUsed + enrollment.sessionsRemaining}</TableCell>
                <TableCell className="text-right">
                  <Button onClick={() => handleOpenSessionManager(enrollment)}>
                     Manage Sessions
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {enrollments.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No enrollments found for this package</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* === Dialogs === */}

      {/* Session Manager (Full Screen or Large Dialog) */}
      <Dialog open={isSessionManagerOpen} onOpenChange={setIsSessionManagerOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Session Management - {selectedEnrollment?.user?.name}</DialogTitle>
            <DialogDescription>
              Manage counselling sessions for this student. 
              {selectedEnrollment?.sessionsRemaining} sessions remaining.
            </DialogDescription>
          </DialogHeader>

          {loadingSessions ? (
            <div className="py-12 flex justify-center"><Loader2 className="animate-spin" /></div>
          ) : (
            <div className="space-y-6">
              <Table>
                <TableHeader>
                   <TableRow>
                     <TableHead>Date & Time</TableHead>
                     <TableHead>Counsellor</TableHead>
                     <TableHead>Status</TableHead>
                     <TableHead>Link</TableHead>
                     <TableHead className="text-right">Actions</TableHead>
                   </TableRow>
                </TableHeader>
                <TableBody>
                  {studentSessions.map(session => (
                    <TableRow key={session._id}>
                      <TableCell>
                        <div className="font-medium">{new Date(session.preferredDate).toLocaleDateString()}</div>
                        <div className="text-xs text-muted-foreground">{session.preferredTimeSlot}</div>
                      </TableCell>
                       <TableCell>{session.counsellor?.name || "Unassigned"}</TableCell>
                       <TableCell>
                          <Badge className={`${sessionStatusConfig[session.status]?.color || "bg-gray-500"} text-white`}>
                            {sessionStatusConfig[session.status]?.label || session.status}
                          </Badge>
                       </TableCell>
                       <TableCell>
                          {session.meetingLink ? (
                             <a href={session.meetingLink} target="_blank" className="text-blue-600 hover:underline flex items-center gap-1 text-sm">
                               <Video className="w-3 h-3" /> Join
                             </a>
                          ) : "-"}
                       </TableCell>
                       <TableCell className="text-right">
                          {/* Logic: If Scheduled -> Show Add Link. If Pending -> Show Assign (though assigned by default) */}
                          {session.status === "scheduled" && (
                             <Button size="sm" variant="outline" onClick={() => handleOpenLinkDialog(session)}>
                                <LinkIcon className="w-3 h-3 mr-1" /> Add Link
                             </Button>
                          )}
                          {!session.meetingLink && session.status !== "scheduled" && (
                            <span className="text-xs text-muted-foreground">Waiting for schedule</span>
                          )}
                          {/* Can add Reschedule here too if needed */}
                       </TableCell>
                    </TableRow>
                  ))}
                  {studentSessions.length === 0 && (
                    <TableRow><TableCell colSpan={5} className="text-center">No sessions found</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
          <DialogFooter>
             <Button variant="outline" onClick={() => setIsSessionManagerOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Counsellor Dialog (Enrollment Level) */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Counsellor</DialogTitle>
            <DialogDescription>This counsellor will be assigned to the student's enrollment.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Label>Select Counsellor</Label>
            <Select value={selectedCounsellorId} onValueChange={setSelectedCounsellorId}>
              <SelectTrigger><SelectValue placeholder="Choose counsellor" /></SelectTrigger>
              <SelectContent>
                {counsellors.map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAssignCounsellorToEnrollment} disabled={isUpdating}>
              {isUpdating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Link Dialog */}
      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Meeting Link</DialogTitle>
            <DialogDescription>Confirm the session by adding a meeting link.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
             <div className="space-y-2">
               <Label>Meeting Link</Label>
               <Input value={meetingLink} onChange={e => setMeetingLink(e.target.value)} />
             </div>
             <div className="space-y-2">
               <Label>Platform</Label>
                <Select value={meetingPlatform} onValueChange={setMeetingPlatform}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="zoom">Zoom</SelectItem>
                  <SelectItem value="google_meet">Google Meet</SelectItem>
                  <SelectItem value="microsoft_teams">Teams</SelectItem>
                </SelectContent>
              </Select>
             </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLinkDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddMeetingLink} disabled={isUpdating}>
              {isUpdating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
