import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import OrderCard from "../components/OrderCard";
import { getMyOrders, getMyBill } from "../services/api";

export default function StudentDashboard() {
  const [orders, setOrders] = useState([]);
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordRes, billRes] = await Promise.all([getMyOrders(), getMyBill()]);
        setOrders(ordRes.data);
        setBill(billRes.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const today = new Date().toISOString().split("T")[0];
  const todayOrders = orders.filter((o) => o.date === today);

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
          <p style={{ color: "var(--color-slate-400)", fontSize: "15px" }}>Loading dashboard…</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "28px 20px" }}>
        {/* Welcome Header */}
        <div className="animate-fade-in-up" style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "26px", fontWeight: 700 }}>
            Welcome, {user.name || user.roll_number} 👋
          </h1>
          <p style={{ color: "var(--color-slate-600)", fontSize: "15px", marginTop: "4px" }}>
            Here's your mess overview for today
          </p>
        </div>

        {/* Bento Grid — Stats */}
        <div
          className="stagger"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          {/* Total Bill */}
          <div className="bento-card animate-fade-in-up">
            <p style={{ fontSize: "13px", color: "var(--color-slate-400)", marginBottom: "6px", fontWeight: 500 }}>Total Bill</p>
            <p style={{ fontSize: "28px", fontWeight: 700, color: "var(--color-charcoal)" }}>
              ₹{bill?.total_bill || 0}
            </p>
          </div>

          {/* Paid */}
          <div className="bento-card animate-fade-in-up">
            <p style={{ fontSize: "13px", color: "var(--color-slate-400)", marginBottom: "6px", fontWeight: 500 }}>Paid</p>
            <p style={{ fontSize: "28px", fontWeight: 700, color: "var(--color-emerald-500)" }}>
              ₹{bill?.total_paid || 0}
            </p>
          </div>

          {/* Remaining */}
          <div className="bento-card animate-fade-in-up">
            <p style={{ fontSize: "13px", color: "var(--color-slate-400)", marginBottom: "6px", fontWeight: 500 }}>Remaining</p>
            <p
              style={{
                fontSize: "28px",
                fontWeight: 700,
                color: (bill?.remaining || 0) > 0 ? "var(--color-red-500)" : "var(--color-emerald-500)",
              }}
            >
              ₹{bill?.remaining || 0}
            </p>
          </div>
        </div>

        {/* Today's Orders */}
        <section className="animate-fade-in-up">
          <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "14px", display: "flex", alignItems: "center" }}>
            Today's Orders
            <span
              className="chip"
              style={{
                marginLeft: "10px",
                backgroundColor: "var(--color-amber-50)",
                color: "var(--color-ochre)",
                fontSize: "12px",
              }}
            >
              {todayOrders.length}
            </span>
          </h2>
          {todayOrders.length === 0 ? (
            <div className="bento-card" style={{ textAlign: "center", padding: "40px", color: "var(--color-slate-400)", fontSize: "14px" }}>
              No orders placed for you today.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {todayOrders.map((o) => (
                <OrderCard
                  key={o.id}
                  itemName={o.menu_items?.item_name}
                  quantity={o.quantity}
                  date={o.date}
                  price={o.menu_items?.price}
                />
              ))}
            </div>
          )}
        </section>

        {/* All Orders */}
        {orders.length > 0 && (
          <section className="animate-fade-in-up" style={{ marginTop: "36px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "14px", display: "flex", alignItems: "center" }}>
              Order History
              <span
                className="chip"
                style={{
                  marginLeft: "10px",
                  backgroundColor: "var(--color-sand)",
                  color: "var(--color-slate-600)",
                  fontSize: "12px",
                }}
              >
                {orders.length}
              </span>
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {orders.map((o) => (
                <OrderCard
                  key={o.id}
                  itemName={o.menu_items?.item_name}
                  quantity={o.quantity}
                  date={o.date}
                  price={o.menu_items?.price}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
