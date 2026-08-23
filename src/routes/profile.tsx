import { useState, useEffect } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { User, Sparkles, CheckCircle2, RotateCcw, UserCheck, ShieldAlert, ArrowRight, ShieldCheck, ChevronRight } from "lucide-react";
import { toast } from "sonner";

import { AppLayout } from "@/components/layout/AppLayout";
import { useAppStore } from "@/state/app-store";
import { DEMO_PROFILE } from "@/services/profileService";
import type { UserProfile, AreaType, EducationLevel, Occupation, EmploymentStatus, Gender } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/profile")({
  component: CitizenProfilePage,
});

const STATES = [
  "Telangana",
  "Andhra Pradesh",
  "Karnataka",
  "Maharashtra",
  "Tamil Nadu",
  "Delhi",
  "Uttar Pradesh",
  "Kerala",
  "Gujarat",
  "Rajasthan",
  "West Bengal",
  "Madhya Pradesh",
  "Punjab",
  "Haryana",
  "Bihar",
  "Odisha",
  "Assam",
];

function CitizenProfilePage() {
  const navigate = useNavigate();
  const { profile, profileCompleteness, saveProfile, loadDemoProfile, resetAll } = useAppStore();

  const [formData, setFormData] = useState<UserProfile>(
    profile || {
      name: "",
      age: null,
      gender: "Male",
      state: "Telangana",
      district: "Hyderabad",
      areaType: "Urban",
      occupation: "Student",
      educationLevel: "Undergraduate",
      course: "B.Tech Computer Science",
      isStudent: true,
      annualIncome: 250000,
      employmentStatus: "Student",
      isFarmer: false,
      landHoldingAcres: null,
      hasDisability: false,
      isSeniorCitizen: false,
      updatedAt: new Date().toISOString(),
    }
  );

  useEffect(() => {
    if (profile) setFormData(profile);
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Please provide your name.");
      return;
    }
    try {
      await saveProfile(formData);
      toast.success("Profile updated! Recommendations recalibrated.", {
        description: "Your personalized matching signals have been refreshed.",
      });
      navigate({ to: "/recommendations" });
    } catch {
      toast.error("Failed to update profile.");
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-teal">Citizen Attributes</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-1">
              My Benefit Profile
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Update your demographic, economic, and educational details to refine recommendation precision.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={loadDemoProfile}
              className="rounded-xl text-xs font-semibold gap-1.5 border-teal/30 bg-teal-soft/40 text-teal-foreground hover:bg-teal-soft"
            >
              <UserCheck className="size-3.5 text-teal" />
              <span>Load Demo Preset</span>
            </Button>
          </div>
        </div>

        {/* Profile Completeness Bar */}
        <div className="surface-card p-5 space-y-3 shadow-sm border-primary/20 bg-primary-soft/10">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-foreground">Profile Completeness</span>
            <span className="text-base font-extrabold text-primary tabular-nums">{profileCompleteness}%</span>
          </div>
          <Progress value={profileCompleteness} className="h-2 rounded-full" />
          <p className="text-xs text-muted-foreground">
            Higher completeness enables BENEFITX to evaluate all eligibility rules with high confidence.
          </p>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSave} className="surface-card p-6 sm:p-8 space-y-6 shadow-sm">
          {/* Section 1: Demographics */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-foreground border-b border-border pb-2">
              1. Basic Demographics
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="prof-name" className="text-xs font-bold">
                  Full Name *
                </Label>
                <Input
                  id="prof-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Aarav Reddy"
                  className="rounded-xl h-10"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="prof-age" className="text-xs font-bold">
                    Age (Years) *
                  </Label>
                  <Input
                    id="prof-age"
                    type="number"
                    min={1}
                    max={120}
                    value={formData.age === null ? "" : formData.age}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        age: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    className="rounded-xl h-10"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Gender</Label>
                  <Select
                    value={formData.gender || "Male"}
                    onValueChange={(val) => setFormData({ ...formData, gender: val as Gender })}
                  >
                    <SelectTrigger className="rounded-xl h-10 text-xs">
                      <SelectValue placeholder="Gender" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                      <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">State / Union Territory *</Label>
                <Select
                  value={formData.state || "Telangana"}
                  onValueChange={(val) => setFormData({ ...formData, state: val })}
                >
                  <SelectTrigger className="rounded-xl h-10 text-xs">
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl max-h-52">
                    {STATES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="prof-district" className="text-xs font-bold">
                  District
                </Label>
                <Input
                  id="prof-district"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  placeholder="e.g. Hyderabad"
                  className="rounded-xl h-10"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-bold">Area Type</Label>
                <RadioGroup
                  value={formData.areaType || "Urban"}
                  onValueChange={(val) => setFormData({ ...formData, areaType: val as AreaType })}
                  className="grid grid-cols-2 gap-3"
                >
                  <div className="flex items-center space-x-2 border rounded-xl p-2.5 cursor-pointer">
                    <RadioGroupItem value="Urban" id="p-urban" />
                    <Label htmlFor="p-urban" className="text-xs font-semibold cursor-pointer">
                      Urban (City / Municipality)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-xl p-2.5 cursor-pointer">
                    <RadioGroupItem value="Rural" id="p-rural" />
                    <Label htmlFor="p-rural" className="text-xs font-semibold cursor-pointer">
                      Rural (Gram Panchayat)
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>

          {/* Section 2: Education */}
          <div className="space-y-4 pt-2">
            <h2 className="text-base font-bold text-foreground border-b border-border pb-2">
              2. Education & Academics
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Education Level</Label>
                <Select
                  value={formData.educationLevel || "Undergraduate"}
                  onValueChange={(val) => setFormData({ ...formData, educationLevel: val as EducationLevel })}
                >
                  <SelectTrigger className="rounded-xl h-10 text-xs">
                    <SelectValue placeholder="Education Level" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="Below 10th">Below 10th</SelectItem>
                    <SelectItem value="10th Pass">10th Pass</SelectItem>
                    <SelectItem value="12th Pass">12th Pass</SelectItem>
                    <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                    <SelectItem value="Graduate">Graduate</SelectItem>
                    <SelectItem value="Postgraduate">Postgraduate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="prof-course" className="text-xs font-bold">
                  Course / Major
                </Label>
                <Input
                  id="prof-course"
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  placeholder="e.g. B.Tech Computer Science"
                  className="rounded-xl h-10"
                />
              </div>

              <div className="sm:col-span-2 flex items-center justify-between rounded-xl border p-3 bg-muted/20">
                <div>
                  <Label htmlFor="p-student" className="text-xs font-bold">
                    Currently Enrolled Student
                  </Label>
                  <p className="text-[11px] text-muted-foreground">
                    Matches merit scholarships and laptop grants.
                  </p>
                </div>
                <Switch
                  id="p-student"
                  checked={formData.isStudent}
                  onCheckedChange={(checked) => setFormData({ ...formData, isStudent: checked })}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Occupation & Income */}
          <div className="space-y-4 pt-2">
            <h2 className="text-base font-bold text-foreground border-b border-border pb-2">
              3. Occupation & Economic Profile
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Primary Occupation</Label>
                <Select
                  value={formData.occupation || "Student"}
                  onValueChange={(val) =>
                    setFormData({
                      ...formData,
                      occupation: val as Occupation,
                      isFarmer: val === "Farmer",
                    })
                  }
                >
                  <SelectTrigger className="rounded-xl h-10 text-xs">
                    <SelectValue placeholder="Select Occupation" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="Student">Student</SelectItem>
                    <SelectItem value="Farmer">Farmer</SelectItem>
                    <SelectItem value="Salaried">Salaried</SelectItem>
                    <SelectItem value="Self-employed">Self-employed</SelectItem>
                    <SelectItem value="Daily wage worker">Daily wage worker</SelectItem>
                    <SelectItem value="Unemployed">Unemployed</SelectItem>
                    <SelectItem value="Homemaker">Homemaker</SelectItem>
                    <SelectItem value="Retired">Retired</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Annual Family Income</Label>
                <Select
                  value={String(formData.annualIncome ?? 250000)}
                  onValueChange={(val) => setFormData({ ...formData, annualIncome: Number(val) })}
                >
                  <SelectTrigger className="rounded-xl h-10 text-xs">
                    <SelectValue placeholder="Income Range" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="100000">Below ₹1,00,000 / year (BPL)</SelectItem>
                    <SelectItem value="250000">₹1,00,000 – ₹2,50,000 / year</SelectItem>
                    <SelectItem value="500000">₹2,50,000 – ₹5,00,000 / year</SelectItem>
                    <SelectItem value="800000">₹5,00,000 – ₹8,00,000 / year (EWS limit)</SelectItem>
                    <SelectItem value="1500000">Above ₹8,00,000 / year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="sm:col-span-2 flex items-center justify-between rounded-xl border p-3 bg-muted/20">
                <div>
                  <Label htmlFor="p-farmer" className="text-xs font-bold">
                    Agricultural Landholding Family
                  </Label>
                  <p className="text-[11px] text-muted-foreground">
                    Matches PM Kisan, Rythu Bandhu, and crop insurance benefits.
                  </p>
                </div>
                <Switch
                  id="p-farmer"
                  checked={formData.isFarmer}
                  onCheckedChange={(checked) => setFormData({ ...formData, isFarmer: checked })}
                />
              </div>
            </div>
          </div>

          {/* Section 4: Special Categories */}
          <div className="space-y-4 pt-2">
            <h2 className="text-base font-bold text-foreground border-b border-border pb-2">
              4. Special Categories
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border p-3 bg-muted/20">
                <div>
                  <Label htmlFor="p-pwd" className="text-xs font-bold">
                    Person with Benchmark Disability (PwD)
                  </Label>
                  <p className="text-[11px] text-muted-foreground">
                    Unlocks assistive aids and specialized pensions.
                  </p>
                </div>
                <Switch
                  id="p-pwd"
                  checked={formData.hasDisability}
                  onCheckedChange={(checked) => setFormData({ ...formData, hasDisability: checked })}
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border p-3 bg-muted/20">
                <div>
                  <Label htmlFor="p-senior" className="text-xs font-bold">
                    Senior Citizen (60+ Years)
                  </Label>
                  <p className="text-[11px] text-muted-foreground">
                    Unlocks old age security and pension schemes.
                  </p>
                </div>
                <Switch
                  id="p-senior"
                  checked={formData.isSeniorCitizen || (formData.age !== null && formData.age >= 60)}
                  onCheckedChange={(checked) => setFormData({ ...formData, isSeniorCitizen: checked })}
                />
              </div>
            </div>
          </div>

          {/* Save Action */}
          <div className="pt-4 border-t border-border flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={resetAll}
              className="text-xs font-semibold text-muted-foreground hover:text-destructive"
            >
              <RotateCcw className="size-3.5 mr-1" />
              <span>Reset Profile</span>
            </Button>

            <Button type="submit" size="lg" className="rounded-xl font-bold gap-2 shadow-sm">
              <Sparkles className="size-4" />
              <span>Update Recommendations</span>
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
