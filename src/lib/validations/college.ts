import { z } from "zod";

export const collegeSearchSchema = z.object({
  query: z.string().optional(),
  state: z.array(z.string()).optional(),
  size: z.enum(["SMALL", "MEDIUM", "LARGE"]).optional(),
  setting: z.enum(["URBAN", "SUBURBAN", "RURAL"]).optional(),
  control: z.enum(["PUBLIC", "PRIVATE"]).optional(),
  maxTuition: z.coerce.number().optional(),
  minAcceptanceRate: z.coerce.number().min(0).max(1).optional(),
  maxAcceptanceRate: z.coerce.number().min(0).max(1).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
});

export type CollegeSearchInput = z.infer<typeof collegeSearchSchema>;
