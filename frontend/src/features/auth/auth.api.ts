import { api, setAccessToken } from "@/lib/axios";
import { AuthResponse, AuthUser, LoginPayload, RegisterPayload, RegisterResponse } from "./auth.types";

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function loginRequest(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await api.post<ApiEnvelope<AuthResponse>>("/auth/login", payload);
  setAccessToken(data.data.accessToken);
  return data.data;
}

export async function registerRequest(payload: RegisterPayload): Promise<RegisterResponse> {
  // No session is created on registration — the user must verify their email first.
  const { data } = await api.post<ApiEnvelope<RegisterResponse>>("/auth/register", payload);
  return data.data;
}

export async function verifyEmailRequest(token: string): Promise<string> {
  const { data } = await api.post<ApiEnvelope<null>>("/auth/verify-email", { token });
  return data.message;
}

export async function resendVerificationRequest(email: string): Promise<string> {
  const { data } = await api.post<ApiEnvelope<null>>("/auth/resend-verification", { email });
  return data.message;
}

export async function logoutRequest(): Promise<void> {
  await api.post("/auth/logout");
  setAccessToken(null);
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  const { data } = await api.get<ApiEnvelope<AuthUser>>("/auth/me");
  return data.data;
}

export async function forgotPasswordRequest(email: string): Promise<string> {
  const { data } = await api.post<ApiEnvelope<null>>("/auth/forgot-password", { email });
  return data.message;
}

export async function resetPasswordRequest(token: string, newPassword: string): Promise<string> {
  const { data } = await api.post<ApiEnvelope<null>>("/auth/reset-password", { token, newPassword });
  return data.message;
}
