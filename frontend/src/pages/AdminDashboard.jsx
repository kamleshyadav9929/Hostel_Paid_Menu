import { useEffect, useState } from "react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [orderItems, setOrderItems] = useState({}); // { item_id: quantity }
  const [submitting, setSubmitting] = useState(false);

  const filteredStudents = students.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.roll_number.toLowerCase().includes(q) ||
      (s.room_number && s.room_number.toLowerCase().includes(q))
    );
  });

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

  if (loading) return <p style={{ color: "var(--color-slate-400)" }}>Loading Data…</p>;

  const totalCost = Object.entries(orderItems).reduce((sum, [id, qty]) => {
    const item = menu.find((m) => m.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* 1. Select Student */}
      <div className="bento-card" style={{ position: "relative" }}>
        <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "14px", color: "var(--color-charcoal)" }}>1. Select Student</h3>

        {/* Unified Search & Select */}
        <div style={{ position: "relative", width: "100%", maxWidth: "400px" }}>
          {!selectedStudent ? (
            <input
              className="input-field"
              type="text"
              placeholder="Start typing Name, Roll No, or Room..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: "100%", marginBottom: "0" }}
            />
          ) : (
            <div
              className="input-field"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "var(--color-amber-50)",
                borderColor: "var(--color-ochre)",
                cursor: "pointer"
              }}
              onClick={() => {
                setSelectedStudent("");
                setSearchQuery("");
              }}
            >
              <span style={{ fontWeight: 600 }}>
                {students.find(s => s.roll_number === selectedStudent)?.name} ({selectedStudent})
              </span>
              <span style={{ fontSize: "12px", color: "var(--color-slate-400)" }}>✕ Change</span>
            </div>
          )}

          {/* Results Dropdown */}
          {!selectedStudent && searchQuery.length > 0 && (
            <div style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              zIndex: 100,
              backgroundColor: "white",
              borderRadius: "8px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
              maxHeight: "250px",
              overflowY: "auto",
              marginTop: "4px",
              border: "1px solid var(--color-sand)"
            }}>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((s) => (
                  <div
                    key={s.id}
                    className="search-result-item"
                    style={{
                      padding: "10px 14px",
                      cursor: "pointer",
                      borderBottom: "1px solid var(--color-sand)",
                      transition: "background 0.2s"
                    }}
                    onClick={() => {
                      setSelectedStudent(s.roll_number);
                      setSearchQuery("");
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = "var(--color-sand)"}
                    onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                  >
                    <div style={{ fontWeight: 600, fontSize: "14px" }}>{s.name}</div>
                    <div style={{ fontSize: "12px", color: "var(--color-slate-500)" }}>
                      Roll: {s.roll_number} {s.room_number ? `· Room: ${s.room_number}` : ""}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: "14px", textAlign: "center", color: "var(--color-slate-400)", fontSize: "14px" }}>
                  No students match your search.
                </div>
              )}
            </div>
          )}
        </div>
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

  if (loading) return <p style={{ color: "var(--color-slate-400)" }}>Loading…</p>;

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
    const fetch = async () => {
      try {
        const { data } = await getAllOrders();
        setOrders(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const groupedOrders = orders.reduce((groups, order) => {
    const date = order.date;
    if (!groups[date]) groups[date] = [];
    groups[date].push(order);
    return groups;
  }, {});

  const sortedDates = Object.keys(groupedOrders).sort((a, b) => new Date(b) - new Date(a));

  if (loading) return <p style={{ color: "var(--color-slate-400)" }}>Loading…</p>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {sortedDates.map((date) => (
        <div key={date} className="bento-card" style={{ padding: "20px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--color-charcoal)", marginBottom: "16px", display: "flex", justifyContent: "space-between" }}>
            <span>{new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
            <span style={{ fontSize: "12px", color: "var(--color-slate-400)", fontWeight: 400 }}>{groupedOrders[date].length} Orders</span>
          </h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-outfit)" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-sand)" }}>
                  {["Roll No.", "Item", "Qty"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontSize: "11px", color: "var(--color-slate-400)", textTransform: "uppercase" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {groupedOrders[date].map((o) => (
                  <tr key={o.id} style={{ borderBottom: "1px solid var(--color-sand)" }}>
                    <td style={{ padding: "10px 12px", fontSize: "14px", fontWeight: 500 }}>{o.student_roll}</td>
                    <td style={{ padding: "10px 12px", fontSize: "14px" }}>{o.menu_items?.item_name}</td>
                    <td style={{ padding: "10px 12px", fontSize: "14px" }}>{o.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
      {orders.length === 0 && (
        <div className="bento-card" style={{ textAlign: "center", padding: "40px", color: "var(--color-slate-400)" }}>
          No orders yet
        </div>
      )}
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════ */
/*  PAYMENTS TAB                                              */
/* ═══════════════════════════════════════════════════════════ */
function PaymentsTab() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    try {
      const { data } = await getStudents();
      setStudents(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStudents(); }, []);

  if (loading) return <p style={{ color: "var(--color-slate-400)" }}>Loading…</p>;

  // Global aggregate
  const globalBill = students.reduce((sum, s) => sum + s.total_bill, 0);

  return (
    <div>
      {/* Global Summary */}
      <div
        className="stagger"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div className="bento-card animate-fade-in-up" style={{ padding: "16px 20px" }}>
          <p style={{ fontSize: "12px", color: "var(--color-slate-400)", marginBottom: "4px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Total Outstanding Mess Bill</p>
          <p style={{ fontSize: "24px", fontWeight: 700, color: "var(--color-charcoal)" }}>₹{globalBill}</p>
        </div>
      </div>

      {/* Student List (Balance View) */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {students.map((s) => (
          <div
            key={s.id}
            className="bento-card"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px 20px"
            }}
          >
            <div>
              <h4 style={{ fontSize: "15px", fontWeight: 600 }}>{s.name}</h4>
              <p style={{ fontSize: "13px", color: "var(--color-slate-600)" }}>
                {s.roll_number} {s.room_number ? `· Room: ${s.room_number}` : ""}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "12px", color: "var(--color-slate-400)", marginBottom: "2px" }}>Total Balance</p>
              <p style={{ fontSize: "18px", fontWeight: 700, color: "var(--color-charcoal)" }}>₹{s.total_bill}</p>
            </div>
          </div>
        ))}
        {students.length === 0 && (
          <div className="bento-card" style={{ textAlign: "center", padding: "40px", color: "var(--color-slate-400)" }}>
            No students registered
          </div>
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
  const [newRoom, setNewRoom] = useState("");
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
      await addStudent(newName, newRoll, newPassword, newRoom);
      toast.success(`Student ${newName} added successfully!`);
      setNewName("");
      setNewRoll("");
      setNewRoom("");
      setNewPassword("");
      fetchStudents();
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed to add student");
    }
  };

  if (loading && students.length === 0) return <p style={{ color: "var(--color-slate-400)" }}>Loading…</p>;

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
            <label style={{ display: "block", fontSize: "12px", color: "var(--color-slate-600)", marginBottom: "4px", fontWeight: 500 }}>Room Number</label>
            <input
              className="input-field"
              type="text"
              placeholder="e.g. 101"
              value={newRoom}
              onChange={(e) => setNewRoom(e.target.value)}
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
              {["Name", "Roll No.", "Room No.", "Total Bill"].map((h) => (
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
              <th
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
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} style={{ borderBottom: "1px solid var(--color-sand)" }}>
                <td style={{ padding: "12px 14px", fontSize: "14px", fontWeight: 500 }}>{s.name}</td>
                <td style={{ padding: "12px 14px", fontSize: "14px" }}>{s.roll_number}</td>
                <td style={{ padding: "12px 14px", fontSize: "14px" }}>{s.room_number || "-"}</td>
                <td style={{ padding: "12px 14px", fontSize: "14px" }}>₹{s.total_bill}</td>
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
                <td colSpan={4} style={{ padding: "40px", textAlign: "center", color: "var(--color-slate-400)" }}>
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
