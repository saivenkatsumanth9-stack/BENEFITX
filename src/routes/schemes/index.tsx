import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Compass, Sparkles } from "lucide-react";

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
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-teal">National & State Catalog</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-1">
              Government Schemes Directory
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Explore 22 verified central and state welfare, scholarship, and credit opportunities.
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
            title="No schemes found"
            description="No government opportunities matched your search or active filter combination."
            action={
              <button
                onClick={() => {
                  setFilters({});
                  setSort("match");
                }}
                className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
              >
                Reset Filters
              </button>
            }
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
