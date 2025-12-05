"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import {
  Settings,
  User,
  Palette,
  Bell,
  Shield,
  Moon,
  Sun,
  Monitor,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import { toast } from "sonner";

type SettingsSection = "profile" | "appearance" | "notifications" | "security";

const sections = [
  { id: "profile" as const, label: "Profile", icon: User },
  { id: "appearance" as const, label: "Appearance", icon: Palette },
  { id: "notifications" as const, label: "Notifications", icon: Bell },
  { id: "security" as const, label: "Security", icon: Shield },
];

const themes = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "system", label: "System", icon: Monitor },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("profile");
  const { theme, setTheme } = useTheme();
  const { user } = useUser();

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-12 animate-in">
        <div className="flex items-center gap-3 text-muted-foreground mb-4">
          <Settings className="h-5 w-5" />
          <span className="text-sm font-medium uppercase tracking-wider">
            Configuration
          </span>
        </div>

        <h1 className="text-5xl md:text-6xl font-medium tracking-tight mb-4">
          Settings
        </h1>

        <p className="text-lg text-muted-foreground max-w-xl">
          Customize your trading experience and manage your account preferences.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <nav className="lg:col-span-1 animate-in delay-100">
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="p-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors",
                    activeSection === section.id
                      ? "bg-accent/10 text-accent"
                      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <section.icon className="h-5 w-5" />
                  <span className="font-medium">{section.label}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        <div className="lg:col-span-3 animate-in delay-200">
          {activeSection === "profile" && (
            <ProfileSection user={user} />
          )}

          {activeSection === "appearance" && (
            <AppearanceSection theme={theme} setTheme={setTheme} />
          )}

          {activeSection === "notifications" && <NotificationsSection />}

          {activeSection === "security" && <SecuritySection />}
        </div>
      </div>
    </div>
  );
}

function ProfileSection({ user }: { user: ReturnType<typeof useUser>["user"] }) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-xl font-medium mb-6">Profile Information</h2>

        <SignedOut>
          <div className="text-center py-8">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">
              Sign in to manage your profile
            </p>
            <p className="text-sm text-muted-foreground/70">
              Your profile settings will appear here once you sign in
            </p>
          </div>
        </SignedOut>

        <SignedIn>
          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 rounded-full bg-accent/10 flex items-center justify-center overflow-hidden">
                {user?.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.imageUrl}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-10 w-10 text-accent" />
                )}
              </div>
              <div>
                <p className="text-lg font-medium">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-muted-foreground">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  defaultValue={user?.firstName || ""}
                  className="bg-background"
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  defaultValue={user?.lastName || ""}
                  className="bg-background"
                  disabled
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                defaultValue={user?.primaryEmailAddress?.emailAddress || ""}
                className="bg-background"
                disabled
              />
            </div>

            <p className="text-sm text-muted-foreground">
              Profile information is managed through Clerk. Visit your Clerk
              dashboard to make changes.
            </p>
          </div>
        </SignedIn>
      </div>
    </div>
  );
}

function AppearanceSection({
  theme,
  setTheme,
}: {
  theme: string | undefined;
  setTheme: (theme: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-xl font-medium mb-2">Theme</h2>
        <p className="text-muted-foreground mb-6">
          Choose how TradeSweep looks to you
        </p>

        <div className="grid grid-cols-3 gap-4">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={cn(
                "relative flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all",
                theme === t.id
                  ? "border-accent bg-accent/5"
                  : "border-border hover:border-accent/50 hover:bg-muted/30"
              )}
            >
              {theme === t.id && (
                <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-accent flex items-center justify-center">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
              <div
                className={cn(
                  "h-12 w-12 rounded-xl flex items-center justify-center",
                  theme === t.id ? "bg-accent/10" : "bg-muted"
                )}
              >
                <t.icon
                  className={cn(
                    "h-6 w-6",
                    theme === t.id ? "text-accent" : "text-muted-foreground"
                  )}
                />
              </div>
              <span
                className={cn(
                  "font-medium",
                  theme === t.id ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {t.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-xl font-medium mb-2">Accent Color</h2>
        <p className="text-muted-foreground mb-6">
          Current accent color is Coral (#FF6B4A)
        </p>

        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-accent" />
          <div>
            <p className="font-medium">Coral</p>
            <p className="text-sm text-muted-foreground font-mono">#FF6B4A</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationsSection() {
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [tradeAlerts, setTradeAlerts] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState(false);

  const handleSave = () => {
    toast.success("Notification preferences saved");
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-xl font-medium mb-2">Notification Preferences</h2>
        <p className="text-muted-foreground mb-6">
          Control how and when you receive notifications
        </p>

        <div className="space-y-4">
          <NotificationToggle
            label="Email Notifications"
            description="Receive email updates about your account"
            checked={emailNotifs}
            onChange={setEmailNotifs}
          />
          <NotificationToggle
            label="Trade Alerts"
            description="Get notified when a trade is completed"
            checked={tradeAlerts}
            onChange={setTradeAlerts}
          />
          <NotificationToggle
            label="Price Alerts"
            description="Get notified when a stock reaches your target price"
            checked={priceAlerts}
            onChange={setPriceAlerts}
          />
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <Button onClick={handleSave} className="bg-accent hover:bg-accent/90 text-white">
            Save Preferences
          </Button>
        </div>
      </div>
    </div>
  );
}

function NotificationToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-muted/30 transition-colors">
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-11 rounded-full transition-colors",
          checked ? "bg-accent" : "bg-muted"
        )}
      >
        <div
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
            checked ? "translate-x-5.5" : "translate-x-0.5"
          )}
        />
      </button>
    </div>
  );
}

function SecuritySection() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-xl font-medium mb-2">Security Settings</h2>
        <p className="text-muted-foreground mb-6">
          Manage your account security and authentication
        </p>

        <SignedOut>
          <div className="text-center py-8">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">
              Sign in to manage security settings
            </p>
          </div>
        </SignedOut>

        <SignedIn>
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Active Sessions</p>
                  <p className="text-sm text-muted-foreground">
                    Manage your active login sessions
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Password</p>
                  <p className="text-sm text-muted-foreground">
                    Last changed: Never
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Change
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Security settings are managed through Clerk. Some options may
              redirect you to the Clerk dashboard.
            </p>
          </div>
        </SignedIn>
      </div>

      <div className="rounded-2xl border border-destructive/50 bg-destructive/5 p-6">
        <h2 className="text-xl font-medium text-destructive mb-2">
          Danger Zone
        </h2>
        <p className="text-muted-foreground mb-6">
          Irreversible actions for your account
        </p>

        <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10">
          Delete Account
        </Button>
      </div>
    </div>
  );
}
