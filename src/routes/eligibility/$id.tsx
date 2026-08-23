import { useEffect, useState } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import {
  ShieldCheck,
  Building2,
  ChevronRight,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from "lucide-react";

import { AppLayout } from "@/components/layout/AppLayout";
import { useAppStore } from "@/state/app-store";
import { schemeService } from "@/services/schemeService";
import { eligibilityService } from "@/services/eligibilityService";
import { DEMO_PROFILE } from "@/services/profileService";
import { SCHEMES } from "@/data/schemes";
import { buildAssessment } from "@/lib/matching";
import type { Scheme, EligibilityAssessment } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { RequirementRow } from "@/components/common/RequirementRow";
import { EligibilityBadge } from "@/components/common/StatusBadge";
import { CardSkeleton } from "@/components/common/LoadingSkeleton";

export const Route = createFileRoute("/eligibility/$id")({
  loader: ({ params }) => {
    const id = params.id;
    const scheme = SCHEMES.find((s) => s.id === id) || SCHEMES[0]!;
    return { id, scheme };
  },
  component: EligibilityAssessmentPage,
});

function EligibilityAssessmentPage() {
  const loaderData = Route.useLoaderData();
  const id = loaderData?.id || "scheme-001";
  const { profile } = useAppStore();

  const activeScheme = loaderData?.scheme || SCHEMES.find((s) => s.id === id) || SCHEMES[0]!;
  const [scheme, setScheme] = useState<Scheme | null>(activeScheme);
  const [assessment, setAssessment] = useState<EligibilityAssessment | null>(
    activeScheme ? buildAssessment(profile || DEMO_PROFILE, activeScheme) : null
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const found = SCHEMES.find((s) => s.id === id) || SCHEMES[0]!;
    setScheme(found);
    if (found) {
      setAssessment(buildAssessment(profile || DEMO_PROFILE, found));
    }
  }, [id, profile]);

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <CardSkeleton className="h-48" />
          <CardSkeleton className="h-96" />
        </div>
      </AppLayout>
    );
  }

  if (!scheme || !assessment) {
    return (
      <AppLayout>
        <div className="surface-card p-12 text-center space-y-4 max-w-lg mx-auto mt-12">
          <h2 className="text-xl font-bold">Assessment Unavailable</h2>
          <p className="text-sm text-muted-foreground">
            Could not compute eligibility rules for scheme &ldquo;{id}&rdquo;.
          </p>
          <Button asChild>
            <Link to="/schemes">Back to Schemes</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <Link to="/schemes" className="hover:text-foreground">
            Schemes
          </Link>
          <ChevronRight className="size-3.5" />
          <Link to="/schemes/$id" params={{ id: scheme.id }} className="hover:text-foreground truncate max-w-xs">
            {scheme.name}
          </Link>
          <ChevronRight className="size-3.5" />
          <span className="text-foreground font-bold">Eligibility Check</span>
        </nav>

        {/* Header Hero Card */}
        <div className="surface-card p-6 sm:p-8 space-y-5 shadow-sm border-primary/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-teal uppercase tracking-wider">
                <ShieldCheck className="size-4" />
                <span>Eligibility Assessment Report</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                {scheme.name}
              </h1>
              <p className="text-xs text-muted-foreground">
                Comparing your configured citizen profile attributes against official scheme guidelines.
              </p>
            </div>

            <div className="shrink-0">
              <EligibilityBadge status={assessment.status} />
            </div>
          </div>

          {/* Quick Summary Pill Bar */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border text-center">
            <div className="rounded-xl bg-success-soft/40 p-3 space-y-0.5">
              <div className="flex items-center justify-center gap-1 text-success font-extrabold text-lg">
                <CheckCircle2 className="size-5" />
                <span>{assessment.matchedCount}</span>
              </div>
              <span className="text-[11px] font-bold text-success uppercase tracking-wider">
                Matched Criteria
              </span>
            </div>

            <div className="rounded-xl bg-warning-soft/40 p-3 space-y-0.5">
              <div className="flex items-center justify-center gap-1 text-warning-foreground font-extrabold text-lg">
                <AlertTriangle className="size-5" />
                <span>{assessment.verifyCount}</span>
              </div>
              <span className="text-[11px] font-bold text-warning-foreground uppercase tracking-wider">
                Requires Verification
              </span>
            </div>

            <div className="rounded-xl bg-destructive-soft/40 p-3 space-y-0.5">
              <div className="flex items-center justify-center gap-1 text-destructive font-extrabold text-lg">
                <XCircle className="size-5" />
                <span>{assessment.mismatchCount}</span>
              </div>
              <span className="text-[11px] font-bold text-destructive uppercase tracking-wider">
                Mismatches
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Criteria Breakdown Table */}
        <div className="surface-card p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground">Detailed Eligibility Criteria Breakdown</h2>
            <Link to="/profile" className="text-xs font-semibold text-primary hover:underline">
              Edit Profile Values →
            </Link>
          </div>

          {/* Table Header on desktop */}
          <div className="hidden sm:grid grid-cols-4 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground bg-muted/40 rounded-lg">
            <span>Criterion</span>
            <span>Required Guideline</span>
            <span>Your Profile Value</span>
            <span className="text-right">Match Status</span>
          </div>

          {/* Criteria Rows */}
          <div className="space-y-2.5">
            {assessment.criteria.map((factor, idx) => (
              <RequirementRow key={idx} factor={factor} />
            ))}
          </div>
        </div>

        {/* Important Notice Box */}
        <div className="rounded-2xl border border-border bg-muted/60 p-5 space-y-2 text-xs text-muted-foreground leading-relaxed">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <AlertTriangle className="size-4 text-warning-foreground" />
            <span>Official Disclaimer & Decision Support Policy</span>
          </div>
          <p>{assessment.note}</p>
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <Button asChild variant="outline" className="rounded-xl font-bold text-xs">
            <Link to="/schemes/$id" params={{ id: scheme.id }}>
              ← Return to Scheme Details
            </Link>
          </Button>

          <Button asChild size="lg" className="rounded-xl font-bold gap-2 shadow-sm">
            <a href={scheme.officialUrl} target="_blank" rel="noopener noreferrer">
              <span>Go to Official Application Portal</span>
              <ExternalLink className="size-4" />
            </a>
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
