import { prisma } from "@/lib/db/prisma";

/**
 * Audit trail for sensitive administrative operations.
 * Never let audit logging break the actual mutation — failures are logged.
 */
export async function auditLog(entry: {
  actorUserId: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    await prisma.adminAuditLog.create({
      data: {
        actorUserId: entry.actorUserId,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId ?? null,
        metadata: entry.metadata as never,
      },
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}
