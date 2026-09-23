import { UserRole } from "@/features/auth/auth.types";

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface Analytics {
  users: {
    total: number;
    byRole: Record<string, number>;
    studentProfiles: number;
    facultyProfiles: number;
  };
  programs: { total: number; active: number; seats: { totalSeats: number; availableSeats: number } };
  applications: {
    total: number;
    byStatus: Record<string, number>;
    approved: number;
    rejected: number;
    pending: number;
  };
  documents: { total: number; byStatus: Record<string, number> };
}
