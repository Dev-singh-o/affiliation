import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/session";
import { writeSetting } from "@/lib/settings";
import { saveSettings } from "@/actions/settings";

const settingsGroupSchema = z.enum([
  "branding",
  "homepage",
  "navigation",
  "social",
  "seo",
  "affiliate",
  "general",
]);

export { saveSettings, settingsGroupSchema };

/**
 * Revalidate the public storefront after a settings change.
 * Called from client handlers in addition to the server action.
 */
export async function revalidateStorefront(): Promise<void> {
  "use server";
  await requireAdmin();
  revalidatePath("/", "layout");
}
