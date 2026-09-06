import { z } from "zod";
import { emailSchema, nameSchema, passwordSchema, phoneSchema } from "./common.schema";

export const createUserFormSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    phone: phoneSchema,
    state: z.string().trim().min(1, "State is required").max(100),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
export type CreateUserFormSchemaType = z.infer<typeof createUserFormSchema>;
