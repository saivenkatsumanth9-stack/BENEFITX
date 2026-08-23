import { SCHEMES } from '@/data/schemes';
import { evaluateCriteria, profileMatchScore, buildAssessment, documentReadinessScore } from '@/lib/matching';
import type { UserProfile, UserDocument, Scheme } from '@/lib/types';

const SIMULATION_WHITELIST = [
  'age', 'annualIncome', 'state', 'educationLevel', 'occupation',
  'gender', 'areaType', 'isStudent', 'isFarmer', 'employmentStatus',
] as const;

type SimulationField = typeof SIMULATION_WHITELIST[number];

export interface SimulationSchemeChange {
  schemeId: string;
  schemeName: string;
  beforeScore: number;
  afterScore: number;
}

export interface SimulationResult {
  simulationOnly: true;
  currentMatchCount: number;
  simulatedMatchCount: number;
  newPotentialSchemes: Array<{ schemeId: string; schemeName: string; matchScore: number }>;
  removedPotentialSchemes: Array<{ schemeId: string; schemeName: string; matchScore: number }>;
  changedSchemes: SimulationSchemeChange[];
  appliedChanges: Record<string, { from: string | number | boolean | null; to: string | number | boolean | null }>;
}

/**
 * What-If Eligibility Simulator.
 * CRITICAL: NEVER modifies the actual user profile.
 * Creates a temporary copy, applies simulation changes, and compares results.
 */
export function simulateEligibility(
  actualProfile: UserProfile,
  simulationChanges: Record<string, unknown>,
  documents: UserDocument[] = [],
  schemes: Scheme[] = SCHEMES,
): SimulationResult {
  // 1. Validate and filter changes to whitelisted fields only
  const validatedChanges: Record<string, { from: string | number | boolean | null; to: string | number | boolean | null }> = {};
  const simulatedProfile = { ...actualProfile }; // Shallow copy — original never touched

  for (const [field, newValue] of Object.entries(simulationChanges)) {
    if (!SIMULATION_WHITELIST.includes(field as SimulationField)) {
      continue; // Silently skip non-whitelisted fields
    }
    const oldValue = (actualProfile as unknown as Record<string, unknown>)[field];
    validatedChanges[field] = {
      from: (oldValue as string | number | boolean | null) ?? null,
      to: (newValue as string | number | boolean | null) ?? null,
    };
    (simulatedProfile as unknown as Record<string, unknown>)[field] = newValue;
  }

  // 2. Score all schemes with ACTUAL profile
  const MATCH_THRESHOLD = 55;
  const actualScores = schemes.map(scheme => ({
    scheme,
    score: computeScore(actualProfile, scheme, documents),
  }));

  // 3. Score all schemes with SIMULATED profile
  const simulatedScores = schemes.map(scheme => ({
    scheme,
    score: computeScore(simulatedProfile, scheme, documents),
  }));

  // 4. Compare results
  const actualMatches = actualScores.filter(s => s.score >= MATCH_THRESHOLD);
  const simulatedMatches = simulatedScores.filter(s => s.score >= MATCH_THRESHOLD);

  const actualMatchIds = new Set(actualMatches.map(s => s.scheme.id));
  const simulatedMatchIds = new Set(simulatedMatches.map(s => s.scheme.id));

  const newPotentialSchemes = simulatedMatches
    .filter(s => !actualMatchIds.has(s.scheme.id))
    .map(s => ({ schemeId: s.scheme.id, schemeName: s.scheme.name, matchScore: s.score }));

  const removedPotentialSchemes = actualMatches
    .filter(s => !simulatedMatchIds.has(s.scheme.id))
    .map(s => ({ schemeId: s.scheme.id, schemeName: s.scheme.name, matchScore: s.score }));

  const changedSchemes: SimulationSchemeChange[] = [];
  for (let i = 0; i < schemes.length; i++) {
    const curScheme = schemes[i];
    const actual = actualScores[i];
    const sim = simulatedScores[i];
    if (!curScheme || !actual || !sim) continue;

    const before = actual.score;
    const after = sim.score;
    if (before !== after) {
      changedSchemes.push({
        schemeId: curScheme.id,
        schemeName: curScheme.name,
        beforeScore: before,
        afterScore: after,
      });
    }
  }
  changedSchemes.sort((a, b) => Math.abs(b.afterScore - b.beforeScore) - Math.abs(a.afterScore - a.beforeScore));

  return {
    simulationOnly: true,
    currentMatchCount: actualMatches.length,
    simulatedMatchCount: simulatedMatches.length,
    newPotentialSchemes,
    removedPotentialSchemes,
    changedSchemes,
    appliedChanges: validatedChanges,
  };
}

function computeScore(profile: UserProfile, scheme: Scheme, documents: UserDocument[]): number {
  const criteria = evaluateCriteria(profile, scheme);
  const assessment = buildAssessment(profile, scheme);
  const profileMatch = profileMatchScore(criteria);
  const eligibilityMatch = assessment.status === 'likely-eligible' ? 100
    : assessment.status === 'needs-verification' ? 72 : 38;
  const docReadiness = documentReadinessScore(scheme, documents);
  return Math.max(5, Math.min(99,
    Math.round(profileMatch * 0.5 + eligibilityMatch * 0.35 + docReadiness * 0.15)
  ));
}

export { SIMULATION_WHITELIST };
