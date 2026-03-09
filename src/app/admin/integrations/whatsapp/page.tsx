import { PageHeader } from "@/components/admin/page-header";
import { getSettings } from "@/lib/server/api";
import { WhatsAppForm } from "./whatsapp-form";

export const runtime = 'nodejs';

export default async function WhatsAppSettingsPage() {
    const settings = await getSettings();
    const whatsAppSettings = settings.whatsapp || { enabled: false, phoneNumber: "", defaultMessage: "Hello! I'm interested in your products." };

    return (
        <div className="container mx-auto py-2">
            <PageHeader 
                title="WhatsApp Integration"
                description="Manage your WhatsApp chat widget."
            />
            <WhatsAppForm settings={whatsAppSettings} />
        </div>
    );
}
