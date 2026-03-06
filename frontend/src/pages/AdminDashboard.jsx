import { useEffect, useState, useRef } from "react";
import Navbar from "../components/Navbar";
import {
  getMenu,
  addMenuItem,
  updateMenuItem,
  getAllOrders,
  updatePayment,
  getStudents,
  addStudent,
  placeOrder,
} from "../services/api";
import toast, { Toaster } from "react-hot-toast";

const TABS = ["Place Order", "Menu", "Orders", "Payments", "Students"];

function SkeletonLoader({ count = 3, height = "64px" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          className="skeleton" 
          style={{ height, width: "100%", borderRadius: "12px" }} 
        />
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("Place Order");

  return (
    <>
      <Navbar />
      <Toaster position="top-center" />

      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "28px 20px" }}>
        <div className="animate-fade-in-up" style={{ marginBottom: "24px" }}>
          <h1 style={{ fontSize: "26px", fontWeight: 700 }}>Admin Dashboard</h1>
          <p style={{ color: "var(--color-slate-600)", fontSize: "15px", marginTop: "4px" }}>
            Manage menu, orders, and payments
          </p>
        </div>

        {/* Tab Bar Container (Scrollable on mobile) */}
        <div 
          style={{ width: "100%", overflowX: "auto", paddingBottom: "8px", marginBottom: "16px", WebkitOverflowScrolling: "touch" }}
        >
          <div
            className="animate-fade-in-up"
            style={{
              display: "inline-flex",
              gap: "4px",
              backgroundColor: "var(--color-sand)",
              borderRadius: "12px",
              padding: "4px",
              minWidth: "max-content",
            }}
          >
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "10px 22px",
                  borderRadius: "10px",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "var(--font-outfit)",
                  fontWeight: activeTab === tab ? 600 : 400,
                  fontSize: "14px",
                  backgroundColor: activeTab === tab ? "var(--color-white)" : "transparent",
                  color: activeTab === tab ? "var(--color-charcoal)" : "var(--color-slate-600)",
                  boxShadow: activeTab === tab ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
                  transition: "all 0.2s ease",
                  whiteSpace: "nowrap",
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in-up">
          {activeTab === "Place Order" && <PlaceOrderTab />}
          {activeTab === "Menu" && <MenuTab />}
          {activeTab === "Orders" && <OrdersTab />}
          {activeTab === "Payments" && <PaymentsTab />}
          {activeTab === "Students" && <StudentsTab />}
        </div>
      </main>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/*  PLACE ORDER TAB                                           */
/* ═══════════════════════════════════════════════════════════ */
function PlaceOrderTab() {
  const [students, setStudents] = useState([]);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedStudent, setSelectedStudent] = useState("");
  const [orderItems, setOrderItems] = useState({}); // { item_id: quantity }
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stuRes, menuRes] = await Promise.all([getStudents(), getMenu()]);
        setStudents(stuRes.data);
        setMenu(menuRes.data.filter((m) => m.available));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleQuantityChange = (itemId, delta) => {
    setOrderItems((prev) => {
      const current = prev[itemId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      return { ...prev, [itemId]: next };
    });
  };

  const handleSubmit = async () => {
    if (!selectedStudent) return toast.error("Please select a student.");
    const itemsToOrder = Object.entries(orderItems);
    if (itemsToOrder.length === 0) return toast.error("Please add items to order.");

    setSubmitting(true);
    let successCount = 0;

    try {
      // Submit orders one by one (or could be rewritten as a bulk insert in backend)
      // Since backend expects individual orders:
      for (const [itemId, quantity] of itemsToOrder) {
        await placeOrder(selectedStudent, itemId, quantity);
        successCount++;
      }
      toast.success(`Successfully placed ${successCount} order(s)!`);
      setSelectedStudent("");
      setOrderItems({});
    } catch (err) {
      toast.error("An error occurred while placing orders.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <SkeletonLoader count={3} height="120px" />;

  const totalCost = Object.entries(orderItems).reduce((sum, [id, qty]) => {
    const item = menu.find((m) => m.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* 1. Select Student */}
      <div className="bento-card">
        <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "14px", color: "var(--color-charcoal)" }}>1. Select Student</h3>
        <select
          className="input-field"
          style={{ width: "100%", maxWidth: "400px" }}
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
        >
          <option value="">-- Choose a Roll Number --</option>
          {students.map((s) => (
            <option key={s.id} value={s.roll_number}>
              {s.name} ({s.roll_number})
            </option>
          ))}
        </select>
      </div>

      {/* 2. Select Items */}
      <div className="bento-card">
        <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "14px", color: "var(--color-charcoal)" }}>2. Add Menu Items</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "12px" }}>
          {menu.map((item) => {
            const qty = orderItems[item.id] || 0;
            return (
              <div
                key={item.id}
                style={{
                  padding: "12px",
                  borderRadius: "10px",
                  border: "1px solid var(--color-sand)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: qty > 0 ? "var(--color-amber-50)" : "transparent",
                  transition: "background-color 0.2s"
                }}
              >
                <div>
                  <h4 style={{ fontSize: "14px", fontWeight: 600 }}>{item.item_name}</h4>
                  <p style={{ fontSize: "13px", color: "var(--color-slate-500)" }}>₹{item.price}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <button
                    onClick={() => handleQuantityChange(item.id, -1)}
                    style={{
                      width: "28px", height: "28px", borderRadius: "50%",
                      border: "none", backgroundColor: "var(--color-sand)",
                      cursor: qty > 0 ? "pointer" : "default", opacity: qty > 0 ? 1 : 0.5
                    }}
                    disabled={qty === 0}
                  >−</button>
                  <span style={{ fontSize: "14px", fontWeight: 600, minWidth: "16px", textAlign: "center" }}>{qty}</span>
                  <button
                    onClick={() => handleQuantityChange(item.id, 1)}
                    style={{
                      width: "28px", height: "28px", borderRadius: "50%",
                      border: "none", backgroundColor: "var(--color-charcoal)", color: "white",
                      cursor: "pointer"
                    }}
                  >+</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Submit Order */}
      <div className="bento-card" style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "flex-end" }}>
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%", maxWidth: "300px", fontSize: "18px", fontWeight: 600 }}>
          <span>Total Cost:</span>
          <span>₹{totalCost}</span>
        </div>
        <button 
          className="btn-primary" 
          disabled={!selectedStudent || totalCost === 0 || submitting}
          onClick={handleSubmit}
          style={{ padding: "12px 32px", width: "100%", maxWidth: "300px" }}
        >
          {submitting ? "Placing Order..." : "Confirm & Place Order"}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/*  MENU TAB                                                  */
/* ═══════════════════════════════════════════════════════════ */
function MenuTab() {
  const [items, setItems] = useState([]);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      const { data } = await getMenu();
      setItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleAdd = async () => {
    if (!newName || !newPrice) return;
    try {
      await addMenuItem(newName, parseInt(newPrice));
      toast.success(`Added "${newName}"`);
      setNewName("");
      setNewPrice("");
      fetchItems();
    } catch (e) {
      toast.error("Failed to add item");
    }
  };

  const toggleAvailability = async (item) => {
    try {
      await updateMenuItem(item.id, { available: !item.available });
      toast.success(`${item.item_name} ${!item.available ? "enabled" : "disabled"}`);
      fetchItems();
    } catch (e) {
      toast.error("Update failed");
    }
  };

  const handlePriceUpdate = async (item, newP) => {
    if (!newP || parseInt(newP) === item.price) return;
    try {
      await updateMenuItem(item.id, { price: parseInt(newP) });
      toast.success(`Price updated for ${item.item_name}`);
      fetchItems();
    } catch (e) {
      toast.error("Price update failed");
    }
  };

  if (loading) return <SkeletonLoader count={4} height="64px" />;

  return (
    <div>
      {/* Add Item Form */}
      <div className="bento-card" style={{ marginBottom: "20px" }}>
        <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "14px" }}>Add New Item</h3>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input
            className="input-field"
            style={{ flex: "2", minWidth: "180px" }}
            placeholder="Item name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <input
            className="input-field"
            style={{ flex: "1", minWidth: "100px" }}
            type="number"
            placeholder="Price (₹)"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
          />
          <button className="btn-primary" onClick={handleAdd}>
            + Add
          </button>
        </div>
      </div>

      {/* Item List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {items.map((item) => (
          <div
            key={item.id}
            className="bento-card"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
              opacity: item.available ? 1 : 0.5,
            }}
          >
            <div style={{ flex: "1" }}>
              <h4 style={{ fontSize: "15px", fontWeight: 600 }}>{item.item_name}</h4>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                className="input-field"
                type="number"
                defaultValue={item.price}
                style={{ width: "80px", padding: "8px 12px", fontSize: "14px" }}
                onBlur={(e) => handlePriceUpdate(item, e.target.value)}
              />
              <span style={{ fontSize: "13px", color: "var(--color-slate-400)" }}>₹</span>
              <button
                className="btn-secondary"
                style={{
                  padding: "8px 14px",
                  fontSize: "12px",
                  color: item.available ? "var(--color-red-500)" : "var(--color-emerald-500)",
                }}
                onClick={() => toggleAvailability(item)}
              >
                {item.available ? "Disable" : "Enable"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/*  ORDERS TAB                                                */
/* ═══════════════════════════════════════════════════════════ */
function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await getAllOrders();
        setOrders(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <SkeletonLoader count={5} height="48px" />;

  // Group orders by date
  const grouped = {};
  (orders || []).forEach((o) => {
    const key = o.date || "Unknown Date";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(o);
  });

  // Sort dates descending
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === "Unknown Date") return "Unknown Date";
    const d = new Date(dateStr + "T00:00:00");
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return "Today — " + d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday — " + d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
    return d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  };

  const COLS = ["Name", "Roll No", "Room No", "Item", "Qty"];

  if (sortedDates.length === 0) {
    return (
      <div className="bento-card" style={{ textAlign: "center", padding: "40px", color: "var(--color-slate-400)" }}>
        No orders yet
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {sortedDates.map((date) => (
        <div key={date}>
          {/* Date Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "5px 14px",
              borderRadius: "99px",
              backgroundColor: "var(--color-charcoal)",
              color: "var(--color-white)",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.3px",
            }}>
              📆 {formatDate(date)}
            </div>
            <span style={{ fontSize: "12px", color: "var(--color-slate-400)", fontWeight: 500 }}>
              {grouped[date].length} order{grouped[date].length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Table for this date */}
          <div className="bento-card" style={{ overflowX: "auto", padding: 0 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-outfit)" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--color-sand)" }}>
                  {COLS.map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: "11px 16px",
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "var(--color-slate-400)",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {grouped[date].map((o, idx) => (
                  <tr
                    key={o.id}
                    style={{
                      borderBottom: idx < grouped[date].length - 1 ? "1px solid var(--color-sand)" : "none",
                      backgroundColor: idx % 2 === 1 ? "rgba(0,0,0,0.012)" : "transparent",
                    }}
                  >
                    <td style={{ padding: "11px 16px", fontSize: "14px", fontWeight: 600, color: "var(--color-charcoal)", whiteSpace: "nowrap" }}>
                      {o.student_name || o.student_roll}
                    </td>
                    <td style={{ padding: "11px 16px", fontSize: "13px", color: "var(--color-slate-600)", whiteSpace: "nowrap" }}>
                      {o.student_roll}
                    </td>
                    <td style={{ padding: "11px 16px", fontSize: "13px", color: "var(--color-slate-600)", whiteSpace: "nowrap" }}>
                      {o.room_no || <span style={{ color: "var(--color-slate-300)" }}>—</span>}
                    </td>
                    <td style={{ padding: "11px 16px", fontSize: "14px", color: "var(--color-charcoal)", whiteSpace: "nowrap" }}>
                      {o.menu_items?.item_name}
                    </td>
                    <td style={{ padding: "11px 16px" }}>
                      <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "28px",
                        height: "28px",
                        borderRadius: "8px",
                        backgroundColor: "var(--color-sand)",
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "var(--color-charcoal)",
                      }}>
                        {o.quantity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════ */
/*  PAYMENTS TAB                                              */
/* ═══════════════════════════════════════════════════════════ */

// Build last 12 months as { value: "YYYY-MM", label: "Month YYYY" }
function buildMonthOptions() {
  const opts = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleString("default", { month: "long", year: "numeric" });
    opts.push({ value, label });
  }
  return opts;
}

const MONTH_OPTIONS = buildMonthOptions();

function MonthDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = MONTH_OPTIONS.find((o) => o.value === value) || MONTH_OPTIONS[0];

  return (
    <div ref={ref} style={{ position: "relative", userSelect: "none" }}>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "10px 16px",
          borderRadius: "12px",
          border: "1.5px solid var(--color-sand)",
          backgroundColor: "var(--color-white)",
          cursor: "pointer",
          fontFamily: "var(--font-outfit)",
          fontSize: "14px",
          fontWeight: 600,
          color: "var(--color-charcoal)",
          boxShadow: open ? "0 4px 20px rgba(0,0,0,0.08)" : "0 1px 4px rgba(0,0,0,0.04)",
          transition: "box-shadow 0.2s, border-color 0.2s",
          borderColor: open ? "var(--color-charcoal)" : "var(--color-sand)",
          minWidth: "200px",
          justifyContent: "space-between",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px" }}>📅</span>
          {selected.label}
        </span>
        <span style={{
          display: "inline-block",
          transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1)",
          transform: open ? "rotate(180deg)" : "rotate(0deg)",
          fontSize: "12px",
          color: "var(--color-slate-400)",
        }}>▾</span>
      </button>

      {/* Dropdown Panel */}
      <div style={{
        position: "absolute",
        top: "calc(100% + 8px)",
        right: 0,
        width: "220px",
        backgroundColor: "var(--color-white)",
        borderRadius: "14px",
        border: "1.5px solid var(--color-sand)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        overflow: "visible",
        zIndex: 100,
        // Animation
        opacity: open ? 1 : 0,
        transform: open ? "translateY(0) scale(1)" : "translateY(-8px) scale(0.97)",
        pointerEvents: open ? "auto" : "none",
        transition: "opacity 0.2s ease, transform 0.2s cubic-bezier(0.34,1.56,0.64,1)",
      }}>
        <div style={{
          padding: "6px",
          maxHeight: "168px",
          overflowY: "auto",
          scrollbarWidth: "thin",
          scrollbarColor: "var(--color-sand) transparent",
          borderRadius: "12px",
        }}>
          {MONTH_OPTIONS.map((opt, idx) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "9px",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "var(--font-outfit)",
                  fontSize: "13px",
                  fontWeight: isSelected ? 700 : 400,
                  backgroundColor: isSelected ? "var(--color-charcoal)" : "transparent",
                  color: isSelected ? "var(--color-white)" : idx === 0 ? "var(--color-charcoal)" : "var(--color-slate-600)",
                  transition: "background-color 0.15s, color 0.15s",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => { if (!isSelected) { e.currentTarget.style.backgroundColor = "var(--color-sand)"; e.currentTarget.style.color = "var(--color-charcoal)"; }}}
                onMouseLeave={(e) => { if (!isSelected) { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = idx === 0 ? "var(--color-charcoal)" : "var(--color-slate-600)"; }}}
              >
                <span>{opt.label}</span>
                {idx === 0 && <span style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "99px", backgroundColor: isSelected ? "rgba(255,255,255,0.2)" : "var(--color-sand)", color: isSelected ? "white" : "var(--color-slate-500)", fontWeight: 600 }}>Current</span>}
                {isSelected && idx !== 0 && <span style={{ fontSize: "14px" }}>✓</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PaymentsTab() {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fade, setFade] = useState(true);

  const fetchStudents = async (month) => {
    setFade(false); // trigger fade-out
    setLoading(true);
    try {
      const { data } = await getStudents(month);
      setStudents(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setTimeout(() => setFade(true), 50); // trigger fade-in after data loads
    }
  };

  useEffect(() => { fetchStudents(selectedMonth); }, [selectedMonth]);

  const globalBill = students.reduce((sum, s) => sum + s.total_bill, 0);
  const monthLabel = MONTH_OPTIONS.find((o) => o.value === selectedMonth)?.label || selectedMonth;

  return (
    <div>
      {/* Header + Dropdown */}
      <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--color-charcoal)" }}>Monthly Bill</h2>
          <p style={{ fontSize: "13px", color: "var(--color-slate-400)", marginTop: "2px" }}>
            Showing bill for <strong>{monthLabel}</strong>
          </p>
        </div>
        <MonthDropdown value={selectedMonth} onChange={setSelectedMonth} />
      </div>

      {/* Total Summary Card */}
      <div className="bento-card animate-fade-in-up" style={{ padding: "16px 20px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ fontSize: "14px", color: "var(--color-slate-500)", fontWeight: 500 }}>Total mess bill — {monthLabel}</p>
        <p style={{ fontSize: "22px", fontWeight: 700, color: "var(--color-charcoal)" }}>
          {loading ? "…" : `₹${globalBill}`}
        </p>
      </div>

      {/* Student Bill List with fade animation */}
      <div style={{ opacity: fade ? 1 : 0, transition: "opacity 0.3s ease", display: "flex", flexDirection: "column", gap: "8px" }}>
        {loading ? (
          <div style={{ padding: "10px 0" }}><SkeletonLoader count={4} height="72px" /></div>
        ) : (
          <>
            {students.map((s) => (
              <div
                key={s.id}
                className="bento-card"
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", gap: "12px" }}
              >
                {/* Name + Roll */}
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: "15px", fontWeight: 600, color: "var(--color-charcoal)" }}>{s.name}</h4>
                  <p style={{ fontSize: "12px", color: "var(--color-slate-400)", marginTop: "2px" }}>{s.roll_number}</p>
                </div>

                {/* Two Bill Columns */}
                <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                  {/* Month Bill */}
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: "10px", color: "var(--color-slate-400)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: "2px" }}>
                      {monthLabel}
                    </p>
                    <p style={{ fontSize: "16px", fontWeight: 700, color: s.month_bill > 0 ? "var(--color-ochre)" : "var(--color-slate-300)" }}>
                      {s.month_bill > 0 ? `₹${s.month_bill}` : "—"}
                    </p>
                  </div>

                  {/* Divider */}
                  <div style={{ width: "1px", height: "32px", backgroundColor: "var(--color-sand)" }} />

                  {/* All-Time Bill */}
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: "10px", color: "var(--color-slate-400)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: "2px" }}>
                      All Time
                    </p>
                    <p style={{ fontSize: "16px", fontWeight: 700, color: s.all_time_bill > 0 ? "var(--color-charcoal)" : "var(--color-slate-300)" }}>
                      {s.all_time_bill > 0 ? `₹${s.all_time_bill}` : "—"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {students.length === 0 && (
              <div className="bento-card" style={{ textAlign: "center", padding: "40px", color: "var(--color-slate-400)" }}>
                No students registered
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}



/* ═══════════════════════════════════════════════════════════ */
/*  STUDENTS TAB                                              */
/* ═══════════════════════════════════════════════════════════ */
function StudentsTab() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Student Form State
  const [newName, setNewName] = useState("");
  const [newRoll, setNewRoll] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data } = await getStudents();
      setStudents(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStudents(); }, []);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!newName || !newRoll || !newPassword) {
      return toast.error("Please fill in all fields");
    }
    try {
      await addStudent(newName, newRoll, newPassword);
      toast.success(`Student ${newName} added successfully!`);
      setNewName("");
      setNewRoll("");
      setNewPassword("");
      fetchStudents();
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed to add student");
    }
  };

  if (loading && students.length === 0) return <SkeletonLoader count={4} height="56px" />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Add Student Form */}
      <div className="bento-card">
        <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "14px", color: "var(--color-charcoal)" }}>Register New Student</h3>
        <form 
          onSubmit={handleAddStudent}
          style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "flex-end" }}
        >
          <div style={{ flex: "1", minWidth: "150px" }}>
            <label style={{ display: "block", fontSize: "12px", color: "var(--color-slate-600)", marginBottom: "4px", fontWeight: 500 }}>Name</label>
            <input
              className="input-field"
              type="text"
              placeholder="e.g. John Doe"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ flex: "1", minWidth: "120px" }}>
            <label style={{ display: "block", fontSize: "12px", color: "var(--color-slate-600)", marginBottom: "4px", fontWeight: 500 }}>Roll Number</label>
            <input
              className="input-field"
              type="text"
              placeholder="e.g. 2024001"
              value={newRoll}
              onChange={(e) => setNewRoll(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ flex: "1", minWidth: "120px" }}>
            <label style={{ display: "block", fontSize: "12px", color: "var(--color-slate-600)", marginBottom: "4px", fontWeight: 500 }}>Password</label>
            <input
              className="input-field"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>
          <button type="submit" className="btn-primary" style={{ height: "42px", padding: "0 24px" }}>
            + Register
          </button>
        </form>
      </div>

      <div className="bento-card" style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-outfit)" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid var(--color-sand)" }}>
            {["Name", "Roll No.", "Bill", "Paid", "Status"].map((h) => (
              <th
                key={h}
                style={{
                  textAlign: "left",
                  padding: "12px 14px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--color-slate-400)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id} style={{ borderBottom: "1px solid var(--color-sand)" }}>
              <td style={{ padding: "12px 14px", fontSize: "14px", fontWeight: 500 }}>{s.name}</td>
              <td style={{ padding: "12px 14px", fontSize: "14px" }}>{s.roll_number}</td>
              <td style={{ padding: "12px 14px", fontSize: "14px" }}>₹{s.total_bill}</td>
              <td style={{ padding: "12px 14px", fontSize: "14px" }}>₹{s.total_paid}</td>
              <td style={{ padding: "12px 14px" }}>
                <span
                  className="chip"
                  style={{
                    backgroundColor: s.payment_status === "paid" ? "var(--color-emerald-50)" : s.payment_status === "no_bill" ? "var(--color-sand)" : "var(--color-red-50)",
                    color: s.payment_status === "paid" ? "var(--color-emerald-500)" : s.payment_status === "no_bill" ? "var(--color-slate-600)" : "var(--color-red-500)",
                    fontWeight: 600,
                  }}
                >
                  {s.payment_status === "paid" ? "Paid" : s.payment_status === "no_bill" ? "No Bill" : "Pending"}
                </span>
              </td>
            </tr>
          ))}
          {students.length === 0 && (
            <tr>
              <td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "var(--color-slate-400)" }}>
                No students registered
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
    </div>
  );
}
