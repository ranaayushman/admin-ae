"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  ExternalLink,
  FileText,
  GraduationCap,
  BookOpen,
  Sparkles,
} from "lucide-react";
import {
  papersService,
  Paper,
  PaperCategory,
  BoardName,
} from "@/lib/services/papers";

const BOARDS: BoardName[] = ["CBSE", "ICSE", "ISC", "WBCHSE", "State"];

const SUBJECTS_10 = [
  "Mathematics",
  "Science",
  "English",
  "Social Science",
  "Hindi",
  "Computer Applications",
];

const SUBJECTS_12 = [
  "Physics",
  "Chemistry",
  "Mathematics",
  "Biology",
  "English",
  "Computer Science",
  "Accountancy",
  "Business Studies",
  "Economics",
];

const formSchema = z.object({
  category: z.enum(["sample-10", "sample-12"]),
  board: z.string().min(1, "Board is required"),
  subject: z.string().min(1, "Subject is required"),
  year: z.number().min(2000).max(2030),
  title: z.string().min(5, "Title must be at least 5 characters"),
  paperDriveLink: z.string().url("Must be a valid URL"),
  solutionDriveLink: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  videoSolutionLink: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  displayOrder: z.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function SamplePapersPage() {
  const [papers10, setPapers10] = useState<Paper[]>([]);
  const [papers12, setPapers12] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<"10" | "12">("10");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: "sample-10",
      year: new Date().getFullYear(),
      displayOrder: 1,
    },
  });

  const watchCategory = watch("category");
  const subjects = watchCategory === "sample-10" ? SUBJECTS_10 : SUBJECTS_12;

  useEffect(() => {
    fetchPapers();
  }, []);

  const fetchPapers = async () => {
    setLoading(true);
    try {
      const [class10, class12] = await Promise.all([
        papersService.getPapers({ category: "sample-10" }),
        papersService.getPapers({ category: "sample-12" }),
      ]);
      setPapers10(class10);
      setPapers12(class12);
    } catch (error) {
      console.error("Failed to fetch papers:", error);
      toast.error("Failed to load papers");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      const payload = {
        category: data.category as PaperCategory,
        year: data.year,
        title: data.title,
        paperDriveLink: data.paperDriveLink,
        solutionDriveLink: data.solutionDriveLink || undefined,
        subject: data.subject,
        board: data.board as BoardName,
        displayOrder: data.displayOrder,
      };

      if (data.solutionDriveLink) {
        await papersService.createWithSolution({
          ...payload,
          solutionDriveLink: data.solutionDriveLink,
          videoSolutionLink: data.videoSolutionLink || undefined,
        });
      } else {
        await papersService.createNoSolution(payload);
      }

      toast.success("Sample paper added successfully!");
      setDialogOpen(false);
      reset();
      fetchPapers();
    } catch (error: any) {
      console.error("Failed to add paper:", error);
      toast.error(error?.message || "Failed to add paper");
    }
  };

  const handleDelete = async (paperId: string) => {
    if (!confirm("Are you sure you want to delete this sample paper?")) return;

    try {
      await papersService.deletePaper(paperId);
      toast.success("Sample paper deleted successfully!");
      fetchPapers();
    } catch (error) {
      toast.error("Failed to delete paper");
    }
  };

  const papers = selectedClass === "10" ? papers10 : papers12;

  return (
    <main className="flex-1 py-8 px-4 md:px-8">
      <Card className="max-w-6xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Sparkles className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <CardTitle>Sample Papers Management</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage official and practice sample papers for board exams
              </p>
            </div>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Sample Paper
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Sample Paper</DialogTitle>
              </DialogHeader>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4 mt-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  {/* Class/Category */}
                  <div className="space-y-2">
                    <Label>Class *</Label>
                    <Select
                      value={watchCategory}
                      onValueChange={(val) =>
                        setValue("category", val as "sample-10" | "sample-12")
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sample-10">Class 10</SelectItem>
                        <SelectItem value="sample-12">Class 12</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className="text-sm text-destructive">
                        {errors.category.message}
                      </p>
                    )}
                  </div>

                  {/* Board */}
                  <div className="space-y-2">
                    <Label>Board *</Label>
                    <Select onValueChange={(val) => setValue("board", val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select board" />
                      </SelectTrigger>
                      <SelectContent>
                        {BOARDS.map((board) => (
                          <SelectItem key={board} value={board}>
                            {board}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.board && (
                      <p className="text-sm text-destructive">
                        {errors.board.message}
                      </p>
                    )}
                  </div>

                  {/* Subject */}
                  <div className="space-y-2">
                    <Label>Subject *</Label>
                    <Select onValueChange={(val) => setValue("subject", val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject} value={subject}>
                            {subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.subject && (
                      <p className="text-sm text-destructive">
                        {errors.subject.message}
                      </p>
                    )}
                  </div>

                  {/* Year */}
                  <div className="space-y-2">
                    <Label>Year *</Label>
                    <Input
                      type="number"
                      placeholder="2026"
                      {...register("year")}
                    />
                    {errors.year && (
                      <p className="text-sm text-destructive">
                        {errors.year.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    placeholder="CBSE Class 10 Mathematics Sample Paper 2026"
                    {...register("title")}
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                {/* Paper Drive Link */}
                <div className="space-y-2">
                  <Label>Paper Google Drive Link *</Label>
                  <Input
                    placeholder="https://drive.google.com/file/d/..."
                    {...register("paperDriveLink")}
                  />
                  {errors.paperDriveLink && (
                    <p className="text-sm text-destructive">
                      {errors.paperDriveLink.message}
                    </p>
                  )}
                </div>

                {/* Solution Drive Link */}
                <div className="space-y-2">
                  <Label>Solution/Marking Scheme Link (optional)</Label>
                  <Input
                    placeholder="https://drive.google.com/file/d/..."
                    {...register("solutionDriveLink")}
                  />
                  {errors.solutionDriveLink && (
                    <p className="text-sm text-destructive">
                      {errors.solutionDriveLink.message}
                    </p>
                  )}
                </div>

                {/* Video Solution Link */}
                <div className="space-y-2">
                  <Label>Video Solution Link (optional)</Label>
                  <Input
                    placeholder="https://youtube.com/watch?v=..."
                    {...register("videoSolutionLink")}
                  />
                  {errors.videoSolutionLink && (
                    <p className="text-sm text-destructive">
                      {errors.videoSolutionLink.message}
                    </p>
                  )}
                </div>

                {/* Display Order */}
                <div className="space-y-2">
                  <Label>Display Order</Label>
                  <Input
                    type="number"
                    placeholder="1"
                    {...register("displayOrder")}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Adding..." : "Add Sample Paper"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent>
          <Tabs
            value={selectedClass}
            onValueChange={(v: string) => setSelectedClass(v as "10" | "12")}
          >
            <TabsList className="mb-4">
              <TabsTrigger value="10" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Class 10 ({papers10.length})
              </TabsTrigger>
              <TabsTrigger value="12" className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Class 12 ({papers12.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={selectedClass}>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading sample papers...
                </div>
              ) : papers.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    No sample papers found
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Click "Add Sample Paper" to add your first paper
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Board</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Links</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {papers.map((paper) => (
                      <TableRow key={paper._id}>
                        <TableCell className="font-medium max-w-[250px] truncate">
                          {paper.title}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{paper.board}</Badge>
                        </TableCell>
                        <TableCell>{paper.subject}</TableCell>
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(paper._id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  );
}
