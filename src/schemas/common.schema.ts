import { z } from "zod";

// Mirrors uptrend-server's src/schemas/common.schema.ts exactly, so
// client-side validation never disagrees with what the backend will accept.

export const emailSchema = z.email("Invalid email address");

export const passwordSchema = z
  .string()
  .min(6, "Must be at least 6 characters")
  .max(12, "Must be at most 12 characters")
  .regex(/[A-Za-z]/, "Must include a letter")
  .regex(/\d/, "Must include a number")
  .regex(/[^A-Za-z0-9]/, "Must include a special character");

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\d{10}$/, "Invalid phone number");

export const nameSchema = z
  .string()
  .trim()
  .min(2)
  .max(50)
  .refine((value) => !/^[^a-zA-Z0-9\s]+$/.test(value), {
    message: "cannot contain only special characters.",
  });
