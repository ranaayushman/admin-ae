// components/QuestionRenderer.tsx
"use client";

import React, { useEffect, useRef } from "react";
import katex from "katex";

interface QuestionRendererProps {
  content: string;
  className?: string;
}

/**
 * Component to safely render HTML content from TipTap editor
 * with KaTeX math support for formulas in math-block divs
 */
export function QuestionRenderer({
  content,
  className = "",
}: QuestionRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !content) return;

    // Set the HTML content
    containerRef.current.innerHTML = content;

    // Find and render all math blocks
    const mathBlocks = containerRef.current.querySelectorAll(
      'div[data-type="math-block"]'
    );

    mathBlocks.forEach((block) => {
      const latex = block.getAttribute("data-latex");
      if (latex) {
        try {
          const rendered = katex.renderToString(latex, {
            throwOnError: false,
            displayMode: true,
          });
          block.innerHTML = rendered;
        } catch (error) {
          console.error("KaTeX rendering error:", error);
          block.innerHTML = `<span class="text-red-600 text-sm">Invalid LaTeX: ${latex}</span>`;
        }
      }
    });
  }, [content]);

  if (!content) {
    return <div className="text-gray-400 text-sm">No content</div>;
  }

  return (
    <div
      ref={containerRef}
      className={`prose prose-sm max-w-none ${className}`}
      // Content is set via useEffect to ensure proper KaTeX rendering
    />
  );
}
