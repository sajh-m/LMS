import multer from "multer";
import path from "path";
import crypto from "crypto";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import cloudinary from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { config } from "../config/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, "..", "uploads");

const USE_CLOUDINARY = config.storageDriver === "cloudinary";

let storage;

if (USE_CLOUDINARY) {
  cloudinary.v2.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
  });

  storage = new CloudinaryStorage({
    cloudinary: cloudinary.v2,
    params: {
      folder: "library-donations",
      allowed_formats: ["jpg", "jpeg", "png", "webp", "gif", "heic"],
      transformation: [{ width: 800, crop: "limit" }],
    },
  });
} else {
  storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => {
      const uniqueName = crypto.randomUUID() + path.extname(file.originalname);
      cb(null, uniqueName);
    },
  });
}

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Returns the string to store on the Donation row: a full Cloudinary
// URL in production, or a local "/uploads/<filename>" path in dev.
// This is the ONLY place that needs to know which mode is active -
// controllers just call this instead of building the path themselves.
export function getUploadedImagePath(req) {
  if (!req.file) return null;
  return USE_CLOUDINARY ? req.file.path : `/uploads/${req.file.filename}`;
}

// Deletes an image based on the SHAPE of the stored reference, not the
// current config - so old local images stay cleanable even if you later
// switch this project to Cloudinary, and vice versa.
export async function deleteImage(imageRef) {
  if (!imageRef) return;

  if (imageRef.startsWith("http")) {
    try {
      const parts = imageRef.split("/");
      const fileWithExt = parts[parts.length - 1];
      const publicId = `library-donations/${fileWithExt.split(".")[0]}`;
      await cloudinary.v2.uploader.destroy(publicId);
    } catch (err) {
      console.error("Failed to delete Cloudinary image:", err);
    }
  } else {
    const filename = path.basename(imageRef);
    const fullPath = path.join(UPLOADS_DIR, filename);
    try {
      await fs.unlink(fullPath);
    } catch (err) {
      if (err.code !== "ENOENT") console.error("Failed to delete local file:", fullPath, err);
    }
  }
}
