"use server";

import { revalidatePath } from "next/cache";
import { getMongoDB } from "@/lib/server/mongodb";

export interface ContactPageData {
  title: string;
  subtitle: string;
  email: string;
  phone: string;
  address: string;
  workingHours: string;
  contactFormEnabled: boolean;
  showMap: boolean;
}

const defaultContent: ContactPageData = {
  title: "Contact Us",
  subtitle: "Get in touch with our team",
  email: "support@aparra.com",
  phone: "+91 9876543210",
  address: "123, Marine Drive, Mumbai, Maharashtra 400001",
  workingHours: "Mon - Sat: 10:00 AM - 8:00 PM",
  contactFormEnabled: true,
  showMap: true,
};

export async function getContactPageContent(): Promise<ContactPageData> {
  try {
    const db = await getMongoDB();
    const doc = await db
      .collection("contactPageContent")
      .findOne({ _docType: "singleton" });
    if (!doc) return defaultContent;
    const { _id, _docType, ...rest } = doc;
    return rest as ContactPageData;
  } catch (error) {
    console.error("Could not read contact page content:", error);
    return defaultContent;
  }
}

export async function saveContactPageContent(
  content: ContactPageData,
): Promise<{ success: boolean; message: string }> {
  try {
    const db = await getMongoDB();
    await db
      .collection("contactPageContent")
      .replaceOne(
        { _docType: "singleton" },
        { ...content, _docType: "singleton" },
        { upsert: true },
      );
    revalidatePath("/contact-us");
    revalidatePath("/admin/pages");
    return { success: true, message: "Contact Us page saved successfully!" };
  } catch (error) {
    console.error("Could not save contact page content:", error);
    return { success: false, message: "Failed to save contact page content." };
  }
}
