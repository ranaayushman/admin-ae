// app/pyq-home/without-solution/page.tsx
"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  pyqWithoutSolutionSchema,
  PyqWithoutSolutionFormValues,
} from "@/lib/validations/pyq-home-schema";
import { papersService } from "@/lib/services/papers";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { toast } from "sonner";

export default function PyqWithoutSolutionPage() {
  const [bannerImage, setBannerImage] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<PyqWithoutSolutionFormValues>({
    resolver: zodResolver(pyqWithoutSolutionSchema),
    defaultValues: {
      title: "",
      category: "jee-main",
      year: new Date().getFullYear(),
      questionPaperLink: "",
      bannerImage: "",
      displayOrder: 1,
      isActive: true,
    },
  });

  const categoryValue = watch("category");

  const onSubmit = async (data: PyqWithoutSolutionFormValues) => {
    try {
      console.log("🚀 [onSubmit] Submitting form...", data);
      toast.info("Submitting...", { duration: 2000 });

      const payload = {
        category: data.category,
        year: data.year,
        title: data.title,
        paperDriveLink: data.questionPaperLink,
        thumbnailBase64: bannerImage || undefined,
        displayOrder: data.displayOrder,
      };

      console.log("🚀 [onSubmit] Payload prepared:", payload);
      console.log("🚀 [onSubmit] API URL:", process.env.NEXT_PUBLIC_API_URL);
      
      await papersService.createNoSolution(payload);

      console.log("✅ [onSubmit] Success!");
      toast.success("PYQ added successfully!", {
        description: "The paper has been added to the database.",
      });

      // Reset form
      reset({
        title: "",
        category: "jee-main",
        year: new Date().getFullYear(),
        questionPaperLink: "",
        bannerImage: "",
        displayOrder: 1,
      });
      setBannerImage("");
    } catch (error: any) {
      console.error("❌ [onSubmit] Error caught:", error);
      toast.error("Failed to create paper", {
        description: error.response?.data?.message || error.message || "Unknown error",
        duration: Infinity,
      });
    }
  };

  const onError = (errors: any) => {
    console.error("❌ [onError] Validation failed:", errors);
    toast.error("Form Validation Failed", {
      description: "Please check the highlighted fields.",
    });
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Add PYQ to Home (Without Solution)
          </h1>
          <p className="text-gray-500 mt-1">
            Add a previous year question paper without solution to the home page
          </p>
        </div>

        <form onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(onSubmit, onError)(e);
        }}>
          <Card>
            <CardHeader>
              <CardTitle>PYQ Details</CardTitle>
              <CardDescription>
                Enter the details and upload banner for the PYQ card
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="NEET 2024 - Phase 1"
                    {...register("title")}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    onValueChange={(val: any) => setValue("category", val)}
                    defaultValue={categoryValue}
                    value={categoryValue}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jee-main">JEE Main</SelectItem>
                      <SelectItem value="jee-advanced">JEE Advanced</SelectItem>
                      <SelectItem value="neet">NEET</SelectItem>
                      <SelectItem value="wbjee">WBJEE</SelectItem>
                      <SelectItem value="boards">Boards</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-red-600">{errors.category.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Year *</Label>
                  <Input
                    id="year"
                    type="number"
                    {...register("year", { valueAsNumber: true })}
                  />
                  {errors.year && (
                    <p className="text-sm text-red-600">{errors.year.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="displayOrder">Display Order</Label>
                  <Input
                    id="displayOrder"
                    type="number"
                    {...register("displayOrder", { valueAsNumber: true })}
                  />
                  {errors.displayOrder && (
                    <p className="text-sm text-red-600">
                      {errors.displayOrder.message}
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Link */}
              <div className="space-y-2">
                <Label htmlFor="questionPaperLink">
                  Question Paper Link (Google Drive) *
                </Label>
                <Input
                  id="questionPaperLink"
                  type="url"
                  placeholder="https://drive.google.com/file/d/..."
                  {...register("questionPaperLink")}
                />
                {errors.questionPaperLink && (
                  <p className="text-sm text-red-600">
                    {errors.questionPaperLink.message}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Paste the shareable Google Drive link
                </p>
              </div>

              <Separator />

              {/* Banner Upload */}
              <ImageUploadWithPreview
                label="Banner Image *"
                description="Upload a banner image for the PYQ card (Auto-converts to base64)"
                onImageChange={(base64) => {
                  setBannerImage(base64);
                  setValue("bannerImage", base64, { shouldValidate: true });
                }}
                currentImage={bannerImage}
              />
              {errors.bannerImage && (
                <p className="text-sm text-red-600">
                  {errors.bannerImage.message}
                </p>
              )}

              <Separator />

              {/* Submit */}
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    reset();
                    setBannerImage("");
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add PYQ to Home"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
