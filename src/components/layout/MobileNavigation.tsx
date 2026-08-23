import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Sparkles,
  Compass,
  FileCheck2,
  PieChart,
  User,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useAppStore } from "@/state/app-store";

const MOBILE_TABS = [
  { label: "Home", to: "/dashboard", icon: LayoutDashboard },
  { label: "Matches", to: "/recommendations", icon: Sparkles },
  { label: "Schemes", to: "/schemes", icon: Compass },
  { label: "Docs", to: "/documents", icon: FileCheck2 },
  { label: "Readiness", to: "/readiness", icon: PieChart },
  { label: "Profile", to: "/profile", icon: User },
] as const;

export function MobileNavigation() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const { savedIds } = useAppStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-around border-t border-border bg-background/95 backdrop-blur px-2 md:hidden">
      {MOBILE_TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive =
          tab.to === "/dashboard"
            ? currentPath === "/dashboard"
            : currentPath.startsWith(tab.to);

        return (
          <Link
            key={tab.to}
            to={tab.to}
            className={cn(
              "flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-1 text-[11px] font-semibold transition-colors min-w-[52px]",
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className="relative">
              <Icon className={cn("size-5", isActive ? "stroke-[2.5]" : "stroke-2")} />
              {tab.label === "Readiness" && savedIds.length > 0 && (
                <span className="absolute -top-1 -right-1 flex size-2 rounded-full bg-teal" />
              )}
            </div>
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
