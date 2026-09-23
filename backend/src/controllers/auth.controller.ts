import { Request, Response } from "express";
import crypto from "crypto";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { User } from "../models/User.model";
import { StudentProfile } from "../models/StudentProfile.model";
import { RefreshToken } from "../models/RefreshToken.model";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { env, isProd } from "../config/env";
import { RegisterInput, LoginInput, ForgotPasswordInput, ResetPasswordInput } from "../validations/auth.validation";
import { sendEmail } from "../utils/email";
import { logger } from "../utils/logger";

const REFRESH_COOKIE = "refreshToken";
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function cookieOptions() {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? ("none" as const) : ("lax" as const),
    maxAge: REFRESH_TTL_MS,
    path: "/api/v1/auth",
  };
}

async function issueTokens(userId: string, role: "STUDENT" | "FACULTY" | "ADMIN", tokenVersion: number, meta: { ip?: string; userAgent?: string }) {
  const accessToken = signAccessToken({ userId, role, tokenVersion });
  const refreshToken = signRefreshToken({ userId, role, tokenVersion });

  await RefreshToken.create({
    user: userId,
    token: crypto.createHash("sha256").update(refreshToken).digest("hex"),
    ip: meta.ip,
    userAgent: meta.userAgent,
    expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
  });

  return { accessToken, refreshToken };
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body as RegisterInput;

  const existing = await User.findOne({ email });
  if (existing) {
    throw ApiError.conflict("An account with this email already exists");
  }

  // Public registration is restricted to STUDENT; elevated roles are provisioned by an Admin.
  const assignedRole = role === "STUDENT" || !role ? "STUDENT" : "STUDENT";

  const user = await User.create({ name, email, password, role: assignedRole });

  if (assignedRole === "STUDENT") {
    await StudentProfile.create({ user: user._id, education: [] });
  }

  const { accessToken, refreshToken } = await issueTokens(
    user._id.toString(),
    user.role,
    user.tokenVersion,
    { ip: req.ip, userAgent: req.headers["user-agent"] }
  );

  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions());

  res.status(201).json(
    new ApiResponse("Registration successful", {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
    })
  );
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as LoginInput;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !user.isActive) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  user.lastLoginAt = new Date();
  await user.save();

  const { accessToken, refreshToken } = await issueTokens(
    user._id.toString(),
    user.role,
    user.tokenVersion,
    { ip: req.ip, userAgent: req.headers["user-agent"] }
  );

  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions());

  res.status(200).json(
    new ApiResponse("Login successful", {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
    })
  );
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE] ?? req.body?.refreshToken;
  if (!token) {
    throw ApiError.unauthorized("Refresh token missing");
  }

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw ApiError.unauthorized("Invalid or expired refresh token");
  }

  const hashed = crypto.createHash("sha256").update(token).digest("hex");
  const stored = await RefreshToken.findOne({ token: hashed, user: payload.userId, revoked: false });
  if (!stored || stored.expiresAt < new Date()) {
    throw ApiError.unauthorized("Refresh token is no longer valid");
  }

  const user = await User.findById(payload.userId);
  if (!user || !user.isActive || user.tokenVersion !== payload.tokenVersion) {
    throw ApiError.unauthorized("Session is no longer valid");
  }

  // Rotate refresh token
  stored.revoked = true;
  await stored.save();

  const { accessToken, refreshToken: newRefreshToken } = await issueTokens(
    user._id.toString(),
    user.role,
    user.tokenVersion,
    { ip: req.ip, userAgent: req.headers["user-agent"] }
  );

  res.cookie(REFRESH_COOKIE, newRefreshToken, cookieOptions());

  res.status(200).json(new ApiResponse("Token refreshed", { accessToken }));
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE] ?? req.body?.refreshToken;
  if (token) {
    const hashed = crypto.createHash("sha256").update(token).digest("hex");
    await RefreshToken.updateOne({ token: hashed }, { revoked: true });
  }
  res.clearCookie(REFRESH_COOKIE, { path: "/api/v1/auth" });
  res.status(200).json(new ApiResponse("Logged out successfully"));
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const user = await User.findById(req.user.userId);
  if (!user) throw ApiError.notFound("User not found");

  res.status(200).json(
    new ApiResponse("Current user fetched", {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    })
  );
});

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body as ForgotPasswordInput;

  const user = await User.findOne({ email });

  // Always respond with the same generic message, whether or not the account exists —
  // this prevents attackers from using this endpoint to discover which emails are registered.
  const genericResponse = new ApiResponse(
    "If an account with that email exists, a password reset link has been sent."
  );

  if (!user || !user.isActive) {
    res.status(200).json(genericResponse);
    return;
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  user.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
  await user.save();

  const resetUrl = `${env.clientUrl}/reset-password?token=${rawToken}`;
  const sent = await sendEmail({
    to: user.email,
    subject: "Reset your password",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Reset your password</h2>
        <p>Hi ${user.name},</p>
        <p>We received a request to reset your password. This link expires in 1 hour.</p>
        <p><a href="${resetUrl}" style="display:inline-block;padding:10px 20px;background:#4f46e5;color:#fff;border-radius:6px;text-decoration:none;">Reset password</a></p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });

  if (!sent) {
    // Email isn't configured in this environment (e.g. local dev without a Resend key) —
    // log the link so the flow is still testable end to end.
    logger.info(`[password-reset] Reset link for ${user.email}: ${resetUrl}`);
  }

  res.status(200).json(genericResponse);
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, newPassword } = req.body as ResetPasswordInput;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() },
  }).select("+password +resetPasswordToken +resetPasswordExpires");

  if (!user) {
    throw ApiError.badRequest("This reset link is invalid or has expired. Please request a new one.");
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  user.tokenVersion += 1; // invalidate every existing access/refresh token
  await user.save();

  await RefreshToken.updateMany({ user: user._id, revoked: false }, { revoked: true });

  res.status(200).json(new ApiResponse("Password reset successfully. Please log in with your new password."));
});
