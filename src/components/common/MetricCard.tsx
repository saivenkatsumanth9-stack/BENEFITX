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
  hint?: string;
  tone?: "primary" | "teal" | "saffron" | "success";
  className?: string;
}) {
  const toneClass = {
    primary: "bg-primary-soft text-primary",
    teal: "bg-teal-soft text-teal",
    saffron: "bg-saffron-soft text-saffron-foreground",
    success: "bg-success-soft text-success",
  }[tone];

  return (
    <div className={cn("surface-card p-4 sm:p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-3xl font-extrabold tabular-nums leading-none">{value}</p>
          <p className="mt-2 text-sm font-semibold text-foreground">{label}</p>
          {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", toneClass)}>
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}
