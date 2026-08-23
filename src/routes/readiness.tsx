import { createFileRoute, Link } from "@tanstack/react-router";
import {
  PieChart,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  FileCheck2,
  Sparkles,
  ShieldCheck,
  Building,
  Upload,
} from "lucide-react";

import { AppLayout } from "@/components/layout/AppLayout";
import { useAppStore } from "@/state/app-store";
import { calculateOverallReadiness, calculateReadiness } from "@/lib/readiness";
import { DEMO_PROFILE } from "@/services/profileService";
import { SCHEMES } from "@/data/schemes";
import { ProgressRing } from "@/components/common/ProgressRing";
import { ScoreBar } from "@/components/common/MatchScore";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/readiness")({
  component: ReadinessDashboardPage,
});

function ReadinessDashboardPage() {
  const { profile, documents, savedIds } = useAppStore();

  const savedSchemes = SCHEMES.filter((s) => savedIds.includes(s.id));
  const activeSchemes = savedSchemes.length > 0 ? savedSchemes : SCHEMES.slice(0, 4);

  const activeProfile = profile || DEMO_PROFILE;
  const overall = calculateOverallReadiness(activeProfile, activeSchemes, documents);

  return (
    <AppLayout>
      <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in duration-300">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-teal">Application Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-1">
              Application Readiness Score
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Multi-factor assessment measuring how prepared you are to submit your official government applications.
            </p>
          </div>
        </div>

        {/* Hero Score Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Main Large Score Card (5 cols) */}
          <div className="lg:col-span-5 surface-card p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-5 shadow-sm border-primary/20 bg-card">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Overall Preparedness
            </span>
            <ProgressRing
              value={overall.readinessScore}
              size={180}
              thickness={14}
              tone={overall.readinessScore >= 80 ? "success" : "primary"}
              label="Ready"
            />
            <div className="space-y-1">
              <p className="text-lg font-extrabold text-foreground">
                {overall.readinessScore >= 80
                  ? "High Readiness Level"
                  : overall.readinessScore >= 50
                    ? "Moderate Readiness"
                    : "Action Needed Before Applying"}
              </p>
              <p className="text-xs text-muted-foreground max-w-xs">
                Derived from 40% eligibility rule match + 40% document availability + 20% document verification.
              </p>
            </div>
          </div>

          {/* Breakdown & Action List Card (7 cols) */}
          <div className="lg:col-span-7 surface-card p-6 sm:p-8 space-y-6 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground">Score Factor Breakdown</h2>
              <div className="mt-4 rounded-xl bg-muted/40 p-4 space-y-3.5">
                <ScoreBar label="Eligibility Rule Match (40% weight)" value={overall.eligibilityScore} />
                <ScoreBar label="Required Documents Available (40% weight)" value={overall.documentScore} />
                <ScoreBar label="Credential Verification (20% weight)" value={overall.verificationScore} />
              </div>
            </div>

            {/* Ready vs Action Needed Lists */}
            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2 rounded-xl bg-success-soft/30 border border-success/20 p-4 text-xs">
                <span className="font-bold text-success text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5" />
                  What Is Ready
                </span>
                <ul className="space-y-1.5 text-foreground font-medium">
                  <li>✓ Demographic profile complete</li>
                  <li>✓ Eligibility evaluated for {activeSchemes.length} schemes</li>
                  <li>✓ {overall.completedRequirements} requirements met</li>
                </ul>
              </div>

              <div className="space-y-2 rounded-xl bg-warning-soft/30 border border-warning/30 p-4 text-xs">
                <span className="font-bold text-warning-foreground text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="size-3.5" />
                  Action Needed
                </span>
                <ul className="space-y-1.5 text-foreground font-medium">
                  {overall.nextActions.slice(0, 3).map((act, idx) => (
                    <li key={idx}>⚠ {act}</li>
                  ))}
                </ul>
              </div>
            </div>

            <Button asChild size="lg" className="w-full rounded-xl font-bold gap-2">
              <Link to="/documents">
                <Upload className="size-4" />
                <span>Upload Remaining Documents</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Per-Scheme Readiness Cards */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Scheme-Specific Readiness</h2>
            <span className="text-xs text-muted-foreground font-semibold">
              Evaluating {activeSchemes.length} active schemes
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {activeSchemes.map((scheme) => {
              const res = calculateReadiness(activeProfile, scheme, documents);

              return (
                <div
                  key={scheme.id}
                  className="surface-card p-5 space-y-4 hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="rounded-full bg-teal-soft px-2.5 py-0.5 text-xs font-bold text-teal">
                          {scheme.category}
                        </span>
                        <h3 className="text-base font-bold text-foreground mt-1 line-clamp-1">
                          {scheme.name}
                        </h3>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xl font-black text-primary tabular-nums">{res.readinessScore}%</span>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Readiness</p>
                      </div>
                    </div>

                    <div className="rounded-xl bg-muted/40 p-3 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Documents Status:</span>
                        <span className="font-semibold text-foreground">
                          {res.completedRequirements}/{res.totalRequirements} Ready
                        </span>
                      </div>
                      {res.missingDocuments.length > 0 && (
                        <div className="flex justify-between text-warning-foreground font-semibold">
                          <span>Missing Document:</span>
                          <span className="truncate max-w-[150px]">{res.missingDocuments[0]}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                    <Button asChild size="sm" variant="outline" className="rounded-xl text-xs font-bold flex-1">
                      <Link to="/schemes/$id" params={{ id: scheme.id }}>
                        View Checklist
                      </Link>
                    </Button>
                    <Button asChild size="sm" className="rounded-xl text-xs font-bold flex-1">
                      <a href={scheme.officialUrl} target="_blank" rel="noopener noreferrer">
                        Apply Now →
                      </a>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
