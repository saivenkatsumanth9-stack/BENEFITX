import { z } from 'zod';
import type { UserProfile, Scheme, UserDocument, EligibilityAssessment, Recommendation, ConfidenceLevel, MatchFactor } from '@/lib/types';

// ===== Missed Scheme Detector (Feature 1) =====
export const MissedSchemesRequestSchema = z.object({
  profile: z.object({
    name: z.string().optional(),
    age: z.number().nullable(),
    gender: z.string(),
    state: z.string(),
    district: z.string().optional(),
    areaType: z.string(),
    occupation: z.string(),
    educationLevel: z.string(),
    course: z.string().optional(),
    isStudent: z.boolean().optional(),
    annualIncome: z.number().nullable(),
    employmentStatus: z.string().optional(),
    isFarmer: z.boolean().optional(),
    landHoldingAcres: z.number().nullable().optional(),
    hasDisability: z.boolean().optional(),
    isSeniorCitizen: z.boolean().optional(),
  }),
  excludeSchemeIds: z.array(z.string()).optional(),
  limit: z.number().min(1).max(50).optional().default(10),
});

export type MissedSchemesRequest = z.infer<typeof MissedSchemesRequestSchema>;

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

// ===== Explainable Eligibility (Feature 2) =====
export const EligibilityRequestSchema = z.object({
  schemeId: z.string().min(1),
  profile: z.object({
    name: z.string().optional(),
    age: z.number().nullable(),
    gender: z.string(),
    state: z.string(),
    district: z.string().optional(),
    areaType: z.string(),
    occupation: z.string(),
    educationLevel: z.string(),
    course: z.string().optional(),
    isStudent: z.boolean().optional(),
    annualIncome: z.number().nullable(),
    employmentStatus: z.string().optional(),
    isFarmer: z.boolean().optional(),
    landHoldingAcres: z.number().nullable().optional(),
    hasDisability: z.boolean().optional(),
    isSeniorCitizen: z.boolean().optional(),
  }),
});

export type EligibilityRequest = z.infer<typeof EligibilityRequestSchema>;

export interface ExplainableEligibilityResult {
  schemeId: string;
  schemeName: string;
  status: 'MATCHED' | 'FAILED' | 'UNKNOWN';
  matchedConditions: string[];
  failedConditions: string[];
  missingInformation: string[];
  overallNote: string;
}

// ===== Document Readiness (Feature 3) =====
export const DocumentReadinessRequestSchema = z.object({
  schemeId: z.string().min(1),
  documents: z.array(z.object({
    id: z.string(),
    name: z.string(),
    status: z.enum(['available', 'missing', 'needs-verification']),
    verified: z.boolean(),
    fileName: z.string().optional(),
    uploadedAt: z.string().optional(),
    expiresAt: z.string().optional(),
  })),
});

export type DocumentReadinessRequest = z.infer<typeof DocumentReadinessRequestSchema>;

export interface DocumentReadinessResult {
  schemeId: string;
  schemeName: string;
  readinessScore: number;
  totalRequired: number;
  available: number;
  missing: string[];
  availableDocuments: string[];
  needsVerification: string[];
  optionalDocuments: string[];
  optionalAvailable: string[];
}

// ===== What-If Simulation (Feature 4) =====
export const SIMULATION_WHITELIST = [
  'age', 'annualIncome', 'state', 'educationLevel', 'occupation',
  'gender', 'areaType', 'isStudent', 'isFarmer', 'employmentStatus',
] as const;

export type SimulationField = typeof SIMULATION_WHITELIST[number];

export const SimulationRequestSchema = z.object({
  actualProfile: z.object({
    name: z.string().optional(),
    age: z.number().nullable(),
    gender: z.string(),
    state: z.string(),
    district: z.string().optional(),
    areaType: z.string(),
    occupation: z.string(),
    educationLevel: z.string(),
    course: z.string().optional(),
    isStudent: z.boolean().optional(),
    annualIncome: z.number().nullable(),
    employmentStatus: z.string().optional(),
    isFarmer: z.boolean().optional(),
    landHoldingAcres: z.number().nullable().optional(),
    hasDisability: z.boolean().optional(),
    isSeniorCitizen: z.boolean().optional(),
  }),
  simulationChanges: z.record(z.string(), z.unknown()),
  documents: z.array(z.object({
    id: z.string(),
    name: z.string(),
    status: z.enum(['available', 'missing', 'needs-verification']),
    verified: z.boolean(),
  })).optional().default([]),
});

export type SimulationRequest = z.infer<typeof SimulationRequestSchema>;

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

// ===== Scheme Explanation / Multilingual (Feature 5) =====
export const ExplanationRequestSchema = z.object({
  schemeId: z.string().min(1),
  language: z.enum(['en', 'te', 'hi']).default('en'),
  mode: z.enum(['simple', 'original']).default('simple'),
});

export type ExplanationRequest = z.infer<typeof ExplanationRequestSchema>;

export interface SchemeExplanationResult {
  schemeId: string;
  language: string;
  mode: string;
  name: string;
  description: string;
  benefits: string;
  eligibility: string;
  documents: string;
  applicationProcess: string;
  disclaimer: string;
}

// ===== Standard API Response =====
export interface ApiResponse<T> {
  success: boolean;
  data?: T | undefined;
  error?: {
    code: string;
    message: string;
    details?: string | undefined;
  } | undefined;
  timestamp: string;
}
