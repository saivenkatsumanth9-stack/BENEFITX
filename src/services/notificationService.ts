import { MOCK_NOTIFICATIONS } from "@/data/notifications";
import { delay, readStore, writeStore } from "@/lib/storage";
import type { AppNotification } from "@/lib/types";

const KEY = "notifications";

/** MOCK notification service — connect to a real feed later. */
export const notificationService = {
  async getNotifications(): Promise<AppNotification[]> {
    await delay(150);
    const stored = readStore<AppNotification[] | null>(KEY, null);
    if (stored) return stored;
    writeStore(KEY, MOCK_NOTIFICATIONS);
    return MOCK_NOTIFICATIONS;
  },
  async markAllRead(): Promise<AppNotification[]> {
    const next = (await notificationService.getNotifications()).map((n) => ({ ...n, read: true }));
    writeStore(KEY, next);
    return next;
  },
  async markRead(id: string): Promise<AppNotification[]> {
    const next = (await notificationService.getNotifications()).map((n) =>
      n.id === id ? { ...n, read: true } : n,
    );
    writeStore(KEY, next);
    return next;
  },
};
