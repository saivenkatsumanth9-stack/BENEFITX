import { createServerFn } from '@tanstack/react-start';
import { UrgencyRequestSchema } from '../types';
import type { ApiResponse, SchemeUrgencyResult } from '../types';
import { requireAuth } from '../auth';
import { createSuccessResponse, createErrorResponse } from '../middleware';
import { calculateSchemeUrgency } from '../services/urgencyEngine';
import { SCHEMES } from '@/data/schemes';
import type { UserProfile, UserDocument, ApplicationRecord } from '@/lib/types';

/**
 * Feature 8 API — Smart Deadline Risk / Urgency Engine
 *
 * Computes multi-factor urgency level and deadline risk score for a scheme application.
 */
export const getSchemeUrgencyApi = createServerFn({ method: 'POST' })
  .validator((input: unknown) => {
    const parsed = UrgencyRequestSchema.safeParse(input);
    if (!parsed.success) {
      throw new Error(`Invalid request: ${parsed.error.issues.map((i) => i.message).join(', ')}`);
    }
    return parsed.data;
  })
  .handler(async ({ data }): Promise<ApiResponse<SchemeUrgencyResult>> => {
    try {
      requireAuth('citizen');

      const { schemeId, profile, documents, applications } = data;

      const userProfile = profile as unknown as UserProfile;
      const userDocuments = (documents ?? []) as unknown as UserDocument[];
      const userApplications = (applications ?? []) as unknown as ApplicationRecord[];

      const result = calculateSchemeUrgency(
        schemeId,
        userProfile,
        userDocuments,
        userApplications,
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
        'URGENCY_ERROR',
        error instanceof Error ? error.message : 'Failed to calculate scheme urgency',
      );
    }
  });
