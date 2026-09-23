import { Link } from "react-router-dom";
import { FileText, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useMyApplicationsQuery } from "./applications.api";
import { Program } from "@/lib/types";

export default function ApplicationsListPage() {
  const { data: applications, isLoading, isError } = useMyApplicationsQuery();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Applications</h1>
          <p className="text-muted-foreground">Track and manage your admission applications.</p>
        </div>
        <Button asChild>
          <Link to="/dashboard/programs">Browse Programs</Link>
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading applications…</p>}
      {isError && <p className="text-sm text-destructive">Failed to load applications.</p>}

      {applications?.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <FileText className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              You haven&apos;t started any applications yet. Browse programs to get started.
            </p>
            <Button asChild>
              <Link to="/dashboard/programs">Explore Programs</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {applications?.map((application) => {
          const program = application.program as Program;
          return (
            <Card key={application._id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <StatusBadge status={application.status} />
                </div>
                <CardTitle className="text-lg">{program?.name ?? "Program"}</CardTitle>
                <CardDescription>{program?.department}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Last updated {new Date(application.updatedAt).toLocaleDateString()}
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link to={`/dashboard/applications/${application._id}`}>
                    View application <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
