
import { PageHeader } from "@/components/admin/page-header";
import { getGiftMessages } from "@/lib/server/api";
import { GiftMessageManager } from "./gift-message-manager";

export const runtime = 'nodejs';

export default async function GiftingSettingsPage() {
    const giftMessages = await getGiftMessages();

    return (
        <div className="container mx-auto py-2">
            <PageHeader 
                title="Gifting Settings"
                description="Manage predefined gift messages for customers."
            />
            <GiftMessageManager initialMessages={giftMessages} />
        </div>
    );
}
