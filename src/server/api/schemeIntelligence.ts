import { createServerFn } from '@tanstack/react-start';
import { SchemeIntelligenceRequestSchema } from '../types';
import type { SchemeIntelligenceResult } from '../types';
import { requireAuth } from '../auth';
import { createSuccessResponse, createErrorResponse } from '../middleware';
import { computeProfileMatchWithBreakdown } from '@/lib/matching';
import { evaluateEligibilityEnhanced } from '../services/eligibilityEngine';
import { calculateDocumentReadinessEnhanced } from '../services/documentReadinessEngine';
import { getApplicationStatus, getDeadlineStatus } from '../services/applicationStatusEngine';
import { generateActionPlan } from '../services/actionPlanEngine';
import { calculateSchemeUrgency } from '../services/urgencyEngine';
import { findRelatedSchemes } from '../services/relatedSchemeEngine';
import { SCHEMES } from '@/data/schemes';
import type { UserProfile, UserDocument, ApplicationRecord } from '@/lib/types';

/**
 * Unified Scheme Intelligence API
 *
 * Returns complete intelligence for a single scheme:
 * - Dynamic Profile Match Score + Breakdown
 * - Explainable Eligibility Status
 * - Smart Document Readiness Assessment
 * - Application Status & Pipeline Tracking
 * - Real-Time Deadline Status
 * - Multi-Factor Application Urgency & Deadline Risk Score
 * - Context-Aware Personalized Action Plan
 * - Ranked Related Schemes
 */
export const getSchemeIntelligence = createServerFn({ method: 'POST' })
  .validator((input: unknown) => {
    const parsed = SchemeIntelligenceRequestSchema.safeParse(input);
    if (!parsed.success) {
      throw new Error(`Invalid request: ${parsed.error.issues.map((i) => i.message).join(', ')}`);
    }
    return parsed.data;
  })
  .handler(async ({ data }) => {
    try {
      requireAuth('citizen');

      const { schemeId, profile, documents, applications } = data;

      const scheme = SCHEMES.find((s) => s.id === schemeId);
      if (!scheme) {
        return createErrorResponse(
          'SCHEME_NOT_FOUND',
          `Scheme with id "${schemeId}" not found`,
        );
      }

      const userProfile = profile as unknown as UserProfile;
      const userDocuments = (documents ?? []) as unknown as UserDocument[];
      const userApplications = (applications ?? []) as unknown as ApplicationRecord[];

      // 1. Dynamic Profile Match Score with Criteria Breakdown
      const match = computeProfileMatchWithBreakdown(userProfile, scheme, userDocuments);

      // 2. Explainable Eligibility Engine
      const eligibility = evaluateEligibilityEnhanced(userProfile, schemeId);

      // 3. Smart Document Readiness Engine
      const docReadiness = calculateDocumentReadinessEnhanced(userDocuments, schemeId);

      // 4. Application Status Engine
      const appStatus = getApplicationStatus(schemeId, userApplications);

      // 5. Deadline Tracker Engine
      const deadline = getDeadlineStatus(schemeId);

      // 6. Smart Deadline Risk / Urgency Engine
      const urgency = calculateSchemeUrgency(
        schemeId,
        userProfile,
        userDocuments,
        userApplications,
        SCHEMES,
      );

      // 7. Personalized Action Plan Engine
      const actionPlan = generateActionPlan(
        schemeId,
        userProfile,
        userDocuments,
        userApplications,
        SCHEMES,
      );

      // 8. Related Scheme Discovery Engine
      const relatedResult = findRelatedSchemes(
        schemeId,
        userProfile,
        SCHEMES,
        4,
      );

      if (!eligibility || !docReadiness || !appStatus || !deadline || !urgency || !actionPlan || !relatedResult) {
        return createErrorResponse(
          'INTELLIGENCE_ERROR',
          'Failed to compute one or more intelligence components',
        );
      }

      // 9. Recommended Action Summary
      const action = determineAction(
        eligibility.status,
        docReadiness.readinessScore,
        appStatus.applicationStatus,
        deadline.deadlineStatus,
      );

      const result: SchemeIntelligenceResult = {
        scheme: {
          id: scheme.id,
          name: scheme.name,
          category: scheme.category,
          department: scheme.department,
        },
        match,
        eligibility,
        documents: docReadiness,
        application: appStatus,
        deadline,
        urgency,
        actionPlan,
        relatedSchemes: relatedResult.relatedSchemes,
        action,
      };

      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(
        'SCHEME_INTELLIGENCE_ERROR',
        error instanceof Error ? error.message : 'Failed to compute scheme intelligence',
      );
    }
  });

/**
 * Determines the recommended action based on eligibility, documents,
 * application status, and deadline.
 */
function determineAction(
  eligibilityStatus: string,
  docReadinessScore: number,
  appStatus: string,
  deadlineStatus: string,
): { required: boolean; message: string } {
  if (appStatus === 'APPLIED') {
    return { required: false, message: 'Application submitted. Check the official portal for status updates.' };
  }

  if (deadlineStatus === 'CLOSED') {
    return { required: false, message: 'The application deadline for this scheme has passed.' };
  }

  if (eligibilityStatus === 'FAILED') {
    return { required: true, message: 'You do not currently meet the eligibility criteria. Review the failed conditions and update your profile if your circumstances have changed.' };
  }

  if (docReadinessScore < 100) {
    if (deadlineStatus === 'CLOSING_SOON') {
      return { required: true, message: 'URGENT: The deadline is closing soon and you still have missing documents. Upload required documents immediately to apply in time.' };
    }
    return { required: true, message: 'Gather your missing documents to improve application readiness. Upload them in the Documents section.' };
  }

  if (deadlineStatus === 'CLOSING_SOON') {
    return { required: true, message: 'URGENT: You are ready to apply and the deadline is closing soon. Submit your application now!' };
  }

  if (deadlineStatus === 'DEADLINE_APPROACHING') {
    return { required: true, message: 'You are ready to apply. The deadline is approaching — consider applying soon.' };
  }

  return { required: true, message: 'You appear eligible and your documents are ready. Proceed to apply through the official portal.' };
}
