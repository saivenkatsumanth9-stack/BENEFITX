import { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { User, CheckCircle2, UserCheck, ShieldCheck, ArrowRight, RotateCcw } from "lucide-react";
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
      toast.error("Please enter your full name.");
      return;
    }
    try {
      await saveProfile(formData);
      toast.success("Citizen profile updated successfully.", {
        description: "Matching scores have been recalculated.",
      });
      navigate({ to: "/recommendations" });
    } catch {
      toast.error("Failed to update profile.");
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Citizen Attributes
              </span>
              <span className="text-muted-foreground text-xs">·</span>
              <span className="text-xs font-semibold text-primary">
                {profileCompleteness}% Complete
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              My Citizen Profile
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Maintain your demographic, educational, and economic criteria to receive accurate welfare matches.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadDemoProfile}
              className="h-8 rounded-lg text-xs font-semibold gap-1.5 border-border bg-card"
            >
              <UserCheck className="size-3.5 text-primary" />
              <span>Load Preset Profile</span>
            </Button>
          </div>
        </div>

        {/* Profile Completeness Card */}
        <div className="surface-card p-4 space-y-2 bg-card border-border">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground">Profile Completeness Status</span>
            <span className="font-bold text-primary tabular-nums">{profileCompleteness}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${profileCompleteness}%` }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            Complete all fields below for high-confidence eligibility matching against central and state rules.
          </p>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: Demographics */}
          <div className="surface-card p-5 sm:p-6 space-y-4 bg-card">
            <h3 className="text-sm font-bold text-foreground border-b border-border/80 pb-2">
              1. Personal Information
            </h3>

            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-semibold">Full Legal Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Aarav Reddy"
                  className="h-9 rounded-lg text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="age" className="text-xs font-semibold">Age (Years) *</Label>
                <Input
                  id="age"
                  type="number"
                  min="0"
                  max="120"
                  value={formData.age === null ? "" : formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value ? Number(e.target.value) : null })}
                  placeholder="e.g. 21"
                  className="h-9 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <Label className="text-xs font-semibold">Gender</Label>
              <RadioGroup
                value={formData.gender}
                onValueChange={(val) => setFormData({ ...formData, gender: val as Gender })}
                className="flex items-center gap-6 pt-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Male" id="male" />
                  <Label htmlFor="male" className="text-xs font-normal cursor-pointer">Male</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Female" id="female" />
                  <Label htmlFor="female" className="text-xs font-normal cursor-pointer">Female</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Transgender" id="trans" />
                  <Label htmlFor="trans" className="text-xs font-normal cursor-pointer">Transgender</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Section 2: Location */}
          <div className="surface-card p-5 sm:p-6 space-y-4 bg-card">
            <h3 className="text-sm font-bold text-foreground border-b border-border/80 pb-2">
              2. Location & Domicile
            </h3>

            <div className="grid sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1.5">
                <Label htmlFor="state" className="text-xs font-semibold">Domicile State *</Label>
                <Select
                  value={formData.state}
                  onValueChange={(val) => setFormData({ ...formData, state: val })}
                >
                  <SelectTrigger className="h-9 rounded-lg text-xs">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATES.map((st) => (
                      <SelectItem key={st} value={st} className="text-xs">
                        {st}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="district" className="text-xs font-semibold">District</Label>
                <Input
                  id="district"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  placeholder="e.g. Hyderabad"
                  className="h-9 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Area Type</Label>
                <Select
                  value={formData.areaType}
                  onValueChange={(val) => setFormData({ ...formData, areaType: val as AreaType })}
                >
                  <SelectTrigger className="h-9 rounded-lg text-xs">
                    <SelectValue placeholder="Area type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Urban" className="text-xs">Urban / Metropolitan</SelectItem>
                    <SelectItem value="Rural" className="text-xs">Rural / Village</SelectItem>
                    <SelectItem value="Semi-Urban" className="text-xs">Semi-Urban / Town</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Section 3: Education & Occupation */}
          <div className="surface-card p-5 sm:p-6 space-y-4 bg-card">
            <h3 className="text-sm font-bold text-foreground border-b border-border/80 pb-2">
              3. Education, Employment & Income
            </h3>

            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Highest Education Level</Label>
                <Select
                  value={formData.educationLevel}
                  onValueChange={(val) => setFormData({ ...formData, educationLevel: val as EducationLevel })}
                >
                  <SelectTrigger className="h-9 rounded-lg text-xs">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Below 10th" className="text-xs">Below 10th</SelectItem>
                    <SelectItem value="10th Pass" className="text-xs">10th Standard / Matriculation</SelectItem>
                    <SelectItem value="12th Pass" className="text-xs">12th Standard / Intermediate</SelectItem>
                    <SelectItem value="Diploma" className="text-xs">Diploma / ITI</SelectItem>
                    <SelectItem value="Undergraduate" className="text-xs">Undergraduate Degree (B.Tech, B.Sc, BA, etc.)</SelectItem>
                    <SelectItem value="Postgraduate" className="text-xs">Postgraduate Degree (M.Tech, M.Sc, etc.)</SelectItem>
                    <SelectItem value="Doctorate" className="text-xs">Doctorate / Ph.D.</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="course" className="text-xs font-semibold">Current Course / Specialization</Label>
                <Input
                  id="course"
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  placeholder="e.g. B.Tech Computer Science"
                  className="h-9 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Primary Occupation</Label>
                <Select
                  value={formData.occupation}
                  onValueChange={(val) => setFormData({ ...formData, occupation: val as Occupation })}
                >
                  <SelectTrigger className="h-9 rounded-lg text-xs">
                    <SelectValue placeholder="Select occupation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Student" className="text-xs">Student / Scholar</SelectItem>
                    <SelectItem value="Farmer" className="text-xs">Farmer / Cultivator</SelectItem>
                    <SelectItem value="Salaried" className="text-xs">Salaried (Private / Public)</SelectItem>
                    <SelectItem value="Self-Employed" className="text-xs">Self-Employed / Business Owner</SelectItem>
                    <SelectItem value="Daily Wage" className="text-xs">Daily Wage / Informal Worker</SelectItem>
                    <SelectItem value="Artisan" className="text-xs">Artisan / Traditional Craft</SelectItem>
                    <SelectItem value="Unemployed" className="text-xs">Unemployed / Job Seeker</SelectItem>
                    <SelectItem value="Retired" className="text-xs">Retired / Pensioner</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="income" className="text-xs font-semibold">Annual Family Income (₹ INR) *</Label>
                <Input
                  id="income"
                  type="number"
                  min="0"
                  step="10000"
                  value={formData.annualIncome === null ? "" : formData.annualIncome}
                  onChange={(e) => setFormData({ ...formData, annualIncome: e.target.value ? Number(e.target.value) : null })}
                  placeholder="e.g. 250000"
                  className="h-9 rounded-lg text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Special Welfare Criteria */}
          <div className="surface-card p-5 sm:p-6 space-y-4 bg-card">
            <h3 className="text-sm font-bold text-foreground border-b border-border/80 pb-2">
              4. Special Criteria & Social Attributes
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="space-y-0.5">
                  <Label htmlFor="is-student" className="text-xs font-semibold cursor-pointer">Enrolled as Full-Time Student</Label>
                  <p className="text-[11px] text-muted-foreground">Eligible for educational scholarships, stipends, and laptop grants.</p>
                </div>
                <Switch
                  id="is-student"
                  checked={formData.isStudent}
                  onCheckedChange={(val) => setFormData({ ...formData, isStudent: val })}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="space-y-0.5">
                  <Label htmlFor="is-farmer" className="text-xs font-semibold cursor-pointer">Agricultural Landholder / Farmer</Label>
                  <p className="text-[11px] text-muted-foreground">Eligible for PM-Kisan, crop insurance, and Kisan Credit Card schemes.</p>
                </div>
                <Switch
                  id="is-farmer"
                  checked={formData.isFarmer}
                  onCheckedChange={(val) => setFormData({ ...formData, isFarmer: val })}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="space-y-0.5">
                  <Label htmlFor="has-disability" className="text-xs font-semibold cursor-pointer">Person with Benchmark Disability (PwD)</Label>
                  <p className="text-[11px] text-muted-foreground">Eligible for assistive devices, special scholarships, and priority reservations.</p>
                </div>
                <Switch
                  id="has-disability"
                  checked={formData.hasDisability}
                  onCheckedChange={(val) => setFormData({ ...formData, hasDisability: val })}
                />
              </div>
            </div>
          </div>

          {/* Save Action Footer */}
          <div className="flex items-center justify-between gap-4 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={resetAll}
              className="h-9 text-xs text-muted-foreground hover:text-destructive gap-1"
            >
              <RotateCcw className="size-3.5" />
              <span>Reset Profile</span>
            </Button>

            <Button type="submit" className="h-9 px-5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground gap-1.5 shadow-sm">
              <span>Save & Recalculate Matches</span>
              <ArrowRight className="size-3.5" />
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
