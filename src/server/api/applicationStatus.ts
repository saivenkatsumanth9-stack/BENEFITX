import { createServerFn } from '@tanstack/react-start';
import { ApplicationStatusRequestSchema } from '../types';
import { requireAuth } from '../auth';
import { createSuccessResponse, createErrorResponse } from '../middleware';
import { getApplicationStatusAndDeadline } from '../services/applicationStatusEngine';
import { SCHEMES } from '@/data/schemes';
import type { ApplicationRecord } from '@/lib/types';

/**
 * Feature 6 API — Application Status + Deadline Tracker
 *
 * Returns the combined application status and deadline information
 * for a given scheme and user.
 */
export const getApplicationStatusAndDeadlineApi = createServerFn({ method: 'GET' })
  .validator((input: unknown) => {
    const parsed = ApplicationStatusRequestSchema.safeParse(input);
    if (!parsed.success) {
      throw new Error(`Invalid request: ${parsed.error.issues.map(i => i.message).join(', ')}`);
    }
    return parsed.data;
  })
  .handler(async ({ data }) => {
    try {
      requireAuth('citizen');

      const { schemeId, applications } = data;

      const result = getApplicationStatusAndDeadline(
        schemeId,
        applications as ApplicationRecord[],
        SCHEMES,
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
        'APPLICATION_STATUS_ERROR',
        error instanceof Error ? error.message : 'Failed to retrieve application status',
      );
    }
  });
