import { createFileRoute, Link } from "@tanstack/react-router";
import { SendHorizontal, Sparkles, Building2, MapPin, IndianRupee, Trash2, ArrowRight, ExternalLink, Calendar } from "lucide-react";
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
      <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Submission Pipeline
              </span>
              <span className="text-muted-foreground text-xs">·</span>
              <span className="text-xs font-semibold text-primary">
                {applications.length} Active {applications.length === 1 ? "Application" : "Applications"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              My Benefit Applications
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Track and advance your government welfare applications through verification and disbursement stages.
            </p>
          </div>

          {applications.length === 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={loadDemoProfile}
              className="h-8 rounded-lg text-xs font-semibold gap-1.5 border-border bg-card"
            >
              <Sparkles className="size-3.5 text-primary" />
              <span>Load Sample Applications</span>
            </Button>
          )}
        </div>

        {applications.length === 0 ? (
          <EmptyState
            icon={SendHorizontal}
            title="No applications tracked yet"
            description="When you save a scheme or begin application preparation, you can monitor its step-by-step progress here."
            action={
              <Button asChild size="sm" className="rounded-lg text-xs font-semibold bg-primary text-primary-foreground">
                <Link to="/recommendations">
                  <span>Explore Schemes to Apply</span>
                  <ArrowRight className="size-3.5 ml-1.5" />
                </Link>
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {applications.map((app) => {
              const scheme = SCHEMES.find((s) => s.id === app.schemeId);
              if (!scheme) return null;

              return (
                <div
                  key={app.schemeId}
                  className="surface-card p-5 space-y-4 bg-card"
                >
                  {/* Header: Scheme Name, Category, Portal link */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-border/80 pb-3.5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-semibold">
                        <span className="rounded bg-primary-soft px-2 py-0.5 text-primary text-[11px] font-bold">
                          {scheme.category}
                        </span>
                        <span className="text-muted-foreground text-xs">{scheme.governmentLevel}</span>
                        <span className="text-muted-foreground text-xs">·</span>
                        <span className="font-semibold text-foreground text-xs">{scheme.benefitSummary}</span>
                      </div>
                      <h3 className="text-base font-bold text-foreground">
                        <Link to="/schemes/$id" params={{ id: scheme.id }} className="hover:text-primary transition-colors">
                          {scheme.name}
                        </Link>
                      </h3>
                      <p className="text-[11px] text-muted-foreground">
                        Nodal Authority: <strong className="text-foreground font-medium">{scheme.department}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button asChild size="sm" variant="outline" className="h-8 rounded-lg text-xs font-semibold px-2.5">
                        <a href={scheme.officialUrl} target="_blank" rel="noopener noreferrer">
                          <span>Nodal Portal</span>
                          <ExternalLink className="size-3 ml-1" />
                        </a>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemove(app.schemeId)}
                        className="size-8 rounded-lg text-muted-foreground hover:text-destructive"
                        title="Remove from tracking"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Progressive Stepper Timeline */}
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
