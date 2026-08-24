import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Compass } from "lucide-react";

import { AppLayout } from "@/components/layout/AppLayout";
import { useAppStore } from "@/state/app-store";
import { schemeService, sortSchemes } from "@/services/schemeService";
import { recommendationService } from "@/services/recommendationService";
import { DEMO_PROFILE } from "@/services/profileService";
import { SCHEMES } from "@/data/schemes";
import type { Recommendation, Scheme, SchemeFilters, SortKey } from "@/lib/types";
import { SchemeCard } from "@/components/schemes/SchemeCard";
import { FilterBar } from "@/components/common/FilterBar";
import { EmptyState } from "@/components/common/EmptyState";
import { SchemeListSkeleton } from "@/components/common/LoadingSkeleton";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/schemes/")({
  component: SchemesCatalogPage,
});

function SchemesCatalogPage() {
  const { profile, documents, savedIds, toggleSaved } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [schemes, setSchemes] = useState<Scheme[]>(SCHEMES);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [filters, setFilters] = useState<SchemeFilters>({});
  const [sort, setSort] = useState<SortKey>("match");

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      setLoading(true);
      const activeProfile = profile || DEMO_PROFILE;
      try {
        const [filteredList, recs] = await Promise.all([
          schemeService.getSchemes(filters),
          recommendationService.getRecommendations(activeProfile, documents),
        ]);
        if (cancelled) return;
        setSchemes(filteredList);
        setRecommendations(recs);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadData();
    return () => {
      cancelled = true;
    };
  }, [filters, profile, documents]);

  const scoreMap = new Map(recommendations.map((r) => [r.schemeId, r.matchScore]));
  const sortedSchemes = sortSchemes(schemes, sort, (id) => scoreMap.get(id) ?? 50);

  return (
    <AppLayout>
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Official Directory
              </span>
              <span className="text-muted-foreground text-xs">·</span>
              <span className="text-xs font-semibold text-primary">{sortedSchemes.length} Schemes Available</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              Government Schemes Directory
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Search and filter across central and state government benefits, scholarships, subsidies, and credit programs.
            </p>
          </div>
        </div>

        {/* Filter and Sort Toolbar */}
        <FilterBar
          filters={filters}
          onFilterChange={setFilters}
          sort={sort}
          onSortChange={setSort}
          resultCount={sortedSchemes.length}
        />

        {/* Schemes Grid */}
        {loading ? (
          <SchemeListSkeleton count={6} />
        ) : sortedSchemes.length === 0 ? (
          <EmptyState
            icon={Compass}
            title="No matching schemes found"
            description="No government opportunities matched your search keywords or active filter criteria."
            action={
              <Button
                size="sm"
                onClick={() => {
                  setFilters({});
                  setSort("match");
                }}
                className="rounded-lg text-xs font-semibold"
              >
                Clear All Filters
              </Button>
            }
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedSchemes.map((scheme) => {
              const rec = recommendations.find((r) => r.schemeId === scheme.id);
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
    </AppLayout>
  );
}
