import { SCHEMES } from '@/data/schemes';
import { evaluateCriteria } from '@/lib/matching';
import type { UserProfile, Scheme, MatchFactor } from '@/lib/types';

export interface ExplainableEligibilityResult {
  schemeId: string;
  schemeName: string;
  status: 'MATCHED' | 'FAILED' | 'UNKNOWN';
  matchedConditions: string[];
  failedConditions: string[];
  missingInformation: string[];
  overallNote: string;
}

/**
 * Evaluates eligibility with full explainability.
 * 3 possible states: MATCHED, FAILED, UNKNOWN.
 * Never forces UNKNOWN into MATCHED.
 * Never invents conditions not in the scheme data.
 */
export function evaluateEligibility(
  profile: UserProfile,
  schemeId: string,
  schemes: Scheme[] = SCHEMES,
): ExplainableEligibilityResult | null {
  const scheme = schemes.find(s => s.id === schemeId);
  if (!scheme) return null;

  const criteria = evaluateCriteria(profile, scheme);
  
  const matchedConditions = criteria
    .filter(c => c.status === 'match')
    .map(c => formatCondition(c, 'match'));
  
  const failedConditions = criteria
    .filter(c => c.status === 'mismatch')
    .map(c => formatCondition(c, 'mismatch'));
  
  const missingInformation = criteria
    .filter(c => c.status === 'unknown' || c.status === 'verify')
    .map(c => formatCondition(c, c.status));

  // Determine overall status
  let status: ExplainableEligibilityResult['status'];
  if (failedConditions.length > 0) {
    status = 'FAILED';
  } else if (missingInformation.length > 0) {
    status = 'UNKNOWN';
  } else {
    status = 'MATCHED';
  }

  const overallNote = buildOverallNote(status, scheme.name);

  return {
    schemeId: scheme.id,
    schemeName: scheme.name,
    status,
    matchedConditions,
    failedConditions,
    missingInformation,
    overallNote,
  };
}

function formatCondition(factor: MatchFactor, status: string): string {
  switch (status) {
    case 'match':
      return `${factor.label} matches: your value (${factor.yourValue}) is within the required range (${factor.required})`;
    case 'mismatch':
      return `${factor.label} does not match: your value (${factor.yourValue}) does not satisfy the requirement (${factor.required})`;
    case 'unknown':
      return `${factor.label} information is required (${factor.required}) but was not provided in your profile`;
    case 'verify':
      return `${factor.label} requires manual verification: ${factor.required}`;
    default:
      return `${factor.label}: ${factor.required}`;
  }
}

function buildOverallNote(status: ExplainableEligibilityResult['status'], schemeName: string): string {
  switch (status) {
    case 'MATCHED':
      return `Based on your profile information, you appear to meet the available eligibility criteria for ${schemeName}. Always verify with the latest official notification before applying.`;
    case 'FAILED':
      return `Based on your profile information, one or more eligibility conditions for ${schemeName} are not met. Please review the failed conditions. If your circumstances have changed, update your profile.`;
    case 'UNKNOWN':
      return `Some information required to determine eligibility for ${schemeName} is missing from your profile. Please complete your profile to get an accurate assessment.`;
  }
}
