import { CheckCircle2, AlertTriangle, XCircle, HelpCircle } from "lucide-react";
import type { MatchFactor } from "@/lib/types";
import { cn } from "@/lib/utils";

interface RequirementRowProps {
  factor: MatchFactor;
}

export function RequirementRow({ factor }: RequirementRowProps) {
  const getStatusIcon = (status: MatchFactor["status"]) => {
    switch (status) {
      case "match":
        return <CheckCircle2 className="size-4 text-success shrink-0" />;
      case "verify":
        return <AlertTriangle className="size-4 text-warning-foreground shrink-0" />;
      case "mismatch":
        return <XCircle className="size-4 text-destructive shrink-0" />;
      case "unknown":
      default:
        return <HelpCircle className="size-4 text-muted-foreground shrink-0" />;
    }
  };

  const getStatusBadge = (status: MatchFactor["status"]) => {
    switch (status) {
      case "match":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-0.5 text-xs font-bold text-success">
            ✓ Match
          </span>
        );
      case "verify":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-warning-soft px-2.5 py-0.5 text-xs font-bold text-warning-foreground">
            ⚠ Verify
          </span>
        );
      case "mismatch":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-destructive-soft px-2.5 py-0.5 text-xs font-bold text-destructive">
            ✕ Mismatch
          </span>
        );
      case "unknown":
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-bold text-muted-foreground">
            ? Not Specified
          </span>
        );
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 p-3.5 rounded-xl border border-border/80 bg-card hover:bg-muted/30 transition-colors text-sm">
      {/* Criterion Name */}
      <div className="flex items-center gap-2 font-bold text-foreground sm:col-span-1">
        {getStatusIcon(factor.status)}
        <span>{factor.label}</span>
      </div>

      {/* Required by scheme */}
      <div className="text-xs sm:col-span-1">
        <span className="text-muted-foreground sm:hidden font-medium">Required: </span>
        <span className="font-semibold text-foreground">{factor.required}</span>
      </div>

      {/* Your value */}
      <div className="text-xs sm:col-span-1">
        <span className="text-muted-foreground sm:hidden font-medium">Your Profile: </span>
        <span
          className={cn(
            "font-medium",
            factor.yourValue === "Not provided" ? "text-muted-foreground italic" : "text-foreground font-semibold"
          )}
        >
          {factor.yourValue}
        </span>
      </div>

      {/* Result badge */}
      <div className="sm:col-span-1 flex justify-start sm:justify-end">
        {getStatusBadge(factor.status)}
      </div>
    </div>
  );
}
