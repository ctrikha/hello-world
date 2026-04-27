import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["STUDENT", "ADVISOR"], {
    error: () => "Please select a role",
  }),
  inviteToken: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export type LoginInput = z.infer<typeof loginSchema>;
