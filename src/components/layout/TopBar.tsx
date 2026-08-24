import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Search,
  Bell,
  Bookmark,
  User,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  Menu,
  LogIn,
  Users,
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
import { CitizenAuthModal } from "@/components/common/CitizenAuthModal";

interface TopBarProps {
  onMenuClick?: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { profile, savedIds, notifications, resetAll } = useAppStore();

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <header className="sticky top-0 z-20 flex h-14 w-full items-center justify-between border-b border-border bg-card/95 backdrop-blur px-4 sm:px-6">
        {/* Left: Mobile Menu & Global Search Trigger */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="md:hidden size-8 rounded-lg"
            aria-label="Toggle navigation menu"
          >
            <Menu className="size-4" />
          </Button>

          {/* Quick Search Button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-muted-foreground shadow-xs hover:border-primary/40 hover:bg-muted/50 transition-colors w-48 sm:w-72 md:w-80"
          >
            <Search className="size-3.5 text-muted-foreground shrink-0" />
            <span className="truncate font-medium">Search schemes, benefits, eligibility...</span>
            <kbd className="hidden sm:inline-block ml-auto pointer-events-none rounded border border-border bg-muted px-1.5 text-[10px] font-mono text-muted-foreground">
              /
            </kbd>
          </button>
        </div>

        {/* Right: Quick actions & Citizen Session */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Sign In / Switch Account Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAuthModalOpen(true)}
            className="h-8 rounded-lg text-xs font-semibold gap-1.5 border-border bg-background hover:bg-muted"
          >
            {profile ? (
              <>
                <Users className="size-3 text-muted-foreground" />
                <span className="hidden sm:inline">Switch Citizen</span>
              </>
            ) : (
              <>
                <LogIn className="size-3 text-primary" />
                <span>Sign In</span>
              </>
            )}
          </Button>

          {/* Saved Schemes Link */}
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="relative size-8 rounded-lg text-muted-foreground hover:text-foreground"
            aria-label="Saved schemes"
          >
            <Link to="/saved">
              <Bookmark className="size-4" />
              {savedIds.length > 0 && (
                <span className="absolute 1 top-1 right-1 flex size-3.5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
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
            className="relative size-8 rounded-lg text-muted-foreground hover:text-foreground"
            aria-label="Notifications"
          >
            <Link to="/notifications">
              <Bell className="size-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex size-3.5 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                  {unreadCount}
                </span>
              )}
            </Link>
          </Button>

          <div className="h-4 w-px bg-border mx-1" />

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 flex items-center gap-2 rounded-lg p-1 sm:px-2 hover:bg-muted"
              >
                <div className="flex size-6 items-center justify-center rounded-full bg-primary font-bold text-[11px] text-primary-foreground">
                  {profile?.name ? profile.name.charAt(0).toUpperCase() : "C"}
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-xs font-semibold leading-none text-foreground line-clamp-1">
                    {profile ? profile.name : "Guest Citizen"}
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-lg p-1.5 shadow-md">
              <DropdownMenuLabel className="px-2.5 py-1.5">
                <p className="text-xs font-bold text-foreground">{profile?.name || "Guest Citizen"}</p>
                <p className="text-[11px] font-normal text-muted-foreground truncate">
                  {profile?.state ? `${profile.district ? `${profile.district}, ` : ""}${profile.state}` : "No verified location"}
                </p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate({ to: "/profile" })} className="rounded-md cursor-pointer text-xs">
                <User className="size-3.5 mr-2 text-muted-foreground" />
                <span>My Citizen Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate({ to: "/readiness" })} className="rounded-md cursor-pointer text-xs">
                <CheckCircle2 className="size-3.5 mr-2 text-success" />
                <span>Application Readiness</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate({ to: "/settings" })} className="rounded-md cursor-pointer text-xs">
                <ShieldCheck className="size-3.5 mr-2 text-muted-foreground" />
                <span>Preferences & Privacy</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setAuthModalOpen(true)} className="rounded-md cursor-pointer text-xs text-primary font-semibold">
                <LogIn className="size-3.5 mr-2" />
                <span>{profile ? "Switch Citizen Account" : "Sign In with Credentials"}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={resetAll} className="rounded-md cursor-pointer text-xs text-destructive font-medium">
                <RotateCcw className="size-3.5 mr-2" />
                <span>Log Out / Reset Data</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Global Command Search Modal */}
      <SearchBar open={searchOpen} onOpenChange={setSearchOpen} />

      {/* Citizen Authentication & Login Modal */}
      <CitizenAuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </>
  );
}
