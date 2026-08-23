import { Sparkles, CheckCircle2, AlertTriangle, XCircle, Info, ShieldAlert } from "lucide-react";
import type { Recommendation } from "@/lib/types";
import { ScoreBar } from "./MatchScore";
import { cn } from "@/lib/utils";

interface RecommendationExplainerProps {
  recommendation: Recommendation;
  className?: string;
}

export function RecommendationExplainer({
  recommendation,
  className,
}: RecommendationExplainerProps) {
  const { breakdown, matchedFactors, verifyFactors, unmatchedFactors, matchScore, confidence } =
    recommendation;

  return (
    <div className={cn("surface-card p-5 space-y-5 shadow-sm", className)}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-teal" />
            <h3 className="text-base font-extrabold text-foreground">Why BENEFITX Recommended This</h3>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Transparent AI recommendation breakdown based on your demographic profile, eligibility constraints, and document readiness.
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-2xl font-black text-primary tabular-nums">{matchScore}%</div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {confidence} Confidence
          </span>
        </div>
      </div>

      {/* Factor Breakdown Bars */}
      <div className="rounded-xl bg-muted/40 p-4 space-y-3">
        <ScoreBar label="Demographic Profile Match" value={breakdown.profileMatch} />
        <ScoreBar label="Eligibility Rule Alignment" value={breakdown.eligibilityMatch} />
        <ScoreBar label="Document Readiness" value={breakdown.documentReadiness} />
      </div>

      {/* Explainability Factors Grid */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Evaluation Factors
        </h4>

        {/* Matched Factors */}
        {matchedFactors.length > 0 && (
          <div className="space-y-1.5">
            {matchedFactors.map((factor) => (
              <div
                key={factor}
                className="flex items-center gap-2 text-xs text-foreground bg-success-soft/30 border border-success/20 rounded-xl px-3 py-2"
              >
                <CheckCircle2 className="size-4 text-success shrink-0" />
                <span>
                  <strong className="font-semibold">{factor}</strong> matches scheme requirement
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Verification Needed Factors */}
        {verifyFactors.length > 0 && (
          <div className="space-y-1.5">
            {verifyFactors.map((factor) => (
              <div
                key={factor}
                className="flex items-center gap-2 text-xs text-foreground bg-warning-soft/30 border border-warning/30 rounded-xl px-3 py-2"
              >
                <AlertTriangle className="size-4 text-warning-foreground shrink-0" />
                <span>
                  <strong className="font-semibold">{factor}</strong> needs verification or certificate upload
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Unmatched Factors */}
        {unmatchedFactors.length > 0 && (
          <div className="space-y-1.5">
            {unmatchedFactors.map((factor) => (
              <div
                key={factor}
                className="flex items-center gap-2 text-xs text-foreground bg-destructive-soft/30 border border-destructive/20 rounded-xl px-3 py-2"
              >
                <XCircle className="size-4 text-destructive shrink-0" />
                <span>
                  <strong className="font-semibold">{factor}</strong> does not align with criteria
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Official Decision Support Disclaimer */}
      <div className="rounded-xl border border-border bg-muted/60 p-3 flex items-start gap-2.5 text-[11px] text-muted-foreground">
        <ShieldAlert className="size-4 text-muted-foreground shrink-0 mt-0.5" />
        <p>
          <strong>Decision Support Notice:</strong> Recommendation scores and criteria matches are advisory decision-support signals derived from structured public data. The final eligibility decision rests solely with the competent government department.
        </p>
      </div>
    </div>
  );
}
