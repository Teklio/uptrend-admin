import { z } from "zod";

export const videoFormSchema = z.object({
  title: z.string().trim().min(2, "Title is required").max(150),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
});
export type VideoFormSchemaType = z.infer<typeof videoFormSchema>;
