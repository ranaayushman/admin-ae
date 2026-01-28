"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { toast } from "sonner";
import { Loader2, Save, ExternalLink } from "lucide-react";
import {
  siteSettingsService,
  SocialLinks,
} from "@/lib/services/site-settings";
import { useRouter } from "next/navigation";

const socialLinksSchema = z.object({
  facebook: z.string().url().optional().or(z.literal("")),
  twitter: z.string().url().optional().or(z.literal("")),
  instagram: z.string().url().optional().or(z.literal("")),
  linkedin: z.string().url().optional().or(z.literal("")),
  youtube: z.string().url().optional().or(z.literal("")),
});

type SocialLinksFormValues = z.infer<typeof socialLinksSchema>;

export default function SocialSettingsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SocialLinksFormValues>({
    resolver: zodResolver(socialLinksSchema),
    defaultValues: {
      facebook: "",
      twitter: "",
      instagram: "",
      linkedin: "",
      youtube: "",
    },
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await siteSettingsService.getAllSettings();
        if (settings && settings.socialLinks) {
          reset(settings.socialLinks);
        }
      } catch (error) {
        console.error("Failed to load settings", error);
        toast.error("Failed to load social links");
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, [reset]);

  const onSubmit = async (data: SocialLinksFormValues) => {
    setIsSaving(true);
    try {
      await siteSettingsService.updateSocialLinks({
        socialLinks: data,
      });
      toast.success("Social links updated successfully");
      router.refresh();
    } catch (error) {
      console.error("Failed to update social links", error);
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
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
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Social Links</h1>
          <p className="text-gray-500 mt-1">
            Manage social media profiles linked in the footer
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Social Media Profiles</CardTitle>
            <CardDescription>
              Enter the full URL for each social media profile. Leave empty to hide.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6">
                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    placeholder="https://facebook.com/your-page"
                    {...register("facebook")}
                  />
                  {errors.facebook && (
                    <p className="text-sm text-red-500">{errors.facebook.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter / X</Label>
                  <Input
                    id="twitter"
                    placeholder="https://twitter.com/your-handle"
                    {...register("twitter")}
                  />
                  {errors.twitter && (
                    <p className="text-sm text-red-500">{errors.twitter.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    placeholder="https://instagram.com/your-handle"
                    {...register("instagram")}
                  />
                  {errors.instagram && (
                    <p className="text-sm text-red-500">{errors.instagram.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    placeholder="https://linkedin.com/company/your-company"
                    {...register("linkedin")}
                  />
                  {errors.linkedin && (
                    <p className="text-sm text-red-500">{errors.linkedin.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="youtube">YouTube</Label>
                  <Input
                    id="youtube"
                    placeholder="https://youtube.com/@your-channel"
                    {...register("youtube")}
                  />
                  {errors.youtube && (
                    <p className="text-sm text-red-500">{errors.youtube.message}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
