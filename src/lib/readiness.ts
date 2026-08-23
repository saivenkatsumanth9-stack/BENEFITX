import { buildAssessment, documentReadinessScore } from "./matching";
import type { ChecklistItem, ReadinessResult, Scheme, UserDocument, UserProfile } from "./types";

/**
 * Pure application-readiness calculation.
 * UI-independent so it can be replaced by a backend endpoint later.
 */
export function calculateReadiness(
  profile: UserProfile,
  scheme: Scheme,
  documents: UserDocument[],
): ReadinessResult {
  const assessment = buildAssessment(profile, scheme);
  const eligibilityScore =
    assessment.status === "likely-eligible" ? 100 : assessment.status === "needs-verification" ? 70 : 35;

  const required = scheme.requiredDocuments;
  const missingDocuments = required.filter((name) => {
    const doc = documents.find((d) => d.name === name);
    return !doc || doc.status === "missing";
  });
  const verifyDocuments = required.filter((name) => {
    const doc = documents.find((d) => d.name === name);
    return doc?.status === "needs-verification";
  });

  const documentScore = documentReadinessScore(scheme, documents);
  const verifiedCount = required.filter(
    (name) => documents.find((d) => d.name === name)?.verified,
  ).length;
  const verificationScore = required.length ? Math.round((verifiedCount / required.length) * 100) : 100;

  const readinessScore = Math.round(
    eligibilityScore * 0.4 + documentScore * 0.4 + verificationScore * 0.2,
  );

  const nextActions: string[] = [
    ...missingDocuments.map((name) => `Upload ${name}`),
    ...verifyDocuments.map((name) => `Verify ${name}`),
  ];
  if (assessment.mismatchCount > 0)
    nextActions.push("Review the criteria that did not match on the eligibility page");
  if (!profile.age || !profile.state) nextActions.push("Complete your benefit profile");

  return {
    readinessScore,
    eligibilityScore,
    documentScore,
    verificationScore,
    completedRequirements: required.length - missingDocuments.length,
    totalRequirements: required.length,
    missingDocuments,
    verifyDocuments,
    nextActions,
  };
}

export function buildChecklist(scheme: Scheme, documents: UserDocument[]): ChecklistItem[] {
  const map = (name: string, optional: boolean): ChecklistItem => {
    const doc = documents.find((d) => d.name === name);
    return { name, optional, status: doc ? doc.status : "missing" };
  };
  return [
    ...scheme.requiredDocuments.map((n) => map(n, false)),
    ...(scheme.optionalDocuments ?? []).map((n) => map(n, true)),
  ];
}

/** Aggregate readiness across the schemes the citizen is tracking. */
export function calculateOverallReadiness(
  profile: UserProfile,
  schemes: Scheme[],
  documents: UserDocument[],
): ReadinessResult {
  if (schemes.length === 0) {
    const missing = documents.filter((d) => d.status === "missing").map((d) => d.name);
    return {
      readinessScore: 0,
      eligibilityScore: 0,
      documentScore: 0,
      verificationScore: 0,
      completedRequirements: 0,
      totalRequirements: 0,
      missingDocuments: missing,
      verifyDocuments: [],
      nextActions: ["Save a scheme to start tracking your application readiness"],
    };
  }

  const results = schemes.map((s) => calculateReadiness(profile, s, documents));
  const avg = (pick: (r: ReadinessResult) => number) =>
    Math.round(results.reduce((sum, r) => sum + pick(r), 0) / results.length);

  return {
    readinessScore: avg((r) => r.readinessScore),
    eligibilityScore: avg((r) => r.eligibilityScore),
    documentScore: avg((r) => r.documentScore),
    verificationScore: avg((r) => r.verificationScore),
    completedRequirements: results.reduce((s, r) => s + r.completedRequirements, 0),
    totalRequirements: results.reduce((s, r) => s + r.totalRequirements, 0),
    missingDocuments: [...new Set(results.flatMap((r) => r.missingDocuments))],
    verifyDocuments: [...new Set(results.flatMap((r) => r.verifyDocuments))],
    nextActions: [...new Set(results.flatMap((r) => r.nextActions))].slice(0, 6),
  };
}
