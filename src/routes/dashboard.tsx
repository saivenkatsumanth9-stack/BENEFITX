import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles,
  Compass,
  FileCheck2,
  PieChart,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Award,
  Layers,
  BookmarkCheck,
  UserCheck,
} from "lucide-react";

import { AppLayout } from "@/components/layout/AppLayout";
import { useAppStore } from "@/state/app-store";
import { recommendationService } from "@/services/recommendationService";
import { schemeService } from "@/services/schemeService";
import { DEMO_PROFILE } from "@/services/profileService";
import { calculateOverallReadiness } from "@/lib/readiness";
import { SCHEMES } from "@/data/schemes";
import type { Recommendation, Scheme } from "@/lib/types";
import { MetricCard } from "@/components/common/MetricCard";
import { SchemeCard } from "@/components/schemes/SchemeCard";
import { ProgressRing } from "@/components/common/ProgressRing";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import { AnalyzingProfile } from "@/components/common/LoadingSkeleton";
import { MatchScore } from "@/components/common/MatchScore";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { profile, documents, savedIds, toggleSaved, loadDemoProfile } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [missedOpportunities, setMissedOpportunities] = useState<Recommendation[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      setLoading(true);
      const activeProfile = profile || DEMO_PROFILE;
      try {
        const [recs, missed] = await Promise.all([
          recommendationService.getRecommendations(activeProfile, documents),
          recommendationService.getMissedOpportunities(activeProfile, documents, savedIds),
        ]);
        if (cancelled) return;
        setRecommendations(recs);
        setMissedOpportunities(missed);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadData();
    return () => {
      cancelled = true;
    };
  }, [profile, documents, savedIds]);

  // Overall readiness calculation
  const savedSchemes = SCHEMES.filter((s) => savedIds.includes(s.id));
  const activeSchemesForReadiness = savedSchemes.length > 0 ? savedSchemes : SCHEMES.slice(0, 3);
  const overallReadiness = calculateOverallReadiness(
    profile || DEMO_PROFILE,
    activeSchemesForReadiness,
    documents
  );

  const highMatchCount = recommendations.filter((r) => r.matchScore >= 80).length;
  const readyDocsCount = documents.filter((d) => d.status === "available").length;
  const totalDocsCount = documents.length > 0 ? documents.length : 6;

  // Dynamic greeting based on current local hour
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const userName = profile?.name ? profile.name.split(" ")[0] : "Citizen";

  return (
    <AppLayout>
      <div className="space-y-8 animate-in fade-in duration-300">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-teal">Citizen Dashboard</span>
              {!profile && (
                <span className="rounded-md bg-saffron-soft px-2 py-0.5 text-[10px] font-bold text-saffron-foreground">
                  Demo Preview
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-1">
              {greeting}, {userName}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Here&apos;s what BENEFITX found for your profile across central and state welfare databases.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {!profile && (
              <Button
                variant="outline"
                size="sm"
                onClick={loadDemoProfile}
                className="rounded-xl text-xs font-bold gap-1.5 border-teal/30 bg-teal-soft/40 text-teal-foreground hover:bg-teal-soft"
              >
                <UserCheck className="size-3.5 text-teal" />
                <span>Load Aarav Reddy Profile</span>
              </Button>
            )}
            <Button asChild size="sm" className="rounded-xl text-xs font-bold gap-1.5 shadow-sm">
              <Link to="/recommendations">
                <Sparkles className="size-3.5" />
                <span>Explore All Matches</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Top 4 Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            icon={Sparkles}
            value={recommendations.length}
            label="Relevant Opportunities"
            hint="Matched against your profile"
            tone="primary"
          />
          <MetricCard
            icon={Award}
            value={highMatchCount}
            label="Highly Matched Schemes"
            hint="Score 80%+ high confidence"
            tone="teal"
          />
          <MetricCard
            icon={FileCheck2}
            value={`${readyDocsCount}/${totalDocsCount}`}
            label="Documents Ready"
            hint={`${totalDocsCount - readyDocsCount} documents pending`}
            tone="saffron"
          />
          <MetricCard
            icon={PieChart}
            value={`${overallReadiness.readinessScore}%`}
            label="Application Readiness"
            hint="Readiness score calculated"
            tone="success"
          />
        </div>

        {/* Loading state */}
        {loading ? (
          <AnalyzingProfile />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column (8 cols): Top Recommended Schemes + Missed Opportunities */}
            <div className="lg:col-span-8 space-y-8">
              {/* SECTION 1: Recommended for You */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-5 text-primary" />
                    <h2 className="text-xl font-bold text-foreground">Recommended for You</h2>
                  </div>
                  <Button asChild variant="ghost" size="sm" className="text-xs font-bold text-primary">
                    <Link to="/recommendations">
                      View all ({recommendations.length}) →
                    </Link>
                  </Button>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {recommendations.slice(0, 4).map((rec) => {
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
              </div>

              {/* SECTION 2: You May Be Missing (Missed Opportunities) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Compass className="size-5 text-teal" />
                    <div>
                      <h2 className="text-xl font-bold text-foreground">You May Be Missing</h2>
                      <p className="text-xs text-muted-foreground">
                        {missedOpportunities.length} opportunities may be relevant to your profile
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {missedOpportunities.slice(0, 2).map((rec) => {
                    const scheme = SCHEMES.find((s) => s.id === rec.schemeId);
                    if (!scheme) return null;

                    return (
                      <div
                        key={scheme.id}
                        className="surface-card p-5 space-y-3 border-teal/30 bg-teal-soft/10 flex flex-col justify-between hover:shadow-md transition-shadow"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="rounded-full bg-teal-soft px-2.5 py-0.5 text-xs font-bold text-teal">
                              Missed Opportunity
                            </span>
                            <MatchScore score={rec.matchScore} confidence={rec.confidence} size="sm" />
                          </div>

                          <h3 className="mt-3 text-base font-bold text-foreground line-clamp-1">
                            <Link to="/schemes/$id" params={{ id: scheme.id }} className="hover:underline">
                              {scheme.name}
                            </Link>
                          </h3>
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                            {scheme.shortDescription}
                          </p>

                          <div className="mt-3 rounded-xl bg-card p-3 border border-border space-y-1 text-xs">
                            <span className="font-bold text-teal text-[11px] uppercase tracking-wider">
                              Why You May Qualify:
                            </span>
                            <p className="text-muted-foreground">{rec.reason}</p>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-border flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-saffron-foreground">{scheme.benefitSummary}</span>
                          <Button asChild size="sm" variant="outline" className="rounded-xl text-xs font-bold">
                            <Link to="/eligibility/$id" params={{ id: scheme.id }}>
                              Check Eligibility
                            </Link>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column (4 cols): Application Readiness Breakdown */}
            <div className="lg:col-span-4 space-y-6">
              {/* SECTION 3: Application Readiness Card */}
              <div className="surface-card p-6 space-y-5 shadow-sm border-primary/20">
                <div className="flex items-center gap-2">
                  <PieChart className="size-5 text-primary" />
                  <h3 className="text-base font-extrabold text-foreground">Application Readiness</h3>
                </div>

                <div className="flex flex-col items-center justify-center py-2">
                  <ProgressRing
                    value={overallReadiness.readinessScore}
                    size={150}
                    thickness={12}
                    tone={overallReadiness.readinessScore >= 80 ? "success" : "teal"}
                    label="Readiness"
                  />
                  <p className="mt-3 text-xs font-bold text-muted-foreground text-center">
                    Overall score across your active benefits
                  </p>
                </div>

                {/* Score breakdown metrics */}
                <div className="space-y-2 pt-2 border-t border-border text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Eligibility Alignment:</span>
                    <strong className="text-foreground">{overallReadiness.eligibilityScore}%</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Document Availability:</span>
                    <strong className="text-foreground">{overallReadiness.documentScore}%</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Verification Readiness:</span>
                    <strong className="text-foreground">{overallReadiness.verificationScore}%</strong>
                  </div>
                </div>

                {/* Status bullet items */}
                <div className="space-y-2 pt-2 border-t border-border text-xs">
                  <div className="flex items-center gap-2 text-success font-medium">
                    <CheckCircle2 className="size-4 shrink-0" />
                    <span>Demographic criteria evaluated</span>
                  </div>
                  <div className="flex items-center gap-2 text-success font-medium">
                    <CheckCircle2 className="size-4 shrink-0" />
                    <span>{readyDocsCount} essential documents available</span>
                  </div>
                  {overallReadiness.missingDocuments.length > 0 ? (
                    <div className="flex items-center gap-2 text-warning-foreground font-semibold">
                      <AlertTriangle className="size-4 shrink-0" />
                      <span>{overallReadiness.missingDocuments[0]} required</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-success font-medium">
                      <CheckCircle2 className="size-4 shrink-0" />
                      <span>All required documents in place</span>
                    </div>
                  )}
                </div>

                <Button asChild size="sm" className="w-full rounded-xl font-bold gap-1.5 shadow-sm">
                  <Link to="/readiness">
                    <span>Complete My Checklist</span>
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>

              {/* Quick Saved Schemes Box */}
              <div className="surface-card p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookmarkCheck className="size-4 text-primary" />
                    <h4 className="text-sm font-bold text-foreground">Saved Schemes ({savedIds.length})</h4>
                  </div>
                  <Link to="/saved" className="text-xs font-semibold text-primary hover:underline">
                    View
                  </Link>
                </div>
                {savedIds.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Bookmark schemes using the bookmark icon on any scheme card to track them here.
                  </p>
                ) : (
                  <ul className="space-y-2 text-xs">
                    {savedSchemes.slice(0, 3).map((s) => (
                      <li key={s.id} className="flex items-center justify-between rounded-lg bg-muted/40 p-2">
                        <span className="font-semibold truncate max-w-[170px]">{s.name}</span>
                        <Link
                          to="/schemes/$id"
                          params={{ id: s.id }}
                          className="text-primary hover:underline font-bold text-[11px]"
                        >
                          Open →
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
