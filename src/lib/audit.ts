import { AuditLog } from "@/models";
import { connectToDatabase } from "@/lib/db/mongodb";

export interface LogAuditParams {
  user?: string;
  userName?: string;
  userRole?: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

export async function logAudit(params: LogAuditParams): Promise<void> {
  try {
    await connectToDatabase();
    await AuditLog.create({
      user: params.user,
      userName: params.userName,
      userRole: params.userRole,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      metadata: params.metadata,
    });
  } catch (error) {
    console.error("Failed to record audit log:", error);
  }
}
