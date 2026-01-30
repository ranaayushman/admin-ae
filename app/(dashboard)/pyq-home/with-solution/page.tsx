// app/pyq-home/with-solution/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  pyqWithSolutionSchema,
  PyqWithSolutionFormValues,
} from "@/lib/validations/pyq-home-schema";
import { papersService, Paper } from "@/lib/services/papers";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUploadWithPreview } from "@/components/ui/ImageUploadWithPreview";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Trash2, Pencil, FileText, ExternalLink } from "lucide-react";

export default function PyqWithSolutionPage() {
  const [bannerImage, setBannerImage] = useState("");
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPaper, setEditingPaper] = useState<Paper | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<PyqWithSolutionFormValues>({
    resolver: zodResolver(pyqWithSolutionSchema),
    defaultValues: {
      title: "",
      category: "jee-main",
      year: new Date().getFullYear(),
      questionPaperLink: "",
      videoSolutionLink: "",
      solutionDriveLink: "",
      bannerImage: "",
      displayOrder: 1,
      isActive: true,
    },
  });

  const categoryValue = watch("category");

  useEffect(() => {
    fetchPapers();
  }, []);

  // Populate form when editing
  useEffect(() => {
    if (editingPaper) {
      reset({
        title: editingPaper.title,
        category: editingPaper.category as any,
        year: editingPaper.year,
        questionPaperLink: editingPaper.paperDriveLink,
        solutionDriveLink: editingPaper.solutionDriveLink || "",
        videoSolutionLink: editingPaper.videoSolutionLink || "",
        bannerImage: editingPaper.thumbnailUrl || "",
        displayOrder: editingPaper.displayOrder,
        isActive: true, // Default to true
      });
      setBannerImage(editingPaper.thumbnailUrl || "");
    }
  }, [editingPaper, reset]);

  const fetchPapers = async () => {
    setLoading(true);
    try {
      // Fetch all competitive exam PYQs (JEE Main, Advanced, NEET, WBJEE)
      const [jeeMain, jeeAdvanced, neet, wbjee] = await Promise.all([
        papersService.getPapers({ category: "jee-main" }),
        papersService.getPapers({ category: "jee-advanced" }),
        papersService.getPapers({ category: "neet" }),
        papersService.getPapers({ category: "wbjee" }),
      ]);

      // Combine all papers
      const allPyqPapers = [...jeeMain, ...jeeAdvanced, ...neet, ...wbjee];

      // Filter for papers WITH solutions
      const withSolutions = allPyqPapers.filter(
        (p: Paper) => p.solutionDriveLink || p.videoSolutionLink
      );

      setPapers(withSolutions);
    } catch (error) {
      console.error("Failed to fetch papers:", error);
      toast.error("Failed to load papers");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: PyqWithSolutionFormValues) => {
    try {
      toast.info("Submitting...", { duration: 2000 });

      const payload = {
        category: data.category,
        year: data.year,
        title: data.title,
        paperDriveLink: data.questionPaperLink,
        solutionDriveLink: data.solutionDriveLink,
        thumbnailBase64: bannerImage,
        videoSolutionLink: data.videoSolutionLink || undefined,
        displayOrder: data.displayOrder,
      };

      await papersService.createWithSolution(payload);

      toast.success("PYQ added successfully!", {
        description: "The paper has been added to the database.",
      });

      // Reset form
      reset({
        title: "",
        category: "jee-main",
        year: new Date().getFullYear(),
        questionPaperLink: "",
        videoSolutionLink: "",
        solutionDriveLink: "",
        bannerImage: "",
        displayOrder: 1,
      });
      setBannerImage("");
      fetchPapers();
    } catch (error: any) {
      console.error("❌ [onSubmit] Error caught:", error);
      toast.error("Failed to create paper", {
        description: error.response?.data?.message || error.message || "Unknown error",
        duration: Infinity,
      });
    }
  };

  const handleEdit = (paper: Paper) => {
    setEditingPaper(paper);
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async (data: PyqWithSolutionFormValues) => {
    if (!editingPaper) return;

    try {
      const payload = {
        category: data.category,
        year: data.year,
        title: data.title,
        paperDriveLink: data.questionPaperLink,
        solutionDriveLink: data.solutionDriveLink,
        thumbnailBase64: bannerImage !== editingPaper.thumbnailUrl ? bannerImage : undefined,
        videoSolutionLink: data.videoSolutionLink || undefined,
        displayOrder: data.displayOrder,
      };

      await papersService.updatePaper(editingPaper._id, payload);
      toast.success("PYQ updated successfully!");
      
      // Fetch updated data first, then close dialog
      await fetchPapers();
      setEditDialogOpen(false);
      setEditingPaper(null);
      setBannerImage("");
    } catch (error: any) {
      console.error("Failed to update paper:", error);
      toast.error(error?.message || "Failed to update paper");
    }
  };

  const handleDelete = async (paperId: string) => {
    if (!confirm("Are you sure you want to delete this PYQ paper?")) return;

    try {
      await papersService.deletePaper(paperId);
      toast.success("PYQ deleted successfully!");
      fetchPapers();
    } catch (error) {
      toast.error("Failed to delete paper");
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
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            PYQ Home (With Solution)
          </h1>
          <p className="text-gray-500 mt-1">
            Manage previous year question papers with solutions for the home page
          </p>
        </div>

        {/* Papers List */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Existing PYQ Papers with Solutions</CardTitle>
            <CardDescription>
              View, edit, and delete existing papers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading papers...
              </div>
            ) : papers.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No papers found</p>
                <p className="text-sm text-muted-foreground">
                  Add your first paper using the form below
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Exam Type</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Links</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {papers.map((paper) => (
                    <TableRow key={paper._id}>
                      <TableCell className="font-medium max-w-[300px] truncate">
                        {paper.title}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{paper.category}</Badge>
                      </TableCell>
                      <TableCell>{paper.year}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <a
                            href={paper.paperDriveLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1 text-sm"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Paper
                          </a>
                          {paper.solutionDriveLink && (
                            <a
                              href={paper.solutionDriveLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:underline flex items-center gap-1 text-sm"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Solution
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(paper)}
                          >
                            <Pencil className="w-4 h-4 text-primary" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(paper._id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Create Form */}
        <form onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(onSubmit, onError)(e);
        }}>
          <Card>
            <CardHeader>
              <CardTitle>Add New PYQ with Solution</CardTitle>
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="solutionDriveLink">
                    Solution PDF Link (Google Drive) *
                  </Label>
                  <Input
                    id="solutionDriveLink"
                    type="url"
                    placeholder="https://drive.google.com/file/d/..."
                    {...register("solutionDriveLink")}
                  />
                  {errors.solutionDriveLink && (
                    <p className="text-sm text-red-600">
                      {errors.solutionDriveLink.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="videoSolutionLink">
                    Video Solution Link (YouTube) - Optional
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

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) {
            setEditingPaper(null);
            reset();
            setBannerImage("");
          }
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit PYQ Paper</DialogTitle>
            </DialogHeader>

            <form
              onSubmit={handleSubmit(handleEditSubmit, onError)}
              className="space-y-4 mt-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    placeholder="JEE Main 2024"
                    {...register("title")}
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select
                    value={categoryValue}
                    onValueChange={(val: any) => setValue("category", val)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jee-main">JEE Main</SelectItem>
                      <SelectItem value="jee-advanced">JEE Advanced</SelectItem>
                      <SelectItem value="neet">NEET</SelectItem>
                      <SelectItem value="wbjee">WBJEE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Year *</Label>
                  <Input
                    type="number"
                    {...register("year", { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Display Order</Label>
                  <Input
                    type="number"
                    {...register("displayOrder", { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Question Paper Link *</Label>
                <Input
                  type="url"
                  {...register("questionPaperLink")}
                />
              </div>

              <div className="space-y-2">
                <Label>Solution Link *</Label>
                <Input
                  type="url"
                  {...register("solutionDriveLink")}
                />
              </div>

              <div className="space-y-2">
                <Label>Video Solution Link</Label>
                <Input
                  type="url"
                  {...register("videoSolutionLink")}
                />
              </div>

              <ImageUploadWithPreview
                label="Banner Image"
                description="Upload new banner (optional)"
                onImageChange={(base64) => {
                  setBannerImage(base64);
                  setValue("bannerImage", base64);
                }}
                currentImage={bannerImage}
              />

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update PYQ"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
