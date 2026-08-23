import { SCHEMES } from '@/data/schemes';
import { computeProfileMatchWithBreakdown } from '@/lib/matching';
import type {
  Scheme,
  UserProfile,
  RelatedSchemesResult,
  RelatedSchemeItem,
  SchemeRelationshipType,
} from '@/lib/types';

/**
 * Feature 9 — Related Scheme Discovery / Benefit Relationship Engine
 *
 * Identifies and ranks potentially related government welfare opportunities
 * based on structured domain criteria (beneficiary group overlap, category,
 * geographic compatibility, complementary pathways) and personalizes the
 * ranking if a citizen user profile is provided.
 */
export function findRelatedSchemes(
  schemeId: string,
  userProfile?: UserProfile,
  schemes: Scheme[] = SCHEMES,
  limit: number = 6,
): RelatedSchemesResult | null {
  const sourceScheme = schemes.find((s) => s.id === schemeId);
  if (!sourceScheme) return null;

  const candidateSchemes = schemes.filter((s) => s.id !== schemeId);
  const items: RelatedSchemeItem[] = [];

  for (const candidate of candidateSchemes) {
    const relationship = computeSchemeRelationship(sourceScheme, candidate);
    if (relationship.score < 25) continue; // Filter out low/negligible relations

    let profileScore: number | null = null;
    let combinedScore = relationship.score;

    if (userProfile) {
      const match = computeProfileMatchWithBreakdown(userProfile, candidate);
      profileScore = match.score;

      // Check social category/caste compatibility if candidate has specific reservation notes
      const categoryPenalty = evaluateCategoryCompatibility(userProfile, candidate);
      if (categoryPenalty < 0) {
        profileScore = Math.max(5, profileScore + categoryPenalty);
      }

      // 60% User Profile Match + 40% Scheme-to-Scheme Relationship Score
      combinedScore = Math.round(profileScore * 0.6 + relationship.score * 0.4);
    }

    items.push({
      schemeId: candidate.id,
      schemeName: candidate.name,
      category: candidate.category,
      benefitSummary: candidate.benefitSummary,
      relationshipType: relationship.type,
      relationshipScore: relationship.score,
      profileMatchScore: profileScore,
      combinedScore,
      reason: relationship.reason,
    });
  }

  // Sort by combined score descending
  items.sort((a, b) => b.combinedScore - a.combinedScore);

  return {
    sourceScheme: {
      id: sourceScheme.id,
      name: sourceScheme.name,
      category: sourceScheme.category,
    },
    relatedSchemes: items.slice(0, limit),
  };
}

/**
 * Pure deterministic relationship evaluation between two schemes.
 */
function computeSchemeRelationship(
  source: Scheme,
  target: Scheme,
): { score: number; type: SchemeRelationshipType; reason: string } {
  let score = 0;
  let dominantType: SchemeRelationshipType = 'SAME_CATEGORY';
  const reasons: string[] = [];

  // 1. Same Category
  if (source.category === target.category) {
    score += 35;
    dominantType = 'SAME_CATEGORY';
    reasons.push(`Both schemes operate in the ${source.category} welfare sector`);
  }

  // 2. Beneficiary Group / Occupation overlap
  const sourceOccs = source.eligibility.occupations ?? [];
  const targetOccs = target.eligibility.occupations ?? [];
  const sharedOccs = sourceOccs.filter((o) => targetOccs.includes(o));

  if (sharedOccs.length > 0) {
    score += 30;
    dominantType = 'SAME_TARGET_GROUP';
    reasons.push(`Both schemes target ${sharedOccs.join(', ').toLowerCase()} beneficiaries`);
  }

  // 3. Farmer specific relationship
  if (source.eligibility.farmerRequired && target.eligibility.farmerRequired) {
    score += 35;
    dominantType = 'SAME_TARGET_GROUP';
    reasons.push('Both schemes are targeted exclusively for agricultural landholders');
  }

  // 4. Complementary Benefit Pathways
  const complementaryPairs: Array<{ fromCat: string; toCat: string; type: SchemeRelationshipType; note: string }> = [
    { fromCat: 'Education', toCat: 'Employment', type: 'NEXT_STAGE_OPPORTUNITY', note: 'Education scholarships naturally progress to skill training and internship opportunities' },
    { fromCat: 'Agriculture', toCat: 'Social Security', type: 'COMPLEMENTARY_SCHEME', note: 'Agricultural support is complementary to farmer insurance and social security' },
    { fromCat: 'Women & Child', toCat: 'Entrepreneurship', type: 'NEXT_STAGE_OPPORTUNITY', note: 'Women empowerment incentives complement micro-enterprise loan programs' },
    { fromCat: 'Housing', toCat: 'Health', type: 'COMPLEMENTARY_SCHEME', note: 'Basic infrastructure subsidies complement public healthcare access' },
  ];

  for (const pair of complementaryPairs) {
    if (
      (source.category === pair.fromCat && target.category === pair.toCat) ||
      (source.category === pair.toCat && target.category === pair.fromCat)
    ) {
      score += 25;
      dominantType = pair.type;
      reasons.push(pair.note);
      break;
    }
  }

  // 5. Geographic Alignment
  if (source.state === target.state && source.state !== 'All India') {
    score += 15;
    reasons.push(`Both are specific to ${source.state}`);
  } else if (source.governmentLevel === 'Central' && target.governmentLevel === 'Central') {
    score += 10;
  }

  // 6. Educational overlap
  const sourceEdu = source.eligibility.education ?? [];
  const targetEdu = target.eligibility.education ?? [];
  const sharedEdu = sourceEdu.filter((e) => targetEdu.includes(e));
  if (sharedEdu.length > 0 && sourceOccs.length === 0) {
    score += 15;
    dominantType = 'SIMILAR_ELIGIBILITY';
    reasons.push(`Aligned educational prerequisite (${sharedEdu.join(', ')})`);
  }

  const finalScore = Math.min(98, score);
  const primaryReason = reasons.length > 0 ? reasons.join('. ') + '.' : 'Schemes share compatible eligibility and benefits.';

  return {
    score: finalScore,
    type: dominantType,
    reason: primaryReason,
  };
}

/**
 * Evaluates social category without ever inferring caste from name/location.
 * Only explicit profile parameters are examined.
 */
function evaluateCategoryCompatibility(profile: UserProfile, scheme: Scheme): number {
  const notes = (scheme.eligibility.notes ?? []).join(' ').toLowerCase();

  // If scheme has specific reserved community condition
  if (notes.includes('backward classes') || notes.includes('bc') || notes.includes('sc') || notes.includes('st')) {
    // If the profile does not declare or has incompatibility, slightly penalize priority
    return 0; // Maintain neutral unless explicitly incompatible
  }

  return 0;
}
