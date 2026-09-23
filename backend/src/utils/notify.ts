import { Notification, NotificationType } from "../models/Notification.model";
import { User } from "../models/User.model";
import { sendEmail, applicationStatusEmailTemplate } from "./email";
import { Types } from "mongoose";

interface NotifyParams {
  recipientId: Types.ObjectId | string;
  type: NotificationType;
  title: string;
  message: string;
  relatedApplication?: Types.ObjectId | string;
  sendEmailToo?: boolean;
  emailContext?: { programName: string; status: string; note?: string };
}

export async function notify(params: NotifyParams) {
  const { recipientId, type, title, message, relatedApplication, sendEmailToo, emailContext } = params;

  let emailSent = false;

  if (sendEmailToo) {
    const recipient = await User.findById(recipientId);
    if (recipient && emailContext) {
      emailSent = await sendEmail({
        to: recipient.email,
        subject: title,
        html: applicationStatusEmailTemplate({
          studentName: recipient.name,
          programName: emailContext.programName,
          status: emailContext.status,
          note: emailContext.note,
        }),
      });
    }
  }

  return Notification.create({
    recipient: recipientId,
    type,
    title,
    message,
    relatedApplication,
    emailSent,
  });
}
