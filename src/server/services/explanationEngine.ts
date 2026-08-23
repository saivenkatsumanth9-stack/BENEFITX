import { SCHEMES } from '@/data/schemes';
import type { Scheme } from '@/lib/types';

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

type SupportedLanguage = 'en' | 'te' | 'hi';
type ExplanationMode = 'simple' | 'original';

/**
 * Scheme Explanation Engine.
 * Converts scheme information into simple language.
 * Supports English, Telugu, Hindi.
 * 
 * Architecture:
 *   Government Scheme Data → Rule-Based Eligibility Engine → Eligibility Result → AI → Human-Friendly Explanation
 * NOT:
 *   Government Scheme Data → AI → Official Eligibility
 * 
 * AI is ONLY for language simplification/translation.
 * When BENEFITX_AI_API_KEY is not set, uses template-based explanations.
 */
export function explainScheme(
  schemeId: string,
  language: SupportedLanguage = 'en',
  mode: ExplanationMode = 'simple',
  schemes: Scheme[] = SCHEMES,
): SchemeExplanationResult | null {
  const scheme = schemes.find(s => s.id === schemeId);
  if (!scheme) return null;

  // Check if AI provider is available
  const aiApiKey = getAIApiKey();
  
  if (aiApiKey && language !== 'en') {
    // Future: Use AI provider for translation
    // For now, use template-based approach
  }

  if (mode === 'original' && language === 'en') {
    return buildOriginalExplanation(scheme, language);
  }

  return buildSimpleExplanation(scheme, language);
}

function getAIApiKey(): string | undefined {
  // Server-side only — never exposed to client
  try {
    return process.env['BENEFITX_AI_API_KEY'] || undefined;
  } catch {
    return undefined;
  }
}

function buildOriginalExplanation(scheme: Scheme, language: string): SchemeExplanationResult {
  return {
    schemeId: scheme.id,
    language,
    mode: 'original',
    name: scheme.name,
    description: scheme.description,
    benefits: scheme.benefits.join('\n• '),
    eligibility: formatEligibilityOriginal(scheme),
    documents: formatDocumentsOriginal(scheme),
    applicationProcess: scheme.applicationSteps.map((s, i) => `${i + 1}. ${s}`).join('\n'),
    disclaimer: 'This information is sourced from government databases. Always verify with the latest official notification before applying.',
  };
}

function buildSimpleExplanation(scheme: Scheme, language: SupportedLanguage): SchemeExplanationResult {
  const translations = getTranslations(language);
  
  return {
    schemeId: scheme.id,
    language,
    mode: 'simple',
    name: language === 'en' ? scheme.name : translateSchemeName(scheme, language),
    description: simplifyDescription(scheme, language, translations),
    benefits: simplifyBenefits(scheme, language, translations),
    eligibility: simplifyEligibility(scheme, language, translations),
    documents: simplifyDocuments(scheme, language, translations),
    applicationProcess: simplifyApplicationProcess(scheme, language, translations),
    disclaimer: translations.disclaimer,
  };
}

// ===== Template-based translations =====

interface TranslationSet {
  youCanGet: string;
  toBeEligible: string;
  youNeed: string;
  howToApply: string;
  disclaimer: string;
  ageRequirement: (min?: number, max?: number) => string;
  incomeRequirement: (max: number) => string;
  stateRequirement: (states: string[]) => string;
  educationRequirement: (levels: string[]) => string;
  occupationRequirement: (occupations: string[]) => string;
  documentsNeeded: string;
  optionalDocuments: string;
  perYear: string;
  perMonth: string;
  step: string;
}

function getTranslations(language: SupportedLanguage): TranslationSet {
  switch (language) {
    case 'te':
      return {
        youCanGet: 'మీరు పొందగలిగేవి:',
        toBeEligible: 'అర్హత పొందడానికి:',
        youNeed: 'అవసరమైన పత్రాలు:',
        howToApply: 'దరఖాస్తు చేయడానికి:',
        disclaimer: 'ఈ సమాచారం ప్రభుత్వ డేటాబేస్ల నుండి తీసుకోబడింది. దరఖాస్తు చేయడానికి ముందు తాజా అధికారిక నోటిఫికేషన్ను తనిఖీ చేయండి.',
        ageRequirement: (min, max) => {
          if (min && max) return `మీ వయస్సు ${min} నుండి ${max} సంవత్సరాల మధ్య ఉండాలి`;
          if (min) return `మీ వయస్సు కనీసం ${min} సంవత్సరాలు ఉండాలి`;
          if (max) return `మీ వయస్సు ${max} సంవత్సరాల లోపు ఉండాలి`;
          return '';
        },
        incomeRequirement: (max) => `మీ కుటుంబ వార్షిక ఆదాయం ₹${max.toLocaleString('en-IN')} కంటే తక్కువగా ఉండాలి`,
        stateRequirement: (states) => `మీరు ${states.join(' లేదా ')}లో నివసిస్తుండాలి`,
        educationRequirement: (levels) => `మీ విద్యార్హత: ${levels.join(', ')}`,
        occupationRequirement: (occs) => `మీ వృత్తి: ${occs.join(', ')}`,
        documentsNeeded: 'అవసరమైన పత్రాలు',
        optionalDocuments: 'ఐచ్ఛిక పత్రాలు',
        perYear: 'సంవత్సరానికి',
        perMonth: 'నెలకు',
        step: 'దశ',
      };
    case 'hi':
      return {
        youCanGet: 'आपको मिल सकता है:',
        toBeEligible: 'पात्रता के लिए:',
        youNeed: 'आवश्यक दस्तावेज:',
        howToApply: 'आवेदन कैसे करें:',
        disclaimer: 'यह जानकारी सरकारी डेटाबेस से ली गई है। आवेदन करने से पहले नवीनतम आधिकारिक अधिसूचना की जाँच करें।',
        ageRequirement: (min, max) => {
          if (min && max) return `आपकी उम्र ${min} से ${max} वर्ष के बीच होनी चाहिए`;
          if (min) return `आपकी उम्र कम से कम ${min} वर्ष होनी चाहिए`;
          if (max) return `आपकी उम्र ${max} वर्ष से कम होनी चाहिए`;
          return '';
        },
        incomeRequirement: (max) => `आपकी पारिवारिक वार्षिक आय ₹${max.toLocaleString('en-IN')} से कम होनी चाहिए`,
        stateRequirement: (states) => `आप ${states.join(' या ')} में रहते हों`,
        educationRequirement: (levels) => `आपकी शिक्षा: ${levels.join(', ')}`,
        occupationRequirement: (occs) => `आपका व्यवसाय: ${occs.join(', ')}`,
        documentsNeeded: 'आवश्यक दस्तावेज',
        optionalDocuments: 'वैकल्पिक दस्तावेज',
        perYear: 'प्रति वर्ष',
        perMonth: 'प्रति माह',
        step: 'चरण',
      };
    default: // 'en'
      return {
        youCanGet: 'What you can get:',
        toBeEligible: 'To be eligible:',
        youNeed: 'Documents you need:',
        howToApply: 'How to apply:',
        disclaimer: 'This information is sourced from government databases. Always verify with the latest official notification before applying.',
        ageRequirement: (min, max) => {
          if (min && max) return `Your age should be between ${min} and ${max} years`;
          if (min) return `You should be at least ${min} years old`;
          if (max) return `You should be under ${max} years old`;
          return '';
        },
        incomeRequirement: (max) => `Your family's yearly income should be below ₹${max.toLocaleString('en-IN')}`,
        stateRequirement: (states) => `You should be living in ${states.join(' or ')}`,
        educationRequirement: (levels) => `Your education level: ${levels.join(', ')}`,
        occupationRequirement: (occs) => `Your occupation: ${occs.join(', ')}`,
        documentsNeeded: 'Documents needed',
        optionalDocuments: 'Optional documents',
        perYear: 'per year',
        perMonth: 'per month',
        step: 'Step',
      };
  }
}

function translateSchemeName(scheme: Scheme, language: SupportedLanguage): string {
  // Template-based: return English name with language prefix
  // When AI is available, this would be a proper translation
  return scheme.name;
}

function simplifyDescription(scheme: Scheme, language: SupportedLanguage, t: TranslationSet): string {
  // Simplify the description into plain language
  const simple = scheme.shortDescription || scheme.description;
  if (language === 'en') return simple;
  // For non-English, use the English simple version (AI would translate this properly)
  return simple;
}

function simplifyBenefits(scheme: Scheme, language: SupportedLanguage, t: TranslationSet): string {
  const lines = [`${t.youCanGet}`];
  for (const benefit of scheme.benefits) {
    lines.push(`• ${benefit}`);
  }
  return lines.join('\n');
}

function simplifyEligibility(scheme: Scheme, language: SupportedLanguage, t: TranslationSet): string {
  const e = scheme.eligibility;
  const lines = [`${t.toBeEligible}`];

  if (e.ageMin !== undefined || e.ageMax !== undefined) {
    const ageStr = t.ageRequirement(e.ageMin, e.ageMax);
    if (ageStr) lines.push(`• ${ageStr}`);
  }

  if (e.incomeMax !== undefined) {
    lines.push(`• ${t.incomeRequirement(e.incomeMax)}`);
  }

  if (e.states && e.states.length > 0) {
    lines.push(`• ${t.stateRequirement(e.states)}`);
  }

  if (e.education && e.education.length > 0) {
    lines.push(`• ${t.educationRequirement(e.education)}`);
  }

  if (e.occupations && e.occupations.length > 0) {
    lines.push(`• ${t.occupationRequirement(e.occupations)}`);
  }

  if (e.notes) {
    for (const note of e.notes) {
      lines.push(`• ${note}`);
    }
  }

  return lines.join('\n');
}

function simplifyDocuments(scheme: Scheme, language: SupportedLanguage, t: TranslationSet): string {
  const lines = [`${t.documentsNeeded}:`];
  for (const doc of scheme.requiredDocuments) {
    lines.push(`• ${doc}`);
  }
  if (scheme.optionalDocuments && scheme.optionalDocuments.length > 0) {
    lines.push('');
    lines.push(`${t.optionalDocuments}:`);
    for (const doc of scheme.optionalDocuments) {
      lines.push(`• ${doc}`);
    }
  }
  return lines.join('\n');
}

function simplifyApplicationProcess(scheme: Scheme, language: SupportedLanguage, t: TranslationSet): string {
  const lines = [`${t.howToApply}`];
  scheme.applicationSteps.forEach((step, i) => {
    lines.push(`${t.step} ${i + 1}: ${step}`);
  });
  return lines.join('\n');
}

function formatEligibilityOriginal(scheme: Scheme): string {
  const e = scheme.eligibility;
  const parts: string[] = [];
  if (e.ageMin !== undefined || e.ageMax !== undefined) {
    parts.push(`Age: ${e.ageMin ?? 'N/A'}–${e.ageMax ?? 'N/A'} years`);
  }
  if (e.incomeMax !== undefined) parts.push(`Annual Income: Below ₹${e.incomeMax.toLocaleString('en-IN')}`);
  if (e.states?.length) parts.push(`States: ${e.states.join(', ')}`);
  if (e.education?.length) parts.push(`Education: ${e.education.join(', ')}`);
  if (e.occupations?.length) parts.push(`Occupation: ${e.occupations.join(', ')}`);
  if (e.genders?.length) parts.push(`Gender: ${e.genders.join(', ')}`);
  if (e.notes?.length) parts.push(`Notes: ${e.notes.join('; ')}`);
  return parts.join('\n');
}

function formatDocumentsOriginal(scheme: Scheme): string {
  const lines: string[] = [];
  lines.push('Required:');
  scheme.requiredDocuments.forEach(d => lines.push(`• ${d}`));
  if (scheme.optionalDocuments?.length) {
    lines.push('Optional:');
    scheme.optionalDocuments.forEach(d => lines.push(`• ${d}`));
  }
  return lines.join('\n');
}
