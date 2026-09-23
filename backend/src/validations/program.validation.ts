import { z } from "zod";

export const listProgramsSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    department: z.string().trim().optional(),
    degreeLevel: z.enum(["UNDERGRADUATE", "POSTGRADUATE", "DIPLOMA", "DOCTORATE"]).optional(),
    search: z.string().trim().optional(),
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
  }),
});

export const createProgramSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2),
    code: z.string().trim().min(2).max(20),
    department: z.string().trim().min(2),
    degreeLevel: z.enum(["UNDERGRADUATE", "POSTGRADUATE", "DIPLOMA", "DOCTORATE"]),
    description: z.string().trim().max(3000).optional(),
    durationYears: z.number().positive(),
    totalSeats: z.number().int().nonnegative(),
    eligibilityCriteria: z.string().trim().max(2000).optional(),
    tuitionFee: z.number().nonnegative().optional(),
    applicationOpenDate: z.string().datetime().optional(),
    applicationDeadline: z.string().datetime().optional(),
  }),
});

export type CreateProgramInput = z.infer<typeof createProgramSchema>["body"];
