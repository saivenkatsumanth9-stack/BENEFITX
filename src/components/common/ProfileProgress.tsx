import { Link } from "@tanstack/react-router";
import { UserCheck, Sparkles, ArrowRight, ShieldAlert } from "lucide-react";
import { useAppStore } from "@/state/app-store";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProfileProgressProps {
  className?: string;
}

export function ProfileProgress({ className }: ProfileProgressProps) {
  const { profile, profileCompleteness, loadDemoProfile } = useAppStore();

  const missingFields: string[] = [];
  if (!profile?.age) missingFields.push("Age");
  if (!profile?.state) missingFields.push("State");
  if (!profile?.educationLevel) missingFields.push("Education");
  if (!profile?.occupation) missingFields.push("Occupation");
  if (profile?.annualIncome === null) missingFields.push("Annual Income");

  return (
    <div className={cn("surface-card p-5 space-y-4 shadow-sm", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary-soft text-primary font-bold">
            <UserCheck className="size-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Benefit Profile Completeness</h3>
            <p className="text-xs text-muted-foreground">
              {profile ? `${profile.name}` : "Profile not started"}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xl font-extrabold text-primary tabular-nums">{profileCompleteness}%</span>
        </div>
      </div>

      <div className="space-y-1.5">
        <Progress value={profileCompleteness} className="h-2 rounded-full" />
        {missingFields.length > 0 ? (
          <p className="text-[11px] text-muted-foreground">
            Complete <strong className="text-foreground">{missingFields.slice(0, 3).join(", ")}</strong> to unlock higher-accuracy recommendations.
          </p>
        ) : (
          <p className="text-[11px] text-success font-semibold">
            ✓ Your citizen profile is fully configured for maximum scheme matching.
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Button asChild size="sm" className="flex-1 rounded-xl text-xs font-semibold gap-1">
          <Link to="/profile">
            <span>{profile ? "Update Profile" : "Create Profile"}</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </Button>
        {!profile && (
          <Button
            variant="outline"
            size="sm"
            onClick={loadDemoProfile}
            className="rounded-xl text-xs font-semibold gap-1 text-teal border-teal/30 bg-teal-soft/30 hover:bg-teal-soft"
          >
            <Sparkles className="size-3.5 text-teal" />
            <span>Try Demo</span>
          </Button>
        )}
      </div>
    </div>
  );
}
