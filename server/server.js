import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";

import authRoutes from "./routes/authRoutes.js";
import projectsRouter from "./routes/projects.js";
import taskRoutes from "./routes/taskRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();

dotenv.config();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(helmet());
app.use(morgan("dev"));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectsRouter);
app.use("/api/projects/:projectId/tasks", taskRoutes); // nested
app.use("/api/tasks", taskRoutes); // optional top-level
app.use("/api/profile", profileRoutes);
app.use("/api/users", userRoutes);

app.get("/health", (_req, res) =>
  res.json({ ok: true, message: "Server is running!" })
);

app.use((req, res) => res.status(404).json({ ok: false, error: "Not Found" }));
/* eslint-disable no-unused-vars */
app.use((err, req, res, _next) => {
  console.error("Unhandled error:", err);
  res
    .status(err.status || 500)
    .json({ ok: false, error: err.message || "Server error" });
});
/* eslint-enable no-unused-vars */

const start = async () => {
  const { MONGO_URI, PORT } = process.env;
  if (!MONGO_URI) throw new Error("MONGO_URI missing");
  await mongoose.connect(MONGO_URI);
  console.log("✅ MongoDB connected");
  const port = Number(PORT) || 4000;
  app.listen(port, () => console.log(`✅ Server running on ${port}`));
};
start();
