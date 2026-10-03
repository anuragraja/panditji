import mongoose, { Schema, Document, Model } from "mongoose";
import { IAuditLog } from "@/types";

export interface IAuditLogDocument extends Omit<IAuditLog, "_id">, Document {}

const AuditLogSchema = new Schema<IAuditLogDocument>(
  {
    user: { type: String },
    userName: { type: String },
    userRole: { type: String },
    action: { type: String, required: true },
    entity: { type: String, required: true },
    entityId: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const AuditLog: Model<IAuditLogDocument> =
  mongoose.models.AuditLog || mongoose.model<IAuditLogDocument>("AuditLog", AuditLogSchema);

export default AuditLog;
