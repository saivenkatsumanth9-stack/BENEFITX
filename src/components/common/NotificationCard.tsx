import { Bell, Sparkles, FileText, PieChart, CheckCircle2, Clock } from "lucide-react";
import type { AppNotification } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NotificationCardProps {
  notification: AppNotification;
  onMarkRead: (id: string) => void;
}

export function NotificationCard({ notification, onMarkRead }: NotificationCardProps) {
  const getIcon = (type: AppNotification["type"]) => {
    switch (type) {
      case "opportunity":
        return <Sparkles className="size-4 text-teal" />;
      case "document":
        return <FileText className="size-4 text-warning-foreground" />;
      case "readiness":
        return <PieChart className="size-4 text-primary" />;
      case "update":
      default:
        return <Bell className="size-4 text-muted-foreground" />;
    }
  };

  const getTone = (type: AppNotification["type"]) => {
    switch (type) {
      case "opportunity":
        return "bg-teal-soft/60 border-teal/30";
      case "document":
        return "bg-warning-soft/60 border-warning/30";
      case "readiness":
        return "bg-primary-soft/60 border-primary/30";
      case "update":
      default:
        return "bg-muted border-border";
    }
  };

  const formattedDate = new Date(notification.createdAt).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={cn(
        "surface-card p-4 flex items-start justify-between gap-3.5 transition-all",
        !notification.read && "border-primary/40 shadow-xs bg-primary-soft/10"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-xl border mt-0.5",
            getTone(notification.type)
          )}
        >
          {getIcon(notification.type)}
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className={cn("text-sm font-bold", !notification.read ? "text-foreground" : "text-muted-foreground")}>
              {notification.title}
            </h4>
            {!notification.read && (
              <span className="size-2 rounded-full bg-primary shrink-0" title="Unread" />
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{notification.body}</p>
          <p className="text-[11px] text-muted-foreground/80 flex items-center gap-1 pt-1">
            <Clock className="size-3" />
            {formattedDate}
          </p>
        </div>
      </div>

      {!notification.read && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onMarkRead(notification.id)}
          className="text-xs font-semibold text-primary hover:text-primary/80 shrink-0 h-8 px-2.5 rounded-lg"
        >
          Mark read
        </Button>
      )}
    </div>
  );
}
