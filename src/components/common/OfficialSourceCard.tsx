import { ExternalLink, ShieldCheck, Calendar, Building2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Scheme } from "@/lib/types";

interface OfficialSourceCardProps {
  scheme: Scheme;
}

export function OfficialSourceCard({ scheme }: OfficialSourceCardProps) {
  return (
    <div className="surface-card p-5 space-y-4 shadow-sm border-primary/20">
      <div className="flex items-center gap-2">
        <ShieldCheck className="size-5 text-primary" />
        <h3 className="text-base font-bold text-foreground">Verified Official Source</h3>
      </div>

      <div className="rounded-xl bg-muted/40 p-3.5 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Department:</span>
          <span className="font-semibold text-foreground text-right">{scheme.department}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Portal Source:</span>
          <span className="font-semibold text-foreground">{scheme.sourceName}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Last Information Sync:</span>
          <span className="font-medium text-foreground">{scheme.lastUpdated}</span>
        </div>
        {scheme.deadline && (
          <div className="flex items-center justify-between text-warning-foreground font-semibold">
            <span>Application Deadline:</span>
            <span>{scheme.deadline}</span>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        BENEFITX is a citizen assistance discovery platform. Applications are officially submitted directly on the authorized government portal.
      </p>

      <Button asChild size="lg" className="w-full rounded-xl gap-2 font-bold shadow-sm">
        <a
          href={scheme.officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open official portal for ${scheme.name} in a new window`}
        >
          <span>Go to Official Application Portal</span>
          <ExternalLink className="size-4" />
        </a>
      </Button>
    </div>
  );
}
