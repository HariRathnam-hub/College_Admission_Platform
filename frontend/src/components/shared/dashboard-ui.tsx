import type { ComponentType, ReactNode } from "react";
import { motion } from "framer-motion";
import { Inbox } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ApplicationStatus } from "@/lib/types";

export function StatCard({ label, value, icon: Icon, hint, index = 0 }: {
  label: string; value: ReactNode; icon: ComponentType<{ className?: string }>; hint?: string; index?: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -3 }} transition={{ duration: 0.3, delay: index * 0.05 }}>
      <Card className="p-5 transition-shadow hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{label}</span>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="h-4 w-4" /></span>
        </div>
        <div className="mt-3 text-3xl font-semibold tracking-tight">{value}</div>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </Card>
    </motion.div>
  );
}

export function EmptyState({ title, text, action, className }: { title: string; text?: string; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center gap-2 px-6 py-10 text-center", className)}>
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary"><Inbox className="h-5 w-5" /></span>
      <p className="font-medium">{title}</p>
      {text && <p className="max-w-xs text-sm text-muted-foreground">{text}</p>}
      {action}
    </div>
  );
}

const STEP: Partial<Record<ApplicationStatus, number>> = {
  DRAFT: 1, SUBMITTED: 2, UNDER_REVIEW: 3, DOCUMENTS_PENDING: 3, FACULTY_APPROVED: 4, ADMIN_APPROVED: 5, ADMISSION_CONFIRMED: 6,
};

/** Six-step progress bar mapped from application status. */
export function StatusProgress({ status }: { status: ApplicationStatus }) {
  const step = STEP[status];
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuemin={0} aria-valuemax={6} aria-valuenow={step ?? 0}>
      <motion.div
        initial={{ width: 0 }} animate={{ width: `${((step ?? 6) / 6) * 100}%` }} transition={{ duration: 0.7, ease: "easeOut" }}
        className={cn("h-full rounded-full", step ? "bg-gradient-to-r from-indigo-400 to-cyan-400" : "bg-rose-300/60")}
      />
    </div>
  );
}
