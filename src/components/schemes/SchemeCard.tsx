import { Link } from "@tanstack/react-router";
import { Bookmark, BookmarkCheck, Building2, Calendar, FileText, IndianRupee, MapPin, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MatchScore } from "@/components/common/MatchScore";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { Recommendation, Scheme, UserDocument } from "@/lib/types";
import { cn } from "@/lib/utils";

function calculateDocReadiness(scheme: Scheme, documents: UserDocument[]) {
  const total = scheme.requiredDocuments.length;
  const available = scheme.requiredDocuments.filter((name) => {
    const doc = documents.find((d) => d.name === name);
    return doc && (doc.status === "available" || doc.status === "needs-verification");
  }).length;
  return { total, available, missing: total - available };
}

function calculateDaysRemaining(deadlineStr?: string): { days: number | null; label: string; isUrgent: boolean } {
  if (!deadlineStr) return { days: null, label: "Open Application", isUrgent: false };
  const target = new Date(deadlineStr);
  const now = new Date();
  const diffTime = target.getTime() - now.getTime();
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (days < 0) return { days: 0, label: "Application Closed", isUrgent: false };
  if (days <= 7) return { days, label: `${days} days left`, isUrgent: true };
  return { days, label: `${days} days remaining`, isUrgent: false };
}

export function SchemeCard({
  scheme,
  recommendation,
  documents = [],
  saved,
  onToggleSave,
  className,
  showWhy = true,
}: {
  scheme: Scheme;
  recommendation?: Recommendation | undefined;
  documents?: UserDocument[] | undefined;
  saved?: boolean | undefined;
  onToggleSave?: (() => void) | undefined;
  className?: string | undefined;
  showWhy?: boolean | undefined;
}) {
  const { total: totalDocs, available: availDocs, missing: missingDocs } = calculateDocReadiness(scheme, documents);
  const deadlineInfo = calculateDaysRemaining(scheme.deadline);

  return (
    <article
      className={cn(
        "surface-card-interactive flex h-full flex-col p-5 bg-card",
        className,
      )}
    >
      {/* Top Metadata Header: Category & Level */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
            <span className="rounded bg-muted px-2 py-0.5 text-foreground text-[11px] font-bold">
              {scheme.category}
            </span>
            <span className="inline-flex items-center gap-1 text-muted-foreground text-[11px]">
              <Building2 className="size-3" aria-hidden="true" />
              {scheme.governmentLevel}
            </span>
            <span className="text-muted-foreground text-[11px]">·</span>
            <span className="inline-flex items-center gap-1 text-muted-foreground text-[11px]">
              <MapPin className="size-3" aria-hidden="true" />
              {scheme.state}
            </span>
          </div>

          <h3 className="text-base font-bold text-foreground leading-snug">
            <Link
              to="/schemes/$id"
              params={{ id: scheme.id }}
              className="hover:text-primary transition-colors focus-visible:underline"
            >
              {scheme.name}
            </Link>
          </h3>
          <p className="text-[11px] text-muted-foreground font-medium truncate">
            {scheme.department}
          </p>
        </div>

        {onToggleSave ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSave}
            aria-label={saved ? `Remove ${scheme.name} from saved schemes` : `Save ${scheme.name}`}
            className="size-8 shrink-0 rounded-lg text-muted-foreground hover:text-foreground"
          >
            {saved ? (
              <BookmarkCheck className="size-4 text-primary" aria-hidden="true" />
            ) : (
              <Bookmark className="size-4" aria-hidden="true" />
            )}
          </Button>
        ) : null}
      </div>

      {/* Short Description */}
      <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
        {scheme.shortDescription}
      </p>

      {/* Key Metric Indicators Row */}
      <div className="mt-3.5 pt-3 border-t border-border/80 flex flex-wrap items-center gap-2 text-xs">
        {recommendation ? (
          <MatchScore score={recommendation.matchScore} confidence={recommendation.confidence} size="sm" />
        ) : null}

        <span className="inline-flex items-center gap-1 rounded bg-secondary px-2 py-0.5 font-semibold text-secondary-foreground text-[11px]">
          <IndianRupee className="size-3" aria-hidden="true" />
          {scheme.benefitSummary}
        </span>

        <span className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-muted-foreground text-[11px] font-medium">
          <FileText className="size-3" aria-hidden="true" />
          {availDocs}/{totalDocs} Docs
        </span>

        {scheme.deadline ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-semibold",
              deadlineInfo.isUrgent
                ? "bg-warning-soft text-warning-foreground border border-warning/20"
                : "bg-muted text-muted-foreground"
            )}
          >
            <Calendar className="size-3" aria-hidden="true" />
            {deadlineInfo.label}
          </span>
        ) : null}
      </div>

      {/* Matched Criteria Bullets */}
      {showWhy && recommendation && recommendation.matchedFactors.length > 0 ? (
        <div className="mt-3 bg-muted/40 rounded-lg p-2.5 space-y-1 text-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Eligibility Match Summary
          </p>
          <ul className="space-y-0.5">
            {recommendation.matchedFactors.slice(0, 2).map((f) => (
              <li key={f} className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                <span className="font-bold text-success" aria-hidden="true">✓</span>
                <span className="truncate">{f} meets criteria</span>
              </li>
            ))}
            {recommendation.verifyFactors.slice(0, 1).map((f) => (
              <li key={f} className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                <span className="font-bold text-warning-foreground" aria-hidden="true">⚠</span>
                <span className="truncate">{f} pending verification</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Card Actions Footer */}
      <div className="mt-auto flex items-center justify-between gap-2 pt-4">
        <Button asChild size="sm" className="h-8 rounded-lg text-xs font-semibold px-3 bg-primary text-primary-foreground hover:bg-primary/90">
          <Link to="/schemes/$id" params={{ id: scheme.id }}>
            <span>View Scheme</span>
            <ArrowRight className="size-3.5 ml-1" />
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="h-8 rounded-lg text-xs font-medium px-2.5">
          <Link to="/eligibility/$id" params={{ id: scheme.id }}>
            Check Rules
          </Link>
        </Button>
      </div>
    </article>
  );
}
