import { createFileRoute, Link } from "@tanstack/react-router";
import { SendHorizontal, Sparkles, Building2, MapPin, IndianRupee, Trash2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { AppLayout } from "@/components/layout/AppLayout";
import { useAppStore } from "@/state/app-store";
import { SCHEMES } from "@/data/schemes";
import type { ApplicationStatus } from "@/lib/types";
import { ApplicationTimeline } from "@/components/common/ApplicationTimeline";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/applications")({
  component: ApplicationsTrackerPage,
});

function ApplicationsTrackerPage() {
  const { applications, setApplicationStatus, removeApplication, loadDemoProfile } = useAppStore();

  const handleStatusUpdate = async (schemeId: string, status: ApplicationStatus) => {
    try {
      await setApplicationStatus(schemeId, status);
      toast.success(`Application updated to "${status}"`);
    } catch {
      toast.error("Failed to update status.");
    }
  };

  const handleRemove = async (schemeId: string) => {
    try {
      await removeApplication(schemeId);
      toast.success("Application removed from tracker.");
    } catch {
      toast.error("Failed to remove application.");
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-300">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-teal">Submission Pipeline</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-1">
              Application Tracker ({applications.length})
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track and advance your government benefit applications from preparation to completion.
            </p>
          </div>

          {applications.length === 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={loadDemoProfile}
              className="rounded-xl text-xs font-bold gap-1 text-teal border-teal/30 bg-teal-soft/40 hover:bg-teal-soft"
            >
              <Sparkles className="size-3.5 text-teal" />
              <span>Load Demo Applications</span>
            </Button>
          )}
        </div>

        {applications.length === 0 ? (
          <EmptyState
            icon={SendHorizontal}
            title="No applications tracked yet"
            description="When you save a scheme or mark it as preparing, it will appear here for step-by-step progress tracking."
            action={
              <Button asChild className="rounded-xl font-bold">
                <Link to="/recommendations">
                  <Sparkles className="size-4 mr-2" />
                  <span>Discover Opportunities</span>
                </Link>
              </Button>
            }
          />
        ) : (
          <div className="space-y-6">
            {applications.map((app) => {
              const scheme = SCHEMES.find((s) => s.id === app.schemeId);
              if (!scheme) return null;

              return (
                <div
                  key={app.schemeId}
                  className="surface-card p-6 space-y-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Scheme Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold">
                        <span className="rounded-full bg-teal-soft px-2.5 py-0.5 text-teal">
                          {scheme.category}
                        </span>
                        <span className="text-muted-foreground">{scheme.governmentLevel}</span>
                        <span className="text-saffron-foreground font-semibold">· {scheme.benefitSummary}</span>
                      </div>
                      <h3 className="text-lg font-bold text-foreground">
                        <Link to="/schemes/$id" params={{ id: scheme.id }} className="hover:underline">
                          {scheme.name}
                        </Link>
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button asChild size="sm" variant="outline" className="rounded-xl text-xs font-semibold">
                        <Link to="/schemes/$id" params={{ id: scheme.id }}>
                          <span>Details</span>
                          <ArrowRight className="size-3 ml-1" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemove(app.schemeId)}
                        className="size-8 rounded-xl text-muted-foreground hover:text-destructive"
                        title="Remove from tracker"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Stage Timeline */}
                  <ApplicationTimeline
                    currentStatus={app.status}
                    onStatusChange={(status) => handleStatusUpdate(app.schemeId, status)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
