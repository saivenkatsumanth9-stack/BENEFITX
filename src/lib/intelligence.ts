import { SCHEMES } from "@/data/schemes";
import { evaluateCriteria, buildAssessment, profileMatchScore, documentReadinessScore, computeProfileMatchWithBreakdown } from "./matching";
import type {
  Scheme,
  UserProfile,
  UserDocument,
  ApplicationRecord,
  ActionPlanResult,
  ActionStep,
  ActionPlanPriority,
  SchemeUrgencyResult,
  UrgencyLevel,
  RelatedSchemesResult,
  RelatedSchemeItem,
  SchemeRelationshipType,
} from "./types";

/**
 * Pure client-safe action plan generator.
 */
export function buildActionPlan(
  scheme: Scheme,
  profile: UserProfile,
  documents: UserDocument[] = [],
  applications: ApplicationRecord[] = [],
): ActionPlanResult {
  const criteria = evaluateCriteria(profile, scheme);
  const assessment = buildAssessment(profile, scheme);
  const appRecord = applications.find((a) => a.schemeId === scheme.id);
  const isApplied = appRecord?.status === "Applied" || appRecord?.status === "Under Review" || appRecord?.status === "Completed";

  const totalDocs = scheme.requiredDocuments.length;
  const missingDocs = scheme.requiredDocuments.filter((name) => {
    const d = documents.find((doc) => doc.name === name);
    return !d || d.status === "missing";
  });

  const steps: ActionStep[] = [];
  let order = 1;

  if (isApplied) {
    return {
      schemeId: scheme.id,
      schemeName: scheme.name,
      priority: "COMPLETED",
      status: "COMPLETED",
      summary: `Application submitted. Current status: ${appRecord?.status || "Applied"}.`,
      steps: [
        {
          order: 1,
          type: "TRACK_APPLICATION",
          action: `Track status on official portal (${scheme.sourceName})`,
          reason: "Your application has been registered with the nodal department.",
          priority: "LOW",
        },
        {
          order: 2,
          type: "DOCUMENT",
          action: "Retain physical and digital copies of submitted certificates",
          reason: "May be required for physical verification during nodal review.",
          priority: "LOW",
        },
      ],
      totalSteps: 2,
    };
  }

  if (assessment.status === "likely-not-eligible") {
    const failedCriteria = criteria.filter((c) => c.status === "mismatch").map((c) => c.label).join(", ");
    return {
      schemeId: scheme.id,
      schemeName: scheme.name,
      priority: "BLOCKED",
      status: "BLOCKED",
      summary: `Based on your profile, you do not currently meet mandatory criteria: ${failedCriteria || "Eligibility conditions mismatch"}.`,
      steps: [
        {
          order: 1,
          type: "PROFILE_UPDATE",
          action: "Review mismatching eligibility conditions in your profile",
          reason: `Criteria mismatch: ${failedCriteria}`,
          priority: "HIGH",
        },
      ],
      totalSteps: 1,
    };
  }

  // Missing documents
  if (missingDocs.length > 0) {
    for (const doc of missingDocs) {
      steps.push({
        order: order++,
        type: "DOCUMENT",
        action: `Obtain required certificate: ${doc}`,
        reason: "Mandatory document for portal verification.",
        priority: "HIGH",
        documentName: doc,
      });
    }
  }

  // Registration step
  if (!appRecord) {
    steps.push({
      order: order++,
      type: "REGISTRATION",
      action: `Register citizen account on ${scheme.sourceName}`,
      reason: "Portal registration required before form submission.",
      priority: "HIGH",
    });
  }

  // Final application submission
  steps.push({
    order: order++,
    type: "APPLICATION",
    action: `Submit application on ${scheme.sourceName}`,
    reason: "Once documents are prepared, complete and submit the official form.",
    priority: "MEDIUM",
  });

  return {
    schemeId: scheme.id,
    schemeName: scheme.name,
    priority: missingDocs.length > 0 ? "HIGH" : "MEDIUM",
    status: "ACTION_REQUIRED",
    summary: `Follow ${steps.length} sequential step(s) to prepare and submit your application for ${scheme.name}.`,
    steps,
    totalSteps: steps.length,
  };
}

/**
 * Pure client-safe urgency calculator.
 */
export function buildSchemeUrgency(
  scheme: Scheme,
  profile: UserProfile,
  documents: UserDocument[] = [],
  applications: ApplicationRecord[] = [],
): SchemeUrgencyResult {
  const isApplied = applications.some((a) => a.schemeId === scheme.id && a.status === "Applied");
  const matchResult = computeProfileMatchWithBreakdown(profile, scheme, documents);

  let daysRemaining = -1;
  let deadlineStatus: SchemeUrgencyResult["deadlineStatus"] = "NO_DEADLINE";

  if (scheme.deadline) {
    const diff = Math.ceil((new Date(scheme.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    daysRemaining = diff;
    if (diff <= 0) deadlineStatus = "CLOSED";
    else if (diff <= 7) deadlineStatus = "CLOSING_SOON";
    else if (diff <= 30) deadlineStatus = "DEADLINE_APPROACHING";
    else deadlineStatus = "OPEN";
  }

  if (deadlineStatus === "CLOSED") {
    return {
      schemeId: scheme.id,
      schemeName: scheme.name,
      urgency: "CLOSED",
      daysRemaining: 0,
      deadlineDate: scheme.deadline ?? null,
      deadlineStatus: "CLOSED",
      urgencyScore: 0,
      reason: ["Deadline passed for the current cycle."],
    };
  }

  if (isApplied) {
    return {
      schemeId: scheme.id,
      schemeName: scheme.name,
      urgency: "LOW",
      daysRemaining,
      deadlineDate: scheme.deadline ?? null,
      deadlineStatus,
      urgencyScore: 15,
      reason: ["Application has already been submitted to the nodal department."],
    };
  }

  let urgencyScore = 30;
  if (daysRemaining > 0 && daysRemaining <= 7) urgencyScore = 80;
  else if (daysRemaining > 0 && daysRemaining <= 30) urgencyScore = 55;

  if (matchResult.score >= 80) urgencyScore += 10;

  const urgencyLevel: UrgencyLevel =
    urgencyScore >= 80 ? "CRITICAL" : urgencyScore >= 60 ? "HIGH" : urgencyScore >= 35 ? "MEDIUM" : "LOW";

  return {
    schemeId: scheme.id,
    schemeName: scheme.name,
    urgency: urgencyLevel,
    daysRemaining,
    deadlineDate: scheme.deadline ?? null,
    deadlineStatus,
    urgencyScore,
    reason: [
      daysRemaining > 0 ? `${daysRemaining} days remaining until deadline.` : "Open-ended application cycle.",
      `Profile match score is ${matchResult.score}%.`,
    ],
  };
}

/**
 * Pure client-safe related schemes discovery.
 */
export function buildRelatedSchemes(
  scheme: Scheme,
  profile?: UserProfile,
  limit: number = 3,
): RelatedSchemesResult {
  const others = SCHEMES.filter((s) => s.id !== scheme.id);
  const items: RelatedSchemeItem[] = [];

  for (const candidate of others) {
    let score = 0;
    let type: SchemeRelationshipType = "SAME_CATEGORY";
    let reason = "Shares compatible benefits and criteria.";

    if (candidate.category === scheme.category) {
      score += 40;
      type = "SAME_CATEGORY";
      reason = `Both schemes operate in the ${scheme.category} sector.`;
    }

    const candidateOccs = candidate.eligibility.occupations ?? [];
    const sourceOccs = scheme.eligibility.occupations ?? [];
    const sharedOccs = candidateOccs.filter((o) => sourceOccs.includes(o));
    if (sharedOccs.length > 0) {
      score += 30;
      type = "SAME_TARGET_GROUP";
      reason = `Targets ${sharedOccs.join(", ").toLowerCase()} beneficiaries.`;
    }

    if (score < 30) continue;

    let profileScore: number | null = null;
    let combinedScore = score;

    if (profile) {
      const match = computeProfileMatchWithBreakdown(profile, candidate);
      profileScore = match.score;
      combinedScore = Math.round(profileScore * 0.6 + score * 0.4);
    }

    items.push({
      schemeId: candidate.id,
      schemeName: candidate.name,
      category: candidate.category,
      benefitSummary: candidate.benefitSummary,
      relationshipType: type,
      relationshipScore: score,
      profileMatchScore: profileScore,
      combinedScore,
      reason,
    });
  }

  items.sort((a, b) => b.combinedScore - a.combinedScore);

  return {
    sourceScheme: {
      id: scheme.id,
      name: scheme.name,
      category: scheme.category,
    },
    relatedSchemes: items.slice(0, limit),
  };
}
