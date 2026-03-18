import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth";
import { BillingPageClient } from "@/features/billing/billing-page";

export default async function BillingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-muted-foreground">
          Renew your subscription and manage payment providers.
        </p>
      </div>
      <BillingPageClient />
    </div>
  );
}

