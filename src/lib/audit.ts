import { prisma } from "@/lib/db";

export async function logAudit(sezonId: string, entity: string, summary: string): Promise<void> {
  await prisma.auditLog.create({ data: { sezonId, entity, summary } });
}
