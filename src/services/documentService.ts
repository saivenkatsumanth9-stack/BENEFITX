import { DEMO_DOCUMENTS } from "@/data/documents";
import { SCHEMES } from "@/data/schemes";
import { delay, readStore, writeStore } from "@/lib/storage";
import type { ExtractedDocumentData, UserDocument } from "@/lib/types";

const KEY = "documents";

/**
 * MOCK document service.
 * Files are never uploaded anywhere — only the file name is kept locally
 * so the demo can show status changes. Connect a real storage/OCR backend here.
 */
export const documentService = {
  async getDocuments(): Promise<UserDocument[]> {
    await delay(150);
    return readStore<UserDocument[]>(KEY, []);
  },

  async setDocuments(docs: UserDocument[]): Promise<UserDocument[]> {
    writeStore(KEY, docs);
    await delay(60);
    return docs;
  },

  async loadDemoDocuments(): Promise<UserDocument[]> {
    return documentService.setDocuments(DEMO_DOCUMENTS.map((d) => ({ ...d })));
  },

  async upload(documentName: string, file: File): Promise<UserDocument> {
    await delay(700);
    if (file.size === 0) throw new Error("The selected file appears to be empty.");
    if (file.size > 8 * 1024 * 1024) throw new Error("File is larger than the 8 MB demo limit.");

    const docs = readStore<UserDocument[]>(KEY, []);
    const existing = docs.find((d) => d.name === documentName);
    const updated: UserDocument = {
      id: existing?.id ?? `doc-${documentName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      name: documentName,
      status: "needs-verification",
      fileName: file.name,
      uploadedAt: new Date().toISOString().slice(0, 10),
      verified: false,
      expiresAt: existing?.expiresAt,
    };
    const next = existing
      ? docs.map((d) => (d.name === documentName ? updated : d))
      : [...docs, updated];
    writeStore(KEY, next);
    return updated;
  },

  async markVerified(documentName: string): Promise<UserDocument[]> {
    await delay(250);
    const next = readStore<UserDocument[]>(KEY, []).map((d) =>
      d.name === documentName ? { ...d, status: "available" as const, verified: true } : d,
    );
    writeStore(KEY, next);
    return next;
  },

  async remove(documentName: string): Promise<UserDocument[]> {
    await delay(120);
    const next = readStore<UserDocument[]>(KEY, []).map((d) =>
      d.name === documentName
        ? { ...d, status: "missing" as const, verified: false, fileName: undefined, uploadedAt: undefined }
        : d,
    );
    writeStore(KEY, next);
    return next;
  },

  /**
   * OCR INTEGRATION PLACEHOLDER.
   * Returns simulated extraction output only — no authenticity verification
   * is performed in this prototype.
   */
  async extractDocumentData(documentName: string, file: File): Promise<ExtractedDocumentData> {
    await delay(900);
    return {
      documentType: documentName,
      extractedFields: {
        fileName: file.name,
        detectedType: documentName,
        pages: "1",
      },
      confidence: "medium",
      verificationStatus: "pending-review",
    };
  },

  /** How many schemes in the catalog ask for this document. */
  schemeCountFor(documentName: string): number {
    return SCHEMES.filter(
      (s) =>
        s.requiredDocuments.includes(documentName) ||
        (s.optionalDocuments ?? []).includes(documentName),
    ).length;
  },
};
