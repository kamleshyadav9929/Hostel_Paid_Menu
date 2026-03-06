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
        backgroundColor: "var(--color-cream)",
        padding: "20px",
        position: "relative",
        overflow: "hidden",
        fontFamily: "var(--font-outfit)",
      }}
    >
      {/* Animated Background Elements */}
      <div 
        className="blob-1"
        style={{
          position: "absolute",
          top: "-10%",
          left: "-10%",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(230,147,10,0.12) 0%, rgba(255,255,255,0) 70%)",
          filter: "blur(40px)",
          zIndex: 0,
        }}
      />
      <div 
        className="blob-2"
        style={{
          position: "absolute",
          bottom: "-20%",
          right: "-10%",
          width: "650px",
          height: "650px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,193,7,0.1) 0%, rgba(255,255,255,0) 70%)",
          filter: "blur(60px)",
          zIndex: 0,
        }}
      />

      <div
        className="animate-fade-in-up"
        style={{
          width: "100%",
          maxWidth: "440px",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div 
          style={{
            background: "rgba(255, 255, 255, 0.7)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255, 255, 255, 0.5)",
            borderRadius: "28px",
            boxShadow: "0 24px 80px rgba(45, 42, 38, 0.07), inset 0 2px 0 rgba(255, 255, 255, 0.8)",
            padding: "48px 40px",
            textAlign: "center",
          }}
        >
          {/* Logo / Icon */}
          <div
            className="animate-float"
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "22px",
              backgroundColor: "var(--color-charcoal)",
              background: "linear-gradient(145deg, var(--color-charcoal), #1a1816)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              margin: "0 auto 24px",
              boxShadow: "0 12px 32px rgba(45, 42, 38, 0.3), inset 0 1px 1px rgba(255,255,255,0.2)",
              color: "var(--color-amber-400)",
            }}
          >
            ✦
          </div>
          
          <h1 style={{ fontSize: "32px", fontWeight: 800, color: "var(--color-charcoal)", letterSpacing: "-0.5px", marginBottom: "8px" }}>
            Hostel<span style={{ color: "var(--color-ochre)", fontWeight: 700 }}>Mess</span>
          </h1>
          <p style={{ color: "var(--color-slate-500)", fontSize: "15px", marginBottom: "40px", fontWeight: 400 }}>
            Welcome back. Please sign in to continue.
          </p>

          <form onSubmit={handleSubmit} style={{ textAlign: "left" }}>
            {error && (
              <div
                style={{
                  padding: "12px 16px",
                  backgroundColor: "rgba(239, 68, 68, 0.08)",
                  borderLeft: "3px solid var(--color-red-500)",
                  borderRadius: "8px",
                  color: "var(--color-charcoal)",
                  fontSize: "14px",
                  fontWeight: 500,
                  marginBottom: "24px",
                  animation: "slideInRight 0.3s ease-out both",
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
                  fontSize: "12px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  color: "var(--color-slate-600)",
                  marginBottom: "8px",
                  paddingLeft: "4px",
                }}
              >
                Roll Number
              </label>
              <input
                id="roll-number"
                type="text"
                placeholder="2024001"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                required
                autoFocus
                style={{
                  width: "100%",
                  padding: "16px 20px",
                  fontSize: "16px",
                  fontFamily: "var(--font-outfit)",
                  fontWeight: 500,
                  color: "var(--color-charcoal)",
                  backgroundColor: "rgba(255, 255, 255, 0.6)",
                  border: "2px solid var(--color-sand)",
                  borderRadius: "16px",
                  outline: "none",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)",
                }}
                onFocus={(e) => { e.target.style.borderColor = "var(--color-ochre)"; e.target.style.backgroundColor = "#fff"; e.target.style.boxShadow = "0 8px 24px rgba(230, 147, 10, 0.08)"; }}
                onBlur={(e) => { e.target.style.borderColor = "var(--color-sand)"; e.target.style.backgroundColor = "rgba(255, 255, 255, 0.6)"; e.target.style.boxShadow = "inset 0 2px 4px rgba(0,0,0,0.02)"; }}
              />
            </div>

            <div style={{ marginBottom: "32px" }}>
              <label
                htmlFor="password"
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  color: "var(--color-slate-600)",
                  marginBottom: "8px",
                  paddingLeft: "4px",
                }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "16px 20px",
                  fontSize: "16px",
                  fontFamily: "var(--font-outfit)",
                  fontWeight: 500,
                  color: "var(--color-charcoal)",
                  backgroundColor: "rgba(255, 255, 255, 0.6)",
                  border: "2px solid var(--color-sand)",
                  borderRadius: "16px",
                  outline: "none",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)",
                  letterSpacing: "2px",
                }}
                onFocus={(e) => { e.target.style.borderColor = "var(--color-ochre)"; e.target.style.backgroundColor = "#fff"; e.target.style.boxShadow = "0 8px 24px rgba(230, 147, 10, 0.08)"; }}
                onBlur={(e) => { e.target.style.borderColor = "var(--color-sand)"; e.target.style.backgroundColor = "rgba(255, 255, 255, 0.6)"; e.target.style.boxShadow = "inset 0 2px 4px rgba(0,0,0,0.02)"; }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "16px",
                fontSize: "16px",
                fontFamily: "var(--font-outfit)",
                fontWeight: 700,
                color: "var(--color-white)",
                backgroundColor: "var(--color-charcoal)",
                border: "none",
                borderRadius: "16px",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: "0 8px 24px rgba(45, 42, 38, 0.2)",
                opacity: loading ? 0.7 : 1,
                transform: "translateY(0)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
              }}
              onMouseEnter={(e) => { if(!loading) { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 12px 32px rgba(45, 42, 38, 0.3)"; e.target.style.backgroundColor = "#1a1816"; } }}
              onMouseLeave={(e) => { if(!loading) { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 8px 24px rgba(45, 42, 38, 0.2)"; e.target.style.backgroundColor = "var(--color-charcoal)"; } }}
              onMouseDown={(e) => { if(!loading) { e.target.style.transform = "translateY(1px)"; e.target.style.boxShadow = "0 4px 12px rgba(45, 42, 38, 0.2)"; } }}
              onMouseUp={(e) => { if(!loading) { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 12px 32px rgba(45, 42, 38, 0.3)"; } }}
            >
              {loading ? (
                <>
                  <span
                    style={{
                      width: "18px",
                      height: "18px",
                      border: "2.5px solid rgba(255,255,255,0.2)",
                      borderTopColor: "#fff",
                      borderRadius: "50%",
                      animation: "spin 0.6s linear infinite",
                    }}
                  />
                  Authenticating...
                </>
              ) : (
                 "Sign In →"
              )}
            </button>
          </form>
        </div>

        <p
          style={{
            textAlign: "center",
            marginTop: "24px",
            fontSize: "13px",
            fontWeight: 500,
            color: "var(--color-slate-500)",
            textShadow: "0 1px 2px rgba(255,255,255,0.8)",
          }}
        >
          Contact warden for credentials
        </p>
      </div>

      <style>{`
        @keyframes spin { 
          to { transform: rotate(360deg); } 
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes blobMotion1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, 20px) scale(1.05); }
        }
        @keyframes blobMotion2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-40px, -30px) scale(0.95); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .blob-1 { animation: blobMotion1 12s ease-in-out infinite; }
        .blob-2 { animation: blobMotion2 15s ease-in-out infinite; }
        .animate-float { animation: float 4s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

