import { SCHEMES } from '@/data/schemes';
import { evaluateCriteria, profileMatchScore, buildAssessment, documentReadinessScore } from '@/lib/matching';
import type { UserProfile, UserDocument, Scheme, MatchFactor } from '@/lib/types';

export interface MissedSchemeResult {
  schemeId: string;
  schemeName: string;
  matchScore: number;
  status: 'POTENTIAL_MATCH' | 'PARTIAL_MATCH' | 'UNLIKELY_MATCH';
  matchedCriteria: string[];
  failedCriteria: string[];
  unknownCriteria: string[];
  reason: string;
  category: string;
  benefitSummary: string;
}

/**
 * Deterministic recommendation engine.
 * Scores are PROFILE MATCH percentages — never "official eligibility".
 * Uses weighted criteria scoring based on available scheme data.
 */
export function recommendSchemes(
  userProfile: UserProfile,
  schemes: Scheme[] = SCHEMES,
  documents: UserDocument[] = [],
  excludeIds: string[] = [],
  limit: number = 10,
): MissedSchemeResult[] {
  return schemes
    .filter(scheme => !excludeIds.includes(scheme.id))
    .map(scheme => scoreScheme(userProfile, scheme, documents))
    .filter(result => result.matchScore >= 30)  // Only return schemes with meaningful match
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}

function scoreScheme(
  profile: UserProfile,
  scheme: Scheme,
  documents: UserDocument[],
): MissedSchemeResult {
  const criteria = evaluateCriteria(profile, scheme);
  const assessment = buildAssessment(profile, scheme);
  const profileMatch = profileMatchScore(criteria);
  
  // Weighted scoring using ONLY criteria that exist in this scheme's data
  const eligibilityMatch = assessment.status === 'likely-eligible' ? 100
    : assessment.status === 'needs-verification' ? 72 : 38;
  const docReadiness = documentReadinessScore(scheme, documents);
  
  const matchScore = Math.max(5, Math.min(99,
    Math.round(profileMatch * 0.5 + eligibilityMatch * 0.35 + docReadiness * 0.15)
  ));

  const matchedCriteria = criteria.filter(c => c.status === 'match').map(c => c.label);
  const failedCriteria = criteria.filter(c => c.status === 'mismatch').map(c => c.label);
  const unknownCriteria = criteria.filter(c => c.status === 'unknown' || c.status === 'verify').map(c => c.label);

  const status: MissedSchemeResult['status'] = 
    matchScore >= 75 ? 'POTENTIAL_MATCH'
    : matchScore >= 50 ? 'PARTIAL_MATCH'
    : 'UNLIKELY_MATCH';

  const reason = buildReason(matchedCriteria, failedCriteria, unknownCriteria, criteria.length);

  return {
    schemeId: scheme.id,
    schemeName: scheme.name,
    matchScore,
    status,
    matchedCriteria,
    failedCriteria,
    unknownCriteria,
    reason,
    category: scheme.category,
    benefitSummary: scheme.benefitSummary,
  };
}

function buildReason(
  matched: string[], failed: string[], unknown: string[], total: number,
): string {
  const parts: string[] = [];
  if (matched.length > 0) {
    parts.push(`Your available profile information matches the ${matched.join(', ').toLowerCase()} criteria`);
  }
  if (failed.length > 0) {
    parts.push(`${failed.join(', ')} did not match`);
  }
  if (unknown.length > 0) {
    parts.push(`${unknown.join(', ')} could not be verified with current profile data`);
  }
  if (parts.length === 0) return 'Insufficient profile data to evaluate this scheme.';
  return parts.join('. ') + '.';
}
