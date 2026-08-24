import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
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
      <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Application Intelligence
              </span>
              <span className="text-muted-foreground text-xs">·</span>
              <span className="text-xs font-semibold text-primary">
                Readiness Index
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              Application Readiness Score
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Multi-factor assessment measuring how prepared you are to submit your official government applications.
            </p>
          </div>
        </div>

        {/* Hero Score Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Main Large Score Card (5 cols) */}
          <div className="lg:col-span-5 surface-card p-6 sm:p-7 flex flex-col items-center justify-center text-center space-y-4 bg-card border-border">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Overall Preparedness Score
            </span>
            <ProgressRing
              value={overall.readinessScore}
              size={150}
              thickness={12}
              tone={overall.readinessScore >= 80 ? "success" : "primary"}
              label="Ready"
            />
            <div className="space-y-1">
              <p className="text-base font-bold text-foreground">
                {overall.readinessScore >= 80
                  ? "High Readiness Level"
                  : overall.readinessScore >= 50
                    ? "Moderate Readiness"
                    : "Action Needed Before Applying"}
              </p>
              <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                Evaluated from 40% criteria match + 40% document availability + 20% verification status.
              </p>
            </div>
          </div>

          {/* Breakdown Card (7 cols) */}
          <div className="lg:col-span-7 surface-card p-6 space-y-5 bg-card border-border flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-bold text-foreground">Score Factor Breakdown</h2>
              <div className="mt-3 rounded-lg bg-muted/40 p-4 space-y-3">
                <ScoreBar label="Eligibility Rule Match (40% weight)" value={overall.eligibilityScore} />
                <ScoreBar label="Required Documents Available (40% weight)" value={overall.documentScore} />
                <ScoreBar label="Credential Verification (20% weight)" value={overall.verificationScore} />
              </div>
            </div>

            {/* Ready vs Action Needed Lists */}
            <div className="grid sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1.5 rounded-lg bg-success-soft/30 border border-success/20 p-3.5 text-xs">
                <span className="font-bold text-success text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5" />
                  Prerequisites Met
                </span>
                <ul className="space-y-1 text-foreground">
                  <li className="flex items-center gap-1.5 text-[11px]">
                    <span className="text-success font-bold">✓</span>
                    <span>{overall.completedRequirements} of {overall.totalRequirements} criteria fulfilled</span>
                  </li>
                  <li className="flex items-center gap-1.5 text-[11px]">
                    <span className="text-success font-bold">✓</span>
                    <span>Profile demographic details verified</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-1.5 rounded-lg bg-warning-soft/30 border border-warning/20 p-3.5 text-xs">
                <span className="font-bold text-warning-foreground text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="size-3.5" />
                  Recommended Actions
                </span>
                <ul className="space-y-1 text-foreground">
                  {overall.nextActions.slice(0, 2).map((item, i) => (
                    <li key={i} className="flex items-center gap-1.5 text-[11px]">
                      <span className="text-warning-foreground font-bold">!</span>
                      <span className="truncate">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Scheme Readiness Cards List */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground">Scheme-Specific Readiness</h2>
              <p className="text-xs text-muted-foreground">
                Document and eligibility status evaluated per individual welfare scheme.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {activeSchemes.map((scheme) => {
              const r = calculateReadiness(activeProfile, scheme, documents);
              return (
                <div
                  key={scheme.id}
                  className="surface-card p-5 space-y-3 bg-card border-border flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="rounded bg-primary-soft px-2 py-0.5 text-primary text-[10px] font-bold">
                        {scheme.category}
                      </span>
                      <span className="text-foreground font-bold">{r.readinessScore}% Ready</span>
                    </div>
                    <h3 className="text-sm font-bold text-foreground">
                      <Link to="/schemes/$id" params={{ id: scheme.id }} className="hover:text-primary transition-colors">
                        {scheme.name}
                      </Link>
                    </h3>
                  </div>

                  <div className="space-y-2 text-xs">
                    <ScoreBar label="Readiness" value={r.readinessScore} />
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                      <span>{r.completedRequirements} of {r.totalRequirements} requirements ready</span>
                      <span>{r.missingDocuments.length} missing docs</span>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button asChild size="sm" variant="outline" className="h-7 text-xs font-medium">
                      <Link to="/schemes/$id" params={{ id: scheme.id }}>
                        <span>Scheme Details</span>
                        <ArrowRight className="size-3 ml-1" />
                      </Link>
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
