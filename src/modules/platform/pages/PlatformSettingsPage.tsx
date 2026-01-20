import { useState } from "react";
import { usePlatformSettingsStore } from "@/modules/platform/store/platformSettings.store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import { Separator } from "@/shared/components/ui/separator";
import { Settings, Mail, Palette, Shield, Check } from "lucide-react";

export default function PlatformSettingsPage() {
  const { settings, updateSettings } = usePlatformSettingsStore();
  const [localSettings, setLocalSettings] = useState(settings);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateSettings(localSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChange = (key: keyof typeof settings, value: string | boolean) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 shadow-lg">
          <Settings className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Platform Settings
          </h1>
          <p className="text-sm text-gray-600">
            Configure global platform parameters and branding
          </p>
        </div>
      </div>

      <div className="grid gap-6 max-w-4xl">
        {/* Global Configurations */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50">
                <Shield className="h-4 w-4 text-brand-600" />
              </div>
              <div>
                <CardTitle>Global Configurations</CardTitle>
                <CardDescription>
                  Main platform settings for all users
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="platform-name"
                  className="text-sm font-semibold text-gray-700"
                >
                  Platform Name
                </Label>
                <Input
                  id="platform-name"
                  value={localSettings.platformName}
                  onChange={(e) => handleChange("platformName", e.target.value)}
                  className="h-11 border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="support-email"
                  className="text-sm font-semibold text-gray-700"
                >
                  <Mail className="inline h-4 w-4 mr-1" />
                  Support Email
                </Label>
                <Input
                  id="support-email"
                  type="email"
                  value={localSettings.supportEmail}
                  onChange={(e) => handleChange("supportEmail", e.target.value)}
                  className="h-11 border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold text-gray-900">
                    Maintenance Mode
                  </Label>
                  <p className="text-sm text-gray-600">
                    Disable access for all tenants
                  </p>
                </div>
                <Switch
                  checked={localSettings.maintenanceMode}
                  onCheckedChange={(checked) =>
                    handleChange("maintenanceMode", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold text-gray-900">
                    New Registrations
                  </Label>
                  <p className="text-sm text-gray-600">
                    Allow public signups for new tenants
                  </p>
                </div>
                <Switch
                  checked={localSettings.allowNewRegistrations}
                  onCheckedChange={(checked) =>
                    handleChange("allowNewRegistrations", checked)
                  }
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                className="bg-brand-600 hover:bg-brand-700"
              >
                {saved ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Saved!
                  </>
                ) : (
                  "Save Configuration"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Branding */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50">
                <Palette className="h-4 w-4 text-brand-600" />
              </div>
              <div>
                <CardTitle>Branding</CardTitle>
                <CardDescription>
                  White-labeling and UI appearance
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="primary-color"
                  className="text-sm font-semibold text-gray-700"
                >
                  Primary Color
                </Label>
                <div className="flex gap-3">
                  <div
                    className="h-11 w-11 flex-shrink-0 rounded-lg border-2 border-gray-300 shadow-sm"
                    style={{ backgroundColor: localSettings.primaryColor }}
                  ></div>
                  <Input
                    id="primary-color"
                    value={localSettings.primaryColor}
                    onChange={(e) =>
                      handleChange("primaryColor", e.target.value)
                    }
                    className="h-11 font-mono"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="accent-color"
                  className="text-sm font-semibold text-gray-700"
                >
                  Accent Color
                </Label>
                <div className="flex gap-3">
                  <div
                    className="h-11 w-11 flex-shrink-0 rounded-lg border-2 border-gray-300 shadow-sm"
                    style={{ backgroundColor: localSettings.accentColor }}
                  ></div>
                  <Input
                    id="accent-color"
                    value={localSettings.accentColor}
                    onChange={(e) =>
                      handleChange("accentColor", e.target.value)
                    }
                    className="h-11 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                className="bg-brand-600 hover:bg-brand-700"
              >
                {saved ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Saved!
                  </>
                ) : (
                  "Save Branding"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
