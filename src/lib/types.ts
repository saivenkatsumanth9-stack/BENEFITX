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
  status: "match" | "partial" | "verify" | "mismatch" | "unknown";
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

export type DocumentStatus = "available" | "missing" | "needs-verification" | "expired";

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

// ===== Dynamic Profile Match Scoring Types =====

/** Per-criterion score breakdown */
export interface ScoreBreakdownItem {
  label: string;
  weight: number;
  status: "MATCHED" | "PARTIAL" | "FAILED" | "UNKNOWN" | "VERIFY";
  points: number;
  maxPoints: number;
  yourValue: string;
  required: string;
}

/** Data confidence levels */
export type DataConfidence = "HIGH" | "MEDIUM" | "LOW";

/** Match classification labels */
export type MatchLabel =
  | "EXCELLENT_MATCH"
  | "STRONG_MATCH"
  | "POTENTIAL_MATCH"
  | "LOW_MATCH"
  | "WEAK_MATCH";

/** Complete profile match result with dynamic scoring */
export interface ProfileMatchResult {
  score: number;
  label: MatchLabel;
  dataConfidence: DataConfidence;
  breakdown: ScoreBreakdownItem[];
  criteriaEvaluated: number;
  criteriaMatched: number;
  criteriaPartial: number;
  criteriaFailed: number;
  criteriaUnknown: number;
}

// ===== Feature 2 Enhanced: Explainable Eligibility (with PARTIALLY_MATCHED) =====

export interface EnhancedEligibilityResult {
  schemeId: string;
  schemeName: string;
  status: "MATCHED" | "PARTIALLY_MATCHED" | "FAILED" | "UNKNOWN";
  matchedConditions: string[];
  partialConditions: string[];
  failedConditions: string[];
  missingInformation: string[];
  scoreBreakdown: ScoreBreakdownItem[];
  overallNote: string;
}

// ===== Feature 3 Enhanced: Document Readiness (with expired handling) =====

export interface EnhancedDocumentReadinessResult {
  schemeId: string;
  schemeName: string;
  readinessScore: number;
  totalRequired: number;
  available: number;
  missing: string[];
  expired: string[];
  availableDocuments: string[];
  needsVerification: string[];
  optionalDocuments: string[];
  optionalAvailable: string[];
}

// ===== Feature 4 Enhanced: Simulation (with categorized changes) =====

export interface EnhancedSimulationResult {
  simulationOnly: true;
  currentMatchCount: number;
  simulatedMatchCount: number;
  scoreChange: number;
  newPotentialSchemes: Array<{ schemeId: string; schemeName: string; matchScore: number }>;
  removedPotentialSchemes: Array<{ schemeId: string; schemeName: string; matchScore: number }>;
  improvedSchemes: Array<{ schemeId: string; schemeName: string; beforeScore: number; afterScore: number; change: number }>;
  reducedSchemes: Array<{ schemeId: string; schemeName: string; beforeScore: number; afterScore: number; change: number }>;
  unchangedCount: number;
  changedSchemes: Array<{
    schemeId: string;
    schemeName: string;
    beforeScore: number;
    afterScore: number;
  }>;
  appliedChanges: Record<string, { from: string | number | boolean | null; to: string | number | boolean | null }>;
}

// ===== Feature 6: Application Status + Deadline Tracker =====

export type ServerApplicationStatus =
  | "NOT_REGISTERED"
  | "REGISTERED"
  | "APPLICATION_STARTED"
  | "APPLIED"
  | "UNKNOWN";

export type DeadlineStatus =
  | "OPEN"
  | "DEADLINE_APPROACHING"
  | "CLOSING_SOON"
  | "CLOSED"
  | "NO_DEADLINE"
  | "UNKNOWN";

export interface ApplicationStatusResult {
  schemeId: string;
  schemeName: string;
  applicationStatus: ServerApplicationStatus;
  applicationReference?: string | undefined;
  registeredAt?: string | undefined;
  appliedAt?: string | undefined;
  statusNote: string;
}

export interface DeadlineResult {
  schemeId: string;
  schemeName: string;
  deadline: string | null;
  daysRemaining: number;
  deadlineStatus: DeadlineStatus;
  deadlineSource: string;
  lastUpdated: string;
}

export interface ApplicationStatusAndDeadlineResult {
  application: ApplicationStatusResult;
  deadline: DeadlineResult;
}

// ===== Feature 7: Personalized Action Plan Engine =====

export type ActionType =
  | "PROFILE_UPDATE"
  | "DOCUMENT"
  | "REGISTRATION"
  | "APPLICATION"
  | "DOCUMENT_RENEWAL"
  | "VERIFY_INFORMATION"
  | "TRACK_APPLICATION"
  | "DEADLINE_WARNING"
  | "INFORMATION";

export type ActionPlanPriority =
  | "CRITICAL"
  | "HIGH"
  | "MEDIUM"
  | "LOW"
  | "COMPLETED"
  | "BLOCKED";

export interface ActionStep {
  order: number;
  type: ActionType;
  action: string;
  reason: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  field?: string | undefined;
  documentName?: string | undefined;
}

export interface ActionPlanResult {
  schemeId: string;
  schemeName: string;
  priority: ActionPlanPriority;
  status: "ACTION_REQUIRED" | "ALL_SET" | "COMPLETED" | "BLOCKED" | "CLOSED";
  summary: string;
  steps: ActionStep[];
  totalSteps: number;
}

// ===== Feature 8: Smart Deadline Risk / Urgency Engine =====

export type UrgencyLevel =
  | "CRITICAL"
  | "HIGH"
  | "MEDIUM"
  | "LOW"
  | "NONE"
  | "CLOSED"
  | "BLOCKED";

export interface SchemeUrgencyResult {
  schemeId: string;
  schemeName: string;
  urgency: UrgencyLevel;
  daysRemaining: number;
  deadlineDate: string | null;
  deadlineStatus: DeadlineStatus;
  urgencyScore: number; // 0 - 100 Application Urgency / Deadline Risk Score
  reason: string[];
}

// ===== Feature 9: Related Scheme Discovery / Benefit Relationship Engine =====

export type SchemeRelationshipType =
  | "SIMILAR_ELIGIBILITY"
  | "SAME_TARGET_GROUP"
  | "SAME_CATEGORY"
  | "SAME_STATE"
  | "RELATED_BENEFIT"
  | "NEXT_STAGE_OPPORTUNITY"
  | "COMPLEMENTARY_SCHEME";

export interface RelatedSchemeItem {
  schemeId: string;
  schemeName: string;
  category: string;
  benefitSummary: string;
  relationshipType: SchemeRelationshipType;
  relationshipScore: number; // 0 - 100
  profileMatchScore: number | null;
  combinedScore: number; // weighted blend
  reason: string;
}

export interface RelatedSchemesResult {
  sourceScheme: {
    id: string;
    name: string;
    category: string;
  };
  relatedSchemes: RelatedSchemeItem[];
}

// ===== Unified Scheme Intelligence =====

export interface SchemeIntelligenceResult {
  scheme: { id: string; name: string; category: string; department: string };
  match: ProfileMatchResult;
  eligibility: EnhancedEligibilityResult;
  documents: EnhancedDocumentReadinessResult;
  application: ApplicationStatusResult;
  deadline: DeadlineResult;
  urgency: SchemeUrgencyResult;
  actionPlan: ActionPlanResult;
  relatedSchemes: RelatedSchemeItem[];
  action: { required: boolean; message: string };
}

