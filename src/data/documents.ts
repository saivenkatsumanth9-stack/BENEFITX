import type { UserDocument } from "@/lib/types";

/** Catalog of document types referenced by the mock scheme data. */
export const DOCUMENT_CATALOG = [
  "Aadhaar",
  "Photograph",
  "Bank Passbook",
  "Education Certificate",
  "Income Certificate",
  "Caste Certificate",
  "Ration Card",
  "Land Records",
  "Disability Certificate",
  "Job Card",
  "Birth Certificate",
  "Age Proof",
  "MCP Card",
  "Property Documents",
  "Electricity Bill",
  "Business Plan",
  "Incorporation Certificate",
  "Loan Sanction Letter",
  "Admission Letter",
  "Passport",
] as const;

/** Documents shown when the demo profile is loaded. */
export const DEMO_DOCUMENTS: UserDocument[] = [
  {
    id: "doc-aadhaar",
    name: "Aadhaar",
    status: "available",
    fileName: "aadhaar.pdf",
    uploadedAt: "2026-07-04",
    verified: true,
  },
  {
    id: "doc-education",
    name: "Education Certificate",
    status: "needs-verification",
    fileName: "degree-marksheet.pdf",
    uploadedAt: "2026-08-01",
    verified: false,
  },
  {
    id: "doc-photo",
    name: "Photograph",
    status: "available",
    fileName: "passport-photo.jpg",
    uploadedAt: "2026-07-04",
    verified: true,
  },
  {
    id: "doc-bank",
    name: "Bank Passbook",
    status: "available",
    fileName: "passbook.pdf",
    uploadedAt: "2026-07-10",
    verified: true,
  },
  {
    id: "doc-income",
    name: "Income Certificate",
    status: "missing",
    expiresAt: "2026-12-31",
    verified: false,
  },
  {
    id: "doc-caste",
    name: "Caste Certificate",
    status: "missing",
    verified: false,
  },
];
