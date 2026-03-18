import { requireAdmin } from "@/server/admin/auth";
import { AdminSettingsForm } from "@/features/admin/settings/admin-settings-form";

export default async function AdminPaymentSettingsPage() {
  await requireAdmin();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Payment settings</h1>
        <p className="text-muted-foreground">
          Configure payment gateway keys. Secrets are encrypted and never exposed to clients.
        </p>
      </div>
      <AdminSettingsForm
        group="PAYMENTS"
        title="Payment gateways"
        description="Store gateway keys and provider toggles."
        fields={[
          { key: "mode", label: "Mode (sandbox/live)", type: "text" },
          { key: "defaultCurrency", label: "Default currency", type: "text" },

          { key: "stripePublishableKey", label: "Stripe publishable key", type: "text" },
          { key: "stripeSecretKey", label: "Stripe secret key", type: "secret" },
          { key: "stripeWebhookSecret", label: "Stripe webhook secret", type: "secret" },

          { key: "paypalClientId", label: "PayPal client ID", type: "text" },
          { key: "paypalClientSecret", label: "PayPal secret", type: "secret" },

          { key: "flutterwavePublicKey", label: "Flutterwave public key", type: "text" },
          { key: "flutterwaveSecretKey", label: "Flutterwave secret", type: "secret" },
          { key: "flutterwaveEncryptionKey", label: "Flutterwave encryption key", type: "secret" },

          { key: "pesapalConsumerKey", label: "Pesapal consumer key", type: "text" },
          { key: "pesapalConsumerSecret", label: "Pesapal consumer secret", type: "secret" },

          { key: "paystackPublicKey", label: "Paystack public key", type: "text" },
          { key: "paystackSecretKey", label: "Paystack secret key", type: "secret" },
        ]}
      />
    </div>
  );
}

