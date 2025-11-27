"use client";

import React, { useMemo, useState } from "react";
import { Node, mergeAttributes, NodeViewProps } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import katex from "katex";

export const MathBlock = Node.create({
  name: "mathBlock",
  group: "block",
  atom: true,
  draggable: false,
  selectable: true,

  addAttributes() {
    return {
      latex: {
        default: "",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="math-block"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "math-block" }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathBlockComponent);
  },
});

const MathBlockComponent: React.FC<NodeViewProps> = ({
  node,
  updateAttributes,
  selected,
}) => {
  const latex: string = node.attrs.latex;
  const [error, setError] = useState<string | null>(null);

  const html = useMemo(() => {
    try {
      const cleaned = latex?.trim() || "\\text{Empty formula}";
      const rendered = katex.renderToString(cleaned, {
        throwOnError: false,
        displayMode: true,
      });
      setError(null);
      return rendered;
    } catch (e) {
      setError("Invalid LaTeX");
      return "";
    }
  }, [latex]);

  const handleEdit = () => {
    const next = window.prompt("Edit LaTeX", latex);
    if (next !== null) {
      updateAttributes({ latex: next });
    }
  };

  return (
    <NodeViewWrapper className="my-3">
      <div
        className={`border rounded-md p-3 bg-muted ${
          selected ? "ring-2 ring-primary" : ""
        }`}
        onDoubleClick={handleEdit}
      >
        <div
          className="overflow-x-auto"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        {error && <p className="text-xs text-destructive mt-1">{error}</p>}
        <p className="text-[10px] text-muted-foreground mt-1">
          Double-click to edit formula
        </p>
      </div>
    </NodeViewWrapper>
  );
};
