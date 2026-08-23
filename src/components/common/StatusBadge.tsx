import { AlertTriangle, Check, HelpCircle, X } from "lucide-react";

import { cn } from "@/lib/utils";
import type { DocumentStatus, EligibilityStatus, MatchFactor } from "@/lib/types";

type Tone = "success" | "warning" | "danger" | "neutral";

const TONE_CLASS: Record<Tone, string> = {
  success: "bg-success-soft text-success border-success/25",
  warning: "bg-warning-soft text-warning-foreground border-warning/35",
  danger: "bg-destructive-soft text-destructive border-destructive/25",
  neutral: "bg-muted text-muted-foreground border-border",
};

const ICON: Record<Tone, typeof Check> = {
  success: Check,
  warning: AlertTriangle,
  danger: X,
  neutral: HelpCircle,
};

export function StatusBadge({
  tone,
  children,
  className,
  glyph,
}: {
  tone: Tone;
  children: React.ReactNode;
  className?: string;
  glyph?: boolean;
}) {
  const Icon = ICON[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        TONE_CLASS[tone],
        className,
      )}
    >
      {glyph === false ? null : <Icon className="size-3.5 shrink-0" aria-hidden="true" />}
      {children}
    </span>
  );
}

export function eligibilityTone(status: EligibilityStatus): Tone {
  return status === "likely-eligible" ? "success" : status === "needs-verification" ? "warning" : "danger";
}

export function eligibilityLabel(status: EligibilityStatus): string {
  return status === "likely-eligible"
    ? "Likely eligible"
    : status === "needs-verification"
      ? "Needs verification"
      : "Likely not eligible";
}

export function EligibilityBadge({ status }: { status: EligibilityStatus }) {
  return <StatusBadge tone={eligibilityTone(status)}>{eligibilityLabel(status)}</StatusBadge>;
}

export function documentTone(status: DocumentStatus): Tone {
  return status === "available" ? "success" : status === "needs-verification" ? "warning" : "danger";
}

export function documentLabel(status: DocumentStatus): string {
  return status === "available" ? "Available" : status === "needs-verification" ? "Needs verification" : "Missing";
}

export function DocumentStatusBadge({ status }: { status: DocumentStatus }) {
  return <StatusBadge tone={documentTone(status)}>{documentLabel(status)}</StatusBadge>;
}

export function factorTone(status: MatchFactor["status"]): Tone {
  return status === "match" ? "success" : status === "mismatch" ? "danger" : "warning";
}

export function factorGlyph(status: MatchFactor["status"]): string {
  return status === "match" ? "✓" : status === "mismatch" ? "✕" : "⚠";
}
