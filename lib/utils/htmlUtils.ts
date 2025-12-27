/**
 * Utility functions for HTML content processing
 */

/**
 * Extract plain text from HTML string
 * Useful for previews, search, and display
 */
export function stripHtml(html: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
}

/**
 * Get a truncated plain text preview from HTML
 */
export function getTextPreview(html: string, maxLength: number = 100): string {
  const plainText = stripHtml(html);
  if (plainText.length <= maxLength) return plainText;
  return plainText.substring(0, maxLength) + "...";
}

/**
 * Check if HTML content has meaningful text or math blocks
 * Math blocks are stored as <div data-type="math-block" data-latex="...">
 */
export function hasTextContent(html: string): boolean {
  if (!html) return false;

  // Check if there's a math block
  const hasMathBlock =
    html.includes('data-type="math-block"') && html.includes("data-latex=");
  if (hasMathBlock) return true;

  // Check for regular text content
  const plainText = stripHtml(html);
  return plainText.length > 0;
}

/**
 * Sanitize HTML to prevent XSS (basic sanitization)
 * For production, consider using a library like DOMPurify
 */
export function sanitizeHtml(html: string): string {
  // Remove script tags and event handlers
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/on\w+\s*=\s*[^\s>]*/gi, "");
}
