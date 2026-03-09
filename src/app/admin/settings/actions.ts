
"use server";

import { saveSettingsAction as saveSettingsActionApi, type SettingsFormState } from "@/lib/server/actions/settings";

export async function saveSettingsAction(
  prevState: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  return saveSettingsActionApi(prevState, formData);
}
