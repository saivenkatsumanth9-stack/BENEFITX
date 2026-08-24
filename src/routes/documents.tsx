import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

import { AppLayout } from "@/components/layout/AppLayout";
import { useAppStore } from "@/state/app-store";
import { DOCUMENT_CATALOG } from "@/data/documents";
import { SCHEMES } from "@/data/schemes";
import type { UserDocument, DocumentStatus } from "@/lib/types";
import { DocumentCard } from "@/components/common/DocumentCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
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

  // Calculate how many schemes require each document
  const getSchemeCountForDoc = (docName: string) => {
    return SCHEMES.filter((s) => s.requiredDocuments.includes(docName)).length;
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Citizen Document Locker
              </span>
              <span className="text-muted-foreground text-xs">·</span>
              <span className="text-xs font-semibold text-primary">
                {availableCount} of {mergedDocuments.length} Verified
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              My Documents & Certificates
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Manage your identity and eligibility certificates to establish high document readiness across government schemes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadDemoProfile}
              className="h-8 rounded-lg text-xs font-semibold gap-1.5 border-border bg-card"
            >
              <Sparkles className="size-3.5 text-primary" />
              <span>Load Sample Documents</span>
            </Button>
          </div>
        </div>

        {/* 3 Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <MetricCard
            icon={CheckCircle2}
            value={availableCount}
            label="Verified Documents"
            hint="Ready for portal submission"
            tone="success"
          />
          <MetricCard
            icon={AlertTriangle}
            value={verifyCount}
            label="Pending Verification"
            hint="Uploaded, needs self-check"
            tone="warning"
          />
          <MetricCard
            icon={FileText}
            value={missingCount}
            label="Missing Certificates"
            hint="Required by target schemes"
            tone="primary"
          />
        </div>

        {/* Tabs Filter */}
        <div className="space-y-4">
          <Tabs value={filterTab} onValueChange={(val) => setFilterTab(val as never)}>
            <TabsList className="h-10 p-1 bg-muted rounded-lg border border-border">
              <TabsTrigger value="all" className="text-xs font-semibold rounded-md px-3">
                All ({mergedDocuments.length})
              </TabsTrigger>
              <TabsTrigger value="available" className="text-xs font-semibold rounded-md px-3">
                Verified ({availableCount})
              </TabsTrigger>
              <TabsTrigger value="needs-verification" className="text-xs font-semibold rounded-md px-3">
                Needs Verification ({verifyCount})
              </TabsTrigger>
              <TabsTrigger value="missing" className="text-xs font-semibold rounded-md px-3">
                Missing ({missingCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={filterTab} className="pt-4">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredDocs.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    doc={doc}
                    schemeCount={getSchemeCountForDoc(doc.name)}
                    onUpdate={refreshDocuments}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}
