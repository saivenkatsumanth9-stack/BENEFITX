import { SCHEMES } from "@/data/schemes";
import { delay, readStore, writeStore } from "@/lib/storage";
import type { Scheme, SchemeFilters, SortKey } from "@/lib/types";

const SAVED_KEY = "saved";

function matchesFilters(scheme: Scheme, f: SchemeFilters): boolean {
  if (f.query) {
    const q = f.query.toLowerCase();
    const haystack = [
      scheme.name,
      scheme.shortDescription,
      scheme.category,
      scheme.benefitSummary,
      scheme.department,
      ...scheme.tags,
    ]
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  if (f.categories?.length && !f.categories.includes(scheme.category)) return false;
  if (f.governmentLevels?.length && !f.governmentLevels.includes(scheme.governmentLevel)) return false;
  if (f.states?.length && !f.states.includes(scheme.state)) return false;
  if (f.educationLevels?.length) {
    const levels = scheme.eligibility.education;
    if (levels && !levels.some((l) => f.educationLevels!.includes(l))) return false;
  }
  if (f.occupations?.length) {
    const occ = scheme.eligibility.occupations;
    if (occ && !occ.some((o) => f.occupations!.includes(o))) return false;
  }
  if (f.incomeMax !== undefined && scheme.eligibility.incomeMax !== undefined) {
    if (scheme.eligibility.incomeMax < f.incomeMax) return false;
  }
  if (f.ageGroup) {
    const [minStr, maxStr] = f.ageGroup.split("-");
    const min = Number(minStr);
    const max = Number(maxStr);
    const e = scheme.eligibility;
    const schemeMin = e.ageMin ?? 0;
    const schemeMax = e.ageMax ?? 120;
    if (schemeMax < min || schemeMin > max) return false;
  }
  return true;
}

export function sortSchemes(schemes: Scheme[], sort: SortKey, scoreOf?: (id: string) => number): Scheme[] {
  const list = [...schemes];
  switch (sort) {
    case "updated":
      return list.sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated));
    case "benefit":
      return list.sort((a, b) => b.benefitValue - a.benefitValue);
    case "deadline":
      return list.sort((a, b) => (a.deadline ?? "9999").localeCompare(b.deadline ?? "9999"));
    case "category":
      return list.sort((a, b) => a.category.localeCompare(b.category));
    case "match":
    default:
      if (!scoreOf) return list;
      return list.sort((a, b) => scoreOf(b.id) - scoreOf(a.id));
  }
}

/** MOCK scheme service — replace with GET /schemes endpoints later. */
export const schemeService = {
  async getSchemes(filters: SchemeFilters = {}): Promise<Scheme[]> {
    await delay(220);
    return SCHEMES.filter((s) => matchesFilters(s, filters));
  },
  async getSchemeById(id: string): Promise<Scheme | null> {
    await delay(160);
    return SCHEMES.find((s) => s.id === id) ?? null;
  },
  async search(query: string): Promise<Scheme[]> {
    await delay(90);
    if (!query.trim()) return [];
    return SCHEMES.filter((s) => matchesFilters(s, { query })).slice(0, 8);
  },
  async getRequiredDocuments(schemeId: string): Promise<string[]> {
    await delay(80);
    return SCHEMES.find((s) => s.id === schemeId)?.requiredDocuments ?? [];
  },
  async getSavedSchemeIds(): Promise<string[]> {
    await delay(80);
    return readStore<string[]>(SAVED_KEY, []);
  },
  async getSavedSchemes(): Promise<Scheme[]> {
    const ids = await schemeService.getSavedSchemeIds();
    return SCHEMES.filter((s) => ids.includes(s.id));
  },
  async saveScheme(id: string): Promise<string[]> {
    const ids = readStore<string[]>(SAVED_KEY, []);
    const next = ids.includes(id) ? ids : [...ids, id];
    writeStore(SAVED_KEY, next);
    await delay(80);
    return next;
  },
  async removeSavedScheme(id: string): Promise<string[]> {
    const next = readStore<string[]>(SAVED_KEY, []).filter((s) => s !== id);
    writeStore(SAVED_KEY, next);
    await delay(80);
    return next;
  },
  categories(): string[] {
    return [...new Set(SCHEMES.map((s) => s.category))].sort();
  },
  states(): string[] {
    return [...new Set(SCHEMES.map((s) => s.state))].sort();
  },
};
