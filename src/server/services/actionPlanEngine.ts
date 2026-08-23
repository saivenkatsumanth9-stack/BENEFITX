import { SCHEMES } from '@/data/schemes';
import { evaluateEligibilityEnhanced } from './eligibilityEngine';
import { calculateDocumentReadinessEnhanced } from './documentReadinessEngine';
import { getApplicationStatus, getDeadlineStatus } from './applicationStatusEngine';
import type {
  Scheme,
  UserProfile,
  UserDocument,
  ApplicationRecord,
  ActionPlanResult,
  ActionStep,
  ActionPlanPriority,
  EnhancedEligibilityResult,
  EnhancedDocumentReadinessResult,
  ApplicationStatusResult,
  DeadlineResult,
} from '@/lib/types';

/**
 * Feature 7 — Personalized Action Plan Engine
 *
 * Deterministically constructs actionable, tailored next steps for a citizen
 * based on their live profile, eligibility evaluation, document readiness,
 * application pipeline stage, and deadline constraints.
 */
export function generateActionPlan(
  schemeId: string,
  profile: UserProfile,
  documents: UserDocument[] = [],
  applications: ApplicationRecord[] = [],
  schemes: Scheme[] = SCHEMES,
  referenceDate?: Date,
): ActionPlanResult | null {
  const scheme = schemes.find((s) => s.id === schemeId);
  if (!scheme) return null;

  // 1. Evaluate underlying engines deterministically
  const eligibility: EnhancedEligibilityResult | null = evaluateEligibilityEnhanced(profile, scheme.id, schemes);
  const docReadiness: EnhancedDocumentReadinessResult | null = calculateDocumentReadinessEnhanced(documents, scheme.id, schemes);
  const appStatus: ApplicationStatusResult | null = getApplicationStatus(scheme.id, applications, schemes);
  const deadline: DeadlineResult | null = getDeadlineStatus(scheme.id, schemes, referenceDate);

  if (!eligibility || !docReadiness || !appStatus || !deadline) return null;

  const steps: ActionStep[] = [];
  let currentOrder = 1;

  // Case A: Scheme Deadline has PASSED (CLOSED)
  if (deadline.deadlineStatus === 'CLOSED') {
    return {
      schemeId: scheme.id,
      schemeName: scheme.name,
      priority: 'LOW',
      status: 'CLOSED',
      summary: `The application deadline for ${scheme.name} closed on ${deadline.deadline}. You cannot apply for the current cycle.`,
      steps: [
        {
          order: 1,
          type: 'INFORMATION',
          action: 'Monitor next notification cycle',
          reason: 'Application window has closed for the current fiscal year.',
          priority: 'LOW',
        },
        {
          order: 2,
          type: 'INFORMATION',
          action: 'Explore related alternative schemes',
          reason: 'Other complementary welfare schemes may currently have open application windows.',
          priority: 'LOW',
        },
      ],
      totalSteps: 2,
    };
  }

  // Case B: Mandatory Eligibility Criteria FAILED (BLOCKED)
  if (eligibility.status === 'FAILED') {
    const failedDescriptions = eligibility.failedConditions.join('; ');
    return {
      schemeId: scheme.id,
      schemeName: scheme.name,
      priority: 'BLOCKED',
      status: 'BLOCKED',
      summary: `Based on your profile, you do not currently meet mandatory criteria: ${failedDescriptions}`,
      steps: [
        {
          order: 1,
          type: 'PROFILE_UPDATE',
          action: 'Review failed eligibility conditions in your profile',
          reason: `Criteria mismatch: ${failedDescriptions}`,
          priority: 'HIGH',
        },
        {
          order: 2,
          type: 'INFORMATION',
          action: 'Update profile if personal or financial circumstances change',
          reason: 'Changes to income, education level, or employment status may make you eligible in the future.',
          priority: 'MEDIUM',
        },
      ],
      totalSteps: 2,
    };
  }

  // Case C: Application already APPLIED (COMPLETED)
  if (appStatus.applicationStatus === 'APPLIED') {
    return {
      schemeId: scheme.id,
      schemeName: scheme.name,
      priority: 'COMPLETED',
      status: 'COMPLETED',
      summary: `Application submitted for ${scheme.name}. Current pipeline stage: ${appStatus.statusNote}`,
      steps: [
        {
          order: 1,
          type: 'TRACK_APPLICATION',
          action: `Track status on official portal (${scheme.sourceName})`,
          reason: 'Your application has been registered with the nodal department.',
          priority: 'LOW',
        },
        {
          order: 2,
          type: 'DOCUMENT',
          action: 'Retain physical and digital copies of submitted documents',
          reason: 'Required for physical verification during nodal verification if requested.',
          priority: 'LOW',
        },
      ],
      totalSteps: 2,
    };
  }

  // Case D: Action Required (Missing info, missing docs, registration, submission)
  const isClosingSoon = deadline.deadlineStatus === 'CLOSING_SOON';
  const isApproaching = deadline.deadlineStatus === 'DEADLINE_APPROACHING';

  // 1. Missing profile information
  if (eligibility.missingInformation.length > 0) {
    steps.push({
      order: currentOrder++,
      type: 'VERIFY_INFORMATION',
      action: 'Complete missing profile information',
      reason: `Required to confirm full eligibility: ${eligibility.missingInformation.join(', ')}`,
      priority: isClosingSoon ? 'CRITICAL' : 'HIGH',
    });
  }

  // 2. Expired documents renewal
  if (docReadiness.expired.length > 0) {
    for (const expDoc of docReadiness.expired) {
      steps.push({
        order: currentOrder++,
        type: 'DOCUMENT_RENEWAL',
        action: `Renew expired document: ${expDoc}`,
        reason: 'Expired documents are rejected by official government verification portals.',
        priority: isClosingSoon ? 'CRITICAL' : 'HIGH',
        documentName: expDoc,
      });
    }
  }

  // 3. Missing documents
  if (docReadiness.missing.length > 0) {
    for (const missDoc of docReadiness.missing) {
      steps.push({
        order: currentOrder++,
        type: 'DOCUMENT',
        action: `Obtain required document: ${missDoc}`,
        reason: 'Mandatory certificate required for application submission.',
        priority: isClosingSoon ? 'CRITICAL' : 'HIGH',
        documentName: missDoc,
      });
    }
  }

  // 4. Registration requirement
  if (appStatus.applicationStatus === 'NOT_REGISTERED') {
    steps.push({
      order: currentOrder++,
      type: 'REGISTRATION',
      action: `Register user account on official portal (${scheme.sourceName})`,
      reason: 'Citizen registration is required before submitting the scheme application.',
      priority: isClosingSoon ? 'CRITICAL' : 'HIGH',
    });
  }

  // 5. Final Application submission
  steps.push({
    order: currentOrder++,
    type: 'APPLICATION',
    action: `Submit application on ${scheme.sourceName}`,
    reason: isClosingSoon
      ? `Urgent: Application deadline closes in ${deadline.daysRemaining} days.`
      : 'Once all documents are uploaded, complete and submit the official form.',
    priority: isClosingSoon ? 'CRITICAL' : isApproaching ? 'HIGH' : 'MEDIUM',
  });

  // Determine overall plan priority
  let overallPriority: ActionPlanPriority = 'MEDIUM';
  if (isClosingSoon && (docReadiness.missing.length > 0 || appStatus.applicationStatus === 'NOT_REGISTERED')) {
    overallPriority = 'CRITICAL';
  } else if (isClosingSoon || isApproaching || docReadiness.missing.length > 0) {
    overallPriority = 'HIGH';
  } else if (steps.length === 1) {
    overallPriority = 'LOW';
  }

  const summary = isClosingSoon
    ? `URGENT: Application deadline is in ${deadline.daysRemaining} days. Complete ${steps.length} remaining step(s) immediately.`
    : `Follow ${steps.length} personalized step(s) to prepare and submit your application for ${scheme.name}.`;

  return {
    schemeId: scheme.id,
    schemeName: scheme.name,
    priority: overallPriority,
    status: 'ACTION_REQUIRED',
    summary,
    steps,
    totalSteps: steps.length,
  };
}
