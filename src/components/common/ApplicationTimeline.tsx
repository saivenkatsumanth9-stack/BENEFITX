import { CheckCircle2, Clock, ArrowRight, Check } from "lucide-react";
import type { ApplicationStatus } from "@/lib/types";
import { APPLICATION_STATUSES } from "@/services/applicationService";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ApplicationTimelineProps {
  currentStatus: ApplicationStatus;
  onStatusChange?: (newStatus: ApplicationStatus) => void;
  className?: string;
}

export function ApplicationTimeline({
  currentStatus,
  onStatusChange,
  className,
}: ApplicationTimelineProps) {
  const currentIndex = APPLICATION_STATUSES.indexOf(currentStatus);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Desktop / Tablet Step Bar */}
      <div className="relative flex items-center justify-between">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 w-full bg-muted -z-0" />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary transition-all duration-500 -z-0"
          style={{
            width: `${(Math.max(0, currentIndex) / (APPLICATION_STATUSES.length - 1)) * 100}%`,
          }}
        />

        {APPLICATION_STATUSES.map((status, index) => {
          const isDone = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div
              key={status}
              className="flex flex-col items-center gap-1.5 relative z-10"
            >
              <button
                type="button"
                onClick={() => onStatusChange?.(status)}
                disabled={!onStatusChange}
                className={cn(
                  "flex size-8 sm:size-9 items-center justify-center rounded-full border-2 text-xs font-bold transition-all",
                  isDone
                    ? "border-primary bg-primary text-primary-foreground"
                    : isCurrent
                      ? "border-primary bg-background text-primary ring-4 ring-primary/20 scale-110"
                      : "border-border bg-muted text-muted-foreground"
                )}
                title={`Set stage to ${status}`}
              >
                {isDone ? <Check className="size-4 stroke-[3]" /> : index + 1}
              </button>
              <span
                className={cn(
                  "hidden sm:block text-[11px] font-bold text-center max-w-[70px] leading-tight",
                  isCurrent
                    ? "text-primary"
                    : isDone
                      ? "text-foreground"
                      : "text-muted-foreground"
                )}
              >
                {status}
              </span>
            </div>
          );
        })}
      </div>

      {/* Current Step Status Callout */}
      <div className="flex items-center justify-between rounded-xl bg-muted/60 p-3 text-xs">
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-primary" />
          <span>
            Current Status: <strong className="text-foreground">{currentStatus}</strong>
          </span>
        </div>
        {onStatusChange && currentIndex < APPLICATION_STATUSES.length - 1 && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onStatusChange(APPLICATION_STATUSES[currentIndex + 1]!)}
            className="h-7 text-xs font-semibold gap-1"
          >
            <span>Advance to {APPLICATION_STATUSES[currentIndex + 1]}</span>
            <ArrowRight className="size-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
