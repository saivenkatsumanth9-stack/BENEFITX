import { SCHEMES } from '@/data/schemes';
import { computeProfileMatchWithBreakdown } from '@/lib/matching';
import type { UserProfile, UserDocument, Scheme, ScoreBreakdownItem, ProfileMatchResult } from '@/lib/types';

export interface MissedSchemeResult {
  schemeId: string;
  schemeName: string;
  matchScore: number;
  status: 'POTENTIAL_MATCH' | 'PARTIAL_MATCH' | 'UNLIKELY_MATCH';
  matchedCriteria: string[];
  failedCriteria: string[];
  unknownCriteria: string[];
  partialCriteria: string[];
  reason: string;
  category: string;
  benefitSummary: string;
  scoreBreakdown: ScoreBreakdownItem[];
  dataConfidence: 'HIGH' | 'MEDIUM' | 'LOW';
  matchLabel: string;
}

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
    .filter(result => result.matchScore >= 30)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}

function scoreScheme(
  profile: UserProfile,
  scheme: Scheme,
  documents: UserDocument[],
): MissedSchemeResult {
  const matchResult = computeProfileMatchWithBreakdown(profile, scheme, documents);
  
  const matchScore = matchResult.score;

  const matchedCriteria = matchResult.breakdown.filter(c => c.status === 'MATCHED').map(c => c.label);
  const failedCriteria = matchResult.breakdown.filter(c => c.status === 'FAILED').map(c => c.label);
  const unknownCriteria = matchResult.breakdown.filter(c => c.status === 'UNKNOWN' || c.status === 'VERIFY').map(c => c.label);
  const partialCriteria = matchResult.breakdown.filter(c => c.status === 'PARTIAL').map(c => c.label);

  const status: MissedSchemeResult['status'] = 
    matchScore >= 75 ? 'POTENTIAL_MATCH'
    : matchScore >= 50 ? 'PARTIAL_MATCH'
    : 'UNLIKELY_MATCH';

  const reason = buildReason(
    matchedCriteria, 
    failedCriteria, 
    unknownCriteria, 
    partialCriteria, 
    matchResult.breakdown.length
  );

  return {
    schemeId: scheme.id,
    schemeName: scheme.name,
    matchScore,
    status,
    matchedCriteria,
    failedCriteria,
    unknownCriteria,
    partialCriteria,
    reason,
    category: scheme.category,
    benefitSummary: scheme.benefitSummary,
    scoreBreakdown: matchResult.breakdown,
    dataConfidence: matchResult.dataConfidence,
    matchLabel: matchResult.label,
  };
}

function buildReason(
  matched: string[], failed: string[], unknown: string[], partial: string[], total: number,
): string {
  const parts: string[] = [];
  if (matched.length > 0) {
    parts.push(`Your available profile information matches the ${matched.join(', ').toLowerCase()} criteria`);
  }
  if (partial.length > 0) {
    parts.push(`You partially match the ${partial.join(', ').toLowerCase()} criteria`);
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
