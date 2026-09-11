import "dotenv/config";

const hasCloudinaryConfig = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET,
);

export const config = {
  port: process.env.PORT || 3001,
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  corsMethods: process.env.CORS_METHOD?.split(",") || ["GET", "POST", "PUT", "DELETE"],
  dbStorage: process.env.DB_STORAGE || "./data/library.sqlite3",
  jwtSecret: process.env.JWT_SECRET || "dev-secret-change-this-in-production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  // "cloudinary" if all three CLOUDINARY_* vars are set in .env, otherwise
  // "local" - this is the ONLY thing that decides which storage is used.
  // Leave the Cloudinary vars blank locally, set them on Render, and
  // nothing else in the code needs to change between environments.
  storageDriver: hasCloudinaryConfig ? "cloudinary" : "local",
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
};
