import { SCHEMES } from '@/data/schemes';
import type {
  Scheme,
  ApplicationRecord,
  ApplicationStatusResult,
  DeadlineResult,
  DeadlineStatus,
  ServerApplicationStatus,
  ApplicationStatusAndDeadlineResult,
} from '@/lib/types';

/**
 * Feature 6 — Application Status + Deadline Tracker Engine
 *
 * Provides deterministic application status mapping and deadline tracking
 * for government schemes. Uses existing client-side ApplicationRecord data
 * and scheme deadline fields to compute server-side statuses.
 */

/**
 * Maps existing client-side ApplicationStatus to server-side status.
 */
function mapApplicationStatus(clientStatus: ApplicationRecord['status']): ServerApplicationStatus {
  switch (clientStatus) {
    case 'Saved':
    case 'Preparing':
      return 'REGISTERED';
    case 'Ready to Apply':
      return 'APPLICATION_STARTED';
    case 'Applied':
    case 'Under Review':
    case 'Completed':
      return 'APPLIED';
    default:
      return 'UNKNOWN';
  }
}

/**
 * Generates a human-readable status note based on application status.
 */
function buildStatusNote(
  status: ServerApplicationStatus,
  schemeName: string,
  clientStatus?: ApplicationRecord['status'],
): string {
  switch (status) {
    case 'NOT_REGISTERED':
      return `You have not yet started tracking ${schemeName}. Save it to your list to begin.`;
    case 'REGISTERED':
      return `You have saved ${schemeName} and are preparing your application. Current stage: ${clientStatus ?? 'Saved'}.`;
    case 'APPLICATION_STARTED':
      return `Your application for ${schemeName} is ready. Review your documents and submit when ready.`;
    case 'APPLIED':
      return `You have applied for ${schemeName}. Current stage: ${clientStatus ?? 'Applied'}. Check the official portal for updates.`;
    case 'UNKNOWN':
      return `Unable to determine your application status for ${schemeName}.`;
  }
}

/**
 * Gets the application status for a user-scheme combination.
 */
export function getApplicationStatus(
  schemeId: string,
  applications: ApplicationRecord[] = [],
  schemes: Scheme[] = SCHEMES,
): ApplicationStatusResult | null {
  const scheme = schemes.find(s => s.id === schemeId);
  if (!scheme) return null;

  const appRecord = applications.find(a => a.schemeId === schemeId);

  if (!appRecord) {
    return {
      schemeId: scheme.id,
      schemeName: scheme.name,
      applicationStatus: 'NOT_REGISTERED',
      statusNote: buildStatusNote('NOT_REGISTERED', scheme.name),
    };
  }

  const serverStatus = mapApplicationStatus(appRecord.status);

  return {
    schemeId: scheme.id,
    schemeName: scheme.name,
    applicationStatus: serverStatus,
    registeredAt: serverStatus !== 'NOT_REGISTERED' ? appRecord.updatedAt : undefined,
    appliedAt: serverStatus === 'APPLIED' ? appRecord.updatedAt : undefined,
    statusNote: buildStatusNote(serverStatus, scheme.name, appRecord.status),
  };
}

/**
 * Calculates deadline status for a scheme.
 *
 * Deterministic deadline logic:
 * - > 30 days remaining → OPEN
 * - 8–30 days remaining → DEADLINE_APPROACHING
 * - 1–7 days remaining → CLOSING_SOON
 * - <= 0 days remaining → CLOSED
 * - No deadline field → NO_DEADLINE
 */
export function getDeadlineStatus(
  schemeId: string,
  schemes: Scheme[] = SCHEMES,
  referenceDate?: Date,
): DeadlineResult | null {
  const scheme = schemes.find(s => s.id === schemeId);
  if (!scheme) return null;

  const now = referenceDate ?? new Date();

  if (!scheme.deadline) {
    return {
      schemeId: scheme.id,
      schemeName: scheme.name,
      deadline: null,
      daysRemaining: -1,
      deadlineStatus: 'NO_DEADLINE',
      deadlineSource: scheme.sourceName,
      lastUpdated: scheme.lastUpdated,
    };
  }

  const deadlineDate = new Date(scheme.deadline);
  const timeDiff = deadlineDate.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));

  let deadlineStatus: DeadlineStatus;
  if (timeDiff <= 0) {
    deadlineStatus = 'CLOSED';
  } else if (daysRemaining <= 7) {
    deadlineStatus = 'CLOSING_SOON';
  } else if (daysRemaining <= 30) {
    deadlineStatus = 'DEADLINE_APPROACHING';
  } else {
    deadlineStatus = 'OPEN';
  }

  return {
    schemeId: scheme.id,
    schemeName: scheme.name,
    deadline: scheme.deadline,
    daysRemaining,
    deadlineStatus,
    deadlineSource: scheme.sourceName,
    lastUpdated: scheme.lastUpdated,
  };
}

/**
 * Combined application status + deadline result.
 */
export function getApplicationStatusAndDeadline(
  schemeId: string,
  applications: ApplicationRecord[] = [],
  schemes: Scheme[] = SCHEMES,
  referenceDate?: Date,
): ApplicationStatusAndDeadlineResult | null {
  const appStatus = getApplicationStatus(schemeId, applications, schemes);
  const deadline = getDeadlineStatus(schemeId, schemes, referenceDate);

  if (!appStatus || !deadline) return null;

  return {
    application: appStatus,
    deadline,
  };
}
