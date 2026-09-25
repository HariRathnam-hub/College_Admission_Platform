import { Link, Navigate } from "react-router-dom";
import { FileText, FileCheck, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard, EmptyState, StatusProgress } from "@/components/shared/dashboard-ui";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useAuth } from "@/context/AuthContext";
import { useMyApplicationsQuery } from "@/features/applications/applications.api";
import { useProgramsQuery } from "@/features/programs/programs.api";
import { useNotificationsQuery } from "@/features/notifications/notifications.api";
import FacultyDashboardPage from "@/features/faculty/FacultyDashboardPage";

function StudentDashboard() {
  const { user } = useAuth();
  const { data: applications } = useMyApplicationsQuery();
  const { data: programs } = useProgramsQuery();
  const { data: notificationsData } = useNotificationsQuery();

  const active = applications?.filter((a) => a.status !== "DRAFT" && a.status !== "WITHDRAWN") ?? [];
  const docsNeeded = applications?.filter((a) => a.status === "DOCUMENTS_PENDING").length ?? 0;
  const unread = notificationsData?.unreadCount ?? 0;
  const latest = notificationsData?.notifications.slice(0, 3) ?? [];
  const deadlines = (programs?.programs ?? [])
    .filter((p) => p.applicationDeadline && new Date(p.applicationDeadline) > new Date())
    .sort((a, b) => +new Date(a.applicationDeadline!) - +new Date(b.applicationDeadline!))
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {user?.name?.split(" ")[0]}</h1>
        <p className="text-muted-foreground">Here's where things stand with your admission.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard index={0} label="Active applications" value={active.length} icon={FileText} />
        <StatCard index={1} label="Documents needing attention" value={docsNeeded} icon={FileCheck} hint={docsNeeded ? "Upload the missing files to continue" : "Nothing pending"} />
        <StatCard index={2} label="Unread notifications" value={unread} icon={Bell} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-lg">Application status</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            {applications && applications.length > 0 ? (
              applications.slice(0, 4).map((a) => (
                <Link key={a._id} to={`/dashboard/applications/${a._id}`} className="block space-y-2 rounded-lg p-2 transition-colors hover:bg-muted/50">
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate font-medium">{typeof a.program === "object" ? a.program.name : "Application"}</span>
                    <StatusBadge status={a.status} />
                  </div>
                  <StatusProgress status={a.status} />
                </Link>
              ))
            ) : (
              <EmptyState title="No applications yet" text="Pick a program to start your first application."
                action={<Link to="/dashboard/programs" className="text-sm font-medium text-primary hover:underline">Browse programs</Link>} />
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">Notifications</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {latest.length ? latest.map((n) => (
                <div key={n._id} className="text-sm"><p className={n.isRead ? "" : "font-medium"}>{n.title}</p></div>
              )) : <p className="text-sm text-muted-foreground">You're all caught up.</p>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg">Deadlines</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {deadlines.length ? deadlines.map((p) => (
                <div key={p._id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate">{p.name}</span>
                  <span className="shrink-0 text-muted-foreground">{new Date(p.applicationDeadline!).toLocaleDateString(undefined, { day: "numeric", month: "short" })}</span>
                </div>
              )) : <p className="text-sm text-muted-foreground">No upcoming deadlines.</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();

  if (user?.role === "FACULTY") return <FacultyDashboardPage />;
  if (user?.role === "ADMIN") return <Navigate to="/dashboard/analytics" replace />;
  return <StudentDashboard />;
}
