// components/AddQuestions/OptionEditor.tsx
"use client";

import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { MathBlock } from "./MathBlock";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OptionEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}

/**
 * Compact editor for MCQ options with math support
 */
export const OptionEditor: React.FC<OptionEditorProps> = ({
  value,
  onChange,
  placeholder = "Enter option text...",
  error,
}) => {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      MathBlock,
    ],
    content: value || "",
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[60px] px-3 py-2",
      },
    },
  });

  React.useEffect(() => {
    if (!editor || !value || editor.getHTML() === value) return;
    editor.commands.setContent(value);
  }, [value, editor]);

  const insertMathBlock = () => {
    if (!editor) return;
    const latex = window.prompt(
      "Enter LaTeX for the formula",
      "x^2 + y^2 = r^2"
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

  if (!editor) {
    return (
      <div className="border rounded-md px-3 py-2 text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Compact toolbar */}
      <div className="flex items-center gap-1 border-b pb-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <strong>B</strong>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <em>I</em>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs"
          onClick={insertMathBlock}
        >
          ∫ Math
        </Button>
      </div>

      {/* Editor */}
      <div
        className={cn(
          "border rounded-md min-h-[60px] bg-background",
          error && "border-destructive"
        )}
      >
        <EditorContent editor={editor} />
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};
