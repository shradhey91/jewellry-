
"use server";

import { saveUserAction as saveUserActionApi, type UserFormState } from "@/lib/server/actions/admins";

export async function saveUserAction(
  prevState: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  return saveUserActionApi(prevState, formData);
}
