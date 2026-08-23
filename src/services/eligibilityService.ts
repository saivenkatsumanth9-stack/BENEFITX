import { SCHEMES } from "@/data/schemes";
import { buildAssessment } from "@/lib/matching";
import { delay } from "@/lib/storage";
import type { EligibilityAssessment, UserProfile } from "@/lib/types";

/** MOCK eligibility service — later a backend rules engine returns the same shape. */
export const eligibilityService = {
  async checkEligibility(profile: UserProfile, schemeId: string): Promise<EligibilityAssessment | null> {
    await delay(300);
    const scheme = SCHEMES.find((s) => s.id === schemeId);
    if (!scheme) return null;
    return buildAssessment(profile, scheme);
  },
};
