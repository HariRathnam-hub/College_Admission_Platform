export type DegreeLevel = "UNDERGRADUATE" | "POSTGRADUATE" | "DIPLOMA" | "DOCTORATE";

// Shape of a Mongoose ref field once populated with a User document's public fields.
export interface PopulatedRef {
  _id: string;
  name: string;
  email: string;
}

export interface Program {
  _id: string;
  name: string;
  code: string;
  department: string;
  degreeLevel: DegreeLevel;
  description?: string;
  durationYears: number;
  totalSeats: number;
  availableSeats: number;
  eligibilityCriteria?: string;
  tuitionFee?: number;
  applicationOpenDate?: string;
  applicationDeadline?: string;
  isActive: boolean;
  createdAt: string;
}

// DRAFT -> SUBMITTED -> UNDER_REVIEW -> DOCUMENTS_PENDING (optional) ->
// FACULTY_APPROVED | FACULTY_REJECTED -> ADMIN_APPROVED | ADMIN_REJECTED -> ADMISSION_CONFIRMED.
// WITHDRAWN can be reached by the student from most pre-decision states.
export type ApplicationStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "DOCUMENTS_PENDING"
  | "FACULTY_APPROVED"
  | "FACULTY_REJECTED"
  | "ADMIN_APPROVED"
  | "ADMIN_REJECTED"
  | "ADMISSION_CONFIRMED"
  | "WITHDRAWN";

export interface StatusHistoryEntry {
  status: ApplicationStatus;
  note?: string;
  changedAt: string;
}

export interface AcademicDetails {
  tenthPercentage?: number;
  twelfthPercentage?: number;
  entranceExamName?: string;
  entranceExamScore?: number;
}

export interface ApplicationDocument {
  _id: string;
  owner?: string | PopulatedRef;
  type: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  rejectionReason?: string;
  remarks?: string;
  verifiedBy?: string | { _id: string; name: string; email: string };
  verificationDate?: string;
  createdAt: string;
}

export interface OfficerNote {
  author: string;
  message: string;
  createdAt: string;
}

export interface Application {
  _id: string;
  student: string | { _id: string; name: string; email: string };
  program: Program | string;
  status: ApplicationStatus;
  assignedFaculty?: string | { _id: string; name: string; email: string };
  personalStatement?: string;
  academicDetails?: AcademicDetails;
  documents: ApplicationDocument[] | string[];
  statusHistory: StatusHistoryEntry[];
  officerNotes: OfficerNote[];
  submittedAt?: string;
  correctionRequested?: string;
  withdrawnAt?: string;
  withdrawReason?: string;
  createdAt: string;
  updatedAt: string;
}

export type ReviewRecommendation = "RECOMMEND_APPROVE" | "RECOMMEND_REJECT";

export interface Review {
  _id: string;
  application: string;
  reviewer: string | { _id: string; name: string; email: string };
  recommendation: ReviewRecommendation;
  comments: string;
  createdAt: string;
}

export interface AppNotification {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  relatedApplication?: string;
  createdAt: string;
}
