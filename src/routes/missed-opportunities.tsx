import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Compass, Sparkles, ShieldCheck } from "lucide-react";

import { AppLayout } from "@/components/layout/AppLayout";
import { useAppStore } from "@/state/app-store";
import { DEMO_PROFILE } from "@/services/profileService";
import { SCHEMES } from "@/data/schemes";
import { buildAssessment, documentReadinessScore, evaluateCriteria, profileMatchScore } from "@/lib/matching";
import type { Recommendation, Scheme, SchemeFilters, SortKey } from "@/lib/types";
import { SchemeCard } from "@/components/schemes/SchemeCard";
import { FilterBar } from "@/components/common/FilterBar";
import { EmptyState } from "@/components/common/EmptyState";
import { sortSchemes } from "@/services/schemeService";

export const Route = createFileRoute("/missed-opportunities")({
  component: MissedOpportunitiesPage,
});

function scoreScheme(profile: typeof DEMO_PROFILE, scheme: Scheme, documents: any[] = []): Recommendation {
  const criteria = evaluateCriteria(profile, scheme);
  const assessment = buildAssessment(profile, scheme);
  const profileMatch = profileMatchScore(criteria);
  const eligibilityMatch =
    assessment.status === "likely-eligible" ? 100 : assessment.status === "needs-verification" ? 72 : 38;
  const docReadiness = documentReadinessScore(scheme, documents);
  const matchScore = Math.max(5, Math.min(99, Math.round(profileMatch * 0.5 + eligibilityMatch * 0.35 + docReadiness * 0.15)));
  const matchedFactors = criteria.filter((c) => c.status === "match").map((c) => c.label);
  const verifyFactors = criteria.filter((c) => c.status === "verify" || c.status === "unknown").map((c) => c.label);
  const unmatchedFactors = criteria.filter((c) => c.status === "mismatch").map((c) => c.label);
  return {
    schemeId: scheme.id,
    matchScore,
    confidence: matchScore >= 80 ? "high" : matchScore >= 60 ? "medium" : "low",
    matchedFactors,
    unmatchedFactors,
    verifyFactors,
    ranking: 1,
    breakdown: { profileMatch, eligibilityMatch, documentReadiness: docReadiness },
    reason: `Your profile matches ${matchedFactors.length} of ${criteria.length} criteria; ${unmatchedFactors.join(", ")} did not match.`,
    missed: true,
  };
}

function MissedOpportunitiesPage() {
  const { profile, documents, savedIds, toggleSaved } = useAppStore();
  const [filters, setFilters] = useState<SchemeFilters>({});
  const [sort, setSort] = useState<SortKey>("match");

  const activeProfile = profile || DEMO_PROFILE;
  const allScored = SCHEMES.map((s) => scoreScheme(activeProfile, s, documents))
    .filter((r) => !savedIds.includes(r.schemeId))
    .filter((r) => r.matchScore >= 55 && r.unmatchedFactors.length <= 1)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(2, 10);

  const scoreMap = new Map(allScored.map((r) => [r.schemeId, r.matchScore]));

  const matchingSchemes = SCHEMES.filter((s) => allScored.some((r) => r.schemeId === s.id)).filter((scheme) => {
    if (filters.query) {
      const q = filters.query.toLowerCase();
      if (!scheme.name.toLowerCase().includes(q) && !scheme.shortDescription.toLowerCase().includes(q)) return false;
    }
    if (filters.categories?.length && !filters.categories.includes(scheme.category)) return false;
    if (filters.states?.length && !filters.states.includes(scheme.state)) return false;
    return true;
  });

  const sortedSchemes = sortSchemes(matchingSchemes, sort, (id) => scoreMap.get(id) ?? 50);

  return (
    <AppLayout>
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-teal">Unclaimed Benefits</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-1">
              Opportunities You May Have Missed
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Based on your citizen profile, these schemes match 4 out of 5 key criteria and may be worth checking.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/recommendations"
              className="inline-flex items-center gap-1.5 rounded-xl border border-input bg-card px-4 py-2 text-xs font-bold hover:bg-muted"
            >
              <Sparkles className="size-3.5 text-primary" />
              <span>All Recommendations</span>
            </Link>
          </div>
        </div>

        {/* Filter Bar */}
        <FilterBar
          filters={filters}
          onFilterChange={setFilters}
          sort={sort}
          onSortChange={setSort}
          resultCount={sortedSchemes.length}
        />

        {/* Schemes Grid */}
        {sortedSchemes.length === 0 ? (
          <EmptyState
            icon={Compass}
            title="No missed opportunities found"
            description="All high-affinity opportunities have either been reviewed or saved to your locker."
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedSchemes.map((scheme) => {
              const rec = allScored.find((r) => r.schemeId === scheme.id);
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

        {/* Disclaimer */}
        <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3 text-xs text-muted-foreground">
          <ShieldCheck className="size-5 text-teal shrink-0" />
          <p>
            <strong>Missed Opportunity Detection:</strong> BENEFITX surfaces schemes that closely align with your demographic and economic brackets to prevent eligible citizens from missing out on government support.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
