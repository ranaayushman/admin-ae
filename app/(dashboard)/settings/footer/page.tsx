// app/settings/footer/page.tsx
"use client";

import React, { useState } from "react";
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
import { Plus, Edit, Trash2, GripVertical } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toast } from "sonner";

// Mock footer links
const mockFooterLinks = [
  {
    id: "link_001",
    section: "COMPANY",
    text: "About Us",
    url: "https://example.com/about",
    order: 1,
    isActive: true,
    openInNewTab: false,
  },
  {
    id: "link_002",
    section: "COMPANY",
    text: "Contact",
    url: "https://example.com/contact",
    order: 2,
    isActive: true,
    openInNewTab: false,
  },
  {
    id: "link_003",
    section: "LEGAL",
    text: "Privacy Policy",
    url: "https://example.com/privacy",
    order: 1,
    isActive: true,
    openInNewTab: false,
  },
  {
    id: "link_004",
    section: "LEGAL",
    text: "Terms of Service",
    url: "https://example.com/terms",
    order: 2,
    isActive: true,
    openInNewTab: false,
  },
];

const sections = ["COMPANY", "LEGAL", "RESOURCES", "SOCIAL"] as const;

export default function FooterLinksPage() {
  const [links, setLinks] = useState(mockFooterLinks);
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

  const onSubmit = (data: FooterLinkFormValues) => {
    if (editingId) {
      console.log("Updating footer link:", editingId, data);
      toast.success("Footer link updated successfully");
      setEditingId(null);
    } else {
      console.log("Creating footer link:", data);
      toast.success("Footer link created successfully");
    }
    reset();
  };

  const handleEdit = (link: (typeof mockFooterLinks)[0]) => {
    setEditingId(link.id);
    setValue("section", link.section as any);
    setValue("text", link.text);
    setValue("url", link.url);
    setValue("order", link.order);
    setValue("isActive", link.isActive);
    setValue("openInNewTab", link.openInNewTab);
  };

  const handleDelete = (id: string) => {
    setDeleteDialog({ isOpen: true, linkId: id });
  };

  const confirmDelete = () => {
    console.log("Deleting link:", deleteDialog.linkId);
    toast.success("Footer link deleted successfully");
    setDeleteDialog({ isOpen: false, linkId: null });
  };

  const groupedLinks = sections.map((section) => ({
    section,
    links: links.filter((link) => link.section === section),
  }));

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
                    >
                      Cancel
                    </Button>
                  )}
                  <Button type="submit" className="flex-1">
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
                              <p className="font-medium truncate">{link.text}</p>
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
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(link.id)}
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
                              {link.text}
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
