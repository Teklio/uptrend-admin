import { z } from "zod";
import { nameSchema } from "./common.schema";

export const courseFormSchema = z.object({
  name: nameSchema,
  description: z.string().trim().max(5000).optional().or(z.literal("")),
  language: z.enum(["english", "malayalam"]).optional().or(z.literal("")),
  mentorName: nameSchema.optional().or(z.literal("")),
  price: z.number().nonnegative("Cannot be negative"),
  actualPrice: z.number().nonnegative("Cannot be negative"),
  extraFee: z.number().nonnegative("Cannot be negative"),
  features: z.array(z.string().trim().min(1)),
});
export type CourseFormSchemaType = z.infer<typeof courseFormSchema>;
