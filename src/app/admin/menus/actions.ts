

"use server";

import { saveMenuAction as saveMenuActionApi, type MenuFormState } from "@/lib/server/actions/menus";

export async function saveMenuAction(
  prevState: MenuFormState,
  formData: FormData
): Promise<MenuFormState> {
  // This action simply passes through to the main server action, which contains
  // the validation, authentication, and database logic. This avoids duplicating
  // the (previously broken) auth logic.
  try {
      return await saveMenuActionApi(prevState, formData);
  } catch (error) {
      console.error("Critical error in saveMenuAction:", error);
      return { message: "A critical server error occurred. Please contact support." };
  }
}
