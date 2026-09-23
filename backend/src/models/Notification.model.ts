import { Schema, model, Document as MongooseDocument, Types } from "mongoose";

export const NOTIFICATION_TYPES = [
  "APPLICATION_STATUS_CHANGE",
  "DOCUMENT_STATUS_CHANGE",
  "CORRECTION_REQUESTED",
  "GENERAL",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export interface INotification extends MongooseDocument {
  _id: Types.ObjectId;
  recipient: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  relatedApplication?: Types.ObjectId;
  emailSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: NOTIFICATION_TYPES, default: "GENERAL" },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    relatedApplication: { type: Schema.Types.ObjectId, ref: "Application" },
    emailSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

export const Notification = model<INotification>("Notification", notificationSchema);
