/**
 * Admin portal mock data and verification queue items.
 */
export interface VerificationQueueItem {
  id: string;
  citizenName: string;
  citizenId: string;
  state: string;
  schemeName: string;
  documentType: string;
  fileName: string;
  submittedAt: string;
  status: "PENDING_REVIEW" | "FLAGGED_MISMATCH" | "VERIFIED" | "REJECTED";
  ocrMatchConfidence: number;
  declaredIncome: string;
  extractedIncome: string;
}

export const MOCK_VERIFICATION_QUEUE: VerificationQueueItem[] = [
  {
    id: "ver-001",
    citizenName: "Priya Sharma",
    citizenId: "cit-8821",
    state: "Maharashtra",
    schemeName: "Post-Matric Scholarship for SC/ST Students",
    documentType: "Income Certificate",
    fileName: "income_cert_2026.pdf",
    submittedAt: "2026-08-21T10:30:00Z",
    status: "PENDING_REVIEW",
    ocrMatchConfidence: 94,
    declaredIncome: "₹1,80,000 / yr",
    extractedIncome: "₹1,80,000",
  },
  {
    id: "ver-002",
    citizenName: "Ramesh Patel",
    citizenId: "cit-4492",
    state: "Gujarat",
    schemeName: "Pradhan Mantri Awas Yojana (Gramin)",
    documentType: "Land Records / BPL Card",
    fileName: "patel_bpl_card.pdf",
    submittedAt: "2026-08-22T08:15:00Z",
    status: "PENDING_REVIEW",
    ocrMatchConfidence: 88,
    declaredIncome: "₹95,000 / yr",
    extractedIncome: "₹95,000",
  },
  {
    id: "ver-003",
    citizenName: "Ananya Mukhopadhyay",
    citizenId: "cit-1204",
    state: "West Bengal",
    schemeName: "Higher Education Loan Subsidy Scheme",
    documentType: "Admission Offer Letter",
    fileName: "university_admission.pdf",
    submittedAt: "2026-08-22T14:45:00Z",
    status: "PENDING_REVIEW",
    ocrMatchConfidence: 97,
    declaredIncome: "₹3,50,000 / yr",
    extractedIncome: "₹3,50,000",
  },
  {
    id: "ver-004",
    citizenName: "Venkat Raman",
    citizenId: "cit-9031",
    state: "Tamil Nadu",
    schemeName: "PM Kisan Samman Nidhi",
    documentType: "Land Records / Patta",
    fileName: "patta_document_vr.pdf",
    submittedAt: "2026-08-23T00:10:00Z",
    status: "FLAGGED_MISMATCH",
    ocrMatchConfidence: 61,
    declaredIncome: "₹1,20,000 / yr",
    extractedIncome: "₹2,40,000",
  },
];
