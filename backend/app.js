// app.js
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { loggers } from "./middlewares/loggers.js";
import bookRoutes from "./routes/bookRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import { errorHandler, notFoundHanlder } from "./middlewares/errorHandler.js";
import { config } from "./config/index.js";
import "./models/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(loggers);
app.use(express.json());
app.use(
  cors({
    origin: config.corsOrigin,
    methods: config.corsMethods,
  }),
);

// Only serve local files when running in local storage mode - in
// Cloudinary mode, images are already full external URLs and this
// route is never hit.
if (config.storageDriver === "local") {
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));
}

app.use("/api/books", bookRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.get("/", (req, res) => {
  res.send(`api running (storage: ${config.storageDriver})`);
});

app.use(notFoundHanlder);
app.use(errorHandler);
export default app;
