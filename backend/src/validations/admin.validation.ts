import { z } from "zod";

export const listUsersSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    role: z.enum(["STUDENT", "FACULTY", "ADMIN"]).optional(),
    search: z.string().trim().optional(),
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    role: z.enum(["STUDENT", "FACULTY", "ADMIN"]).optional(),
    isActive: z.boolean().optional(),
    name: z.string().trim().min(2).max(100).optional(),
  }),
});

export const createStaffUserSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().email(),
    password: z
      .string()
      .min(8)
      .regex(/[A-Z]/)
      .regex(/[a-z]/)
      .regex(/[0-9]/),
    role: z.enum(["FACULTY", "ADMIN"]),
    department: z.string().trim().max(120).optional(),
    designation: z.string().trim().max(120).optional(),
    employeeId: z.string().trim().max(50).optional(),
  }),
});

export const updateProgramSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).optional(),
    department: z.string().trim().min(2).optional(),
    degreeLevel: z.enum(["UNDERGRADUATE", "POSTGRADUATE", "DIPLOMA", "DOCTORATE"]).optional(),
    description: z.string().trim().max(3000).optional(),
    durationYears: z.number().positive().optional(),
    totalSeats: z.number().int().nonnegative().optional(),
    availableSeats: z.number().int().nonnegative().optional(),
    eligibilityCriteria: z.string().trim().max(2000).optional(),
    tuitionFee: z.number().nonnegative().optional(),
    applicationOpenDate: z.string().datetime().optional(),
    applicationDeadline: z.string().datetime().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const broadcastNotificationSchema = z.object({
  body: z
    .object({
      title: z.string().trim().min(1).max(150),
      message: z.string().trim().min(1).max(1000),
      targetRole: z.enum(["STUDENT", "FACULTY", "ADMIN", "ALL", "SPECIFIC_STUDENT"]).default("ALL"),
      studentId: z.string().optional(),
    })
    .refine((data) => data.targetRole !== "SPECIFIC_STUDENT" || !!data.studentId, {
      message: "studentId is required when targetRole is SPECIFIC_STUDENT",
      path: ["studentId"],
    }),
});

export const assignFacultySchema = z.object({
  body: z.object({
    facultyId: z.string().min(1, "facultyId is required"),
  }),
});

export const adminChangeStatusSchema = z.object({
  body: z.object({
    status: z.enum([
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

export const listAllApplicationsSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    status: z.string().optional(),
    program: z.string().optional(),
    assignedFaculty: z.string().optional(),
    search: z.string().trim().optional(),
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
  }),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>["body"];
export type UpdateProgramInput = z.infer<typeof updateProgramSchema>["body"];
export type BroadcastNotificationInput = z.infer<typeof broadcastNotificationSchema>["body"];
export type CreateStaffUserInput = z.infer<typeof createStaffUserSchema>["body"];
export type AssignFacultyInput = z.infer<typeof assignFacultySchema>["body"];
export type AdminChangeStatusInput = z.infer<typeof adminChangeStatusSchema>["body"];
