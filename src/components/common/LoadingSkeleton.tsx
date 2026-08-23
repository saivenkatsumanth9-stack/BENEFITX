import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("surface-card space-y-4 p-5", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-56" />
        </div>
        <Skeleton className="h-7 w-20 rounded-full" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-9 w-28 rounded-lg" />
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>
    </div>
  );
}

export function SchemeListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function MetricsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="surface-card space-y-3 p-5">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-4 w-28" />
        </div>
      ))}
    </div>
  );
}

const STEPS = [
  "Understanding your profile",
  "Matching schemes",
  "Checking eligibility rules",
  "Preparing recommendations",
];

/** Progress narration shown while the (mock) recommendation service runs. */
export function AnalyzingProfile({ className }: { className?: string }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 500);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className={cn("surface-card p-6", className)} role="status" aria-live="polite">
      <div className="flex items-center gap-3">
        <Loader2 className="size-5 animate-spin text-primary" aria-hidden="true" />
        <p className="text-base font-bold">Analyzing your profile…</p>
      </div>
      <ol className="mt-4 space-y-2.5">
        {STEPS.map((label, i) => (
          <li key={label} className="flex items-center gap-2.5 text-sm">
            <span
              className={cn(
                "grid size-5 place-items-center rounded-full border text-[0.65rem] font-bold",
                i < step
                  ? "border-success/30 bg-success-soft text-success"
                  : i === step
                    ? "border-primary/40 bg-primary-soft text-primary"
                    : "border-border bg-muted text-muted-foreground",
              )}
              aria-hidden="true"
            >
              {i < step ? "✓" : i + 1}
            </span>
            <span className={i <= step ? "font-medium" : "text-muted-foreground"}>{label}</span>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-xs text-muted-foreground">
        Demo mode: results are generated from structured mock scheme data on your device.
      </p>
    </div>
  );
}
