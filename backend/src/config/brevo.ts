import { env } from "./env";
import { logger } from "../utils/logger";

// Sends via Brevo's HTTPS transactional email API instead of SMTP. Render's
// free tier (and several other hosts) blocks outbound SMTP ports (25/465/587)
// entirely, which made nodemailer hang until it timed out. Plain HTTPS on
// port 443 is never blocked, and no extra dependency is needed — Node 18+
// ships a global `fetch`.
const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";
const REQUEST_TIMEOUT_MS = 10_000;

interface BrevoSender {
  name?: string;
  email: string;
}

function parseSender(from: string): BrevoSender | null {
  const trimmed = from.trim();
  if (!trimmed) return null;

  // Accepts either `Name <email@domain.com>` or a bare `email@domain.com`.
  const match = trimmed.match(/^"?([^"<]*)"?\s*<([^>]+)>$/);
  if (match) {
    const name = match[1].trim();
    const email = match[2].trim();
    return name ? { name, email } : { email };
  }
  return { email: trimmed };
}

export const brevoSender = parseSender(env.brevo.from);
export const isEmailConfigured = Boolean(env.brevo.apiKey && brevoSender);

if (isEmailConfigured) {
  logger.info(`Brevo email API configured — sending as ${brevoSender?.email}.`);
} else {
  logger.info("Email is not configured (BREVO_API_KEY / EMAIL_FROM missing) — emails will be skipped.");
}

interface SendViaBrevoParams {
  to: string;
  toName?: string;
  subject: string;
  html: string;
}

/** Throws on failure — callers decide how to log/handle it. */
export async function sendViaBrevo({ to, toName, subject, html }: SendViaBrevoParams): Promise<void> {
  if (!isEmailConfigured || !brevoSender) {
    throw new Error("Brevo is not configured (BREVO_API_KEY / EMAIL_FROM missing).");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(BREVO_ENDPOINT, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": env.brevo.apiKey,
      },
      body: JSON.stringify({
        sender: brevoSender,
        to: [{ email: to, name: toName }],
        subject,
        htmlContent: html,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`Brevo API responded ${response.status} ${response.statusText}: ${body}`);
    }
  } finally {
    clearTimeout(timeoutId);
  }
}
