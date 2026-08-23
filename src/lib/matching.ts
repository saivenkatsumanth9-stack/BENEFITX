import type {
  EligibilityAssessment,
  EligibilityStatus,
  MatchFactor,
  Scheme,
  UserProfile,
  UserDocument,
  ScoreBreakdownItem,
  DataConfidence,
  MatchLabel,
  ProfileMatchResult,
} from "./types";

const rupees = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
    value,
  );

export const formatINR = rupees;

/**
 * Rule-based criteria evaluation.
 * This is a transparent, explainable layer — NOT an official eligibility decision.
 * It can later be replaced by a backend rules engine returning the same MatchFactor[].
 */
export function evaluateCriteria(profile: UserProfile, scheme: Scheme): MatchFactor[] {
  const e = scheme.eligibility;
  const factors: MatchFactor[] = [];

  if (e.ageMin !== undefined || e.ageMax !== undefined) {
    const required =
      e.ageMin !== undefined && e.ageMax !== undefined
        ? `${e.ageMin}–${e.ageMax} years`
        : e.ageMin !== undefined
          ? `${e.ageMin} years and above`
          : `Up to ${e.ageMax} years`;
    const age = profile.age;
    let ageStatus: MatchFactor["status"] = "unknown";
    if (age !== null) {
      const inRange =
        (e.ageMin === undefined || age >= e.ageMin) && (e.ageMax === undefined || age <= e.ageMax);
      if (inRange) {
        ageStatus = "match";
      } else {
        // PARTIAL: within 2 years or 10% of boundary
        const margin = Math.max(2, Math.round(((e.ageMax ?? e.ageMin ?? 20) - (e.ageMin ?? 0)) * 0.1));
        const nearMin = e.ageMin !== undefined && age < e.ageMin && age >= e.ageMin - margin;
        const nearMax = e.ageMax !== undefined && age > e.ageMax && age <= e.ageMax + margin;
        ageStatus = nearMin || nearMax ? "partial" : "mismatch";
      }
    }
    factors.push({
      label: "Age",
      required,
      yourValue: age === null ? "Not provided" : `${age} years`,
      status: ageStatus,
      weight: 1,
    });
  }

  if (e.incomeMax !== undefined) {
    const income = profile.annualIncome;
    let incomeStatus: MatchFactor["status"] = "unknown";
    if (income !== null) {
      if (income <= e.incomeMax) {
        incomeStatus = "match";
      } else if (income <= e.incomeMax * 1.1) {
        incomeStatus = "partial"; // Within 10% over threshold
      } else {
        incomeStatus = "mismatch";
      }
    }
    factors.push({
      label: "Annual income",
      required: `Below ${rupees(e.incomeMax)}`,
      yourValue: income === null ? "Not provided" : rupees(income),
      status: incomeStatus,
      weight: 1.2,
    });
  }

  if (e.states && e.states.length > 0) {
    factors.push({
      label: "State",
      required: e.states.join(", "),
      yourValue: profile.state || "Not provided",
      status: !profile.state ? "unknown" : e.states.includes(profile.state) ? "match" : "mismatch",
      weight: 1.4,
    });
  }

  if (e.areaTypes && e.areaTypes.length > 0) {
    factors.push({
      label: "Area type",
      required: e.areaTypes.join(" / "),
      yourValue: profile.areaType || "Not provided",
      status: !profile.areaType
        ? "unknown"
        : e.areaTypes.includes(profile.areaType as never)
          ? "match"
          : "mismatch",
      weight: 0.8,
    });
  }

  if (e.education && e.education.length > 0) {
    const ok = profile.educationLevel && e.education.includes(profile.educationLevel as never);
    factors.push({
      label: "Education",
      required: e.education.join(", "),
      yourValue: profile.educationLevel || "Not provided",
      status: !profile.educationLevel ? "unknown" : ok ? "match" : "verify",
      weight: 1,
    });
  }

  if (e.occupations && e.occupations.length > 0) {
    const ok = profile.occupation && e.occupations.includes(profile.occupation as never);
    factors.push({
      label: "Occupation",
      required: e.occupations.join(", "),
      yourValue: profile.occupation || "Not provided",
      status: !profile.occupation ? "unknown" : ok ? "match" : "mismatch",
      weight: 1,
    });
  }

  if (e.genders && e.genders.length > 0) {
    factors.push({
      label: "Applicant category",
      required: e.genders.join(", "),
      yourValue: profile.gender || "Not provided",
      status: !profile.gender
        ? "unknown"
        : e.genders.includes(profile.gender as never)
          ? "match"
          : "mismatch",
      weight: 1.2,
    });
  }

  if (e.farmerRequired) {
    factors.push({
      label: "Farmer status",
      required: "Landholding farmer",
      yourValue: profile.isFarmer ? "Farmer" : "Not a farmer",
      status: profile.isFarmer ? "match" : "mismatch",
      weight: 1.2,
    });
  }

  (e.notes ?? []).forEach((note) => {
    factors.push({
      label: "Additional condition",
      required: note,
      yourValue: "Self-declaration required",
      status: "verify",
      weight: 0.5,
    });
  });

  return factors;
}

export function statusFromCriteria(criteria: MatchFactor[]): EligibilityStatus {
  const mismatch = criteria.filter((c) => c.status === "mismatch").length;
  const unknown = criteria.filter((c) => c.status === "unknown").length;
  if (mismatch > 1) return "likely-not-eligible";
  if (mismatch === 1) return "needs-verification";
  if (unknown > 0) return "needs-verification";
  return "likely-eligible";
}

export function buildAssessment(profile: UserProfile, scheme: Scheme): EligibilityAssessment {
  const criteria = evaluateCriteria(profile, scheme);
  return {
    schemeId: scheme.id,
    status: statusFromCriteria(criteria),
    criteria,
    matchedCount: criteria.filter((c) => c.status === "match").length,
    verifyCount: criteria.filter((c) => c.status === "verify" || c.status === "unknown").length,
    mismatchCount: criteria.filter((c) => c.status === "mismatch").length,
    note: "Eligibility information is based on the configured scheme rules. Always verify the latest official notification before applying.",
  };
}

/** Weighted 0–100 score derived from the evaluated criteria. */
export function profileMatchScore(criteria: MatchFactor[]): number {
  if (criteria.length === 0) return 70;
  const total = criteria.reduce((sum, c) => sum + c.weight, 0);
  const earned = criteria.reduce((sum, c) => {
    const value = c.status === "match" ? 1 : c.status === "partial" ? 0.75 : c.status === "verify" ? 0.6 : c.status === "unknown" ? 0.4 : 0;
    return sum + c.weight * value;
  }, 0);
  return Math.round((earned / total) * 100);
}

export function documentReadinessScore(scheme: Scheme, documents: UserDocument[]): number {
  const required = scheme.requiredDocuments;
  if (required.length === 0) return 100;
  const score = required.reduce((sum, name) => {
    const doc = documents.find((d) => d.name === name);
    if (!doc || doc.status === "missing" || doc.status === "expired") return sum;
    return sum + (doc.status === "available" ? 1 : 0.6);
  }, 0);
  return Math.round((score / required.length) * 100);
}

// ===================================================================
// DYNAMIC PROFILE MATCH SCORING SYSTEM
// ===================================================================

/**
 * Priority base weights for each eligibility dimension.
 * These are the starting weights BEFORE scheme-specific normalization.
 */
const CRITERIA_PRIORITY_MAP: Record<string, number> = {
  "Annual income": 25,
  "State": 20,
  "Age": 15,
  "Education": 15,
  "Occupation": 10,
  "Applicant category": 10,
  "Area type": 8,
  "Farmer status": 8,
  "Additional condition": 3,
};

/**
 * Generates scheme-specific weights by examining which eligibility
 * dimensions a scheme actually defines. Normalizes weights to sum to 100.
 *
 * Different schemes with different criteria naturally produce different
 * weight distributions, ensuring scores are NOT identical across schemes.
 */
export function generateSchemeWeights(scheme: Scheme): Record<string, number> {
  const e = scheme.eligibility;
  const activeLabels: string[] = [];

  if (e.ageMin !== undefined || e.ageMax !== undefined) activeLabels.push("Age");
  if (e.incomeMax !== undefined) activeLabels.push("Annual income");
  if (e.states && e.states.length > 0) activeLabels.push("State");
  if (e.areaTypes && e.areaTypes.length > 0) activeLabels.push("Area type");
  if (e.education && e.education.length > 0) activeLabels.push("Education");
  if (e.occupations && e.occupations.length > 0) activeLabels.push("Occupation");
  if (e.genders && e.genders.length > 0) activeLabels.push("Applicant category");
  if (e.farmerRequired) activeLabels.push("Farmer status");
  const noteCount = (e.notes ?? []).length;
  for (let i = 0; i < noteCount; i++) activeLabels.push("Additional condition");

  if (activeLabels.length === 0) {
    return {};
  }

  // Sum raw priorities for active labels
  const rawTotal = activeLabels.reduce((sum, label) => sum + (CRITERIA_PRIORITY_MAP[label] ?? 3), 0);

  // Normalize to sum to 100
  const weights: Record<string, number> = {};
  for (const label of activeLabels) {
    const rawWeight = CRITERIA_PRIORITY_MAP[label] ?? 3;
    const normalized = Math.round((rawWeight / rawTotal) * 100);
    // If a label appears multiple times (notes), accumulate
    weights[label] = (weights[label] ?? 0) + normalized;
  }

  return weights;
}

/**
 * Builds per-criterion score breakdown using scheme-specific dynamic weights.
 */
export function buildScoreBreakdown(
  criteria: MatchFactor[],
  schemeWeights: Record<string, number>,
): ScoreBreakdownItem[] {
  return criteria.map((c) => {
    const dynamicWeight = schemeWeights[c.label] ?? 5;
    const statusValue = c.status === "match" ? 1.0
      : c.status === "partial" ? 0.75
      : c.status === "verify" ? 0.6
      : c.status === "unknown" ? 0.4
      : 0;
    const points = Math.round(dynamicWeight * statusValue * 10) / 10;
    const statusMap: Record<string, ScoreBreakdownItem["status"]> = {
      match: "MATCHED",
      partial: "PARTIAL",
      mismatch: "FAILED",
      unknown: "UNKNOWN",
      verify: "VERIFY",
    };
    return {
      label: c.label,
      weight: dynamicWeight,
      status: statusMap[c.status] ?? "UNKNOWN",
      points,
      maxPoints: dynamicWeight,
      yourValue: c.yourValue,
      required: c.required,
    };
  });
}

/**
 * Calculates data confidence based on the proportion of criteria
 * with known data (match, partial, mismatch) vs unknown/verify.
 */
export function calculateDataConfidence(criteria: MatchFactor[]): DataConfidence {
  if (criteria.length === 0) return "LOW";
  const known = criteria.filter((c) => c.status === "match" || c.status === "partial" || c.status === "mismatch").length;
  const ratio = known / criteria.length;
  if (ratio >= 0.8) return "HIGH";
  if (ratio >= 0.5) return "MEDIUM";
  return "LOW";
}

/**
 * Classifies a match score into a human-readable label.
 */
export function classifyMatchLabel(score: number): MatchLabel {
  if (score >= 90) return "EXCELLENT_MATCH";
  if (score >= 75) return "STRONG_MATCH";
  if (score >= 60) return "POTENTIAL_MATCH";
  if (score >= 40) return "LOW_MATCH";
  return "WEAK_MATCH";
}

/**
 * Enhanced scoring that uses scheme-specific dynamic weights.
 *
 * Returns a complete ProfileMatchResult with breakdown, confidence, and label.
 * This is the PRIMARY entry point for the new scoring system.
 */
export function computeProfileMatchWithBreakdown(
  profile: UserProfile,
  scheme: Scheme,
  documents: UserDocument[] = [],
): ProfileMatchResult {
  const criteria = evaluateCriteria(profile, scheme);
  const schemeWeights = generateSchemeWeights(scheme);
  const breakdown = buildScoreBreakdown(criteria, schemeWeights);

  // Calculate score from dynamic weights
  const totalWeight = breakdown.reduce((sum, b) => sum + b.maxPoints, 0);
  const earnedPoints = breakdown.reduce((sum, b) => sum + b.points, 0);
  const dynamicProfileScore = totalWeight > 0 ? Math.round((earnedPoints / totalWeight) * 100) : 70;

  // Eligibility & document scores remain as composites
  const assessment = buildAssessment(profile, scheme);
  const eligibilityMatch = assessment.status === "likely-eligible" ? 100
    : assessment.status === "needs-verification" ? 72 : 38;
  const docReadiness = documentReadinessScore(scheme, documents);

  // Final composite score with dynamic weights
  const compositeScore = Math.max(5, Math.min(99,
    Math.round(dynamicProfileScore * 0.50 + eligibilityMatch * 0.35 + docReadiness * 0.15),
  ));

  const dataConfidence = calculateDataConfidence(criteria);
  const label = classifyMatchLabel(compositeScore);

  return {
    score: compositeScore,
    label,
    dataConfidence,
    breakdown,
    criteriaEvaluated: criteria.length,
    criteriaMatched: criteria.filter((c) => c.status === "match").length,
    criteriaPartial: criteria.filter((c) => c.status === "partial").length,
    criteriaFailed: criteria.filter((c) => c.status === "mismatch").length,
    criteriaUnknown: criteria.filter((c) => c.status === "unknown" || c.status === "verify").length,
  };
}

/**
 * Enhanced status classification supporting PARTIALLY_MATCHED.
 */
export function statusFromCriteriaEnhanced(
  criteria: MatchFactor[],
): "MATCHED" | "PARTIALLY_MATCHED" | "FAILED" | "UNKNOWN" {
  const mismatch = criteria.filter((c) => c.status === "mismatch").length;
  const partial = criteria.filter((c) => c.status === "partial").length;
  const unknown = criteria.filter((c) => c.status === "unknown" || c.status === "verify").length;

  if (mismatch > 0) return "FAILED";
  if (unknown > 0) return "UNKNOWN";
  if (partial > 0) return "PARTIALLY_MATCHED";
  return "MATCHED";
}
