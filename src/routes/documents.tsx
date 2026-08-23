import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Clock,
  Sparkles,
  Plus,
} from "lucide-react";

import { AppLayout } from "@/components/layout/AppLayout";
import { useAppStore } from "@/state/app-store";
import { documentService } from "@/services/documentService";
import { DOCUMENT_CATALOG } from "@/data/documents";
import type { UserDocument, DocumentStatus } from "@/lib/types";
import { DocumentCard } from "@/components/common/DocumentCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import { MetricCard } from "@/components/common/MetricCard";

export const Route = createFileRoute("/documents")({
  component: DocumentsCenterPage,
});

function DocumentsCenterPage() {
  const { documents, refreshDocuments, loadDemoProfile } = useAppStore();
  const [filterTab, setFilterTab] = useState<"all" | "available" | "needs-verification" | "missing">("all");

  useEffect(() => {
    refreshDocuments();
  }, [refreshDocuments]);

  // Merge known user documents with standard catalog if missing
  const allKnownDocNames = Array.from(
    new Set([
      ...documents.map((d) => d.name),
      ...DOCUMENT_CATALOG.slice(0, 10),
    ])
  );

  const mergedDocuments: UserDocument[] = allKnownDocNames.map((name) => {
    const existing = documents.find((d) => d.name === name);
    if (existing) return existing;
    return {
      id: `doc-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      name,
      status: "missing" as DocumentStatus,
      verified: false,
    };
  });

  const availableCount = mergedDocuments.filter((d) => d.status === "available").length;
  const verifyCount = mergedDocuments.filter((d) => d.status === "needs-verification").length;
  const missingCount = mergedDocuments.filter((d) => d.status === "missing").length;

  const filteredDocs = mergedDocuments.filter((d) => {
    if (filterTab === "available") return d.status === "available";
    if (filterTab === "needs-verification") return d.status === "needs-verification";
    if (filterTab === "missing") return d.status === "missing";
    return true;
  });

  return (
    <AppLayout>
      <div className="space-y-8 animate-in fade-in duration-300">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-teal">Citizen Locker</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-1">
              My Documents & Certificates
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your uploaded credentials to boost your Application Readiness Score across all government schemes.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={loadDemoProfile}
              className="rounded-xl text-xs font-bold gap-1 text-teal border-teal/30 bg-teal-soft/40 hover:bg-teal-soft"
            >
              <Sparkles className="size-3.5 text-teal" />
              <span>Load Demo Documents</span>
            </Button>
          </div>
        </div>

        {/* 3 Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricCard
            icon={CheckCircle2}
            value={availableCount}
            label="Available & Ready"
            hint="Valid certificates on record"
            tone="success"
          />
          <MetricCard
            icon={AlertTriangle}
            value={verifyCount}
            label="Needs Verification"
            hint="Uploaded, pending self-verification"
            tone="saffron"
          />
          <MetricCard
            icon={FileText}
            value={missingCount}
            label="Missing Requirements"
            hint="Required for certain schemes"
            tone="primary"
          />
        </div>

        {/* Tabs Filter */}
        <div className="space-y-4">
          <Tabs value={filterTab} onValueChange={(val) => setFilterTab(val as never)}>
            <TabsList className="rounded-xl h-11 p-1 bg-muted">
              <TabsTrigger value="all" className="rounded-lg text-xs font-bold px-4">
                All Documents ({mergedDocuments.length})
              </TabsTrigger>
              <TabsTrigger value="available" className="rounded-lg text-xs font-bold px-4 gap-1.5">
                <CheckCircle2 className="size-3 text-success" />
                <span>Available ({availableCount})</span>
              </TabsTrigger>
              <TabsTrigger value="needs-verification" className="rounded-lg text-xs font-bold px-4 gap-1.5">
                <AlertTriangle className="size-3 text-warning-foreground" />
                <span>Needs Verification ({verifyCount})</span>
              </TabsTrigger>
              <TabsTrigger value="missing" className="rounded-lg text-xs font-bold px-4 gap-1.5">
                <FileText className="size-3 text-destructive" />
                <span>Missing ({missingCount})</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Documents Grid */}
          {filteredDocs.length === 0 ? (
            <EmptyState
              icon={FileCheck2}
              title="No documents in this view"
              description="Switch tabs or upload a certificate to see it here."
            />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
              {filteredDocs.map((doc) => (
                <DocumentCard
                  key={doc.name}
                  doc={doc}
                  schemeCount={documentService.schemeCountFor(doc.name)}
                  onUpdate={refreshDocuments}
                />
              ))}
            </div>
          )}
        </div>

        {/* Privacy Note */}
        <div className="rounded-2xl border border-border bg-muted/40 p-4 text-xs text-muted-foreground leading-relaxed flex items-center gap-3">
          <FileText className="size-5 text-primary shrink-0" />
          <p>
            <strong>Local Storage Guarantee:</strong> Uploaded document files are stored locally in your browser memory for demo purposes. They are never transmitted to external servers.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
