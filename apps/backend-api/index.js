// backend-api/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import eventRoutes from "./routes/events.js";
import eventPendingRoutes from "./routes/eventPending.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000", // frontend-app
      "http://localhost:3001", // frontend-admin
      "https://your-frontend-app-domain.com",
      "https://your-frontend-admin-domain.com",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/events", eventRoutes);
app.use("/api/events-pending", eventPendingRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Backend API is running",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error("Server error:", error);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? error.message : undefined,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend API server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});
