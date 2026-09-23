import { Schema, model, Document as MongooseDocument, Types } from "mongoose";

export interface IAuditLog extends MongooseDocument {
  _id: Types.ObjectId;
  actor: Types.ObjectId;
  actorRole: string;
  action: string;
  targetType: string;
  targetId?: Types.ObjectId;
  meta?: Record<string, unknown>;
  ip?: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    actor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    actorRole: { type: String, required: true },
    action: { type: String, required: true },
    targetType: { type: String, required: true },
    targetId: { type: Schema.Types.ObjectId },
    meta: { type: Schema.Types.Mixed },
    ip: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

auditLogSchema.index({ actor: 1, createdAt: -1 });
auditLogSchema.index({ targetType: 1, targetId: 1 });

export const AuditLog = model<IAuditLog>("AuditLog", auditLogSchema);
