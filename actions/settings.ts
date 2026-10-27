"use server";

import { updateTag } from "next/cache";

import { requireAdmin } from "@/lib/auth/session";
import { auditLog } from "@/lib/audit";
import { writeSetting } from "@/lib/settings";
import type { SettingKey } from "@/lib/settings/types";
import type { ActionResult } from "@/actions/products";

/**
 * Persist one settings group. Only admins may change website configuration.
 * updateTag("settings") gives immediate read-your-own-writes on the
 * storefront (no redeploy needed).
 */
export async function saveSettings(
  key: SettingKey,
  value: unknown,
): Promise<ActionResult> {
  const user = await requireAdmin();
  const result = await writeSetting(key, value);
  if (!result.ok) return { ok: false, error: result.error };

  await auditLog({
    actorUserId: user.id,
    action: "settings.update",
    entityType: "setting",
    entityId: key,
  });
  updateTag("settings");
  return { ok: true, data: undefined };
}
