import { cn } from "@/lib/utils";

interface ProgressRingProps {
  value: number;
  size?: number;
  thickness?: number;
  label?: string;
  sublabel?: string;
  className?: string;
  tone?: "primary" | "teal" | "saffron" | "success";
}

const TONE_CLASS: Record<string, string> = {
  primary: "text-primary",
  teal: "text-teal",
  saffron: "text-saffron",
  success: "text-success",
};

export function ProgressRing({
  value,
  size = 160,
  thickness = 12,
  label,
  sublabel,
  className,
  tone = "primary",
}: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      role="img"
      aria-label={`${label ?? "Progress"}: ${clamped} percent`}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={thickness}
          className="stroke-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn("transition-[stroke-dashoffset] duration-700 ease-out", TONE_CLASS[tone])}
          stroke="currentColor"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-extrabold tabular-nums">{clamped}%</span>
        {label ? (
          <span className="mt-1 max-w-[80%] text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">
            {label}
          </span>
        ) : null}
        {sublabel ? <span className="text-xs text-muted-foreground">{sublabel}</span> : null}
      </div>
    </div>
  );
}
