import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 28px",
        backgroundColor: "rgba(250, 247, 242, 0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--color-sand)",
      }}
      className="animate-slide-down"
    >
      {/* Logo / Title */}
      <Link
        to={user?.role === "admin" ? "/admin" : "/student"}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          textDecoration: "none",
          color: "var(--color-charcoal)",
        }}
      >
        <span style={{ fontSize: "24px" }}>🍽️</span>
        <span
          style={{
            fontFamily: "var(--font-outfit)",
            fontWeight: 700,
            fontSize: "18px",
            letterSpacing: "-0.3px",
          }}
        >
          HostelMess
        </span>
      </Link>

      {/* Nav Links */}
      {user && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {user.role === "student" && (
              <span style={{ padding: "8px 16px", fontSize: "13px", fontWeight: 600, color: "var(--color-charcoal)" }}>
                Student Dashboard
              </span>
          )}
          {user.role === "admin" && (
            <Link to="/admin" className="btn-secondary" style={{ padding: "8px 16px", fontSize: "13px", textDecoration: "none" }}>
              Dashboard
            </Link>
          )}

          {/* User chip + Logout */}
          <div
            className="chip"
            style={{
              backgroundColor: "var(--color-amber-50)",
              color: "var(--color-ochre)",
              marginLeft: "8px",
              fontWeight: 600,
            }}
          >
            {user.roll_number}
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: "8px 16px",
              fontSize: "13px",
              fontFamily: "var(--font-outfit)",
              fontWeight: 500,
              color: "var(--color-red-500)",
              background: "var(--color-red-50)",
              border: "1px solid transparent",
              borderRadius: "10px",
              cursor: "pointer",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#FED7D7")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "var(--color-red-50)")}
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
