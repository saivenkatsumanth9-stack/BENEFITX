import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark, Sparkles, Compass, Search } from "lucide-react";

import { AppLayout } from "@/components/layout/AppLayout";
import { useAppStore } from "@/state/app-store";
import { SCHEMES } from "@/data/schemes";
import { SchemeCard } from "@/components/schemes/SchemeCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/saved")({
  component: SavedSchemesPage,
});

function SavedSchemesPage() {
  const { savedIds, documents, toggleSaved } = useAppStore();
  const [query, setQuery] = useState("");

  const savedSchemes = SCHEMES.filter((s) => savedIds.includes(s.id));
  const filtered = savedSchemes.filter((s) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      s.shortDescription.toLowerCase().includes(q)
    );
  });

  return (
    <AppLayout>
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-teal">My Saved List</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-1">
              Saved Schemes ({savedSchemes.length})
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Quickly access and track schemes you bookmarked for further review or application.
            </p>
          </div>

          {savedSchemes.length > 0 && (
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search saved schemes..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9 h-10 rounded-xl"
              />
            </div>
          )}
        </div>

        {savedSchemes.length === 0 ? (
          <EmptyState
            icon={Bookmark}
            title="No saved schemes yet"
            description="Bookmark schemes using the bookmark icon on any scheme card to track them here for easy access."
            action={
              <Button asChild className="rounded-xl font-bold">
                <Link to="/recommendations">
                  <Sparkles className="size-4 mr-2" />
                  <span>Discover Recommended Schemes</span>
                </Link>
              </Button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No matching saved schemes"
            description={`No bookmarked schemes match "${query}".`}
            action={
              <Button variant="outline" onClick={() => setQuery("")} className="rounded-xl text-xs font-bold">
                Clear Search
              </Button>
            }
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((scheme) => (
              <SchemeCard
                key={scheme.id}
                scheme={scheme}
                documents={documents}
                saved={true}
                onToggleSave={() => toggleSaved(scheme.id, scheme.name)}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
