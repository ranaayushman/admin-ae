// components/add-pyq/QuestionTypeSection.tsx
"use client";

import { useFieldArray, Control, UseFormRegister } from "react-hook-form";
import {
  AddPyqFormValues,
  QuestionType,
  roundingModes,
} from "@/lib/validations/add-pyq-schema";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { OptionEditor } from "./OptionEditor";

interface QuestionTypeSectionProps {
  control: Control<AddPyqFormValues>;
  register: UseFormRegister<AddPyqFormValues>;
  questionType: QuestionType;
  setQuestionType: (type: QuestionType) => void;
  errors: any;
}

export function QuestionTypeSection({
  control,
  register,
  questionType,
  setQuestionType,
  errors,
}: QuestionTypeSectionProps) {
  const { fields, append, update } = useFieldArray({
    control,
    name: "options",
  });

  const handleAddOption = () => {
    append({
      id: crypto.randomUUID(),
      text: "",
      isCorrect: false,
    });
  };

  return (
    <div className="space-y-4">
      {/* Question Type Selector */}
      <div className="space-y-2">
        <Label>Question Type</Label>
        <RadioGroup
          value={questionType}
          onValueChange={(v) => setQuestionType(v as QuestionType)}
          className="grid gap-2 md:grid-cols-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="SINGLE_CORRECT" id="qt-single" />
            <Label htmlFor="qt-single">Single Correct</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="MULTI_CORRECT" id="qt-multi" />
            <Label htmlFor="qt-multi">Multiple Correct (MCQ)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="INTEGER" id="qt-int" />
            <Label htmlFor="qt-int">Integer Type</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="NUMERICAL" id="qt-num" />
            <Label htmlFor="qt-num">Numerical (with tolerance)</Label>
          </div>
        </RadioGroup>
        <input type="hidden" {...register("questionType")} />
        {errors.questionType && (
          <p className="text-xs text-destructive">
            {errors.questionType.message}
          </p>
        )}
      </div>

      {/* Options / answers based on type */}
      {(questionType === "SINGLE_CORRECT" ||
        questionType === "MULTI_CORRECT") && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Options</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddOption}
            >
              Add Option
            </Button>
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-gray-600">
                    Option {String.fromCharCode(65 + index)}
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={field.isCorrect}
                      onCheckedChange={(checked) =>
                        update(index, {
                          ...field,
                          isCorrect: Boolean(checked),
                        })
                      }
                    />
                    <span className="text-xs text-muted-foreground">
                      Correct Answer
                    </span>
                  </div>
                </div>
                <OptionEditor
                  value={field.text}
                  onChange={(value) => update(index, { ...field, text: value })}
                  placeholder={`Enter option ${String.fromCharCode(
                    65 + index
                  )} text (supports math formulas)`}
                  error={errors.options?.[index]?.text?.message}
                />
              </div>
            ))}
          </div>

          {errors.options && (
            <p className="text-xs text-destructive">{errors.options.message}</p>
          )}
        </div>
      )}

      {questionType === "INTEGER" && (
        <div className="space-y-2">
          <Label htmlFor="integerAnswer">Integer Answer</Label>
          <Input
            id="integerAnswer"
            placeholder="e.g. 5"
            {...register("integerAnswer")}
          />
          {errors.integerAnswer && (
            <p className="text-xs text-destructive">
              {errors.integerAnswer.message}
            </p>
          )}
        </div>
      )}

      {questionType === "NUMERICAL" && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="numericalAnswer">Numerical Answer</Label>
            <Input
              id="numericalAnswer"
              placeholder="e.g. 3.142"
              {...register("numericalAnswer")}
            />
            {errors.numericalAnswer && (
              <p className="text-xs text-destructive">
                {errors.numericalAnswer.message}
              </p>
            )}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="tolerance">Tolerance (±)</Label>
              <Input
                id="tolerance"
                placeholder="e.g. 0.01"
                {...register("tolerance")}
              />
              {errors.tolerance && (
                <p className="text-xs text-destructive">
                  {errors.tolerance.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Rounding Mode</Label>
              <Select
                onValueChange={(v) => (control._formValues.roundingMode = v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select rounding mode" />
                </SelectTrigger>
                <SelectContent>
                  {roundingModes.map((mode) => (
                    <SelectItem key={mode} value={mode}>
                      {mode.replace("_", " ").toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" {...register("roundingMode")} />
              {errors.roundingMode && (
                <p className="text-xs text-destructive">
                  {errors.roundingMode.message}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
