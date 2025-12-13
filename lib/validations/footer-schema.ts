// lib/validations/footer-schema.ts
import { z } from "zod";

export const footerLinkSchema = z.object({
  section: z.enum(["COMPANY", "LEGAL", "RESOURCES", "SOCIAL"]),
  text: z.string().min(1, "Link text is required"),
  url: z.string().url("Invalid URL"),
  order: z.number().default(0),
  isActive: z.boolean().default(true),
  openInNewTab: z.boolean().default(false),
});

export type FooterLinkFormValues = z.infer<typeof footerLinkSchema>;
