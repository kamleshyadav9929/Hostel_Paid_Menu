import { Router } from "express";
import { supabase } from "../config/supabaseClient.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

// All student routes require authentication
router.use(authenticate);



// ─── GET /api/my-orders ────────────────────────────────────
router.get("/my-orders", async (req, res) => {
  try {
    const student_roll = req.user.roll_number;

    const { data, error } = await supabase
      .from("orders")
      .select("id, quantity, date, created_at, menu_items(item_name, price)")
      .eq("student_roll", student_roll)
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("My orders error:", err);
    res.status(500).json({ error: "Could not fetch orders" });
  }
});

// ─── GET /api/my-bill ──────────────────────────────────────
router.get("/my-bill", async (req, res) => {
  try {
    const student_roll = req.user.roll_number;

    // Get all orders to compute total
    const { data: orders, error: ordErr } = await supabase
      .from("orders")
      .select("quantity, menu_items(price)")
      .eq("student_roll", student_roll);

    if (ordErr) throw ordErr;

    const totalBill = orders.reduce((sum, o) => sum + o.quantity * o.menu_items.price, 0);

    // Get payments
    const { data: payments, error: payErr } = await supabase
      .from("payments")
      .select("*")
      .eq("student_roll", student_roll);

    if (payErr) throw payErr;

    const totalPaid = payments.reduce((sum, p) => sum + p.paid, 0);

    res.json({
      total_bill: totalBill,
      total_paid: totalPaid,
      remaining: totalBill - totalPaid,
      payments,
    });
  } catch (err) {
    console.error("Bill error:", err);
    res.status(500).json({ error: "Could not fetch bill" });
  }
});

export default router;
