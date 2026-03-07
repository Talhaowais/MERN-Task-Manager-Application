// server.js
const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const todoRoutes = require("./routes/todoRoutes");

const app = express();

// ================= MIDDLEWARE =================
app.use(cors({
  origin: process.env.ALLOWED_URL || "http://localhost:3000", // frontend URL
  credentials: true, // allow cookies to be sent
}));
app.use(express.json());
app.use(cookieParser());

// Optional debug logger
app.use((req, res, next) => {
  console.log("Incoming request:", req.method, req.url);
  next();
});

// ================= ROUTES =================
app.use("/api/auth", authRoutes);
app.use("/api/todos", todoRoutes);

// ================= MONGODB CONNECTION =================
console.log("Connecting to MongoDB URI preview:", process.env.MONGO_URI?.slice(0, 20) + "...");
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// ================= SERVER START =================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));