"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  counsellorService,
  GetCounsellorsParams,
} from "@/lib/services/counsellor.service";
import {
  Counsellor,
  CreateCounsellorPayload,
  UpdateCounsellorPayload,
  ExamType,
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
import { Switch } from "@/components/ui/switch";
import { ImageUploadWithPreview } from "@/components/ui/ImageUploadWithPreview";
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
  Edit,
  Trash2,
  Loader2,
  RefreshCw,
  Star,
  Users,
  Clock,
  GraduationCap,
  Mail,
  Phone,
} from "lucide-react";

// Form validation schema
const counsellorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().min(1, "Title is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  bio: z.string().min(1, "Bio is required"),
  shortBio: z.string().optional(),
  qualifications: z.array(z.string()),
  specializations: z.array(z.string()),
  examTypes: z.array(z.enum(["jee", "neet", "wbjee"])),
  experience: z.number().min(0),
  studentsGuided: z.number().min(0),
  languages: z.array(z.string()),
  linkedIn: z.string().optional(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  displayOrder: z.number(),
});

type CounsellorFormValues = z.infer<typeof counsellorSchema>;

const examTypeOptions: { value: ExamType; label: string }[] = [
  { value: "jee", label: "JEE" },
  { value: "neet", label: "NEET" },
  { value: "wbjee", label: "WBJEE" },
];

export default function CounsellorsPage() {
  const [counsellors, setCounsellors] = useState<Counsellor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterExamType, setFilterExamType] = useState<string>("all");

  // Create form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [profileImage, setProfileImage] = useState("");

  // Edit modal state
  const [editingCounsellor, setEditingCounsellor] = useState<Counsellor | null>(
    null,
  );
  const [editProfileImage, setEditProfileImage] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Delete confirmation
  const [deletingCounsellor, setDeletingCounsellor] =
    useState<Counsellor | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Create form
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CounsellorFormValues>({
    resolver: zodResolver(counsellorSchema),
    defaultValues: {
      name: "",
      title: "",
      email: "",
      phone: "",
      bio: "",
      shortBio: "",
      qualifications: [""],
      specializations: [""],
      examTypes: ["jee"],
      experience: 5,
      studentsGuided: 0,
      languages: ["English", "Hindi"],
      linkedIn: "",
      isActive: true,
      isFeatured: false,
      displayOrder: 0,
    },
  });

  const {
    fields: qualificationFields,
    append: appendQualification,
    remove: removeQualification,
  } = useFieldArray({
    control,
    name: "qualifications" as never,
  });

  const {
    fields: specializationFields,
    append: appendSpecialization,
    remove: removeSpecialization,
  } = useFieldArray({
    control,
    name: "specializations" as never,
  });

  const {
    fields: languageFields,
    append: appendLanguage,
    remove: removeLanguage,
  } = useFieldArray({
    control,
    name: "languages" as never,
  });

  // Edit form
  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    control: controlEdit,
    watch: watchEdit,
    setValue: setEditValue,
    formState: { errors: editErrors, isSubmitting: isEditSubmitting },
    reset: resetEdit,
  } = useForm<CounsellorFormValues>({
    resolver: zodResolver(counsellorSchema),
  });

  const {
    fields: editQualificationFields,
    append: appendEditQualification,
    remove: removeEditQualification,
    replace: replaceEditQualifications,
  } = useFieldArray({
    control: controlEdit,
    name: "qualifications" as never,
  });

  const {
    fields: editSpecializationFields,
    append: appendEditSpecialization,
    remove: removeEditSpecialization,
    replace: replaceEditSpecializations,
  } = useFieldArray({
    control: controlEdit,
    name: "specializations" as never,
  });

  // Fetch counsellors
  const fetchCounsellors = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const params: GetCounsellorsParams = { sort: "displayOrder" };
      if (filterExamType !== "all") {
        params.examType = filterExamType as ExamType;
      }
      const data = await counsellorService.getCounsellors(params);
      setCounsellors(data);
    } catch (error: any) {
      console.error("Failed to fetch counsellors:", error);
      toast.error("Failed to load counsellors", {
        description: error.message || "Please try again",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [filterExamType]);

  useEffect(() => {
    fetchCounsellors();
  }, [fetchCounsellors]);

  // Create new counsellor
  const onSubmit = async (data: CounsellorFormValues) => {
    try {
      if (!profileImage) {
        toast.error("Please upload a profile image");
        return;
      }

      console.log("🚀 Creating counsellor...", data);
      toast.info("Creating counsellor...");

      const payload: CreateCounsellorPayload = {
        name: data.name,
        title: data.title,
        email: data.email,
        phone: data.phone,
        imageBase64: profileImage,
        bio: data.bio,
        shortBio: data.shortBio,
        qualifications: data.qualifications.filter((q) => q.trim() !== ""),
        specializations: data.specializations.filter((s) => s.trim() !== ""),
        examTypes: data.examTypes,
        experience: data.experience,
        studentsGuided: data.studentsGuided,
        languages: data.languages.filter((l) => l.trim() !== ""),
        socialLinks: data.linkedIn ? { linkedin: data.linkedIn } : undefined,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        displayOrder: data.displayOrder,
      };

      const newCounsellor = await counsellorService.createCounsellor(payload);

      toast.success("Counsellor added successfully!", {
        description: `${newCounsellor.name} has been added.`,
      });

      reset();
      setProfileImage("");
      setShowCreateForm(false);
      fetchCounsellors();
    } catch (error: any) {
      console.error("Failed to create counsellor:", error);
      toast.error("Failed to add counsellor", {
        description: error.response?.data?.message || error.message,
      });
    }
  };

  // Open edit dialog
  const handleEdit = (counsellor: Counsellor) => {
    setEditingCounsellor(counsellor);
    setEditProfileImage(counsellor.image);
    resetEdit({
      name: counsellor.name,
      title: counsellor.title,
      email: counsellor.email,
      phone: counsellor.phone || "",
      bio: counsellor.bio,
      shortBio: counsellor.shortBio || "",
      qualifications:
        counsellor.qualifications.length > 0 ? counsellor.qualifications : [""],
      specializations:
        counsellor.specializations.length > 0
          ? counsellor.specializations
          : [""],
      examTypes: counsellor.examTypes,
      experience: counsellor.experience,
      studentsGuided: counsellor.studentsGuided,
      languages: counsellor.languages.length > 0 ? counsellor.languages : [""],
      linkedIn: counsellor.socialLinks?.linkedin || "",
      isActive: counsellor.isActive,
      isFeatured: counsellor.isFeatured,
      displayOrder: counsellor.displayOrder,
    });
    replaceEditQualifications(
      counsellor.qualifications.length > 0 ? counsellor.qualifications : [""],
    );
    replaceEditSpecializations(
      counsellor.specializations.length > 0 ? counsellor.specializations : [""],
    );
    setIsEditDialogOpen(true);
  };

  // Submit edit
  const onEditSubmit = async (data: CounsellorFormValues) => {
    if (!editingCounsellor) return;

    try {
      console.log("🚀 Updating counsellor...", data);
      toast.info("Updating counsellor...");

      const payload: UpdateCounsellorPayload = {
        name: data.name,
        title: data.title,
        email: data.email,
        phone: data.phone,
        bio: data.bio,
        shortBio: data.shortBio,
        qualifications: data.qualifications.filter((q) => q.trim() !== ""),
        specializations: data.specializations.filter((s) => s.trim() !== ""),
        examTypes: data.examTypes,
        experience: data.experience,
        studentsGuided: data.studentsGuided,
        languages: data.languages.filter((l) => l.trim() !== ""),
        socialLinks: data.linkedIn ? { linkedin: data.linkedIn } : undefined,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        displayOrder: data.displayOrder,
      };

      // Include image only if changed
      if (editProfileImage && editProfileImage !== editingCounsellor.image) {
        payload.imageBase64 = editProfileImage;
      }

      const updatedCounsellor = await counsellorService.updateCounsellor(
        editingCounsellor._id,
        payload,
      );

      toast.success("Counsellor updated successfully!", {
        description: `${updatedCounsellor.name} has been updated.`,
      });

      setIsEditDialogOpen(false);
      setEditingCounsellor(null);
      fetchCounsellors();
    } catch (error: any) {
      console.error("Failed to update counsellor:", error);
      toast.error("Failed to update counsellor", {
        description: error.response?.data?.message || error.message,
      });
    }
  };

  // Delete counsellor
  const handleDelete = async () => {
    if (!deletingCounsellor) return;

    try {
      setIsDeleting(true);
      await counsellorService.deleteCounsellor(deletingCounsellor._id);

      toast.success("Counsellor deleted", {
        description: `${deletingCounsellor.name} has been removed.`,
      });

      setDeletingCounsellor(null);
      fetchCounsellors();
    } catch (error: any) {
      console.error("Failed to delete counsellor:", error);
      toast.error("Failed to delete counsellor", {
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Toggle active status
  const handleToggleActive = async (counsellor: Counsellor) => {
    try {
      await counsellorService.updateCounsellor(counsellor._id, {
        isActive: !counsellor.isActive,
      });
      toast.success(
        counsellor.isActive ? "Counsellor deactivated" : "Counsellor activated",
      );
      fetchCounsellors();
    } catch (error: any) {
      toast.error("Failed to update status");
    }
  };

  // Toggle exam type selection
  const toggleExamType = (
    examType: ExamType,
    currentValues: ExamType[],
    isEdit: boolean,
  ) => {
    const setter = isEdit ? setEditValue : setValue;
    const fieldName = "examTypes";

    if (currentValues.includes(examType)) {
      if (currentValues.length > 1) {
        setter(
          fieldName,
          currentValues.filter((t) => t !== examType),
        );
      }
    } else {
      setter(fieldName, [...currentValues, examType]);
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
          <h1 className="text-3xl font-bold">Counsellors</h1>
          <p className="text-muted-foreground">
            Manage counsellors for JEE, NEET, and WBJEE counselling services
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchCounsellors}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Counsellor
          </Button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-4 mb-6">
        <Select value={filterExamType} onValueChange={setFilterExamType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by exam" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Exam Types</SelectItem>
            <SelectItem value="jee">JEE</SelectItem>
            <SelectItem value="neet">NEET</SelectItem>
            <SelectItem value="wbjee">WBJEE</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Add New Counsellor</CardTitle>
            <CardDescription>
              Add a new career counsellor to your team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Profile Image */}
              <div className="space-y-2">
                <Label>Profile Photo *</Label>
                <ImageUploadWithPreview
                  currentImage={profileImage}
                  onImageChange={setProfileImage}
                  label="Upload Photo"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="Dr. Rahul Sharma"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    {...register("title")}
                    placeholder="Senior Career Counsellor"
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="email@example.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    {...register("phone")}
                    placeholder="+91 9876543210"
                  />
                </div>

                {/* Experience */}
                <div className="space-y-2">
                  <Label htmlFor="experience">Experience (Years) *</Label>
                  <Input
                    id="experience"
                    type="number"
                    {...register("experience", { valueAsNumber: true })}
                    placeholder="10"
                  />
                </div>

                {/* Students Guided */}
                <div className="space-y-2">
                  <Label htmlFor="studentsGuided">Students Guided</Label>
                  <Input
                    id="studentsGuided"
                    type="number"
                    {...register("studentsGuided", { valueAsNumber: true })}
                    placeholder="5000"
                  />
                </div>
              </div>

              {/* Exam Types */}
              <div className="space-y-2">
                <Label>Exam Types *</Label>
                <div className="flex gap-2">
                  {examTypeOptions.map((option) => (
                    <Button
                      key={option.value}
                      type="button"
                      variant={
                        watch("examTypes").includes(option.value)
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        toggleExamType(option.value, watch("examTypes"), false)
                      }
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio *</Label>
                <Textarea
                  id="bio"
                  {...register("bio")}
                  placeholder="Detailed biography..."
                  rows={4}
                />
                {errors.bio && (
                  <p className="text-sm text-red-500">{errors.bio.message}</p>
                )}
              </div>

              {/* Short Bio */}
              <div className="space-y-2">
                <Label htmlFor="shortBio">Short Bio</Label>
                <Input
                  id="shortBio"
                  {...register("shortBio")}
                  placeholder="IIT Delhi alumnus | 10+ years experience"
                />
              </div>

              {/* Qualifications */}
              <div className="space-y-2">
                <Label>Qualifications</Label>
                {qualificationFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <Input
                      {...register(`qualifications.${index}` as const)}
                      placeholder="B.Tech from IIT Delhi"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeQualification(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendQualification("")}
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Qualification
                </Button>
              </div>

              {/* Specializations */}
              <div className="space-y-2">
                <Label>Specializations</Label>
                {specializationFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <Input
                      {...register(`specializations.${index}` as const)}
                      placeholder="JEE Counselling"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeSpecialization(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendSpecialization("")}
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Specialization
                </Button>
              </div>

              {/* Languages */}
              <div className="space-y-2">
                <Label>Languages</Label>
                {languageFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <Input
                      {...register(`languages.${index}` as const)}
                      placeholder="English"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeLanguage(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendLanguage("")}
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Language
                </Button>
              </div>

              {/* LinkedIn */}
              <div className="space-y-2">
                <Label htmlFor="linkedIn">LinkedIn Profile</Label>
                <Input
                  id="linkedIn"
                  {...register("linkedIn")}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>

              {/* Toggles */}
              <div className="flex gap-8">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={watch("isActive")}
                    onCheckedChange={(checked: boolean) =>
                      setValue("isActive", checked)
                    }
                  />
                  <Label>Active</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={watch("isFeatured")}
                    onCheckedChange={(checked: boolean) =>
                      setValue("isFeatured", checked)
                    }
                  />
                  <Label>Featured</Label>
                </div>
              </div>

              {/* Display Order */}
              <div className="space-y-2">
                <Label htmlFor="displayOrder">Display Order</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  {...register("displayOrder", { valueAsNumber: true })}
                  placeholder="0"
                  className="w-32"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Add Counsellor
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Counsellors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {counsellors.map((counsellor) => (
          <Card
            key={counsellor._id}
            className={`relative ${!counsellor.isActive ? "opacity-60" : ""}`}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-muted">
                    {counsellor.image ? (
                      <img
                        src={counsellor.image}
                        alt={counsellor.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Users className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{counsellor.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {counsellor.title}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(counsellor)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeletingCounsellor(counsellor)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {/* Exam Types */}
              <div className="flex gap-1 mb-3">
                {counsellor.examTypes.map((type) => (
                  <Badge key={type} variant="outline" className="text-xs">
                    {type.toUpperCase()}
                  </Badge>
                ))}
              </div>

              {/* Short Bio */}
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {counsellor.shortBio || counsellor.bio}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {counsellor.experience} years exp
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {counsellor.studentsGuided}+ students
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  {counsellor.rating?.toFixed(1) || "N/A"} (
                  {counsellor.totalReviews || 0})
                </div>
                <div className="flex items-center gap-1">
                  <GraduationCap className="w-4 h-4" />
                  {counsellor.qualifications.length} quals
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-1 text-sm mb-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="truncate">{counsellor.email}</span>
                </div>
                {counsellor.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{counsellor.phone}</span>
                  </div>
                )}
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between border-t pt-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={counsellor.isActive}
                    onCheckedChange={() => handleToggleActive(counsellor)}
                  />
                  <span className="text-sm">
                    {counsellor.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                {counsellor.isFeatured && (
                  <Badge variant="secondary">Featured</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {counsellors.length === 0 && (
        <Card className="p-8 text-center">
          <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No counsellors found</h3>
          <p className="text-muted-foreground mb-4">
            Add your first counsellor to get started.
          </p>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Counsellor
          </Button>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Counsellor</DialogTitle>
            <DialogDescription>Update counsellor details</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit(onEditSubmit)} className="space-y-6">
            {/* Profile Image */}
            <div className="space-y-2">
              <Label>Profile Photo</Label>
              <ImageUploadWithPreview
                currentImage={editProfileImage}
                onImageChange={setEditProfileImage}
                label="Change Photo"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input {...registerEdit("name")} />
              </div>

              <div className="space-y-2">
                <Label>Title *</Label>
                <Input {...registerEdit("title")} />
              </div>

              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" {...registerEdit("email")} />
              </div>

              <div className="space-y-2">
                <Label>Phone</Label>
                <Input {...registerEdit("phone")} />
              </div>

              <div className="space-y-2">
                <Label>Experience (Years) *</Label>
                <Input
                  type="number"
                  {...registerEdit("experience", { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label>Students Guided</Label>
                <Input
                  type="number"
                  {...registerEdit("studentsGuided", { valueAsNumber: true })}
                />
              </div>
            </div>

            {/* Exam Types */}
            <div className="space-y-2">
              <Label>Exam Types *</Label>
              <div className="flex gap-2">
                {examTypeOptions.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    variant={
                      watchEdit("examTypes")?.includes(option.value)
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      toggleExamType(
                        option.value,
                        watchEdit("examTypes") || [],
                        true,
                      )
                    }
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Bio *</Label>
              <Textarea {...registerEdit("bio")} rows={4} />
            </div>

            <div className="space-y-2">
              <Label>Short Bio</Label>
              <Input {...registerEdit("shortBio")} />
            </div>

            {/* Edit Qualifications */}
            <div className="space-y-2">
              <Label>Qualifications</Label>
              {editQualificationFields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <Input
                    {...registerEdit(`qualifications.${index}` as const)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeEditQualification(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendEditQualification("")}
              >
                <Plus className="w-4 h-4 mr-2" /> Add
              </Button>
            </div>

            {/* Edit Specializations */}
            <div className="space-y-2">
              <Label>Specializations</Label>
              {editSpecializationFields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <Input
                    {...registerEdit(`specializations.${index}` as const)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeEditSpecialization(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendEditSpecialization("")}
              >
                <Plus className="w-4 h-4 mr-2" /> Add
              </Button>
            </div>

            {/* Toggles */}
            <div className="flex gap-8">
              <div className="flex items-center gap-2">
                <Switch
                  checked={watchEdit("isActive")}
                  onCheckedChange={(checked: boolean) =>
                    setEditValue("isActive", checked)
                  }
                />
                <Label>Active</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={watchEdit("isFeatured")}
                  onCheckedChange={(checked: boolean) =>
                    setEditValue("isFeatured", checked)
                  }
                />
                <Label>Featured</Label>
              </div>
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
                {isEditSubmitting && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingCounsellor}
        onOpenChange={() => setDeletingCounsellor(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Counsellor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deletingCounsellor?.name}
              &quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
