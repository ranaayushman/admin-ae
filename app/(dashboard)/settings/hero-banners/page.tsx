"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  Trash2,
  ArrowLeft,
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";
import {
  siteSettingsService,
  HeroBanner,
  CreateHeroBannerPayload,
} from "@/lib/services/site-settings";

// Utility to convert file to base64
const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

interface BannerFormData {
  title: string;
  description: string;
  ctaText: string;
  ctaUrl: string;
  isActive: boolean;
}

export default function HeroBannersPage() {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>("");
  
  const { register, handleSubmit, reset, watch, setValue } = useForm<BannerFormData>({
    defaultValues: {
      title: "",
      description: "",
      ctaText: "",
      ctaUrl: "",
      isActive: true,
    },
  });

  // Load existing banners
  const loadBanners = async () => {
    try {
      const data = await siteSettingsService.getHeroBanners();
      setBanners(data);
    } catch (error) {
      console.error("Failed to load banners", error);
      toast.error("Failed to load banners");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await convertToBase64(file);
        setSelectedImage(base64);
      } catch (err) {
        console.error("Image upload failed", err);
        toast.error("Failed to process image");
      }
    }
  };

  // Create new banner
  const onSubmit = async (data: BannerFormData) => {
    if (!selectedImage) {
      toast.error("Please select an image");
      return;
    }

    setIsCreating(true);
    try {
      const payload: CreateHeroBannerPayload = {
        title: data.title,
        description: data.description,
        imageBase64: selectedImage,
        ctaUrl: data.ctaUrl,
        ctaText: data.ctaText,
        isActive: data.isActive,
      };

      await siteSettingsService.createHeroBanner(payload);
      toast.success("Banner created successfully!");
      
      // Reset form
      reset();
      setSelectedImage("");
      
      // Reload banners
      loadBanners();
    } catch (error) {
      console.error("Failed to create banner", error);
      toast.error("Failed to create banner");
    } finally {
      setIsCreating(false);
    }
  };

  // Delete banner
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;

    try {
      await siteSettingsService.deleteHeroBanner(id);
      toast.success("Banner deleted successfully");
      loadBanners();
    } catch (error) {
      console.error("Failed to delete banner", error);
      toast.error("Failed to delete banner");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/settings">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hero Banners</h1>
            <p className="text-gray-500 mt-1">Manage homepage hero banners</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create New Banner Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create New Banner
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Image Upload */}
                <div className="space-y-2">
                  <Label>Banner Image *</Label>
                  <div className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center gap-2 min-h-[200px] relative bg-gray-50">
                    {selectedImage ? (
                      <div className="relative w-full h-full min-h-[200px]">
                        <img
                          src={selectedImage}
                          alt="Preview"
                          className="absolute inset-0 w-full h-full object-cover rounded-md"
                        />
                      </div>
                    ) : (
                      <div className="text-center text-gray-400">
                        <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                        <span className="text-sm">Click to upload image</span>
                      </div>
                    )}
                    <Input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleImageUpload}
                    />
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    {...register("title", { required: true })}
                    placeholder="Summer Sale - 50% Off!"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    {...register("description")}
                    placeholder="Limited time offer"
                    rows={2}
                  />
                </div>

                {/* CTA Text & URL */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>CTA Text</Label>
                    <Input {...register("ctaText")} placeholder="Shop Now" />
                  </div>
                  <div className="space-y-2">
                    <Label>CTA URL</Label>
                    <Input {...register("ctaUrl")} placeholder="/courses" />
                  </div>
                </div>

                {/* Active Status */}
                <div className="flex items-center justify-between">
                  <Label>Active</Label>
                  <Switch
                    checked={watch("isActive")}
                    onCheckedChange={(checked) => setValue("isActive", checked)}
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isCreating}
                >
                  {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Create Banner
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Existing Banners List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Existing Banners ({banners.length})</h2>
            
            {banners.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  No banners yet. Create your first banner!
                </CardContent>
              </Card>
            ) : (
              banners.map((banner) => (
                <Card key={banner._id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Banner Image */}
                      <div className="w-32 h-20 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                        <img
                          src={banner.imageUrl}
                          alt={banner.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Banner Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">
                          {banner.title}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">
                          {banner.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>CTA: {banner.ctaText || "None"}</span>
                          <span className={banner.isActive ? "text-green-600" : "text-red-600"}>
                            {banner.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>

                      {/* Delete Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(banner._id!)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
