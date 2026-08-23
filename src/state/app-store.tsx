import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { applicationService } from "@/services/applicationService";
import { documentService } from "@/services/documentService";
import { notificationService } from "@/services/notificationService";
import { DEMO_PROFILE, profileService } from "@/services/profileService";
import { schemeService } from "@/services/schemeService";
import { clearStore } from "@/lib/storage";
import type {
  ApplicationRecord,
  ApplicationStatus,
  AppNotification,
  UserDocument,
  UserProfile,
} from "@/lib/types";

interface AppStoreValue {
  profile: UserProfile | null;
  documents: UserDocument[];
  savedIds: string[];
  applications: ApplicationRecord[];
  notifications: AppNotification[];
  hydrated: boolean;
  profileCompleteness: number;
  saveProfile: (profile: UserProfile) => Promise<void>;
  loadDemoProfile: () => Promise<void>;
  resetAll: () => Promise<void>;
  refreshDocuments: () => Promise<void>;
  setDocuments: (docs: UserDocument[]) => void;
  toggleSaved: (schemeId: string, schemeName?: string) => Promise<void>;
  isSaved: (schemeId: string) => boolean;
  setApplicationStatus: (schemeId: string, status: ApplicationStatus) => Promise<void>;
  removeApplication: (schemeId: string) => Promise<void>;
  markNotificationsRead: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
}

const AppStoreContext = createContext<AppStoreValue | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [documents, setDocs] = useState<UserDocument[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [p, d, s, a, n] = await Promise.all([
          profileService.getProfile(),
          documentService.getDocuments(),
          schemeService.getSavedSchemeIds(),
          applicationService.getApplications(),
          notificationService.getNotifications(),
        ]);
        if (cancelled) return;
        setProfile(p);
        setDocs(d);
        setSavedIds(s);
        setApplications(a);
        setNotifications(n);
      } catch {
        if (!cancelled) toast.error("Unable to load your saved demo data.");
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const saveProfile = useCallback(async (next: UserProfile) => {
    const saved = await profileService.saveProfile(next);
    setProfile(saved);
  }, []);

  const loadDemoProfile = useCallback(async () => {
    const saved = await profileService.saveProfile(DEMO_PROFILE);
    const docs = await documentService.loadDemoDocuments();
    const ids = await schemeService.saveScheme("scheme-001");
    await applicationService.setStatus("scheme-001", "Preparing");
    const apps = await applicationService.setStatus("scheme-006", "Saved");
    setProfile(saved);
    setDocs(docs);
    setSavedIds(ids);
    setApplications(apps);
  }, []);

  const resetAll = useCallback(async () => {
    clearStore();
    setProfile(null);
    setDocs([]);
    setSavedIds([]);
    setApplications([]);
    setNotifications(await notificationService.getNotifications());
  }, []);

  const refreshDocuments = useCallback(async () => {
    setDocs(await documentService.getDocuments());
  }, []);

  const toggleSaved = useCallback(
    async (schemeId: string, schemeName?: string) => {
      try {
        if (savedIds.includes(schemeId)) {
          setSavedIds(await schemeService.removeSavedScheme(schemeId));
          await applicationService.remove(schemeId);
          setApplications(await applicationService.getApplications());
          toast.success(`Removed${schemeName ? ` ${schemeName}` : ""} from saved schemes`);
        } else {
          setSavedIds(await schemeService.saveScheme(schemeId));
          setApplications(await applicationService.setStatus(schemeId, "Saved"));
          toast.success(`Saved${schemeName ? ` ${schemeName}` : ""} for later`);
        }
      } catch {
        toast.error("Unable to update saved schemes. Please try again.");
      }
    },
    [savedIds],
  );

  const setApplicationStatus = useCallback(async (schemeId: string, status: ApplicationStatus) => {
    setApplications(await applicationService.setStatus(schemeId, status));
  }, []);

  const removeApplication = useCallback(async (schemeId: string) => {
    setApplications(await applicationService.remove(schemeId));
  }, []);

  const value = useMemo<AppStoreValue>(
    () => ({
      profile,
      documents,
      savedIds,
      applications,
      notifications,
      hydrated,
      profileCompleteness: profileService.completeness(profile),
      saveProfile,
      loadDemoProfile,
      resetAll,
      refreshDocuments,
      setDocuments: setDocs,
      toggleSaved,
      isSaved: (id: string) => savedIds.includes(id),
      setApplicationStatus,
      removeApplication,
      markNotificationsRead: async () => setNotifications(await notificationService.markAllRead()),
      markNotificationRead: async (id: string) => setNotifications(await notificationService.markRead(id)),
    }),
    [
      profile,
      documents,
      savedIds,
      applications,
      notifications,
      hydrated,
      saveProfile,
      loadDemoProfile,
      resetAll,
      refreshDocuments,
      toggleSaved,
      setApplicationStatus,
      removeApplication,
    ],
  );

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore(): AppStoreValue {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error("useAppStore must be used inside AppStoreProvider");
  return ctx;
}
