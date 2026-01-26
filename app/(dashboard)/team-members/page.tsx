// app/(dashboard)/team-members/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  teamMemberSchema,
  TeamMemberFormValues,
} from "@/lib/validations/team-member-schema";
import {
  teamService,
  TeamMember,
  CreateTeamMemberPayload,
  UpdateTeamMemberPayload,
} from "@/lib/services/team.service";
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
import { ImageUploadWithPreview } from "@/components/ui/ImageUploadWithPreview";
import { Separator } from "@/components/ui/separator";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  Plus,
  X,
  UserPlus,
  Users,
  Edit,
  Trash2,
  Loader2,
  Eye,
  EyeOff,
  RefreshCw,
  User,
} from "lucide-react";

// Fallback image for when team member image fails to load
const FALLBACK_IMAGE = "https://via.placeholder.com/200?text=No+Image";

export default function TeamMembersPage() {
  // State for team members list
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // State for create form
  const [profileImage, setProfileImage] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  // State for edit modal
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [editProfileImage, setEditProfileImage] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // State for delete confirmation
  const [deletingMember, setDeletingMember] = useState<TeamMember | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Create form
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TeamMemberFormValues>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: {
      name: "",
      title: "",
      image: "",
      expertise: [""],
      displayOrder: 1,
      isActive: true,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "expertise" as never,
  });

  // Edit form
  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    control: controlEdit,
    setValue: setEditValue,
    formState: { errors: editErrors, isSubmitting: isEditSubmitting },
    reset: resetEdit,
  } = useForm<TeamMemberFormValues>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: {
      name: "",
      title: "",
      image: "",
      expertise: [""],
      displayOrder: 1,
      isActive: true,
    },
  });

  const {
    fields: editFields,
    append: appendEdit,
    remove: removeEdit,
    replace: replaceEdit,
  } = useFieldArray({
    control: controlEdit,
    name: "expertise" as never,
  });

  // Fetch team members
  const fetchTeamMembers = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const data = await teamService.getTeamMembers({ sort: "displayOrder" });
      setTeamMembers(data);
    } catch (error: any) {
      console.error("Failed to fetch team members:", error);
      toast.error("Failed to load team members", {
        description: error.message || "Please try again",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTeamMembers();
  }, [fetchTeamMembers]);

  // Create new team member
  const onSubmit = async (data: TeamMemberFormValues) => {
    try {
      console.log("🚀 [onSubmit] Submitting team member...", data);
      toast.info("Submitting...", { duration: 2000 });

      const payload: CreateTeamMemberPayload = {
        name: data.name,
        title: data.title,
        imageBase64: profileImage,
        expertise: data.expertise.filter((exp) => exp.trim() !== ""),
        displayOrder: data.displayOrder,
        isActive: data.isActive,
      };

      console.log("🚀 [onSubmit] Payload prepared:", payload);

      const newMember = await teamService.createTeamMember(payload);

      console.log("✅ [onSubmit] Success!");
      toast.success("Team member added successfully!", {
        description: `${newMember.name} has been added to the team.`,
      });

      // Reset form and refresh list
      reset({
        name: "",
        title: "",
        image: "",
        expertise: [""],
        displayOrder: 1,
        isActive: true,
      });
      setProfileImage("");
      setShowCreateForm(false);
      fetchTeamMembers();
    } catch (error: any) {
      console.error("❌ [onSubmit] Error caught:", error);
      toast.error("Failed to add team member", {
        description:
          error.response?.data?.message || error.message || "Unknown error",
        duration: Infinity,
      });
    }
  };

  // Open edit dialog
  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setEditProfileImage(member.image);
    resetEdit({
      name: member.name,
      title: member.title,
      image: member.image,
      expertise: member.expertise.length > 0 ? member.expertise : [""],
      displayOrder: member.displayOrder,
      isActive: member.isActive,
    });
    replaceEdit(member.expertise.length > 0 ? member.expertise : [""]);
    setIsEditDialogOpen(true);
  };

  // Submit edit
  const onEditSubmit = async (data: TeamMemberFormValues) => {
    if (!editingMember) return;

    try {
      console.log("🚀 [onEditSubmit] Updating team member...", data);
      toast.info("Updating...", { duration: 2000 });

      const payload: UpdateTeamMemberPayload = {
        name: data.name,
        title: data.title,
        expertise: data.expertise.filter((exp) => exp.trim() !== ""),
        displayOrder: data.displayOrder,
        isActive: data.isActive,
      };

      // Only include imageBase64 if a new image was selected
      if (editProfileImage && editProfileImage !== editingMember.image) {
        payload.imageBase64 = editProfileImage;
      }

      console.log("🚀 [onEditSubmit] Payload prepared:", payload);

      const updatedMember = await teamService.updateTeamMember(
        editingMember._id,
        payload,
      );

      console.log("✅ [onEditSubmit] Success!");
      toast.success("Team member updated successfully!", {
        description: `${updatedMember.name} has been updated.`,
      });

      setIsEditDialogOpen(false);
      setEditingMember(null);
      fetchTeamMembers();
    } catch (error: any) {
      console.error("❌ [onEditSubmit] Error caught:", error);
      toast.error("Failed to update team member", {
        description:
          error.response?.data?.message || error.message || "Unknown error",
      });
    }
  };

  // Delete team member
  const handleDelete = async () => {
    if (!deletingMember) return;

    try {
      setIsDeleting(true);
      console.log(`🚀 [handleDelete] Deleting ${deletingMember.name}...`);

      await teamService.deleteTeamMember(deletingMember._id);

      console.log("✅ [handleDelete] Success!");
      toast.success("Team member deleted", {
        description: `${deletingMember.name} has been removed from the team.`,
      });

      setDeletingMember(null);
      fetchTeamMembers();
    } catch (error: any) {
      console.error("❌ [handleDelete] Error caught:", error);
      toast.error("Failed to delete team member", {
        description:
          error.response?.data?.message || error.message || "Unknown error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Toggle active status quickly
  const handleToggleActive = async (member: TeamMember) => {
    try {
      await teamService.updateTeamMember(member._id, {
        isActive: !member.isActive,
      });
      toast.success(
        member.isActive ? "Team member hidden" : "Team member visible",
        {
          description: `${member.name} is now ${member.isActive ? "hidden from" : "visible on"} the website.`,
        },
      );
      fetchTeamMembers();
    } catch (error: any) {
      toast.error("Failed to update visibility", {
        description: error.message,
      });
    }
  };

  const onError = (errors: any) => {
    console.error("❌ [onError] Validation failed:", errors);
    toast.error("Form Validation Failed", {
      description: "Please check the highlighted fields.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-gray-500">Loading team members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="w-8 h-8" />
              Team Members
            </h1>
            <p className="text-gray-500 mt-1">
              Manage educators and team members displayed on the landing page
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchTeamMembers()}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button onClick={() => setShowCreateForm(!showCreateForm)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          </div>
        </div>

        {/* Create Form (Collapsible) */}
        {showCreateForm && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(onSubmit, onError)(e);
            }}
            className="mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Add New Team Member
                </CardTitle>
                <CardDescription>
                  Enter the team member information and upload a profile photo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      {...register("name")}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-600">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Title / Role *</Label>
                    <Input
                      id="title"
                      placeholder="Physics Educator"
                      {...register("title")}
                    />
                    {errors.title && (
                      <p className="text-sm text-red-600">
                        {errors.title.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayOrder">Display Order</Label>
                    <Input
                      id="displayOrder"
                      type="number"
                      min={1}
                      {...register("displayOrder", { valueAsNumber: true })}
                    />
                    {errors.displayOrder && (
                      <p className="text-sm text-red-600">
                        {errors.displayOrder.message}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 pt-6">
                    <input
                      type="checkbox"
                      id="isActive"
                      className="h-4 w-4 rounded border-gray-300"
                      {...register("isActive")}
                    />
                    <Label htmlFor="isActive">
                      Active (visible on website)
                    </Label>
                  </div>
                </div>

                <Separator />

                {/* Profile Image */}
                <div className="space-y-2">
                  <Label>Profile Photo *</Label>
                  <p className="text-sm text-gray-500 mb-2">
                    Upload a square profile photo (recommended: 400x400px)
                  </p>
                  <ImageUploadWithPreview
                    currentImage={profileImage}
                    onImageChange={(base64) => {
                      setProfileImage(base64);
                      setValue("image", base64, { shouldValidate: true });
                    }}
                    label="Profile Photo"
                    description="Click to upload (recommended: 400x400px)"
                  />
                  {errors.image && (
                    <p className="text-sm text-red-600">
                      {errors.image.message}
                    </p>
                  )}
                </div>

                <Separator />

                {/* Expertise */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Expertise / Skills *</Label>
                      <p className="text-sm text-gray-500">
                        Add expertise areas (e.g., Physics, JEE Advanced, NEET)
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => append("")}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Expertise
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex items-center gap-2">
                        <Input
                          placeholder={`Expertise ${index + 1}`}
                          {...register(`expertise.${index}` as const)}
                        />
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  {errors.expertise && (
                    <p className="text-sm text-red-600">
                      {errors.expertise.message ||
                        "At least one expertise is required"}
                    </p>
                  )}
                </div>

                <Separator />

                {/* Submit */}
                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      reset();
                      setProfileImage("");
                      setShowCreateForm(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Add Team Member"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        )}

        {/* Team Members List */}
        <Card>
          <CardHeader>
            <CardTitle>Current Team Members ({teamMembers.length})</CardTitle>
            <CardDescription>
              Click on a member to edit or manage their visibility
            </CardDescription>
          </CardHeader>
          <CardContent>
            {teamMembers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 mb-4">No team members yet</p>
                <Button onClick={() => setShowCreateForm(true)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Your First Team Member
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teamMembers.map((member) => (
                  <div
                    key={member._id}
                    className={`relative border rounded-lg p-4 transition-all hover:shadow-md ${
                      !member.isActive ? "opacity-60 bg-gray-50" : "bg-white"
                    }`}
                  >
                    {/* Status Badge */}
                    <div className="absolute top-2 right-2">
                      <Badge
                        variant={member.isActive ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {member.isActive ? "Active" : "Hidden"}
                      </Badge>
                    </div>

                    {/* Profile Image */}
                    <div className="flex flex-col items-center text-center">
                      <div className="relative w-20 h-20 rounded-full overflow-hidden mb-3 ring-2 ring-primary/20">
                        <img
                          src={member.image || FALLBACK_IMAGE}
                          alt={member.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (target.src !== FALLBACK_IMAGE) {
                              target.src = FALLBACK_IMAGE;
                            }
                          }}
                        />
                      </div>

                      <h3 className="font-semibold text-gray-900">
                        {member.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">
                        {member.title}
                      </p>

                      {/* Expertise Tags */}
                      <div className="flex flex-wrap justify-center gap-1 mb-4">
                        {member.expertise.slice(0, 3).map((skill, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs"
                          >
                            {skill}
                          </Badge>
                        ))}
                        {member.expertise.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{member.expertise.length - 3}
                          </Badge>
                        )}
                      </div>

                      {/* Display Order */}
                      <p className="text-xs text-gray-400 mb-3">
                        Order: {member.displayOrder}
                      </p>

                      {/* Actions */}
                      <div className="flex items-center gap-2 w-full">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleEdit(member)}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(member)}
                          title={
                            member.isActive
                              ? "Hide from website"
                              : "Show on website"
                          }
                        >
                          {member.isActive ? (
                            <EyeOff className="w-3 h-3" />
                          ) : (
                            <Eye className="w-3 h-3" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setDeletingMember(member)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Team Member</DialogTitle>
              <DialogDescription>
                Update the team member information
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleEditSubmit(onEditSubmit, onError)(e);
              }}
              className="space-y-6"
            >
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Full Name *</Label>
                  <Input
                    id="edit-name"
                    placeholder="John Doe"
                    {...registerEdit("name")}
                  />
                  {editErrors.name && (
                    <p className="text-sm text-red-600">
                      {editErrors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-title">Title / Role *</Label>
                  <Input
                    id="edit-title"
                    placeholder="Physics Educator"
                    {...registerEdit("title")}
                  />
                  {editErrors.title && (
                    <p className="text-sm text-red-600">
                      {editErrors.title.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-displayOrder">Display Order</Label>
                  <Input
                    id="edit-displayOrder"
                    type="number"
                    min={1}
                    {...registerEdit("displayOrder", { valueAsNumber: true })}
                  />
                  {editErrors.displayOrder && (
                    <p className="text-sm text-red-600">
                      {editErrors.displayOrder.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="edit-isActive"
                    className="h-4 w-4 rounded border-gray-300"
                    {...registerEdit("isActive")}
                  />
                  <Label htmlFor="edit-isActive">
                    Active (visible on website)
                  </Label>
                </div>
              </div>

              <Separator />

              {/* Profile Image */}
              <div className="space-y-2">
                <Label>Profile Photo</Label>
                <p className="text-sm text-gray-500 mb-2">
                  Upload a new photo to replace the current one
                </p>
                {editingMember && (
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-primary/20">
                      <img
                        src={editProfileImage || FALLBACK_IMAGE}
                        alt="Current photo"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (target.src !== FALLBACK_IMAGE) {
                            target.src = FALLBACK_IMAGE;
                          }
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-500">Current photo</span>
                  </div>
                )}
                <ImageUploadWithPreview
                  currentImage={
                    editProfileImage !== editingMember?.image
                      ? editProfileImage
                      : ""
                  }
                  onImageChange={(base64) => {
                    setEditProfileImage(base64);
                    setEditValue("image", base64, { shouldValidate: true });
                  }}
                  label="New Profile Photo"
                  description="Upload to replace current photo"
                />
              </div>

              <Separator />

              {/* Expertise */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Expertise / Skills *</Label>
                    <p className="text-sm text-gray-500">
                      Update expertise areas
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendEdit("")}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>

                <div className="space-y-3">
                  {editFields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                      <Input
                        placeholder={`Expertise ${index + 1}`}
                        {...registerEdit(`expertise.${index}` as const)}
                      />
                      {editFields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeEdit(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                {editErrors.expertise && (
                  <p className="text-sm text-red-600">
                    {editErrors.expertise.message ||
                      "At least one expertise is required"}
                  </p>
                )}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isEditSubmitting}>
                  {isEditSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={!!deletingMember}
          onOpenChange={(open) => !open && setDeletingMember(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Team Member</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete{" "}
                <strong>{deletingMember?.name}</strong>? This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
