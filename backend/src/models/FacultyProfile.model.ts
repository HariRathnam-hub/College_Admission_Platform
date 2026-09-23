import { Schema, model, Document, Types } from "mongoose";

export interface IFacultyProfile extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  employeeId?: string;
  department?: string;
  designation?: string;
  phone?: string;
  specialization?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const facultyProfileSchema = new Schema<IFacultyProfile>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    employeeId: { type: String, trim: true },
    department: { type: String, trim: true },
    designation: { type: String, trim: true },
    phone: { type: String, trim: true },
    specialization: { type: [String], default: [] },
  },
  { timestamps: true }
);

facultyProfileSchema.index({ department: 1 });

export const FacultyProfile = model<IFacultyProfile>("FacultyProfile", facultyProfileSchema);
