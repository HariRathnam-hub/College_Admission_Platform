import { resendClient, isEmailConfigured } from "../config/resend";
import { env } from "../config/env";
import { logger } from "../utils/logger";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<boolean> {
  if (!isEmailConfigured || !resendClient) {
    logger.info(`[email:skipped - not configured] to=${to} subject="${subject}"`);
    return false;
  }

  try {
    await resendClient.emails.send({
      from: env.resend.fromEmail,
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    logger.error(`Failed to send email to ${to}: ${(error as Error).message}`);
    return false;
  }
}

export function applicationStatusEmailTemplate(params: {
  studentName: string;
  programName: string;
  status: string;
  note?: string;
}) {
  const { studentName, programName, status, note } = params;
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>Application Status Update</h2>
      <p>Hi ${studentName},</p>
      <p>Your application for <strong>${programName}</strong> has been updated to:</p>
      <p style="font-size: 18px; font-weight: bold; color: #4f46e5;">${status.replace(/_/g, " ")}</p>
      ${note ? `<p>Note: ${note}</p>` : ""}
      <p>Log in to your dashboard to view full details.</p>
    </div>
  `;
}
