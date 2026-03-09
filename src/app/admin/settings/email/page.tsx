
import { PageHeader } from "@/components/admin/page-header";
import { getSettings } from "@/lib/server/api";
import { EmailSettingsForm } from "./email-settings-form";

export const runtime = 'nodejs';

export default async function EmailSettingsPage() {
    const settings = await getSettings();

    return (
        <div className="container mx-auto py-2">
            <PageHeader 
                title="Email Settings"
                description="Configure your transactional email provider."
            />
            <EmailSettingsForm settings={settings} />
        </div>
    );
}
