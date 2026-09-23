import { useState } from "react";
import { useForm } from "react-hook-form";
import { Megaphone, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBroadcastNotificationMutation, useAdminUsersQuery } from "./admin.api";

interface BroadcastForm {
  title: string;
  message: string;
  targetRole: "ALL" | "STUDENT" | "FACULTY" | "ADMIN" | "SPECIFIC_STUDENT";
  studentId?: string;
}

export default function BroadcastNotificationsPage() {
  const broadcast = useBroadcastNotificationMutation();
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [studentSearch, setStudentSearch] = useState("");

  const { register, handleSubmit, reset, watch, formState } = useForm<BroadcastForm>({
    defaultValues: { targetRole: "ALL" },
  });

  const targetRole = watch("targetRole");
  const { data: studentResults } = useAdminUsersQuery({
    role: "STUDENT",
    search: studentSearch || undefined,
  });

  const onSubmit = async (values: BroadcastForm) => {
    setError(null);
    setResult(null);
    try {
      const res = await broadcast.mutateAsync(values);
      setResult(res.recipientCount);
      reset({ title: "", message: "", targetRole: values.targetRole });
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to send broadcast.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notification Management</h1>
        <p className="text-muted-foreground">Broadcast an announcement to a group, or message one student directly.</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Send notification</CardTitle>
          <CardDescription>Delivered as an in-app notification to every matching user.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" /> {error}
              </div>
            )}
            {result !== null && (
              <div className="flex items-center gap-2 rounded-md bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600">
                <CheckCircle2 className="h-4 w-4 shrink-0" /> Sent to {result} recipient{result === 1 ? "" : "s"}.
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="targetRole">Audience</Label>
              <select
                id="targetRole"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                {...register("targetRole")}
              >
                <option value="ALL">Everyone</option>
                <option value="STUDENT">All students</option>
                <option value="FACULTY">All faculty</option>
                <option value="ADMIN">Admins</option>
                <option value="SPECIFIC_STUDENT">A specific student</option>
              </select>
            </div>

            {targetRole === "SPECIFIC_STUDENT" && (
              <div className="space-y-2">
                <Label htmlFor="studentSearch">Find student</Label>
                <Input
                  id="studentSearch"
                  placeholder="Search by name or email"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                />
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  {...register("studentId", { required: targetRole === "SPECIFIC_STUDENT" })}
                >
                  <option value="">Select a student…</option>
                  {studentResults?.users.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} — {s.email}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register("title", { required: true })} placeholder="Scheduled maintenance" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <textarea
                id="message"
                className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Details for recipients…"
                {...register("message", { required: true })}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" isLoading={formState.isSubmitting}>
              <Megaphone className="mr-2 h-4 w-4" /> Send
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
