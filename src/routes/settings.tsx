import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Settings, Globe, Bell, Shield, Moon, Sun, Trash2, UserCheck, RotateCcw, Check } from "lucide-react";
import { toast } from "sonner";

import { AppLayout } from "@/components/layout/AppLayout";
import { useAppStore } from "@/state/app-store";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { loadDemoProfile, resetAll } = useAppStore();
  const [language, setLanguage] = useState("en");
  const [schemeAlerts, setSchemeAlerts] = useState(true);
  const [readinessAlerts, setReadinessAlerts] = useState(true);
  const [deadlineAlerts, setDeadlineAlerts] = useState(true);
  const [highContrast, setHighContrast] = useState(false);

  const handleSavePreferences = () => {
    toast.success("Preferences updated successfully.");
  };

  const handleReset = async () => {
    await resetAll();
    toast.success("All local demo data cleared.");
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-teal">Preferences</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-1">
              Settings & Configuration
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Customize language, alert notifications, data privacy, and accessibility options.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Language & Regional */}
          <div className="surface-card p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2.5 font-bold text-foreground">
              <Globe className="size-5 text-primary" />
              <h2 className="text-base">Language & Regional Preferences</h2>
            </div>
            <div className="max-w-sm space-y-1.5">
              <Label className="text-xs font-bold">Portal Display Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="rounded-xl h-10 text-xs">
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="en">English (Default)</SelectItem>
                  <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                  <SelectItem value="te">తెలుగు (Telugu)</SelectItem>
                  <SelectItem value="ta">தமிழ் (Tamil)</SelectItem>
                  <SelectItem value="mr">मराठी (Marathi)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notifications Preferences */}
          <div className="surface-card p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2.5 font-bold text-foreground">
              <Bell className="size-5 text-teal" />
              <h2 className="text-base">Notification Preferences</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border p-3.5 bg-muted/20">
                <div>
                  <Label className="text-xs font-bold">New Scheme Matches</Label>
                  <p className="text-[11px] text-muted-foreground">
                    Alert when a new government notification matches your criteria.
                  </p>
                </div>
                <Switch checked={schemeAlerts} onCheckedChange={setSchemeAlerts} />
              </div>

              <div className="flex items-center justify-between rounded-xl border p-3.5 bg-muted/20">
                <div>
                  <Label className="text-xs font-bold">Application Readiness Updates</Label>
                  <p className="text-[11px] text-muted-foreground">
                    Notify when uploaded documents boost your readiness score.
                  </p>
                </div>
                <Switch checked={readinessAlerts} onCheckedChange={setReadinessAlerts} />
              </div>

              <div className="flex items-center justify-between rounded-xl border p-3.5 bg-muted/20">
                <div>
                  <Label className="text-xs font-bold">Application Deadline Warnings</Label>
                  <p className="text-[11px] text-muted-foreground">
                    Reminders 7 days before scholarship/grant portals close.
                  </p>
                </div>
                <Switch checked={deadlineAlerts} onCheckedChange={setDeadlineAlerts} />
              </div>
            </div>
          </div>

          {/* Accessibility */}
          <div className="surface-card p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2.5 font-bold text-foreground">
              <Shield className="size-5 text-saffron" />
              <h2 className="text-base">Accessibility & Display</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border p-3.5 bg-muted/20">
                <div>
                  <Label className="text-xs font-bold">High Contrast Mode</Label>
                  <p className="text-[11px] text-muted-foreground">
                    Enhance text sharpness and visual boundary contrast for high readability.
                  </p>
                </div>
                <Switch checked={highContrast} onCheckedChange={setHighContrast} />
              </div>
            </div>
          </div>

          {/* Data & Privacy */}
          <div className="surface-card p-6 space-y-4 shadow-sm border-destructive/20">
            <div className="flex items-center gap-2.5 font-bold text-foreground">
              <Shield className="size-5 text-destructive" />
              <h2 className="text-base">Data Management & Demo Tools</h2>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              BENEFITX operates frontend-first. All profile, document, and saved scheme data is stored locally in your browser storage.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                variant="outline"
                onClick={loadDemoProfile}
                className="rounded-xl text-xs font-bold gap-1 text-teal border-teal/30 bg-teal-soft/40 hover:bg-teal-soft"
              >
                <UserCheck className="size-3.5 text-teal" />
                <span>Reload Demo Persona</span>
              </Button>
              <Button
                variant="destructive"
                onClick={handleReset}
                className="rounded-xl text-xs font-bold gap-1.5"
              >
                <Trash2 className="size-3.5" />
                <span>Clear All Stored Data</span>
              </Button>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <Button onClick={handleSavePreferences} className="rounded-xl font-bold text-xs h-10 px-6">
              Save Preferences
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
