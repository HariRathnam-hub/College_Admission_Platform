import { z } from "zod";

export const createApplicationSchema = z.object({
  body: z.object({
    programId: z.string().min(1, "programId is required"),
  }),
});

export const updateApplicationSchema = z.object({
  body: z.object({
    personalStatement: z.string().trim().max(5000).optional(),
    academicDetails: z
      .object({
        tenthPercentage: z.number().min(0).max(100).optional(),
        twelfthPercentage: z.number().min(0).max(100).optional(),
        entranceExamName: z.string().trim().max(120).optional(),
        entranceExamScore: z.number().min(0).optional(),
      })
      .optional(),
  }),
});

export const reviewApplicationSchema = z.object({
  body: z.object({
    status: z.enum([
      "SUBMITTED",
      "UNDER_REVIEW",
      "DOCUMENTS_PENDING",
      "FACULTY_APPROVED",
      "FACULTY_REJECTED",
      "ADMIN_APPROVED",
      "ADMIN_REJECTED",
      "ADMISSION_CONFIRMED",
    ]),
    note: z.string().trim().max(1000).optional(),
  }),
});

export const withdrawApplicationSchema = z.object({
  body: z.object({
    reason: z.string().trim().max(500).optional(),
  }),
});

export const addNoteSchema = z.object({
  body: z.object({
    message: z.string().trim().min(1).max(1000),
  }),
});

export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>["body"];
