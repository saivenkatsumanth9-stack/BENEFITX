import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Compass, AlertCircle, Calendar } from "lucide-react";

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
import { SchemeListSkeleton } from "@/components/common/LoadingSkeleton";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/recommendations")({
  component: RecommendationsPage,
});

function RecommendationsPage() {
  const { profile, documents, savedIds, toggleSaved } = useAppStore();
  const [activeTab, setActiveTab] = useState<"all" | "high-priority" | "missed">("all");
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

  const activeRecList =
    activeTab === "missed"
      ? missedOpportunities
      : activeTab === "high-priority"
        ? recommendations.filter((r) => r.matchScore >= 80)
        : recommendations;

  const scoreMap = new Map(activeRecList.map((r) => [r.schemeId, r.matchScore]));

  const rawSchemes = SCHEMES.filter((s) =>
    activeRecList.some((r) => r.schemeId === s.id)
  );

  // Apply active search/filters
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
    return true;
  });

  const sortedSchemes = sortSchemes(filteredSchemes, sort, (id) => scoreMap.get(id) ?? 0);

  return (
    <AppLayout>
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Personalized Discovery
              </span>
              <span className="text-muted-foreground text-xs">·</span>
              <span className="text-xs font-semibold text-primary">
                {recommendations.length} Schemes Matched
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              Recommended Schemes for Your Profile
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Ranked by profile match, eligibility rules, and document availability.
            </p>
          </div>
        </div>

        {/* Tab Switcher: Best Matches vs High Priority vs Missed */}
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as "all" | "high-priority" | "missed")}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <TabsList className="h-10 p-1 bg-muted rounded-lg border border-border">
              <TabsTrigger value="all" className="text-xs font-semibold rounded-md px-3">
                All Matches ({recommendations.length})
              </TabsTrigger>
              <TabsTrigger value="high-priority" className="text-xs font-semibold rounded-md px-3">
                High Match ({recommendations.filter((r) => r.matchScore >= 80).length})
              </TabsTrigger>
              <TabsTrigger value="missed" className="text-xs font-semibold rounded-md px-3">
                You May Have Missed ({missedOpportunities.length})
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

          {/* Tab Content Grid */}
          <div className="pt-4">
            {loading ? (
              <SchemeListSkeleton count={6} />
            ) : sortedSchemes.length === 0 ? (
              <EmptyState
                icon={Sparkles}
                title="No schemes in this category"
                description="Try switching tabs or resetting your active search filters to view more opportunities."
                action={
                  <Button
                    size="sm"
                    onClick={() => {
                      setFilters({});
                      setSort("match");
                      setActiveTab("all");
                    }}
                    className="rounded-lg text-xs font-semibold"
                  >
                    View All Recommendations
                  </Button>
                }
              />
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
      </div>
    </AppLayout>
  );
}
