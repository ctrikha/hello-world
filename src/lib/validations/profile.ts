import { z } from "zod";

export const studentProfileSchema = z.object({
  gpa: z.coerce.number().min(0).max(4.0).optional().nullable(),
  satScore: z.coerce.number().min(400).max(1600).optional().nullable(),
  actScore: z.coerce.number().min(1).max(36).optional().nullable(),
  classRank: z.coerce.number().min(1).optional().nullable(),
  classSize: z.coerce.number().min(1).optional().nullable(),
  apCourses: z.array(z.string()).default([]),
  ibCourses: z.array(z.string()).default([]),
  graduationYear: z.coerce.number().min(2024).max(2030).default(2025),
  highSchool: z.string().optional().nullable(),
  highSchoolType: z
    .enum(["PUBLIC", "PRIVATE", "CHARTER", "HOMESCHOOL"])
    .default("PUBLIC"),
  state: z.string().max(2).optional().nullable(),
  intendedMajors: z.array(z.string()).default([]),
  preferredSize: z.enum(["SMALL", "MEDIUM", "LARGE"]).optional().nullable(),
  preferredRegion: z.array(z.string()).default([]),
  maxTuition: z.coerce.number().min(0).optional().nullable(),
  prefersCampus: z
    .enum(["URBAN", "SUBURBAN", "RURAL"])
    .optional()
    .nullable(),
  awards: z.array(z.string()).default([]),
  personalStatement: z.string().max(7000).optional().nullable(),
});

export type StudentProfileInput = z.infer<typeof studentProfileSchema>;

export const advisorProfileSchema = z.object({
  bio: z.string().max(2000).optional().nullable(),
  specializations: z.array(z.string()).default([]),
  yearsExperience: z.coerce.number().min(0).max(50).default(0),
  acceptingClients: z.boolean().default(true),
  calendarUrl: z.string().url().optional().nullable().or(z.literal("")),
  timezone: z.string().default("America/New_York"),
});

export type AdvisorProfileInput = z.infer<typeof advisorProfileSchema>;
