// components/editor/TiptapEditor.tsx
"use client";

import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";

import { MathBlock } from "./MathBlock";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TiptapEditorProps {
  id: string;
  label: string;
  description?: string;
  value?: string; // stringified JSON from TipTap
  onChange?: (value: string) => void;
  error?: string;
}

export const TiptapEditor: React.FC<TiptapEditorProps> = ({
  id,
  label,
  description,
  value,
  onChange,
  error,
}) => {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Link.configure({
        openOnClick: true,
      }),
      Image,
      Placeholder.configure({
        placeholder: "Type your content here…",
      }),
      MathBlock,
    ],
    content: value ? safeParseJSON(value) : undefined,
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      onChange?.(JSON.stringify(json));
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[140px] px-3 py-2",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (!value) return;
    const parsed = safeParseJSON(value);
    if (parsed) {
      editor.commands.setContent(parsed);
    }
  }, [value, editor]);

  const insertMathBlock = () => {
    if (!editor) return;
    const latex = window.prompt(
      "Enter LaTeX for the formula",
      "\\int_0^1 x^2 \\, dx"
    );
    if (!latex) return;
    editor
      .chain()
      .focus()
      .insertContent({
        type: "mathBlock",
        attrs: { latex },
      })
      .run();
  };

  const insertImageFromUrl = () => {
    if (!editor) return;
    const url = window.prompt("Enter image URL");
    if (!url) return;
    editor.chain().focus().setImage({ src: url }).run();
  };

  if (!editor) {
    return (
      <div className="space-y-1.5">
        <LabelShim htmlFor={id}>{label}</LabelShim>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        <div className="border rounded-md px-3 py-2 text-sm text-muted-foreground">
          Loading editor…
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <LabelShim htmlFor={id}>{label}</LabelShim>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 rounded-md border bg-muted/50 px-2 py-1">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
        >
          B
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
        >
          I
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
        >
          • List
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
        >
          1. List
        </ToolbarButton>
        <ToolbarButton onClick={insertMathBlock}>∫ Math</ToolbarButton>
        <ToolbarButton onClick={insertImageFromUrl}>Img</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()}>
          Undo
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()}>
          Redo
        </ToolbarButton>
      </div>

      {/* Editor box */}
      <div
        id={id}
        className={cn(
          "border rounded-md min-h-[140px] bg-background",
          error && "border-destructive"
        )}
      >
        <EditorContent editor={editor} />
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};

function safeParseJSON(raw: string | undefined) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function ToolbarButton({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant={active ? "default" : "outline"}
      size="sm"
      className="h-7 px-2 text-xs"
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

function LabelShim({
  htmlFor,
  children,
}: {
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
    >
      {children}
    </label>
  );
}
