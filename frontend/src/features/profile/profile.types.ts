export interface Address {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface EducationRecord {
  level: "10th" | "12th" | "Undergraduate" | "Other";
  institution: string;
  board?: string;
  yearOfCompletion?: number;
  percentageOrGpa?: number;
}

export interface StudentProfile {
  _id: string;
  user: string;
  dateOfBirth?: string;
  gender?: "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";
  phone?: string;
  address?: Address;
  guardianName?: string;
  guardianPhone?: string;
  education: EducationRecord[];
  profileCompletionPercent: number;
}
