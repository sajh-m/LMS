// app.js
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { loggers } from "./middlewares/loggers.js";
import bookRoutes from "./routes/bookRoutes.js";
import authRoutes from "./routes/authRoutes.js";
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

// serve uploaded book cover photos as plain static URLs, e.g.
// GET /uploads/<filename> -> the image file
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/books", bookRoutes);
app.use("/api/auth", authRoutes);
app.get("/", (req, res) => {
  res.send("api running");
});

app.use(notFoundHanlder); // must come after all real routes
app.use(errorHandler); // must come last of all
export default app;
