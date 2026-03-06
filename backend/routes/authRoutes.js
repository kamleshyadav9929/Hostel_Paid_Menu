import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabase } from "../config/supabaseClient.js";

const router = Router();

// ─── POST /api/register ────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { name, roll_number, password, role } = req.body;

    if (!name || !roll_number || !password) {
      return res.status(400).json({ error: "name, roll_number, and password are required" });
    }

    // Check if user already exists
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("roll_number", roll_number)
      .single();

    if (existing) {
      return res.status(409).json({ error: "Roll number already registered" });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const userRole = role === "admin" ? "admin" : "student";

    const { data, error } = await supabase
      .from("users")
      .insert([{ name, roll_number, password_hash, role: userRole }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: "User registered", user: { id: data.id, name: data.name, roll_number: data.roll_number, role: data.role } });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

// ─── POST /api/login ───────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { roll_number, password } = req.body;

    if (!roll_number || !password) {
      return res.status(400).json({ error: "roll_number and password are required" });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("roll_number", roll_number)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: "Invalid roll number or password" });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid roll number or password" });
    }

    const token = jwt.sign(
      { id: user.id, roll_number: user.roll_number, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, name: user.name, roll_number: user.roll_number, role: user.role },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

export default router;
