import { z } from "zod";
import { emailSchema, nameSchema, passwordSchema, phoneSchema } from "./common.schema";

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  rememberMe: z.boolean(),
});
export type LoginSchemaType = z.infer<typeof loginSchema>;

export const updateAdminProfileSchema = z.object({
  name: nameSchema.optional().or(z.literal("")),
  phone: phoneSchema.optional().or(z.literal("")),
});
export type UpdateAdminProfileSchemaType = z.infer<typeof updateAdminProfileSchema>;

export const changeAdminPasswordSchema = z
  .object({
    currentPassword: passwordSchema,
    newPassword: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type ChangeAdminPasswordSchemaType = z.infer<typeof changeAdminPasswordSchema>;
