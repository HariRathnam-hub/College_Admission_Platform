import { cn } from "@/lib/utils";
import { ApplicationStatus } from "@/lib/types";

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  SUBMITTED: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  UNDER_REVIEW: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  DOCUMENTS_PENDING: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  FACULTY_APPROVED: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
  FACULTY_REJECTED: "bg-red-500/10 text-red-600 dark:text-red-400",
  ADMIN_APPROVED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  ADMIN_REJECTED: "bg-red-600/10 text-red-700 dark:text-red-400",
  ADMISSION_CONFIRMED: "bg-emerald-600/15 text-emerald-700 dark:text-emerald-300",
  WITHDRAWN: "bg-muted text-muted-foreground",
};

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  DOCUMENTS_PENDING: "Documents Pending",
  FACULTY_APPROVED: "Faculty Approved",
  FACULTY_REJECTED: "Faculty Rejected",
  ADMIN_APPROVED: "Admin Approved",
  ADMIN_REJECTED: "Admin Rejected",
  ADMISSION_CONFIRMED: "Admission Confirmed",
  WITHDRAWN: "Withdrawn",
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        STATUS_STYLES[status]
      )}
    >
      {STATUS_LABELS[status] ?? status.replace(/_/g, " ")}
    </span>
  );
}

export { STATUS_LABELS };
