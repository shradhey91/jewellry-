
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { saveSocialProofSettings } from "@/lib/server/api";
import type { SocialProofSettings } from "@/lib/types";

const settingsSchema = z.object({
  isEnabled: z.boolean(),
  showOnMobile: z.boolean(),
  position: z.enum(["bottom-left", "bottom-right"]),
  customNames: z.array(z.string()),
  productIds: z.array(z.string()),
});

export type SocialProofFormState = {
  message: string;
  errors?: {
    [key: string]: string[] | undefined;
  };
};

export async function saveSocialProofSettingsAction(
  prevState: SocialProofFormState,
  formData: FormData
): Promise<SocialProofFormState> {
  
  const productIds = JSON.parse(formData.get('productIds') as string || '[]');
  const customNames = (formData.get('customNames') as string)
    .split('\n')
    .map(name => name.trim())
    .filter(name => name.length > 0);

  const dataToValidate: SocialProofSettings = {
    isEnabled: formData.get("isEnabled") === "on",
    showOnMobile: formData.get("showOnMobile") === "on",
    position: formData.get("position") as "bottom-left" | "bottom-right",
    customNames: customNames,
    productIds: productIds,
  };

  const validatedFields = settingsSchema.safeParse(dataToValidate);

  if (!validatedFields.success) {
    console.error("Settings validation failed:", validatedFields.error.flatten().fieldErrors);
    return {
      message: "Failed to save settings. Please check the fields.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await saveSocialProofSettings(validatedFields.data);
    revalidatePath("/admin/social-proof");
    // We don't need to revalidate the storefront here, as it fetches fresh data via API.
  } catch (e) {
    return { message: "An error occurred while saving settings." };
  }

  return { message: "Social proof settings saved successfully!" };
}
