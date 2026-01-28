// app/settings/footer/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  footerLinkSchema,
  FooterLinkFormValues,
} from "@/lib/validations/footer-schema";
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
import { Edit, Trash2, GripVertical, Loader2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toast } from "sonner";
import {
  siteSettingsService,
  FooterLink,
} from "@/lib/services/site-settings";
import { useRouter } from "next/navigation";

const sections = ["COMPANY", "LEGAL", "RESOURCES", "SOCIAL"] as const;

// Helper to map API response to internal shape (if needed, but looks compatible mostly)
// We add an 'id' for local management if the API doesn't provide a unique stable ID for editing easily,
// but usually backend provides _id. The current service interface for FooterLink doesn't show _id,
// so we might need to rely on index or assume the backend provided list has IDs?
// The user prompt only showed "footerLinks": [...] without explicit IDs in the payload example.
// We will assume for now we might need to rely on the list index or if the backend returns objects with _id.
// For robust editing, having unique IDs is better.
// Update: frontend service has _id in SiteSettings but footerLinks array usually has simple objects.
// If the backend doesn't support partial updates by ID, we might need to send the whole list every time.
// The prompt says PATCH /site-settings/footer body: { "footerLinks": [...] }
// This implies we send the *entire* customized list.

// Update type definition to accommodate both API and Form fields temporarily for mapping
type FooterLinkWithId = FooterLink & { 
  id: string; 
  text?: string; 
  section?: string 
};

export default function FooterLinksPage() {
  const router = useRouter();
  const [links, setLinks] = useState<FooterLinkWithId[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    linkId: string | null;
  }>({ isOpen: false, linkId: null });

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FooterLinkFormValues>({
    resolver: zodResolver(footerLinkSchema),
    defaultValues: {
      section: "COMPANY",
      text: "",
      url: "",
      order: 0,
      isActive: true,
      openInNewTab: false,
    },
  });

  // Fetch initial settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await siteSettingsService.getAllSettings();
        if (settings && settings.footerLinks) {
          // Add temporary IDs for local state management if missing
          const mappedLinks = settings.footerLinks.map((link: any, index: number) => ({
            ...link,
            text: link.label, // Map label to text for form compatibility
            section: link.group, // Map group to section for form compatibility
            id: link._id || `temp-${index}-${Date.now()}`,
          }));
          setLinks(mappedLinks);
        }
      } catch (error) {
        console.error("Failed to fetch settings", error);
        toast.error("Failed to load footer links");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const saveFooterLinks = async (updatedLinks: FooterLinkWithId[]) => {
    setIsSaving(true);
    try {
      // Map back to API format used by service
      const payloadLinks = updatedLinks.map((link) => ({
        label: link.text || link.label,
        url: link.url,
        group: link.section || link.group,
        order: link.order,
        isActive: link.isActive,
        openInNewTab: link.openInNewTab,
      }));

      await siteSettingsService.updateFooterLinks({
        footerLinks: payloadLinks,
      });
      
      setLinks(updatedLinks);
      toast.success("Footer settings saved successfully");
      router.refresh();
    } catch (error) {
      console.error("Failed to save footer links", error);
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const onSubmit = async (data: FooterLinkFormValues) => {
    let updatedLinks = [...links];
    
    // Create new object satisfying FooterLinkWithId
    const newLinkPartial: FooterLinkWithId = {
      id: editingId || `new-${Date.now()}`,
      label: data.text,
      group: data.section,
      text: data.text,
      section: data.section,
      url: data.url,
      order: data.order,
      isActive: data.isActive,
      openInNewTab: data.openInNewTab,
    } as FooterLinkWithId;

    if (editingId) {
      updatedLinks = updatedLinks.map((link) =>
        link.id === editingId
          ? { ...link, ...newLinkPartial } 
          : link
      );
      setEditingId(null);
    } else {
      updatedLinks.push(newLinkPartial);
    }

    // Sort by order
    updatedLinks.sort((a, b) => a.order - b.order);

    await saveFooterLinks(updatedLinks);
    reset();
  };

  const handleEdit = (link: FooterLinkWithId) => {
    setEditingId(link.id);
    setValue("section", (link.section || link.group) as any);
    setValue("text", link.text || link.label);
    setValue("url", link.url);
    setValue("order", link.order);
    setValue("isActive", link.isActive);
    setValue("openInNewTab", !!link.openInNewTab);
  };

  const handleDelete = (id: string) => {
    setDeleteDialog({ isOpen: true, linkId: id });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.linkId) return;
    
    const updatedLinks = links.filter((link) => link.id !== deleteDialog.linkId);
    await saveFooterLinks(updatedLinks);
    
    setDeleteDialog({ isOpen: false, linkId: null });
  };

  const groupedLinks = sections.map((section) => ({
    section,
    links: links.filter((link) => (link.section || link.group) === section),
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Footer Links</h1>
          <p className="text-gray-500 mt-1">
            Manage footer links displayed on the website
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add/Edit Form */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>
                {editingId ? "Edit Link" : "Add New Link"}
              </CardTitle>
              <CardDescription>
                {editingId ? "Update footer link" : "Create a new footer link"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="section">Section *</Label>
                  <Select
                    onValueChange={(value) => setValue("section", value as any)}
                    defaultValue={editingId ? undefined : "COMPANY"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COMPANY">Company</SelectItem>
                      <SelectItem value="LEGAL">Legal</SelectItem>
                      <SelectItem value="RESOURCES">Resources</SelectItem>
                      <SelectItem value="SOCIAL">Social</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.section && (
                    <p className="text-sm text-red-600">
                      {errors.section.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="text">Link Text *</Label>
                  <Input
                    id="text"
                    placeholder="About Us"
                    {...register("text")}
                  />
                  {errors.text && (
                    <p className="text-sm text-red-600">{errors.text.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url">URL *</Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://example.com/about"
                    {...register("url")}
                  />
                  {errors.url && (
                    <p className="text-sm text-red-600">{errors.url.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="order">Display Order</Label>
                  <Input
                    id="order"
                    type="number"
                    {...register("order", { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-3">
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
                      Active
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="openInNewTab"
                      {...register("openInNewTab")}
                      onCheckedChange={(checked) =>
                        setValue("openInNewTab", checked as boolean)
                      }
                    />
                    <Label htmlFor="openInNewTab" className="cursor-pointer">
                      Open in new tab
                    </Label>
                  </div>
                </div>

                <div className="flex gap-2">
                  {editingId && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingId(null);
                        reset();
                      }}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button type="submit" className="flex-1" disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingId ? "Update" : "Add"} Link
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Footer Links List */}
          <div className="lg:col-span-2 space-y-6">
            {groupedLinks.map((group) => (
              <Card key={group.section}>
                <CardHeader>
                  <CardTitle className="text-lg">{group.section}</CardTitle>
                  <CardDescription>
                    {group.links.length} link{group.links.length !== 1 && "s"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {group.links.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No links in this section
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {group.links.map((link) => (
                        <div
                          key={link.id}
                          className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50"
                        >
                          <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium truncate">{link.text || link.label}</p>
                              {!link.isActive && (
                                <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                                  Inactive
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 truncate">
                              {link.url}
                            </p>
                          </div>

                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(link)}
                              disabled={isSaving}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(link.id)}
                              disabled={isSaving}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Footer Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Footer Preview</CardTitle>
            <CardDescription>How the footer will appear on the website</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-white p-8 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {groupedLinks.map((group) => (
                  <div key={group.section}>
                    <h3 className="font-semibold mb-4">{group.section}</h3>
                    <ul className="space-y-2">
                      {group.links
                        .filter((link) => link.isActive)
                        .map((link) => (
                          <li key={link.id}>
                            <a
                              href={link.url}
                              className="text-gray-300 hover:text-white text-sm"
                              target={link.openInNewTab ? "_blank" : undefined}
                              rel={link.openInNewTab ? "noopener noreferrer" : undefined}
                            >
                              {link.text || link.label}
                            </a>
                          </li>
                        ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, linkId: null })}
        onConfirm={confirmDelete}
        title="Delete Footer Link"
        description="Are you sure you want to delete this footer link?"
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
