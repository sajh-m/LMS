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
};
