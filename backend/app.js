// app.js
import express from "express";
import cors from "cors";
import { loggers } from "./middlewares/loggers.js";
import bookRoutes from "./routes/bookRoutes.js";
import { errorHandler, notFoundHanlder } from "./middlewares/errorHandler.js";
import { config } from "./config/index.js";
import "./models/index.js";

const app = express();
app.use(loggers);
app.use(express.json());
app.use(
  cors({
    origin: config.corsOrigin,
    methods: config.corsMethods,
  }),
);
app.use("/api/books", bookRoutes);
app.get("/", (req, res) => {
  res.send("api running");
});

app.use(notFoundHanlder); // must come after all real routes
app.use(errorHandler); // must come last of all
export default app;
