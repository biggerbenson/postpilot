import { requireAdmin } from "@/server/admin/auth";
import { AdminSettingsForm } from "@/features/admin/settings/admin-settings-form";

export default async function AdminAiSettingsPage() {
  await requireAdmin();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">AI settings</h1>
        <p className="text-muted-foreground">
          Configure AI generation behavior. Secrets are stored encrypted and never returned to the browser.
        </p>
      </div>
      <AdminSettingsForm
        group="AI"
        title="AI"
        description="Enable/disable AI, models, and prompt tuning."
        fields={[
          { key: "aiEnabled", label: "AI enabled (true/false)", type: "text" },
          { key: "openaiApiKey", label: "OpenAI API key", type: "secret" },
          { key: "defaultModel", label: "Default model", type: "text" },
          { key: "fallbackModel", label: "Fallback model", type: "text" },
          { key: "temperature", label: "Temperature (0-1)", type: "number" },
          { key: "promptOverrides", label: "Prompt overrides (JSON)", type: "json" },
        ]}
      />
    </div>
  );
}

