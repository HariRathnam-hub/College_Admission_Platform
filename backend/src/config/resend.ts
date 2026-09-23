import { Resend } from "resend";
import { env } from "./env";

export const isEmailConfigured = Boolean(env.resend.apiKey && env.resend.fromEmail);

export const resendClient = isEmailConfigured ? new Resend(env.resend.apiKey) : null;
