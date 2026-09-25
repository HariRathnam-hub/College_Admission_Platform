import { cn } from "@/lib/utils";
import { ApplicationStatus } from "@/lib/types";

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  SUBMITTED: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-300",
  UNDER_REVIEW: "bg-violet-500/10 text-violet-600 dark:text-violet-300",
  DOCUMENTS_PENDING: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  FACULTY_APPROVED: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
  FACULTY_REJECTED: "bg-rose-400/10 text-rose-600 dark:text-rose-300",
  ADMIN_APPROVED: "bg-teal-500/10 text-teal-700 dark:text-teal-300",
  ADMIN_REJECTED: "bg-rose-400/10 text-rose-600 dark:text-rose-300",
  ADMISSION_CONFIRMED: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-200",
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
