import { useState, useRef } from "react";
import {
  FileText,
  Upload,
  CheckCircle,
  AlertTriangle,
  Clock,
  Trash2,
  Eye,
  ShieldCheck,
  Building,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DocumentStatusBadge } from "./StatusBadge";
import { documentService } from "@/services/documentService";
import type { UserDocument } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface DocumentCardProps {
  doc: UserDocument;
  schemeCount: number;
  onUpdate: () => void;
}

export function DocumentCard({ doc, schemeCount, onUpdate }: DocumentCardProps) {
  const [uploading, setUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [simulatedOcr, setSimulatedOcr] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      toast.loading(`Uploading and processing ${doc.name}...`, { id: "upload-toast" });
      await documentService.upload(doc.name, file);
      
      // Simulate OCR extract
      const ocrResult = await documentService.extractDocumentData(doc.name, file);
      setSimulatedOcr(`Document metadata: ${ocrResult.extractedFields["fileName"]}, Status: ${ocrResult.verificationStatus}`);
      
      toast.success(`${doc.name} uploaded successfully!`, { id: "upload-toast" });
      onUpdate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed", { id: "upload-toast" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleVerify = async () => {
    try {
      await documentService.markVerified(doc.name);
      toast.success(`${doc.name} marked as verified.`);
      onUpdate();
    } catch {
      toast.error("Failed to verify document.");
    }
  };

  const handleRemove = async () => {
    try {
      await documentService.remove(doc.name);
      toast.success(`${doc.name} removed.`);
      onUpdate();
    } catch {
      toast.error("Failed to remove document.");
    }
  };

  return (
    <>
      <div className="surface-card p-5 flex flex-col justify-between hover:shadow-[var(--shadow-lift)] transition-all">
        <div>
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "grid size-11 shrink-0 place-items-center rounded-xl font-bold",
                  doc.status === "available"
                    ? "bg-success-soft text-success"
                    : doc.status === "needs-verification"
                      ? "bg-warning-soft text-warning-foreground"
                      : "bg-muted text-muted-foreground"
                )}
              >
                <FileText className="size-5.5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-foreground line-clamp-1">{doc.name}</h4>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Building className="size-3" />
                  Required by <strong className="text-foreground">{schemeCount}</strong> {schemeCount === 1 ? "scheme" : "schemes"}
                </p>
              </div>
            </div>
            <DocumentStatusBadge status={doc.status} />
          </div>

          {/* Details */}
          <div className="mt-4 pt-3 border-t border-border/60 space-y-1.5 text-xs text-muted-foreground">
            {doc.fileName ? (
              <div className="flex items-center justify-between">
                <span>File attached:</span>
                <span className="font-semibold text-foreground truncate max-w-[150px]">{doc.fileName}</span>
              </div>
            ) : null}
            {doc.uploadedAt ? (
              <div className="flex items-center justify-between">
                <span>Last updated:</span>
                <span className="font-medium text-foreground">{doc.uploadedAt}</span>
              </div>
            ) : null}
            {doc.expiresAt ? (
              <div className="flex items-center justify-between text-warning-foreground font-medium">
                <span>Valid until:</span>
                <span>{doc.expiresAt}</span>
              </div>
            ) : null}
            {doc.verified && (
              <div className="flex items-center gap-1.5 text-success font-semibold text-[11px] pt-1">
                <ShieldCheck className="size-3.5" />
                <span>Verified citizen credential</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 pt-3 border-t border-border flex flex-wrap items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
          />

          {doc.status === "missing" ? (
            <Button
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full rounded-xl text-xs font-semibold gap-1.5"
            >
              <Upload className="size-3.5" />
              <span>{uploading ? "Uploading..." : "Upload Document"}</span>
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewOpen(true)}
                className="flex-1 rounded-xl text-xs font-semibold gap-1"
              >
                <Eye className="size-3.5" />
                <span>View</span>
              </Button>
              {doc.status === "needs-verification" && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleVerify}
                  className="rounded-xl text-xs font-semibold text-teal gap-1 bg-teal-soft/60 hover:bg-teal-soft"
                >
                  <CheckCircle className="size-3.5" />
                  <span>Verify</span>
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemove}
                className="size-8 rounded-xl text-muted-foreground hover:text-destructive"
                title="Remove uploaded file"
              >
                <Trash2 className="size-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Document View / OCR Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="size-5 text-primary" />
              <span>{doc.name}</span>
            </DialogTitle>
            <DialogDescription>
              Local document preview and OCR extraction metadata.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="rounded-xl bg-muted p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Document Type:</span>
                <span className="font-semibold">{doc.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Attached File:</span>
                <span className="font-semibold">{doc.fileName || "None"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <DocumentStatusBadge status={doc.status} />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Uploaded:</span>
                <span>{doc.uploadedAt || "N/A"}</span>
              </div>
            </div>

            <div className="rounded-xl border border-teal/20 bg-teal-soft/30 p-3.5 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-teal">
                <Sparkles className="size-3.5" />
                <span>AI / OCR Extraction Preview</span>
              </div>
              <p className="text-muted-foreground">
                Document parsed with structured field recognition for automated government application filling.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
