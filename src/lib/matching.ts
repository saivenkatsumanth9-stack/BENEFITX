import type {
  EligibilityAssessment,
  EligibilityStatus,
  MatchFactor,
  Scheme,
  UserProfile,
  UserDocument,
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
    factors.push({
      label: "Age",
      required,
      yourValue: age === null ? "Not provided" : `${age} years`,
      status:
        age === null
          ? "unknown"
          : (e.ageMin === undefined || age >= e.ageMin) && (e.ageMax === undefined || age <= e.ageMax)
            ? "match"
            : "mismatch",
      weight: 1,
    });
  }

  if (e.incomeMax !== undefined) {
    const income = profile.annualIncome;
    factors.push({
      label: "Annual income",
      required: `Below ${rupees(e.incomeMax)}`,
      yourValue: income === null ? "Not provided" : rupees(income),
      status: income === null ? "unknown" : income <= e.incomeMax ? "match" : "mismatch",
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
    const value = c.status === "match" ? 1 : c.status === "verify" ? 0.6 : c.status === "unknown" ? 0.4 : 0;
    return sum + c.weight * value;
  }, 0);
  return Math.round((earned / total) * 100);
}

export function documentReadinessScore(scheme: Scheme, documents: UserDocument[]): number {
  const required = scheme.requiredDocuments;
  if (required.length === 0) return 100;
  const score = required.reduce((sum, name) => {
    const doc = documents.find((d) => d.name === name);
    if (!doc || doc.status === "missing") return sum;
    return sum + (doc.status === "available" ? 1 : 0.6);
  }, 0);
  return Math.round((score / required.length) * 100);
}
