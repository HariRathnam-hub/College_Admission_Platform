import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Send,
  MessageSquarePlus,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Inbox,
  ThumbsUp,
  ThumbsDown,
  MailPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ApplicationTimeline } from "@/components/shared/ApplicationTimeline";
import {
  useApplicationForReviewQuery,
  useClaimApplicationMutation,
  useChangeApplicationStatusMutation,
  useSubmitReviewMutation,
  useApplicationReviewsQuery,
  useRequestCorrectionMutation,
  useAddApplicationNoteMutation,
  useSendMessageMutation,
  useUpdateDocumentStatusMutation,
  useStudentProfileForStaffQuery,
} from "./faculty.api";
import { Program, ApplicationStatus, ApplicationDocument, PopulatedRef, ReviewRecommendation } from "@/lib/types";

const MANUAL_STATUS_OPTIONS: ApplicationStatus[] = ["UNDER_REVIEW", "DOCUMENTS_PENDING"];

export default function ApplicationReviewDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: application, isLoading } = useApplicationForReviewQuery(id);
  const claim = useClaimApplicationMutation(id ?? "");
  const changeStatus = useChangeApplicationStatusMutation(id ?? "");
  const submitReview = useSubmitReviewMutation(id ?? "");
  const { data: reviews } = useApplicationReviewsQuery(id);
  const requestCorrection = useRequestCorrectionMutation(id ?? "");
  const addNote = useAddApplicationNoteMutation(id ?? "");
  const sendMessage = useSendMessageMutation(id ?? "");
  const updateDocStatus = useUpdateDocumentStatusMutation(id ?? "");

  const student = application?.student as PopulatedRef | undefined;
  const { data: studentProfile } = useStudentProfileForStaffQuery(student?._id);

  const [nextStatus, setNextStatus] = useState<ApplicationStatus>("UNDER_REVIEW");
  const [statusNote, setStatusNote] = useState("");
  const [reviewComments, setReviewComments] = useState("");
  const [correctionNote, setCorrectionNote] = useState("");
  const [noteText, setNoteText] = useState("");
  const [messageText, setMessageText] = useState("");

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading application…</p>;
  if (!application || !id) return <p className="text-sm text-destructive">Application not found.</p>;

  const program = application.program as Program;
  const documents = application.documents as ApplicationDocument[];
  const assignedFaculty = application.assignedFaculty as PopulatedRef | undefined;

  const submitRecommendation = (recommendation: ReviewRecommendation) => {
    if (!reviewComments.trim()) return;
    submitReview.mutate({ recommendation, comments: reviewComments }, { onSuccess: () => setReviewComments("") });
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link to="/dashboard/review">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to review queue
        </Link>
      </Button>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{student?.name}</h1>
          <p className="text-muted-foreground">
            {student?.email} · {program?.name}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!assignedFaculty && (
            <Button size="sm" variant="outline" isLoading={claim.isPending} onClick={() => claim.mutate()}>
              <Inbox className="mr-2 h-4 w-4" /> Claim this application
            </Button>
          )}
          <StatusBadge status={application.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Applicant profile</CardTitle>
              <CardDescription>Personal and academic background on file.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="font-medium">{studentProfile?.phone ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Date of birth</p>
                <p className="font-medium">
                  {studentProfile?.dateOfBirth ? new Date(studentProfile.dateOfBirth).toLocaleDateString() : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">City</p>
                <p className="font-medium">{studentProfile?.address?.city ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Guardian</p>
                <p className="font-medium">{studentProfile?.guardianName ?? "—"}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Application details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="whitespace-pre-wrap text-muted-foreground">
                {application.personalStatement || "No personal statement provided."}
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div>
                  <p className="text-xs text-muted-foreground">10th %</p>
                  <p className="font-medium">{application.academicDetails?.tenthPercentage ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">12th %</p>
                  <p className="font-medium">{application.academicDetails?.twelfthPercentage ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Entrance exam</p>
                  <p className="font-medium">{application.academicDetails?.entranceExamName ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Score</p>
                  <p className="font-medium">{application.academicDetails?.entranceExamScore ?? "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>Verify or reject each submitted document.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {documents?.length === 0 && <p className="text-sm text-muted-foreground">No documents uploaded.</p>}
              {documents?.map((doc) => (
                <div key={doc._id} className="flex items-center justify-between rounded-md border p-3 text-sm">
                  <div>
                    <p className="font-medium">{doc.originalName}</p>
                    <p className="text-xs text-muted-foreground">
                      {doc.type.replace(/_/g, " ")} · {doc.status}
                      {doc.remarks ? ` · ${doc.remarks}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a href={doc.url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">
                      Preview
                    </a>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateDocStatus.mutate({ documentId: doc._id, status: "VERIFIED" })}
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        updateDocStatus.mutate({
                          documentId: doc._id,
                          status: "REJECTED",
                          rejectionReason: "Document unclear or invalid",
                        })
                      }
                    >
                      <XCircle className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Internal notes</CardTitle>
              <CardDescription>Visible to reviewers only, never to the student.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {application.officerNotes?.map((note, idx) => (
                <div key={idx} className="rounded-md bg-muted/40 p-3 text-sm">
                  <p>{note.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{new Date(note.createdAt).toLocaleString()}</p>
                </div>
              ))}
              <textarea
                className="min-h-[70px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Add an internal note…"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
              />
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                size="sm"
                disabled={!noteText.trim()}
                isLoading={addNote.isPending}
                onClick={() => addNote.mutate(noteText, { onSuccess: () => setNoteText("") })}
              >
                <MessageSquarePlus className="mr-2 h-4 w-4" /> Add note
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Message student</CardTitle>
              <CardDescription>Sends a notification directly to the applicant.</CardDescription>
            </CardHeader>
            <CardContent>
              <textarea
                className="min-h-[70px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Write a message the student will see…"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                size="sm"
                disabled={!messageText.trim()}
                isLoading={sendMessage.isPending}
                onClick={() => sendMessage.mutate(messageText, { onSuccess: () => setMessageText("") })}
              >
                <MailPlus className="mr-2 h-4 w-4" /> Send message
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recommendation</CardTitle>
              <CardDescription>Formally recommend approval or rejection.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <textarea
                className="min-h-[70px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Comments supporting your recommendation…"
                value={reviewComments}
                onChange={(e) => setReviewComments(e.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  disabled={!reviewComments.trim()}
                  isLoading={submitReview.isPending}
                  onClick={() => submitRecommendation("RECOMMEND_APPROVE")}
                >
                  <ThumbsUp className="mr-2 h-4 w-4" /> Approve
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  disabled={!reviewComments.trim()}
                  isLoading={submitReview.isPending}
                  onClick={() => submitRecommendation("RECOMMEND_REJECT")}
                >
                  <ThumbsDown className="mr-2 h-4 w-4" /> Reject
                </Button>
              </div>
              {reviews && reviews.length > 0 && (
                <div className="space-y-2 border-t pt-3">
                  {reviews.map((review) => {
                    const reviewer = review.reviewer as PopulatedRef;
                    return (
                      <div key={review._id} className="rounded-md bg-muted/40 p-2 text-xs">
                        <p className="font-medium">
                          {reviewer?.name} — {review.recommendation.replace("RECOMMEND_", "")}
                        </p>
                        <p className="text-muted-foreground">{review.comments}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Manual status</CardTitle>
              <CardDescription>For interim states outside a formal recommendation.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label>New status</Label>
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={nextStatus}
                  onChange={(e) => setNextStatus(e.target.value as ApplicationStatus)}
                >
                  {MANUAL_STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Note (optional)</Label>
                <textarea
                  className="min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                className="w-full"
                isLoading={changeStatus.isPending}
                onClick={() => changeStatus.mutate({ status: nextStatus, note: statusNote || undefined })}
              >
                <Send className="mr-2 h-4 w-4" /> Update status
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Request correction</CardTitle>
              <CardDescription>Sends the application back to draft for the student to fix.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <textarea
                className="min-h-[70px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="What needs to change?"
                value={correctionNote}
                onChange={(e) => setCorrectionNote(e.target.value)}
              />
              <Button
                variant="outline"
                className="w-full"
                disabled={!correctionNote.trim()}
                isLoading={requestCorrection.isPending}
                onClick={() => requestCorrection.mutate(correctionNote, { onSuccess: () => setCorrectionNote("") })}
              >
                <AlertTriangle className="mr-2 h-4 w-4" /> Request correction
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ApplicationTimeline history={application.statusHistory} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
