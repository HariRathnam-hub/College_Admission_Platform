/**
 * One-time migration: marks every account that existed BEFORE email
 * verification was introduced as verified, so existing students aren't locked out.
 *
 * Usage: npm run migrate:verify-existing
 */
import { connectDB, disconnectDB } from "../config/db";
import { User } from "../models/User.model";
import { logger } from "../utils/logger";

async function main() {
  try {
    await connectDB();
    const result = await User.updateMany({ isEmailVerified: { $ne: true } }, { $set: { isEmailVerified: true } });
    logger.info(`Marked ${result.modifiedCount} existing account(s) as email-verified.`);
    process.exitCode = 0;
  } catch (error) {
    logger.error(`Migration failed: ${(error as Error).message}`);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
    process.exit(process.exitCode ?? 0);
  }
}

main();
