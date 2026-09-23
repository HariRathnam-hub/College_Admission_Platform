import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, GraduationCap, Users, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProgramQuery } from "./programs.api";
import { useStartApplicationMutation } from "@/features/applications/applications.api";

export default function ProgramDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: program, isLoading } = useProgramQuery(id);
  const startApplication = useStartApplicationMutation();

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading program…</p>;
  if (!program) return <p className="text-sm text-destructive">Program not found.</p>;

  const handleApply = async () => {
    const application = await startApplication.mutateAsync(program._id);
    navigate(`/dashboard/applications/${application._id}`);
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link to="/dashboard/programs">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to programs
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 text-xs font-medium text-primary">
            <GraduationCap className="h-4 w-4" />
            {program.degreeLevel.replace("_", " ")} · {program.code}
          </div>
          <CardTitle className="text-2xl">{program.name}</CardTitle>
          <CardDescription>{program.department}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {program.description && <p className="text-sm text-muted-foreground">{program.description}</p>}

          <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> {program.durationYears} yrs
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" /> {program.availableSeats}/{program.totalSeats} seats
            </div>
            {program.tuitionFee !== undefined && (
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-primary" /> ${program.tuitionFee.toLocaleString()}
              </div>
            )}
            {program.applicationOpenDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Opens {new Date(program.applicationOpenDate).toLocaleDateString()}
              </div>
            )}
            {program.applicationDeadline && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Closes {new Date(program.applicationDeadline).toLocaleDateString()}
              </div>
            )}
          </div>

          {program.eligibilityCriteria && (
            <div>
              <h3 className="mb-1 text-sm font-semibold">Eligibility</h3>
              <p className="text-sm text-muted-foreground">{program.eligibilityCriteria}</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleApply} isLoading={startApplication.isPending}>
            Start Application
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
