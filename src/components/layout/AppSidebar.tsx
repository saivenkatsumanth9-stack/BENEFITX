import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Compass,
  FileCheck2,
  PieChart,
  Bookmark,
  SendHorizontal,
  Bell,
  User,
  Settings,
  HelpCircle,
  ShieldCheck,
  UserCheck,
  RotateCcw,
  Sparkles,
} from "lucide-react";

import { useAppStore } from "@/state/app-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NavItem {
  label: string;
  to: string;
  icon: React.ElementType;
  badge: string | null;
  badgeColor?: string | undefined;
}

const PRIMARY_NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    to: "/dashboard",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    label: "Recommended Schemes",
    to: "/recommendations",
    icon: Sparkles,
    badge: "recsCount",
  },
  {
    label: "Scheme Directory",
    to: "/schemes",
    icon: Compass,
    badge: "22",
  },
  {
    label: "Application Readiness",
    to: "/readiness",
    icon: PieChart,
    badge: null,
  },
];

const CITIZEN_TOOL_ITEMS: NavItem[] = [
  {
    label: "My Applications",
    to: "/applications",
    icon: SendHorizontal,
    badge: "appsCount",
  },
  {
    label: "Document Locker",
    to: "/documents",
    icon: FileCheck2,
    badge: null,
  },
  {
    label: "Saved Schemes",
    to: "/saved",
    icon: Bookmark,
    badge: "savedCount",
  },
  {
    label: "Notifications",
    to: "/notifications",
    icon: Bell,
    badge: "unreadCount",
    badgeColor: "bg-destructive text-destructive-foreground",
  },
];

const SECONDARY_NAV = [
  { label: "Citizen Profile", to: "/profile", icon: User },
  { label: "Settings", to: "/settings", icon: Settings },
  { label: "Help & Support", to: "/help", icon: HelpCircle },
] as const;

export function AppSidebar() {
  const { profile, savedIds, applications, notifications, profileCompleteness, loadDemoProfile, resetAll } =
    useAppStore();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getBadgeValue = (type: string | null) => {
    if (type === "savedCount") return savedIds.length > 0 ? savedIds.length : null;
    if (type === "appsCount") return applications.length > 0 ? applications.length : null;
    if (type === "unreadCount") return unreadCount > 0 ? unreadCount : null;
    if (type === "recsCount") return "Matched";
    return type;
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-sidebar md:flex select-none">
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-border px-5">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="size-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shadow-xs">
            BX
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-tight text-foreground text-base">BENEFITX</span>
              <span className="rounded bg-primary-soft px-1.5 py-0.2 text-[9px] font-semibold text-primary">
                CIVIC
              </span>
            </div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider leading-none mt-0.5">
              Welfare Gateway
            </p>
          </div>
        </Link>
      </div>

      {/* Main Navigation Scroll Area */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Section 1: Discovery */}
        <div>
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Discovery & Matching
          </p>
          <nav className="space-y-0.5">
            {PRIMARY_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.to === "/dashboard"
                  ? currentPath === "/dashboard"
                  : currentPath.startsWith(item.to);
              const badgeVal = getBadgeValue(item.badge);

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs font-bold"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={cn("size-4 shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                    <span>{item.label}</span>
                  </div>
                  {badgeVal ? (
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                        isActive
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : item.badgeColor || "bg-muted text-muted-foreground"
                      )}
                    >
                      {badgeVal}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Section 2: Citizen Management */}
        <div>
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Citizen Management
          </p>
          <nav className="space-y-0.5">
            {CITIZEN_TOOL_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath.startsWith(item.to);
              const badgeVal = getBadgeValue(item.badge);

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs font-bold"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={cn("size-4 shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                    <span>{item.label}</span>
                  </div>
                  {badgeVal ? (
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                        isActive
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : item.badgeColor || "bg-muted text-muted-foreground"
                      )}
                    >
                      {badgeVal}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Section 3: Account & Support */}
        <div>
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Account & Support
          </p>
          <nav className="space-y-0.5">
            {SECONDARY_NAV.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs font-bold"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className={cn("size-4 shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Profile Completeness Mini Card */}
        <div className="rounded-lg border border-border bg-card p-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">Profile Status</span>
            <span className="text-xs font-bold text-primary tabular-nums">{profileCompleteness}%</span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${profileCompleteness}%` }}
            />
          </div>
          <p className="mt-1.5 text-[10px] text-muted-foreground truncate">
            {profile ? `${profile.name} · ${profile.state}` : "Guest Citizen"}
          </p>
        </div>
      </div>

      {/* Demo Switcher Footer */}
      <div className="border-t border-border bg-sidebar p-3 space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-semibold text-muted-foreground px-1">
          <span className="flex items-center gap-1">
            <ShieldCheck className="size-3 text-primary" /> Active Session
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <Button
            size="sm"
            variant="outline"
            onClick={loadDemoProfile}
            className="h-7 text-[11px] font-semibold rounded-md bg-card"
          >
            <UserCheck className="size-3 mr-1 text-primary" />
            Demo User
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={resetAll}
            className="h-7 text-[11px] font-semibold rounded-md text-muted-foreground hover:text-destructive"
          >
            <RotateCcw className="size-3 mr-1" />
            Reset
          </Button>
        </div>
      </div>
    </aside>
  );
}
