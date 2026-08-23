import { Link } from "@tanstack/react-router";
import { CheckCircle2, AlertTriangle, XCircle, ArrowRight, FileCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { buildChecklist } from "@/lib/readiness";
import type { Scheme, UserDocument } from "@/lib/types";
import { cn } from "@/lib/utils";

interface DocumentChecklistProps {
  scheme: Scheme;
  documents: UserDocument[];
  className?: string;
}

export function DocumentChecklist({ scheme, documents, className }: DocumentChecklistProps) {
  const checklist = buildChecklist(scheme, documents);
  const requiredItems = checklist.filter((item) => !item.optional);
  const readyItems = requiredItems.filter((item) => item.status === "available");
  const readyPct = requiredItems.length
    ? Math.round((readyItems.length / requiredItems.length) * 100)
    : 100;

  return (
    <div className={cn("surface-card p-5 space-y-4 shadow-sm", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileCheck className="size-5 text-primary" />
          <h3 className="text-base font-bold text-foreground">Application Document Checklist</h3>
        </div>
        <span className="text-xs font-bold text-muted-foreground">
          <strong className="text-foreground">{readyItems.length}</strong> of {requiredItems.length} ready
        </span>
      </div>

      {/* Progress meter */}
      <div className="space-y-1.5">
        <Progress value={readyPct} className="h-2 rounded-full" />
        <div className="flex justify-between text-[11px] text-muted-foreground font-semibold">
          <span>{readyPct}% documents prepared</span>
          <span>{requiredItems.length - readyItems.length} required documents pending</span>
        </div>
      </div>

      {/* Items list */}
      <div className="space-y-2 pt-2">
        {checklist.map((item) => {
          const isReady = item.status === "available";
          const needsVerify = item.status === "needs-verification";

          return (
            <div
              key={item.name}
              className={cn(
                "flex items-center justify-between p-3 rounded-xl border text-sm transition-colors",
                isReady
                  ? "border-success/20 bg-success-soft/30 text-foreground"
                  : needsVerify
                    ? "border-warning/30 bg-warning-soft/30 text-foreground"
                    : "border-border bg-card text-foreground"
              )}
            >
              <div className="flex items-center gap-2.5">
                {isReady ? (
                  <CheckCircle2 className="size-4 text-success shrink-0" />
                ) : needsVerify ? (
                  <AlertTriangle className="size-4 text-warning-foreground shrink-0" />
                ) : (
                  <XCircle className="size-4 text-destructive shrink-0" />
                )}
                <div>
                  <span className="font-semibold">{item.name}</span>
                  {item.optional && (
                    <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      Optional
                    </span>
                  )}
                </div>
              </div>

              <span
                className={cn(
                  "text-xs font-bold px-2 py-0.5 rounded-full",
                  isReady
                    ? "text-success bg-success-soft"
                    : needsVerify
                      ? "text-warning-foreground bg-warning-soft"
                      : "text-destructive bg-destructive-soft"
                )}
              >
                {isReady ? "Available" : needsVerify ? "Needs Verification" : "Missing"}
              </span>
            </div>
          );
        })}
      </div>

      <div className="pt-2">
        <Button asChild size="sm" className="w-full rounded-xl gap-2 font-semibold">
          <Link to="/documents">
            <span>Complete Checklist in Document Locker</span>
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
