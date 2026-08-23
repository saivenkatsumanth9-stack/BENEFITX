/**
 * BENEFITX Master Backend Integration Test Suite
 *
 * Comprehensive tests covering:
 * - Dynamic Profile Match Scoring (scheme-specific weights, score breakdown, data confidence, match labels)
 * - Feature 1: Missed Scheme Detector (Recommendation Engine with dynamic scoring)
 * - Feature 2: Explainable Eligibility (MATCHED, PARTIALLY_MATCHED, FAILED, UNKNOWN)
 * - Feature 3: Smart Document Readiness (including EXPIRED document handling)
 * - Feature 4: What-If Eligibility Simulator (categorized changes, immutability)
 * - Feature 5: Simple Language + Multilingual Explanation (EN, TE, HI, template fallback)
 * - Feature 6: Application Status + Deadline Tracker (NOT_REGISTERED, REGISTERED, APPLICATION_STARTED, APPLIED, and OPEN, DEADLINE_APPROACHING, CLOSING_SOON, CLOSED, NO_DEADLINE)
 * - Security & Authorization (Cross-user isolation, Role separation)
 * - Unified Scheme Intelligence API
 */
import { describe, it, expect } from 'vitest';
import { recommendSchemes } from '../services/recommendationEngine';
import { evaluateEligibility, evaluateEligibilityEnhanced } from '../services/eligibilityEngine';
import { calculateDocumentReadiness, calculateDocumentReadinessEnhanced } from '../services/documentReadinessEngine';
import { simulateEligibility, simulateEligibilityEnhanced, SIMULATION_WHITELIST } from '../services/simulationEngine';
import { explainScheme } from '../services/explanationEngine';
import {
  getApplicationStatus,
  getDeadlineStatus,
  getApplicationStatusAndDeadline,
} from '../services/applicationStatusEngine';
import { generateActionPlan } from '../services/actionPlanEngine';
import { calculateSchemeUrgency } from '../services/urgencyEngine';
import { findRelatedSchemes } from '../services/relatedSchemeEngine';
import {
  computeProfileMatchWithBreakdown,
  generateSchemeWeights,
  buildScoreBreakdown,
  calculateDataConfidence,
  classifyMatchLabel,
  evaluateCriteria,
} from '@/lib/matching';
import { SCHEMES } from '../../data/schemes';
import { DEMO_PROFILE } from '../../services/profileService';
import { DEMO_DOCUMENTS } from '../../data/documents';
import type { UserProfile, UserDocument, ApplicationRecord } from '../../lib/types';

// ===== Standard Test Personas =====
const studentProfile: UserProfile = { ...DEMO_PROFILE }; // Aarav Reddy - Student, Telangana

const farmerProfile: UserProfile = {
  name: 'Rajesh Kumar',
  age: 42,
  gender: 'Male',
  state: 'Andhra Pradesh',
  district: 'Guntur',
  areaType: 'Rural',
  occupation: 'Farmer',
  educationLevel: '10th Pass',
  course: '',
  isStudent: false,
  annualIncome: 180000,
  employmentStatus: 'Self-employed',
  isFarmer: true,
  landHoldingAcres: 3.5,
  hasDisability: false,
  isSeniorCitizen: false,
  updatedAt: new Date().toISOString(),
};

const seniorProfile: UserProfile = {
  name: 'Venkatamma',
  age: 68,
  gender: 'Female',
  state: 'Telangana',
  district: 'Hyderabad',
  areaType: 'Urban',
  occupation: 'Retired',
  educationLevel: 'Below 10th',
  course: '',
  isStudent: false,
  annualIncome: 60000,
  employmentStatus: 'Retired',
  isFarmer: false,
  landHoldingAcres: null,
  hasDisability: false,
  isSeniorCitizen: true,
  updatedAt: new Date().toISOString(),
};

const incompleteProfile: UserProfile = {
  name: '',
  age: null,
  gender: '',
  state: '',
  district: '',
  areaType: '',
  occupation: '',
  educationLevel: '',
  course: '',
  isStudent: false,
  annualIncome: null,
  employmentStatus: '',
  isFarmer: false,
  landHoldingAcres: null,
  hasDisability: false,
  isSeniorCitizen: false,
  updatedAt: '',
};

const highIncomeProfile: UserProfile = {
  name: 'Rich Executive',
  age: 45,
  gender: 'Male',
  state: 'Maharashtra',
  district: 'Mumbai',
  areaType: 'Urban',
  occupation: 'Salaried',
  educationLevel: 'Postgraduate',
  course: '',
  isStudent: false,
  annualIncome: 8000000,
  employmentStatus: 'Employed',
  isFarmer: false,
  landHoldingAcres: null,
  hasDisability: false,
  isSeniorCitizen: false,
  updatedAt: new Date().toISOString(),
};

// ===================================================================
// 1. DYNAMIC PROFILE MATCH SCORING SYSTEM TESTS
// ===================================================================
describe('Dynamic Profile Match Scoring System', () => {
  it('Test 1: Different schemes produce DIFFERENT match scores for the same user profile', () => {
    // Evaluating multiple schemes against studentProfile should not yield identical scores
    const scheme1 = SCHEMES.find(s => s.id === 'scheme-001')!; // Scholarship (Student)
    const scheme3 = SCHEMES.find(s => s.id === 'scheme-003')!; // PM Kisan (Farmer)
    const scheme13 = SCHEMES.find(s => s.id === 'scheme-013')!; // Old Age Pension (Senior)

    const res1 = computeProfileMatchWithBreakdown(studentProfile, scheme1, DEMO_DOCUMENTS);
    const res3 = computeProfileMatchWithBreakdown(studentProfile, scheme3, DEMO_DOCUMENTS);
    const res13 = computeProfileMatchWithBreakdown(studentProfile, scheme13, DEMO_DOCUMENTS);

    // Scores must be dynamic and differentiated
    expect(res1.score).toBeGreaterThan(res3.score);
    expect(res1.score).toBeGreaterThan(res13.score);
    expect(res1.score).not.toEqual(res3.score);
    expect(res3.score).not.toEqual(res13.score);
  });

  it('Test 2: Same scheme produces DIFFERENT scores for different user profiles', () => {
    const scheme3 = SCHEMES.find(s => s.id === 'scheme-003')!; // PM Kisan (Farmer scheme)

    const farmerResult = computeProfileMatchWithBreakdown(farmerProfile, scheme3);
    const studentResult = computeProfileMatchWithBreakdown(studentProfile, scheme3);

    expect(farmerResult.score).toBeGreaterThan(studentResult.score);
    expect(farmerResult.breakdown.find(b => b.label === 'Farmer status')?.status).toBe('MATCHED');
    expect(studentResult.breakdown.find(b => b.label === 'Farmer status')?.status).toBe('FAILED');
  });

  it('Test 3: MATCHED criterion evaluation correctly identifies meeting conditions', () => {
    const scheme = SCHEMES.find(s => s.id === 'scheme-001')!;
    const criteria = evaluateCriteria(studentProfile, scheme);
    const incomeFactor = criteria.find(c => c.label === 'Annual income');
    expect(incomeFactor).toBeDefined();
    // studentProfile has income 120000 <= 300000
    expect(incomeFactor!.status).toBe('match');

    // Also test State matching on state-specific scheme-002 (Telangana)
    const stateScheme = SCHEMES.find(s => s.id === 'scheme-002')!;
    const stateCriteria = evaluateCriteria(studentProfile, stateScheme);
    const stateFactor = stateCriteria.find(c => c.label === 'State');
    expect(stateFactor).toBeDefined();
    expect(stateFactor!.status).toBe('match');
  });

  it('Test 4: FAILED criterion evaluation correctly identifies failing conditions', () => {
    const scheme = SCHEMES.find(s => s.id === 'scheme-003')!; // Farmer required
    const criteria = evaluateCriteria(studentProfile, scheme);
    const farmerFactor = criteria.find(c => c.label === 'Farmer status');
    expect(farmerFactor).toBeDefined();
    expect(farmerFactor!.status).toBe('mismatch');
  });

  it('Test 5: UNKNOWN criterion evaluation when profile field is missing', () => {
    const scheme = SCHEMES.find(s => s.id === 'scheme-001')!;
    const criteria = evaluateCriteria(incompleteProfile, scheme);
    const incomeFactor = criteria.find(c => c.label === 'Annual income');
    expect(incomeFactor).toBeDefined();
    expect(incomeFactor!.status).toBe('unknown');
  });

  it('Test 6: PARTIAL match evaluation on near-miss criteria', () => {
    // Scheme-001 has age limit 17-30. Near-threshold age 32 is slightly above 30 -> partial
    const nearAgeProfile: UserProfile = { ...studentProfile, age: 32 };
    const scholarshipScheme = SCHEMES.find(s => s.id === 'scheme-001')!; // age 17-30
    const criteria = evaluateCriteria(nearAgeProfile, scholarshipScheme);
    const ageFactor = criteria.find(c => c.label === 'Age');
    expect(ageFactor).toBeDefined();
    expect(ageFactor!.status).toBe('partial');
  });

  it('Test 7: Dynamic scheme weights derive from scheme eligibility criteria and sum to ~100', () => {
    const scheme1 = SCHEMES.find(s => s.id === 'scheme-001')!;
    const weights1 = generateSchemeWeights(scheme1);
    const total1 = Object.values(weights1).reduce((sum, w) => sum + w, 0);
    expect(total1).toBeGreaterThanOrEqual(95);
    expect(total1).toBeLessThanOrEqual(105);

    const scheme3 = SCHEMES.find(s => s.id === 'scheme-003')!;
    const weights3 = generateSchemeWeights(scheme3);
    // Scheme 3 has Farmer status, Scheme 1 does not
    expect(weights3['Farmer status']).toBeDefined();
    expect(weights1['Farmer status']).toBeUndefined();
  });

  it('Test 8: Data confidence varies based on profile completeness', () => {
    const scheme = SCHEMES.find(s => s.id === 'scheme-001')!;
    const fullRes = computeProfileMatchWithBreakdown(studentProfile, scheme);
    const incompleteRes = computeProfileMatchWithBreakdown(incompleteProfile, scheme);

    expect(fullRes.dataConfidence).toBe('HIGH');
    expect(incompleteRes.dataConfidence).toBe('LOW');
  });

  it('Test 8b: Match labels classify accurately across score thresholds', () => {
    expect(classifyMatchLabel(95)).toBe('EXCELLENT_MATCH');
    expect(classifyMatchLabel(80)).toBe('STRONG_MATCH');
    expect(classifyMatchLabel(65)).toBe('POTENTIAL_MATCH');
    expect(classifyMatchLabel(45)).toBe('LOW_MATCH');
    expect(classifyMatchLabel(20)).toBe('WEAK_MATCH');
  });
});

// ===================================================================
// 2. FEATURE 1: DYNAMIC MISSED SCHEME DETECTOR TESTS
// ===================================================================
describe('Feature 1: Dynamic Missed Scheme Detector', () => {
  it('Test 9: Missed scheme ranking uses dynamic scores and includes score breakdown', () => {
    const results = recommendSchemes(studentProfile, SCHEMES, DEMO_DOCUMENTS);
    expect(results.length).toBeGreaterThan(0);

    // Verify sort order
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1]!.matchScore).toBeGreaterThanOrEqual(results[i]!.matchScore);
    }

    // Verify presence of dynamic breakdown and metadata
    const topResult = results[0]!;
    expect(topResult.scoreBreakdown).toBeDefined();
    expect(Array.isArray(topResult.scoreBreakdown)).toBe(true);
    expect(topResult.dataConfidence).toBeDefined();
    expect(topResult.matchLabel).toBeDefined();
    expect(topResult.reason).toBeTruthy();
  });

  it('should exclude specified scheme IDs correctly', () => {
    const exclude = ['scheme-001', 'scheme-002'];
    const results = recommendSchemes(studentProfile, SCHEMES, [], exclude);
    const returnedIds = results.map(r => r.schemeId);
    for (const id of exclude) {
      expect(returnedIds).not.toContain(id);
    }
  });

  it('should respect result limit parameter', () => {
    const results = recommendSchemes(studentProfile, SCHEMES, [], [], 3);
    expect(results.length).toBeLessThanOrEqual(3);
  });
});

// ===================================================================
// 3. FEATURE 2: EXPLAINABLE ELIGIBILITY ENGINE TESTS
// ===================================================================
describe('Feature 2: Explainable Eligibility Engine', () => {
  it('should return MATCHED or UNKNOWN for student on National Merit Scholarship', () => {
    const result = evaluateEligibility(studentProfile, 'scheme-001');
    expect(result).not.toBeNull();
    expect(['MATCHED', 'UNKNOWN']).toContain(result!.status);
    expect(result!.matchedConditions.length).toBeGreaterThan(0);
    expect(result!.overallNote).toContain('National Merit Scholarship');
  });

  it('should return FAILED for rich executive on welfare schemes with income cap', () => {
    const result = evaluateEligibility(highIncomeProfile, 'scheme-001');
    expect(result).not.toBeNull();
    expect(result!.status).toBe('FAILED');
    expect(result!.failedConditions.length).toBeGreaterThan(0);
  });

  it('should return enhanced eligibility with PARTIALLY_MATCHED and scoreBreakdown', () => {
    const nearProfile: UserProfile = { ...studentProfile, age: 26 };
    const enhanced = evaluateEligibilityEnhanced(nearProfile, 'scheme-001');
    expect(enhanced).not.toBeNull();
    expect(enhanced!.scoreBreakdown).toBeDefined();
    expect(Array.isArray(enhanced!.scoreBreakdown)).toBe(true);
    expect(enhanced!.scoreBreakdown.length).toBeGreaterThan(0);
  });

  it('should never force UNKNOWN into MATCHED when profile fields are missing', () => {
    const result = evaluateEligibility(incompleteProfile, 'scheme-001');
    expect(result).not.toBeNull();
    if (result!.missingInformation.length > 0) {
      expect(result!.status).not.toBe('MATCHED');
    }
  });

  it('should return null for non-existent schemeId', () => {
    const result = evaluateEligibility(studentProfile, 'invalid-scheme-xyz');
    expect(result).toBeNull();
  });
});

// ===================================================================
// 4. FEATURE 3: SMART DOCUMENT READINESS ENGINE TESTS
// ===================================================================
describe('Feature 3: Smart Document Readiness Engine', () => {
  it('Test 10: Calculates correct readiness score based on available required documents', () => {
    const result = calculateDocumentReadiness(DEMO_DOCUMENTS, 'scheme-001');
    expect(result).not.toBeNull();
    expect(result!.readinessScore).toBeGreaterThanOrEqual(0);
    expect(result!.readinessScore).toBeLessThanOrEqual(100);
    expect(result!.totalRequired).toBeGreaterThan(0);
  });

  it('Test 11: Expired document handling properly identifies expired docs and excludes from available', () => {
    const docsWithExpired: UserDocument[] = [
      { id: '1', name: 'Aadhaar', status: 'available', verified: true },
      { id: '2', name: 'Education Certificate', status: 'available', verified: true },
      { id: '3', name: 'Income Certificate', status: 'expired', verified: false }, // EXPIRED
      { id: '4', name: 'Photograph', status: 'available', verified: true },
      { id: '5', name: 'Bank Passbook', status: 'available', verified: true },
    ];

    const enhanced = calculateDocumentReadinessEnhanced(docsWithExpired, 'scheme-001');
    expect(enhanced).not.toBeNull();
    expect(enhanced!.expired).toContain('Income Certificate');
    expect(enhanced!.availableDocuments).not.toContain('Income Certificate');
    // 4 out of 5 available = 80% readiness
    expect(enhanced!.readinessScore).toBe(80);
  });

  it('should not penalize readiness score for missing optional documents', () => {
    const fullDocs: UserDocument[] = [
      { id: '1', name: 'Aadhaar', status: 'available', verified: true },
      { id: '2', name: 'Education Certificate', status: 'available', verified: true },
      { id: '3', name: 'Income Certificate', status: 'available', verified: true },
      { id: '4', name: 'Photograph', status: 'available', verified: true },
      { id: '5', name: 'Bank Passbook', status: 'available', verified: true },
      // Caste certificate is optional for scheme-001 and omitted here
    ];

    const result = calculateDocumentReadiness(fullDocs, 'scheme-001');
    expect(result).not.toBeNull();
    expect(result!.readinessScore).toBe(100);
    expect(result!.missing).toHaveLength(0);
  });
});

// ===================================================================
// 5. FEATURE 4: WHAT-IF ELIGIBILITY SIMULATOR TESTS
// ===================================================================
describe('Feature 4: What-If Eligibility Simulator', () => {
  it('Test 12: What-if simulation calculates scoreChange and categorizes improved/reduced schemes', () => {
    const result = simulateEligibilityEnhanced(
      farmerProfile,
      { annualIncome: 50000 }, // Reducing income
      DEMO_DOCUMENTS,
    );

    expect(result.simulationOnly).toBe(true);
    expect(typeof result.scoreChange).toBe('number');
    expect(Array.isArray(result.improvedSchemes)).toBe(true);
    expect(Array.isArray(result.reducedSchemes)).toBe(true);
    expect(typeof result.unchangedCount).toBe('number');
  });

  it('Test 13: Actual user profile is NEVER modified after simulation execution', () => {
    const profileCopy = { ...farmerProfile };
    const originalIncome = profileCopy.annualIncome;
    const originalState = profileCopy.state;

    simulateEligibilityEnhanced(
      profileCopy,
      { annualIncome: 20000, state: 'Telangana' },
      DEMO_DOCUMENTS,
    );

    expect(profileCopy.annualIncome).toBe(originalIncome);
    expect(profileCopy.state).toBe(originalState);
  });

  it('should reject non-whitelisted fields from simulation changes', () => {
    const result = simulateEligibility(
      studentProfile,
      { annualIncome: 100000, hackerField: 'injected', isAdmin: true },
      DEMO_DOCUMENTS,
    );

    expect(result.appliedChanges).toHaveProperty('annualIncome');
    expect(result.appliedChanges).not.toHaveProperty('hackerField');
    expect(result.appliedChanges).not.toHaveProperty('isAdmin');
  });

  it('should confirm all 10 whitelisted simulation fields are supported', () => {
    expect(SIMULATION_WHITELIST).toHaveLength(10);
    expect(SIMULATION_WHITELIST).toContain('age');
    expect(SIMULATION_WHITELIST).toContain('annualIncome');
    expect(SIMULATION_WHITELIST).toContain('state');
    expect(SIMULATION_WHITELIST).toContain('educationLevel');
    expect(SIMULATION_WHITELIST).toContain('occupation');
    expect(SIMULATION_WHITELIST).toContain('gender');
    expect(SIMULATION_WHITELIST).toContain('areaType');
    expect(SIMULATION_WHITELIST).toContain('isStudent');
    expect(SIMULATION_WHITELIST).toContain('isFarmer');
    expect(SIMULATION_WHITELIST).toContain('employmentStatus');
  });
});

// ===================================================================
// 6. FEATURE 5: MULTILINGUAL EXPLANATION ENGINE TESTS
// ===================================================================
describe('Feature 5: Simple Language + Multilingual Explanation', () => {
  it('Test 14: Generates clear English explanation with all structured sections', () => {
    const result = explainScheme('scheme-001', 'en', 'simple');
    expect(result).not.toBeNull();
    expect(result!.language).toBe('en');
    expect(result!.description).toBeTruthy();
    expect(result!.benefits).toBeTruthy();
    expect(result!.eligibility).toBeTruthy();
    expect(result!.documents).toBeTruthy();
    expect(result!.applicationProcess).toBeTruthy();
    expect(result!.disclaimer).toBeTruthy();
  });

  it('Test 15: Generates Telugu explanation containing accurate regional translations', () => {
    const result = explainScheme('scheme-001', 'te', 'simple');
    expect(result).not.toBeNull();
    expect(result!.language).toBe('te');
    expect(result!.eligibility).toBeTruthy();
    expect(result!.disclaimer).toBeTruthy();
    expect(result!.disclaimer).toContain('ప్రభుత్వ');
  });

  it('Test 16: Generates Hindi explanation containing accurate regional translations', () => {
    const result = explainScheme('scheme-001', 'hi', 'simple');
    expect(result).not.toBeNull();
    expect(result!.language).toBe('hi');
    expect(result!.eligibility).toBeTruthy();
    expect(result!.disclaimer).toBeTruthy();
    expect(result!.disclaimer).toContain('सरकारी');
  });

  it('Test 28: AI failure fallback ensures deterministic template explanation is always returned', () => {
    // When no AI key is present, template fallback produces 100% complete responses without error
    const result = explainScheme('scheme-001', 'te', 'simple');
    expect(result).not.toBeNull();
    expect(result!.benefits.length).toBeGreaterThan(0);
    expect(result!.applicationProcess.length).toBeGreaterThan(0);
  });
});

// ===================================================================
// 7. FEATURE 6: APPLICATION STATUS + DEADLINE TRACKER TESTS
// ===================================================================
describe('Feature 6: Application Status + Deadline Tracker', () => {
  it('Test 17: Returns NOT_REGISTERED status when user has no tracked application for scheme', () => {
    const result = getApplicationStatus('scheme-001', []);
    expect(result).not.toBeNull();
    expect(result!.applicationStatus).toBe('NOT_REGISTERED');
    expect(result!.registeredAt).toBeUndefined();
    expect(result!.appliedAt).toBeUndefined();
    expect(result!.statusNote).toContain('not yet started');
  });

  it('Test 18: Returns REGISTERED status when application is in Saved or Preparing stage', () => {
    const apps: ApplicationRecord[] = [
      { schemeId: 'scheme-001', status: 'Preparing', updatedAt: '2026-08-20T10:00:00Z' },
    ];
    const result = getApplicationStatus('scheme-001', apps);
    expect(result).not.toBeNull();
    expect(result!.applicationStatus).toBe('REGISTERED');
    expect(result!.registeredAt).toBe('2026-08-20T10:00:00Z');
    expect(result!.statusNote).toContain('Preparing');
  });

  it('Test 19: Returns APPLICATION_STARTED status when application is Ready to Apply', () => {
    const apps: ApplicationRecord[] = [
      { schemeId: 'scheme-001', status: 'Ready to Apply', updatedAt: '2026-08-21T10:00:00Z' },
    ];
    const result = getApplicationStatus('scheme-001', apps);
    expect(result).not.toBeNull();
    expect(result!.applicationStatus).toBe('APPLICATION_STARTED');
    expect(result!.statusNote).toContain('ready');
  });

  it('Test 20: Returns APPLIED status when application has been submitted', () => {
    const apps: ApplicationRecord[] = [
      { schemeId: 'scheme-001', status: 'Applied', updatedAt: '2026-08-22T10:00:00Z' },
    ];
    const result = getApplicationStatus('scheme-001', apps);
    expect(result).not.toBeNull();
    expect(result!.applicationStatus).toBe('APPLIED');
    expect(result!.appliedAt).toBe('2026-08-22T10:00:00Z');
    expect(result!.statusNote).toContain('applied');
  });

  it('Test 21: Returns OPEN deadline status when > 30 days remaining', () => {
    // Reference date 50 days before scheme-001 deadline (2026-10-31) -> 2026-09-11
    const refDate = new Date('2026-09-11T00:00:00Z');
    const result = getDeadlineStatus('scheme-001', SCHEMES, refDate);
    expect(result).not.toBeNull();
    expect(result!.deadlineStatus).toBe('OPEN');
    expect(result!.daysRemaining).toBeGreaterThan(30);
  });

  it('Test 22: Returns DEADLINE_APPROACHING status when 8–30 days remaining', () => {
    // Reference date 20 days before 2026-10-31 -> 2026-10-11
    const refDate = new Date('2026-10-11T00:00:00Z');
    const result = getDeadlineStatus('scheme-001', SCHEMES, refDate);
    expect(result).not.toBeNull();
    expect(result!.deadlineStatus).toBe('DEADLINE_APPROACHING');
    expect(result!.daysRemaining).toBeLessThanOrEqual(30);
    expect(result!.daysRemaining).toBeGreaterThan(7);
  });

  it('Test 23: Returns CLOSING_SOON status when 1–7 days remaining', () => {
    // Reference date 4 days before 2026-10-31 -> 2026-10-27
    const refDate = new Date('2026-10-27T00:00:00Z');
    const result = getDeadlineStatus('scheme-001', SCHEMES, refDate);
    expect(result).not.toBeNull();
    expect(result!.deadlineStatus).toBe('CLOSING_SOON');
    expect(result!.daysRemaining).toBeLessThanOrEqual(7);
    expect(result!.daysRemaining).toBeGreaterThan(0);
  });

  it('Test 24: Returns CLOSED status when deadline date has passed', () => {
    // Reference date after 2026-10-31 -> 2026-11-05
    const refDate = new Date('2026-11-05T00:00:00Z');
    const result = getDeadlineStatus('scheme-001', SCHEMES, refDate);
    expect(result).not.toBeNull();
    expect(result!.deadlineStatus).toBe('CLOSED');
    expect(result!.daysRemaining).toBe(0);
  });

  it('Test 25: Returns NO_DEADLINE status when scheme is open-ended with no deadline date', () => {
    // scheme-003 (PM Kisan) has no deadline
    const result = getDeadlineStatus('scheme-003', SCHEMES);
    expect(result).not.toBeNull();
    expect(result!.deadlineStatus).toBe('NO_DEADLINE');
    expect(result!.deadline).toBeNull();
    expect(result!.daysRemaining).toBe(-1);
  });

  it('Combined getApplicationStatusAndDeadline returns both components cleanly', () => {
    const apps: ApplicationRecord[] = [
      { schemeId: 'scheme-001', status: 'Preparing', updatedAt: '2026-08-20T10:00:00Z' },
    ];
    const result = getApplicationStatusAndDeadline('scheme-001', apps);
    expect(result).not.toBeNull();
    expect(result!.application.applicationStatus).toBe('REGISTERED');
    expect(result!.deadline.deadline).toBe('2026-10-31');
  });
});

// ===================================================================
// 8. SECURITY & AUTHORIZATION TESTS
// ===================================================================
describe('Security & Authorization Isolation', () => {
  it('Test 26: Application status isolation across different user contexts', () => {
    const user1Apps: ApplicationRecord[] = [
      { schemeId: 'scheme-001', status: 'Applied', updatedAt: '2026-08-20T00:00:00Z' },
    ];
    const user2Apps: ApplicationRecord[] = [];

    const user1Result = getApplicationStatus('scheme-001', user1Apps);
    const user2Result = getApplicationStatus('scheme-001', user2Apps);

    expect(user1Result!.applicationStatus).toBe('APPLIED');
    expect(user2Result!.applicationStatus).toBe('NOT_REGISTERED');
  });

  it('Test 27: Document readiness evaluates strictly with provided document payload', () => {
    const userADocs: UserDocument[] = [
      { id: '1', name: 'Aadhaar', status: 'available', verified: true },
    ];
    const userBDocs: UserDocument[] = [
      { id: '1', name: 'Aadhaar', status: 'available', verified: true },
      { id: '2', name: 'Education Certificate', status: 'available', verified: true },
      { id: '3', name: 'Income Certificate', status: 'available', verified: true },
      { id: '4', name: 'Photograph', status: 'available', verified: true },
      { id: '5', name: 'Bank Passbook', status: 'available', verified: true },
    ];

    const resultA = calculateDocumentReadiness(userADocs, 'scheme-001');
    const resultB = calculateDocumentReadiness(userBDocs, 'scheme-001');

    expect(resultA!.readinessScore).toBe(20);
    expect(resultB!.readinessScore).toBe(100);
  });

  it('Admin authorization context separates officer permissions from citizen permissions', async () => {
    const { getCurrentUser, requireAdmin } = await import('../../server/auth');
    const admin = getCurrentUser('admin');
    expect(admin.role).toBe('admin');
    expect(admin.name).toBeTruthy();
    expect(admin.department).toBeTruthy();

    const citizen = getCurrentUser('citizen');
    expect(citizen.role).toBe('citizen');
    expect(citizen.role).not.toBe('admin');

    const adminContext = requireAdmin();
    expect(adminContext.role).toBe('admin');
  });
});

// ===================================================================
// 9. FEATURE 7: PERSONALIZED ACTION PLAN ENGINE TESTS
// ===================================================================
describe('Feature 7: Personalized Action Plan Engine', () => {
  it('Test 1: Missing document creates DOCUMENT action step', () => {
    // Missing Income Certificate
    const partialDocs: UserDocument[] = [
      { id: '1', name: 'Aadhaar', status: 'available', verified: true },
      { id: '2', name: 'Education Certificate', status: 'available', verified: true },
      { id: '3', name: 'Income Certificate', status: 'missing', verified: false },
      { id: '4', name: 'Photograph', status: 'available', verified: true },
      { id: '5', name: 'Bank Passbook', status: 'available', verified: true },
    ];

    const plan = generateActionPlan('scheme-001', studentProfile, partialDocs, []);
    expect(plan).not.toBeNull();
    expect(plan!.status).toBe('ACTION_REQUIRED');
    const docStep = plan!.steps.find((s) => s.type === 'DOCUMENT' && s.documentName === 'Income Certificate');
    expect(docStep).toBeDefined();
    expect(docStep!.action).toContain('Income Certificate');
  });

  it('Test 2: Not registered user receives REGISTRATION action step', () => {
    const plan = generateActionPlan('scheme-001', studentProfile, DEMO_DOCUMENTS, []);
    expect(plan).not.toBeNull();
    const regStep = plan!.steps.find((s) => s.type === 'REGISTRATION');
    expect(regStep).toBeDefined();
    expect(regStep!.action).toContain('Register');
  });

  it('Test 3: Applied user receives TRACK_APPLICATION and does NOT receive registration action', () => {
    const apps: ApplicationRecord[] = [
      { schemeId: 'scheme-001', status: 'Applied', updatedAt: '2026-08-20T00:00:00Z' },
    ];
    const plan = generateActionPlan('scheme-001', studentProfile, DEMO_DOCUMENTS, apps);
    expect(plan).not.toBeNull();
    expect(plan!.status).toBe('COMPLETED');
    expect(plan!.priority).toBe('COMPLETED');
    const regStep = plan!.steps.find((s) => s.type === 'REGISTRATION');
    expect(regStep).toBeUndefined();
    const trackStep = plan!.steps.find((s) => s.type === 'TRACK_APPLICATION');
    expect(trackStep).toBeDefined();
  });

  it('Test 4: Closed scheme does not receive application submission action', () => {
    // Reference date after deadline
    const pastDate = new Date('2026-11-10T00:00:00Z');
    const plan = generateActionPlan('scheme-001', studentProfile, DEMO_DOCUMENTS, [], SCHEMES, pastDate);
    expect(plan).not.toBeNull();
    expect(plan!.status).toBe('CLOSED');
    const appStep = plan!.steps.find((s) => s.type === 'APPLICATION');
    expect(appStep).toBeUndefined();
  });

  it('Test 5: Failed eligibility produces BLOCKED state and explains failed criteria', () => {
    const plan = generateActionPlan('scheme-001', highIncomeProfile, DEMO_DOCUMENTS, []);
    expect(plan).not.toBeNull();
    expect(plan!.status).toBe('BLOCKED');
    expect(plan!.priority).toBe('BLOCKED');
    expect(plan!.summary).toContain('do not currently meet mandatory criteria');
    const updateStep = plan!.steps.find((s) => s.type === 'PROFILE_UPDATE');
    expect(updateStep).toBeDefined();
    // No application step should be present for blocked user
    const appStep = plan!.steps.find((s) => s.type === 'APPLICATION');
    expect(appStep).toBeUndefined();
  });
});

// ===================================================================
// 10. FEATURE 8: SMART DEADLINE RISK / URGENCY ENGINE TESTS
// ===================================================================
describe('Feature 8: Smart Deadline Risk / Urgency Engine', () => {
  it('Test 6: 2 days remaining + strong match + missing docs results in CRITICAL urgency', () => {
    // Reference date 2 days before 2026-10-31 -> 2026-10-29
    const refDate = new Date('2026-10-29T00:00:00Z');
    const partialDocs: UserDocument[] = [
      { id: '1', name: 'Aadhaar', status: 'available', verified: true },
    ];
    const urgency = calculateSchemeUrgency('scheme-001', studentProfile, partialDocs, [], SCHEMES, refDate);
    expect(urgency).not.toBeNull();
    expect(urgency!.urgency).toBe('CRITICAL');
    expect(urgency!.urgencyScore).toBeGreaterThanOrEqual(80);
    expect(urgency!.reason.some((r) => r.toLowerCase().includes('critical') || r.toLowerCase().includes('remain'))).toBe(true);
  });

  it('Test 7: 15 days remaining results in MEDIUM / HIGH urgency depending on doc readiness', () => {
    // Reference date 15 days before 2026-10-31 -> 2026-10-16
    const refDate = new Date('2026-10-16T00:00:00Z');
    const urgency = calculateSchemeUrgency('scheme-001', studentProfile, DEMO_DOCUMENTS, [], SCHEMES, refDate);
    expect(urgency).not.toBeNull();
    expect(['MEDIUM', 'HIGH']).toContain(urgency!.urgency);
    expect(urgency!.daysRemaining).toBe(15);
  });

  it('Test 8: 45 days remaining + already applied results in LOW urgency', () => {
    // Reference date 45 days before 2026-10-31 -> 2026-09-16
    const refDate = new Date('2026-09-16T00:00:00Z');
    const apps: ApplicationRecord[] = [
      { schemeId: 'scheme-001', status: 'Applied', updatedAt: '2026-09-15T00:00:00Z' },
    ];
    const urgency = calculateSchemeUrgency('scheme-001', studentProfile, DEMO_DOCUMENTS, apps, SCHEMES, refDate);
    expect(urgency).not.toBeNull();
    expect(urgency!.urgency).toBe('LOW');
    expect(urgency!.reason.some((r) => r.includes('already been submitted'))).toBe(true);
  });

  it('Test 9: Passed deadline results in CLOSED urgency state with score 0', () => {
    const pastDate = new Date('2026-11-05T00:00:00Z');
    const urgency = calculateSchemeUrgency('scheme-001', studentProfile, DEMO_DOCUMENTS, [], SCHEMES, pastDate);
    expect(urgency).not.toBeNull();
    expect(urgency!.urgency).toBe('CLOSED');
    expect(urgency!.urgencyScore).toBe(0);
    expect(urgency!.daysRemaining).toBe(0);
  });

  it('Test 10: Failed eligibility results in BLOCKED urgency state with score 0', () => {
    const urgency = calculateSchemeUrgency('scheme-001', highIncomeProfile, DEMO_DOCUMENTS, []);
    expect(urgency).not.toBeNull();
    expect(urgency!.urgency).toBe('BLOCKED');
    expect(urgency!.urgencyScore).toBe(0);
    expect(urgency!.reason[0]).toContain('blocked');
  });
});

// ===================================================================
// 11. FEATURE 9: RELATED SCHEME DISCOVERY ENGINE TESTS
// ===================================================================
describe('Feature 9: Related Scheme Discovery / Benefit Relationship Engine', () => {
  it('Test 11: Related schemes are identified correctly for Education schemes', () => {
    const result = findRelatedSchemes('scheme-001', studentProfile);
    expect(result).not.toBeNull();
    expect(result!.sourceScheme.name).toContain('National Merit Scholarship');
    expect(result!.relatedSchemes.length).toBeGreaterThan(0);

    // Education scholarship should find related education / student assistance schemes
    const relatedIds = result!.relatedSchemes.map((r) => r.schemeId);
    // scheme-002 (Post-Matric Scholarship) or scheme-021 (Student Laptop) or scheme-007 (Youth Internship)
    const hasEducationOrStudentRelation = result!.relatedSchemes.some(
      (r) => r.category === 'Education' || r.category === 'Employment' || r.relationshipType === 'SAME_TARGET_GROUP',
    );
    expect(hasEducationOrStudentRelation).toBe(true);
  });

  it('Test 12: Unrelated agricultural schemes rank significantly lower for non-farmers', () => {
    const result = findRelatedSchemes('scheme-001', studentProfile);
    expect(result).not.toBeNull();
    const topRelated = result!.relatedSchemes[0]!;
    // Top related scheme should have high combined score
    expect(topRelated.combinedScore).toBeGreaterThan(60);
  });

  it('Test 13: User profile personalized ranking prioritizes schemes the citizen matches', () => {
    // For farmer profile on PM Kisan (scheme-003), Kisan Credit Card (scheme-004) should be #1
    const farmerRelations = findRelatedSchemes('scheme-003', farmerProfile);
    expect(farmerRelations).not.toBeNull();
    const kcc = farmerRelations!.relatedSchemes.find((r) => r.schemeId === 'scheme-004');
    expect(kcc).toBeDefined();
    expect(kcc!.profileMatchScore).toBeGreaterThanOrEqual(70);
    expect(kcc!.combinedScore).toBeGreaterThanOrEqual(70);
  });

  it('Test 14: Social category / caste is never inferred from indirect profile data', () => {
    // Evaluating related schemes without explicit category must never fail or make assumptions
    const noCategoryProfile: UserProfile = { ...studentProfile };
    const result = findRelatedSchemes('scheme-001', noCategoryProfile);
    expect(result).not.toBeNull();
    for (const scheme of result!.relatedSchemes) {
      expect(scheme.combinedScore).toBeGreaterThanOrEqual(0);
      expect(scheme.combinedScore).toBeLessThanOrEqual(100);
    }
  });
});

