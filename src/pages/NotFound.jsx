import { Link } from "react-router-dom";

const NotFound = () => (
  <div style={{
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #0f172a, #1e293b, #2563eb)",
    fontFamily: "'Segoe UI', sans-serif",
    padding: "20px"
  }}>
    <div style={{
      background: "rgba(255, 255, 255, 0.1)",
      backdropFilter: "blur(15px)",
      border: "1px solid rgba(255, 255, 255, 0.15)",
      borderRadius: "20px",
      padding: "40px",
      textAlign: "center",
      color: "#fff",
      maxWidth: "420px"
    }}>
      <h1 style={{ fontSize: "64px", fontWeight: "800", color: "#60a5fa", marginBottom: "8px" }}>404</h1>
      <h2 style={{ fontSize: "22px", marginBottom: "12px" }}>Page Not Found</h2>
      <p style={{ color: "#94a3b8", marginBottom: "24px", fontSize: "14px" }}>
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/dashboard"
        style={{
          display: "inline-block",
          padding: "12px 24px",
          background: "#2563eb",
          color: "#fff",
          borderRadius: "10px",
          textDecoration: "none",
          fontWeight: "600",
          boxShadow: "0 4px 15px rgba(37, 99, 235, 0.4)"
        }}
      >
        Go to Dashboard
      </Link>
    </div>
  </div>
);

export default NotFound;


