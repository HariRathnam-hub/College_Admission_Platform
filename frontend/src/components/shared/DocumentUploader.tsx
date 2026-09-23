import { useRef, useState } from "react";
import { FileText, Upload, RefreshCw, Trash2, CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ApplicationDocument } from "@/lib/types";
import {
  useApplicationDocumentsQuery,
  useUploadDocumentMutation,
  useReplaceDocumentMutation,
  useDeleteDocumentMutation,
} from "@/features/documents/documents.api";

// The four documents every applicant must provide before they can submit.
const REQUIRED_DOCUMENT_TYPES = [
  { value: "AADHAAR_CARD", label: "Aadhaar Card" },
  { value: "TENTH_MARKSHEET", label: "10th Marksheet" },
  { value: "TWELFTH_MARKSHEET", label: "12th Marksheet" },
  { value: "TRANSFER_CERTIFICATE", label: "Transfer Certificate" },
];

const OPTIONAL_DOCUMENT_TYPES = [
  { value: "PASSPORT_PHOTO", label: "Passport Photo" },
  { value: "COMMUNITY_CERTIFICATE", label: "Community Certificate" },
  { value: "INCOME_CERTIFICATE", label: "Income Certificate" },
  { value: "SIGNATURE", label: "Signature" },
  { value: "ENTRANCE_SCORECARD", label: "Entrance Scorecard" },
  { value: "OTHER", label: "Other" },
];

const STATUS_ICON = {
  PENDING: Clock,
  VERIFIED: CheckCircle2,
  REJECTED: XCircle,
};

function DocumentSlot({
  type,
  label,
  required,
  document,
  editable,
  onUpload,
  onReplace,
  onDelete,
  isUploading,
}: {
  type: string;
  label: string;
  required: boolean;
  document?: ApplicationDocument;
  editable: boolean;
  onUpload: (type: string) => void;
  onReplace: (documentId: string) => void;
  onDelete: (documentId: string) => void;
  isUploading: boolean;
}) {
  const StatusIcon = document ? STATUS_ICON[document.status] : null;

  return (
    <div
      className={cn(
        "rounded-md border p-3 text-sm",
        !document && required && "border-amber-500/40 bg-amber-500/5"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-1 font-medium">
          {label}
          {required && <span className="text-destructive">*</span>}
        </p>
        {!document && required && <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />}
      </div>

      {document ? (
        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <FileText className="h-4 w-4 shrink-0 text-primary" />
            <span className="truncate text-xs text-muted-foreground">{document.originalName}</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "flex items-center gap-1 text-xs",
                document.status === "VERIFIED" && "text-emerald-600",
                document.status === "REJECTED" && "text-red-600",
                document.status === "PENDING" && "text-amber-600"
              )}
            >
              {StatusIcon && <StatusIcon className="h-3.5 w-3.5" />} {document.status}
            </span>
            <a href={document.url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">
              Preview
            </a>
            {editable && (
              <>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => onReplace(document._id)}
                  aria-label={`Replace ${label}`}
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => onDelete(document._id)}
                  aria-label={`Delete ${label}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      ) : editable ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2 w-full"
          isLoading={isUploading}
          onClick={() => onUpload(type)}
        >
          <Upload className="mr-2 h-4 w-4" /> Upload
        </Button>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground">Not uploaded</p>
      )}
    </div>
  );
}

export function DocumentUploader({ applicationId, editable }: { applicationId: string; editable: boolean }) {
  const { data: documents, isLoading } = useApplicationDocumentsQuery(applicationId);
  const uploadMutation = useUploadDocumentMutation(applicationId);
  const replaceMutation = useReplaceDocumentMutation(applicationId);
  const deleteMutation = useDeleteDocumentMutation(applicationId);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingTypeRef = useRef<string | null>(null);
  const pendingReplaceIdRef = useRef<string | null>(null);

  const [activeUploadType, setActiveUploadType] = useState<string | null>(null);

  const byType = (type: string) => documents?.find((doc) => doc.type === type);

  const startUpload = (type: string) => {
    pendingTypeRef.current = type;
    pendingReplaceIdRef.current = null;
    setActiveUploadType(type);
    fileInputRef.current?.click();
  };

  const startReplace = (documentId: string) => {
    pendingTypeRef.current = null;
    pendingReplaceIdRef.current = documentId;
    setActiveUploadType(documentId);
    fileInputRef.current?.click();
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    setActiveUploadType(null);
    if (!file) return;

    if (pendingReplaceIdRef.current) {
      replaceMutation.mutate({ documentId: pendingReplaceIdRef.current, file });
    } else if (pendingTypeRef.current) {
      uploadMutation.mutate({ file, type: pendingTypeRef.current });
    }
  };

  const requiredMissingCount = REQUIRED_DOCUMENT_TYPES.filter((t) => !byType(t.value)).length;

  return (
    <div className="space-y-5">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        onChange={handleFileSelected}
      />

      {editable && requiredMissingCount > 0 && (
        <div className="flex items-center gap-2 rounded-md bg-amber-500/10 px-3 py-2 text-xs text-amber-600 dark:text-amber-400">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {requiredMissingCount} required document{requiredMissingCount === 1 ? "" : "s"} still needed before you can
          submit.
        </div>
      )}

      {isLoading && <p className="text-sm text-muted-foreground">Loading documents…</p>}

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Required documents</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {REQUIRED_DOCUMENT_TYPES.map((t) => (
            <DocumentSlot
              key={t.value}
              type={t.value}
              label={t.label}
              required
              document={byType(t.value)}
              editable={editable}
              onUpload={startUpload}
              onReplace={startReplace}
              onDelete={(id) => deleteMutation.mutate(id)}
              isUploading={(uploadMutation.isPending || replaceMutation.isPending) && activeUploadType === t.value}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Additional documents (optional)
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {OPTIONAL_DOCUMENT_TYPES.map((t) => (
            <DocumentSlot
              key={t.value}
              type={t.value}
              label={t.label}
              required={false}
              document={byType(t.value)}
              editable={editable}
              onUpload={startUpload}
              onReplace={startReplace}
              onDelete={(id) => deleteMutation.mutate(id)}
              isUploading={(uploadMutation.isPending || replaceMutation.isPending) && activeUploadType === t.value}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
