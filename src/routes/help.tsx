import { createFileRoute, Link } from "@tanstack/react-router";
import { HelpCircle, Sparkles, ShieldCheck, Mail, FileText, Compass, ExternalLink } from "lucide-react";

import { AppLayout } from "@/components/layout/AppLayout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/help")({
  component: HelpFAQPage,
});

const FAQS = [
  {
    q: "How does BENEFITX match government schemes with my profile?",
    a: "BENEFITX uses a multi-factor rule engine that evaluates your demographic attributes (age, state, district, gender), educational status, occupation, and household income against the official criteria of central and state schemes. It computes an explainable Match Score (0–100%) and confidence level.",
  },
  {
    q: "Does BENEFITX submit official applications on my behalf?",
    a: "No. BENEFITX is an intelligent decision-support and discovery layer. Once you understand your eligibility and prepare the required document checklist, BENEFITX redirects you directly to the verified official government portal (e.g. National Scholarship Portal, PM-KISAN, ePASS) to submit your application securely.",
  },
  {
    q: "How is the Application Readiness Score calculated?",
    a: "The readiness score combines 3 key components: (1) 40% Eligibility rule alignment, (2) 40% Document availability (checking if you have uploaded mandatory certificates like Aadhaar, Income certificate, etc.), and (3) 20% Credential verification status.",
  },
  {
    q: "What are 'Missed Opportunities'?",
    a: "Missed opportunities are government benefits where your profile matches 4 out of 5 key criteria, but you might not have actively searched for or bookmarked them. BENEFITX proactively surfaces them so you don't miss out on scholarships, fee reimbursements, or subsidies you are eligible for.",
  },
  {
    q: "Is my personal data stored or shared with third parties?",
    a: "In this prototype version, all data is retained strictly on your local browser device. When connected to a secure backend, data will be encrypted in transit and at rest, adhering to strict citizen privacy standards.",
  },
  {
    q: "How are Central vs State Government schemes distinguished?",
    a: "Central schemes apply to all eligible citizens nationwide across India, while State schemes require residency or enrollment within that specific state (such as Telangana or Karnataka). Each scheme clearly displays its government level and state scope.",
  },
];

function HelpFAQPage() {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-teal">Support & Guidance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-1">
              Help Center & Frequently Asked Questions
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Learn how BENEFITX helps you discover, understand, prepare, and apply for citizen benefits.
            </p>
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="surface-card p-6 sm:p-8 space-y-4 shadow-sm">
          <h2 className="text-lg font-bold text-foreground">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full space-y-2">
            {FAQS.map((faq, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`} className="border rounded-xl px-4 bg-muted/20">
                <AccordionTrigger className="text-sm font-bold text-left hover:no-underline py-4">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Hackathon / Prototype Support Card */}
        <div className="surface-card p-6 sm:p-8 space-y-4 shadow-sm border-primary/20 bg-primary-soft/10">
          <div className="flex items-center gap-2.5">
            <Sparkles className="size-5 text-primary" />
            <h3 className="text-base font-bold text-foreground">About the BENEFITX Platform</h3>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            BENEFITX is an AI-powered civic technology prototype designed to bridge the gap between government social welfare infrastructure and eligible citizens. Designed for national-level innovation demonstration.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Button asChild size="sm" className="rounded-xl text-xs font-bold gap-1.5">
              <Link to="/onboarding">
                <span>Start Citizen Onboarding</span>
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="rounded-xl text-xs font-bold gap-1.5">
              <Link to="/schemes">
                <Compass className="size-3.5" />
                <span>Explore Catalog</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
