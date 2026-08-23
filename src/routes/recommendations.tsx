import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Compass, Filter, ArrowUpDown, ShieldCheck } from "lucide-react";

import { AppLayout } from "@/components/layout/AppLayout";
import { useAppStore } from "@/state/app-store";
import { recommendationService } from "@/services/recommendationService";
import { schemeService, sortSchemes } from "@/services/schemeService";
import { DEMO_PROFILE } from "@/services/profileService";
import { SCHEMES } from "@/data/schemes";
import type { Recommendation, Scheme, SchemeFilters, SortKey } from "@/lib/types";
import { SchemeCard } from "@/components/schemes/SchemeCard";
import { FilterBar } from "@/components/common/FilterBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/common/EmptyState";
import { SchemeListSkeleton, AnalyzingProfile } from "@/components/common/LoadingSkeleton";

export const Route = createFileRoute("/recommendations")({
  component: RecommendationsPage,
});

function RecommendationsPage() {
  const { profile, documents, savedIds, toggleSaved } = useAppStore();
  const [activeTab, setActiveTab] = useState<"all" | "missed">("all");
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [missedOpportunities, setMissedOpportunities] = useState<Recommendation[]>([]);
  const [filters, setFilters] = useState<SchemeFilters>({});
  const [sort, setSort] = useState<SortKey>("match");

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

  const activeRecList = activeTab === "all" ? recommendations : missedOpportunities;
  const scoreMap = new Map(activeRecList.map((r) => [r.schemeId, r.matchScore]));

  // Filter schemes
  const rawSchemes = SCHEMES.filter((s) =>
    activeRecList.some((r) => r.schemeId === s.id)
  );

  // Apply search/category/state filter
  const filteredSchemes = rawSchemes.filter((scheme) => {
    if (filters.query) {
      const q = filters.query.toLowerCase();
      const match =
        scheme.name.toLowerCase().includes(q) ||
        scheme.shortDescription.toLowerCase().includes(q) ||
        scheme.category.toLowerCase().includes(q) ||
        scheme.tags.some((t) => t.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (filters.categories?.length && !filters.categories.includes(scheme.category)) return false;
    if (filters.states?.length && !filters.states.includes(scheme.state)) return false;
    if (filters.governmentLevels?.length && !filters.governmentLevels.includes(scheme.governmentLevel))
      return false;
    if (filters.educationLevels?.length) {
      const levels = scheme.eligibility.education;
      if (levels && !levels.some((l) => filters.educationLevels!.includes(l))) return false;
    }
    if (filters.occupations?.length) {
      const occ = scheme.eligibility.occupations;
      if (occ && !occ.some((o) => filters.occupations!.includes(o))) return false;
    }
    return true;
  });

  const sortedSchemes = sortSchemes(filteredSchemes, sort, (id) => scoreMap.get(id) ?? 0);

  return (
    <AppLayout>
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-teal">AI Decision Support</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-1">
              Recommended Opportunities
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Ranked by profile match, eligibility rules, and document availability.
            </p>
          </div>
        </div>

        {/* Tab Switcher: All Matches vs Missed Opportunities */}
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as "all" | "missed")}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <TabsList className="rounded-xl h-11 p-1 bg-muted">
              <TabsTrigger value="all" className="rounded-lg text-xs font-bold gap-2 px-4">
                <Sparkles className="size-3.5 text-primary" />
                <span>All Recommendations ({recommendations.length})</span>
              </TabsTrigger>
              <TabsTrigger value="missed" className="rounded-lg text-xs font-bold gap-2 px-4">
                <Compass className="size-3.5 text-teal" />
                <span>Missed Opportunities ({missedOpportunities.length})</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="pt-4">
            {/* Filter and Sort Toolbar */}
            <FilterBar
              filters={filters}
              onFilterChange={setFilters}
              sort={sort}
              onSortChange={setSort}
              resultCount={sortedSchemes.length}
            />
          </div>

          {/* Tab Content */}
          <div className="pt-6">
            {loading ? (
              <AnalyzingProfile />
            ) : sortedSchemes.length === 0 ? (
              <EmptyState
                icon={Sparkles}
                title="No schemes match current filters"
                description="Try clearing some filter options or reset the search query to see all recommendations."
                action={
                  <button
                    onClick={() => {
                      setFilters({});
                      setSort("match");
                    }}
                    className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
                  >
                    Clear All Filters
                  </button>
                }
              />
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedSchemes.map((scheme) => {
                  const rec = activeRecList.find((r) => r.schemeId === scheme.id);
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
        </Tabs>

        {/* Disclaimer Card */}
        <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3 text-xs text-muted-foreground">
          <ShieldCheck className="size-5 text-primary shrink-0" />
          <p>
            <strong>Note:</strong> Recommendation scores (0–100%) and confidence ratings are advisory algorithmic signals. They assist with discovery and preparation but do not substitute for official administrative determinations.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
