
import { PageHeader } from "@/components/admin/page-header";
import { getSettings } from "@/lib/server/api";
import { ShippingSettingsForm } from "./shipping-settings-form";

export const runtime = 'nodejs';

export default async function ShippingSettingsPage() {
    const settings = await getSettings();
    const shippingSettings = settings.shipping || { 
        blockedPincodes: [], 
        blockedCities: [], 
        delhivery: { apiToken: '' }, 
        sequel: { apiToken: '' },
        shiprocket: { apiToken: '' }
    };

    return (
        <div className="container mx-auto py-2">
            <PageHeader 
                title="Shipping Settings"
                description="Manage your delivery zones and fulfillment providers."
            />
            <div className="max-w-2xl">
                <ShippingSettingsForm settings={shippingSettings} />
            </div>
        </div>
    );
}
