import { Link } from "react-router-dom";
import { ClipboardList, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatCard } from "@/components/shared/dashboard-ui";
import { useFacultyDashboardStatsQuery } from "./faculty.api";
import { useAuth } from "@/context/AuthContext";

export default function FacultyDashboardPage() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useFacultyDashboardStatsQuery();
  const pending = stats?.pendingReviews ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {user?.name?.split(" ")[0]}</h1>
        <p className="text-muted-foreground">Here's what's on your review queue.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard index={0} label="Assigned applications" value={isLoading ? "—" : stats?.assignedApplications ?? 0} icon={ClipboardList} />
        <StatCard index={1} label="Pending reviews" value={isLoading ? "—" : pending} icon={Clock} hint={pending ? "Waiting for your decision" : "You're all caught up"} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Next step</CardTitle>
          <CardDescription>Open your queue to review applications and their documents.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link to="/dashboard/review" className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
            Go to assigned reviews
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
