import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function MetricCard({
  icon: Icon,
  value,
  label,
  hint,
  tone = "primary",
  className,
}: {
  icon: LucideIcon;
  value: string | number;
  label: string;
  hint?: string | undefined;
  tone?: "primary" | "teal" | "saffron" | "success" | "warning" | undefined;
  className?: string | undefined;
}) {
  const toneClass = {
    primary: "bg-primary-soft text-primary",
    teal: "bg-teal-soft text-teal",
    saffron: "bg-saffron-soft text-saffron-foreground",
    success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-warning-foreground",
  }[tone];

  return (
    <div className={cn("surface-card p-4 sm:p-5 bg-card", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-2xl sm:text-3xl font-extrabold tabular-nums text-foreground leading-none">
            {value}
          </p>
          <p className="text-xs font-semibold text-foreground pt-1">{label}</p>
          {hint ? <p className="text-[11px] text-muted-foreground leading-tight">{hint}</p> : null}
        </div>
        <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg", toneClass)}>
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}
