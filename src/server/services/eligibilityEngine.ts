import { SCHEMES } from '@/data/schemes';
import { evaluateCriteria, statusFromCriteriaEnhanced, generateSchemeWeights, buildScoreBreakdown } from '@/lib/matching';
import type { UserProfile, Scheme, MatchFactor, ScoreBreakdownItem } from '@/lib/types';

export interface ExplainableEligibilityResult {
  schemeId: string;
  schemeName: string;
  status: 'MATCHED' | 'FAILED' | 'UNKNOWN';
  matchedConditions: string[];
  failedConditions: string[];
  missingInformation: string[];
  overallNote: string;
}

export interface EnhancedEligibilityResult {
  schemeId: string;
  schemeName: string;
  status: 'MATCHED' | 'PARTIALLY_MATCHED' | 'FAILED' | 'UNKNOWN';
  matchedConditions: string[];
  partialConditions: string[];
  failedConditions: string[];
  missingInformation: string[];
  scoreBreakdown: ScoreBreakdownItem[];
  overallNote: string;
}

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

export function evaluateEligibilityEnhanced(
  profile: UserProfile,
  schemeId: string,
  schemes: Scheme[] = SCHEMES,
): EnhancedEligibilityResult | null {
  const scheme = schemes.find(s => s.id === schemeId);
  if (!scheme) return null;

  const criteria = evaluateCriteria(profile, scheme);
  
  const matchedConditions = criteria
    .filter(c => c.status === 'match')
    .map(c => formatCondition(c, 'match'));
    
  const partialConditions = criteria
    .filter(c => c.status === 'partial')
    .map(c => formatCondition(c, 'partial'));
  
  const failedConditions = criteria
    .filter(c => c.status === 'mismatch')
    .map(c => formatCondition(c, 'mismatch'));
  
  const missingInformation = criteria
    .filter(c => c.status === 'unknown' || c.status === 'verify')
    .map(c => formatCondition(c, c.status));

  const status = statusFromCriteriaEnhanced(criteria);
  const scoreBreakdown = buildScoreBreakdown(criteria, generateSchemeWeights(scheme));

  const overallNote = buildOverallNote(status, scheme.name);

  return {
    schemeId: scheme.id,
    schemeName: scheme.name,
    status,
    matchedConditions,
    partialConditions,
    failedConditions,
    missingInformation,
    scoreBreakdown,
    overallNote,
  };
}

function formatCondition(factor: MatchFactor, status: string): string {
  switch (status) {
    case 'match':
      return `${factor.label} matches: your value (${factor.yourValue}) is within the required range (${factor.required})`;
    case 'partial':
      return `${factor.label} is a near match: your value (${factor.yourValue}) is close to the requirement (${factor.required})`;
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

function buildOverallNote(status: ExplainableEligibilityResult['status'] | EnhancedEligibilityResult['status'], schemeName: string): string {
  switch (status) {
    case 'MATCHED':
      return `Based on your profile information, you appear to meet the available eligibility criteria for ${schemeName}. Always verify with the latest official notification before applying.`;
    case 'PARTIALLY_MATCHED':
      return `Based on your profile information, you partially meet the eligibility criteria for ${schemeName}. Review the partial matches to see if you can still qualify.`;
    case 'FAILED':
      return `Based on your profile information, one or more eligibility conditions for ${schemeName} are not met. Please review the failed conditions. If your circumstances have changed, update your profile.`;
    case 'UNKNOWN':
      return `Some information required to determine eligibility for ${schemeName} is missing from your profile. Please complete your profile to get an accurate assessment.`;
  }
}
