import { z } from "zod";
import { USERNAME_REGEX } from "@/lib/auth";

// Same rules as the mobile signup screen and the API's upsertProfileSchema.
export const usernameField = z
  .string()
  .trim()
  .toLowerCase()
  .regex(USERNAME_REGEX, "3-20 characters. Start with a letter; use lowercase letters, numbers and underscores.");

export const loginSchema = z.object({
  username: z.string().trim().min(1, "Enter your username"),
  password: z.string().min(1, "Enter your password"),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your name (at least 2 characters)").max(80, "Name is too long"),
    username: usernameField,
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, { path: ["confirmPassword"], message: "Passwords don't match" });
export type SignupValues = z.infer<typeof signupSchema>;
