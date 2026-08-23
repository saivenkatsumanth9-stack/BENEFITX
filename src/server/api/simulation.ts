import { createServerFn } from '@tanstack/react-start';
import { simulateEligibility, SIMULATION_WHITELIST } from '@/server/services/simulationEngine';
import { createSuccessResponse, createErrorResponse } from '@/server/middleware';
import { requireAuth } from '@/server/auth';
import { SimulationRequestSchema } from '@/server/types';
import type { UserProfile, UserDocument } from '@/lib/types';

/**
 * API: What-If Eligibility Simulator
 * Allows users to test hypothetical profile changes without modifying their actual profile.
 *
 * CRITICAL: The simulation NEVER modifies the actual user profile.
 * Only whitelisted fields can be simulated.
 */
export const runSimulation = createServerFn({ method: 'POST' })
  .validator((input: unknown) => {
    const parsed = SimulationRequestSchema.safeParse(input);
    if (!parsed.success) {
      throw new Error(`Invalid request: ${parsed.error.issues.map(i => i.message).join(', ')}`);
    }

    // Validate simulation changes only contain whitelisted fields
    const invalidFields = Object.keys(parsed.data.simulationChanges)
      .filter(field => !SIMULATION_WHITELIST.includes(field as (typeof SIMULATION_WHITELIST)[number]));

    if (invalidFields.length > 0) {
      throw new Error(
        `Invalid simulation fields: ${invalidFields.join(', ')}. ` +
        `Allowed fields: ${SIMULATION_WHITELIST.join(', ')}`
      );
    }

    return parsed.data;
  })
  .handler(async ({ data }) => {
    try {
      requireAuth();

      const { actualProfile, simulationChanges, documents } = data;

      if (Object.keys(simulationChanges).length === 0) {
        return createErrorResponse(
          'NO_CHANGES',
          'No simulation changes provided. Please specify at least one field to simulate.'
        );
      }

      const result = simulateEligibility(
        actualProfile as UserProfile,
        simulationChanges,
        (documents ?? []) as UserDocument[],
      );

      return createSuccessResponse(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      if (message === 'Authentication required') {
        return createErrorResponse('UNAUTHORIZED', 'Authentication required');
      }
      if (message.startsWith('Invalid simulation fields')) {
        return createErrorResponse('INVALID_FIELDS', message);
      }
      return createErrorResponse('INTERNAL_ERROR', message);
    }
  });
