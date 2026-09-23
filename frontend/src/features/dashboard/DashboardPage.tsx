import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, GraduationCap, Bell, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

  const activeApplications = applications?.filter((a) => a.status !== "DRAFT" && a.status !== "WITHDRAWN").length ?? 0;
  const approvedApplications =
    applications?.filter((a) => a.status === "ADMIN_APPROVED" || a.status === "ADMISSION_CONFIRMED").length ?? 0;

  const statCards = [
    { label: "Active Applications", value: activeApplications, icon: FileText },
    { label: "Available Programs", value: programs?.programs.length ?? 0, icon: GraduationCap },
    { label: "Unread Notifications", value: notificationsData?.unreadCount ?? 0, icon: Bell },
    { label: "Approved", value: approvedApplications, icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="text-2xl font-bold tracking-tight">Welcome back, {user?.name?.split(" ")[0]}</h1>
        <p className="text-muted-foreground">Here's where things stand with your admission journey.</p>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                <stat.icon className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Getting started</CardTitle>
          <CardDescription>Browse programs, start an application, and track its progress here.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Head to Programs to explore what's open, or check My Applications to continue a draft.
        </CardContent>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();

  if (user?.role === "FACULTY") return <FacultyDashboardPage />;
  if (user?.role === "ADMIN") return <Navigate to="/dashboard/analytics" replace />;
  return <StudentDashboard />;
}
