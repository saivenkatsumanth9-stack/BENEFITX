import { createServerFn } from '@tanstack/react-start';
import { SCHEMES } from '@/data/schemes';
import { evaluateEligibility } from '@/server/services/eligibilityEngine';
import { createSuccessResponse, createErrorResponse } from '@/server/middleware';
import { requireAuth } from '@/server/auth';
import { EligibilityRequestSchema } from '@/server/types';
import type { UserProfile } from '@/lib/types';

/**
 * API: Explainable Eligibility
 * Returns MATCHED | FAILED | UNKNOWN with human-readable condition explanations.
 *
 * The system distinguishes clearly between matched, failed, and unknown conditions.
 * Never forces UNKNOWN into MATCHED. Never invents conditions.
 */
export const getExplainableEligibility = createServerFn({ method: 'GET' })
  .validator((input: unknown) => {
    const parsed = EligibilityRequestSchema.safeParse(input);
    if (!parsed.success) {
      throw new Error(`Invalid request: ${parsed.error.issues.map(i => i.message).join(', ')}`);
    }
    return parsed.data;
  })
  .handler(async ({ data }) => {
    try {
      requireAuth();

      const { schemeId, profile } = data;

      // Validate scheme exists
      const schemeExists = SCHEMES.some(s => s.id === schemeId);
      if (!schemeExists) {
        return createErrorResponse('SCHEME_NOT_FOUND', `Scheme "${schemeId}" not found in the database`);
      }

      const result = evaluateEligibility(profile as UserProfile, schemeId);

      if (!result) {
        return createErrorResponse('EVALUATION_FAILED', 'Could not evaluate eligibility for this scheme');
      }

      return createSuccessResponse(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      if (message === 'Authentication required') {
        return createErrorResponse('UNAUTHORIZED', 'Authentication required');
      }
      return createErrorResponse('INTERNAL_ERROR', message);
    }
  });
