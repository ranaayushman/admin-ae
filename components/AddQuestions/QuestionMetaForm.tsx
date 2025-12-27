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
      {/* Exam Category */}
      <div className="space-y-1.5">
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
              </SelectContent>
            </Select>
          )}
        />
        {errors.subject && (
          <p className="text-xs text-destructive">{errors.subject.message}</p>
        )}
      </div>

      {/* Chapter */}
      <div className="space-y-1.5">
        <Label htmlFor="chapter">Chapter</Label>
        <Input
          id="chapter"
          placeholder="e.g. Electrostatics"
          {...register("chapter")}
        />
        {errors.chapter && (
          <p className="text-xs text-destructive">{errors.chapter.message}</p>
        )}
      </div>

      {/* Difficulty */}
      <div className="space-y-1.5">
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
