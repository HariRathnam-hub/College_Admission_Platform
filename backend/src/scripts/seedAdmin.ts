/**
 * Seed script: creates the first Admin account.
 *
 * Why this exists: every admin-provisioning endpoint (POST /admin/users, used
 * to create Faculty/Admin accounts from the UI) requires you to already be
 * logged in as an Admin. Public /register only ever creates Student accounts.
 * That's a chicken-and-egg problem for a brand new database — this script
 * breaks the loop by inserting exactly one Admin directly.
 *
 * Usage:
 *   npm run seed:admin
 *
 * Credentials come from environment variables so nothing sensitive is
 * hardcoded in source. Set these in backend/.env (or export them inline)
 * before running:
 *   SEED_ADMIN_NAME       (optional, defaults to "Admin")
 *   SEED_ADMIN_EMAIL      (required)
 *   SEED_ADMIN_PASSWORD   (required, min 8 chars incl. upper/lower/number)
 *
 * Example:
 *   SEED_ADMIN_EMAIL=admin@example.com SEED_ADMIN_PASSWORD=ChangeMe123 npm run seed:admin
 *
 * Behavior:
 *   - If an account with this email already exists, it is left untouched
 *     (safe to re-run) unless it isn't an Admin, in which case the script
 *     stops rather than silently escalating an existing account.
 *   - Password is hashed by the existing User model pre-save hook — never
 *     stored in plain text.
 *   - Change this password immediately after first login.
 */
import { connectDB, disconnectDB } from "../config/db";
import { User } from "../models/User.model";
import { logger } from "../utils/logger";

async function seed() {
  const name = process.env.SEED_ADMIN_NAME?.trim() || "Admin";
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set (e.g. in backend/.env) before running this script."
    );
  }

  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role !== "ADMIN") {
      throw new Error(
        `An account with email ${email} already exists with role ${existing.role}. Refusing to change its role here — use the Admin → Users screen instead.`
      );
    }
    logger.info(`Admin account for ${email} already exists. Nothing to do.`);
    return;
  }

  const admin = await User.create({
    name,
    email,
    password,
    role: "ADMIN",
    isActive: true,
    isEmailVerified: true,
  });

  logger.info(`Admin account created: ${admin.email} (id: ${admin._id}). Log in at /admin/login, then change the password.`);
}

async function main() {
  try {
    await connectDB();
    await seed();
    process.exitCode = 0;
  } catch (error) {
    logger.error(`Admin seeding failed: ${(error as Error).message}`);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
    process.exit(process.exitCode ?? 0);
  }
}

main();