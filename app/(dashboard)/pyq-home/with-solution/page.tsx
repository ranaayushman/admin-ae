// app/pyq-home/with-solution/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUploadWithPreview } from "@/components/ui/ImageUploadWithPreview";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Trash2, Pencil, FileText, ExternalLink, Loader2, ChevronDown } from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

type Category = "jee-main" | "jee-advanced" | "neet" | "wbjee";

interface CategoryState {
  papers: Paper[];
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  loading: boolean;
  loadingMore: boolean;
}

const CATEGORIES: Category[] = ["jee-main", "jee-advanced", "neet", "wbjee"];
const CATEGORY_LABELS: Record<Category, string> = {
  "jee-main": "JEE Main",
  "jee-advanced": "JEE Advanced",
  neet: "NEET",
  wbjee: "WBJEE",
};
const PAGE_SIZE = 10;

// ─── Component ─────────────────────────────────────────────────────────────────

export default function PyqWithSolutionPage() {
  const [bannerImage, setBannerImage] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPaper, setEditingPaper] = useState<Paper | null>(null);

  // Per-category pagination state
  const [categoryState, setCategoryState] = useState<Record<Category, CategoryState>>(
    () =>
      Object.fromEntries(
        CATEGORIES.map((cat) => [
          cat,
          { papers: [], page: 1, totalPages: 1, hasNextPage: false, loading: true, loadingMore: false },
        ])
      ) as unknown as Record<Category, CategoryState>
  );

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

  // ── Fetch first page for a given category ───────────────────────────────────
  const fetchCategoryFirstPage = useCallback(async (cat: Category) => {
    setCategoryState((prev) => ({
      ...prev,
      [cat]: { ...prev[cat], loading: true },
    }));
    try {
      const result = await papersService.getPapersPaginated({
        category: cat,
        type: "with-solution",
        page: 1,
        limit: PAGE_SIZE,
      });
      setCategoryState((prev) => ({
        ...prev,
        [cat]: {
          papers: result.data,
          page: 1,
          totalPages: result.totalPages,
          hasNextPage: result.hasNextPage,
          loading: false,
          loadingMore: false,
        },
      }));
    } catch {
      toast.error(`Failed to load ${CATEGORY_LABELS[cat]} papers`);
      setCategoryState((prev) => ({
        ...prev,
        [cat]: { ...prev[cat], loading: false },
      }));
    }
  }, []);

  // ── Load more ───────────────────────────────────────────────────────────────
  const loadMore = async (cat: Category) => {
    const state = categoryState[cat];
    if (!state.hasNextPage || state.loadingMore) return;
    const nextPage = state.page + 1;

    setCategoryState((prev) => ({
      ...prev,
      [cat]: { ...prev[cat], loadingMore: true },
    }));
    try {
      const result = await papersService.getPapersPaginated({
        category: cat,
        type: "with-solution",
        page: nextPage,
        limit: PAGE_SIZE,
      });
      setCategoryState((prev) => ({
        ...prev,
        [cat]: {
          papers: [...prev[cat].papers, ...result.data],
          page: nextPage,
          totalPages: result.totalPages,
          hasNextPage: result.hasNextPage,
          loading: false,
          loadingMore: false,
        },
      }));
    } catch {
      toast.error(`Failed to load more ${CATEGORY_LABELS[cat]} papers`);
      setCategoryState((prev) => ({
        ...prev,
        [cat]: { ...prev[cat], loadingMore: false },
      }));
    }
  };

  // Initial load
  useEffect(() => {
    CATEGORIES.forEach((cat) => fetchCategoryFirstPage(cat));
  }, [fetchCategoryFirstPage]);

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
        isActive: true,
      });
      setBannerImage(editingPaper.thumbnailUrl || "");
    }
  }, [editingPaper, reset]);

  // ── Submit / Edit / Delete ───────────────────────────────────────────────────

  const onSubmit = async (data: PyqWithSolutionFormValues) => {
    try {
      toast.info("Submitting...", { duration: 2000 });
      await papersService.createWithSolution({
        category: data.category,
        year: data.year,
        title: data.title,
        paperDriveLink: data.questionPaperLink,
        solutionDriveLink: data.solutionDriveLink,
        thumbnailBase64: bannerImage,
        videoSolutionLink: data.videoSolutionLink || undefined,
        displayOrder: data.displayOrder,
      });
      toast.success("PYQ added successfully!", {
        description: "The paper has been added to the database.",
      });
      reset({ title: "", category: "jee-main", year: new Date().getFullYear(), questionPaperLink: "", videoSolutionLink: "", solutionDriveLink: "", bannerImage: "", displayOrder: 1 });
      setBannerImage("");
      fetchCategoryFirstPage(data.category as Category);
    } catch (error: any) {
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
      await papersService.updatePaper(editingPaper._id, {
        category: data.category,
        year: data.year,
        title: data.title,
        paperDriveLink: data.questionPaperLink,
        solutionDriveLink: data.solutionDriveLink,
        thumbnailBase64: bannerImage !== editingPaper.thumbnailUrl ? bannerImage : undefined,
        videoSolutionLink: data.videoSolutionLink || undefined,
        displayOrder: data.displayOrder,
      });
      toast.success("PYQ updated successfully!");
      setEditDialogOpen(false);
      setEditingPaper(null);
      setBannerImage("");
      fetchCategoryFirstPage(editingPaper.category as Category);
    } catch (error: any) {
      toast.error(error?.message || "Failed to update paper");
    }
  };

  const handleDelete = async (paper: Paper) => {
    if (!confirm("Are you sure you want to delete this PYQ paper?")) return;
    try {
      await papersService.deletePaper(paper._id);
      toast.success("PYQ deleted successfully!");
      fetchCategoryFirstPage(paper.category as Category);
    } catch {
      toast.error("Failed to delete paper");
    }
  };

  const onError = (errors: any) => {
    toast.error("Form Validation Failed", { description: "Please check the highlighted fields." });
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">PYQ Home (With Solution)</h1>
          <p className="text-gray-500 mt-1">
            Manage previous year question papers with solutions for the home page
          </p>
        </div>

        {/* ── Per-category paper lists (Tabs) ── */}
        <Tabs defaultValue="jee-main" className="mb-6">
          <TabsList className="mb-4">
            {CATEGORIES.map((cat) => (
              <TabsTrigger key={cat} value={cat}>
                {CATEGORY_LABELS[cat]}
              </TabsTrigger>
            ))}
          </TabsList>

          {CATEGORIES.map((cat) => {
            const state = categoryState[cat];
            return (
              <TabsContent key={cat} value={cat}>
                <Card className="mb-4">
                  <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{CATEGORY_LABELS[cat]}</CardTitle>
                    <CardDescription>
                      {state.loading
                        ? "Loading…"
                        : `${state.papers.length} paper${state.papers.length !== 1 ? "s" : ""} loaded${
                            state.totalPages > 1
                              ? ` (page 1–${state.page} of ${state.totalPages})`
                              : ""
                          }`}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">{CATEGORY_LABELS[cat]}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {state.loading ? (
                  <div className="flex items-center justify-center py-6 text-muted-foreground gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading papers…
                  </div>
                ) : state.papers.length === 0 ? (
                  <div className="text-center py-6">
                    <FileText className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground text-sm">No papers found</p>
                  </div>
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Year</TableHead>
                          <TableHead>Links</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {state.papers.map((paper) => (
                          <TableRow key={paper._id}>
                            <TableCell className="font-medium max-w-[280px] truncate">
                              {paper.title}
                            </TableCell>
                            <TableCell>{paper.year}</TableCell>
                            <TableCell>
                              <div className="flex gap-2 flex-wrap">
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
                                  onClick={() => handleDelete(paper)}
                                >
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    {/* Load More */}
                    {state.hasNextPage && (
                      <div className="flex justify-center mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={state.loadingMore}
                          onClick={() => loadMore(cat)}
                          className="gap-2"
                        >
                          {state.loadingMore ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Loading more…
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4" />
                              Load More ({state.page}/{state.totalPages} pages loaded)
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          );
        })}
        </Tabs>

        {/* ── Create Form ── */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(onSubmit, onError)(e);
          }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Add New PYQ with Solution</CardTitle>
              <CardDescription>Enter the details and upload banner for the PYQ card</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input id="title" placeholder="JEE Main 2024 January Attempt - Shift 1" {...register("title")} />
                  {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
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
                  {errors.category && <p className="text-sm text-red-600">{errors.category.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Year *</Label>
                  <Input id="year" type="number" {...register("year", { valueAsNumber: true })} />
                  {errors.year && <p className="text-sm text-red-600">{errors.year.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="displayOrder">Display Order</Label>
                  <Input id="displayOrder" type="number" {...register("displayOrder", { valueAsNumber: true })} />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="questionPaperLink">Question Paper Link (Google Drive) *</Label>
                  <Input
                    id="questionPaperLink"
                    type="url"
                    placeholder="https://drive.google.com/file/d/..."
                    {...register("questionPaperLink")}
                  />
                  {errors.questionPaperLink && (
                    <p className="text-sm text-red-600">{errors.questionPaperLink.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="solutionDriveLink">Solution PDF Link (Google Drive) *</Label>
                  <Input
                    id="solutionDriveLink"
                    type="url"
                    placeholder="https://drive.google.com/file/d/..."
                    {...register("solutionDriveLink")}
                  />
                  {errors.solutionDriveLink && (
                    <p className="text-sm text-red-600">{errors.solutionDriveLink.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="videoSolutionLink">Video Solution Link (YouTube) - Optional</Label>
                  <Input
                    id="videoSolutionLink"
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    {...register("videoSolutionLink")}
                  />
                  {errors.videoSolutionLink && (
                    <p className="text-sm text-red-600">{errors.videoSolutionLink.message}</p>
                  )}
                </div>
              </div>

              <Separator />

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
                <p className="text-sm text-red-600">{errors.bannerImage.message}</p>
              )}

              <Separator />

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { reset(); setBannerImage(""); }}
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

        {/* ── Edit Dialog ── */}
        <Dialog
          open={editDialogOpen}
          onOpenChange={(open) => {
            setEditDialogOpen(open);
            if (!open) {
              setEditingPaper(null);
              reset();
              setBannerImage("");
            }
          }}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit PYQ Paper</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit(handleEditSubmit, onError)} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input placeholder="JEE Main 2024" {...register("title")} />
                  {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select value={categoryValue} onValueChange={(val: any) => setValue("category", val)}>
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
                  <Input type="number" {...register("year", { valueAsNumber: true })} />
                </div>

                <div className="space-y-2">
                  <Label>Display Order</Label>
                  <Input type="number" {...register("displayOrder", { valueAsNumber: true })} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Question Paper Link *</Label>
                <Input type="url" {...register("questionPaperLink")} />
              </div>

              <div className="space-y-2">
                <Label>Solution Link *</Label>
                <Input type="url" {...register("solutionDriveLink")} />
              </div>

              <div className="space-y-2">
                <Label>Video Solution Link</Label>
                <Input type="url" {...register("videoSolutionLink")} />
              </div>

              <ImageUploadWithPreview
                label="Banner Image"
                description="Upload new banner (optional)"
                onImageChange={(base64) => { setBannerImage(base64); setValue("bannerImage", base64); }}
                currentImage={bannerImage}
              />

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
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
