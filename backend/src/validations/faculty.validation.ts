import { z } from "zod";
import { APPLICATION_STATUSES, FACULTY_SETTABLE_STATUSES } from "../models/Application.model";
import { REVIEW_RECOMMENDATIONS } from "../models/Review.model";

export const listReviewApplicationsSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    status: z.enum(APPLICATION_STATUSES).optional(),
    program: z.string().optional(),
    search: z.string().trim().optional(),
    scope: z.enum(["mine", "unassigned", "all"]).optional(),
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
  }),
});

export const changeStatusSchema = z.object({
  body: z.object({
    status: z.enum(FACULTY_SETTABLE_STATUSES as [string, ...string[]]),
    note: z.string().trim().max(1000).optional(),
  }),
});

export const requestCorrectionSchema = z.object({
  body: z.object({
    note: z.string().trim().min(1, "Please describe what needs correcting").max(1000),
  }),
});

export const addNoteSchema = z.object({
  body: z.object({
    message: z.string().trim().min(1).max(1000),
  }),
});

export const sendMessageSchema = z.object({
  body: z.object({
    message: z.string().trim().min(1).max(1000),
  }),
});

export const submitReviewSchema = z.object({
  body: z.object({
    recommendation: z.enum(REVIEW_RECOMMENDATIONS),
    comments: z.string().trim().min(1, "Please add comments for your recommendation").max(2000),
  }),
});

export const updateFacultyProfileSchema = z.object({
  body: z.object({
    department: z.string().trim().max(120).optional(),
    designation: z.string().trim().max(120).optional(),
    phone: z.string().trim().max(20).optional(),
    specialization: z.array(z.string().trim().max(60)).optional(),
  }),
});

export const documentStatusSchema = z.object({
  body: z.object({
    status: z.enum(["PENDING", "VERIFIED", "REJECTED"]),
    rejectionReason: z.string().trim().max(500).optional(),
    remarks: z.string().trim().max(500).optional(),
  }),
});
