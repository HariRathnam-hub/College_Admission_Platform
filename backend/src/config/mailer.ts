import nodemailer, { Transporter } from "nodemailer";
import { env } from "./env";
import { logger } from "../utils/logger";

// Generic SMTP transport — works with Brevo (smtp-relay.brevo.com, port 587)
// or any other SMTP provider. Brevo credentials: SMTP_USER is the login shown
// on your Brevo SMTP & API page (usually your Brevo account email), SMTP_PASS
// is the SMTP key you generate there (NOT your Brevo account password).
export const isEmailConfigured = Boolean(
  env.smtp.host && env.smtp.user && env.smtp.pass && env.smtp.from
);

export const mailTransporter: Transporter | null = isEmailConfigured
  ? nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465, // 465 = implicit TLS; 587 (Brevo default) = STARTTLS
      auth: {
        user: env.smtp.user,
        pass: env.smtp.pass,
      },
    })
  : null;

if (mailTransporter) {
  mailTransporter.verify((error) => {
    if (error) {
      logger.error(`SMTP connection failed: ${error.message}`);
    } else {
      logger.info(`SMTP connection verified (${env.smtp.host}:${env.smtp.port}) — ready to send email.`);
    }
  });
} else {
  logger.info(
    "Email is not configured (SMTP_HOST / SMTP_USER / SMTP_PASS / EMAIL_FROM missing) — emails will be skipped."
  );
}
