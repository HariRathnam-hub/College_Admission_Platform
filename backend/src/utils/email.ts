import { sendViaBrevo, isEmailConfigured } from "../config/brevo";
import { logger } from "../utils/logger";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  toName?: string;
}

export async function sendEmail({ to, subject, html, toName }: SendEmailParams): Promise<boolean> {
  if (!isEmailConfigured) {
    logger.info(`[email:skipped - not configured] to=${to} subject="${subject}"`);
    return false;
  }

  try {
    await sendViaBrevo({ to, toName, subject, html });
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

export function verificationEmailTemplate(params: { name: string; verifyUrl: string }) {
  const { name, verifyUrl } = params;
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>Verify your email address</h2>
      <p>Hi ${name},</p>
      <p>Welcome! Please confirm your email address to activate your account. This link expires in 24 hours.</p>
      <p><a href="${verifyUrl}" style="display:inline-block;padding:10px 20px;background:#4f46e5;color:#fff;border-radius:6px;text-decoration:none;">Verify email</a></p>
      <p style="font-size:12px;color:#666;">If the button doesn't work, copy this link into your browser:<br/>${verifyUrl}</p>
      <p>If you didn't create this account, you can safely ignore this email.</p>
    </div>
  `;
}
