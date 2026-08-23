import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShieldCheck,
  Building2,
  Users,
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  Filter,
  Search,
  Sparkles,
  Layers,
  ChevronRight,
  TrendingUp,
  MapPin,
  ExternalLink,
  Clock,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";

import { AppLayout } from "@/components/layout/AppLayout";
import { SCHEMES } from "@/data/schemes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MOCK_VERIFICATION_QUEUE } from "@/data/admin";
import type { Scheme } from "@/lib/types";

export const Route = createFileRoute("/admin")({
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [officerId, setOfficerId] = useState("admin-officer-001");
  const [pin, setPin] = useState("GOV-ADMIN-2026");
  const [activeTab, setActiveTab] = useState<"overview" | "schemes" | "verification" | "rules">("overview");
  const [queue, setQueue] = useState(MOCK_VERIFICATION_QUEUE);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(SCHEMES[0] ?? null);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (officerId.trim() && pin.trim()) {
      setIsAuthenticated(true);
      toast.success("Nodal Officer Authenticated", {
        description: "Welcome, Dr. K. Srinivas Rao (Ministry of Social Justice & Welfare)",
      });
    } else {
      toast.error("Please provide valid officer credentials.");
    }
  };

  const handleAction = (docId: string, citizenName: string, action: "Approved" | "Rejected" | "Reupload") => {
    setQueue((prev) => prev.filter((q) => q.id !== docId));
    if (action === "Approved") {
      toast.success(`Verified: ${citizenName}'s document marked as verified in the national database.`);
    } else if (action === "Rejected") {
      toast.error(`Rejected: ${citizenName} will be notified with officer remarks.`);
    } else {
      toast.info(`Notification sent to ${citizenName} requesting fresh re-upload.`);
    }
  };

  const filteredSchemes = SCHEMES.filter((s) => {
    if (selectedLevel !== "all" && s.governmentLevel !== selectedLevel) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // SCREEN 1: Gov-Admin Security Barrier & Login (If not authenticated)
  if (!isAuthenticated) {
    return (
      <AppLayout>
        <div className="max-w-xl mx-auto py-12 px-4 space-y-6 animate-in fade-in duration-300">
          <div className="text-center space-y-2">
            <div className="inline-flex size-14 rounded-3xl bg-primary-soft text-primary items-center justify-center shadow-xs mx-auto">
              <ShieldCheck className="size-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Gov-Admin Nodal Portal
            </h1>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Restricted administrative access for authorized welfare nodal officers and department administrators.
            </p>
          </div>

          <div className="surface-card p-6 sm:p-8 space-y-6 rounded-3xl border-primary/20 shadow-md">
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Government Officer ID</label>
                <Input
                  value={officerId}
                  onChange={(e) => setOfficerId(e.target.value)}
                  placeholder="admin-officer-001"
                  required
                  className="h-10 text-xs rounded-xl font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Security PIN / Access Key</label>
                <Input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="h-10 text-xs rounded-xl font-mono"
                />
              </div>

              <div className="rounded-2xl bg-muted/40 p-3.5 border border-border space-y-1 text-xs text-muted-foreground">
                <p className="font-extrabold text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-teal" />
                  <span>Authorized Nodal Credentials:</span>
                </p>
                <p className="text-[11px]">Officer ID: <code className="text-primary font-bold">admin-officer-001</code></p>
                <p className="text-[11px]">Officer: <strong>Dr. K. Srinivas Rao</strong></p>
                <p className="text-[11px]">Dept: <strong>Ministry of Social Justice & Welfare</strong></p>
                <p className="text-[11px]">Security PIN: <code className="text-teal font-bold">GOV-ADMIN-2026</code></p>
              </div>

              <div className="pt-2 space-y-2.5">
                <Button type="submit" className="w-full h-10 rounded-xl text-xs font-bold shadow-sm">
                  <ShieldCheck className="size-4 mr-1.5" />
                  <span>Authorize & Enter Admin Console</span>
                </Button>
                <Button asChild variant="ghost" className="w-full h-9 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground">
                  <Link to="/">
                    <span>← Return to Citizen Portal</span>
                  </Link>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </AppLayout>
    );
  }

  // SCREEN 2: Full Gov-Admin Console (When Authenticated)
  return (
    <AppLayout>
      <div className="space-y-8 animate-in fade-in duration-300">
        {/* Admin Header Banner */}
        <div className="rounded-3xl border border-primary/20 bg-linear-to-r from-primary/10 via-teal-soft/20 to-card p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-primary text-primary-foreground text-[10px] font-black uppercase px-2.5 py-0.5 tracking-wider">
                GOV-ADMIN CONSOLE
              </span>
              <span className="text-xs font-bold text-teal flex items-center gap-1">
                <ShieldCheck className="size-3.5" />
                Verified Nodal Authority
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Administrative & Verification Portal
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span>Officer: <strong>Dr. K. Srinivas Rao</strong></span>
              <span>·</span>
              <span>Ministry of Social Justice & Welfare, Govt. of India</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2.5">
            {/* Quick Tab Switcher */}
            <div className="flex flex-wrap gap-1.5 bg-card p-1.5 rounded-2xl border border-border">
              <Button
                size="sm"
                variant={activeTab === "overview" ? "default" : "ghost"}
                onClick={() => setActiveTab("overview")}
                className="rounded-xl text-xs font-bold"
              >
                Overview
              </Button>
              <Button
                size="sm"
                variant={activeTab === "verification" ? "default" : "ghost"}
                onClick={() => setActiveTab("verification")}
                className="rounded-xl text-xs font-bold relative"
              >
                Queue
                {queue.length > 0 && (
                  <span className="ml-1.5 rounded-full bg-destructive text-destructive-foreground text-[10px] px-1.5 py-0.2 font-black">
                    {queue.length}
                  </span>
                )}
              </Button>
              <Button
                size="sm"
                variant={activeTab === "schemes" ? "default" : "ghost"}
                onClick={() => setActiveTab("schemes")}
                className="rounded-xl text-xs font-bold"
              >
                Schemes ({SCHEMES.length})
              </Button>
              <Button
                size="sm"
                variant={activeTab === "rules" ? "default" : "ghost"}
                onClick={() => setActiveTab("rules")}
                className="rounded-xl text-xs font-bold"
              >
                Rules Tester
              </Button>
            </div>

            {/* Officer Sign Out */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsAuthenticated(false);
                toast.info("Signed out from Gov-Admin console.");
              }}
              className="rounded-xl text-xs font-bold h-9 text-muted-foreground hover:text-destructive"
            >
              Sign Out
            </Button>
          </div>
        </div>

        {/* TAB 1: OVERVIEW & ANALYTICS */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="surface-card p-5 space-y-2 border-primary/20">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Active Schemes</span>
                  <Building2 className="size-4 text-primary" />
                </div>
                <div className="text-3xl font-black text-foreground">{SCHEMES.length}</div>
                <p className="text-[11px] text-muted-foreground">14 Central · 8 State Level</p>
              </div>

              <div className="surface-card p-5 space-y-2 border-teal/20">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-bold uppercase tracking-wider">Pending Verifications</span>
                  <FileCheck2 className="size-4 text-teal" />
                </div>
                <div className="text-3xl font-black text-teal">{queue.length}</div>
                <p className="text-[11px] text-muted-foreground">Requires officer review</p>
              </div>

              <div className="surface-card p-5 space-y-2 border-saffron/20">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-bold uppercase tracking-wider">Citizen Simulations</span>
                  <TrendingUp className="size-4 text-saffron" />
                </div>
                <div className="text-3xl font-black text-foreground">14,280</div>
                <p className="text-[11px] text-success font-semibold">↑ 18% discovery increase</p>
              </div>

              <div className="surface-card p-5 space-y-2 border-success/20">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-bold uppercase tracking-wider">Avg Readiness Score</span>
                  <Sparkles className="size-4 text-success" />
                </div>
                <div className="text-3xl font-black text-success">78.4%</div>
                <p className="text-[11px] text-muted-foreground">Across 8,920 applicants</p>
              </div>
            </div>

            {/* Verification Queue Preview & Category Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Recent Verification Requests */}
              <div className="lg:col-span-8 surface-card p-6 space-y-5 shadow-sm">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div className="flex items-center gap-2">
                    <UserCheck className="size-5 text-primary" />
                    <h2 className="text-lg font-bold text-foreground">Actionable Citizen Verification Queue</h2>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setActiveTab("verification")}
                    className="text-xs font-bold rounded-xl"
                  >
                    View All ({queue.length})
                  </Button>
                </div>

                {queue.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground space-y-2">
                    <CheckCircle2 className="size-10 text-success mx-auto" />
                    <p className="font-bold text-foreground">Verification Queue Clear</p>
                    <p className="text-xs">All citizen document uploads have been reviewed.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {queue.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-border bg-muted/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-extrabold text-foreground">{item.citizenName}</span>
                            <span className="text-xs text-muted-foreground">({item.state})</span>
                            <span className="rounded bg-teal-soft px-1.5 py-0.2 text-[10px] font-bold text-teal">
                              OCR {item.ocrMatchConfidence}% Match
                            </span>
                          </div>
                          <p className="text-xs text-foreground font-semibold">
                            {item.schemeName} · <span className="text-primary">{item.documentType}</span>
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            Declared: {item.declaredIncome} · Extracted from Doc: {item.extractedIncome}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            size="sm"
                            onClick={() => handleAction(item.id, item.citizenName, "Approved")}
                            className="h-8 rounded-xl text-xs font-bold bg-success hover:bg-success/90 text-white"
                          >
                            <CheckCircle2 className="size-3.5 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAction(item.id, item.citizenName, "Reupload")}
                            className="h-8 rounded-xl text-xs font-bold"
                          >
                            Re-upload
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleAction(item.id, item.citizenName, "Rejected")}
                            className="h-8 rounded-xl text-xs font-bold"
                          >
                            <XCircle className="size-3.5 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Department & Level Breakdown */}
              <div className="lg:col-span-4 surface-card p-6 space-y-5 shadow-sm">
                <div className="flex items-center gap-2 border-b border-border pb-4">
                  <Layers className="size-5 text-teal" />
                  <h2 className="text-lg font-bold text-foreground">Scheme Registry Stats</h2>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="flex justify-between items-center p-2.5 rounded-xl bg-muted/40">
                    <span className="font-semibold text-muted-foreground">Central Schemes</span>
                    <span className="font-bold text-foreground">14 Schemes (64%)</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 rounded-xl bg-muted/40">
                    <span className="font-semibold text-muted-foreground">State Government Schemes</span>
                    <span className="font-bold text-foreground">8 Schemes (36%)</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 rounded-xl bg-muted/40">
                    <span className="font-semibold text-muted-foreground">Education & Scholarships</span>
                    <span className="font-bold text-teal">5 Schemes</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 rounded-xl bg-muted/40">
                    <span className="font-semibold text-muted-foreground">Agriculture & Rural</span>
                    <span className="font-bold text-saffron-foreground">4 Schemes</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 rounded-xl bg-muted/40">
                    <span className="font-semibold text-muted-foreground">Health & Social Security</span>
                    <span className="font-bold text-success">5 Schemes</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 rounded-xl bg-muted/40">
                    <span className="font-semibold text-muted-foreground">Employment & Credit</span>
                    <span className="font-bold text-primary">8 Schemes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: VERIFICATION QUEUE */}
        {activeTab === "verification" && (
          <div className="surface-card p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">Citizen Document Verification Queue</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Review applicant self-declarations and OCR-extracted metadata to grant official verification status.
                </p>
              </div>
              <span className="text-xs font-bold text-teal bg-teal-soft px-3 py-1.5 rounded-xl self-start">
                {queue.length} Pending Tasks
              </span>
            </div>

            {queue.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground space-y-3">
                <CheckCircle2 className="size-12 text-success mx-auto" />
                <h3 className="text-base font-bold text-foreground">All Submissions Verified</h3>
                <p className="text-xs max-w-sm mx-auto">
                  There are no pending documents waiting for officer review in your jurisdiction.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {queue.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-xs"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-extrabold text-foreground">{item.citizenName}</h3>
                          <span className="text-xs font-mono text-muted-foreground">({item.citizenId})</span>
                          <span className="rounded bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                            {item.state}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-primary">
                          Scheme: {item.schemeName}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-semibold">
                        <Clock className="size-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Submitted: {new Date(item.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Comparison Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-muted/30 border border-border text-xs">
                      <div>
                        <span className="text-muted-foreground font-semibold block">Document Type:</span>
                        <span className="font-bold text-foreground">{item.documentType}</span>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{item.fileName}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground font-semibold block">Declared Value:</span>
                        <span className="font-bold text-foreground">{item.declaredIncome}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground font-semibold block">OCR Extracted Data:</span>
                        <span className="font-bold text-teal">{item.extractedIncome}</span>
                        <p className="text-[11px] text-teal mt-0.5 font-bold">
                          {item.ocrMatchConfidence}% OCR Confidence
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAction(item.id, item.citizenName, "Reupload")}
                        className="rounded-xl text-xs font-bold h-9"
                      >
                        Request Clearer Re-Upload
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleAction(item.id, item.citizenName, "Rejected")}
                        className="rounded-xl text-xs font-bold h-9"
                      >
                        <XCircle className="size-4 mr-1" />
                        Reject Application
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAction(item.id, item.citizenName, "Approved")}
                        className="rounded-xl text-xs font-bold h-9 bg-success hover:bg-success/90 text-white"
                      >
                        <CheckCircle2 className="size-4 mr-1" />
                        Approve & Verify Document
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SCHEME REGISTRY */}
        {activeTab === "schemes" && (
          <div className="surface-card p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">National Welfare Scheme Registry</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Manage active government schemes, official portal URLs, and eligibility rules.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Input
                  placeholder="Search schemes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 w-48 text-xs rounded-xl"
                />
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="h-9 rounded-xl border border-input bg-card px-3 text-xs font-semibold text-foreground"
                >
                  <option value="all">All Levels</option>
                  <option value="Central">Central Govt</option>
                  <option value="State">State Govt</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-bold uppercase tracking-wider">
                    <th className="py-3 px-3">Scheme Name</th>
                    <th className="py-3 px-3">Level & State</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Benefit Summary</th>
                    <th className="py-3 px-3">Required Docs</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredSchemes.map((scheme) => (
                    <tr key={scheme.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3.5 px-3">
                        <span className="font-extrabold text-foreground block">{scheme.name}</span>
                        <span className="text-[11px] text-muted-foreground">{scheme.department}</span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="font-semibold text-foreground">{scheme.governmentLevel}</span>
                        <span className="text-muted-foreground block">{scheme.state}</span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="rounded-full bg-teal-soft px-2.5 py-0.5 font-bold text-teal">
                          {scheme.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-bold text-saffron-foreground">
                        {scheme.benefitSummary}
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-foreground">
                        {scheme.requiredDocuments.length} Documents
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <Button asChild size="sm" variant="outline" className="rounded-xl text-xs font-bold h-8">
                          <Link to="/schemes/$id" params={{ id: scheme.id }}>
                            <Eye className="size-3.5 mr-1" />
                            View Detail
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: RULE ENGINE TESTER */}
        {activeTab === "rules" && (
          <div className="surface-card p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="border-b border-border pb-4">
              <h2 className="text-xl font-bold text-foreground">Deterministic Criteria Rules Engine Inspector</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Inspect how eligibility conditions evaluate against citizen attributes in real-time without LLM bias.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Scheme Picker */}
              <div className="lg:col-span-4 space-y-3">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                  Select Scheme to Inspect
                </label>
                <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                  {SCHEMES.map((scheme) => (
                    <button
                      key={scheme.id}
                      onClick={() => setSelectedScheme(scheme)}
                      className={`w-full text-left p-3 rounded-xl border text-xs font-bold transition-all ${
                        selectedScheme?.id === scheme.id
                          ? "border-primary bg-primary-soft/40 text-foreground"
                          : "border-border bg-card text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <p className="truncate text-foreground font-extrabold">{scheme.name}</p>
                      <p className="text-[11px] text-muted-foreground">{scheme.category} · {scheme.governmentLevel}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Rules Breakdown */}
              {selectedScheme && (
                <div className="lg:col-span-8 surface-card p-5 space-y-5 border-border bg-muted/20">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div>
                      <h3 className="text-base font-extrabold text-foreground">{selectedScheme.name}</h3>
                      <p className="text-xs text-muted-foreground">{selectedScheme.department}</p>
                    </div>
                    <span className="text-xs font-bold text-teal">{selectedScheme.benefitSummary}</span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <h4 className="font-extrabold text-foreground uppercase tracking-wider text-[11px]">
                      Configured Criteria Rules:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-card border border-border">
                        <span className="text-muted-foreground block font-semibold">Age Range:</span>
                        <span className="font-bold text-foreground">
                          {selectedScheme.eligibility.ageMin ?? 0} to {selectedScheme.eligibility.ageMax ?? "Any"} Years
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-card border border-border">
                        <span className="text-muted-foreground block font-semibold">Income Ceiling:</span>
                        <span className="font-bold text-foreground">
                          {selectedScheme.eligibility.incomeMax
                            ? `Up to ₹${selectedScheme.eligibility.incomeMax.toLocaleString("en-IN")} / yr`
                            : "No Income Limit"}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-card border border-border">
                        <span className="text-muted-foreground block font-semibold">Allowed States:</span>
                        <span className="font-bold text-foreground">
                          {selectedScheme.eligibility.states?.join(", ") || "All India"}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-card border border-border">
                        <span className="text-muted-foreground block font-semibold">Qualifying Education:</span>
                        <span className="font-bold text-foreground">
                          {selectedScheme.eligibility.education?.join(", ") || "Any Education Level"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Required Documents List */}
                  <div className="space-y-2 pt-2 text-xs">
                    <h4 className="font-extrabold text-foreground uppercase tracking-wider text-[11px]">
                      Mandatory Document Checklist:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedScheme.requiredDocuments.map((doc, idx) => (
                        <span
                          key={idx}
                          className="rounded-xl border border-primary/30 bg-primary-soft/30 px-3 py-1 text-xs font-bold text-foreground flex items-center gap-1.5"
                        >
                          <FileCheck2 className="size-3.5 text-primary" />
                          {doc}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
