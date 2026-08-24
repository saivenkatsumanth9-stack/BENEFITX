import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Building2,
  MapPin,
  IndianRupee,
  FileText,
  Calendar,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Check,
  Clock,
  SendHorizontal,
  Info,
} from "lucide-react";

import { AppLayout } from "@/components/layout/AppLayout";
import { useAppStore } from "@/state/app-store";
import { DEMO_PROFILE } from "@/services/profileService";
import { SCHEMES } from "@/data/schemes";
import { buildAssessment, documentReadinessScore, evaluateCriteria, profileMatchScore } from "@/lib/matching";
import { buildActionPlan, buildSchemeUrgency, buildRelatedSchemes } from "@/lib/intelligence";
import type { Scheme, Recommendation, ActionPlanResult, SchemeUrgencyResult, RelatedSchemesResult } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { MatchScore } from "@/components/common/MatchScore";
import { StatusBadge, EligibilityBadge } from "@/components/common/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const { profile, documents, savedIds, applications, toggleSaved } = useAppStore();

  const activeScheme = loaderData?.scheme || SCHEMES.find((s) => s.id === id) || SCHEMES[0]!;
  const [scheme, setScheme] = useState<Scheme>(activeScheme);
  const [activeTab, setActiveTab] = useState<string>("overview");

  const activeProfile = profile || DEMO_PROFILE;
  const isSaved = savedIds.includes(scheme.id);
  const criteria = evaluateCriteria(activeProfile, scheme);
  const assessment = buildAssessment(activeProfile, scheme);
  const recommendation = getSyncRecommendation(scheme, activeProfile, documents as never);

  // Advanced Intelligence Engines (client-safe)
  const actionPlan: ActionPlanResult = buildActionPlan(
    scheme,
    activeProfile,
    documents,
    applications
  );

  const urgency: SchemeUrgencyResult = buildSchemeUrgency(
    scheme,
    activeProfile,
    documents,
    applications
  );

  const relatedData: RelatedSchemesResult = buildRelatedSchemes(
    scheme,
    activeProfile,
    3
  );

  useEffect(() => {
    const found = SCHEMES.find((s) => s.id === id) || SCHEMES[0]!;
    setScheme(found);
  }, [id]);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link to="/schemes" className="hover:text-foreground">
            Directory
          </Link>
          <ChevronRight className="size-3" />
          <span className="text-muted-foreground">{scheme.category}</span>
          <ChevronRight className="size-3" />
          <span className="font-semibold text-foreground truncate max-w-xs">{scheme.name}</span>
        </nav>

        {/* Scheme Hero Header */}
        <div className="surface-card p-6 sm:p-7 space-y-5 bg-card">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                <span className="rounded bg-primary-soft px-2.5 py-0.5 text-primary text-[11px] font-bold">
                  {scheme.category}
                </span>
                <span className="inline-flex items-center gap-1 text-muted-foreground text-xs">
                  <Building2 className="size-3.5" />
                  {scheme.governmentLevel} Government
                </span>
                <span className="text-muted-foreground">·</span>
                <span className="inline-flex items-center gap-1 text-muted-foreground text-xs">
                  <MapPin className="size-3.5" />
                  {scheme.state}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight leading-tight">
                {scheme.name}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                Nodal Department: <strong className="text-foreground">{scheme.department}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleSaved(scheme.id, scheme.name)}
                className="h-9 rounded-lg text-xs font-semibold gap-1.5 border-border"
              >
                {isSaved ? (
                  <>
                    <BookmarkCheck className="size-4 text-primary" />
                    <span>Saved</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="size-4" />
                    <span>Save Scheme</span>
                  </>
                )}
              </Button>
              <Button asChild size="sm" className="h-9 rounded-lg text-xs font-semibold gap-1.5 bg-primary text-primary-foreground">
                <a href={scheme.officialUrl} target="_blank" rel="noopener noreferrer">
                  <span>Official Portal</span>
                  <ExternalLink className="size-3.5" />
                </a>
              </Button>
            </div>
          </div>

          {/* Key Intelligence Badges Row */}
          <div className="pt-4 border-t border-border/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-background border border-border space-y-1">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                Profile Match
              </p>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold text-foreground tabular-nums">
                  {recommendation.matchScore}/100
                </span>
                <span className="text-[11px] font-semibold text-primary">
                  {recommendation.matchScore >= 80 ? "Strong" : "Moderate"}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-background border border-border space-y-1">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                Eligibility Check
              </p>
              <EligibilityBadge status={assessment.status} />
            </div>

            <div className="p-3 rounded-lg bg-background border border-border space-y-1">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                Benefit Value
              </p>
              <p className="text-sm font-bold text-foreground flex items-center gap-1">
                <IndianRupee className="size-3.5" />
                <span>{scheme.benefitSummary}</span>
              </p>
            </div>

            <div className="p-3 rounded-lg bg-background border border-border space-y-1">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                Deadline Status
              </p>
              <p className="text-xs font-semibold text-foreground flex items-center gap-1">
                <Calendar className="size-3.5 text-muted-foreground" />
                <span>{scheme.deadline ? `${urgency?.daysRemaining} days left` : "Open Scheme"}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Structured Tabs Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="h-10 p-1 bg-muted rounded-lg border border-border flex flex-wrap">
            <TabsTrigger value="overview" className="text-xs font-semibold rounded-md px-3">
              Overview
            </TabsTrigger>
            <TabsTrigger value="eligibility" className="text-xs font-semibold rounded-md px-3">
              Eligibility Rules ({criteria.length})
            </TabsTrigger>
            <TabsTrigger value="actionplan" className="text-xs font-semibold rounded-md px-3">
              Action Plan ({actionPlan?.steps.length || 0})
            </TabsTrigger>
            <TabsTrigger value="documents" className="text-xs font-semibold rounded-md px-3">
              Documents ({scheme.requiredDocuments.length})
            </TabsTrigger>
            <TabsTrigger value="application" className="text-xs font-semibold rounded-md px-3">
              How to Apply
            </TabsTrigger>
            <TabsTrigger value="related" className="text-xs font-semibold rounded-md px-3">
              Related Schemes ({relatedData?.relatedSchemes.length || 0})
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: OVERVIEW */}
          <TabsContent value="overview" className="space-y-4">
            <div className="surface-card p-6 space-y-5 bg-card">
              <div>
                <h3 className="text-sm font-bold text-foreground">Scheme Objective</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">
                  {scheme.description}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-foreground">Key Benefits Provided</h3>
                <ul className="mt-2 space-y-2 text-xs sm:text-sm">
                  {scheme.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2 text-muted-foreground">
                      <span className="font-bold text-success mt-0.5">✓</span>
                      <span className="text-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <OfficialSourceCard scheme={scheme} />
            </div>
          </TabsContent>

          {/* TAB 2: ELIGIBILITY RULES BREAKDOWN */}
          <TabsContent value="eligibility" className="space-y-4">
            <div className="surface-card p-6 space-y-4 bg-card">
              <div>
                <h3 className="text-sm font-bold text-foreground">Detailed Eligibility Assessment</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Comparison between your provided citizen profile and official scheme requirements.
                </p>
              </div>

              <div className="space-y-2.5">
                {criteria.map((c) => {
                  const isMatch = c.status === "match";
                  const isMismatch = c.status === "mismatch";

                  return (
                    <div
                      key={c.label}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg border border-border bg-background text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={
                              isMatch
                                ? "text-success font-bold"
                                : isMismatch
                                  ? "text-destructive font-bold"
                                  : "text-warning-foreground font-bold"
                            }
                          >
                            {isMatch ? "✓" : isMismatch ? "✕" : "⚠"}
                          </span>
                          <span className="font-semibold text-foreground">{c.label}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          Requirement: <strong className="text-foreground font-medium">{c.required}</strong>
                        </p>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-[11px] text-muted-foreground">Your Profile: </span>
                        <strong className="text-foreground text-xs font-semibold">{c.yourValue}</strong>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground space-y-1">
                <p className="font-semibold text-foreground flex items-center gap-1.5">
                  <Info className="size-3.5 text-primary" />
                  <span>Important Eligibility Disclaimer</span>
                </p>
                <p className="text-[11px] leading-relaxed">
                  Eligibility assessments on BENEFITX are generated by rule matching against declared profile attributes. Always verify official government notifications prior to submission.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* TAB 3: ACTION PLAN */}
          <TabsContent value="actionplan" className="space-y-4">
            <div className="surface-card p-6 space-y-5 bg-card">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-foreground">What You Should Do Next</h3>
                  {actionPlan?.priority && (
                    <span className="rounded bg-primary-soft px-2 py-0.5 text-[11px] font-bold text-primary">
                      Priority: {actionPlan.priority}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {actionPlan?.summary || "Follow these sequential steps to prepare and apply."}
                </p>
              </div>

              {actionPlan && actionPlan.steps.length > 0 ? (
                <div className="relative border-l-2 border-border ml-3 space-y-6 pl-5 py-2">
                  {actionPlan.steps.map((step) => (
                    <div key={step.order} className="relative space-y-1">
                      <div className="absolute -left-[27px] top-0 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                        {step.order}
                      </div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-foreground">{step.action}</h4>
                        <span className="rounded bg-muted px-1.5 py-0.2 text-[9px] font-mono text-muted-foreground uppercase">
                          {step.type}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{step.reason}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">All prerequisite steps complete.</p>
              )}
            </div>
          </TabsContent>

          {/* TAB 4: REQUIRED DOCUMENTS */}
          <TabsContent value="documents" className="space-y-4">
            <div className="surface-card p-6 space-y-4 bg-card">
              <div>
                <h3 className="text-sm font-bold text-foreground">Document Readiness Checklist</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Certificates and IDs required for official portal verification.
                </p>
              </div>

              <div className="space-y-2">
                {scheme.requiredDocuments.map((docName) => {
                  const userDoc = documents.find((d) => d.name === docName);
                  const isAvail = userDoc && (userDoc.status === "available" || userDoc.status === "needs-verification");

                  return (
                    <div
                      key={docName}
                      className="flex items-center justify-between p-3 rounded-lg border border-border bg-background text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={isAvail ? "text-success font-bold" : "text-muted-foreground font-bold"}>
                          {isAvail ? "✓" : "○"}
                        </span>
                        <div>
                          <span className="font-semibold text-foreground">{docName}</span>
                          <span className="ml-2 text-[10px] text-muted-foreground">(Mandatory)</span>
                        </div>
                      </div>

                      <span
                        className={
                          isAvail
                            ? "text-success font-semibold"
                            : "text-muted-foreground font-medium"
                        }
                      >
                        {isAvail ? "Ready on file" : "Not uploaded"}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 flex justify-end">
                <Button asChild size="sm" variant="outline" className="text-xs font-semibold">
                  <Link to="/documents">Manage in Document Locker</Link>
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* TAB 5: HOW TO APPLY */}
          <TabsContent value="application" className="space-y-4">
            <div className="surface-card p-6 space-y-5 bg-card">
              <div>
                <h3 className="text-sm font-bold text-foreground">Official Application Steps</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Standard application workflow as defined by the {scheme.department}.
                </p>
              </div>

              <div className="space-y-3">
                {scheme.applicationSteps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted font-bold text-muted-foreground text-[10px] mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-foreground leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  Official Portal: <strong className="text-foreground">{scheme.sourceName}</strong>
                </p>
                <Button asChild size="sm" className="bg-primary text-primary-foreground text-xs font-semibold gap-1.5">
                  <a href={scheme.officialUrl} target="_blank" rel="noopener noreferrer">
                    <span>Open Government Portal</span>
                    <ExternalLink className="size-3.5" />
                  </a>
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* TAB 6: RELATED SCHEMES */}
          <TabsContent value="related" className="space-y-4">
            <div className="surface-card p-6 space-y-4 bg-card">
              <div>
                <h3 className="text-sm font-bold text-foreground">You May Also Be Eligible For</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Complementary schemes sharing target beneficiary groups and compatible criteria.
                </p>
              </div>

              {relatedData && relatedData.relatedSchemes.length > 0 ? (
                <div className="grid sm:grid-cols-3 gap-3">
                  {relatedData.relatedSchemes.map((item) => (
                    <div
                      key={item.schemeId}
                      className="rounded-lg border border-border bg-background p-3.5 space-y-2 flex flex-col"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-primary">{item.category}</span>
                        <span className="text-muted-foreground font-mono">{item.combinedScore}% Match</span>
                      </div>
                      <h4 className="text-xs font-bold text-foreground leading-snug">
                        {item.schemeName}
                      </h4>
                      <p className="text-[11px] text-muted-foreground line-clamp-2">
                        {item.reason}
                      </p>
                      <div className="mt-auto pt-2">
                        <Button asChild size="sm" variant="outline" className="w-full h-7 text-[11px] font-semibold">
                          <Link to="/schemes/$id" params={{ id: item.schemeId }}>
                            View Scheme
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No related schemes identified.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
