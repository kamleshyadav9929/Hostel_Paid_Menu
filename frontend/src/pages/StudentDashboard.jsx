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
  const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
  const todayOrders = orders.filter((o) => o.date === today);
  const monthOrders = orders.filter((o) => o.date.startsWith(currentMonth));


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

        {/* Order History (Current Month Only, Grouped by Date) */}
        {monthOrders.length > 0 && (
          <section className="animate-fade-in-up" style={{ marginTop: "36px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "14px", display: "flex", alignItems: "center" }}>
              Order History (This Month)
              <span
                className="chip"
                style={{
                  marginLeft: "10px",
                  backgroundColor: "var(--color-sand)",
                  color: "var(--color-slate-600)",
                  fontSize: "12px",
                }}
              >
                {monthOrders.length}
              </span>
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {Object.entries(
                monthOrders.reduce((groups, order) => {
                  const date = order.date;
                  if (!groups[date]) groups[date] = [];
                  groups[date].push(order);
                  return groups;
                }, {})
              )
                .sort(([a], [b]) => new Date(b) - new Date(a)) // Sort dates descending
                .map(([date, group]) => (
                  <div key={date}>
                    <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-slate-500)", marginBottom: "10px", paddingLeft: "4px" }}>
                      {date === today ? "Today" : new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {group.map((o) => (
                        <OrderCard
                          key={o.id}
                          itemName={o.menu_items?.item_name}
                          quantity={o.quantity}
                          date={o.date}
                          price={o.menu_items?.price}
                        />
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}
      </main>

    </>
  );
}
