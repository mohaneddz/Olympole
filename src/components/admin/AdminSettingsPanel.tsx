"use client";

import { useMemo, useState } from "react";
import type { AppSettings } from "@/lib/app-settings";

const SETTING_METADATA = {
  registration_enabled: {
    label: "Registrations",
    description: "Allow users to access registration pages and submit registrations.",
  },
  predictions_enabled: {
    label: "Predictions",
    description: "Enable the predictions experience across the app.",
  },
  fantasy_launch: {
    label: "Fantasy",
    description: "Control whether fantasy is open to users.",
  },
  writing_enabled: {
    label: "Writing",
    description: "Allow writing submissions and related public pages.",
  },
  live_streaming_enabled: {
    label: "Live Streaming",
    description: "Show active streams and allow stream viewing on the live page.",
  },
} as const;

type BooleanSettingKey = keyof typeof SETTING_METADATA;

type AdminSettingsPanelProps = {
  initialSettings: AppSettings;
};

export function AdminSettingsPanel({ initialSettings }: AdminSettingsPanelProps) {
  const [settings, setSettings] = useState<AppSettings>(initialSettings);
  const [pendingKey, setPendingKey] = useState<BooleanSettingKey | null>(null);
  const [feedback, setFeedback] = useState<string>("");

  const enabledFlagsCount = useMemo(
    () => Object.entries(SETTING_METADATA).filter(([key]) => settings[key as BooleanSettingKey]).length,
    [settings]
  );

  const applySetting = async (key: BooleanSettingKey, value: boolean) => {
    setPendingKey(key);
    setFeedback("");
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          key,
          value,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result?.ok) {
        setFeedback(result?.message ?? "Failed to update setting.");
        setPendingKey(null);
        return;
      }

      setSettings((current) => ({
        ...current,
        [key]: value,
      }));
      setFeedback("Saved.");
    } catch {
      setFeedback("Failed to update setting.");
    } finally {
      setPendingKey(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-card-border p-4 text-sm text-foreground/70">
        Enabled Flags: {enabledFlagsCount}
      </div>

      {Object.entries(SETTING_METADATA).map(([key, meta]) => {
        const typedKey = key as BooleanSettingKey;
        const value = settings[typedKey];
        const isRowPending = pendingKey === typedKey;

        return (
          <div key={key} className="p-4 rounded-xl border border-card-border flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold">{meta.label}</p>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                    value
                      ? "border border-emerald-500/50 bg-emerald-500/15 text-emerald-300"
                      : "border border-rose-500/50 bg-rose-500/15 text-rose-300"
                  }`}
                >
                  {value ? "Enabled" : "Disabled"}
                </span>
              </div>
              <p className="text-sm text-foreground/60">{meta.description}</p>
            </div>
            <button
              type="button"
              disabled={isRowPending}
              onClick={() => void applySetting(typedKey, !value)}
              className={`min-w-28 px-3 py-2 rounded font-semibold disabled:opacity-60 disabled:cursor-not-allowed ${
                value
                  ? "border border-rose-500/60 bg-rose-500/15 text-rose-200"
                  : "border border-emerald-500/60 bg-emerald-500/15 text-emerald-200"
              }`}
            >
              {isRowPending ? "Updating..." : value ? "Disable" : "Enable"}
            </button>
          </div>
        );
      })}

      {feedback ? <p className="text-sm text-foreground/70">{feedback}</p> : null}
    </div>
  );
}
