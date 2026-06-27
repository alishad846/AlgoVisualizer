import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import AccountDetailsModal from "./AccountDetailsModal";
import HelpModal from "./HelpModal";

export default function AppShell({ children, breadcrumb }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // "account" or "help"
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.add("dark");
    document.body.classList.add("av-body-lock");

    const fontId = "av-dashboard-fonts";
    if (!document.getElementById(fontId)) {
      const link = document.createElement("link");
      link.id = fontId;
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap";
      document.head.appendChild(link);
    }

    return () => document.body.classList.remove("av-body-lock");
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("keepSession");
    navigate("/login");
  };

  return (
    <div className="av-dashboard-root">
      <header className="av-topbar">
        <div className="av-top-left">
          <button aria-label="Toggle Sidebar" className="av-icon-btn" onClick={() => setSidebarOpen((v) => !v)}>
            <span className="material-symbols-outlined">menu</span>
          </button>
          <Link to="/dashboard" style={{ margin: 0, color: "#ffffff", fontSize: "20px", fontWeight: 700, textDecoration: "none" }}>AlgoVisualizer</Link>
          <span style={{ marginLeft: "12px", color: "var(--outline)" }}>/</span>
          <span style={{ marginLeft: "12px", color: "#ffffff", fontSize: "14px", fontWeight: 600 }}>{breadcrumb || "Visualization"}</span>
        </div>
        
        <div style={{ display: "flex", gap: "8px", alignItems: "center", position: "relative" }}>
          <Link to="/dashboard" className="av-icon-btn" title="Dashboard">
            <span className="material-symbols-outlined">dashboard</span>
          </Link>
          <button className="av-icon-btn av-user" onClick={() => setMenuOpen(!menuOpen)} title="Account Settings">
            <span className="material-symbols-outlined">account_circle</span>
          </button>

          {menuOpen && (
            <div style={{
              position: "absolute", top: "48px", right: 0, background: "#131313", border: "1px solid #333",
              borderRadius: "8px", width: "220px", padding: "8px", boxShadow: "0 15px 30px rgba(0,0,0,0.8)", zIndex: 1000
            }}>
              <button
                onClick={() => { setMenuOpen(false); setActiveModal("account"); }}
                style={{ width: "100%", padding: "10px 12px", background: "transparent", border: "none", color: "#e2e2e2", textAlign: "left", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", fontWeight: 600 }}
                onMouseEnter={e => e.currentTarget.style.background = "#222"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>manage_accounts</span>
                Account Details
              </button>

              <button
                onClick={() => { setMenuOpen(false); setActiveModal("help"); }}
                style={{ width: "100%", padding: "10px 12px", background: "transparent", border: "none", color: "#e2e2e2", textAlign: "left", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", fontWeight: 600 }}
                onMouseEnter={e => e.currentTarget.style.background = "#222"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>help</span>
                Help & FAQs
              </button>

              <div style={{ height: "1px", background: "#252525", margin: "6px 0" }} />

              <button
                onClick={handleLogout}
                style={{ width: "100%", padding: "10px 12px", background: "transparent", border: "none", color: "#f87171", textAlign: "left", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", fontWeight: 600 }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>logout</span>
                Log Out
              </button>
            </div>
          )}
        </div>
      </header>

      <div className={`av-overlay ${sidebarOpen ? "" : "av-hide"}`} onClick={() => setSidebarOpen(false)} />

      <Sidebar sidebarOpen={sidebarOpen} />

      <main className={`av-main ${sidebarOpen ? "" : "av-main-expanded"}`} onClick={() => { if (menuOpen) setMenuOpen(false); }}>
        <div className="av-container" style={{ maxWidth: "1400px", paddingTop: "12px" }}>
          {children}
        </div>
      </main>

      {activeModal === "account" && <AccountDetailsModal onClose={() => setActiveModal(null)} />}
      {activeModal === "help" && <HelpModal onClose={() => setActiveModal(null)} />}
    </div>
  );
}
