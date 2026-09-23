import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useFacultyDocumentsQuery } from "./faculty.api";
import { PopulatedRef } from "@/lib/types";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-600",
  VERIFIED: "bg-emerald-500/10 text-emerald-600",
  REJECTED: "bg-red-500/10 text-red-600",
};

export default function FacultyDocumentsPage() {
  const [status, setStatus] = useState("");
  const { data: documents, isLoading } = useFacultyDocumentsQuery({ status: status || undefined });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">Documents submitted across your assigned applications.</p>
        </div>
        <select
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="VERIFIED">Verified</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading && <p className="p-6 text-sm text-muted-foreground">Loading documents…</p>}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Document</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Preview</th>
                </tr>
              </thead>
              <tbody>
                {documents?.map((doc) => {
                  const owner = doc.owner as PopulatedRef | undefined;
                  return (
                    <tr key={doc._id} className="border-b last:border-0">
                      <td className="px-4 py-3">
                        <p className="font-medium">{owner?.name}</p>
                        <p className="text-xs text-muted-foreground">{owner?.email}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{doc.originalName}</td>
                      <td className="px-4 py-3 text-muted-foreground">{doc.type.toString().replace(/_/g, " ")}</td>
                      <td className="px-4 py-3">
                        <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", STATUS_STYLES[doc.status])}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <a href={doc.url} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                          View
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {documents?.length === 0 && <p className="p-6 text-sm text-muted-foreground">No documents found.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
