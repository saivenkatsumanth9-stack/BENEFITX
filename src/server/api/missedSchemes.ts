import { createServerFn } from '@tanstack/react-start';
import { SCHEMES } from '@/data/schemes';
import { recommendSchemes } from '@/server/services/recommendationEngine';
import { createSuccessResponse, createErrorResponse } from '@/server/middleware';
import { requireAuth } from '@/server/auth';
import { MissedSchemesRequestSchema } from '@/server/types';
import type { UserProfile, UserDocument } from '@/lib/types';

/**
 * API: Missed Scheme Detector
 * Discovers government schemes the user may be eligible for but hasn't searched for.
 *
 * The score represents PROFILE MATCH — never "officially eligible".
 */
export const getMissedSchemes = createServerFn({ method: 'GET' })
  .validator((input: unknown) => {
    const parsed = MissedSchemesRequestSchema.safeParse(input);
    if (!parsed.success) {
      throw new Error(`Invalid request: ${parsed.error.issues.map(i => i.message).join(', ')}`);
    }
    return parsed.data;
  })
  .handler(async ({ data }) => {
    try {
      requireAuth();

      const profile = data.profile as UserProfile;
      const excludeIds = data.excludeSchemeIds ?? [];
      const limit = data.limit ?? 10;

      const results = recommendSchemes(
        profile,
        SCHEMES,
        [], // documents passed separately if needed
        excludeIds,
        limit,
      );

      return createSuccessResponse({
        totalSchemes: SCHEMES.length,
        matchedSchemes: results.length,
        results,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      if (message === 'Authentication required') {
        return createErrorResponse('UNAUTHORIZED', 'Authentication required');
      }
      return createErrorResponse('INTERNAL_ERROR', message);
    }
  });
