// components/add-pyq/QuestionMetaForm.tsx
"use client";

import { Control, FieldErrors, UseFormRegister } from "react-hook-form";
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
  control, // eslint-disable-line @typescript-eslint/no-unused-vars
  errors,
}: QuestionMetaFormProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Subject */}
      <div className="space-y-1.5">
        <Label>Subject</Label>
        <Select
          onValueChange={(v) =>
            control._formValues && (control._formValues.subject = v)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PHYSICS">Physics</SelectItem>
            <SelectItem value="CHEMISTRY">Chemistry</SelectItem>
            <SelectItem value="MATHEMATICS">Mathematics</SelectItem>
            <SelectItem value="BIOLOGY">Biology</SelectItem>
          </SelectContent>
        </Select>
        <input type="hidden" {...register("subject")} />
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
        <Select
          onValueChange={(v) =>
            control._formValues && (control._formValues.difficulty = v)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EASY">Easy</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="HARD">Hard</SelectItem>
          </SelectContent>
        </Select>
        <input type="hidden" {...register("difficulty")} />
        {errors.difficulty && (
          <p className="text-xs text-destructive">
            {errors.difficulty.message}
          </p>
        )}
      </div>
    </div>
  );
}
