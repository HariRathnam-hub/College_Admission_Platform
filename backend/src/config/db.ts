import mongoose from "mongoose";
import { env } from "./env";
import { logger } from "../utils/logger";

mongoose.set("strictQuery", true);

export async function connectDB(): Promise<void> {
  try {
    mongoose.connection.on("connected", () => {
      logger.info("MongoDB connected");
    });

    mongoose.connection.on("error", (err) => {
      logger.error(`MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected");
    });

    await mongoose.connect(env.mongoUri);
  } catch (error) {
    logger.error(`Failed to connect to MongoDB: ${(error as Error).message}`);
    process.exit(1);
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
}
