import { PageHeader } from "@/components/admin/page-header";
import { getThemeSettings } from "@/lib/server/api";
import { HomepageThemeSelectionForm } from "./homepage-theme-selection-form";

export const runtime = 'nodejs';

export default async function HomepageThemesPage() {
    const settings = await getThemeSettings();
  
    return (
        <div className="container mx-auto py-2">
            <PageHeader
                title="Homepage Themes"
                description="Manage the visual appearance of your homepage."
            />
            <HomepageThemeSelectionForm currentTheme={settings.activeHomepageTheme} />
        </div>
    );
}
