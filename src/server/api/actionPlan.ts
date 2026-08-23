import { createServerFn } from '@tanstack/react-start';
import { ActionPlanRequestSchema } from '../types';
import type { ApiResponse, ActionPlanResult } from '../types';
import { requireAuth } from '../auth';
import { createSuccessResponse, createErrorResponse } from '../middleware';
import { generateActionPlan } from '../services/actionPlanEngine';
import { SCHEMES } from '@/data/schemes';
import type { UserProfile, UserDocument, ApplicationRecord } from '@/lib/types';

/**
 * Feature 7 API — Personalized Action Plan
 *
 * Generates tailored step-by-step guidance for a citizen to prepare,
 * register, and apply for a specific scheme.
 */
export const getActionPlanApi = createServerFn({ method: 'POST' })
  .validator((input: unknown) => {
    const parsed = ActionPlanRequestSchema.safeParse(input);
    if (!parsed.success) {
      throw new Error(`Invalid request: ${parsed.error.issues.map((i) => i.message).join(', ')}`);
    }
    return parsed.data;
  })
  .handler(async ({ data }): Promise<ApiResponse<ActionPlanResult>> => {
    try {
      requireAuth('citizen');

      const { schemeId, profile, documents, applications } = data;

      const userProfile = profile as unknown as UserProfile;
      const userDocuments = (documents ?? []) as unknown as UserDocument[];
      const userApplications = (applications ?? []) as unknown as ApplicationRecord[];

      const result = generateActionPlan(
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
        'ACTION_PLAN_ERROR',
        error instanceof Error ? error.message : 'Failed to generate action plan',
      );
    }
  });
