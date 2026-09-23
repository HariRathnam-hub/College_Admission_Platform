import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { StudentProfile, IStudentProfile } from "../models/StudentProfile.model";
import { UpdateProfileInput } from "../validations/profile.validation";

const TRACKED_FIELDS: (keyof IStudentProfile)[] = [
  "dateOfBirth",
  "gender",
  "phone",
  "address",
  "guardianName",
  "guardianPhone",
  "education",
];

function computeCompletion(profile: IStudentProfile): number {
  let filled = 0;
  for (const field of TRACKED_FIELDS) {
    const value = profile[field];
    if (field === "education") {
      if (Array.isArray(value) && value.length > 0) filled += 1;
      continue;
    }
    if (field === "address") {
      const addr = value as IStudentProfile["address"];
      if (addr && Object.values(addr).some((v) => !!v)) filled += 1;
      continue;
    }
    if (value !== undefined && value !== null && value !== "") filled += 1;
  }
  return Math.round((filled / TRACKED_FIELDS.length) * 100);
}

export const getMyProfile = asyncHandler(async (req: Request, res: Response) => {
  let profile = await StudentProfile.findOne({ user: req.user!.userId });
  if (!profile) {
    profile = await StudentProfile.create({ user: req.user!.userId, education: [] });
  }
  res.status(200).json(new ApiResponse("Profile fetched", profile));
});

export const updateMyProfile = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as UpdateProfileInput;

  let profile = await StudentProfile.findOne({ user: req.user!.userId });
  if (!profile) {
    profile = new StudentProfile({ user: req.user!.userId, education: [] });
  }

  if (body.dateOfBirth !== undefined) profile.dateOfBirth = new Date(body.dateOfBirth);
  if (body.gender !== undefined) profile.gender = body.gender;
  if (body.phone !== undefined) profile.phone = body.phone;
  if (body.address !== undefined) profile.address = { ...profile.address, ...body.address };
  if (body.guardianName !== undefined) profile.guardianName = body.guardianName;
  if (body.guardianPhone !== undefined) profile.guardianPhone = body.guardianPhone;
  if (body.education !== undefined) profile.education = body.education as IStudentProfile["education"];

  profile.profileCompletionPercent = computeCompletion(profile);
  await profile.save();

  res.status(200).json(new ApiResponse("Profile updated", profile));
});

// Faculty/Admin: view a specific student's profile (e.g. while reviewing their application).
export const getStudentProfileForStaff = asyncHandler(async (req: Request, res: Response) => {
  const profile = await StudentProfile.findOne({ user: req.params.userId }).populate("user", "name email");
  res.status(200).json(new ApiResponse("Student profile fetched", profile));
});
