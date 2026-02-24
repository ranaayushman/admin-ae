// components/add-pyq/QuestionMetaForm.tsx
"use client";

import { Control, Controller, FieldErrors, UseFormRegister } from "react-hook-form";
import { AddPyqFormValues } from "@/lib/validations/add-pyq-schema";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle } from "lucide-react";

interface QuestionMetaFormProps {
  register: UseFormRegister<AddPyqFormValues>;
  control: Control<AddPyqFormValues>;
  errors: FieldErrors<AddPyqFormValues>;
}

export function QuestionMetaForm({
  register,
  control,
  errors,
}: QuestionMetaFormProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Warning Alert */}
      <div className="col-span-full mb-2 flex items-start gap-3 rounded-md border border-yellow-500/20 bg-yellow-500/10 p-3 text-yellow-600 dark:text-yellow-500">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="text-sm">
          <p className="font-semibold">Important: Exact Names Required</p>
          <p>Please ensure you fill in the <strong>Chapter</strong> and <strong>Topic</strong> names correctly exactly as they appear in the curriculum. Proper matching ensures topics are correctly linked and filterable.</p>
        </div>
      </div>

      {/* Exam Category */}
      <div className="space-y-1.5 md:col-span-1">
        <Label>Exam Category</Label>
        <Controller
          name="subject"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="neet">NEET</SelectItem>
                <SelectItem value="jee-main">JEE Main</SelectItem>
                <SelectItem value="jee-advanced">JEE Advanced</SelectItem>
                <SelectItem value="boards">Boards</SelectItem>
                <SelectItem value="wbjee">WBJEE</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.subject && (
          <p className="text-xs text-destructive">{errors.subject.message}</p>
        )}
      </div>

      {/* Chapter */}
      <div className="space-y-1.5 md:col-span-1">
        <Label htmlFor="chapter">Chapter</Label>
        <Input
          id="chapter"
          placeholder="e.g. Laws of Motion"
          {...register("chapter")}
        />
        {errors.chapter && (
          <p className="text-xs text-destructive">{errors.chapter.message}</p>
        )}
      </div>

      {/* Topic */}
      <div className="space-y-1.5 md:col-span-1">
        <Label htmlFor="topic">Topic</Label>
        <Input
          id="topic"
          placeholder="e.g. Forces on Inclined Plane"
          {...register("topic")}
        />
        {errors.topic && (
          <p className="text-xs text-destructive">{errors.topic.message}</p>
        )}
      </div>

      {/* Difficulty */}
      <div className="space-y-1.5 md:col-span-1">
        <Label>Difficulty</Label>
        <Controller
          name="difficulty"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.difficulty && (
          <p className="text-xs text-destructive">
            {errors.difficulty.message}
          </p>
        )}
      </div>
    </div>
  );
}
