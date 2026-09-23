import { Schema, model, Document, Types } from "mongoose";

export interface IAddress {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface IEducationRecord {
  level: "10th" | "12th" | "Undergraduate" | "Other";
  institution: string;
  board?: string;
  yearOfCompletion?: number;
  percentageOrGpa?: number;
}

export interface IStudentProfile extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  dateOfBirth?: Date;
  gender?: "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";
  phone?: string;
  address?: IAddress;
  guardianName?: string;
  guardianPhone?: string;
  education: IEducationRecord[];
  profileCompletionPercent: number;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<IAddress>(
  {
    line1: String,
    line2: String,
    city: String,
    state: String,
    country: String,
    postalCode: String,
  },
  { _id: false }
);

const educationSchema = new Schema<IEducationRecord>(
  {
    level: {
      type: String,
      enum: ["10th", "12th", "Undergraduate", "Other"],
      required: true,
    },
    institution: { type: String, required: true },
    board: String,
    yearOfCompletion: Number,
    percentageOrGpa: Number,
  },
  { _id: false }
);

const studentProfileSchema = new Schema<IStudentProfile>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"],
    },
    phone: { type: String, trim: true },
    address: addressSchema,
    guardianName: String,
    guardianPhone: String,
    education: { type: [educationSchema], default: [] },
    profileCompletionPercent: { type: Number, default: 0, min: 0, max: 100 },
  },
  { timestamps: true }
);

export const StudentProfile = model<IStudentProfile>("StudentProfile", studentProfileSchema);
