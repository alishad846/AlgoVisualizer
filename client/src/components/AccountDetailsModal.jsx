import React, { useState, useEffect } from "react";

export default function AccountDetailsModal({ onClose }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch("http://localhost:5000/api/user/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUsername(data.username || "");
          setEmail(data.email || "");
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
        setCurrentPassword("");
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
        background: "#131313", border: "1px solid #333", borderRadius: "12px", width: "100%", maxWidth: "480px",
        padding: "36px", color: "#fff", position: "relative", boxShadow: "0 25px 50px rgba(0,0,0,0.7)"
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
        <p style={{ color: "#aaa", fontSize: "14px", marginBottom: "24px" }}>Manage your registered AlgoVisualizer credentials.</p>

        {error && <div style={{ padding: "12px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid #ef4444", color: "#f87171", borderRadius: "8px", marginBottom: "20px", fontSize: "14px" }}>{error}</div>}
        {msg && <div style={{ padding: "12px", background: "rgba(16, 185, 129, 0.1)", border: "1px solid #10b981", color: "#34d399", borderRadius: "8px", marginBottom: "20px", fontSize: "14px" }}>{msg}</div>}

        <form onSubmit={handleUpdate}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "6px", textTransform: "uppercase", fontWeight: 700 }}>Username</label>
            <input type="text" required value={username} onChange={e=>setUsername(e.target.value)} style={{ width: "100%", padding: "12px", background: "#0e0e0e", border: "1px solid #333", color: "#fff", borderRadius: "6px", fontSize: "15px" }} />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "6px", textTransform: "uppercase", fontWeight: 700 }}>Email Address</label>
            <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} style={{ width: "100%", padding: "12px", background: "#0e0e0e", border: "1px solid #333", color: "#fff", borderRadius: "6px", fontSize: "15px" }} />
          </div>

          <div style={{ borderTop: "1px solid #222", paddingTop: "20px", marginBottom: "16px" }}>
            <span style={{ fontSize: "13px", color: "#ccc", fontWeight: 800, display: "block", marginBottom: "12px" }}>Change Password (Optional)</span>
            <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "6px", textTransform: "uppercase", fontWeight: 700 }}>Current Password</label>
            <input type="password" placeholder="Leave blank if not changing" value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} style={{ width: "100%", padding: "12px", background: "#0e0e0e", border: "1px solid #333", color: "#fff", borderRadius: "6px", fontSize: "15px", marginBottom: "12px" }} />

            <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "6px", textTransform: "uppercase", fontWeight: 700 }}>New Secure Password</label>
            <input type="password" placeholder="••••••••" value={newPassword} onChange={e=>setNewPassword(e.target.value)} style={{ width: "100%", padding: "12px", background: "#0e0e0e", border: "1px solid #333", color: "#fff", borderRadius: "6px", fontSize: "15px" }} />
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "28px" }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: "14px", background: "transparent", border: "1px solid #444", color: "#ccc", borderRadius: "6px", cursor: "pointer", fontWeight: 700 }}>Close</button>
            <button type="submit" disabled={isLoading} style={{ flex: 1, padding: "14px", background: "#fff", border: "none", color: "#000", borderRadius: "6px", cursor: "pointer", fontWeight: 800 }}>Save Changes →</button>
          </div>
        </form>
      </div>
    </div>
  );
}
