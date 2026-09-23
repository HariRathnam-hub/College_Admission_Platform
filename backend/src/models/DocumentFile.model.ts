import { Schema, model, Document as MongooseDocument, Types } from "mongoose";

export const DOCUMENT_TYPES = [
  "PASSPORT_PHOTO",
  "AADHAAR_CARD",
  "TENTH_MARKSHEET",
  "TWELFTH_MARKSHEET",
  "TRANSFER_CERTIFICATE",
  "COMMUNITY_CERTIFICATE",
  "INCOME_CERTIFICATE",
  "SIGNATURE",
  "ENTRANCE_SCORECARD",
  "OTHER",
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];

// Documents a student must upload before an application can be submitted.
export const MANDATORY_DOCUMENT_TYPES: DocumentType[] = [
  "AADHAAR_CARD",
  "TENTH_MARKSHEET",
  "TWELFTH_MARKSHEET",
  "TRANSFER_CERTIFICATE",
];

export const MANDATORY_DOCUMENT_LABELS: Record<string, string> = {
  AADHAAR_CARD: "Aadhaar Card",
  TENTH_MARKSHEET: "10th Marksheet",
  TWELFTH_MARKSHEET: "12th Marksheet",
  TRANSFER_CERTIFICATE: "Transfer Certificate",
};

export const DOCUMENT_STATUSES = ["PENDING", "VERIFIED", "REJECTED"] as const;
export type DocumentStatus = (typeof DOCUMENT_STATUSES)[number];

export interface IDocumentFile extends MongooseDocument {
  _id: Types.ObjectId;
  owner: Types.ObjectId;
  application?: Types.ObjectId;
  type: DocumentType;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  storageProvider: "CLOUDINARY" | "LOCAL";
  url: string;
  publicId?: string;
  status: DocumentStatus;
  rejectionReason?: string;
  remarks?: string;
  verifiedBy?: Types.ObjectId;
  verificationDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const documentFileSchema = new Schema<IDocumentFile>(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    application: { type: Schema.Types.ObjectId, ref: "Application" },
    type: { type: String, enum: DOCUMENT_TYPES, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
    storageProvider: { type: String, enum: ["CLOUDINARY", "LOCAL"], required: true },
    url: { type: String, required: true },
    publicId: String,
    status: { type: String, enum: DOCUMENT_STATUSES, default: "PENDING" },
    rejectionReason: String,
    remarks: String,
    verifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
    verificationDate: Date,
  },
  { timestamps: true }
);

documentFileSchema.index({ owner: 1 });
documentFileSchema.index({ application: 1 });

export const DocumentFile = model<IDocumentFile>("DocumentFile", documentFileSchema);
