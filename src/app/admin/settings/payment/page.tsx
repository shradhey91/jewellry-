
import { PageHeader } from "@/components/admin/page-header";
import { PaymentGatewayForm } from "./payment-gateway-form";
import { getSettings } from "@/lib/server/api";

export const runtime = 'nodejs';

export default async function PaymentGatewayPage() {
    const settings = await getSettings();

    const paymentGatewaySettings = settings.paymentGateways || {
        razorpay: { apiKey: "", apiSecret: "" },
    };

    return (
        <div className="container mx-auto py-2">
            <PageHeader
                title="Payment Gateways"
                description="Connect and manage your payment providers."
            />
            <PaymentGatewayForm initialSettings={paymentGatewaySettings} />
        </div>
    );
}
