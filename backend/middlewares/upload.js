import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import { config } from "../config/index.js";

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "library-donations",
    // allow any image format Cloudinary supports
    allowed_formats: ["jpg", "jpeg", "png", "webp", "gif", "heic"],
    transformation: [{ width: 800, crop: "limit" }],
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Deletes a Cloudinary asset by its public_id.
// The image field on the database row is the full URL, so we derive the
// public_id from it: strip the base URL and the file extension.
export async function deleteCloudinaryImage(imageUrl) {
  if (!imageUrl) return;
  try {
    // URL looks like: https://res.cloudinary.com/<cloud>/image/upload/v123/library-donations/<id>.jpg
    const parts = imageUrl.split("/");
    const fileWithExt = parts[parts.length - 1];
    const publicId = `library-donations/${fileWithExt.split(".")[0]}`;
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error("Failed to delete Cloudinary image:", err);
  }
}

export { cloudinary };
