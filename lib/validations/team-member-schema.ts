import { z } from "zod";

export const teamMemberSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  title: z.string().min(1, "Title/Role is required").max(100, "Title too long"),
  image: z.string().min(1, "Profile image is required"),
  expertise: z
    .array(z.string().min(1))
    .min(1, "At least one expertise is required"),
  displayOrder: z.number().min(1, "Display order must be at least 1"),
  isActive: z.boolean(),
});

export type TeamMemberFormValues = z.infer<typeof teamMemberSchema>;
