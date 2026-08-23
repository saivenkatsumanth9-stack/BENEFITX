import { createServerFn } from '@tanstack/react-start';
import { SCHEMES } from '@/data/schemes';
import { calculateDocumentReadiness } from '@/server/services/documentReadinessEngine';
import { createSuccessResponse, createErrorResponse } from '@/server/middleware';
import { requireAuth } from '@/server/auth';
import { DocumentReadinessRequestSchema } from '@/server/types';
import type { UserDocument } from '@/lib/types';

/**
 * API: Smart Document Readiness
 * Tells users whether they have the documents needed for a scheme.
 *
 * Formula: readinessScore = (available required documents / total required documents) × 100
 * Optional documents do NOT reduce readiness.
 */
export const getDocumentReadiness = createServerFn({ method: 'GET' })
  .validator((input: unknown) => {
    const parsed = DocumentReadinessRequestSchema.safeParse(input);
    if (!parsed.success) {
      throw new Error(`Invalid request: ${parsed.error.issues.map(i => i.message).join(', ')}`);
    }
    return parsed.data;
  })
  .handler(async ({ data }) => {
    try {
      requireAuth();

      const { schemeId, documents } = data;

      // Validate scheme exists
      const schemeExists = SCHEMES.some(s => s.id === schemeId);
      if (!schemeExists) {
        return createErrorResponse('SCHEME_NOT_FOUND', `Scheme "${schemeId}" not found in the database`);
      }

      const result = calculateDocumentReadiness(
        documents as UserDocument[],
        schemeId,
      );

      if (!result) {
        return createErrorResponse('CALCULATION_FAILED', 'Could not calculate document readiness for this scheme');
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
