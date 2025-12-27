// app/packages/[id]/edit/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  packageSchema,
  PackageFormValues,
} from "@/lib/validations/package-schema";
import {
  updatePackage,
  mapFormToApiPayload,
  PackageDetails,
} from "@/lib/services/package.service";
import { testService, TestListItem } from "@/lib/services/test.service";
import { usePackageStore } from "@/lib/stores/packageStore";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUploadWithPreview } from "@/components/ui/ImageUploadWithPreview";
import { Plus, X, Loader2, ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

// Subject options by category
const subjectsByCategory: Record<string, string[]> = {
  JEE_MAIN: ["Physics", "Chemistry", "Mathematics"],
  JEE_ADVANCED: ["Physics", "Chemistry", "Mathematics"],
  NEET: ["Physics", "Chemistry", "Biology"],
  BOARD_10: ["Science", "Mathematics", "Social Science", "English"],
  BOARD_12: ["Physics", "Chemistry", "Mathematics", "Biology"],
  WBJEE: ["Physics", "Chemistry", "Mathematics"],
};

export default function EditPackagePage() {
  const params = useParams();
  const router = useRouter();
  const packageId = params.id as string;

  const {
    packages,
    fetchPackages,
    fetchPackageById,
    selectedPackage,
    loadingDetails,
    invalidateCache,
  } = usePackageStore();

  const [bannerImage, setBannerImage] = useState("");
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [showTestSelector, setShowTestSelector] = useState(false);
  const [availableTests, setAvailableTests] = useState<TestListItem[]>([]);
  const [isLoadingTests, setIsLoadingTests] = useState(false);
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<PackageFormValues>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      price: 0,
      discountPercentage: 0,
      validityPeriod: 180,
      validityUnit: "DAYS",
      maxEnrollments: 0,
      enableWaitlist: false,
      enableSequentialUnlock: false,
      isActive: true,
      isFeatured: false,
      testSeriesIds: [],
      features: [],
      subjects: [],
      examTypes: [],
    },
  });

  const validityUnit = watch("validityUnit");
  const maxEnrollments = watch("maxEnrollments");
  const category = watch("category");

  // Fetch packages list for cache fallback
  useEffect(() => {
    if (packages.length === 0) {
      fetchPackages();
    }
  }, [packages.length, fetchPackages]);

  // Fetch package details
  useEffect(() => {
    if (packageId && packages.length > 0) {
      fetchPackageById(packageId);
    }
  }, [packageId, packages.length, fetchPackageById]);

  // Initialize form with package data
  useEffect(() => {
    if (selectedPackage && !isInitialized) {
      const pkg = selectedPackage;

      // Convert validityDays to period and unit
      let validityPeriod = pkg.validityDays ?? 180;
      let validityUnit: "DAYS" | "MONTHS" | "YEARS" | "LIFETIME" = "DAYS";

      if (validityPeriod >= 36500) {
        validityUnit = "LIFETIME";
        validityPeriod = 100;
      } else if (validityPeriod >= 365 && validityPeriod % 365 === 0) {
        validityUnit = "YEARS";
        validityPeriod = validityPeriod / 365;
      } else if (validityPeriod >= 30 && validityPeriod % 30 === 0) {
        validityUnit = "MONTHS";
        validityPeriod = validityPeriod / 30;
      }

      // Reset form with package data
      reset({
        name: pkg.title,
        description: pkg.description,
        category: pkg.category,
        price: pkg.price ?? 0,
        discountPercentage: pkg.discountPercentage ?? 0,
        earlyBirdPrice: pkg.earlyBirdPrice ?? undefined,
        validityPeriod,
        validityUnit,
        maxEnrollments: pkg.maxEnrollments ?? 0,
        enableWaitlist: pkg.enableWaitlist ?? false,
        enableSequentialUnlock: pkg.sequentialUnlock ?? false,
        accessStartDate: pkg.accessStartDate
          ? pkg.accessStartDate.split("T")[0]
          : undefined,
        isActive: pkg.status === "active",
        isFeatured: pkg.isFeatured ?? false,
        testSeriesIds: [],
        features: pkg.features ?? [],
        subjects: pkg.subjects ?? [],
        examTypes: pkg.examTypes ?? [],
      });

      // Set local state
      setBannerImage(pkg.banner || "");
      setFeatures(pkg.features ?? []);
      setSelectedSubjects(pkg.subjects ?? []);

      // Set selected tests from populated test objects
      if (pkg.tests && pkg.tests.length > 0) {
        const testIds = pkg.tests.map((t) => t._id);
        setSelectedTests(testIds);
        setValue("testSeriesIds", testIds);
      }

      setIsInitialized(true);
    }
  }, [selectedPackage, isInitialized, reset, setValue]);

  // Fetch available tests on mount
  useEffect(() => {
    const fetchTests = async () => {
      setIsLoadingTests(true);
      try {
        const response = await testService.getTests({ limit: 100 });
        setAvailableTests(response.data || []);
      } catch (error) {
        console.error("Error fetching tests:", error);
        toast.error("Failed to load available tests");
      } finally {
        setIsLoadingTests(false);
      }
    };
    fetchTests();
  }, []);

  const handleAddTest = (testId: string) => {
    if (!selectedTests.includes(testId)) {
      const updated = [...selectedTests, testId];
      setSelectedTests(updated);
      setValue("testSeriesIds", updated, { shouldDirty: true });
    }
  };

  const handleRemoveTest = (testId: string) => {
    const updated = selectedTests.filter((id) => id !== testId);
    setSelectedTests(updated);
    setValue("testSeriesIds", updated, { shouldDirty: true });
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      const updated = [...features, newFeature.trim()];
      setFeatures(updated);
      setValue("features", updated, { shouldDirty: true });
      setNewFeature("");
    }
  };

  const handleRemoveFeature = (index: number) => {
    const updated = features.filter((_, i) => i !== index);
    setFeatures(updated);
    setValue("features", updated, { shouldDirty: true });
  };

  const handleSubjectToggle = (subject: string) => {
    const updated = selectedSubjects.includes(subject)
      ? selectedSubjects.filter((s) => s !== subject)
      : [...selectedSubjects, subject];
    setSelectedSubjects(updated);
    setValue("subjects", updated, { shouldDirty: true });
  };

  const onSubmit = async (data: PackageFormValues) => {
    try {
      // Build update payload - only include changed fields
      const apiPayload = mapFormToApiPayload({
        name: data.name,
        description: data.description,
        category: data.category,
        price: data.price,
        discountPercentage: data.discountPercentage,
        earlyBirdPrice: data.earlyBirdPrice,
        validityPeriod: data.validityPeriod,
        validityUnit: data.validityUnit,
        maxEnrollments: data.maxEnrollments,
        enableWaitlist: data.enableWaitlist ?? false,
        enableSequentialUnlock: data.enableSequentialUnlock ?? false,
        accessStartDate: data.accessStartDate,
        isActive: data.isActive ?? true,
        isFeatured: data.isFeatured ?? false,
        bannerImage,
        testSeriesIds: selectedTests,
        features,
        subjects: selectedSubjects,
        examTypes: [data.category],
      });

      console.log(
        "📦 Update Package Payload:",
        JSON.stringify(apiPayload, null, 2)
      );

      await updatePackage(packageId, apiPayload);

      toast.success("Package updated successfully!");

      // Invalidate cache and navigate back
      invalidateCache();
      router.push(`/packages/${packageId}`);
    } catch (error) {
      console.error("❌ Error updating package:", error);
      toast.error("Failed to update package", {
        description:
          error instanceof Error ? error.message : "Please try again",
      });
    }
  };

  if (loadingDetails || !isInitialized) {
    return (
      <div className="min-h-screen p-6 bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading package...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/packages/${packageId}`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Package</h1>
              <p className="text-gray-500 mt-1">
                {selectedPackage?.packageId || packageId}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Details */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Details</CardTitle>
              <CardDescription>
                Package information and branding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Package Name *</Label>
                  <Input
                    id="name"
                    placeholder="JEE Main 2025 Complete Package"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={category}
                    onValueChange={(value) =>
                      setValue("category", value, { shouldDirty: true })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="JEE_MAIN">JEE Main</SelectItem>
                      <SelectItem value="JEE_ADVANCED">JEE Advanced</SelectItem>
                      <SelectItem value="NEET">NEET</SelectItem>
                      <SelectItem value="BOARD_10">10th Board</SelectItem>
                      <SelectItem value="BOARD_12">12th Board</SelectItem>
                      <SelectItem value="WBJEE">WBJEE</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-red-600">
                      {errors.category.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <textarea
                  id="description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Complete test series with 50 mock tests..."
                  {...register("description")}
                />
                {errors.description && (
                  <p className="text-sm text-red-600">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <ImageUploadWithPreview
                label="Package Banner"
                description="Upload banner image for package (Recommended: 1200x400px)"
                onImageChange={(base64) => setBannerImage(base64)}
                currentImage={bannerImage}
              />
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
              <CardDescription>
                Set package pricing and discounts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    {...register("price", { valueAsNumber: true })}
                  />
                  {errors.price && (
                    <p className="text-sm text-red-600">
                      {errors.price.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discountPercentage">Discount %</Label>
                  <Input
                    id="discountPercentage"
                    type="number"
                    placeholder="0"
                    {...register("discountPercentage", { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="earlyBirdPrice">Early Bird Price</Label>
                  <Input
                    id="earlyBirdPrice"
                    type="number"
                    placeholder="Optional"
                    {...register("earlyBirdPrice", { valueAsNumber: true })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subjects & Features */}
          <Card>
            <CardHeader>
              <CardTitle>Subjects & Features</CardTitle>
              <CardDescription>
                Select subjects covered and highlight package features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Subjects */}
              {category && subjectsByCategory[category] && (
                <div className="space-y-3">
                  <Label>Subjects Covered</Label>
                  <div className="flex flex-wrap gap-2">
                    {subjectsByCategory[category].map((subject) => (
                      <button
                        key={subject}
                        type="button"
                        onClick={() => handleSubjectToggle(subject)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition ${
                          selectedSubjects.includes(subject)
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 hover:border-blue-300"
                        }`}
                      >
                        {subject}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Features */}
              <div className="space-y-3">
                <Label>Package Features</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., 50+ Full Length Mock Tests"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddFeature();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddFeature}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {features.length > 0 && (
                  <div className="space-y-2">
                    {features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                      >
                        <span className="text-sm">{feature}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFeature(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Test Selection */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Test Series</CardTitle>
                  <CardDescription>
                    Select tests to include in this package
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  onClick={() => setShowTestSelector(!showTestSelector)}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Tests
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {selectedTests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No tests selected</p>
                  <p className="text-sm mt-1">
                    Click &quot;Add Tests&quot; to select
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedTests.map((testId) => {
                    // Try to find from available tests or from package tests
                    const test =
                      availableTests.find((t) => t._id === testId) ||
                      selectedPackage?.tests?.find((t) => t._id === testId);
                    return (
                      <div
                        key={testId}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">
                            {test?.title || "Unknown Test"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {(test as TestListItem)?.totalQuestions ||
                              (test as TestListItem)?.questions?.length ||
                              0}{" "}
                            questions
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveTest(testId)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Test Selector */}
              {showTestSelector && (
                <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                  <h4 className="font-medium mb-3">Available Tests</h4>
                  {isLoadingTests ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                      <span className="ml-2 text-gray-500">
                        Loading tests...
                      </span>
                    </div>
                  ) : availableTests.length === 0 ? (
                    <p className="text-center py-4 text-gray-500">
                      No tests available
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {availableTests.map((test) => (
                        <button
                          key={test._id}
                          type="button"
                          onClick={() => handleAddTest(test._id)}
                          disabled={selectedTests.includes(test._id)}
                          className={`w-full text-left p-3 border rounded-lg transition ${
                            selectedTests.includes(test._id)
                              ? "bg-gray-100 opacity-50 cursor-not-allowed"
                              : "hover:bg-white hover:border-blue-300"
                          }`}
                        >
                          <p className="font-medium">{test.title}</p>
                          <p className="text-sm text-gray-500">
                            {test.totalQuestions || test.questions?.length || 0}{" "}
                            questions • {test.category}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Validity & Enrollment */}
          <Card>
            <CardHeader>
              <CardTitle>Validity & Enrollment</CardTitle>
              <CardDescription>
                Configure access duration and enrollment limits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="validityPeriod">Validity Duration *</Label>
                  <Input
                    id="validityPeriod"
                    type="number"
                    {...register("validityPeriod", { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="validityUnit">Unit</Label>
                  <Select
                    value={validityUnit}
                    onValueChange={(value) =>
                      setValue(
                        "validityUnit",
                        value as "DAYS" | "MONTHS" | "YEARS" | "LIFETIME",
                        {
                          shouldDirty: true,
                        }
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DAYS">Days</SelectItem>
                      <SelectItem value="MONTHS">Months</SelectItem>
                      <SelectItem value="YEARS">Years</SelectItem>
                      <SelectItem value="LIFETIME">Lifetime</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxEnrollments">
                    Max Enrollments (0 = unlimited)
                  </Label>
                  <Input
                    id="maxEnrollments"
                    type="number"
                    {...register("maxEnrollments", { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accessStartDate">Access Start Date</Label>
                  <Input
                    id="accessStartDate"
                    type="date"
                    {...register("accessStartDate")}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="enableWaitlist"
                    checked={watch("enableWaitlist")}
                    onCheckedChange={(checked) =>
                      setValue("enableWaitlist", checked as boolean, {
                        shouldDirty: true,
                      })
                    }
                    disabled={!maxEnrollments || maxEnrollments === 0}
                  />
                  <Label htmlFor="enableWaitlist" className="cursor-pointer">
                    Enable waitlist when enrollment limit reached
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="enableSequentialUnlock"
                    checked={watch("enableSequentialUnlock")}
                    onCheckedChange={(checked) =>
                      setValue("enableSequentialUnlock", checked as boolean, {
                        shouldDirty: true,
                      })
                    }
                  />
                  <Label
                    htmlFor="enableSequentialUnlock"
                    className="cursor-pointer"
                  >
                    Enable sequential unlock (unlock next test after completing
                    previous)
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={watch("isActive")}
                  onCheckedChange={(checked) =>
                    setValue("isActive", checked as boolean, {
                      shouldDirty: true,
                    })
                  }
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  Active (visible to students)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isFeatured"
                  checked={watch("isFeatured")}
                  onCheckedChange={(checked) =>
                    setValue("isFeatured", checked as boolean, {
                      shouldDirty: true,
                    })
                  }
                />
                <Label htmlFor="isFeatured" className="cursor-pointer">
                  Featured (show on homepage)
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-3">
            <Link href={`/packages/${packageId}`}>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
