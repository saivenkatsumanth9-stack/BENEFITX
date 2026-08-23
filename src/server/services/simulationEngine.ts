import { SCHEMES } from '@/data/schemes';
import { 
  evaluateCriteria, 
  profileMatchScore, 
  buildAssessment, 
  documentReadinessScore,
  computeProfileMatchWithBreakdown
} from '@/lib/matching';
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

export interface EnhancedSimulationResult extends SimulationResult {
  scoreChange: number;
  improvedSchemes: Array<{ schemeId: string; schemeName: string; beforeScore: number; afterScore: number; change: number }>;
  reducedSchemes: Array<{ schemeId: string; schemeName: string; beforeScore: number; afterScore: number; change: number }>;
  unchangedCount: number;
}

export function simulateEligibility(
  actualProfile: UserProfile,
  simulationChanges: Record<string, unknown>,
  documents: UserDocument[] = [],
  schemes: Scheme[] = SCHEMES,
): SimulationResult {
  const validatedChanges: Record<string, { from: string | number | boolean | null; to: string | number | boolean | null }> = {};
  const simulatedProfile = { ...actualProfile };

  for (const [field, newValue] of Object.entries(simulationChanges)) {
    if (!SIMULATION_WHITELIST.includes(field as SimulationField)) {
      continue;
    }
    const oldValue = (actualProfile as unknown as Record<string, unknown>)[field];
    validatedChanges[field] = {
      from: (oldValue as string | number | boolean | null) ?? null,
      to: (newValue as string | number | boolean | null) ?? null,
    };
    (simulatedProfile as unknown as Record<string, unknown>)[field] = newValue;
  }

  const MATCH_THRESHOLD = 55;
  const actualScores = schemes.map(scheme => ({
    scheme,
    score: computeScore(actualProfile, scheme, documents),
  }));

  const simulatedScores = schemes.map(scheme => ({
    scheme,
    score: computeScore(simulatedProfile, scheme, documents),
  }));

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

export function simulateEligibilityEnhanced(
  actualProfile: UserProfile,
  simulationChanges: Record<string, unknown>,
  documents: UserDocument[] = [],
  schemes: Scheme[] = SCHEMES,
): EnhancedSimulationResult {
  const validatedChanges: Record<string, { from: string | number | boolean | null; to: string | number | boolean | null }> = {};
  const simulatedProfile = { ...actualProfile };

  for (const [field, newValue] of Object.entries(simulationChanges)) {
    if (!SIMULATION_WHITELIST.includes(field as SimulationField)) {
      continue;
    }
    const oldValue = (actualProfile as unknown as Record<string, unknown>)[field];
    validatedChanges[field] = {
      from: (oldValue as string | number | boolean | null) ?? null,
      to: (newValue as string | number | boolean | null) ?? null,
    };
    (simulatedProfile as unknown as Record<string, unknown>)[field] = newValue;
  }

  const MATCH_THRESHOLD = 55;
  
  const actualScores = schemes.map(scheme => ({
    scheme,
    score: computeProfileMatchWithBreakdown(actualProfile, scheme, documents).score,
  }));

  const simulatedScores = schemes.map(scheme => ({
    scheme,
    score: computeProfileMatchWithBreakdown(simulatedProfile, scheme, documents).score,
  }));

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
  const improvedSchemes: Array<{ schemeId: string; schemeName: string; beforeScore: number; afterScore: number; change: number }> = [];
  const reducedSchemes: Array<{ schemeId: string; schemeName: string; beforeScore: number; afterScore: number; change: number }> = [];
  let unchangedCount = 0;
  let totalScoreChange = 0;

  for (let i = 0; i < schemes.length; i++) {
    const curScheme = schemes[i];
    const actual = actualScores[i];
    const sim = simulatedScores[i];
    if (!curScheme || !actual || !sim) continue;

    const before = actual.score;
    const after = sim.score;
    const change = after - before;
    
    totalScoreChange += change;

    if (before !== after) {
      changedSchemes.push({
        schemeId: curScheme.id,
        schemeName: curScheme.name,
        beforeScore: before,
        afterScore: after,
      });

      if (change > 0) {
        improvedSchemes.push({
          schemeId: curScheme.id,
          schemeName: curScheme.name,
          beforeScore: before,
          afterScore: after,
          change,
        });
      } else {
        reducedSchemes.push({
          schemeId: curScheme.id,
          schemeName: curScheme.name,
          beforeScore: before,
          afterScore: after,
          change,
        });
      }
    } else {
      unchangedCount++;
    }
  }

  changedSchemes.sort((a, b) => Math.abs(b.afterScore - b.beforeScore) - Math.abs(a.afterScore - a.beforeScore));
  improvedSchemes.sort((a, b) => b.change - a.change);
  reducedSchemes.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));

  const scoreChange = schemes.length > 0 ? totalScoreChange / schemes.length : 0;

  return {
    simulationOnly: true,
    currentMatchCount: actualMatches.length,
    simulatedMatchCount: simulatedMatches.length,
    newPotentialSchemes,
    removedPotentialSchemes,
    changedSchemes,
    appliedChanges: validatedChanges,
    scoreChange,
    improvedSchemes,
    reducedSchemes,
    unchangedCount,
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
