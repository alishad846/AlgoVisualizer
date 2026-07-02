import React, { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function AccountDetailsModal({ onClose }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  // Initialize current password from local session or restore generic placeholder if missing
  const [currentPassword, setCurrentPassword] = useState(() => {
    let saved = localStorage.getItem("user_password") || sessionStorage.getItem("autofill_password");
    if (!saved || saved === "••••••••" || saved === "********") {
      saved = "Secret@123";
      localStorage.setItem("user_password", saved);
    }
    return saved;
  });
  const [newPassword, setNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(atob(base64).split("").map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join(""));
        const decoded = JSON.parse(jsonPayload);
        if (decoded.username) setUsername(decoded.username);
        if (decoded.email) setEmail(decoded.email);
      } catch (e) {
        // Fallback if token is malformed
      }
    }

    const fetchProfile = async () => {
      if (!token) return;
      try {
        const res = await fetch("http://localhost:5000/api/user/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.username) setUsername(data.username);
          if (data.email) setEmail(data.email);
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    setIsLoading(true);

    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5000/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ username, email, currentPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("Account profile updated successfully!");
        if (data.token) localStorage.setItem("token", data.token);
        if (newPassword && newPassword.trim() !== "") {
          localStorage.setItem("user_password", newPassword);
          setCurrentPassword(newPassword);
        }
        setNewPassword("");
      } else {
        setError(data.error || "Profile update failed.");
      }
    } catch {
      setError("Failed to connect to server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)", padding: "20px"
    }}>
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", width: "100%", maxWidth: "480px",
        padding: "36px", color: "var(--text)", position: "relative", boxShadow: "0 25px 50px rgba(0,0,0,0.5)"
      }}>
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: "20px", right: "20px", background: "transparent", border: "none",
            color: "#888", fontSize: "20px", cursor: "pointer"
          }}
        >
          ✕
        </button>

        <h2 style={{ marginTop: 0, fontSize: "24px", fontWeight: 800, marginBottom: "8px" }}>Account Details</h2>
        <p style={{ color: "var(--muted)", fontSize: "14px", marginBottom: "24px" }}>Manage your registered AlgoVisualizer credentials.</p>

        {error && <div style={{ padding: "12px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid #ef4444", color: "#f87171", borderRadius: "8px", marginBottom: "20px", fontSize: "14px" }}>{error}</div>}
        {msg && <div style={{ padding: "12px", background: "rgba(16, 185, 129, 0.1)", border: "1px solid #10b981", color: "#34d399", borderRadius: "8px", marginBottom: "20px", fontSize: "14px" }}>{msg}</div>}

        <form onSubmit={handleUpdate}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "12px", color: "var(--muted)", marginBottom: "6px", textTransform: "uppercase", fontWeight: 700 }}>Username</label>
            <input type="text" required value={username} onChange={e=>setUsername(e.target.value)} style={{ width: "100%", padding: "12px", background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: "6px", fontSize: "15px" }} />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", fontSize: "12px", color: "var(--muted)", marginBottom: "6px", textTransform: "uppercase", fontWeight: 700 }}>Email Address</label>
            <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} style={{ width: "100%", padding: "12px", background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: "6px", fontSize: "15px" }} />
          </div>

          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "20px", marginBottom: "16px" }}>
            <span style={{ fontSize: "13px", color: "var(--text)", fontWeight: 800, display: "block", marginBottom: "12px" }}>Security & Password</span>
            <label style={{ display: "block", fontSize: "12px", color: "var(--muted)", marginBottom: "6px", textTransform: "uppercase", fontWeight: 700 }}>Current Password</label>
            <div style={{ position: "relative", marginBottom: "16px" }}>
              <input 
                type={showCurrentPassword ? "text" : "password"} 
                name="current-password"
                autoComplete="current-password"
                readOnly={true}
                value={currentPassword} 
                onFocus={(e) => e.target.blur()}
                style={{ width: "100%", padding: "12px 40px 12px 12px", background: "var(--surface)", border: "1px solid var(--border2)", color: "var(--muted)", borderRadius: "6px", fontSize: "15px", cursor: "not-allowed", opacity: 0.6 }} 
              />
              <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--muted)", cursor: "pointer" }}>
                {showCurrentPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </button>
            </div>

            <label style={{ display: "block", fontSize: "12px", color: "var(--muted)", marginBottom: "6px", textTransform: "uppercase", fontWeight: 700 }}>New Secure Password</label>
            <div style={{ position: "relative" }}>
              <input 
                type={showNewPassword ? "text" : "password"} 
                name="new-secure-password-no-autofill"
                autoComplete="new-password"
                placeholder="Enter new password to change..." 
                value={newPassword} 
                onChange={e=>setNewPassword(e.target.value)} 
                style={{ width: "100%", padding: "12px 40px 12px 12px", background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: "6px", fontSize: "15px" }} 
              />
              <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--muted)", cursor: "pointer" }}>
                {showNewPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </button>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "28px" }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: "14px", background: "transparent", border: "1px solid var(--border2)", color: "var(--text)", borderRadius: "6px", cursor: "pointer", fontWeight: 700 }}>Close</button>
            <button type="submit" disabled={isLoading} style={{ flex: 1, padding: "14px", background: "var(--primary)", border: "none", color: "var(--bg)", borderRadius: "6px", cursor: "pointer", fontWeight: 800 }}>Save Changes →</button>
          </div>
        </form>
      </div>
    </div>
  );
}
