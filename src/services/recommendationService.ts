import { SCHEMES } from "@/data/schemes";
import { buildAssessment, documentReadinessScore, evaluateCriteria, profileMatchScore } from "@/lib/matching";
import { delay } from "@/lib/storage";
import type { ConfidenceLevel, Recommendation, Scheme, UserDocument, UserProfile } from "@/lib/types";

/**
 * ML INTEGRATION PLACEHOLDER.
 * Contract: getRecommendations(profile, documents) -> Recommendation[]
 * The current implementation is a transparent rule-based mock inference.
 * Replace the body with a POST to the recommendation API — the shape stays the same.
 */
function score(profile: UserProfile, scheme: Scheme, documents: UserDocument[]): Recommendation {
  const criteria = evaluateCriteria(profile, scheme);
  const assessment = buildAssessment(profile, scheme);
  const profileMatch = profileMatchScore(criteria);
  const eligibilityMatch =
    assessment.status === "likely-eligible" ? 100 : assessment.status === "needs-verification" ? 72 : 38;
  const docReadiness = documentReadinessScore(scheme, documents);

  const matchScore = Math.max(
    5,
    Math.min(99, Math.round(profileMatch * 0.5 + eligibilityMatch * 0.35 + docReadiness * 0.15)),
  );

  const confidence: ConfidenceLevel =
    criteria.filter((c) => c.status === "unknown").length > 1
      ? "low"
      : matchScore >= 80
        ? "high"
        : matchScore >= 60
          ? "medium"
          : "low";

  const matchedFactors = criteria.filter((c) => c.status === "match").map((c) => c.label);
  const verifyFactors = criteria
    .filter((c) => c.status === "verify" || c.status === "unknown")
    .map((c) => c.label);
  const unmatchedFactors = criteria.filter((c) => c.status === "mismatch").map((c) => c.label);

  const reason =
    unmatchedFactors.length === 0
      ? `Your profile matches ${matchedFactors.length} of ${criteria.length} key criteria for this scheme.`
      : `Your profile matches ${matchedFactors.length} of ${criteria.length} criteria; ${unmatchedFactors.join(", ")} did not match.`;

  return {
    schemeId: scheme.id,
    matchScore,
    confidence,
    matchedFactors,
    unmatchedFactors,
    verifyFactors,
    ranking: 0,
    breakdown: {
      profileMatch,
      eligibilityMatch,
      documentReadiness: docReadiness,
    },
    reason,
  };
}

export const recommendationService = {
  async getRecommendations(
    profile: UserProfile,
    documents: UserDocument[] = [],
  ): Promise<Recommendation[]> {
    await delay(420);
    return SCHEMES.map((s) => score(profile, s, documents))
      .filter((r) => r.matchScore >= 45)
      .sort((a, b) => b.matchScore - a.matchScore)
      .map((r, i) => ({ ...r, ranking: i + 1 }));
  },

  async getRecommendationForScheme(
    profile: UserProfile,
    schemeId: string,
    documents: UserDocument[] = [],
  ): Promise<Recommendation | null> {
    await delay(180);
    const scheme = SCHEMES.find((s) => s.id === schemeId);
    if (!scheme) return null;
    return { ...score(profile, scheme, documents), ranking: 1 };
  },

  /**
   * Missed opportunities: reasonable matches the citizen has not saved or
   * viewed yet — surfaced so relevant benefits are not overlooked.
   */
  async getMissedOpportunities(
    profile: UserProfile,
    documents: UserDocument[] = [],
    excludeIds: string[] = [],
  ): Promise<Recommendation[]> {
    await delay(320);
    return SCHEMES.map((s) => score(profile, s, documents))
      .filter((r) => !excludeIds.includes(r.schemeId))
      .filter((r) => r.matchScore >= 55 && r.unmatchedFactors.length <= 1)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(3, 9)
      .map((r, i) => ({ ...r, ranking: i + 1, missed: true }));
  },
};
