import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Bell, CheckCheck, Sparkles, FileText, PieChart, Info } from "lucide-react";
import { toast } from "sonner";

import { AppLayout } from "@/components/layout/AppLayout";
import { useAppStore } from "@/state/app-store";
import { NotificationCard } from "@/components/common/NotificationCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/notifications")({
  component: NotificationsPage,
});

function NotificationsPage() {
  const { notifications, markNotificationsRead, markNotificationRead } = useAppStore();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    return true;
  });

  const handleMarkAll = async () => {
    await markNotificationsRead();
    toast.success("All notifications marked as read.");
  };

  const handleMarkOne = async (id: string) => {
    await markNotificationRead(id);
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-teal">Updates & Alerts</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-1">
              Notification Center ({unreadCount} unread)
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Real-time alerts regarding newly detected scheme opportunities, readiness score improvements, and document reminders.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAll}
                className="rounded-xl text-xs font-semibold gap-1.5 h-9"
              >
                <CheckCheck className="size-3.5" />
                <span>Mark All Read</span>
              </Button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
              filter === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            All Updates ({notifications.length})
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
              filter === "unread"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            Unread Only ({unreadCount})
          </button>
        </div>

        {/* Notifications List */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={Bell}
            title={filter === "unread" ? "No unread notifications" : "No notifications yet"}
            description="You're all caught up! When scheme criteria update or new matching benefits are announced, they will appear here."
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkRead={handleMarkOne}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
