import { createServerFn } from '@tanstack/react-start';
import { RelatedSchemesRequestSchema } from '../types';
import type { ApiResponse, RelatedSchemesResult } from '../types';
import { requireAuth } from '../auth';
import { createSuccessResponse, createErrorResponse } from '../middleware';
import { findRelatedSchemes } from '../services/relatedSchemeEngine';
import { SCHEMES } from '@/data/schemes';
import type { UserProfile } from '@/lib/types';

/**
 * Feature 9 API — Related Scheme Discovery / Benefit Relationship Engine
 *
 * Discovers and ranks related government schemes based on structured criteria
 * and optional citizen profile match.
 */
export const getRelatedSchemesApi = createServerFn({ method: 'POST' })
  .validator((input: unknown) => {
    const parsed = RelatedSchemesRequestSchema.safeParse(input);
    if (!parsed.success) {
      throw new Error(`Invalid request: ${parsed.error.issues.map((i) => i.message).join(', ')}`);
    }
    return parsed.data;
  })
  .handler(async ({ data }): Promise<ApiResponse<RelatedSchemesResult>> => {
    try {
      requireAuth('citizen');

      const { schemeId, profile, limit } = data;
      const userProfile = profile as unknown as UserProfile | undefined;

      const result = findRelatedSchemes(
        schemeId,
        userProfile,
        SCHEMES,
        limit,
      );

      if (!result) {
        return createErrorResponse(
          'SCHEME_NOT_FOUND',
          `Scheme with id "${schemeId}" not found`,
        );
      }

      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(
        'RELATED_SCHEMES_ERROR',
        error instanceof Error ? error.message : 'Failed to discover related schemes',
      );
    }
  });
