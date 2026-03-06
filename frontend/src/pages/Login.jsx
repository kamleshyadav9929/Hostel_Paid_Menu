import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const [rollNumber, setRollNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await login(rollNumber, password);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/student");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, var(--color-cream) 0%, var(--color-amber-50) 100%)",
        padding: "20px",
      }}
    >
      <div
        className="animate-scale-in"
        style={{
          width: "100%",
          maxWidth: "420px",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              backgroundColor: "var(--color-amber-500)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              margin: "0 auto 16px",
              boxShadow: "0 8px 24px rgba(255, 193, 7, 0.25)",
            }}
          >
            🍽️
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "6px" }}>
            HostelMess
          </h1>
          <p style={{ color: "var(--color-slate-600)", fontSize: "15px" }}>
            Sign in with your roll number
          </p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="bento-card"
          style={{ padding: "32px" }}
        >
          {error && (
            <div
              className="animate-fade-in-up"
              style={{
                padding: "12px 16px",
                backgroundColor: "var(--color-red-50)",
                border: "1px solid #FECACA",
                borderRadius: "10px",
                color: "var(--color-red-500)",
                fontSize: "14px",
                marginBottom: "20px",
              }}
            >
              {error}
            </div>
          )}

          <div style={{ marginBottom: "20px" }}>
            <label
              htmlFor="roll-number"
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--color-slate-600)",
                marginBottom: "6px",
              }}
            >
              Roll Number
            </label>
            <input
              id="roll-number"
              type="text"
              className="input-field"
              placeholder="e.g. 2023123"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label
              htmlFor="password"
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--color-slate-600)",
                marginBottom: "6px",
              }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              className="input-field"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: "100%", padding: "14px", fontSize: "15px" }}
          >
            {loading ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    width: "16px",
                    height: "16px",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    animation: "spin 0.6s linear infinite",
                  }}
                />
                Signing in…
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: "20px",
            fontSize: "13px",
            color: "var(--color-slate-400)",
          }}
        >
          Contact your hostel warden for credentials
        </p>
      </div>

      {/* Spinner keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
