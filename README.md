# BENEFITX — AI-Powered Government Scheme Discovery & Readiness Platform

> **“Discover. Understand. Prepare. Apply.”**

**Live Production URL:** [https://benefit-navigator-main.vercel.app](https://benefit-navigator-main.vercel.app)  
**Admin Portal:** [https://benefit-navigator-main.vercel.app/admin](https://benefit-navigator-main.vercel.app/admin)  

---

## 🌟 Overview

**BENEFITX** is a modern, full-stack citizen decision-support platform designed to bridge the gap between government welfare schemes and eligible citizens. Built with **TanStack Start (React 19 + TypeScript + Vite + Nitro)**, the platform combines a deterministic criteria evaluation engine, an explainable recommendation scoring model, a quantitative document readiness tracker, a What-If eligibility simulator, and multilingual plain-language explanations in English, Telugu, and Hindi.

---

## 🚀 The 5 Core Backend Feature Engines

1. **Missed Scheme Detector (`recommendationEngine.ts`):** Proactively discovers schemes the citizen is eligible for but hasn't searched for, using deterministic weighted profile-match scoring ($50\%$ Profile $+ 35\%$ Eligibility $+ 15\%$ Docs).
2. **Explainable Eligibility (`eligibilityEngine.ts`):** Evaluates citizen criteria against scheme rules and returns clear `MATCHED`, `FAILED`, or `UNKNOWN` states with human-readable condition breakdowns.
3. **Smart Document Readiness (`documentReadinessEngine.ts`):** Calculates quantitative readiness scores: $(\text{Available Required} / \text{Total Required}) \times 100$. Optional documents never penalize readiness.
4. **What-If Eligibility Simulator (`simulationEngine.ts`):** Safe, zero-mutation simulator that lets citizens test hypothetical changes (e.g. income shifts, education qualification) with field whitelisting protection.
5. **Simple Language & Multilingual Translation (`explanationEngine.ts`):** Converts dense government notices into plain language with native support for **English (`en`)**, **Telugu (`te`)**, and **Hindi (`hi`)**.

---

## 🏛️ Gov-Admin & Verification Portal (`/admin`)

* **Nodal Officer Authority:** Senior officer authority workspace (Dr. K. Srinivas Rao, Ministry of Social Justice & Welfare).
* **Citizen Verification Queue:** Actionable officer review workflow comparing applicant declarations with OCR-extracted metadata.
* **National Scheme Registry:** Complete registry of all 22 central and state schemes.
* **Rules Engine Inspector:** Interactive tool to inspect rule evaluation formulas without LLM bias.

---

## 📱 Complete 16-Route Platform Suite

| Route | Purpose | Key Features |
|---|---|---|
| `/` | **Landing Page** | Dynamic preview, 6 capability cards, 5-stage workflow, and demo preset trigger |
| `/onboarding` | **Citizen Wizard** | 4-step progressive disclosure wizard for demographics and documents |
| `/dashboard` | **Citizen Dashboard** | 4 KPI metric cards, Circular Readiness meter, top matches, and missed schemes |
| `/recommendations` | **AI Recommendations** | Ranked recommendations, confidence badges, and multi-criteria filters |
| `/missed-opportunities` | **Missed Schemes** | Dedicated view for schemes matching 4 of 5 key criteria |
| `/schemes` | **Schemes Directory** | 22-scheme catalog with instant search, category chips, and state filtering |
| `/schemes/:id` | **Scheme Details** | Financial benefits, application steps, document checklist, and official links |
| `/eligibility/:id` | **Eligibility Assessment** | Rule-by-rule criterion table (`✓ Match`, `⚠ Verify`, `✕ Mismatch`) |
| `/documents` | **Document Locker** | Document tabs, upload modal, size validation, and simulated OCR |
| `/readiness` | **Application Readiness** | Composite readiness breakdown ($40\%$ Eligibility + $40\%$ Docs + $20\%$ Verification) |
| `/saved` | **Saved Schemes** | Bookmarked scheme manager with search |
| `/applications` | **Application Tracker** | Visual 6-stage lifecycle stepper |
| `/notifications` | **Notification Center** | Categorized update feed with unread badge |
| `/profile` | **Citizen Profile** | Profile editor with completeness meter and live recalculation |
| `/settings` | **Settings** | Multi-language preference selector, notification toggles, and data reset |
| `/help` | **Help & FAQs** | Official policy FAQs, scoring explanations, and user guidance |
| `/admin` | **Gov-Admin Portal** | Real-time analytics, verification queue, and rules engine tester |

---

## 🧪 Testing & Quality Assurance

* **Vitest Suite:** **40 / 40 Automated Tests Passing (100% Pass Rate)**
* **TypeScript Compilation:** `npx tsc --noEmit` — **0 Errors**
* **Production Build:** `npm run build` — Clean, production-ready build

---

## 💻 Local Development

```bash
# Clone the repository
git clone https://github.com/saivenkatsumanth9-stack/BENEFITX.git
cd BENEFITX

# Install dependencies
npm install

# Run the development server
npm run dev

# Run automated tests
npm run test
# or: npx vitest run

# Build for production
npm run build
```

---

## 📄 License & Attribution

Designed as a citizen decision-support layer using structured government scheme information. Scores and evaluations are algorithmic indicators to help citizens discover and prepare. Official eligibility decisions are determined solely by the respective government authorities.
