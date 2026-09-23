import { Request } from "express";
import { Types } from "mongoose";
import { AuditLog } from "../models/AuditLog.model";
import { logger } from "./logger";

interface AuditParams {
  req: Request;
  action: string;
  targetType: string;
  targetId?: Types.ObjectId | string;
  meta?: Record<string, unknown>;
}

export async function recordAudit({ req, action, targetType, targetId, meta }: AuditParams) {
  try {
    await AuditLog.create({
      actor: req.user!.userId,
      actorRole: req.user!.role,
      action,
      targetType,
      targetId,
      meta,
      ip: req.ip,
    });
  } catch (error) {
    // Auditing must never break the primary request flow.
    logger.error(`Failed to write audit log for action "${action}": ${(error as Error).message}`);
  }
}
