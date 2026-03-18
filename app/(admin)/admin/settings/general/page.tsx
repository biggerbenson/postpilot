import { requireAdmin } from "@/server/admin/auth";
import { AdminSettingsForm } from "@/features/admin/settings/admin-settings-form";

export default async function AdminGeneralSettingsPage() {
  await requireAdmin();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">General settings</h1>
        <p className="text-muted-foreground">Site identity and basic configuration.</p>
      </div>
      <AdminSettingsForm
        group="GENERAL"
        title="General"
        description="Controls the platform name, support contacts, and global flags."
        fields={[
          { key: "siteName", label: "Site name", type: "text" },
          { key: "siteDescription", label: "Site description", type: "text" },
          { key: "supportEmail", label: "Support email", type: "text" },
          { key: "defaultTimezone", label: "Default timezone", type: "text" },
          { key: "maintenanceMode", label: "Maintenance mode (true/false)", type: "text" },
        ]}
      />
    </div>
  );
}

