// components/add-pyq/RichTextEditor.tsx
"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface RichTextEditorProps {
  label: string;
  description?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  id: string;
}

export function RichTextEditor({
  label,
  description,
  value,
  onChange,
  error,
  id,
}: RichTextEditorProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {description ? (
        <p className="text-xs text-muted-foreground">{description}</p>
      ) : null}
      <Textarea
        id={id}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="min-h-[140px] font-mono text-sm"
        placeholder="Use LaTeX-style math: E = mc^2, \frac{a}{b}, \ce{H2O} etc."
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
