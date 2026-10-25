import { z } from "zod";

export const blogFormSchema = z.object({
  title: z.string().trim().min(2, "Title is required").max(200),
  description: z.string().trim().min(1, "Content is required"),
  readingTime: z.number().int().positive("Must be greater than 0"),
});
export type BlogFormSchemaType = z.infer<typeof blogFormSchema>;
