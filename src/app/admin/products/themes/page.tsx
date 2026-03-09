

import { PageHeader } from "@/components/admin/page-header";
import { getThemeSettings } from "@/lib/server/api";
import { ThemeSelectionForm } from "./theme-selection-form";

export const runtime = 'nodejs';

export default async function ProductThemesPage() {
    const settings = await getThemeSettings();
  
    return (
        <div className="container mx-auto py-2">
            <PageHeader
                title="Product Page Themes"
                description="Manage the visual appearance of your product detail pages."
            />
            <ThemeSelectionForm currentTheme={settings.activeProductTheme} />
        </div>
    );
}
