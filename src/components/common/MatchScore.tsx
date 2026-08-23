import { cn } from "@/lib/utils";
import type { ConfidenceLevel } from "@/lib/types";

export function MatchScore({
  score,
  confidence,
  size = "md",
  className,
}: {
  score: number;
  confidence?: ConfidenceLevel;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const tone =
    score >= 80 ? "bg-success-soft text-success" : score >= 60 ? "bg-primary-soft text-primary" : "bg-muted text-muted-foreground";
  const sizes = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  } as const;

  return (
    <span
      className={cn("inline-flex items-center gap-1.5 rounded-full font-bold tabular-nums", tone, sizes[size], className)}
    >
      {score}% Match
      {confidence ? (
        <span className="text-[0.65rem] font-semibold uppercase tracking-wide opacity-80">
          · {confidence}
        </span>
      ) : null}
    </span>
  );
}

export function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-muted-foreground">{label}</span>
        <span className="font-bold tabular-nums">{Math.round(value)}%</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-700"
          style={{ width: `${Math.max(2, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}
