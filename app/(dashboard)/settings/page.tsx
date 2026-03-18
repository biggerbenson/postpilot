import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth";
import { prisma } from "@/lib/db";
import { SettingsForm } from "@/features/settings/settings-form";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const settings = await prisma.userSettings.findUnique({
    where: { userId: user.id },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Defaults and posting preferences
        </p>
      </div>
      <SettingsForm
        userId={user.id}
        initialValues={{
          timezone: settings?.timezone ?? "UTC",
          defaultApprovalMode: settings?.defaultApprovalMode ?? "MANUAL",
          defaultPostingFrequency: settings?.defaultPostingFrequency ?? "",
          defaultPostingTimes: settings?.defaultPostingTimes ?? "",
          notificationsEnabled: settings?.notificationsEnabled ?? true,
          notifyOnPostPublished: settings?.notifyOnPostPublished ?? true,
          notifyOnPostFailed: settings?.notifyOnPostFailed ?? true,
          notifyOnApprovalRequired: settings?.notifyOnApprovalRequired ?? true,
          notifyOnAccountDisconnected:
            settings?.notifyOnAccountDisconnected ?? true,
        }}
      />
    </div>
  );
}

