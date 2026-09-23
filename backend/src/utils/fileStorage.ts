import fs from "fs";
import path from "path";
import crypto from "crypto";
import { cloudinary, isCloudinaryConfigured } from "../config/cloudinary";
import { logger } from "../utils/logger";

export interface StoredFile {
  url: string;
  publicId?: string;
  provider: "CLOUDINARY" | "LOCAL";
}

const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "uploads");

function ensureLocalDir() {
  if (!fs.existsSync(LOCAL_UPLOAD_DIR)) {
    fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
  }
}

export async function storeFile(
  buffer: Buffer,
  originalName: string,
  folder: string
): Promise<StoredFile> {
  if (isCloudinaryConfigured) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: `college-admission/${folder}`, resource_type: "auto" },
        (error, result) => {
          if (error || !result) {
            logger.error(`Cloudinary upload failed: ${error?.message}`);
            reject(error ?? new Error("Cloudinary upload failed"));
            return;
          }
          resolve({ url: result.secure_url, publicId: result.public_id, provider: "CLOUDINARY" });
        }
      );
      uploadStream.end(buffer);
    });
  }

  // Local disk fallback for development environments without Cloudinary credentials.
  ensureLocalDir();
  const safeName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}-${originalName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const filePath = path.join(LOCAL_UPLOAD_DIR, safeName);
  fs.writeFileSync(filePath, buffer);

  return { url: `/uploads/${safeName}`, provider: "LOCAL" };
}

export async function deleteFile(file: { provider: "CLOUDINARY" | "LOCAL"; publicId?: string; url: string }) {
  if (file.provider === "CLOUDINARY" && file.publicId) {
    await cloudinary.uploader.destroy(file.publicId).catch((err) => {
      logger.error(`Failed to delete Cloudinary asset: ${(err as Error).message}`);
    });
    return;
  }
  if (file.provider === "LOCAL") {
    const filePath = path.join(process.cwd(), file.url);
    fs.promises.unlink(filePath).catch(() => undefined);
  }
}
