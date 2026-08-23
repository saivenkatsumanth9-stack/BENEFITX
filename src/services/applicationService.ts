import { delay, readStore, writeStore } from "@/lib/storage";
import type { ApplicationRecord, ApplicationStatus } from "@/lib/types";

const KEY = "applications";

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  "Saved",
  "Preparing",
  "Ready to Apply",
  "Applied",
  "Under Review",
  "Completed",
];

/** MOCK application tracker service. */
export const applicationService = {
  async getApplications(): Promise<ApplicationRecord[]> {
    await delay(140);
    return readStore<ApplicationRecord[]>(KEY, []);
  },
  async setStatus(schemeId: string, status: ApplicationStatus): Promise<ApplicationRecord[]> {
    const records = readStore<ApplicationRecord[]>(KEY, []);
    const updatedAt = new Date().toISOString();
    const next = records.some((r) => r.schemeId === schemeId)
      ? records.map((r) => (r.schemeId === schemeId ? { ...r, status, updatedAt } : r))
      : [...records, { schemeId, status, updatedAt }];
    writeStore(KEY, next);
    await delay(120);
    return next;
  },
  async remove(schemeId: string): Promise<ApplicationRecord[]> {
    const next = readStore<ApplicationRecord[]>(KEY, []).filter((r) => r.schemeId !== schemeId);
    writeStore(KEY, next);
    await delay(80);
    return next;
  },
};
