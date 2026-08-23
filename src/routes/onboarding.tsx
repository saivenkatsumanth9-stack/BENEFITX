import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  User,
  GraduationCap,
  Briefcase,
  ShieldAlert,
  Building,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";

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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { useAppStore } from "@/state/app-store";
import type { UserProfile, AreaType, EducationLevel, Occupation, EmploymentStatus, Gender } from "@/lib/types";

export const Route = createFileRoute("/onboarding")({
  component: OnboardingPage,
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

function OnboardingPage() {
  const navigate = useNavigate();
  const { profile, saveProfile, loadDemoProfile } = useAppStore();

  const [step, setStep] = useState(1);
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

  const handleNext = () => {
    if (step === 1 && !formData.name.trim()) {
      toast.error("Please enter your name to personalize recommendations.");
      return;
    }
    if (step === 1 && (!formData.age || formData.age < 1 || formData.age > 120)) {
      toast.error("Please enter a valid age.");
      return;
    }
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleComplete = async () => {
    try {
      await saveProfile(formData);
      toast.success("Profile saved! Finding your opportunities...");
      navigate({ to: "/dashboard" });
    } catch {
      toast.error("Failed to save profile. Please try again.");
    }
  };

  const handleDemoPreset = async () => {
    await loadDemoProfile();
    toast.success("Demo profile loaded!");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-primary/20 selection:text-primary">
      {/* Header */}
      <header className="border-b border-border/80 bg-card py-4 px-4 sm:px-8">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="BENEFITX Logo"
              className="size-8 rounded-xl object-contain shadow-xs"
            />
            <span className="font-extrabold text-lg tracking-tight">BENEFITX</span>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDemoPreset}
            className="rounded-xl text-xs font-semibold gap-1 text-teal border-teal/30 bg-teal-soft/40 hover:bg-teal-soft"
          >
            <UserCheck className="size-3.5 text-teal" />
            <span>Use Demo Profile</span>
          </Button>
        </div>
      </header>

      {/* Main Wizard Form */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-xl surface-card p-6 sm:p-8 shadow-xl space-y-6">
          {/* Progress Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <span>Step {step} of 4</span>
              <span className="text-primary font-extrabold">
                {step === 1
                  ? "Basic Demographics"
                  : step === 2
                    ? "Education & Qualifications"
                    : step === 3
                      ? "Economic Profile"
                      : "Additional Factors"}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>

          {/* Form Step Contents */}
          <div className="space-y-4 min-h-[300px]">
            {/* STEP 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in-50 duration-200">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-foreground">Tell us about yourself</h2>
                  <p className="text-xs text-muted-foreground">
                    This information is used locally to filter government scheme age and residency criteria.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs font-bold">
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      placeholder="e.g. Aarav Reddy"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="rounded-xl h-10"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="age" className="text-xs font-bold">
                        Age (Years) *
                      </Label>
                      <Input
                        id="age"
                        type="number"
                        min={1}
                        max={120}
                        placeholder="e.g. 21"
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

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold">State / Union Territory *</Label>
                      <Select
                        value={formData.state || "Telangana"}
                        onValueChange={(val) => setFormData({ ...formData, state: val })}
                      >
                        <SelectTrigger className="rounded-xl h-10 text-xs">
                          <SelectValue placeholder="State" />
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
                      <Label htmlFor="district" className="text-xs font-bold">
                        District
                      </Label>
                      <Input
                        id="district"
                        placeholder="e.g. Hyderabad"
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        className="rounded-xl h-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">Area Type</Label>
                    <RadioGroup
                      value={formData.areaType || "Urban"}
                      onValueChange={(val) => setFormData({ ...formData, areaType: val as AreaType })}
                      className="grid grid-cols-2 gap-3"
                    >
                      <div className="flex items-center space-x-2 border rounded-xl p-2.5 cursor-pointer">
                        <RadioGroupItem value="Urban" id="urban" />
                        <Label htmlFor="urban" className="text-xs font-semibold cursor-pointer">
                          Urban (City/Town)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-xl p-2.5 cursor-pointer">
                        <RadioGroupItem value="Rural" id="rural" />
                        <Label htmlFor="rural" className="text-xs font-semibold cursor-pointer">
                          Rural (Village)
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Education */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in-50 duration-200">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-foreground">Education & Qualifications</h2>
                  <p className="text-xs text-muted-foreground">
                    Matches academic scholarships, fee subsidies, training stipends, and coaching benefits.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">Highest Education Level *</Label>
                    <Select
                      value={formData.educationLevel || "Undergraduate"}
                      onValueChange={(val) =>
                        setFormData({
                          ...formData,
                          educationLevel: val as EducationLevel,
                          isStudent: val === "Undergraduate" || val === "12th Pass" ? true : formData.isStudent,
                        })
                      }
                    >
                      <SelectTrigger className="rounded-xl h-10 text-xs">
                        <SelectValue placeholder="Select Education Level" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="Below 10th">Below 10th</SelectItem>
                        <SelectItem value="10th Pass">10th Pass</SelectItem>
                        <SelectItem value="12th Pass">12th Pass</SelectItem>
                        <SelectItem value="Undergraduate">Undergraduate (B.Tech, B.Sc, B.Com, BA, etc.)</SelectItem>
                        <SelectItem value="Graduate">Graduate (Completed Degree)</SelectItem>
                        <SelectItem value="Postgraduate">Postgraduate (Master's / Doctorate)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="course" className="text-xs font-bold">
                      Current Course / Specialization
                    </Label>
                    <Input
                      id="course"
                      placeholder="e.g. B.Tech Computer Science / Intermediate"
                      value={formData.course}
                      onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                      className="rounded-xl h-10"
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-xl border p-3 bg-muted/30">
                    <div className="space-y-0.5">
                      <Label htmlFor="student-switch" className="text-xs font-bold">
                        Currently Enrolled Student
                      </Label>
                      <p className="text-[11px] text-muted-foreground">
                        Toggle on if currently pursuing a recognized course.
                      </p>
                    </div>
                    <Switch
                      id="student-switch"
                      checked={formData.isStudent}
                      onCheckedChange={(checked) => setFormData({ ...formData, isStudent: checked })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Economic Profile */}
            {step === 3 && (
              <div className="space-y-4 animate-in fade-in-50 duration-200">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-foreground">Economic & Employment Profile</h2>
                  <p className="text-xs text-muted-foreground">
                    Matches income-targeted welfare schemes, farmer subsidies, and employment programs.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">Occupation *</Label>
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
                        <SelectItem value="Farmer">Farmer / Agriculture</SelectItem>
                        <SelectItem value="Salaried">Salaried (Private / Govt)</SelectItem>
                        <SelectItem value="Self-employed">Self-employed / Business</SelectItem>
                        <SelectItem value="Daily wage worker">Daily Wage / Informal Worker</SelectItem>
                        <SelectItem value="Unemployed">Unemployed / Job Seeker</SelectItem>
                        <SelectItem value="Homemaker">Homemaker</SelectItem>
                        <SelectItem value="Retired">Retired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">Annual Family Income (₹ INR) *</Label>
                    <Select
                      value={String(formData.annualIncome ?? 250000)}
                      onValueChange={(val) =>
                        setFormData({ ...formData, annualIncome: Number(val) })
                      }
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

                  <div className="flex items-center justify-between rounded-xl border p-3 bg-muted/30">
                    <div className="space-y-0.5">
                      <Label htmlFor="farmer-switch" className="text-xs font-bold">
                        Landholding Farmer Family
                      </Label>
                      <p className="text-[11px] text-muted-foreground">
                        Enables PM Kisan, KCC, and agricultural crop credit schemes.
                      </p>
                    </div>
                    <Switch
                      id="farmer-switch"
                      checked={formData.isFarmer}
                      onCheckedChange={(checked) => setFormData({ ...formData, isFarmer: checked })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Additional Information */}
            {step === 4 && (
              <div className="space-y-4 animate-in fade-in-50 duration-200">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-foreground">Additional Special Categories</h2>
                  <p className="text-xs text-muted-foreground">
                    Only required for specialized disability aids and senior citizen pensions.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between rounded-xl border p-3.5 bg-muted/30">
                    <div className="space-y-0.5">
                      <Label htmlFor="disability-switch" className="text-xs font-bold">
                        Person with Benchmark Disability (PwD)
                      </Label>
                      <p className="text-[11px] text-muted-foreground">
                        Unlocks assistive devices, grants, and specialized reservations.
                      </p>
                    </div>
                    <Switch
                      id="disability-switch"
                      checked={formData.hasDisability}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasDisability: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-xl border p-3.5 bg-muted/30">
                    <div className="space-y-0.5">
                      <Label htmlFor="senior-switch" className="text-xs font-bold">
                        Senior Citizen (Age 60+)
                      </Label>
                      <p className="text-[11px] text-muted-foreground">
                        Unlocks old age pensions and social security schemes.
                      </p>
                    </div>
                    <Switch
                      id="senior-switch"
                      checked={formData.isSeniorCitizen || (formData.age !== null && formData.age >= 60)}
                      onCheckedChange={(checked) => setFormData({ ...formData, isSeniorCitizen: checked })}
                    />
                  </div>

                  <div className="rounded-xl border border-primary/20 bg-primary-soft/40 p-3.5 text-xs text-muted-foreground flex items-start gap-2">
                    <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                    <span>
                      <strong>Privacy Notice:</strong> Your information remains stored on your device in demo mode. Only essential criteria are evaluated to match public government guidelines.
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Actions */}
          <div className="pt-4 border-t border-border flex items-center justify-between gap-3">
            {step > 1 ? (
              <Button
                variant="outline"
                onClick={handleBack}
                className="rounded-xl text-xs font-semibold gap-1.5 h-10 px-4"
              >
                <ArrowLeft className="size-3.5" />
                <span>Back</span>
              </Button>
            ) : (
              <Button asChild variant="ghost" className="rounded-xl text-xs font-semibold text-muted-foreground">
                <Link to="/">Cancel</Link>
              </Button>
            )}

            <Button
              onClick={handleNext}
              className="rounded-xl text-xs font-bold gap-2 h-10 px-5 shadow-sm"
            >
              <span>{step === 4 ? "Find My Opportunities" : "Continue"}</span>
              <ArrowRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </main>

      {/* Footer disclaimer */}
      <footer className="py-4 text-center text-xs text-muted-foreground border-t border-border">
        <span>BENEFITX Citizen Decision Support · Non-governmental advisory platform</span>
      </footer>
    </div>
  );
}
