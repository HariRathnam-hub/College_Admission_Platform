import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ArrowLeft, Send, Save, AlertCircle, CheckCircle2, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ApplicationTimeline } from "@/components/shared/ApplicationTimeline";
import { DocumentUploader } from "@/components/shared/DocumentUploader";
import {
  useApplicationQuery,
  useUpdateApplicationMutation,
  useSubmitApplicationMutation,
  useWithdrawApplicationMutation,
} from "./applications.api";
import { Program, ApplicationStatus } from "@/lib/types";

const WITHDRAWABLE_STATUSES: ApplicationStatus[] = ["SUBMITTED", "UNDER_REVIEW", "DOCUMENTS_PENDING", "FACULTY_APPROVED"];

interface DraftForm {
  personalStatement: string;
  tenthPercentage?: number;
  twelfthPercentage?: number;
  entranceExamName?: string;
  entranceExamScore?: number;
}

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: application, isLoading } = useApplicationQuery(id);
  const updateMutation = useUpdateApplicationMutation(id ?? "");
  const submitMutation = useSubmitApplicationMutation(id ?? "");
  const withdrawMutation = useWithdrawApplicationMutation(id ?? "");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  const [withdrawReason, setWithdrawReason] = useState("");

  const { register, handleSubmit, reset } = useForm<DraftForm>();

  useEffect(() => {
    if (application) {
      reset({
        personalStatement: application.personalStatement ?? "",
        tenthPercentage: application.academicDetails?.tenthPercentage,
        twelfthPercentage: application.academicDetails?.twelfthPercentage,
        entranceExamName: application.academicDetails?.entranceExamName,
        entranceExamScore: application.academicDetails?.entranceExamScore,
      });
    }
  }, [application, reset]);

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading application…</p>;
  if (!application || !id) return <p className="text-sm text-destructive">Application not found.</p>;

  const program = application.program as Program;
  const isDraft = application.status === "DRAFT";

  const onSaveDraft = async (values: DraftForm) => {
    await updateMutation.mutateAsync({
      personalStatement: values.personalStatement,
      academicDetails: {
        tenthPercentage: values.tenthPercentage ? Number(values.tenthPercentage) : undefined,
        twelfthPercentage: values.twelfthPercentage ? Number(values.twelfthPercentage) : undefined,
        entranceExamName: values.entranceExamName || undefined,
        entranceExamScore: values.entranceExamScore ? Number(values.entranceExamScore) : undefined,
      },
    });
    setSavedAt(new Date());
  };

  const onSubmitApplication = async () => {
    setSubmitError(null);
    try {
      await submitMutation.mutateAsync();
    } catch (error: any) {
      setSubmitError(error?.response?.data?.message ?? "Failed to submit application.");
    }
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link to="/dashboard/applications">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to applications
        </Link>
      </Button>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{program?.name}</h1>
          <p className="text-muted-foreground">{program?.department}</p>
        </div>
        <StatusBadge status={application.status} />
      </div>

      {application.correctionRequested && (
        <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-400">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">Correction requested</p>
            <p>{application.correctionRequested}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Application details</CardTitle>
              <CardDescription>
                {isDraft ? "Fill in your details and save your progress." : "Submitted details (read-only)."}
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSaveDraft)}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="personalStatement">Personal statement</Label>
                  <textarea
                    id="personalStatement"
                    disabled={!isDraft}
                    className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                    placeholder="Tell us why you're a great fit for this program…"
                    {...register("personalStatement")}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tenthPercentage">10th percentage</Label>
                    <Input id="tenthPercentage" type="number" step="0.01" disabled={!isDraft} {...register("tenthPercentage")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twelfthPercentage">12th percentage</Label>
                    <Input id="twelfthPercentage" type="number" step="0.01" disabled={!isDraft} {...register("twelfthPercentage")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="entranceExamName">Entrance exam</Label>
                    <Input id="entranceExamName" disabled={!isDraft} {...register("entranceExamName")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="entranceExamScore">Exam score</Label>
                    <Input id="entranceExamScore" type="number" step="0.01" disabled={!isDraft} {...register("entranceExamScore")} />
                  </div>
                </div>
              </CardContent>
              {isDraft && (
                <CardFooter className="flex items-center gap-3">
                  <Button type="submit" variant="outline" isLoading={updateMutation.isPending}>
                    <Save className="mr-2 h-4 w-4" /> Save draft
                  </Button>
                  {savedAt && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Saved {savedAt.toLocaleTimeString()}
                    </span>
                  )}
                </CardFooter>
              )}
            </form>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>Upload the required documents for this application.</CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentUploader applicationId={id} editable={isDraft} />
            </CardContent>
          </Card>

          {isDraft && (
            <Card>
              <CardHeader>
                <CardTitle>Ready to submit?</CardTitle>
                <CardDescription>
                  Once submitted, you won&apos;t be able to edit your details directly — you can request a
                  correction if needed.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {submitError && (
                  <div className="mb-3 flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" /> {submitError}
                  </div>
                )}
                <Button onClick={onSubmitApplication} isLoading={submitMutation.isPending}>
                  <Send className="mr-2 h-4 w-4" /> Submit application
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
              <CardDescription>Track the status of your application.</CardDescription>
            </CardHeader>
            <CardContent>
              <ApplicationTimeline history={application.statusHistory} />
            </CardContent>
          </Card>

          {WITHDRAWABLE_STATUSES.includes(application.status) && (
            <Card>
              <CardHeader>
                <CardTitle>Withdraw application</CardTitle>
                <CardDescription>This cannot be undone. You'll need to reapply if you change your mind.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {showWithdrawConfirm && (
                  <textarea
                    className="min-h-[70px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Reason (optional)"
                    value={withdrawReason}
                    onChange={(e) => setWithdrawReason(e.target.value)}
                  />
                )}
              </CardContent>
              <CardFooter className="gap-2">
                {!showWithdrawConfirm ? (
                  <Button variant="outline" size="sm" onClick={() => setShowWithdrawConfirm(true)}>
                    <Ban className="mr-2 h-4 w-4" /> Withdraw
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="destructive"
                      size="sm"
                      isLoading={withdrawMutation.isPending}
                      onClick={() => withdrawMutation.mutate(withdrawReason || undefined)}
                    >
                      Confirm withdrawal
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setShowWithdrawConfirm(false)}>
                      Cancel
                    </Button>
                  </>
                )}
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
