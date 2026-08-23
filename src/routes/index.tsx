import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Sparkles,
  Search,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  FileCheck2,
  PieChart,
  Building2,
  MapPin,
  IndianRupee,
  Users,
  Compass,
  FileText,
  UserCheck,
  HelpCircle,
  Laptop,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAppStore } from "@/state/app-store";
import { SCHEMES } from "@/data/schemes";
import { MatchScore } from "@/components/common/MatchScore";
import { ProgressRing } from "@/components/common/ProgressRing";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  const navigate = useNavigate();
  const { profile, loadDemoProfile } = useAppStore();

  const handleDemoStart = async () => {
    await loadDemoProfile();
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="BENEFITX Logo"
              className="size-9 rounded-xl object-contain shadow-sm"
            />
            <div>
              <span className="text-xl font-black tracking-tight text-foreground">BENEFITX</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">
              How It Works
            </a>
            <a href="#schemes-preview" className="hover:text-foreground transition-colors">
              Popular Schemes
            </a>
            <Link to="/help" className="hover:text-foreground transition-colors">
              FAQ
            </Link>
          </nav>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDemoStart}
              className="rounded-xl text-xs font-bold gap-1.5 border-teal/30 bg-teal-soft/40 text-teal-foreground hover:bg-teal-soft"
            >
              <UserCheck className="size-3.5 text-teal" />
              <span>Try Demo Profile</span>
            </Button>
            <Button asChild size="sm" className="rounded-xl font-bold text-xs shadow-sm">
              <Link to="/dashboard">
                <span>{profile ? "Open Dashboard" : "Get Started"}</span>
                <ArrowRight className="size-3.5 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden hero-gradient pt-12 pb-20 sm:pt-16 sm:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Text */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft/60 px-3.5 py-1 text-xs font-bold text-primary shadow-2xs">
                <Sparkles className="size-3.5" />
                <span>AI-Powered Citizen Scheme Discovery Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.1]">
                Discover the government benefits that may be <span className="text-gradient-brand">relevant to you.</span>
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Get personalized scheme recommendations, understand your eligibility, identify missing documents, and know how ready you are to apply before submitting.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Button asChild size="lg" className="w-full sm:w-auto rounded-xl font-bold text-sm px-6 h-12 shadow-md gap-2">
                  <Link to="/onboarding">
                    <span>Check My Benefits</span>
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto rounded-xl font-bold text-sm px-6 h-12 gap-2 bg-card">
                  <Link to="/schemes">
                    <Compass className="size-4 text-teal" />
                    <span>Explore Schemes Catalog</span>
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={handleDemoStart}
                  className="w-full sm:w-auto rounded-xl font-bold text-xs text-muted-foreground hover:text-foreground"
                >
                  ⚡ Try Instant Demo
                </Button>
              </div>

              {/* Tagline callout */}
              <div className="pt-4 flex items-center justify-center lg:justify-start gap-4 text-xs font-extrabold uppercase tracking-widest text-muted-foreground/80">
                <span>Discover</span>
                <span>•</span>
                <span>Understand</span>
                <span>•</span>
                <span>Prepare</span>
                <span>•</span>
                <span>Apply</span>
              </div>
            </div>

            {/* Right Hero Visual — Stylized Dashboard Preview */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md surface-card p-6 shadow-2xl border-primary/20 bg-card/95 backdrop-blur space-y-5 rounded-3xl">
                {/* Visual Header */}
                <div className="flex items-center justify-between border-b border-border/80 pb-3">
                  <div className="flex items-center gap-2">
                    <img
                      src="/logo.png"
                      alt="BENEFITX Logo"
                      className="size-8 rounded-xl object-contain shadow-xs"
                    />
                    <div>
                      <p className="text-xs font-extrabold leading-none">Aarav Reddy</p>
                      <p className="text-[10px] text-muted-foreground">Undergraduate · Telangana</p>
                    </div>
                  </div>
                  <MatchScore score={94} confidence="high" size="sm" />
                </div>

                {/* AI Recommendation Sample */}
                <div className="rounded-2xl border border-teal/30 bg-teal-soft/30 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-teal">Top Recommendation</span>
                    <span className="text-xs font-extrabold text-foreground">₹20,000 / yr</span>
                  </div>
                  <h4 className="text-sm font-bold text-foreground line-clamp-1">
                    National Merit Scholarship for Undergraduates
                  </h4>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5 text-success font-medium">
                      <CheckCircle2 className="size-3.5 shrink-0" />
                      <span>Age & Education criteria matched</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-success font-medium">
                      <CheckCircle2 className="size-3.5 shrink-0" />
                      <span>Income within threshold limit</span>
                    </div>
                  </div>
                </div>

                {/* Readiness Circular Stat Preview */}
                <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-muted/40 p-4">
                  <ProgressRing value={80} size={88} thickness={8} tone="teal" />
                  <div className="space-y-1 text-right">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Application Readiness
                    </p>
                    <p className="text-lg font-extrabold text-foreground">80% Ready</p>
                    <p className="text-xs text-warning-foreground font-semibold">
                      ⚠ 1 document pending upload
                    </p>
                  </div>
                </div>

                {/* Action CTA */}
                <Button asChild size="sm" className="w-full rounded-xl font-bold gap-2">
                  <Link to="/dashboard">
                    <span>Open Live Interactive Demo</span>
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="features" className="py-16 sm:py-24 bg-card border-y border-border/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-teal">Key Capabilities</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Intelligent Scheme Discovery, From Match to Submission
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              BENEFITX goes beyond standard search directories with explainable recommendation models and readiness scoring.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="surface-card p-6 space-y-3 hover:border-primary/40 transition-colors">
              <div className="size-11 rounded-2xl bg-primary-soft text-primary flex items-center justify-center font-bold">
                <Sparkles className="size-5.5" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Personalized Recommendations</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Dynamic matching evaluates your age, state, education, income, and occupation against central and state government schemes.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="surface-card p-6 space-y-3 hover:border-teal/40 transition-colors">
              <div className="size-11 rounded-2xl bg-teal-soft text-teal flex items-center justify-center font-bold">
                <ShieldCheck className="size-5.5" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Explainable Eligibility</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Clear rule-by-rule breakdowns showing exactly why you qualify, what matched, and what factors require verification.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="surface-card p-6 space-y-3 hover:border-saffron/40 transition-colors">
              <div className="size-11 rounded-2xl bg-saffron-soft text-saffron-foreground flex items-center justify-center font-bold">
                <Compass className="size-5.5" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Missed Opportunity Detection</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Proactively detects relevant schemes you haven’t discovered yet where your profile matches key criteria.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="surface-card p-6 space-y-3 hover:border-primary/40 transition-colors">
              <div className="size-11 rounded-2xl bg-primary-soft text-primary flex items-center justify-center font-bold">
                <FileCheck2 className="size-5.5" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Smart Document Checklist</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Track available, missing, and expiring certificates with instant scheme-by-scheme requirement checklists.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="surface-card p-6 space-y-3 hover:border-teal/40 transition-colors">
              <div className="size-11 rounded-2xl bg-teal-soft text-teal flex items-center justify-center font-bold">
                <PieChart className="size-5.5" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Application Readiness Score</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A quantitative 0–100% readiness score measuring eligibility, document availability, and verification readiness.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="surface-card p-6 space-y-3 hover:border-saffron/40 transition-colors">
              <div className="size-11 rounded-2xl bg-saffron-soft text-saffron-foreground flex items-center justify-center font-bold">
                <Building2 className="size-5.5" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Official Portal Guidance</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Step-by-step application instructions with direct links to verified government portals and departments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Five-Stage Journey</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              How BENEFITX Works for Every Citizen
            </h2>
          </div>

          <div className="grid sm:grid-cols-5 gap-4 relative">
            {[
              { step: "01", title: "Profile", desc: "Fill basic demographic & economic profile" },
              { step: "02", title: "Discover", desc: "See AI-ranked matches and missed opportunities" },
              { step: "03", title: "Verify", desc: "Inspect clear criterion-by-criterion rules" },
              { step: "04", title: "Prepare", desc: "Organize required documents & track readiness" },
              { step: "05", title: "Apply", desc: "Submit directly on the verified official portal" },
            ].map((item, idx) => (
              <div
                key={item.step}
                className="surface-card p-5 space-y-2 rounded-2xl relative border-primary/15"
              >
                <span className="text-2xl font-black text-primary/30 tabular-nums">{item.step}</span>
                <h4 className="text-base font-bold text-foreground">{item.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Schemes Preview */}
      <section id="schemes-preview" className="py-16 sm:py-24 bg-card border-t border-border/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-teal">Government Catalog</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-1">
                Explore Top Central & State Schemes
              </h2>
            </div>
            <Button asChild variant="outline" className="rounded-xl font-semibold text-xs">
              <Link to="/schemes">
                <span>View All 22 Schemes</span>
                <ArrowRight className="size-3.5 ml-1" />
              </Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {SCHEMES.slice(0, 3).map((scheme) => (
              <div
                key={scheme.id}
                className="surface-card p-5 space-y-3 flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="rounded-full bg-teal-soft px-2.5 py-0.5 text-teal">{scheme.category}</span>
                    <span className="text-muted-foreground">{scheme.governmentLevel}</span>
                  </div>
                  <h3 className="mt-2 text-base font-bold text-foreground line-clamp-1">{scheme.name}</h3>
                  <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">{scheme.shortDescription}</p>
                </div>
                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-xs font-bold text-saffron-foreground">{scheme.benefitSummary}</span>
                  <Button asChild size="sm" variant="ghost" className="rounded-xl text-xs font-bold">
                    <Link to="/schemes/$id" params={{ id: scheme.id }}>
                      Details →
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Transparency Section */}
      <section className="py-14 bg-muted/40 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-sm font-bold text-foreground">
            <ShieldCheck className="size-5 text-primary" />
            <span>Civic Decision-Support Architecture</span>
          </div>
          <p className="text-xs text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            BENEFITX is designed as an intelligent decision-support layer using structured government scheme information. Scores and evaluations are algorithmic indicators to help citizens discover and prepare. Official eligibility decisions are determined solely by the respective government authorities.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-sidebar py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="BENEFITX Logo"
              className="size-6 rounded-lg object-contain"
            />
            <span className="font-bold text-foreground">BENEFITX</span>
            <span>· Citizen Scheme Discovery & Application Readiness</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/schemes" className="hover:text-foreground">Catalog</Link>
            <Link to="/help" className="hover:text-foreground">FAQ</Link>
            <Link to="/settings" className="hover:text-foreground">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
