import { z } from "zod";

export const createApplicationSchema = z.object({
  collegeId: z.string().min(1, "College is required"),
  decisionType: z.enum(["EA", "ED", "ED2", "RD", "ROLLING"]).optional(),
  deadline: z.string().optional(),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;

export const updateApplicationSchema = z.object({
  id: z.string(),
  status: z
    .enum([
      "RESEARCHING",
      "PLANNING",
      "IN_PROGRESS",
      "SUBMITTED",
      "INTERVIEW",
      "DECISION",
      "ENROLLED",
    ])
    .optional(),
  boardColumn: z
    .enum([
      "RESEARCHING",
      "PLANNING",
      "IN_PROGRESS",
      "SUBMITTED",
      "INTERVIEW",
      "DECISION",
      "ENROLLED",
    ])
    .optional(),
  columnOrder: z.number().optional(),
  decisionType: z.enum(["EA", "ED", "ED2", "RD", "ROLLING"]).optional().nullable(),
  deadline: z.string().optional().nullable(),
  submittedAt: z.string().optional().nullable(),
  outcome: z
    .enum(["ACCEPTED", "WAITLISTED", "DEFERRED", "REJECTED", "WITHDRAWN"])
    .optional()
    .nullable(),
  scholarshipAmt: z.coerce.number().optional().nullable(),
  notes: z.string().optional(),
});

export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;
