import { SCHEMES } from '@/data/schemes';
import { computeProfileMatchWithBreakdown } from '@/lib/matching';
import { evaluateEligibilityEnhanced } from './eligibilityEngine';
import { calculateDocumentReadinessEnhanced } from './documentReadinessEngine';
import { getApplicationStatus, getDeadlineStatus } from './applicationStatusEngine';
import type {
  Scheme,
  UserProfile,
  UserDocument,
  ApplicationRecord,
  SchemeUrgencyResult,
  UrgencyLevel,
} from '@/lib/types';

/**
 * Feature 8 — Smart Deadline Risk / Urgency Engine
 *
 * Deterministically computes the application urgency level and deadline risk
 * score for a citizen. Combines remaining deadline days, profile match score,
 * document readiness, application status, and eligibility verdict.
 *
 * NOTE: The numerical score represents "Application Urgency / Deadline Risk Score"
 * (how urgently the citizen needs to act) — NOT official government approval probability.
 */
export function calculateSchemeUrgency(
  schemeId: string,
  profile: UserProfile,
  documents: UserDocument[] = [],
  applications: ApplicationRecord[] = [],
  schemes: Scheme[] = SCHEMES,
  referenceDate?: Date,
): SchemeUrgencyResult | null {
  const scheme = schemes.find((s) => s.id === schemeId);
  if (!scheme) return null;

  const eligibility = evaluateEligibilityEnhanced(profile, scheme.id, schemes);
  const docReadiness = calculateDocumentReadinessEnhanced(documents, scheme.id, schemes);
  const appStatus = getApplicationStatus(scheme.id, applications, schemes);
  const deadline = getDeadlineStatus(scheme.id, schemes, referenceDate);
  const matchResult = computeProfileMatchWithBreakdown(profile, scheme, documents);

  if (!eligibility || !docReadiness || !appStatus || !deadline) return null;

  const reasons: string[] = [];

  // Case 1: Eligibility FAILED -> BLOCKED
  if (eligibility.status === 'FAILED') {
    return {
      schemeId: scheme.id,
      schemeName: scheme.name,
      urgency: 'BLOCKED',
      daysRemaining: deadline.daysRemaining,
      deadlineDate: deadline.deadline,
      deadlineStatus: deadline.deadlineStatus,
      urgencyScore: 0,
      reason: ['Eligibility criteria not satisfied; application is blocked until profile conditions change.'],
    };
  }

  // Case 2: Deadline CLOSED
  if (deadline.deadlineStatus === 'CLOSED') {
    return {
      schemeId: scheme.id,
      schemeName: scheme.name,
      urgency: 'CLOSED',
      daysRemaining: 0,
      deadlineDate: deadline.deadline,
      deadlineStatus: 'CLOSED',
      urgencyScore: 0,
      reason: [`Application deadline passed on ${deadline.deadline}. Closed for current cycle.`],
    };
  }

  // Case 3: Already APPLIED
  if (appStatus.applicationStatus === 'APPLIED') {
    reasons.push('Application has already been submitted to the department.');
    if (deadline.daysRemaining > 0) {
      reasons.push(`${deadline.daysRemaining} days remaining in current notification window.`);
    }
    return {
      schemeId: scheme.id,
      schemeName: scheme.name,
      urgency: 'LOW',
      daysRemaining: deadline.daysRemaining,
      deadlineDate: deadline.deadline,
      deadlineStatus: deadline.deadlineStatus,
      urgencyScore: 15,
      reason: reasons,
    };
  }

  // Case 4: Open-ended scheme with NO DEADLINE
  if (deadline.deadlineStatus === 'NO_DEADLINE') {
    reasons.push('Open-ended scheme with no closing deadline.');
    if (matchResult.score >= 75) {
      reasons.push(`Strong profile match (${matchResult.score}%).`);
    }
    if (docReadiness.readinessScore < 100) {
      reasons.push(`${docReadiness.missing.length} required document(s) pending.`);
    }
    return {
      schemeId: scheme.id,
      schemeName: scheme.name,
      urgency: docReadiness.readinessScore < 100 ? 'MEDIUM' : 'LOW',
      daysRemaining: -1,
      deadlineDate: null,
      deadlineStatus: 'NO_DEADLINE',
      urgencyScore: docReadiness.readinessScore < 100 ? 40 : 20,
      reason: reasons,
    };
  }

  // Case 5: Active Deadline - Calculate Urgency Score
  let baseScore = 0;
  const days = deadline.daysRemaining;

  if (days <= 3) {
    baseScore = 85;
    reasons.push(`Critical: Only ${days} day(s) remain before deadline closes.`);
  } else if (days <= 7) {
    baseScore = 70;
    reasons.push(`Approaching fast: Only ${days} days remaining.`);
  } else if (days <= 30) {
    baseScore = 45;
    reasons.push(`${days} days remaining until deadline.`);
  } else {
    baseScore = 20;
    reasons.push(`${days} days remaining; ample time to prepare.`);
  }

  // Adjust urgency by Profile Match
  if (matchResult.score >= 80) {
    baseScore += 10;
    reasons.push(`High profile match (${matchResult.score}%) increases application priority.`);
  } else if (matchResult.score < 50) {
    baseScore -= 10;
  }

  // Adjust urgency by Document Readiness
  if (docReadiness.readinessScore < 100) {
    baseScore += 10;
    reasons.push(`${docReadiness.missing.length} document(s) still required before submission.`);
  }

  // Adjust urgency by Registration Status
  if (appStatus.applicationStatus === 'NOT_REGISTERED') {
    baseScore += 5;
    reasons.push('No registration record found on the application portal.');
  }

  const finalUrgencyScore = Math.max(5, Math.min(99, baseScore));

  let urgencyLevel: UrgencyLevel = 'MEDIUM';
  if (finalUrgencyScore >= 80) {
    urgencyLevel = 'CRITICAL';
  } else if (finalUrgencyScore >= 60) {
    urgencyLevel = 'HIGH';
  } else if (finalUrgencyScore >= 35) {
    urgencyLevel = 'MEDIUM';
  } else {
    urgencyLevel = 'LOW';
  }

  return {
    schemeId: scheme.id,
    schemeName: scheme.name,
    urgency: urgencyLevel,
    daysRemaining: days,
    deadlineDate: deadline.deadline,
    deadlineStatus: deadline.deadlineStatus,
    urgencyScore: finalUrgencyScore,
    reason: reasons,
  };
}
