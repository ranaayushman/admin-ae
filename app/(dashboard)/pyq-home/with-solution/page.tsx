// app/pyq-home/with-solution/page.tsx
"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  pyqWithSolutionSchema,
  PyqWithSolutionFormValues,
} from "@/lib/validations/pyq-home-schema";
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

export default function PyqWithSolutionPage() {
  const [bannerImage, setBannerImage] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PyqWithSolutionFormValues>({
    resolver: zodResolver(pyqWithSolutionSchema),
    defaultValues: {
      title: "",
      exam: "",
      year: new Date().getFullYear(),
      questionPaperLink: "",
      videoSolutionLink: "",
      bannerImage: "",
      displayOrder: 1,
      isActive: true,
    },
  });

  const onSubmit = (data: PyqWithSolutionFormValues) => {
    const payload = {
      ...data,
      bannerImage,
      createdAt: new Date().toISOString(),
    };

    console.log("PYQ With Solution Payload:", payload);
    console.log("Banner Base64 Length:", bannerImage.length);

    toast.success("PYQ added to home page successfully!", {
      description: "Check console for complete payload with base64 banner",
    });

    // Reset form
    reset();
    setBannerImage("");
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Add PYQ to Home (With Solution)
          </h1>
          <p className="text-gray-500 mt-1">
            Add a previous year question paper with video solution to the home page
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
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
                    placeholder="JEE Main 2024 January Attempt - Shift 1"
                    {...register("title")}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exam">Exam *</Label>
                  <Input
                    id="exam"
                    placeholder="JEE Main"
                    {...register("exam")}
                  />
                  {errors.exam && (
                    <p className="text-sm text-red-600">{errors.exam.message}</p>
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

              {/* Links */}
              <div className="space-y-4">
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

                <div className="space-y-2">
                  <Label htmlFor="videoSolutionLink">
                    Video Solution Link (YouTube) *
                  </Label>
                  <Input
                    id="videoSolutionLink"
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    {...register("videoSolutionLink")}
                  />
                  {errors.videoSolutionLink && (
                    <p className="text-sm text-red-600">
                      {errors.videoSolutionLink.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Paste the YouTube video URL
                  </p>
                </div>
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
