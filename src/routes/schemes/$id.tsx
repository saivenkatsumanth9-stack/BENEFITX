import { useEffect, useState } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import {
  Building2,
  MapPin,
  IndianRupee,
  FileText,
  Calendar,
  Sparkles,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Layers,
  ShieldCheck,
  Info,
} from "lucide-react";

import { AppLayout } from "@/components/layout/AppLayout";
import { useAppStore } from "@/state/app-store";
import { schemeService } from "@/services/schemeService";
import { recommendationService } from "@/services/recommendationService";
import { DEMO_PROFILE } from "@/services/profileService";
import { SCHEMES } from "@/data/schemes";
import { buildAssessment, documentReadinessScore, evaluateCriteria, profileMatchScore } from "@/lib/matching";
import type { Scheme, Recommendation } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { MatchScore } from "@/components/common/MatchScore";
import { DocumentChecklist } from "@/components/common/DocumentChecklist";
import { RecommendationExplainer } from "@/components/common/RecommendationExplainer";
import { OfficialSourceCard } from "@/components/common/OfficialSourceCard";
import { CardSkeleton } from "@/components/common/LoadingSkeleton";

export const Route = createFileRoute("/schemes/$id")({
  loader: ({ params }) => {
    const id = params.id;
    const scheme = SCHEMES.find((s) => s.id === id) || SCHEMES[0]!;
    return { id, scheme };
  },
  component: SchemeDetailPage,
});

export function getSyncRecommendation(scheme: Scheme, profile = DEMO_PROFILE, documents = []) {
  const criteria = evaluateCriteria(profile, scheme);
  const assessment = buildAssessment(profile, scheme);
  const profileMatch = profileMatchScore(criteria);
  const eligibilityMatch =
    assessment.status === "likely-eligible" ? 100 : assessment.status === "needs-verification" ? 72 : 38;
  const docReadiness = documentReadinessScore(scheme, documents);
  const matchScore = Math.max(5, Math.min(99, Math.round(profileMatch * 0.5 + eligibilityMatch * 0.35 + docReadiness * 0.15)));
  const matchedFactors = criteria.filter((c) => c.status === "match").map((c) => c.label);
  const verifyFactors = criteria.filter((c) => c.status === "verify" || c.status === "unknown").map((c) => c.label);
  const unmatchedFactors = criteria.filter((c) => c.status === "mismatch").map((c) => c.label);
  return {
    schemeId: scheme.id,
    matchScore,
    confidence: matchScore >= 80 ? "high" : matchScore >= 60 ? "medium" : "low",
    matchedFactors,
    unmatchedFactors,
    verifyFactors,
    ranking: 1,
    breakdown: { profileMatch, eligibilityMatch, documentReadiness: docReadiness },
    reason: `Your profile matches ${matchedFactors.length} of ${criteria.length} key criteria for this scheme.`,
  } as Recommendation;
}

function SchemeDetailPage() {
  const loaderData = Route.useLoaderData();
  const id = loaderData?.id || "scheme-001";
  const { profile, documents, savedIds, toggleSaved } = useAppStore();

  const activeScheme = loaderData?.scheme || SCHEMES.find((s) => s.id === id) || SCHEMES[0]!;
  const [scheme, setScheme] = useState<Scheme | null>(activeScheme);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(
    activeScheme ? getSyncRecommendation(activeScheme, profile || DEMO_PROFILE, documents as never) : null
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const found = SCHEMES.find((s) => s.id === id) || SCHEMES[0]!;
    setScheme(found);
    if (found) {
      setRecommendation(getSyncRecommendation(found, profile || DEMO_PROFILE, documents as never));
    }
  }, [id, profile, documents]);

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6 max-w-5xl mx-auto">
          <CardSkeleton className="h-64" />
          <CardSkeleton className="h-96" />
        </div>
      </AppLayout>
    );
  }

  if (!scheme) {
    return (
      <AppLayout>
        <div className="surface-card p-12 text-center space-y-4 max-w-lg mx-auto mt-12">
          <h2 className="text-xl font-bold text-foreground">Scheme Not Found</h2>
          <p className="text-sm text-muted-foreground">
            The scheme identifier &ldquo;{id}&rdquo; does not match any current government records.
          </p>
          <Button asChild>
            <Link to="/schemes">Browse All Schemes</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  const isSaved = savedIds.includes(scheme.id);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <Link to="/schemes" className="hover:text-foreground">
            Schemes Catalog
          </Link>
          <ChevronRight className="size-3.5" />
          <span className="text-teal font-bold">{scheme.category}</span>
          <ChevronRight className="size-3.5" />
          <span className="text-foreground truncate max-w-xs">{scheme.name}</span>
        </nav>

        {/* Hero Scheme Card */}
        <div className="surface-card p-6 sm:p-8 space-y-6 shadow-sm">
          {/* Header Badges & Action */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                <span className="rounded-full bg-teal-soft px-3 py-1 text-teal">{scheme.category}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-muted-foreground">
                  <Building2 className="size-3.5" />
                  {scheme.governmentLevel} Government
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-muted-foreground">
                  <MapPin className="size-3.5" />
                  {scheme.state}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                {scheme.name}
              </h1>
              <p className="text-xs font-semibold text-muted-foreground">
                Administered by {scheme.department}
              </p>
            </div>

            {/* Save Button */}
            <Button
              variant={isSaved ? "secondary" : "outline"}
              onClick={() => toggleSaved(scheme.id, scheme.name)}
              className="rounded-xl gap-1.5 text-xs font-bold h-10 px-4"
            >
              {isSaved ? (
                <>
                  <BookmarkCheck className="size-4 text-primary" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <Bookmark className="size-4 text-muted-foreground" />
                  <span>Save Scheme</span>
                </>
              )}
            </Button>
          </div>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {scheme.description}
          </p>

          {/* Quick Metrics Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-border">
            <div className="rounded-xl bg-muted/40 p-3 space-y-0.5">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Benefit Value
              </span>
              <p className="text-sm font-extrabold text-saffron-foreground">{scheme.benefitSummary}</p>
            </div>

            <div className="rounded-xl bg-muted/40 p-3 space-y-0.5">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Your Match Score
              </span>
              <div className="pt-0.5">
                {recommendation ? (
                  <MatchScore score={recommendation.matchScore} confidence={recommendation.confidence} size="sm" />
                ) : (
                  <span className="text-xs font-bold text-foreground">Evaluating...</span>
                )}
              </div>
            </div>

            <div className="rounded-xl bg-muted/40 p-3 space-y-0.5">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Required Documents
              </span>
              <p className="text-sm font-extrabold text-foreground">{scheme.requiredDocuments.length} Documents</p>
            </div>

            <div className="rounded-xl bg-muted/40 p-3 space-y-0.5">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Last Verified
              </span>
              <p className="text-sm font-extrabold text-foreground">{scheme.lastUpdated}</p>
            </div>
          </div>
        </div>

        {/* 2-Column Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (8 cols): Benefits, Steps, Eligibility Overview */}
          <div className="lg:col-span-8 space-y-8">
            {/* 1. Benefits Section */}
            <div className="surface-card p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-2">
                <IndianRupee className="size-5 text-saffron" />
                <h2 className="text-lg font-bold text-foreground">Scheme Benefits & Assistance</h2>
              </div>
              <ul className="space-y-2.5">
                {scheme.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-foreground">
                    <CheckCircle2 className="size-4 text-success shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 2. AI Recommendation Explanation Panel */}
            {recommendation && (
              <RecommendationExplainer recommendation={recommendation} />
            )}

            {/* 3. Application Process Steps */}
            <div className="surface-card p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-2">
                <Layers className="size-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">Step-by-Step Application Process</h2>
              </div>
              <ol className="space-y-3">
                {scheme.applicationSteps.map((step, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 text-sm text-foreground bg-muted/30 p-3 rounded-xl border border-border"
                  >
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-extrabold text-xs">
                      {idx + 1}
                    </span>
                    <span className="pt-0.5 leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* 4. Document Checklist Component */}
            <DocumentChecklist scheme={scheme} documents={documents} />
          </div>

          {/* Right Column (4 cols): Official Source, Eligibility Trigger, Dates */}
          <div className="lg:col-span-4 space-y-6">
            {/* Official Source Card */}
            <OfficialSourceCard scheme={scheme} />

            {/* Check Detailed Eligibility Callout */}
            <div className="surface-card p-5 space-y-3 border-teal/30 bg-teal-soft/20">
              <div className="flex items-center gap-2 font-bold text-teal text-sm">
                <Sparkles className="size-4" />
                <span>Eligibility Assessment</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Compare your exact profile values (age, income, education, occupation) against each criterion rule.
              </p>
              <Button asChild className="w-full rounded-xl text-xs font-bold" variant="outline">
                <Link to="/eligibility/$id" params={{ id: scheme.id }}>
                  <span>View Criterion Comparison</span>
                  <ArrowRight className="size-3.5 ml-1" />
                </Link>
              </Button>
            </div>

            {/* Important Dates Box */}
            <div className="surface-card p-5 space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                <Calendar className="size-4 text-primary" />
                <span>Important Timeline</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Notification Date:</span>
                  <span className="font-semibold text-foreground">{scheme.lastUpdated}</span>
                </div>
                {scheme.deadline ? (
                  <div className="flex justify-between text-warning-foreground font-bold">
                    <span>Application Deadline:</span>
                    <span>{scheme.deadline}</span>
                  </div>
                ) : (
                  <div className="flex justify-between text-success font-semibold">
                    <span>Status:</span>
                    <span>Open Throughout Financial Year</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
