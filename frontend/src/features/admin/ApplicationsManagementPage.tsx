import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useAdminApplicationsQuery, useAssignFacultyMutation, useAdminChangeApplicationStatusMutation, useAdminUsersQuery } from "./admin.api";
import { Program, PopulatedRef, ApplicationStatus } from "@/lib/types";

const STATUS_OPTIONS: ApplicationStatus[] = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "DOCUMENTS_PENDING",
  "FACULTY_APPROVED",
  "FACULTY_REJECTED",
  "ADMIN_APPROVED",
  "ADMIN_REJECTED",
  "ADMISSION_CONFIRMED",
  "WITHDRAWN",
];

const ADMIN_DECISION_OPTIONS: ApplicationStatus[] = ["ADMIN_APPROVED", "ADMIN_REJECTED", "ADMISSION_CONFIRMED"];

function AssignFacultyCell({ applicationId, currentFacultyId }: { applicationId: string; currentFacultyId?: string }) {
  const { data: facultyList } = useAdminUsersQuery({ role: "FACULTY" });
  const assign = useAssignFacultyMutation();

  return (
    <select
      className="h-8 rounded-md border border-input bg-background px-2 text-xs"
      value={currentFacultyId ?? ""}
      onChange={(e) => e.target.value && assign.mutate({ id: applicationId, facultyId: e.target.value })}
    >
      <option value="">Unassigned</option>
      {facultyList?.users.map((f) => (
        <option key={f._id} value={f._id}>
          {f.name}
        </option>
      ))}
    </select>
  );
}

function DecisionCell({ applicationId }: { applicationId: string }) {
  const changeStatus = useAdminChangeApplicationStatusMutation();
  return (
    <select
      className="h-8 rounded-md border border-input bg-background px-2 text-xs"
      value=""
      onChange={(e) => e.target.value && changeStatus.mutate({ id: applicationId, status: e.target.value })}
    >
      <option value="">Set decision…</option>
      {ADMIN_DECISION_OPTIONS.map((s) => (
        <option key={s} value={s}>
          {s.replace(/_/g, " ")}
        </option>
      ))}
    </select>
  );
}

export default function ApplicationsManagementPage() {
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const { data, isLoading } = useAdminApplicationsQuery({ status: status || undefined, search: search || undefined });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Application Management</h1>
        <p className="text-muted-foreground">Assign reviewers and make final admission decisions.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search student" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
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
                  <th className="px-4 py-3">Assigned faculty</th>
                  <th className="px-4 py-3">Decision</th>
                  <th className="px-4 py-3 text-right">View</th>
                </tr>
              </thead>
              <tbody>
                {data?.applications.map((application) => {
                  const student = application.student as PopulatedRef;
                  const program = application.program as Program;
                  const faculty = application.assignedFaculty as PopulatedRef | undefined;
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
                      <td className="px-4 py-3">
                        <AssignFacultyCell applicationId={application._id} currentFacultyId={faculty?._id} />
                      </td>
                      <td className="px-4 py-3">
                        <DecisionCell applicationId={application._id} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/dashboard/review/${application._id}`}>
                            View <ArrowRight className="ml-1 h-3.5 w-3.5" />
                          </Link>
                        </Button>
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
