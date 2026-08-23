/**
 * BENEFITX domain types.
 * These types are the contract between the UI and the service layer
 * (src/services/*). A future FastAPI/ML backend should return the same shapes.
 */

export type GovernmentLevel = "Central" | "State";

export type SchemeCategory =
  | "Education"
  | "Agriculture"
  | "Health"
  | "Employment"
  | "Housing"
  | "Women & Child"
  | "Entrepreneurship"
  | "Social Security";

export type AreaType = "Rural" | "Urban";

export type EducationLevel =
  | "Below 10th"
  | "10th Pass"
  | "12th Pass"
  | "Undergraduate"
  | "Graduate"
  | "Postgraduate";

export type Occupation =
  | "Student"
  | "Farmer"
  | "Salaried"
  | "Self-employed"
  | "Daily wage worker"
  | "Unemployed"
  | "Homemaker"
  | "Retired";

export type EmploymentStatus = "Employed" | "Unemployed" | "Student" | "Self-employed" | "Retired";

export type Gender = "Female" | "Male" | "Other" | "Prefer not to say";

export interface UserProfile {
  name: string;
  age: number | null;
  gender: Gender | "";
  state: string;
  district: string;
  areaType: AreaType | "";
  occupation: Occupation | "";
  educationLevel: EducationLevel | "";
  course: string;
  isStudent: boolean;
  annualIncome: number | null;
  employmentStatus: EmploymentStatus | "";
  isFarmer: boolean;
  landHoldingAcres: number | null;
  hasDisability: boolean;
  isSeniorCitizen: boolean;
  updatedAt: string;
}

export interface SchemeEligibility {
  ageMin?: number;
  ageMax?: number;
  incomeMax?: number;
  states?: string[]; // empty/undefined = all states
  areaTypes?: AreaType[];
  education?: EducationLevel[];
  occupations?: Occupation[];
  genders?: Gender[];
  farmerRequired?: boolean;
  notes?: string[];
}

export interface Scheme {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  category: SchemeCategory;
  governmentLevel: GovernmentLevel;
  state: string; // "All India" for central schemes
  department: string;
  benefits: string[];
  benefitSummary: string;
  benefitValue: number; // approximate annual value in INR, for sorting
  eligibility: SchemeEligibility;
  requiredDocuments: string[];
  optionalDocuments?: string[];
  applicationSteps: string[];
  officialUrl: string;
  sourceName: string;
  lastUpdated: string;
  deadline?: string;
  tags: string[];
}

export type ConfidenceLevel = "high" | "medium" | "low";

export interface MatchFactor {
  label: string;
  required: string;
  yourValue: string;
  status: "match" | "verify" | "mismatch" | "unknown";
  weight: number;
}

export interface Recommendation {
  schemeId: string;
  matchScore: number;
  confidence: ConfidenceLevel;
  matchedFactors: string[];
  unmatchedFactors: string[];
  verifyFactors: string[];
  ranking: number;
  breakdown: {
    profileMatch: number;
    eligibilityMatch: number;
    documentReadiness: number;
  };
  reason: string;
  missed?: boolean;
}

export type EligibilityStatus = "likely-eligible" | "needs-verification" | "likely-not-eligible";

export interface EligibilityAssessment {
  schemeId: string;
  status: EligibilityStatus;
  criteria: MatchFactor[];
  matchedCount: number;
  verifyCount: number;
  mismatchCount: number;
  note: string;
}

export type DocumentStatus = "available" | "missing" | "needs-verification";

export interface UserDocument {
  id: string;
  name: string;
  status: DocumentStatus;
  fileName?: string | undefined;
  uploadedAt?: string | undefined;
  expiresAt?: string | undefined;
  verified: boolean;
}

export interface ExtractedDocumentData {
  documentType: string;
  extractedFields: Record<string, string>;
  confidence: ConfidenceLevel;
  verificationStatus: "unverified" | "pending-review";
}

export interface ChecklistItem {
  name: string;
  status: DocumentStatus;
  optional: boolean;
}

export interface ReadinessResult {
  readinessScore: number;
  eligibilityScore: number;
  documentScore: number;
  verificationScore: number;
  completedRequirements: number;
  totalRequirements: number;
  missingDocuments: string[];
  verifyDocuments: string[];
  nextActions: string[];
}

export type ApplicationStatus =
  | "Saved"
  | "Preparing"
  | "Ready to Apply"
  | "Applied"
  | "Under Review"
  | "Completed";

export interface ApplicationRecord {
  schemeId: string;
  status: ApplicationStatus;
  updatedAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: "opportunity" | "readiness" | "document" | "update";
  createdAt: string;
  read: boolean;
}

export interface SchemeFilters {
  query?: string | undefined;
  categories?: SchemeCategory[] | undefined;
  states?: string[] | undefined;
  governmentLevels?: GovernmentLevel[] | undefined;
  educationLevels?: EducationLevel[] | undefined;
  occupations?: Occupation[] | undefined;
  incomeMax?: number | undefined;
  ageGroup?: string | undefined;
}

export type SortKey = "match" | "updated" | "benefit" | "deadline" | "category";

// ===== Backend API Response Types (shared between server and client) =====

/** Standard API response wrapper */
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

/** Feature 1: Missed Scheme Detector result */
export interface MissedSchemeResult {
  schemeId: string;
  schemeName: string;
  matchScore: number;
  status: "POTENTIAL_MATCH" | "PARTIAL_MATCH" | "UNLIKELY_MATCH";
  matchedCriteria: string[];
  failedCriteria: string[];
  unknownCriteria: string[];
  reason: string;
  category: string;
  benefitSummary: string;
}

/** Feature 2: Explainable Eligibility result */
export interface ExplainableEligibilityResult {
  schemeId: string;
  schemeName: string;
  status: "MATCHED" | "FAILED" | "UNKNOWN";
  matchedConditions: string[];
  failedConditions: string[];
  missingInformation: string[];
  overallNote: string;
}

/** Feature 3: Document Readiness result */
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

/** Feature 4: What-If Simulation result */
export interface SimulationResult {
  simulationOnly: true;
  currentMatchCount: number;
  simulatedMatchCount: number;
  newPotentialSchemes: Array<{ schemeId: string; schemeName: string; matchScore: number }>;
  removedPotentialSchemes: Array<{ schemeId: string; schemeName: string; matchScore: number }>;
  changedSchemes: Array<{
    schemeId: string;
    schemeName: string;
    beforeScore: number;
    afterScore: number;
  }>;
  appliedChanges: Record<string, { from: string | number | boolean | null; to: string | number | boolean | null }>;
}

/** Feature 5: Scheme Explanation result */
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
