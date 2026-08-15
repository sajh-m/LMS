import "dotenv/config";

export const config = {
  port: process.env.PORT || 3001,
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  corsMethods: process.env.CORS_METHOD?.split(",") || [
    "GET",
    "POST",
    "PUT",
    "DELETE",
  ],
  dbStorage: process.env.DB_STORAGE || "./data/library.sqlite3",
  jwtSecret: process.env.JWT_SECRET || "dev-secret-change-this-in-production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
};
