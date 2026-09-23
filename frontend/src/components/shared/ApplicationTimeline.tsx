import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusHistoryEntry } from "@/lib/types";
import { STATUS_LABELS } from "./StatusBadge";

export function ApplicationTimeline({ history }: { history: StatusHistoryEntry[] }) {
  if (history.length === 0) {
    return <p className="text-sm text-muted-foreground">No activity yet.</p>;
  }

  return (
    <ol className="relative space-y-6 border-l border-border pl-6">
      {history.map((entry, idx) => {
        const isLatest = idx === history.length - 1;
        return (
          <li key={`${entry.status}-${entry.changedAt}`} className="relative">
            <span
              className={cn(
                "absolute -left-[29px] flex h-5 w-5 items-center justify-center rounded-full border-2",
                isLatest ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"
              )}
            >
              {isLatest && <Check className="h-3 w-3" />}
            </span>
            <p className="text-sm font-medium">{STATUS_LABELS[entry.status] ?? entry.status.replace(/_/g, " ")}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(entry.changedAt).toLocaleString()}
            </p>
            {entry.note && <p className="mt-1 text-sm text-muted-foreground">{entry.note}</p>}
          </li>
        );
      })}
    </ol>
  );
}
