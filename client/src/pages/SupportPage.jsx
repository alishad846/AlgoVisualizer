import React, { useState, useEffect } from "react";
import AppShell from "../components/AppShell";

export default function SupportPage() {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState({ loading: false, error: "", success: "" });

  const faqs = [
    { q: "How does real-time visualization work?", a: "AlgoVisualizer executes sorting, searching, graph, and tree algorithms step-by-step while rendering active DOM structures with CSS micro-animations." },
    { q: "Can I browse other algorithms while one is running?", a: "Yes! Our persistent background simulation engine allows you to start an algorithm, navigate to other pages or algorithms, and return later to find your animation continuing or completed in bright green." },
    { q: "Why are speed controls and start buttons disabled during execution?", a: "To prevent frame skipping or race conditions during DOM rendering, controls are disabled while an animation loop is running. You can click Stop at any time to re-enable controls." },
    { q: "How do I interpret the bar colors?", a: "Bright Green indicates completed/sorted states. Bright Yellow highlights active comparisons. Bright Red denotes errors or target not found." },
    { q: "How do I reset a forgotten password?", a: "Click 'Forgot Password?' on the Login screen. You will receive a 6-digit OTP verification code via SMTP to authorize your new password." }
  ];

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
          if (data.email) setEmail(data.email);
        }
      } catch (err) {
        console.error("Failed to prefill email", err);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !message) {
      setStatus({ loading: false, error: "Please enter your registered email and a query message.", success: "" });
      return;
    }

    setStatus({ loading: true, error: "", success: "" });
    try {
      const res = await fetch("http://localhost:5000/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, subject, message })
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({ loading: false, error: "", success: "Your query has been sent successfully to our support SMTP! We will respond to your registered email soon." });
        setSubject("");
        setMessage("");
      } else {
        setStatus({ loading: false, error: data.error || "Failed to send query.", success: "" });
      }
    } catch (err) {
      setStatus({ loading: false, error: "Network error connecting to support server.", success: "" });
    }
  };

  return (
    <AppShell breadcrumb="Support & FAQs">
      <div className="section-title">Help & FAQs</div>
      <div className="section-sub">Find quick answers or send queries directly to our team via SMTP</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginTop: "16px" }}>
        {/* LEFT: FAQ List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#fff", margin: 0 }}>Frequently Asked Questions</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "650px", overflowY: "auto", paddingRight: "8px" }}>
            {faqs.map((f, i) => (
              <div key={i} style={{ background: "var(--surface)", padding: "18px", borderRadius: "10px", border: "1px solid var(--border)" }}>
                <div style={{ fontWeight: 800, color: "var(--cyan)", marginBottom: "6px", fontSize: "14px" }}>Q: {f.q}</div>
                <div style={{ color: "var(--muted)", fontSize: "13px", lineHeight: 1.6 }}>A: {f.a}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Email Query Form */}
        <div style={{ background: "var(--surface)", padding: "24px", borderRadius: "12px", border: "1px solid var(--border2)", height: "fit-content" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#fff", marginTop: 0, marginBottom: "6px" }}>Send us a Query or Complaint</h3>
          <p style={{ color: "var(--muted)", fontSize: "13px", margin: "0 0 20px" }}>
            Submissions are dispatched securely through your registered email to our SMTP server.
          </p>

          {status.error && (
            <div style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid var(--red)", color: "var(--red)", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px" }}>
              {status.error}
            </div>
          )}

          {status.success && (
            <div style={{ background: "rgba(16, 185, 129, 0.15)", border: "1px solid var(--green)", color: "var(--green)", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px" }}>
              {status.success}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--muted)", marginBottom: "4px", fontWeight: 600 }}>Registered Email</label>
              <input
                type="email"
                className="login-input"
                style={{ marginBottom: 0 }}
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--muted)", marginBottom: "4px", fontWeight: 600 }}>Subject</label>
              <input
                type="text"
                className="login-input"
                style={{ marginBottom: 0 }}
                placeholder="e.g. Issue with Quick Sort visualizer"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--muted)", marginBottom: "4px", fontWeight: 600 }}>Query or Complaint</label>
              <textarea
                className="login-input"
                style={{ marginBottom: 0, minHeight: "120px", resize: "vertical", fontFamily: "inherit" }}
                placeholder="Describe your issue or feedback in detail..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: "12px", fontSize: "14px", fontWeight: 700, marginTop: "8px" }}
              disabled={status.loading}
            >
              {status.loading ? "Sending via SMTP..." : "✉ Send Query"}
            </button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
