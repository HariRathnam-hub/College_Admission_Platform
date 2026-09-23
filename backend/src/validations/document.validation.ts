import { z } from "zod";
import { DOCUMENT_TYPES } from "../models/DocumentFile.model";

export const uploadDocumentSchema = z.object({
  body: z.object({
    type: z.enum(DOCUMENT_TYPES),
    applicationId: z.string().optional(),
  }),
});

export const documentStatusSchema = z.object({
  body: z.object({
    status: z.enum(["PENDING", "VERIFIED", "REJECTED"]),
    rejectionReason: z.string().trim().max(500).optional(),
    remarks: z.string().trim().max(500).optional(),
  }),
});
