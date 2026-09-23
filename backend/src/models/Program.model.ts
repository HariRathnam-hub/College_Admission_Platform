import { Schema, model, Document, Types } from "mongoose";

export interface IProgram extends Document {
  _id: Types.ObjectId;
  name: string;
  code: string;
  department: string;
  degreeLevel: "UNDERGRADUATE" | "POSTGRADUATE" | "DIPLOMA" | "DOCTORATE";
  description?: string;
  durationYears: number;
  totalSeats: number;
  availableSeats: number;
  eligibilityCriteria?: string;
  tuitionFee?: number;
  applicationOpenDate?: Date;
  applicationDeadline?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const programSchema = new Schema<IProgram>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    department: { type: String, required: true },
    degreeLevel: {
      type: String,
      enum: ["UNDERGRADUATE", "POSTGRADUATE", "DIPLOMA", "DOCTORATE"],
      required: true,
    },
    description: String,
    durationYears: { type: Number, required: true, min: 0.5 },
    totalSeats: { type: Number, required: true, min: 0 },
    availableSeats: { type: Number, required: true, min: 0 },
    eligibilityCriteria: String,
    tuitionFee: Number,
    applicationOpenDate: Date,
    applicationDeadline: Date,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

programSchema.index({ department: 1 });
programSchema.index({ isActive: 1 });

export const Program = model<IProgram>("Program", programSchema);
