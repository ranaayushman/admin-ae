"use client";

import React, { useState, useEffect, useCallback } from "react";
import { counsellingService } from "@/lib/services/counselling.service";
import { counsellorService } from "@/lib/services/counsellor.service";
import { CounsellingSession, CounsellingEnrollment, Counsellor } from "@/lib/types/counselling";
import {
  Card,
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Loader2,
  RefreshCw,
  Video,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Link as LinkIcon,
  UserPlus,
  RefreshCcw,
} from "lucide-react";

// Status configuration
const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending_assignment: { label: "Pending Assignment", color: "bg-yellow-500", icon: Clock },
  scheduled: { label: "Scheduled", color: "bg-blue-500", icon: Calendar },
  confirmed: { label: "Confirmed", color: "bg-indigo-500", icon: CheckCircle },
  completed: { label: "Completed", color: "bg-green-500", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-red-500", icon: XCircle },
  "no-show": { label: "No Show", color: "bg-orange-500", icon: AlertCircle },
};

const timeSlots = [
  "09:00-09:30",
  "09:30-10:00",
  "10:00-10:30",
  "10:30-11:00",
  "11:00-11:30",
  "11:30-12:00",
  "12:00-12:30",
  "12:30-13:00",
  "14:00-14:30",
  "14:30-15:00",
  "15:00-15:30",
  "15:30-16:00",
  "16:00-16:30",
  "16:30-17:00",
  "17:00-17:30",
  "17:30-18:00",
  "18:00-18:30",
];

export default function CounsellingDashboard() {
  const [sessions, setSessions] = useState<CounsellingSession[]>([]);
  const [enrollments, setEnrollments] = useState<CounsellingEnrollment[]>([]);
  const [counsellors, setCounsellors] = useState<Counsellor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("requests");

  // Dialog states
  const [selectedSession, setSelectedSession] = useState<CounsellingSession | null>(null);
  const [selectedEnrollment, setSelectedEnrollment] = useState<CounsellingEnrollment | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isEnrollmentAssignDialogOpen, setIsEnrollmentAssignDialogOpen] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  
  // Form states
  const [meetingLink, setMeetingLink] = useState("");
  const [selectedCounsellorId, setSelectedCounsellorId] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({
    preferredDate: "",
    preferredTimeSlot: ""
  });
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const [sessionsRes, enrollmentsRes, counsellorsRes] = await Promise.all([
        counsellingService.getAllSessions(),
        counsellingService.getEnrollments({ status: "active" }),
        counsellorService.getCounsellors({ isActive: true })
      ]);
      
      setSessions(sessionsRes || []);
      setEnrollments(enrollmentsRes.data || []);
      setCounsellors(counsellorsRes || []);
    } catch (error: any) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Helpers for Safe Access ---
  const getUserName = (session: CounsellingSession) => {
    if (typeof session.userId === 'object' && session.userId !== null) {
      return (session.userId as any).name || "Unknown";
    }
    return "Unknown User";
  };

  const getUserEmail = (session: CounsellingSession) => {
    if (typeof session.userId === 'object' && session.userId !== null) {
      return (session.userId as any).email || "";
    }
    return "";
  };

  // --- Handlers ---

  const handleOpenAssign = (session: CounsellingSession) => {
    setSelectedSession(session);
    setSelectedCounsellorId(session.counsellorId || "");
    setIsAssignDialogOpen(true);
  };

  const handleAssignCounsellor = async () => {
    if (!selectedSession || !selectedCounsellorId) return;
    try {
      setIsUpdating(true);
      await counsellingService.assignSessionCounsellor(selectedSession._id, selectedCounsellorId);
      toast.success("Counsellor assigned successfully");
      fetchData();
      setIsAssignDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to assign counsellor");
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleOpenEnrollmentAssign = (enrollment: CounsellingEnrollment) => {
    setSelectedEnrollment(enrollment);
    setSelectedCounsellorId(enrollment.assignedCounsellor?._id || "");
    setIsEnrollmentAssignDialogOpen(true);
  };

  const handleAssignEnrollmentCounsellor = async () => {
    if (!selectedEnrollment || !selectedCounsellorId) return;
     try {
      setIsUpdating(true);
      await counsellingService.assignCounsellor(selectedEnrollment._id, selectedCounsellorId);
      toast.success("Counsellor assigned to student");
      fetchData();
      setIsEnrollmentAssignDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to assign counsellor");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenLinkDialog = (session: CounsellingSession) => {
    setSelectedSession(session);
    setMeetingLink(session.meetingLink || "");
    setIsLinkDialogOpen(true);
  };

  const handleAddMeetingLink = async () => {
    if (!selectedSession) return;
    try {
      setIsUpdating(true);
      const safeCounsellorId = selectedSession.counsellorId && typeof selectedSession.counsellorId === 'object' 
        ? (selectedSession.counsellorId as any)._id 
        : selectedSession.counsellorId;

      await counsellingService.addMeetingLink(selectedSession._id, {
        meetingLink,
        meetingPlatform: "google_meet", // Default or add selector if needed
        counsellorId: safeCounsellorId || undefined // Include if known
      });
      toast.success("Link added & Session Confirmed");
      fetchData();
      setIsLinkDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to add link");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenReschedule = (session: CounsellingSession) => {
    setSelectedSession(session);
    setRescheduleData({
      preferredDate: session.scheduledDate ? new Date(session.scheduledDate).toISOString().split('T')[0] : session.preferredDate,
      preferredTimeSlot: session.preferredTimeSlot
    });
    setIsRescheduleDialogOpen(true);
  };

  const handleReschedule = async () => {
    if (!selectedSession) return;
    try {
      setIsUpdating(true);
      await counsellingService.rescheduleSession(selectedSession._id, rescheduleData);
      toast.success("Session rescheduled successfully");
      fetchData();
      setIsRescheduleDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to reschedule session");
    } finally {
      setIsUpdating(false);
    }
  };



  const handleOpenCancel = (session: CounsellingSession) => {
    setSelectedSession(session);
    setCancelReason("");
    setIsCancelDialogOpen(true);
  };

  const handleAdminCancel = async () => {
    if (!selectedSession || !cancelReason.trim()) return;
    try {
      setIsUpdating(true);
      await counsellingService.adminCancelSession(selectedSession._id, { reason: cancelReason });
      toast.success("Session cancelled successfully");
      fetchData();
      setIsCancelDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to cancel session");
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Manage Counselling</h1>
          <p className="text-muted-foreground">Overview of students and session requests</p>
        </div>
        <Button variant="outline" onClick={fetchData} disabled={isRefreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>
      
      <Tabs defaultValue="requests" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-8">
          <TabsTrigger value="requests">Counselling Requests ({sessions.length})</TabsTrigger>
          <TabsTrigger value="students">Enrolled Students ({enrollments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Session Requests</CardTitle>
              <CardDescription>Upcoming sessions requiring assignment or confirmation.</CardDescription>
            </CardHeader>
            <Table>
              <TableHeader>
                <TableRow>
                   <TableHead>Student</TableHead>
                   <TableHead>Scheduled Date</TableHead>
                   <TableHead>Counsellor</TableHead>
                   <TableHead>Status</TableHead>
                   <TableHead>Link</TableHead>
                   <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => {
                  // Fallback for missing status config
                  const config = statusConfig[session.status] || { icon: Clock, color: "bg-gray-500", label: session.status };
                  const StatusIcon = config.icon;
                  
                  return (
                    <TableRow key={session._id}>
                      <TableCell>
                        <div className="font-medium">{getUserName(session)}</div>
                        <div className="text-xs text-muted-foreground">{getUserEmail(session)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                           <Calendar className="w-4 h-4 text-muted-foreground" />
                           {new Date(session.scheduledDate || session.preferredDate).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                         {session.counsellor ? (
                            <span className="font-medium">{session.counsellor.name}</span>
                         ) : (
                            <Button variant="outline" size="sm" onClick={() => handleOpenAssign(session)}>
                              <UserPlus className="w-3 h-3 mr-1" /> Assign
                            </Button>
                         )}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${config.color} text-white`}>
                          <StatusIcon className="w-3 h-3 mr-1" /> {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {session.meetingLink ? (
                           <a href={session.meetingLink} target="_blank" className="text-blue-600 flex items-center gap-1 hover:underline">
                              <Video className="w-3 h-3" /> Join
                           </a>
                        ) : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                         <div className="flex justify-end gap-2">
                           {/* Reschedule button for all non-completed sessions */}
                           {!['completed', 'cancelled'].includes(session.status) && (
                               <>
                               <Button variant="ghost" size="sm" onClick={() => handleOpenReschedule(session)}>
                                 <RefreshCcw className="w-4 h-4" />
                               </Button>
                               <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleOpenCancel(session)}>
                                  <XCircle className="w-4 h-4" />
                               </Button>
                               </>
                           )}
                           
                            {(session.status === 'scheduled' || session.status === 'pending_assignment' || session.status === 'confirmed') && (
                                <Button variant="ghost" size="sm" onClick={() => handleOpenLinkDialog(session)}>
                                  <LinkIcon className="w-4 h-4" />
                                </Button>
                            )}
                            {session.counsellor && (
                                <Button variant="ghost" size="sm" onClick={() => handleOpenAssign(session)}>
                                   Change
                                </Button>
                            )}
                         </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {sessions.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center py-8">No session requests found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="students">
           <Card>
            <CardHeader>
              <CardTitle>Total Enrolled Students</CardTitle>
              <CardDescription>All students currently enrolled in counselling packages.</CardDescription>
            </CardHeader>
             <Table>
              <TableHeader>
                <TableRow>
                   <TableHead>Student</TableHead>
                   <TableHead>Package</TableHead>
                   <TableHead>Assigned Counsellor</TableHead>
                   <TableHead>Sessions (Used/Rem)</TableHead>
                   <TableHead className="text-right">Ordered On</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrollments.map((enrollment) => (
                   <TableRow key={enrollment._id}>
                      <TableCell>
                         <div className="font-medium">{enrollment.user?.name || "N/A"}</div>
                         <div className="text-xs text-muted-foreground">{enrollment.user?.email}</div>
                      </TableCell>
                      <TableCell>{enrollment.package?.name || "Premium Package"}</TableCell>
                      <TableCell>
                          {enrollment.assignedCounsellor ? (
                             <div className="flex items-center gap-2">
                               <span>{enrollment.assignedCounsellor.name}</span>
                               <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleOpenEnrollmentAssign(enrollment)}>
                                  <RefreshCw className="w-3 h-3" />
                               </Button>
                             </div>
                          ) : (
                             <Button variant="outline" size="sm" onClick={() => handleOpenEnrollmentAssign(enrollment)}>Assign</Button>
                          )}
                      </TableCell>
                       <TableCell>{enrollment.sessionsUsed} / {enrollment.sessionsUsed + enrollment.sessionsRemaining}</TableCell>
                       <TableCell className="text-right">{new Date(enrollment.createdAt).toLocaleDateString()}</TableCell>
                   </TableRow>
                ))}
              </TableBody>
            </Table>
           </Card>
        </TabsContent>
      </Tabs>
      
      {/* Assign Session Counsellor Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
           <DialogHeader><DialogTitle>Assign Counsellor to Session</DialogTitle></DialogHeader>
           <div className="space-y-4">
              <Label>Select Counsellor</Label>
              <Select value={selectedCounsellorId} onValueChange={setSelectedCounsellorId}>
                 <SelectTrigger><SelectValue placeholder="Choose..." /></SelectTrigger>
                 <SelectContent>
                    {counsellors.map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
                 </SelectContent>
              </Select>
           </div>
           <DialogFooter>
              <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAssignCounsellor} disabled={isUpdating}>{isUpdating && <Loader2 className="animate-spin w-4 h-4 mr-2" />} Assign</Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Assign Enrollment Counsellor Dialog */}
      <Dialog open={isEnrollmentAssignDialogOpen} onOpenChange={setIsEnrollmentAssignDialogOpen}>
        <DialogContent>
           <DialogHeader><DialogTitle>Assign Counsellor to Student</DialogTitle></DialogHeader>
           <div className="space-y-4">
              <Label>Select Counsellor</Label>
              <Select value={selectedCounsellorId} onValueChange={setSelectedCounsellorId}>
                 <SelectTrigger><SelectValue placeholder="Choose..." /></SelectTrigger>
                 <SelectContent>
                    {counsellors.map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
                 </SelectContent>
              </Select>
           </div>
           <DialogFooter>
              <Button variant="outline" onClick={() => setIsEnrollmentAssignDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAssignEnrollmentCounsellor} disabled={isUpdating}>{isUpdating && <Loader2 className="animate-spin w-4 h-4 mr-2" />} Assign</Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Link Dialog */}
       <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Meeting Link</DialogTitle></DialogHeader>
          <div className="space-y-4">
             <Label>Meeting URL</Label>
             <Input value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} placeholder="https://meet.google.com/..." />
          </div>
          <DialogFooter>
              <Button variant="outline" onClick={() => setIsLinkDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddMeetingLink} disabled={isUpdating}>{isUpdating && <Loader2 className="animate-spin w-4 h-4 mr-2" />} Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={isRescheduleDialogOpen} onOpenChange={setIsRescheduleDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reschedule Session</DialogTitle></DialogHeader>
          <div className="space-y-4">
             <div>
                <Label>New Date</Label>
                <Input 
                   type="date"
                   value={rescheduleData.preferredDate} 
                   onChange={(e) => setRescheduleData(prev => ({ ...prev, preferredDate: e.target.value }))} 
                   min={new Date().toISOString().split('T')[0]}
                />
             </div>
             <div>
                <Label>New Time Slot</Label>
                <Select value={rescheduleData.preferredTimeSlot} onValueChange={(val) => setRescheduleData(prev => ({ ...prev, preferredTimeSlot: val }))}>
                   <SelectTrigger><SelectValue placeholder="Select Time Slot" /></SelectTrigger>
                   <SelectContent>
                      {timeSlots.map(slot => <SelectItem key={slot} value={slot}>{slot}</SelectItem>)}
                   </SelectContent>
                </Select>
             </div>
          </div>
          <DialogFooter>
              <Button variant="outline" onClick={() => setIsRescheduleDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleReschedule} disabled={isUpdating}>{isUpdating && <Loader2 className="animate-spin w-4 h-4 mr-2" />} Reschedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admin Cancel Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Cancel Session (Admin)</DialogTitle></DialogHeader>
          <div className="space-y-4">
             <Label>Cancellation Reason</Label>
             <Input 
               value={cancelReason} 
               onChange={(e) => setCancelReason(e.target.value)} 
               placeholder="e.g. Counsellor unavailable, Student request..." 
             />
          </div>
          <DialogFooter>
              <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>Back</Button>
              <Button onClick={handleAdminCancel} variant="destructive" disabled={isUpdating}>{isUpdating && <Loader2 className="animate-spin w-4 h-4 mr-2" />} Confirm Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
