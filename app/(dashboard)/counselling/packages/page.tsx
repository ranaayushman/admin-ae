"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  counsellingService,
  GetPackagesParams,
} from "@/lib/services/counselling.service";
import { counsellorService } from "@/lib/services/counsellor.service";
import {
  CounsellingPackage,
  CreateCounsellingPackagePayload,
  UpdateCounsellingPackagePayload,
  Counsellor,
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
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  Eye,
  EyeOff,
  RefreshCw,
  Package,
  IndianRupee,
  Calendar,
  Users,
  Star,
  CheckCircle,
  XCircle,
} from "lucide-react";

// Form validation schema
const packageSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  examType: z.enum(["jee", "neet", "wbjee"]),
  description: z.string().min(1, "Description is required"),
  shortDescription: z.string().optional(),
  price: z.number().min(0, "Price must be positive"),
  discountPrice: z.number().optional(),
  discountPercentage: z.number().optional(),
  validityDays: z.number().min(1, "Validity must be at least 1 day"),
  maxSessions: z.number().min(1, "At least 1 session required"),
  sessionDuration: z.number().min(15, "Session must be at least 15 minutes"),
  highlights: z.array(z.string()),
  features: z.array(
    z.object({
      title: z.string().min(1, "Feature title is required"),
      description: z.string().min(1, "Feature description is required"),
      included: z.boolean(),
    }),
  ),
  badge: z.string().optional(),
  badgeColor: z.string().optional(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  displayOrder: z.number(),
  termsAndConditions: z.string().optional(),
});

type PackageFormValues = z.infer<typeof packageSchema>;

const examTypeLabels: Record<ExamType, string> = {
  jee: "JEE Counselling",
  neet: "NEET Counselling",
  wbjee: "WBJEE Counselling",
};

export default function CounsellingPackagesPage() {
  const [packages, setPackages] = useState<CounsellingPackage[]>([]);
  const [counsellors, setCounsellors] = useState<Counsellor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterExamType, setFilterExamType] = useState<string>("all");

  // Create form state
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Edit modal state
  const [editingPackage, setEditingPackage] =
    useState<CounsellingPackage | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Delete confirmation
  const [deletingPackage, setDeletingPackage] =
    useState<CounsellingPackage | null>(null);
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
  } = useForm<PackageFormValues>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      name: "",
      slug: "",
      examType: "jee",
      description: "",
      shortDescription: "",
      price: 4999,
      discountPrice: undefined,
      discountPercentage: undefined,
      validityDays: 180,
      maxSessions: 5,
      sessionDuration: 30,
      highlights: [""],
      features: [{ title: "", description: "", included: true }],
      badge: "",
      badgeColor: "#2596be",
      isActive: true,
      isFeatured: false,
      displayOrder: 0,
      termsAndConditions: "",
    },
  });

  const {
    fields: highlightFields,
    append: appendHighlight,
    remove: removeHighlight,
  } = useFieldArray({
    control,
    name: "highlights" as never,
  });

  const {
    fields: featureFields,
    append: appendFeature,
    remove: removeFeature,
  } = useFieldArray({
    control,
    name: "features",
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
  } = useForm<PackageFormValues>({
    resolver: zodResolver(packageSchema),
  });

  const {
    fields: editHighlightFields,
    append: appendEditHighlight,
    remove: removeEditHighlight,
    replace: replaceEditHighlights,
  } = useFieldArray({
    control: controlEdit,
    name: "highlights" as never,
  });

  const {
    fields: editFeatureFields,
    append: appendEditFeature,
    remove: removeEditFeature,
    replace: replaceEditFeatures,
  } = useFieldArray({
    control: controlEdit,
    name: "features",
  });

  // Fetch packages
  const fetchPackages = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const params: GetPackagesParams = { sort: "displayOrder" };
      if (filterExamType !== "all") {
        params.examType = filterExamType as ExamType;
      }
      const data = await counsellingService.getPackages(params);
      setPackages(data);
    } catch (error: any) {
      console.error("Failed to fetch packages:", error);
      toast.error("Failed to load packages", {
        description: error.message || "Please try again",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [filterExamType]);

  // Fetch counsellors for assignment
  const fetchCounsellors = useCallback(async () => {
    try {
      const data = await counsellorService.getCounsellors({ isActive: true });
      setCounsellors(data);
    } catch (error) {
      console.error("Failed to fetch counsellors:", error);
    }
  }, []);

  useEffect(() => {
    fetchPackages();
    fetchCounsellors();
  }, [fetchPackages, fetchCounsellors]);

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  // Create new package
  const onSubmit = async (data: PackageFormValues) => {
    try {
      console.log("🚀 Creating package...", data);
      toast.info("Creating package...");

      const payload: CreateCounsellingPackagePayload = {
        ...data,
        currency: "INR", // Required by API
        highlights: data.highlights.filter((h) => h.trim() !== ""),
        features: data.features.filter((f) => f.title.trim() !== ""),
      };

      console.log("📤 Payload being sent:", JSON.stringify(payload, null, 2));

      const newPackage = await counsellingService.createPackage(payload);

      toast.success("Package created successfully!", {
        description: `${newPackage.name} has been created.`,
      });

      reset();
      setShowCreateForm(false);
      fetchPackages();
    } catch (error: any) {
      console.error("Failed to create package:", error);
      console.error("❌ Error response:", error.response?.data);
      toast.error("Failed to create package", {
        description: error.response?.data?.message || error.message,
      });
    }
  };

  // Open edit dialog
  const handleEdit = (pkg: CounsellingPackage) => {
    setEditingPackage(pkg);
    resetEdit({
      name: pkg.name,
      slug: pkg.slug,
      examType: pkg.examType,
      description: pkg.description,
      shortDescription: pkg.shortDescription || "",
      price: pkg.price,
      discountPrice: pkg.discountPrice,
      discountPercentage: pkg.discountPercentage,
      validityDays: pkg.validityDays,
      maxSessions: pkg.maxSessions,
      sessionDuration: pkg.sessionDuration,
      highlights: pkg.highlights.length > 0 ? pkg.highlights : [""],
      features:
        pkg.features.length > 0
          ? pkg.features.map(f => ({ ...f, description: f.description || "" }))
          : [{ title: "", description: "", included: true }],
      badge: pkg.badge || "",
      badgeColor: pkg.badgeColor || "#2596be",
      isActive: pkg.isActive,
      isFeatured: pkg.isFeatured,
      displayOrder: pkg.displayOrder,
      termsAndConditions: pkg.termsAndConditions || "",
    });
    replaceEditHighlights(pkg.highlights.length > 0 ? pkg.highlights : [""]);
    replaceEditFeatures(
      pkg.features.length > 0
        ? pkg.features.map(f => ({ ...f, description: f.description || "" }))
        : [{ title: "", description: "", included: true }],
    );
    setIsEditDialogOpen(true);
  };

  // Submit edit
  const onEditSubmit = async (data: PackageFormValues) => {
    if (!editingPackage) return;

    try {
      console.log("🚀 Updating package...", data);
      toast.info("Updating package...");

      const payload: UpdateCounsellingPackagePayload = {
        ...data,
        highlights: data.highlights.filter((h) => h.trim() !== ""),
        features: data.features.filter((f) => f.title.trim() !== ""),
      };

      const updatedPackage = await counsellingService.updatePackage(
        editingPackage._id,
        payload,
      );

      toast.success("Package updated successfully!", {
        description: `${updatedPackage.name} has been updated.`,
      });

      setIsEditDialogOpen(false);
      setEditingPackage(null);
      fetchPackages();
    } catch (error: any) {
      console.error("Failed to update package:", error);
      toast.error("Failed to update package", {
        description: error.response?.data?.message || error.message,
      });
    }
  };

  // Delete package
  const handleDelete = async () => {
    if (!deletingPackage) return;

    try {
      setIsDeleting(true);
      await counsellingService.deletePackage(deletingPackage._id);

      toast.success("Package deleted", {
        description: `${deletingPackage.name} has been deleted.`,
      });

      setDeletingPackage(null);
      fetchPackages();
    } catch (error: any) {
      console.error("Failed to delete package:", error);
      toast.error("Failed to delete package", {
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Toggle active status
  const handleToggleActive = async (pkg: CounsellingPackage) => {
    try {
      await counsellingService.updatePackage(pkg._id, {
        isActive: !pkg.isActive,
      });
      toast.success(pkg.isActive ? "Package deactivated" : "Package activated");
      fetchPackages();
    } catch (error: any) {
      toast.error("Failed to update status");
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
          <h1 className="text-3xl font-bold">Counselling Packages</h1>
          <p className="text-muted-foreground">
            Manage JEE, NEET, and WBJEE counselling pricing packages
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchPackages}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Package
          </Button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-4 mb-6">
        <Select value={filterExamType} onValueChange={setFilterExamType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by exam type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Exam Types</SelectItem>
            <SelectItem value="jee">JEE Counselling</SelectItem>
            <SelectItem value="neet">NEET Counselling</SelectItem>
            <SelectItem value="wbjee">WBJEE Counselling</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create New Package</CardTitle>
            <CardDescription>
              Add a new counselling package with pricing and features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Package Name *</Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="JEE Premium Counselling"
                    onChange={(e) => {
                      register("name").onChange(e);
                      setValue("slug", generateSlug(e.target.value));
                    }}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Slug */}
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    {...register("slug")}
                    placeholder="jee-premium"
                  />
                  {errors.slug && (
                    <p className="text-sm text-red-500">
                      {errors.slug.message}
                    </p>
                  )}
                </div>

                {/* Exam Type */}
                <div className="space-y-2">
                  <Label htmlFor="examType">Exam Type *</Label>
                  <Select
                    value={watch("examType")}
                    onValueChange={(value) =>
                      setValue("examType", value as ExamType)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select exam type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jee">JEE Counselling</SelectItem>
                      <SelectItem value="neet">NEET Counselling</SelectItem>
                      <SelectItem value="wbjee">WBJEE Counselling</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    {...register("price", { valueAsNumber: true })}
                    placeholder="4999"
                  />
                  {errors.price && (
                    <p className="text-sm text-red-500">
                      {errors.price.message}
                    </p>
                  )}
                </div>

                {/* Discount Price */}
                <div className="space-y-2">
                  <Label htmlFor="discountPrice">Discount Price (₹)</Label>
                  <Input
                    id="discountPrice"
                    type="number"
                    {...register("discountPrice", { valueAsNumber: true })}
                    placeholder="3999"
                  />
                </div>

                {/* Validity Days */}
                <div className="space-y-2">
                  <Label htmlFor="validityDays">Validity (Days) *</Label>
                  <Input
                    id="validityDays"
                    type="number"
                    {...register("validityDays", { valueAsNumber: true })}
                    placeholder="180"
                  />
                </div>

                {/* Max Sessions */}
                <div className="space-y-2">
                  <Label htmlFor="maxSessions">Max Sessions *</Label>
                  <Input
                    id="maxSessions"
                    type="number"
                    {...register("maxSessions", { valueAsNumber: true })}
                    placeholder="5"
                  />
                </div>

                {/* Session Duration */}
                <div className="space-y-2">
                  <Label htmlFor="sessionDuration">
                    Session Duration (mins) *
                  </Label>
                  <Input
                    id="sessionDuration"
                    type="number"
                    {...register("sessionDuration", { valueAsNumber: true })}
                    placeholder="30"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Complete JEE counselling package with personalized mentorship..."
                  rows={3}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Short Description */}
              <div className="space-y-2">
                <Label htmlFor="shortDescription">Short Description</Label>
                <Input
                  id="shortDescription"
                  {...register("shortDescription")}
                  placeholder="Premium package with 1-on-1 mentorship"
                />
              </div>

              {/* Highlights */}
              <div className="space-y-2">
                <Label>Highlights</Label>
                {highlightFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <Input
                      {...register(`highlights.${index}` as const)}
                      placeholder="5 Personal Sessions"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeHighlight(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendHighlight("")}
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Highlight
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Features</Label>
                {featureFields.map((field, index) => (
                  <div key={field.id} className="border p-3 rounded-md space-y-2">
                    <div className="flex gap-2 items-start">
                      <div className="flex-1 space-y-2">
                        <Input
                          {...register(`features.${index}.title` as const)}
                          placeholder="Feature title (e.g., 1-on-1 Calls)"
                        />
                        <Textarea
                          {...register(`features.${index}.description` as const)}
                          placeholder="Feature description (e.g., Weekly personalized calls)"
                          rows={2}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 text-sm whitespace-nowrap">
                          <input
                            type="checkbox"
                            {...register(`features.${index}.included` as const)}
                          />
                          Included
                        </label>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeFeature(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    appendFeature({
                      title: "",
                      description: "",
                      included: true,
                    })
                  }
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Feature
                </Button>
              </div>

              {/* Badge */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="badge">Badge Text</Label>
                  <Input
                    id="badge"
                    {...register("badge")}
                    placeholder="Most Popular"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="badgeColor">Badge Color</Label>
                  <Input
                    id="badgeColor"
                    type="color"
                    {...register("badgeColor")}
                  />
                </div>
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
                  Create Package
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

      {/* Packages List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <Card
            key={pkg._id}
            className={`relative ${!pkg.isActive ? "opacity-60" : ""}`}
          >
            {/* Badge */}
            {pkg.badge && (
              <div
                className="absolute -top-3 left-4 px-3 py-1 rounded-full text-white text-xs font-semibold"
                style={{ backgroundColor: pkg.badgeColor || "#2596be" }}
              >
                {pkg.badge}
              </div>
            )}

            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <Badge variant="outline" className="mb-2">
                    {examTypeLabels[pkg.examType]}
                  </Badge>
                  <CardTitle className="text-lg">{pkg.name}</CardTitle>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(pkg)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeletingPackage(pkg)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {pkg.shortDescription || pkg.description}
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-2xl font-bold">
                  ₹{pkg.discountPrice || pkg.price}
                </span>
                {pkg.discountPrice && pkg.discountPrice < pkg.price && (
                  <span className="text-sm text-muted-foreground line-through">
                    ₹{pkg.price}
                  </span>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {pkg.validityDays} days
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {pkg.maxSessions} sessions
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  {pkg.totalEnrollments} enrolled
                </div>
              </div>

              {/* Features Preview */}
              <div className="space-y-1 mb-4">
                {pkg.features.slice(0, 3).map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    {feature.included ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-400" />
                    )}
                    <span
                      className={
                        feature.included ? "" : "text-muted-foreground"
                      }
                    >
                      {feature.title}
                    </span>
                  </div>
                ))}
                {pkg.features.length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    +{pkg.features.length - 3} more features
                  </p>
                )}
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between border-t pt-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={pkg.isActive}
                    onCheckedChange={() => handleToggleActive(pkg)}
                  />
                  <span className="text-sm">
                    {pkg.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                {pkg.isFeatured && <Badge variant="secondary">Featured</Badge>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {packages.length === 0 && (
        <Card className="p-8 text-center">
          <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No packages found</h3>
          <p className="text-muted-foreground mb-4">
            {filterExamType !== "all"
              ? `No ${examTypeLabels[filterExamType as ExamType]} packages yet.`
              : "Create your first counselling package to get started."}
          </p>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Package
          </Button>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Package</DialogTitle>
            <DialogDescription>
              Update the counselling package details
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit(onEditSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Package Name *</Label>
                <Input {...registerEdit("name")} placeholder="Package name" />
              </div>

              <div className="space-y-2">
                <Label>Slug *</Label>
                <Input {...registerEdit("slug")} placeholder="package-slug" />
              </div>

              <div className="space-y-2">
                <Label>Exam Type *</Label>
                <Select
                  value={watchEdit("examType")}
                  onValueChange={(value) =>
                    setEditValue("examType", value as ExamType)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jee">JEE Counselling</SelectItem>
                    <SelectItem value="neet">NEET Counselling</SelectItem>
                    <SelectItem value="wbjee">WBJEE Counselling</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Price (₹) *</Label>
                <Input
                  type="number"
                  {...registerEdit("price", { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label>Discount Price (₹)</Label>
                <Input
                  type="number"
                  {...registerEdit("discountPrice", { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label>Validity (Days) *</Label>
                <Input
                  type="number"
                  {...registerEdit("validityDays", { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label>Max Sessions *</Label>
                <Input
                  type="number"
                  {...registerEdit("maxSessions", { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label>Session Duration (mins) *</Label>
                <Input
                  type="number"
                  {...registerEdit("sessionDuration", { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea {...registerEdit("description")} rows={3} />
            </div>

            {/* Edit Features */}
            <div className="space-y-2">
              <Label>Features</Label>
              {editFeatureFields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-center">
                  <Input
                    {...registerEdit(`features.${index}.title` as const)}
                    placeholder="Feature title"
                    className="flex-1"
                  />
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      {...registerEdit(`features.${index}.included` as const)}
                    />
                    Included
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeEditFeature(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  appendEditFeature({
                    title: "",
                    description: "",
                    included: true,
                  })
                }
              >
                <Plus className="w-4 h-4 mr-2" /> Add Feature
              </Button>
            </div>

            {/* Badge */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Badge Text</Label>
                <Input {...registerEdit("badge")} placeholder="Most Popular" />
              </div>
              <div className="space-y-2">
                <Label>Badge Color</Label>
                <Input type="color" {...registerEdit("badgeColor")} />
              </div>
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
        open={!!deletingPackage}
        onOpenChange={() => setDeletingPackage(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Package</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deletingPackage?.name}
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
