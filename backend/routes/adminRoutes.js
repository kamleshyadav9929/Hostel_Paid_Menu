import { Router } from "express";
import bcrypt from "bcryptjs";
import { supabase } from "../config/supabaseClient.js";
import { authenticate, requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate, requireAdmin);

// ─── GET /api/menu ─────────────────────────────────────────
router.get("/menu", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .order("item_name");

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("Menu fetch error:", err);
    res.status(500).json({ error: "Could not fetch menu" });
  }
});

// ─── POST /api/order ───────────────────────────────────────
router.post("/order", async (req, res) => {
  try {
    const { student_roll, item_id, quantity } = req.body;

    if (!student_roll || !item_id || !quantity || quantity < 1) {
      return res.status(400).json({ error: "student_roll, item_id, and quantity (≥1) are required" });
    }

    // Verify item exists and is available
    const { data: item, error: itemErr } = await supabase
      .from("menu_items")
      .select("id, item_name, price")
      .eq("id", item_id)
      .eq("available", true)
      .single();

    if (itemErr || !item) {
      return res.status(404).json({ error: "Menu item not found or unavailable" });
    }

    const { data, error } = await supabase
      .from("orders")
      .insert([{ student_roll, item_id, quantity }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: "Order placed", order: data });
  } catch (err) {
    console.error("Admin Order error:", err);
    res.status(500).json({ error: "Could not place order" });
  }
});

// ─── POST /api/menu/add ────────────────────────────────────
router.post("/menu/add", async (req, res) => {
  try {
    const { item_name, price } = req.body;

    if (!item_name || price == null) {
      return res.status(400).json({ error: "item_name and price are required" });
    }

    const { data, error } = await supabase
      .from("menu_items")
      .insert([{ item_name, price: parseInt(price), available: true }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ message: "Item added", item: data });
  } catch (err) {
    console.error("Add menu error:", err);
    res.status(500).json({ error: "Could not add item" });
  }
});

// ─── PUT /api/menu/update ──────────────────────────────────
router.put("/menu/update", async (req, res) => {
  try {
    const { id, item_name, price, available } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Item id is required" });
    }

    const updates = {};
    if (item_name !== undefined) updates.item_name = item_name;
    if (price !== undefined) updates.price = parseInt(price);
    if (available !== undefined) updates.available = available;

    const { data, error } = await supabase
      .from("menu_items")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: "Item updated", item: data });
  } catch (err) {
    console.error("Update menu error:", err);
    res.status(500).json({ error: "Could not update item" });
  }
});

// ─── GET /api/orders ───────────────────────────────────────
router.get("/orders", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("id, student_roll, quantity, date, created_at, menu_items(item_name, price)")
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("Orders fetch error:", err);
    res.status(500).json({ error: "Could not fetch orders" });
  }
});

// ─── PUT /api/payment/update ───────────────────────────────
router.put("/payment/update", async (req, res) => {
  try {
    const { student_roll, month, amount, paid, status } = req.body;

    if (!student_roll || !month) {
      return res.status(400).json({ error: "student_roll and month are required" });
    }

    // Upsert: create payment row if it doesn't exist, update if it does
    const { data: existing } = await supabase
      .from("payments")
      .select("id")
      .eq("student_roll", student_roll)
      .eq("month", month)
      .single();

    let data, error;

    if (existing) {
      const updates = {};
      if (amount !== undefined) updates.amount = parseInt(amount);
      if (paid !== undefined) updates.paid = parseInt(paid);
      if (status !== undefined) updates.status = status;

      ({ data, error } = await supabase
        .from("payments")
        .update(updates)
        .eq("id", existing.id)
        .select()
        .single());
    } else {
      ({ data, error } = await supabase
        .from("payments")
        .insert([{
          student_roll,
          month,
          amount: parseInt(amount || 0),
          paid: parseInt(paid || 0),
          status: status || "unpaid",
        }])
        .select()
        .single());
    }

    if (error) throw error;
    res.json({ message: "Payment updated", payment: data });
  } catch (err) {
    console.error("Payment update error:", err);
    res.status(500).json({ error: "Could not update payment" });
  }
});

// ─── POST /api/students/add ────────────────────────────────
router.post("/students/add", async (req, res) => {
  try {
    const { name, roll_number, password, room_number } = req.body;

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

    const { data, error } = await supabase
      .from("users")
      .insert([{ name, roll_number, password_hash, room_number, role: "student" }])
      .select("id, name, roll_number, room_number, role")
      .single();

    if (error) throw error;

    res.status(201).json({ message: "Student added", student: data });
  } catch (err) {
    console.error("Add student error:", err);
    res.status(500).json({ error: "Could not add student" });
  }
});

// ─── GET /api/students ─────────────────────────────────────
router.get("/students", async (req, res) => {
  try {
    const { data: students, error } = await supabase
      .from("users")
      .select("id, name, roll_number, room_number, created_at")
      .eq("role", "student")
      .order("name");

    if (error) throw error;

    // Attach payment and bill summary for each student
    const enriched = await Promise.all(
      students.map(async (s) => {
        // 1. Get true total bill by summing up all orders
        const { data: orders } = await supabase
          .from("orders")
          .select("quantity, menu_items(price)")
          .eq("student_roll", s.roll_number);

        const totalBill = (orders || []).reduce((sum, o) => {
          return sum + (o.quantity * ((o.menu_items && o.menu_items.price) ? o.menu_items.price : 0));
        }, 0);

        // 2. Get total paid amount from payments table
        const { data: payments } = await supabase
          .from("payments")
          .select("amount, paid")
          .eq("student_roll", s.roll_number);

        const totalPaid = (payments || []).reduce((sum, p) => sum + p.paid, 0);

        return {
          ...s,
          total_bill: totalBill,
          total_paid: totalPaid,
          remaining: totalBill - totalPaid,
          payment_status: totalBill === 0 ? "no_bill" : totalPaid >= totalBill ? "paid" : "pending",
          payments: payments || [],
        };
      })
    );

    res.json(enriched);
  } catch (err) {
    console.error("Students fetch error:", err);
    res.status(500).json({ error: "Could not fetch students" });
  }
});

export default router;
