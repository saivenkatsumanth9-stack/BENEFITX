import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Sparkles,
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
  ExternalLink,
} from "lucide-react";

import { useAppStore } from "@/state/app-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NavItem {
  label: string;
  to: string;
  icon: React.ElementType;
  badge: string | null;
  badgeColor?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    to: "/dashboard",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    label: "AI Recommendations",
    to: "/recommendations",
    icon: Sparkles,
    badge: "AI",
    badgeColor: "bg-teal-soft text-teal",
  },
  {
    label: "Explore Schemes",
    to: "/schemes",
    icon: Compass,
    badge: "22",
  },
  {
    label: "Document Locker",
    to: "/documents",
    icon: FileCheck2,
    badge: null,
  },
  {
    label: "Application Readiness",
    to: "/readiness",
    icon: PieChart,
    badge: null,
  },
  {
    label: "Saved Schemes",
    to: "/saved",
    icon: Bookmark,
    badge: "savedCount",
  },
  {
    label: "My Applications",
    to: "/applications",
    icon: SendHorizontal,
    badge: "appsCount",
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
  { label: "Admin Portal", to: "/admin", icon: ShieldCheck },
  { label: "My Profile", to: "/profile", icon: User },
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
    return type;
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-sidebar md:flex">
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-border px-5">
        <Link to="/" className="flex items-center gap-2.5 group">
          <img
            src="/logo.png"
            alt="BENEFITX Logo"
            className="size-9 rounded-xl object-contain shadow-sm group-hover:scale-105 transition-transform"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-tight text-foreground text-lg">BENEFITX</span>
              <span className="rounded bg-teal-soft px-1.5 py-0.2 text-[10px] font-bold text-teal">GOV-AI</span>
            </div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest leading-none">
              Citizen Gateway
            </p>
          </div>
        </Link>
      </div>

      {/* Main Navigation Scroll Area */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Main Section */}
        <div>
          <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Discovery & Readiness
          </p>
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
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
                    "flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold transition-all group",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn("size-4 shrink-0 transition-transform group-hover:scale-110", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                    <span>{item.label}</span>
                  </div>
                  {badgeVal ? (
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums",
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

        {/* Secondary Account Section */}
        <div>
          <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Account & Support
          </p>
          <nav className="space-y-1">
            {SECONDARY_NAV.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-all group",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className={cn("size-4 shrink-0 transition-transform group-hover:scale-110", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Profile Readiness Mini Card */}
        <div className="rounded-2xl border border-border bg-card p-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">Profile Completeness</span>
            <span className="text-xs font-extrabold text-primary tabular-nums">{profileCompleteness}%</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${profileCompleteness}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            {profile ? profile.name : "Guest Citizen"} {profile?.state ? `· ${profile.state}` : ""}
          </p>
          <Link
            to="/profile"
            className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-muted px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-accent transition-colors"
          >
            {profile ? "Edit Profile" : "Complete Profile"}
          </Link>
        </div>
      </div>

      {/* Demo Persona Action Footer */}
      <div className="border-t border-border bg-sidebar p-3 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground px-1">
          <span className="flex items-center gap-1">
            <ShieldCheck className="size-3 text-teal" /> Hackathon Demo
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <Button
            size="sm"
            variant="outline"
            onClick={loadDemoProfile}
            className="h-8 text-xs font-semibold rounded-lg bg-card"
          >
            <UserCheck className="size-3.5 mr-1 text-teal" />
            Load Demo
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={resetAll}
            className="h-8 text-xs font-semibold rounded-lg text-muted-foreground hover:text-destructive"
          >
            <RotateCcw className="size-3 mr-1" />
            Reset
          </Button>
        </div>
      </div>
    </aside>
  );
}
