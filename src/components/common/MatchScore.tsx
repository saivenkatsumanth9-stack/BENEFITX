import { cn } from "@/lib/utils";
import type { ConfidenceLevel } from "@/lib/types";

export function MatchScore({
  score,
  confidence,
  size = "md",
  className,
}: {
  score: number;
  confidence?: ConfidenceLevel | undefined;
  size?: "sm" | "md" | "lg" | undefined;
  className?: string | undefined;
}) {
  const tone =
    score >= 80
      ? "bg-success-soft text-success border-success/30"
      : score >= 60
        ? "bg-primary-soft text-primary border-primary/30"
        : "bg-muted text-muted-foreground border-border";

  const matchLabel =
    score >= 85
      ? "Strong Match"
      : score >= 70
        ? "Moderate Match"
        : score >= 50
          ? "Partial Match"
          : "Low Match";

  const sizes = {
    sm: "text-[11px] px-2 py-0.5 border",
    md: "text-xs px-2.5 py-1 border",
    lg: "text-sm px-3 py-1.5 border font-bold",
  } as const;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md font-semibold tabular-nums",
        tone,
        sizes[size],
        className
      )}
      title="Profile Match Score: based on explicit criteria matching against scheme rules"
    >
      <span>{score}% Match</span>
      <span className="opacity-75 font-normal">· {matchLabel}</span>
      {confidence ? (
        <span className="text-[10px] font-mono uppercase tracking-wider opacity-60">
          ({confidence})
        </span>
      ) : null}
    </span>
  );
}

export function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-muted-foreground">{label}</span>
        <span className="font-bold tabular-nums text-foreground">{Math.round(value)}%</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-500"
          style={{ width: `${Math.max(2, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}
