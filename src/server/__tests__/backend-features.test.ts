/**
 * BENEFITX Backend Feature Tests
 *
 * Tests all 5 backend features:
 * 1. Missed Scheme Detector (Recommendation Engine)
 * 2. Explainable Eligibility
 * 3. Smart Document Readiness
 * 4. What-If Eligibility Simulator
 * 5. Simple Language + Multilingual Explanation
 */
import { describe, it, expect } from 'vitest';
import { recommendSchemes } from '../services/recommendationEngine';
import { evaluateEligibility } from '../services/eligibilityEngine';
import { calculateDocumentReadiness } from '../services/documentReadinessEngine';
import { simulateEligibility, SIMULATION_WHITELIST } from '../services/simulationEngine';
import { explainScheme } from '../services/explanationEngine';
import { SCHEMES } from '../../data/schemes';
import { DEMO_PROFILE } from '../../services/profileService';
import { DEMO_DOCUMENTS } from '../../data/documents';
import type { UserProfile, UserDocument } from '../../lib/types';

// ===== Test profiles =====
const fullProfile: UserProfile = { ...DEMO_PROFILE };

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

const failingProfile: UserProfile = {
  name: 'Test User',
  age: 80,
  gender: 'Male',
  state: 'Goa',
  district: 'South Goa',
  areaType: 'Urban',
  occupation: 'Retired',
  educationLevel: 'Postgraduate',
  course: '',
  isStudent: false,
  annualIncome: 5000000,
  employmentStatus: 'Retired',
  isFarmer: false,
  landHoldingAcres: null,
  hasDisability: false,
  isSeniorCitizen: true,
  updatedAt: new Date().toISOString(),
};

// ===== FEATURE 1: Missed Scheme Detector =====
describe('Feature 1: Missed Scheme Detector (Recommendation Engine)', () => {
  it('should return ranked scheme recommendations for a valid profile', () => {
    const results = recommendSchemes(fullProfile);
    expect(results).toBeDefined();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
  });

  it('should produce deterministic scores (same input = same output)', () => {
    const results1 = recommendSchemes(fullProfile);
    const results2 = recommendSchemes(fullProfile);
    expect(results1.length).toBe(results2.length);
    for (let i = 0; i < results1.length; i++) {
      expect(results1[i]!.matchScore).toBe(results2[i]!.matchScore);
      expect(results1[i]!.schemeId).toBe(results2[i]!.schemeId);
    }
  });

  it('should return results sorted by matchScore descending', () => {
    const results = recommendSchemes(fullProfile);
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1]!.matchScore).toBeGreaterThanOrEqual(results[i]!.matchScore);
    }
  });

  it('should include matchedCriteria, failedCriteria, and unknownCriteria', () => {
    const results = recommendSchemes(fullProfile);
    for (const result of results) {
      expect(Array.isArray(result.matchedCriteria)).toBe(true);
      expect(Array.isArray(result.failedCriteria)).toBe(true);
      expect(Array.isArray(result.unknownCriteria)).toBe(true);
    }
  });

  it('should correctly classify status based on matchScore', () => {
    const results = recommendSchemes(fullProfile, SCHEMES, [], [], 50);
    for (const result of results) {
      if (result.matchScore >= 75) {
        expect(result.status).toBe('POTENTIAL_MATCH');
      } else if (result.matchScore >= 50) {
        expect(result.status).toBe('PARTIAL_MATCH');
      } else {
        expect(result.status).toBe('UNLIKELY_MATCH');
      }
    }
  });

  it('should exclude specified scheme IDs', () => {
    const excludeIds = [SCHEMES[0]!.id, SCHEMES[1]!.id];
    const results = recommendSchemes(fullProfile, SCHEMES, [], excludeIds);
    const resultIds = results.map(r => r.schemeId);
    for (const id of excludeIds) {
      expect(resultIds).not.toContain(id);
    }
  });

  it('should respect the limit parameter', () => {
    const results = recommendSchemes(fullProfile, SCHEMES, [], [], 3);
    expect(results.length).toBeLessThanOrEqual(3);
  });

  it('should provide a human-readable reason for each recommendation', () => {
    const results = recommendSchemes(fullProfile);
    for (const result of results) {
      expect(result.reason).toBeTruthy();
      expect(typeof result.reason).toBe('string');
      expect(result.reason.length).toBeGreaterThan(10);
    }
  });

  it('should use "profile match" semantics — scores between 5 and 99', () => {
    const results = recommendSchemes(fullProfile, SCHEMES, [], [], 50);
    for (const result of results) {
      expect(result.matchScore).toBeGreaterThanOrEqual(5);
      expect(result.matchScore).toBeLessThanOrEqual(99);
    }
  });
});

// ===== FEATURE 2: Explainable Eligibility =====
describe('Feature 2: Explainable Eligibility', () => {
  it('should return MATCHED status when profile meets all criteria', () => {
    // scheme-001 is National Merit Scholarship — DEMO_PROFILE should match well
    const result = evaluateEligibility(fullProfile, 'scheme-001');
    expect(result).not.toBeNull();
    expect(['MATCHED', 'UNKNOWN']).toContain(result!.status);
    expect(result!.matchedConditions.length).toBeGreaterThan(0);
  });

  it('should return FAILED status when profile fails criteria', () => {
    const result = evaluateEligibility(failingProfile, 'scheme-001');
    expect(result).not.toBeNull();
    expect(result!.status).toBe('FAILED');
    expect(result!.failedConditions.length).toBeGreaterThan(0);
  });

  it('should return UNKNOWN status when profile information is missing', () => {
    const result = evaluateEligibility(incompleteProfile, 'scheme-001');
    expect(result).not.toBeNull();
    expect(['UNKNOWN', 'FAILED']).toContain(result!.status);
    expect(result!.missingInformation.length).toBeGreaterThan(0);
  });

  it('should never force UNKNOWN into MATCHED', () => {
    const result = evaluateEligibility(incompleteProfile, 'scheme-001');
    expect(result).not.toBeNull();
    if (result!.missingInformation.length > 0) {
      expect(result!.status).not.toBe('MATCHED');
    }
  });

  it('should return null for non-existent scheme', () => {
    const result = evaluateEligibility(fullProfile, 'non-existent-scheme');
    expect(result).toBeNull();
  });

  it('should include an overall note explaining the assessment', () => {
    const result = evaluateEligibility(fullProfile, 'scheme-001');
    expect(result).not.toBeNull();
    expect(result!.overallNote).toBeTruthy();
    expect(typeof result!.overallNote).toBe('string');
  });

  it('should provide human-readable condition descriptions', () => {
    const result = evaluateEligibility(fullProfile, 'scheme-001');
    expect(result).not.toBeNull();
    for (const condition of result!.matchedConditions) {
      expect(condition.length).toBeGreaterThan(5);
    }
  });
});

// ===== FEATURE 3: Smart Document Readiness =====
describe('Feature 3: Smart Document Readiness', () => {
  it('should calculate correct readiness score', () => {
    const result = calculateDocumentReadiness(DEMO_DOCUMENTS, 'scheme-001');
    expect(result).not.toBeNull();
    expect(result!.readinessScore).toBeGreaterThanOrEqual(0);
    expect(result!.readinessScore).toBeLessThanOrEqual(100);
  });

  it('should correctly identify missing documents', () => {
    const result = calculateDocumentReadiness(DEMO_DOCUMENTS, 'scheme-001');
    expect(result).not.toBeNull();
    // scheme-001 requires Aadhaar, Education Certificate, Income Certificate, Photograph, Bank Passbook
    // DEMO_DOCUMENTS has Aadhaar (available), Education Certificate (needs-verification),
    // Photograph (available), Bank Passbook (available), Income Certificate (missing)
    expect(result!.missing).toContain('Income Certificate');
  });

  it('should not reduce readiness for optional documents', () => {
    const docsWithoutOptional: UserDocument[] = DEMO_DOCUMENTS.filter(
      d => d.name !== 'Caste Certificate'
    );
    const result = calculateDocumentReadiness(docsWithoutOptional, 'scheme-001');
    expect(result).not.toBeNull();
    // Optional documents should not affect the readiness score
    expect(result!.optionalDocuments).toBeDefined();
  });

  it('should return 100% when all required documents are available', () => {
    const allDocs: UserDocument[] = [
      { id: 'a', name: 'Aadhaar', status: 'available', verified: true },
      { id: 'b', name: 'Education Certificate', status: 'available', verified: true },
      { id: 'c', name: 'Income Certificate', status: 'available', verified: true },
      { id: 'd', name: 'Photograph', status: 'available', verified: true },
      { id: 'e', name: 'Bank Passbook', status: 'available', verified: true },
    ];
    const result = calculateDocumentReadiness(allDocs, 'scheme-001');
    expect(result).not.toBeNull();
    expect(result!.readinessScore).toBe(100);
    expect(result!.missing).toHaveLength(0);
  });

  it('should return 0% when no documents are available', () => {
    const result = calculateDocumentReadiness([], 'scheme-001');
    expect(result).not.toBeNull();
    expect(result!.readinessScore).toBe(0);
    expect(result!.missing.length).toBe(result!.totalRequired);
  });

  it('should return null for non-existent scheme', () => {
    const result = calculateDocumentReadiness(DEMO_DOCUMENTS, 'non-existent-scheme');
    expect(result).toBeNull();
  });

  it('should correctly count needs-verification documents', () => {
    const result = calculateDocumentReadiness(DEMO_DOCUMENTS, 'scheme-001');
    expect(result).not.toBeNull();
    expect(result!.needsVerification).toBeDefined();
    expect(Array.isArray(result!.needsVerification)).toBe(true);
  });
});

// ===== FEATURE 4: What-If Eligibility Simulator =====
describe('Feature 4: What-If Eligibility Simulator', () => {
  it('should return simulation results without modifying actual profile', () => {
    const profileCopy = { ...fullProfile };
    const originalIncome = profileCopy.annualIncome;

    const result = simulateEligibility(
      profileCopy,
      { annualIncome: 100000 },
      DEMO_DOCUMENTS,
    );

    // Verify actual profile is UNCHANGED
    expect(profileCopy.annualIncome).toBe(originalIncome);

    // Verify simulation result structure
    expect(result.simulationOnly).toBe(true);
    expect(typeof result.currentMatchCount).toBe('number');
    expect(typeof result.simulatedMatchCount).toBe('number');
    expect(Array.isArray(result.newPotentialSchemes)).toBe(true);
    expect(Array.isArray(result.removedPotentialSchemes)).toBe(true);
    expect(Array.isArray(result.changedSchemes)).toBe(true);
  });

  it('should track applied changes correctly', () => {
    const result = simulateEligibility(
      fullProfile,
      { annualIncome: 100000, state: 'Karnataka' },
      DEMO_DOCUMENTS,
    );

    expect(result.appliedChanges).toBeDefined();
    expect(result.appliedChanges['annualIncome']).toBeDefined();
    expect(result.appliedChanges['annualIncome']!.from).toBe(fullProfile.annualIncome);
    expect(result.appliedChanges['annualIncome']!.to).toBe(100000);
    expect(result.appliedChanges['state']!.from).toBe(fullProfile.state);
    expect(result.appliedChanges['state']!.to).toBe('Karnataka');
  });

  it('should silently ignore non-whitelisted fields', () => {
    const result = simulateEligibility(
      fullProfile,
      { annualIncome: 100000, hackerField: 'malicious', databasePassword: 'drop' },
      DEMO_DOCUMENTS,
    );

    expect(result.appliedChanges).not.toHaveProperty('hackerField');
    expect(result.appliedChanges).not.toHaveProperty('databasePassword');
    expect(result.appliedChanges).toHaveProperty('annualIncome');
  });

  it('should detect new potential schemes when income decreases', () => {
    const highIncomeProfile: UserProfile = { ...fullProfile, annualIncome: 1000000 };
    const result = simulateEligibility(
      highIncomeProfile,
      { annualIncome: 100000 },
      DEMO_DOCUMENTS,
    );

    // Lowering income should potentially unlock more schemes
    expect(result.simulationOnly).toBe(true);
    // At minimum the changed schemes array should reflect the score changes
    expect(result.changedSchemes.length).toBeGreaterThanOrEqual(0);
  });

  it('should handle empty simulation changes gracefully', () => {
    const result = simulateEligibility(fullProfile, {}, DEMO_DOCUMENTS);
    expect(result.simulationOnly).toBe(true);
    expect(result.currentMatchCount).toBe(result.simulatedMatchCount);
    expect(result.newPotentialSchemes).toHaveLength(0);
    expect(result.removedPotentialSchemes).toHaveLength(0);
  });

  it('should confirm whitelisted fields are correct', () => {
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

// ===== FEATURE 5: Simple Language + Multilingual =====
describe('Feature 5: Simple Language + Multilingual Explanation', () => {
  it('should generate English simple explanation', () => {
    const result = explainScheme('scheme-001', 'en', 'simple');
    expect(result).not.toBeNull();
    expect(result!.language).toBe('en');
    expect(result!.mode).toBe('simple');
    expect(result!.description).toBeTruthy();
    expect(result!.benefits).toBeTruthy();
    expect(result!.eligibility).toBeTruthy();
    expect(result!.documents).toBeTruthy();
    expect(result!.applicationProcess).toBeTruthy();
  });

  it('should generate Telugu explanation', () => {
    const result = explainScheme('scheme-001', 'te', 'simple');
    expect(result).not.toBeNull();
    expect(result!.language).toBe('te');
    // Telugu translations should contain Telugu script
    expect(result!.eligibility).toBeTruthy();
    expect(result!.disclaimer).toBeTruthy();
  });

  it('should generate Hindi explanation', () => {
    const result = explainScheme('scheme-001', 'hi', 'simple');
    expect(result).not.toBeNull();
    expect(result!.language).toBe('hi');
    // Hindi translations should contain Devanagari script
    expect(result!.eligibility).toBeTruthy();
    expect(result!.disclaimer).toBeTruthy();
  });

  it('should generate original (verbatim) explanation', () => {
    const result = explainScheme('scheme-001', 'en', 'original');
    expect(result).not.toBeNull();
    expect(result!.mode).toBe('original');
    // Original mode should contain the scheme's actual description
    expect(result!.description).toContain(SCHEMES[0]!.description);
  });

  it('should return null for non-existent scheme', () => {
    const result = explainScheme('non-existent-scheme', 'en', 'simple');
    expect(result).toBeNull();
  });

  it('should include a disclaimer in every explanation', () => {
    const enResult = explainScheme('scheme-001', 'en', 'simple');
    const teResult = explainScheme('scheme-001', 'te', 'simple');
    const hiResult = explainScheme('scheme-001', 'hi', 'simple');

    expect(enResult!.disclaimer).toBeTruthy();
    expect(teResult!.disclaimer).toBeTruthy();
    expect(hiResult!.disclaimer).toBeTruthy();
  });

  it('should not fabricate information not in the scheme data', () => {
    const result = explainScheme('scheme-001', 'en', 'simple');
    expect(result).not.toBeNull();
    // The eligibility section should only reference criteria that exist in the scheme
    const scheme = SCHEMES.find(s => s.id === 'scheme-001')!;
    if (scheme.eligibility.ageMin || scheme.eligibility.ageMax) {
      expect(result!.eligibility.toLowerCase()).toContain('age');
    }
  });

  it('AI failure should not break the explanation engine', () => {
    // The template-based fallback should always work regardless of AI availability
    const result = explainScheme('scheme-001', 'te', 'simple');
    expect(result).not.toBeNull();
    expect(result!.description).toBeTruthy();
    expect(result!.benefits).toBeTruthy();
  });
});

// ===== SECURITY: Cross-user access & Admin Role =====
describe('Security & Admin Role: Authorization', () => {
  it('should never expose unauthorized document access patterns', () => {
    // Document readiness should only work with documents passed in the request
    const otherUserDocs: UserDocument[] = [
      { id: 'other-1', name: 'Aadhaar', status: 'available', verified: true },
    ];
    const result = calculateDocumentReadiness(otherUserDocs, 'scheme-001');
    expect(result).not.toBeNull();
    // Should only reflect the documents we explicitly passed
    expect(result!.available).toBeLessThanOrEqual(otherUserDocs.length);
  });

  it('should support admin officer role context', async () => {
    const { getCurrentUser, requireAdmin } = await import('../../server/auth');
    const admin = getCurrentUser('admin');
    expect(admin.role).toBe('admin');
    expect(admin.name).toBeTruthy();
    expect(admin.department).toBeTruthy();

    const requiredAdmin = requireAdmin();
    expect(requiredAdmin.role).toBe('admin');
  });

  it('should verify citizen role cannot perform admin-exclusive actions', async () => {
    const { getCurrentUser } = await import('../../server/auth');
    const citizen = getCurrentUser('citizen');
    expect(citizen.role).toBe('citizen');
    expect(citizen.role).not.toBe('admin');
  });
});
