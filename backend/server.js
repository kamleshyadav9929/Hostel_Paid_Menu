import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ─────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Routes ─────────────────────────────────────────────────
app.use("/api", authRoutes);       // /api/login, /api/register
app.use("/api", studentRoutes);    // /api/menu, /api/order, /api/my-orders, /api/my-bill
app.use("/api", adminRoutes);      // /api/menu/add, /api/menu/update, /api/orders, /api/payment/update, /api/students

// ─── Health check ───────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── Start ──────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
