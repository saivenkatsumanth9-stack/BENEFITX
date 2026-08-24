import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Compass,
  FileCheck2,
  PieChart,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  SendHorizontal,
  Bookmark,
  Calendar,
  Building2,
  Clock,
  Sparkles,
  UserCheck,
} from "lucide-react";

import { AppLayout } from "@/components/layout/AppLayout";
import { useAppStore } from "@/state/app-store";
import { recommendationService } from "@/services/recommendationService";
import { DEMO_PROFILE } from "@/services/profileService";
import { SCHEMES } from "@/data/schemes";
import type { Recommendation, UserDocument } from "@/lib/types";
import { MetricCard } from "@/components/common/MetricCard";
import { SchemeCard } from "@/components/schemes/SchemeCard";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import { CardSkeleton } from "@/components/common/LoadingSkeleton";
import { MatchScore } from "@/components/common/MatchScore";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { profile, documents, savedIds, applications, toggleSaved, loadDemoProfile } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      setLoading(true);
      const activeProfile = profile || DEMO_PROFILE;
      try {
        const recs = await recommendationService.getRecommendations(activeProfile, documents);
        if (cancelled) return;
        setRecommendations(recs);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadData();
    return () => {
      cancelled = true;
    };
  }, [profile, documents]);

  const activeProfile = profile || DEMO_PROFILE;
  const userName = activeProfile.name ? activeProfile.name.split(" ")[0] : "Citizen";
  const userState = activeProfile.state || "All India";

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  // Calculate high-value overview counts
  const potentialMatchesCount = recommendations.length;
  const activeAppsCount = applications.length;
  const missingDocsCount = documents.filter((d) => d.status === "missing").length;

  // Calculate upcoming deadlines (within 30 days)
  const now = new Date();
  const closingSoonSchemes = SCHEMES.filter((s) => {
    if (!s.deadline) return false;
    const diffDays = Math.ceil((new Date(s.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 30;
  });

  const urgentScheme = closingSoonSchemes[0];

  return (
    <AppLayout>
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Top Header: Greeting & Context */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Citizen Welfare Dashboard
              </span>
              <span className="text-muted-foreground text-xs">·</span>
              <span className="text-xs font-semibold text-primary">{userState}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              {greeting}, {userName}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Here are the government welfare schemes and benefit opportunities relevant to your profile.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!profile && (
              <Button
                variant="outline"
                size="sm"
                onClick={loadDemoProfile}
                className="h-8 rounded-lg text-xs font-semibold gap-1.5 border-border bg-card"
              >
                <UserCheck className="size-3.5 text-primary" />
                <span>Load Sample Profile</span>
              </Button>
            )}
            <Button asChild size="sm" className="h-8 rounded-lg text-xs font-semibold gap-1.5 bg-primary text-primary-foreground">
              <Link to="/recommendations">
                <span>View All Matches</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* 4 High-Value KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <MetricCard
            icon={Sparkles}
            value={potentialMatchesCount}
            label="Potential Matches"
            hint="Based on profile criteria"
            tone="primary"
          />
          <MetricCard
            icon={SendHorizontal}
            value={activeAppsCount}
            label="Active Applications"
            hint={activeAppsCount > 0 ? "Tracked in submission pipeline" : "No applications submitted yet"}
            tone="teal"
          />
          <MetricCard
            icon={FileCheck2}
            value={missingDocsCount}
            label="Documents Missing"
            hint={missingDocsCount > 0 ? "Required for target schemes" : "All required documents on file"}
            tone={missingDocsCount > 0 ? "warning" : "success"}
          />
          <MetricCard
            icon={Calendar}
            value={closingSoonSchemes.length}
            label="Deadlines This Month"
            hint={closingSoonSchemes.length > 0 ? "Upcoming closing windows" : "No immediate deadlines"}
            tone={closingSoonSchemes.length > 0 ? "warning" : "primary"}
          />
        </div>

        {/* Urgent Action Banner (if urgent deadline exists) */}
        {urgentScheme && (
          <div className="rounded-lg border border-warning/30 bg-warning-soft/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-md bg-warning-soft text-warning-foreground mt-0.5">
                <Clock className="size-4" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-warning-foreground">
                    Action Required · Closing Soon
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground">
                    Deadline: {urgentScheme.deadline}
                  </span>
                </div>
                <p className="text-sm font-bold text-foreground mt-0.5">
                  {urgentScheme.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Your profile is a strong candidate. Review required documents and apply on the official portal before the window closes.
                </p>
              </div>
            </div>
            <Button asChild size="sm" className="h-8 rounded-lg text-xs font-semibold shrink-0 bg-primary text-primary-foreground">
              <Link to="/schemes/$id" params={{ id: urgentScheme.id }}>
                View Action Plan
              </Link>
            </Button>
          </div>
        )}

        {/* Primary Content Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">Recommended for You</h2>
              <p className="text-xs text-muted-foreground">
                Highest matching opportunities based on your demographic and educational criteria.
              </p>
            </div>
            <Link
              to="/recommendations"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>Explore all</span>
              <ArrowRight className="size-3" />
            </Link>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <CardSkeleton className="h-64" />
              <CardSkeleton className="h-64" />
              <CardSkeleton className="h-64" />
            </div>
          ) : recommendations.length === 0 ? (
            <EmptyState
              icon={Compass}
              title="No recommendations generated yet"
              description="Complete your citizen profile details to allow the matching engine to evaluate eligibility rules."
              action={
                <Button asChild size="sm" className="rounded-lg text-xs font-semibold">
                  <Link to="/profile">Complete Profile</Link>
                </Button>
              }
            />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.slice(0, 3).map((rec) => {
                const scheme = SCHEMES.find((s) => s.id === rec.schemeId);
                if (!scheme) return null;
                return (
                  <SchemeCard
                    key={scheme.id}
                    scheme={scheme}
                    recommendation={rec}
                    documents={documents}
                    saved={savedIds.includes(scheme.id)}
                    onToggleSave={() => toggleSaved(scheme.id, scheme.name)}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Secondary Grid: Document Readiness & Application Pipeline Snapshot */}
        <div className="grid md:grid-cols-2 gap-4 pt-2">
          {/* Missing Documents Checklist Widget */}
          <div className="surface-card p-5 space-y-4 bg-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck2 className="size-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">Document Readiness</h3>
              </div>
              <Link to="/documents" className="text-xs font-semibold text-primary hover:underline">
                Open Locker
              </Link>
            </div>

            <p className="text-xs text-muted-foreground">
              Ensure you have these core certificates ready for verification when applying.
            </p>

            <div className="space-y-2">
              {documents.slice(0, 4).map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-xs"
                >
                  <span className="font-medium text-foreground">{doc.name}</span>
                  <span
                    className={
                      doc.status === "available"
                        ? "text-success font-semibold flex items-center gap-1"
                        : doc.status === "needs-verification"
                          ? "text-warning-foreground font-semibold flex items-center gap-1"
                          : "text-muted-foreground font-medium flex items-center gap-1"
                    }
                  >
                    {doc.status === "available" ? (
                      <>
                        <CheckCircle2 className="size-3.5" />
                        <span>Ready</span>
                      </>
                    ) : doc.status === "needs-verification" ? (
                      <>
                        <AlertTriangle className="size-3.5" />
                        <span>Needs Verification</span>
                      </>
                    ) : (
                      <span>Missing</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Application Tracking Snapshot */}
          <div className="surface-card p-5 space-y-4 bg-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SendHorizontal className="size-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">Submission Pipeline</h3>
              </div>
              <Link to="/applications" className="text-xs font-semibold text-primary hover:underline">
                View Tracker
              </Link>
            </div>

            <p className="text-xs text-muted-foreground">
              Track the progress of your submitted and preparing applications.
            </p>

            {applications.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-6 text-center space-y-2">
                <p className="text-xs text-muted-foreground">
                  You haven&apos;t started an application yet.
                </p>
                <Button asChild size="sm" variant="outline" className="h-7 text-xs font-medium">
                  <Link to="/recommendations">Find Schemes to Apply</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {applications.slice(0, 3).map((app) => {
                  const scheme = SCHEMES.find((s) => s.id === app.schemeId);
                  if (!scheme) return null;
                  return (
                    <div
                      key={app.schemeId}
                      className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5 text-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-semibold text-foreground truncate">{scheme.name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{scheme.department}</p>
                      </div>
                      <span className="rounded bg-primary-soft px-2 py-0.5 text-[11px] font-semibold text-primary shrink-0">
                        {app.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
