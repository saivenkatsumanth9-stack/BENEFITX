import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Search,
  Bell,
  Bookmark,
  User,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  Menu,
} from "lucide-react";

import { useAppStore } from "@/state/app-store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SearchBar } from "@/components/common/SearchBar";
import { Badge } from "@/components/ui/badge";

interface TopBarProps {
  onMenuClick?: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const { profile, savedIds, notifications, loadDemoProfile, resetAll } = useAppStore();

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border bg-background/95 backdrop-blur px-4 sm:px-6">
        {/* Left: Mobile Menu & Search Trigger */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="md:hidden size-9 rounded-xl"
            aria-label="Toggle navigation menu"
          >
            <Menu className="size-5" />
          </Button>

          {/* Quick Search Button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-input bg-card px-3.5 py-2 text-sm text-muted-foreground shadow-xs hover:border-primary/50 hover:bg-accent/40 transition-colors w-48 sm:w-72 md:w-80"
          >
            <Search className="size-4 text-muted-foreground shrink-0" />
            <span className="truncate text-xs sm:text-sm font-medium">Search schemes, benefits, states...</span>
            <kbd className="pointer-events-none hidden sm:inline-flex ml-auto h-5 select-none items-center gap-1 rounded bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground border">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Quick actions & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Demo Button (Visible on Desktop) */}
          <Button
            variant="outline"
            size="sm"
            onClick={loadDemoProfile}
            className="hidden sm:inline-flex rounded-xl text-xs font-semibold gap-1.5 border-teal/30 bg-teal-soft/40 text-teal-foreground hover:bg-teal-soft"
          >
            <Sparkles className="size-3.5 text-teal" />
            <span>Demo Profile</span>
          </Button>

          {/* Saved Schemes Link */}
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="relative size-9 rounded-xl hover:bg-muted"
            aria-label="Saved schemes"
          >
            <Link to="/saved">
              <Bookmark className="size-4 text-foreground" />
              {savedIds.length > 0 && (
                <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {savedIds.length}
                </span>
              )}
            </Link>
          </Button>

          {/* Notifications Link */}
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="relative size-9 rounded-xl hover:bg-muted"
            aria-label="Notifications"
          >
            <Link to="/notifications">
              <Bell className="size-4 text-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                  {unreadCount}
                </span>
              )}
            </Link>
          </Button>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 rounded-xl p-1.5 sm:px-2.5 sm:py-1.5 hover:bg-muted"
              >
                <div className="flex size-7 items-center justify-center rounded-lg bg-primary font-bold text-xs text-primary-foreground shadow-xs">
                  {profile?.name ? profile.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-xs font-bold leading-none text-foreground line-clamp-1">
                    {profile ? profile.name : "Guest Citizen"}
                  </p>
                  <p className="text-[10px] font-medium text-muted-foreground mt-0.5">
                    {profile?.occupation || "Setup Profile"}
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl p-1.5 shadow-lg">
              <DropdownMenuLabel className="px-2.5 py-2">
                <p className="text-xs font-bold text-foreground">{profile?.name || "Guest Citizen"}</p>
                <p className="text-[11px] font-normal text-muted-foreground truncate">
                  {profile?.state ? `${profile.district ? `${profile.district}, ` : ""}${profile.state}` : "No profile configured"}
                </p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate({ to: "/profile" })} className="rounded-lg cursor-pointer">
                <User className="size-4 mr-2 text-muted-foreground" />
                <span>My Profile & Demographics</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate({ to: "/admin" })} className="rounded-lg cursor-pointer font-bold text-primary">
                <ShieldCheck className="size-4 mr-2 text-primary" />
                <span>Gov-Admin & Verification</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate({ to: "/readiness" })} className="rounded-lg cursor-pointer">
                <CheckCircle2 className="size-4 mr-2 text-teal" />
                <span>Application Readiness</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate({ to: "/settings" })} className="rounded-lg cursor-pointer">
                <ShieldCheck className="size-4 mr-2 text-muted-foreground" />
                <span>Settings & Preferences</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={loadDemoProfile} className="rounded-lg cursor-pointer text-teal font-semibold">
                <Sparkles className="size-4 mr-2" />
                <span>Load Aarav Reddy Demo</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={resetAll} className="rounded-lg cursor-pointer text-destructive font-semibold">
                <RotateCcw className="size-4 mr-2" />
                <span>Reset All Data</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Global Command Search Modal */}
      <SearchBar open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
