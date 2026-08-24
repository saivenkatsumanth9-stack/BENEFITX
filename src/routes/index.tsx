import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Search,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  FileCheck2,
  Building2,
  MapPin,
  IndianRupee,
  Compass,
  FileText,
  UserCheck,
  PieChart,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAppStore } from "@/state/app-store";
import { SCHEMES } from "@/data/schemes";

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
    <div className="min-h-screen bg-background text-foreground flex flex-col antialiased">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-card/95 backdrop-blur">
        <div className="max-w-6xl mx-auto flex h-14 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shadow-xs">
              BX
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-foreground">BENEFITX</span>
              <span className="hidden sm:inline-block ml-2 text-[11px] text-muted-foreground font-medium">
                National Welfare Discovery
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">
              Platform Features
            </a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">
              How It Works
            </a>
            <a href="#schemes-preview" className="hover:text-foreground transition-colors">
              Schemes Catalog
            </a>
            <Link to="/help" className="hover:text-foreground transition-colors">
              Help & FAQ
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDemoStart}
              className="h-8 rounded-lg text-xs font-semibold gap-1.5 border-border bg-background hover:bg-muted"
            >
              <UserCheck className="size-3.5 text-primary" />
              <span>Demo Persona</span>
            </Button>
            <Button asChild size="sm" className="h-8 rounded-lg font-semibold text-xs bg-primary text-primary-foreground">
              <Link to="/dashboard">
                <span>{profile ? "Open Dashboard" : "Citizen Portal"}</span>
                <ArrowRight className="size-3.5 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-14 sm:py-20 border-b border-border bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            {/* Left Hero Text */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1 text-xs font-semibold text-foreground shadow-xs">
                <ShieldCheck className="size-3.5 text-primary" />
                <span>Verified Central & State Welfare Discovery</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight">
                Discover government welfare schemes relevant to your profile.
              </h1>

              <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Discover personalized benefits, inspect explainable criteria matching, identify missing certificates, and track application readiness before submitting.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <Button asChild size="lg" className="w-full sm:w-auto h-10 rounded-lg font-semibold text-xs px-5 bg-primary text-primary-foreground gap-1.5 shadow-sm">
                  <Link to="/onboarding">
                    <span>Check Eligibility</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-10 rounded-lg font-semibold text-xs px-5 gap-1.5 bg-card border-border">
                  <Link to="/schemes">
                    <Compass className="size-3.5 text-muted-foreground" />
                    <span>Browse 22 Schemes</span>
                  </Link>
                </Button>
              </div>

              {/* Four Pillars */}
              <div className="pt-3 flex items-center justify-center lg:justify-start gap-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <span>Discover</span>
                <span>•</span>
                <span>Understand</span>
                <span>•</span>
                <span>Prepare</span>
                <span>•</span>
                <span>Apply</span>
              </div>
            </div>

            {/* Right Card Mockup */}
            <div className="lg:col-span-5">
              <div className="surface-card p-5 space-y-4 bg-card border-border shadow-sm">
                <div className="flex items-center justify-between border-b border-border/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-lg bg-primary-soft flex items-center justify-center font-bold text-xs text-primary">
                      AR
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">Aarav Reddy</p>
                      <p className="text-[10px] text-muted-foreground">Undergraduate · Telangana</p>
                    </div>
                  </div>
                  <span className="rounded border border-success/30 bg-success-soft px-2 py-0.5 text-xs font-semibold text-success">
                    94% Match
                  </span>
                </div>

                <div className="rounded-lg border border-border bg-background p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-muted-foreground">Top Scheme Match</span>
                    <span className="font-bold text-foreground">₹20,000 / year</span>
                  </div>
                  <h4 className="text-xs font-bold text-foreground">
                    National Merit Scholarship for Undergraduates
                  </h4>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5 text-success">
                      <CheckCircle2 className="size-3.5" />
                      <span>Age & Education criteria satisfied</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-success">
                      <CheckCircle2 className="size-3.5" />
                      <span>Income within limit</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border bg-background p-3 text-xs">
                  <div>
                    <p className="font-bold text-foreground">Application Readiness</p>
                    <p className="text-[11px] text-muted-foreground">3 of 4 documents verified</p>
                  </div>
                  <span className="font-extrabold text-foreground text-base">80%</span>
                </div>

                <Button asChild size="sm" className="w-full h-8 rounded-lg text-xs font-semibold bg-primary text-primary-foreground">
                  <Link to="/dashboard">
                    <span>Enter Citizen Dashboard</span>
                    <ArrowRight className="size-3.5 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-14 sm:py-18 bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Core Capabilities
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Structured Scheme Discovery & Application Readiness
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Built on explicit rule evaluations, document verification checklists, and transparent matching factors.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="surface-card p-5 space-y-2.5 bg-background border-border">
              <div className="size-8 rounded-md bg-primary-soft text-primary flex items-center justify-center font-bold">
                <Compass className="size-4" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Profile-Based Matching</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Deterministic matching against age, income, state, education, and occupation rules.
              </p>
            </div>

            <div className="surface-card p-5 space-y-2.5 bg-background border-border">
              <div className="size-8 rounded-md bg-primary-soft text-primary flex items-center justify-center font-bold">
                <ShieldCheck className="size-4" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Explainable Eligibility</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Clear rule breakdowns explaining why you qualify, what factors matched, and what requires verification.
              </p>
            </div>

            <div className="surface-card p-5 space-y-2.5 bg-background border-border">
              <div className="size-8 rounded-md bg-primary-soft text-primary flex items-center justify-center font-bold">
                <FileCheck2 className="size-4" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Document Readiness</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Track available, missing, and expiring certificates before beginning official application submission.
              </p>
            </div>

            <div className="surface-card p-5 space-y-2.5 bg-background border-border">
              <div className="size-8 rounded-md bg-primary-soft text-primary flex items-center justify-center font-bold">
                <PieChart className="size-4" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Readiness Index</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                A quantitative 0–100 score measuring eligibility match, document availability, and verification readiness.
              </p>
            </div>

            <div className="surface-card p-5 space-y-2.5 bg-background border-border">
              <div className="size-8 rounded-md bg-primary-soft text-primary flex items-center justify-center font-bold">
                <Building2 className="size-4" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Direct Official Portals</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Step-by-step guidance and deep links directly to authorized central and state government portals.
              </p>
            </div>

            <div className="surface-card p-5 space-y-2.5 bg-background border-border">
              <div className="size-8 rounded-md bg-primary-soft text-primary flex items-center justify-center font-bold">
                <FileText className="size-4" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Personalized Action Plans</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Sequential action steps tailored to your specific application stage, deadlines, and missing documents.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-14 sm:py-18 bg-background border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Citizen Journey
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              How BENEFITX Works
            </h2>
          </div>

          <div className="grid sm:grid-cols-5 gap-3.5">
            <div className="surface-card p-4 space-y-1.5 bg-card border-border">
              <span className="text-xl font-extrabold text-primary tabular-nums">01</span>
              <h4 className="text-xs font-bold text-foreground">Profile</h4>
              <p className="text-[11px] text-muted-foreground">Provide demographic & economic details</p>
            </div>
            <div className="surface-card p-4 space-y-1.5 bg-card border-border">
              <span className="text-xl font-extrabold text-primary tabular-nums">02</span>
              <h4 className="text-xs font-bold text-foreground">Discover</h4>
              <p className="text-[11px] text-muted-foreground">View matching central & state schemes</p>
            </div>
            <div className="surface-card p-4 space-y-1.5 bg-card border-border">
              <span className="text-xl font-extrabold text-primary tabular-nums">03</span>
              <h4 className="text-xs font-bold text-foreground">Verify</h4>
              <p className="text-[11px] text-muted-foreground">Check criterion-by-criterion rules</p>
            </div>
            <div className="surface-card p-4 space-y-1.5 bg-card border-border">
              <span className="text-xl font-extrabold text-primary tabular-nums">04</span>
              <h4 className="text-xs font-bold text-foreground">Prepare</h4>
              <p className="text-[11px] text-muted-foreground">Organize certificates & track readiness</p>
            </div>
            <div className="surface-card p-4 space-y-1.5 bg-card border-border">
              <span className="text-xl font-extrabold text-primary tabular-nums">05</span>
              <h4 className="text-xs font-bold text-foreground">Apply</h4>
              <p className="text-[11px] text-muted-foreground">Submit directly on the official portal</p>
            </div>
          </div>
        </div>
      </section>

      {/* Schemes Preview */}
      <section id="schemes-preview" className="py-14 sm:py-18 bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Government Catalog
              </p>
              <h2 className="text-2xl font-bold tracking-tight text-foreground mt-1">
                Featured Central & State Schemes
              </h2>
            </div>
            <Button asChild size="sm" variant="outline" className="text-xs font-semibold">
              <Link to="/schemes">
                <span>View All 22 Schemes</span>
                <ArrowRight className="size-3.5 ml-1" />
              </Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {SCHEMES.slice(0, 3).map((scheme) => (
              <div key={scheme.id} className="surface-card p-4 space-y-3 bg-background border-border flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[11px] font-semibold">
                    <span className="rounded bg-primary-soft px-2 py-0.5 text-primary">{scheme.category}</span>
                    <span className="text-muted-foreground">{scheme.governmentLevel}</span>
                  </div>
                  <h3 className="mt-2 text-sm font-bold text-foreground line-clamp-1">{scheme.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{scheme.shortDescription}</p>
                </div>
                <div className="pt-2.5 border-t border-border/80 flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">{scheme.benefitSummary}</span>
                  <Link to="/schemes/$id" params={{ id: scheme.id }} className="text-primary font-semibold hover:underline">
                    Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-sidebar py-6 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="size-5 rounded bg-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground">
              BX
            </div>
            <span className="font-bold text-foreground">BENEFITX</span>
            <span>· Citizen Scheme Discovery & Readiness Platform</span>
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
