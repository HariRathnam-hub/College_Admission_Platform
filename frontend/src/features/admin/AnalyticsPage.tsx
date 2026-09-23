import { Users, GraduationCap, FileText, CheckCircle2, XCircle, Clock, FileCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAnalyticsQuery } from "./admin.api";

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under review",
  DOCUMENTS_PENDING: "Documents pending",
  FACULTY_APPROVED: "Faculty approved",
  FACULTY_REJECTED: "Faculty rejected",
  ADMIN_APPROVED: "Admin approved",
  ADMIN_REJECTED: "Admin rejected",
  ADMISSION_CONFIRMED: "Admission confirmed",
  WITHDRAWN: "Withdrawn",
};

export default function AnalyticsPage() {
  const { data, isLoading } = useAnalyticsQuery();

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading analytics…</p>;
  if (!data) return <p className="text-sm text-destructive">Failed to load analytics.</p>;

  const maxStatusCount = Math.max(...Object.values(data.applications.byStatus), 1);

  const statCards = [
    { label: "Total Students", value: data.users.byRole.STUDENT ?? 0, icon: Users },
    { label: "Total Faculty", value: data.users.byRole.FACULTY ?? 0, icon: Users },
    { label: "Total Programs", value: data.programs.total, icon: GraduationCap },
    { label: "Total Applications", value: data.applications.total, icon: FileText },
    { label: "Approved Applications", value: data.applications.approved, icon: CheckCircle2 },
    { label: "Rejected Applications", value: data.applications.rejected, icon: XCircle },
    { label: "Pending Applications", value: data.applications.pending, icon: Clock },
    { label: "Documents Verified", value: data.documents.byStatus.VERIFIED ?? 0, icon: FileCheck },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">A snapshot of platform activity.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Applications by status</CardTitle>
          <CardDescription>Distribution across the admission pipeline.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(data.applications.byStatus).map(([status, count]) => (
            <div key={status} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span>{STATUS_LABELS[status] ?? status}</span>
                <span className="text-muted-foreground">{count}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${(count / maxStatusCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
