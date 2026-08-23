import { createServerFn } from '@tanstack/react-start';
import { SCHEMES } from '@/data/schemes';
import { explainScheme } from '@/server/services/explanationEngine';
import { createSuccessResponse, createErrorResponse } from '@/server/middleware';
import { requireAuth } from '@/server/auth';
import { ExplanationRequestSchema } from '@/server/types';

/**
 * API: Simple Language + Multilingual Scheme Explanation
 * Converts scheme information into simple, understandable language.
 * Supports: English (en), Telugu (te), Hindi (hi)
 *
 * CRITICAL AI RULE:
 *   AI is ONLY responsible for simplifying and translating language.
 *   AI is NOT responsible for deciding official eligibility.
 *
 * Architecture:
 *   Government Scheme Data → Rule-Based Engine → Result → AI → Human-Friendly Explanation
 */
export const getSchemeExplanation = createServerFn({ method: 'POST' })
  .validator((input: unknown) => {
    const parsed = ExplanationRequestSchema.safeParse(input);
    if (!parsed.success) {
      throw new Error(`Invalid request: ${parsed.error.issues.map(i => i.message).join(', ')}`);
    }
    return parsed.data;
  })
  .handler(async ({ data }) => {
    try {
      requireAuth();

      const { schemeId, language, mode } = data;

      // Validate scheme exists
      const schemeExists = SCHEMES.some(s => s.id === schemeId);
      if (!schemeExists) {
        return createErrorResponse('SCHEME_NOT_FOUND', `Scheme "${schemeId}" not found in the database`);
      }

      const result = explainScheme(
        schemeId,
        language as 'en' | 'te' | 'hi',
        mode as 'simple' | 'original',
      );

      if (!result) {
        return createErrorResponse('EXPLANATION_FAILED', 'Could not generate explanation for this scheme');
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
