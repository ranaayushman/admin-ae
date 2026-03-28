"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  ArrowLeft,
  ExternalLink,
  Loader2,
  Mail,
  RefreshCw,
  Save,
  Send,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import freelanceService, {
  FreelanceServiceError,
} from "@/lib/services/freelance.service";
import {
  FREELANCE_STATUSES,
  FreelanceProfile,
  FreelanceStatus,
} from "@/lib/types/freelance";
import {
  contactFreelancerSchema,
  ContactFreelancerFormValues,
  updateFreelanceStatusSchema,
  UpdateFreelanceStatusFormValues,
} from "@/lib/validations/freelance-schema";

const statusClasses: Record<FreelanceStatus, string> = {
  submitted: "bg-blue-100 text-blue-700 border-blue-200",
  "under-review": "bg-amber-100 text-amber-700 border-amber-200",
  verified: "bg-green-100 text-green-700 border-green-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
  contacted: "bg-indigo-100 text-indigo-700 border-indigo-200",
  archived: "bg-slate-100 text-slate-700 border-slate-200",
};

const humanizeSlug = (value: string) =>
  value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const mapErrorMessage = (error: unknown): string => {
  if (error instanceof FreelanceServiceError) {
    if (error.statusCode === 401) {
      return "Your session has expired. Please login again.";
    }
    if (error.statusCode === 403) {
      return "You do not have access to this admin module.";
    }
    if (error.statusCode === 404) {
      return "Freelance profile not found.";
    }
    return error.message;
  }

  return "Something went wrong while loading this profile.";
};

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function FreelanceAdminDetailPage() {
  const params = useParams();
  const router = useRouter();
  const profileId = String(params.id ?? "");

  const [profile, setProfile] = useState<FreelanceProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const {
    register: registerStatus,
    handleSubmit: handleSubmitStatus,
    watch: watchStatus,
    setValue: setStatusValue,
    formState: { errors: statusErrors, isSubmitting: isStatusSubmitting },
    reset: resetStatus,
  } = useForm<UpdateFreelanceStatusFormValues>({
    resolver: zodResolver(updateFreelanceStatusSchema),
    defaultValues: {
      status: "submitted",
      adminNotes: "",
      rejectionReason: "",
    },
  });

  const {
    register: registerContact,
    handleSubmit: handleSubmitContact,
    formState: { errors: contactErrors, isSubmitting: isContactSubmitting },
    reset: resetContact,
  } = useForm<ContactFreelancerFormValues>({
    resolver: zodResolver(contactFreelancerSchema),
    defaultValues: {
      contactMessage: "",
      internalNotes: "",
    },
  });

  const loadProfile = useCallback(async () => {
    if (!profileId) {
      setErrorBanner("Invalid profile identifier.");
      setIsLoading(false);
      return;
    }

    try {
      setIsRefreshing(true);
      const data = await freelanceService.getAdminFreelanceProfileById(profileId);
      setProfile(data);
      setErrorBanner(null);

      resetStatus({
        status: data.status,
        adminNotes: data.adminNotes ?? "",
        rejectionReason: data.rejectionReason ?? "",
      });
    } catch (error) {
      const message = mapErrorMessage(error);
      setErrorBanner(message);

      if (error instanceof FreelanceServiceError && error.statusCode === 401) {
        const returnUrl = `/freelance/${profileId}`;
        router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [profileId, resetStatus, router]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const cvHref = useMemo(() => {
    if (!profile) {
      return null;
    }
    if (profile.cvFileUrl) {
      return profile.cvFileUrl;
    }
    if (profile.cvFileBase64) {
      return `data:application/pdf;base64,${profile.cvFileBase64}`;
    }
    return null;
  }, [profile]);

  const onSubmitStatus = async (values: UpdateFreelanceStatusFormValues) => {
    if (!profile) {
      return;
    }

    const previousSnapshot = {
      status: profile.status,
      adminNotes: profile.adminNotes,
      rejectionReason: profile.rejectionReason,
    };

    const payload = {
      status: values.status,
      adminNotes: values.adminNotes?.trim() || undefined,
      rejectionReason: values.rejectionReason?.trim() || undefined,
    };

    setProfile((prev) => {
      if (!prev) {
        return prev;
      }
      return {
        ...prev,
        status: payload.status,
        adminNotes: payload.adminNotes ?? null,
        rejectionReason: payload.rejectionReason ?? null,
      };
    });

    try {
      const updated = await freelanceService.updateAdminFreelanceStatus(
        profile.id,
        payload,
      );
      setProfile(updated);
      resetStatus({
        status: updated.status,
        adminNotes: updated.adminNotes ?? "",
        rejectionReason: updated.rejectionReason ?? "",
      });
      toast.success("Status updated successfully");
    } catch (error) {
      setProfile((prev) => {
        if (!prev) {
          return prev;
        }
        return {
          ...prev,
          status: previousSnapshot.status,
          adminNotes: previousSnapshot.adminNotes ?? null,
          rejectionReason: previousSnapshot.rejectionReason ?? null,
        };
      });

      toast.error("Failed to update status", {
        description: mapErrorMessage(error),
      });
    }
  };

  const onSubmitContact = async (values: ContactFreelancerFormValues) => {
    if (!profile) {
      return;
    }

    try {
      const updated = await freelanceService.contactFreelancer(profile.id, {
        contactMessage: values.contactMessage.trim(),
        internalNotes: values.internalNotes?.trim() || undefined,
      });

      setProfile(updated);
      resetContact({ contactMessage: "", internalNotes: "" });
      toast.success("Freelancer contacted successfully");
    } catch (error) {
      toast.error("Failed to send contact message", {
        description: mapErrorMessage(error),
      });
    }
  };

  const onArchiveProfile = async () => {
    if (!profile) {
      return;
    }

    try {
      setIsArchiving(true);
      await freelanceService.archiveFreelanceProfile(profile.id);
      toast.success("Profile archived successfully");
      router.push("/freelance");
    } catch (error) {
      toast.error("Failed to archive profile", {
        description: mapErrorMessage(error),
      });
    } finally {
      setIsArchiving(false);
      setArchiveDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen p-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="font-semibold text-red-700">Unable to load profile</p>
              <p className="text-sm text-red-600 mt-1">{errorBanner ?? "Unknown error"}</p>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" onClick={loadProfile}>
                  Retry
                </Button>
                <Button variant="secondary" onClick={() => router.push("/freelance")}>
                  Back to List
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-5xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => router.push("/freelance")} className="pl-0">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Freelance List
        </Button>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{profile.fullName}</h1>
            <p className="text-gray-500 mt-1">{profile.email}</p>
            <p className="text-gray-500 text-sm">
              Submitted on {formatDateTime(profile.submittedAt || profile.createdAt)}
            </p>
          </div>

          <div className="flex gap-2">
            <Badge className={statusClasses[profile.status]} variant="outline">
              {humanizeSlug(profile.status)}
            </Badge>
            <Button variant="outline" onClick={loadProfile} disabled={isRefreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {errorBanner && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6 flex items-center gap-3 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              <p>{errorBanner}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Profile Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Phone</Label>
                  <p className="font-medium">{profile.phoneNumber}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Domain</Label>
                  <p className="font-medium">{humanizeSlug(profile.domain)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Years of Experience</Label>
                  <p className="font-medium">
                    {profile.yearsOfExperience !== null &&
                    profile.yearsOfExperience !== undefined
                      ? profile.yearsOfExperience
                      : "Not provided"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Updated At</Label>
                  <p className="font-medium">{formatDateTime(profile.updatedAt)}</p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Bio</Label>
                <p className="mt-1 whitespace-pre-wrap text-sm text-gray-800">{profile.bio}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Skills</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(profile.skills ?? []).length > 0 ? (
                    profile.skills?.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No skills listed</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button asChild variant="outline" disabled={!profile.portfolioUrl}>
                  <a
                    href={profile.portfolioUrl || "#"}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Portfolio
                  </a>
                </Button>
                <Button asChild variant="outline" disabled={!profile.githubUrl}>
                  <a href={profile.githubUrl || "#"} target="_blank" rel="noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    GitHub
                  </a>
                </Button>
                <Button asChild variant="outline" disabled={!profile.linkedinUrl}>
                  <a href={profile.linkedinUrl || "#"} target="_blank" rel="noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    LinkedIn
                  </a>
                </Button>
              </div>

              <div>
                <Label className="text-muted-foreground">CV</Label>
                <div className="mt-2">
                  {cvHref ? (
                    <Button asChild variant="outline">
                      <a href={cvHref} target="_blank" rel="noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open CV PDF
                      </a>
                    </Button>
                  ) : (
                    <p className="text-sm text-gray-500">No CV available</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Update Status</CardTitle>
                <CardDescription>
                  Rejection reason is mandatory for rejected profiles.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitStatus(onSubmitStatus)} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={watchStatus("status")}
                      onValueChange={(value) =>
                        setStatusValue("status", value as FreelanceStatus, {
                          shouldValidate: true,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {FREELANCE_STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            {humanizeSlug(status)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {statusErrors.status && (
                      <p className="text-xs text-red-600">{statusErrors.status.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Admin Notes</Label>
                    <Textarea
                      rows={3}
                      placeholder="Internal decision notes"
                      {...registerStatus("adminNotes")}
                    />
                    {statusErrors.adminNotes && (
                      <p className="text-xs text-red-600">{statusErrors.adminNotes.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Rejection Reason</Label>
                    <Textarea
                      rows={3}
                      placeholder="Required when status is rejected"
                      {...registerStatus("rejectionReason")}
                    />
                    {statusErrors.rejectionReason && (
                      <p className="text-xs text-red-600">
                        {statusErrors.rejectionReason.message}
                      </p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isStatusSubmitting}>
                    {isStatusSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Status
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Freelancer</CardTitle>
                <CardDescription>
                  Send outreach message and keep optional internal notes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitContact(onSubmitContact)} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Contact Message</Label>
                    <Textarea
                      rows={4}
                      placeholder="We want to discuss a project with you"
                      {...registerContact("contactMessage")}
                    />
                    {contactErrors.contactMessage && (
                      <p className="text-xs text-red-600">
                        {contactErrors.contactMessage.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Internal Notes</Label>
                    <Textarea
                      rows={3}
                      placeholder="Optional internal context"
                      {...registerContact("internalNotes")}
                    />
                    {contactErrors.internalNotes && (
                      <p className="text-xs text-red-600">
                        {contactErrors.internalNotes.message}
                      </p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isContactSubmitting}>
                    {isContactSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-700">Archive Profile</CardTitle>
                <CardDescription>
                  This removes the profile from active admin workflow.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => setArchiveDialogOpen(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Archive Freelancer
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <a
                  className="flex items-center gap-2 text-blue-600 hover:underline"
                  href={`mailto:${profile.email}`}
                >
                  <Mail className="w-4 h-4" />
                  Email Freelancer
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive This Freelance Profile?</AlertDialogTitle>
            <AlertDialogDescription>
              This action archives the profile and removes it from active queues. You can
              continue using existing records for audit.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void onArchiveProfile();
              }}
              disabled={isArchiving}
            >
              {isArchiving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
