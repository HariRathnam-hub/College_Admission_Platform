import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, ArrowRight, Inbox } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useReviewApplicationsQuery, useClaimApplicationMutation } from "./faculty.api";
import { Program, ApplicationStatus, PopulatedRef } from "@/lib/types";

const STATUS_OPTIONS: ApplicationStatus[] = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "DOCUMENTS_PENDING",
  "FACULTY_APPROVED",
  "FACULTY_REJECTED",
  "ADMIN_APPROVED",
  "ADMIN_REJECTED",
  "ADMISSION_CONFIRMED",
];

function ClaimButton({ applicationId }: { applicationId: string }) {
  const claim = useClaimApplicationMutation(applicationId);
  return (
    <Button size="sm" variant="outline" isLoading={claim.isPending} onClick={() => claim.mutate()}>
      <Inbox className="mr-2 h-3.5 w-3.5" /> Claim
    </Button>
  );
}

export default function AssignedReviewsPage() {
  const [scope, setScope] = useState<"mine" | "unassigned">("mine");
  const [status, setStatus] = useState<string>("");
  const [search, setSearch] = useState("");
  const { data, isLoading } = useReviewApplicationsQuery({
    scope,
    status: status || undefined,
    search: search || undefined,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Assigned Reviews</h1>
        <p className="text-muted-foreground">Verify documents, review details, and progress applications.</p>
      </div>

      <div className="flex gap-2 border-b">
        <button
          className={`border-b-2 px-3 py-2 text-sm font-medium ${scope === "mine" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          onClick={() => setScope("mine")}
        >
          My Queue
        </button>
        <button
          className={`border-b-2 px-3 py-2 text-sm font-medium ${scope === "unassigned" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          onClick={() => setScope("unassigned")}
        >
          Unassigned
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search student name or email"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading && <p className="p-6 text-sm text-muted-foreground">Loading applications…</p>}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Program</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {data?.applications.map((application) => {
                  const student = application.student as PopulatedRef;
                  const program = application.program as Program;
                  return (
                    <tr key={application._id} className="border-b last:border-0">
                      <td className="px-4 py-3">
                        <p className="font-medium">{student?.name}</p>
                        <p className="text-xs text-muted-foreground">{student?.email}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{program?.name}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={application.status} />
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {application.submittedAt ? new Date(application.submittedAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {scope === "unassigned" ? (
                          <ClaimButton applicationId={application._id} />
                        ) : (
                          <Link
                            to={`/dashboard/review/${application._id}`}
                            className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                          >
                            Review <ArrowRight className="ml-1 h-3.5 w-3.5" />
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {data?.applications.length === 0 && (
              <p className="p-6 text-sm text-muted-foreground">No applications match your filters.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
