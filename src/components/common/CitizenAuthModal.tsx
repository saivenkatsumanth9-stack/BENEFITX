import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppStore } from "@/state/app-store";
import { DEMO_PROFILE } from "@/services/profileService";
import type { UserProfile } from "@/lib/types";
import { toast } from "sonner";
import {
  User,
  GraduationCap,
  Tractor,
  Briefcase,
  KeyRound,
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Lock,
} from "lucide-react";

interface CitizenAuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PRESET_USERS = [
  {
    name: "Aarav Reddy",
    role: "Student (Undergraduate)",
    email: "aarav.reddy@student.in",
    password: "password123",
    state: "Telangana",
    income: "₹2,50,000 / yr",
    icon: GraduationCap,
    profile: DEMO_PROFILE,
  },
  {
    name: "Rajesh Kumar",
    role: "Farmer (3 Acres Landholding)",
    email: "rajesh.farmer@agri.in",
    password: "password123",
    state: "Andhra Pradesh",
    income: "₹1,20,000 / yr",
    icon: Tractor,
    profile: {
      ...DEMO_PROFILE,
      name: "Rajesh Kumar",
      age: 44,
      gender: "Male" as const,
      state: "Andhra Pradesh",
      district: "Guntur",
      areaType: "Rural" as const,
      occupation: "Farmer" as const,
      educationLevel: "10th Pass" as const,
      isStudent: false,
      isFarmer: true,
      landHoldingAcres: 3,
      annualIncome: 120000,
      employmentStatus: "Self-employed" as const,
    },
  },
  {
    name: "Sunita Devi",
    role: "Micro-Entrepreneur (Self-Employed)",
    email: "sunita.crafts@msme.in",
    password: "password123",
    state: "Maharashtra",
    income: "₹1,80,000 / yr",
    icon: Briefcase,
    profile: {
      ...DEMO_PROFILE,
      name: "Sunita Devi",
      age: 34,
      gender: "Female" as const,
      state: "Maharashtra",
      district: "Pune",
      areaType: "Urban" as const,
      occupation: "Self-employed" as const,
      educationLevel: "12th Pass" as const,
      isStudent: false,
      isFarmer: false,
      annualIncome: 180000,
      employmentStatus: "Self-employed" as const,
    },
  },
];

export function CitizenAuthModal({ open, onOpenChange }: CitizenAuthModalProps) {
  const { saveProfile } = useAppStore();
  const [email, setEmail] = useState("aarav.reddy@student.in");
  const [password, setPassword] = useState("password123");
  const [phone, setPhone] = useState("9876543210");
  const [otp, setOtp] = useState("123456");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Find matching preset or create citizen profile from email
      const matched = PRESET_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
      const targetProfile: UserProfile = matched
        ? matched.profile
        : {
            ...DEMO_PROFILE,
            name: email.split("@")[0] || "Citizen User",
            updatedAt: new Date().toISOString(),
          };

      await saveProfile(targetProfile);
      toast.success(`Welcome back, ${targetProfile.name}!`, {
        description: "Your personalized scheme recommendations have been loaded.",
      });
      onOpenChange(false);
    } catch {
      toast.error("Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpSent) {
      if (phone.length < 10) {
        toast.error("Please enter a valid 10-digit mobile number.");
        return;
      }
      setOtpSent(true);
      toast.info(`OTP sent to +91 ${phone}`, { description: "Use demo OTP: 123456" });
      return;
    }

    setLoading(true);
    try {
      const targetProfile: UserProfile = {
        ...DEMO_PROFILE,
        name: `Citizen (+91 ${phone.slice(0, 5)}***)`,
        updatedAt: new Date().toISOString(),
      };
      await saveProfile(targetProfile);
      toast.success("Mobile Verified Successfully!", {
        description: "Logged in via Citizen Mobile OTP.",
      });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const handlePresetLogin = async (preset: (typeof PRESET_USERS)[0]) => {
    setLoading(true);
    try {
      await saveProfile(preset.profile);
      toast.success(`Logged in as ${preset.name}`, {
        description: `${preset.role} · ${preset.state}`,
      });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl p-6 space-y-4">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
            <ShieldCheck className="size-4" />
            <span>Citizen Authentication Gateway</span>
          </div>
          <DialogTitle className="text-xl font-black text-foreground">
            Sign In to BENEFITX
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Access your personalized welfare scheme matches, document locker, and application readiness.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="presets" className="w-full space-y-4">
          <TabsList className="grid grid-cols-3 w-full rounded-xl bg-muted p-1">
            <TabsTrigger value="presets" className="rounded-lg text-xs font-bold">
              1-Click Demo
            </TabsTrigger>
            <TabsTrigger value="email" className="rounded-lg text-xs font-bold">
              Email / Password
            </TabsTrigger>
            <TabsTrigger value="mobile" className="rounded-lg text-xs font-bold">
              Mobile OTP
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: 1-Click Quick Presets */}
          <TabsContent value="presets" className="space-y-3">
            <p className="text-[11px] font-semibold text-muted-foreground">
              Select an official demo persona to test personalized matching:
            </p>
            <div className="space-y-2">
              {PRESET_USERS.map((preset) => {
                const Icon = preset.icon;
                return (
                  <button
                    key={preset.email}
                    onClick={() => handlePresetLogin(preset)}
                    disabled={loading}
                    className="w-full text-left p-3 rounded-2xl border border-border bg-card hover:bg-muted/50 hover:border-primary/40 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Icon className="size-4.5" />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-foreground">{preset.name}</p>
                        <p className="text-[11px] text-muted-foreground">{preset.role}</p>
                        <p className="text-[10px] text-teal font-semibold">
                          {preset.state} · Income: {preset.income}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-primary bg-primary-soft px-2.5 py-1 rounded-xl shrink-0">
                      Sign In →
                    </span>
                  </button>
                );
              })}
            </div>
          </TabsContent>

          {/* TAB 2: Email & Password */}
          <TabsContent value="email" className="space-y-4">
            <form onSubmit={handleCustomLogin} className="space-y-3.5">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Citizen Email Address</Label>
                <div className="relative">
                  <Mail className="size-4 absolute left-3 top-2.5 text-muted-foreground" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="pl-9 h-9 text-xs rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Password</Label>
                <div className="relative">
                  <Lock className="size-4 absolute left-3 top-2.5 text-muted-foreground" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="pl-9 h-9 text-xs rounded-xl"
                  />
                </div>
              </div>

              <div className="rounded-xl bg-muted/40 p-2.5 text-[11px] text-muted-foreground space-y-1 border border-border">
                <p className="font-bold text-foreground">💡 Quick Demo Credentials:</p>
                <p>Email: <code className="text-primary font-bold">aarav.reddy@student.in</code></p>
                <p>Password: <code className="text-primary font-bold">password123</code></p>
              </div>

              <Button type="submit" disabled={loading} className="w-full rounded-xl text-xs font-bold h-9">
                {loading ? "Verifying..." : "Sign In to Account"}
              </Button>
            </form>
          </TabsContent>

          {/* TAB 3: Mobile OTP */}
          <TabsContent value="mobile" className="space-y-4">
            <form onSubmit={handleOtpLogin} className="space-y-3.5">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Mobile Number (+91)</Label>
                <div className="relative">
                  <Phone className="size-4 absolute left-3 top-2.5 text-muted-foreground" />
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    maxLength={10}
                    disabled={otpSent}
                    required
                    className="pl-9 h-9 text-xs rounded-xl"
                  />
                </div>
              </div>

              {otpSent && (
                <div className="space-y-1.5 animate-in fade-in">
                  <Label className="text-xs font-bold">Enter 6-Digit OTP</Label>
                  <div className="relative">
                    <KeyRound className="size-4 absolute left-3 top-2.5 text-muted-foreground" />
                    <Input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="123456"
                      maxLength={6}
                      required
                      className="pl-9 h-9 text-xs rounded-xl font-mono tracking-widest"
                    />
                  </div>
                  <p className="text-[10px] text-teal font-semibold">Demo OTP: 123456</p>
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full rounded-xl text-xs font-bold h-9">
                {loading ? "Verifying..." : otpSent ? "Verify & Sign In" : "Send Login OTP"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
