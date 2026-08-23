import { Link } from "@tanstack/react-router";
import { Bookmark, BookmarkCheck, Building2, FileText, IndianRupee, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MatchScore } from "@/components/common/MatchScore";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { Recommendation, Scheme, UserDocument } from "@/lib/types";
import { cn } from "@/lib/utils";

function docStatus(scheme: Scheme, documents: UserDocument[]) {
  const missing = scheme.requiredDocuments.filter((name) => {
    const doc = documents.find((d) => d.name === name);
    return !doc || doc.status === "missing";
  });
  return { required: scheme.requiredDocuments.length, missing: missing.length };
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
  const { required, missing } = docStatus(scheme, documents);

  return (
    <article
      className={cn(
        "surface-card flex h-full flex-col p-5 transition-shadow hover:shadow-[var(--shadow-lift)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
            <span className="rounded-full bg-teal-soft px-2 py-0.5 text-teal">{scheme.category}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
              <Building2 className="size-3" aria-hidden="true" />
              {scheme.governmentLevel}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
              <MapPin className="size-3" aria-hidden="true" />
              {scheme.state}
            </span>
          </div>
          <h3 className="mt-2.5 text-base font-bold leading-snug">
            <Link
              to="/schemes/$id"
              params={{ id: scheme.id }}
              className="hover:text-primary hover:underline"
            >
              {scheme.name}
            </Link>
          </h3>
        </div>
        {onToggleSave ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSave}
            aria-label={saved ? `Remove ${scheme.name} from saved schemes` : `Save ${scheme.name}`}
            className="min-h-11 min-w-11 shrink-0"
          >
            {saved ? (
              <BookmarkCheck className="size-5 text-primary" aria-hidden="true" />
            ) : (
              <Bookmark className="size-5" aria-hidden="true" />
            )}
          </Button>
        ) : null}
      </div>

      <p className="mt-2.5 text-sm text-muted-foreground">{scheme.shortDescription}</p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {recommendation ? (
          <MatchScore score={recommendation.matchScore} confidence={recommendation.confidence} />
        ) : null}
        <span className="inline-flex items-center gap-1 rounded-full bg-saffron-soft px-2.5 py-1 text-xs font-semibold text-saffron-foreground">
          <IndianRupee className="size-3" aria-hidden="true" />
          {scheme.benefitSummary}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
          <FileText className="size-3" aria-hidden="true" />
          {required} documents
        </span>
        {documents.length > 0 ? (
          <StatusBadge tone={missing === 0 ? "success" : "warning"}>
            {missing === 0 ? "Documents ready" : `${missing} missing`}
          </StatusBadge>
        ) : null}
      </div>

      {showWhy && recommendation ? (
        <ul className="mt-3.5 space-y-1 text-sm">
          {recommendation.matchedFactors.slice(0, 3).map((f) => (
            <li key={f} className="flex items-center gap-2 text-muted-foreground">
              <span className="font-bold text-success" aria-hidden="true">
                ✓
              </span>
              <span>{f} matched</span>
            </li>
          ))}
          {recommendation.verifyFactors.slice(0, 1).map((f) => (
            <li key={f} className="flex items-center gap-2 text-muted-foreground">
              <span className="font-bold text-warning-foreground" aria-hidden="true">
                ⚠
              </span>
              <span>{f} needs verification</span>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-auto flex flex-wrap gap-2 pt-4">
        <Button asChild size="sm">
          <Link to="/schemes/$id" params={{ id: scheme.id }}>
            View details
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link to="/eligibility/$id" params={{ id: scheme.id }}>
            Check eligibility
          </Link>
        </Button>
      </div>
    </article>
  );
}
