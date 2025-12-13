// app/packages/create/page.tsx
"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  packageSchema,
  PackageFormValues,
} from "@/lib/validations/package-schema";
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
import { Separator } from "@/components/ui/separator";
import { ImageUploadWithPreview } from "@/components/ui/ImageUploadWithPreview";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";

// Mock available tests
const mockAvailableTests = [
  { id: "test_001", name: "JEE Main Mock Test 1", questionsCount: 75 },
  { id: "test_002", name: "JEE Main Mock Test 2", questionsCount: 75 },
  { id: "test_003", name: "Physics Chapter Test", questionsCount: 30 },
  { id: "test_004", name: "Chemistry Full Test", questionsCount: 45 },
  { id: "test_005", name: "Mathematics Advanced", questionsCount: 60 },
];

export default function CreatePackagePage() {
  const [bannerImage, setBannerImage] = useState("");
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [showTestSelector, setShowTestSelector] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
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
    },
  });

  const validityUnit = watch("validityUnit");
  const maxEnrollments = watch("maxEnrollments");

  const handleAddTest = (testId: string) => {
    if (!selectedTests.includes(testId)) {
      const updated = [...selectedTests, testId];
      setSelectedTests(updated);
      setValue("testSeriesIds", updated);
    }
  };

  const handleRemoveTest = (testId: string) => {
    const updated = selectedTests.filter((id) => id !== testId);
    setSelectedTests(updated);
    setValue("testSeriesIds", updated);
  };

  const onSubmit = (data: PackageFormValues) => {
    const payload = {
      ...data,
      bannerImage,
      testSeriesIds: selectedTests,
      createdAt: new Date().toISOString(),
    };

    console.log("Create Package Payload:", payload);
    toast.success("Package created successfully!", {
      description: "Check console for complete payload",
    });

    reset();
    setBannerImage("");
    setSelectedTests([]);
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Package</h1>
          <p className="text-gray-500 mt-1">
            Bundle multiple test series into a sellable package
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Details */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Details</CardTitle>
              <CardDescription>Package information and branding</CardDescription>
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
                    <p className="text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select onValueChange={(value) => setValue("category", value)}>
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
                    <p className="text-sm text-red-600">{errors.category.message}</p>
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
                  <p className="text-sm text-red-600">{errors.description.message}</p>
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
              <CardDescription>Set package pricing and discounts</CardDescription>
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
                    <p className="text-sm text-red-600">{errors.price.message}</p>
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
                  <p className="text-sm mt-1">Click "Add Tests" to select</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedTests.map((testId) => {
                    const test = mockAvailableTests.find((t) => t.id === testId);
                    return (
                      <div
                        key={testId}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{test?.name}</p>
                          <p className="text-sm text-gray-500">
                            {test?.questionsCount} questions
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
              {errors.testSeriesIds && (
                <p className="text-sm text-red-600 mt-2">
                  {errors.testSeriesIds.message}
                </p>
              )}

              {/* Test Selector */}
              {showTestSelector && (
                <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                  <h4 className="font-medium mb-3">Available Tests</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {mockAvailableTests.map((test) => (
                      <button
                        key={test.id}
                        type="button"
                        onClick={() => handleAddTest(test.id)}
                        disabled={selectedTests.includes(test.id)}
                        className={`w-full text-left p-3 border rounded-lg transition ${
                          selectedTests.includes(test.id)
                            ? "bg-gray-100 opacity-50 cursor-not-allowed"
                            : "hover:bg-white hover:border-blue-300"
                        }`}
                      >
                        <p className="font-medium">{test.name}</p>
                        <p className="text-sm text-gray-500">
                          {test.questionsCount} questions
                        </p>
                      </button>
                    ))}
                  </div>
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
                    onValueChange={(value) => setValue("validityUnit", value as any)}
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
                    {...register("enableWaitlist")}
                    onCheckedChange={(checked) =>
                      setValue("enableWaitlist", checked as boolean)
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
                    {...register("enableSequentialUnlock")}
                    onCheckedChange={(checked) =>
                      setValue("enableSequentialUnlock", checked as boolean)
                    }
                  />
                  <Label htmlFor="enableSequentialUnlock" className="cursor-pointer">
                    Enable sequential unlock (unlock next test after completing previous)
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
                  defaultChecked
                  {...register("isActive")}
                  onCheckedChange={(checked) =>
                    setValue("isActive", checked as boolean)
                  }
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  Active (visible to students)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isFeatured"
                  {...register("isFeatured")}
                  onCheckedChange={(checked) =>
                    setValue("isFeatured", checked as boolean)
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
            <Button type="button" variant="outline" onClick={() => reset()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Package"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
