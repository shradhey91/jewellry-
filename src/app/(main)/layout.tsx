
import { getFooterContent, getMobileFooterContent } from "@/lib/get-footer-content";
import { MainLayoutClient } from './main-layout-client';
import { SocialProofNotification } from "@/components/products/social-proof-notification";
import { getSettings } from "@/lib/server/api";
import { WhatsAppWidget } from "@/components/whatsapp-widget";
import { CompareTrigger } from "@/components/products/compare-trigger";

export const runtime = 'nodejs';

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch data on the server
  const [footerContent, mobileFooterContent, settings] = await Promise.all([
    getFooterContent(),
    getMobileFooterContent(),
    getSettings()
  ]);

  return (
    <>
      {children}
      <CompareTrigger />
      <SocialProofNotification />
      {/* Conditionally render the widget */}
      {settings?.whatsapp?.enabled && settings.whatsapp.phoneNumber && (
          <WhatsAppWidget 
            phoneNumber={settings.whatsapp.phoneNumber} 
            defaultMessage={settings.whatsapp.defaultMessage}
          />
      )}
      {/* Pass server-fetched data to the client component */}
      <MainLayoutClient 
        footerContent={footerContent}
        mobileFooterContent={mobileFooterContent}
      />
    </>
  );
}
