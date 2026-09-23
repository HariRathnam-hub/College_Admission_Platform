import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ClipboardList, Clock, ThumbsUp, ThumbsDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useFacultyDashboardStatsQuery } from "./faculty.api";
import { useAuth } from "@/context/AuthContext";

export default function FacultyDashboardPage() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useFacultyDashboardStatsQuery();

  const cards = [
    { label: "Assigned Applications", value: stats?.assignedApplications ?? 0, icon: ClipboardList },
    { label: "Pending Reviews", value: stats?.pendingReviews ?? 0, icon: Clock },
    { label: "Approved Reviews", value: stats?.approvedReviews ?? 0, icon: ThumbsUp },
    { label: "Rejected Reviews", value: stats?.rejectedReviews ?? 0, icon: ThumbsDown },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome back, {user?.name?.split(" ")[0]}</h1>
        <p className="text-muted-foreground">Here's what's on your review queue.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((stat, idx) => (
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
                <div className="text-2xl font-bold">{isLoading ? "—" : stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Next step</CardTitle>
          <CardDescription>Jump into your assigned queue or pick up an unclaimed application.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link to="/dashboard/review" className="text-sm font-medium text-primary hover:underline">
            Go to Assigned Reviews →
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
