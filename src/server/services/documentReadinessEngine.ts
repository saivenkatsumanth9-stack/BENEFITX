import { SCHEMES } from '@/data/schemes';
import type { UserDocument, Scheme } from '@/lib/types';

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

/**
 * Calculate document readiness for a specific scheme.
 * Formula: readinessScore = (available required documents / total required documents) × 100
 * Optional documents do NOT reduce readiness score.
 */
export function calculateDocumentReadiness(
  documents: UserDocument[],
  schemeId: string,
  schemes: Scheme[] = SCHEMES,
): DocumentReadinessResult | null {
  const scheme = schemes.find(s => s.id === schemeId);
  if (!scheme) return null;

  const required = scheme.requiredDocuments;
  const optional = scheme.optionalDocuments ?? [];

  // Classify required documents
  const availableDocuments: string[] = [];
  const missing: string[] = [];
  const needsVerification: string[] = [];

  for (const docName of required) {
    const userDoc = documents.find(d => d.name === docName);
    if (!userDoc || userDoc.status === 'missing') {
      missing.push(docName);
    } else if (userDoc.status === 'needs-verification') {
      needsVerification.push(docName);
      // Count needs-verification as partially available (not missing)
      availableDocuments.push(docName);
    } else if (userDoc.status === 'available') {
      availableDocuments.push(docName);
    }
  }

  // Classify optional documents (informational only)
  const optionalAvailable = optional.filter(docName => {
    const userDoc = documents.find(d => d.name === docName);
    return userDoc && userDoc.status !== 'missing';
  });

  // Formula: available required / total required × 100
  const totalRequired = required.length;
  const available = availableDocuments.length;
  const readinessScore = totalRequired === 0 ? 100 : Math.round((available / totalRequired) * 100);

  return {
    schemeId: scheme.id,
    schemeName: scheme.name,
    readinessScore,
    totalRequired,
    available,
    missing,
    availableDocuments,
    needsVerification,
    optionalDocuments: optional,
    optionalAvailable,
  };
}
