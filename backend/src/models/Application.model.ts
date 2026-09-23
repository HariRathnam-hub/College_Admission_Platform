import { Schema, model, Document as MongooseDocument, Types } from "mongoose";

// Status flow: DRAFT -> SUBMITTED -> UNDER_REVIEW -> DOCUMENTS_PENDING (optional) ->
// FACULTY_APPROVED | FACULTY_REJECTED -> ADMIN_APPROVED | ADMIN_REJECTED -> ADMISSION_CONFIRMED.
// WITHDRAWN can be reached by the student from any pre-decision state.
export const APPLICATION_STATUSES = [
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "DOCUMENTS_PENDING",
  "FACULTY_APPROVED",
  "FACULTY_REJECTED",
  "ADMIN_APPROVED",
  "ADMIN_REJECTED",
  "ADMISSION_CONFIRMED",
  "WITHDRAWN",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

// Statuses a Faculty reviewer is allowed to set directly.
export const FACULTY_SETTABLE_STATUSES: ApplicationStatus[] = [
  "UNDER_REVIEW",
  "DOCUMENTS_PENDING",
  "FACULTY_APPROVED",
  "FACULTY_REJECTED",
];

// Statuses an Admin is allowed to set directly (a superset — admins can also override faculty-level statuses).
export const ADMIN_SETTABLE_STATUSES: ApplicationStatus[] = [
  "UNDER_REVIEW",
  "DOCUMENTS_PENDING",
  "FACULTY_APPROVED",
  "FACULTY_REJECTED",
  "ADMIN_APPROVED",
  "ADMIN_REJECTED",
  "ADMISSION_CONFIRMED",
];

// Statuses from which a student may still withdraw their application.
export const WITHDRAWABLE_STATUSES: ApplicationStatus[] = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "DOCUMENTS_PENDING",
  "FACULTY_APPROVED",
];

export interface IStatusHistoryEntry {
  status: ApplicationStatus;
  note?: string;
  changedBy?: Types.ObjectId;
  changedAt: Date;
}

export interface IApplicationNote {
  author: Types.ObjectId;
  message: string;
  createdAt: Date;
}

export interface IApplication extends MongooseDocument {
  _id: Types.ObjectId;
  student: Types.ObjectId;
  program: Types.ObjectId;
  status: ApplicationStatus;
  assignedFaculty?: Types.ObjectId;
  personalStatement?: string;
  academicDetails?: {
    tenthPercentage?: number;
    twelfthPercentage?: number;
    entranceExamName?: string;
    entranceExamScore?: number;
  };
  documents: Types.ObjectId[];
  statusHistory: IStatusHistoryEntry[];
  officerNotes: IApplicationNote[];
  submittedAt?: Date;
  reviewedBy?: Types.ObjectId;
  correctionRequested?: string;
  withdrawnAt?: Date;
  withdrawReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const statusHistorySchema = new Schema<IStatusHistoryEntry>(
  {
    status: { type: String, enum: APPLICATION_STATUSES, required: true },
    note: String,
    changedBy: { type: Schema.Types.ObjectId, ref: "User" },
    changedAt: { type: Date, default: () => new Date() },
  },
  { _id: false }
);

const noteSchema = new Schema<IApplicationNote>(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: () => new Date() },
  },
  { _id: false }
);

const applicationSchema = new Schema<IApplication>(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },
    program: { type: Schema.Types.ObjectId, ref: "Program", required: true },
    status: { type: String, enum: APPLICATION_STATUSES, default: "DRAFT" },
    assignedFaculty: { type: Schema.Types.ObjectId, ref: "User" },
    personalStatement: { type: String, maxlength: 5000 },
    academicDetails: {
      tenthPercentage: Number,
      twelfthPercentage: Number,
      entranceExamName: String,
      entranceExamScore: Number,
    },
    documents: [{ type: Schema.Types.ObjectId, ref: "DocumentFile" }],
    statusHistory: { type: [statusHistorySchema], default: [] },
    officerNotes: { type: [noteSchema], default: [] },
    submittedAt: Date,
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    correctionRequested: String,
    withdrawnAt: Date,
    withdrawReason: String,
  },
  { timestamps: true }
);

applicationSchema.index({ student: 1, program: 1 }, { unique: true });
applicationSchema.index({ status: 1 });
applicationSchema.index({ assignedFaculty: 1, status: 1 });

export const Application = model<IApplication>("Application", applicationSchema);
