import { delay, readStore, writeStore } from "@/lib/storage";
import type { UserProfile } from "@/lib/types";

const KEY = "profile";

export const EMPTY_PROFILE: UserProfile = {
  name: "",
  age: null,
  gender: "",
  state: "",
  district: "",
  areaType: "",
  occupation: "",
  educationLevel: "",
  course: "",
  isStudent: false,
  annualIncome: null,
  employmentStatus: "",
  isFarmer: false,
  landHoldingAcres: null,
  hasDisability: false,
  isSeniorCitizen: false,
  updatedAt: "",
};

export const DEMO_PROFILE: UserProfile = {
  name: "Aarav Reddy",
  age: 21,
  gender: "Male",
  state: "Telangana",
  district: "Hyderabad",
  areaType: "Urban",
  occupation: "Student",
  educationLevel: "Undergraduate",
  course: "B.Tech Computer Science",
  isStudent: true,
  annualIncome: 250000,
  employmentStatus: "Student",
  isFarmer: false,
  landHoldingAcres: null,
  hasDisability: false,
  isSeniorCitizen: false,
  updatedAt: new Date().toISOString(),
};

const PROFILE_FIELDS: (keyof UserProfile)[] = [
  "name",
  "age",
  "gender",
  "state",
  "district",
  "areaType",
  "occupation",
  "educationLevel",
  "annualIncome",
  "employmentStatus",
];

/** MOCK profile service. Swap these implementations for REST calls later. */
export const profileService = {
  async getProfile(): Promise<UserProfile | null> {
    await delay(120);
    return readStore<UserProfile | null>(KEY, null);
  },
  async saveProfile(profile: UserProfile): Promise<UserProfile> {
    await delay(200);
    const next = { ...profile, updatedAt: new Date().toISOString() };
    writeStore(KEY, next);
    return next;
  },
  async clearProfile(): Promise<void> {
    await delay(80);
    writeStore<UserProfile | null>(KEY, null);
  },
  completeness(profile: UserProfile | null): number {
    if (!profile) return 0;
    const filled = PROFILE_FIELDS.filter((key) => {
      const value = profile[key];
      return value !== "" && value !== null && value !== undefined;
    }).length;
    return Math.round((filled / PROFILE_FIELDS.length) * 100);
  },
};
