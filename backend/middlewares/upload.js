import cloudinary from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import { config } from "../config/index.js";

cloudinary.v2.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: "library-donations",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "gif", "heic"],
    transformation: [{ width: 800, crop: "limit" }],
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

export async function deleteCloudinaryImage(imageUrl) {
  if (!imageUrl) return;
  try {
    const parts = imageUrl.split("/");
    const fileWithExt = parts[parts.length - 1];
    const publicId = `library-donations/${fileWithExt.split(".")[0]}`;
    await cloudinary.v2.uploader.destroy(publicId);
  } catch (err) {
    console.error("Failed to delete Cloudinary image:", err);
  }
}
