import { useState, type ReactNode } from "react";
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
  X,
  UserCheck,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";

import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";
import { MobileNavigation } from "./MobileNavigation";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAppStore } from "@/state/app-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AppLayoutProps {
  children: ReactNode;
  pageTitle?: string;
}

const MOBILE_DRAWER_ITEMS = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "AI Recommendations", to: "/recommendations", icon: Sparkles },
  { label: "Explore All Schemes", to: "/schemes", icon: Compass },
  { label: "Document Locker", to: "/documents", icon: FileCheck2 },
  { label: "Application Readiness", to: "/readiness", icon: PieChart },
  { label: "Saved Schemes", to: "/saved", icon: Bookmark },
  { label: "My Applications", to: "/applications", icon: SendHorizontal },
  { label: "Notifications", to: "/notifications", icon: Bell },
  { label: "My Profile", to: "/profile", icon: User },
  { label: "Settings", to: "/settings", icon: Settings },
  { label: "Help & FAQ", to: "/help", icon: HelpCircle },
] as const;

export function AppLayout({ children }: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const { profile, profileCompleteness, loadDemoProfile, resetAll } = useAppStore();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      {/* Desktop Persistent Sidebar */}
      <AppSidebar />

      {/* Mobile Drawer Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-72 p-0 flex flex-col">
          <SheetHeader className="p-4 border-b border-border flex flex-row items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img
                src="/logo.png"
                alt="BENEFITX Logo"
                className="size-8 rounded-xl object-contain shadow-xs"
              />
              <div>
                <SheetTitle className="text-base font-extrabold leading-none">BENEFITX</SheetTitle>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-0.5">
                  Citizen Portal
                </p>
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
            <nav className="space-y-1">
              {MOBILE_DRAWER_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.to === "/dashboard"
                    ? currentPath === "/dashboard"
                    : currentPath.startsWith(item.to);

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="rounded-xl border border-border bg-card p-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span>Profile Completeness</span>
                <span className="text-primary">{profileCompleteness}%</span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {profile?.name || "Guest Citizen"}
              </p>
            </div>
          </div>

          <div className="border-t border-border p-3 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  loadDemoProfile();
                  setMobileMenuOpen(false);
                }}
                className="h-8 text-xs font-semibold"
              >
                <UserCheck className="size-3.5 mr-1 text-teal" />
                Demo
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  resetAll();
                  setMobileMenuOpen(false);
                }}
                className="h-8 text-xs font-semibold text-muted-foreground"
              >
                <RotateCcw className="size-3 mr-1" />
                Reset
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main App Container */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0 pb-20 md:pb-8">
        <TopBar onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 md:px-8 max-w-7xl w-full mx-auto animate-in fade-in-50 duration-300">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNavigation />
    </div>
  );
}
