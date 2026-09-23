import { z } from "zod";

const educationRecordSchema = z.object({
  level: z.enum(["10th", "12th", "Undergraduate", "Other"]),
  institution: z.string().trim().min(1, "Institution is required"),
  board: z.string().trim().max(120).optional(),
  yearOfCompletion: z.number().int().min(1950).max(2100).optional(),
  percentageOrGpa: z.number().min(0).max(100).optional(),
});

export const updateProfileSchema = z.object({
  body: z.object({
    dateOfBirth: z.string().datetime().optional(),
    gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]).optional(),
    phone: z.string().trim().max(20).optional(),
    address: z
      .object({
        line1: z.string().trim().max(200).optional(),
        line2: z.string().trim().max(200).optional(),
        city: z.string().trim().max(100).optional(),
        state: z.string().trim().max(100).optional(),
        country: z.string().trim().max(100).optional(),
        postalCode: z.string().trim().max(20).optional(),
      })
      .optional(),
    guardianName: z.string().trim().max(100).optional(),
    guardianPhone: z.string().trim().max(20).optional(),
    education: z.array(educationRecordSchema).optional(),
  }),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>["body"];
