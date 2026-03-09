import { PageHeader } from "@/components/admin/page-header";
import { getContactPageContent } from "./actions";
import { ContactUsEditor } from "./contact-us-editor";

export const runtime = 'nodejs';

export default async function ContactUsEditorPage() {
  const content = await getContactPageContent();

  return (
    <div className="container mx-auto py-2">
      <PageHeader
        title="Edit Contact Us Page"
        description="Customize your contact page content and settings"
      />
      <ContactUsEditor initialContent={content} />
    </div>
  );
}
