import React, { useState } from "react";

export default function HelpModal({ onClose }) {
  const [tab, setTab] = useState("guide"); // "guide" or "faq"

  const faqs = [
    { q: "How does real-time visualization work?", a: "AlgoVisualizer executes sorting, searching, graph, and tree algorithms step-by-step while rendering active DOM structures with CSS micro-animations." },
    { q: "Can I pause or step through animations?", a: "Yes. Every algorithm controller includes Play, Pause, Step Forward, and Speed controls located at the bottom visualizer bar." },
    { q: "Why did my login auto-fill after registration?", a: "To streamline onboarding, newly provisioned credentials are securely cached in session storage to pre-populate your initial sign-in." },
    { q: "How do I reset a forgotten password?", a: "Click 'Forgot Password?' on the Login screen. You will receive a 6-digit OTP verification code via Nodemailer SMTP to authorize your new password." }
  ];

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)", padding: "20px"
    }}>
      <div style={{
        background: "#131313", border: "1px solid #333", borderRadius: "12px", width: "100%", maxWidth: "620px",
        padding: "36px", color: "#fff", position: "relative", boxShadow: "0 25px 50px rgba(0,0,0,0.7)", maxHeight: "90vh", display: "flex", flexDirection: "column"
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

        <h2 style={{ marginTop: 0, fontSize: "24px", fontWeight: 800, marginBottom: "6px" }}>Help & Architecture Guide</h2>
        <p style={{ color: "#aaa", fontSize: "14px", margin: "0 0 24px" }}>Learn how AlgoVisualizer translates logic into visual intelligence.</p>

        <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid #222", paddingBottom: "12px", marginBottom: "20px" }}>
          <button
            onClick={() => setTab("guide")}
            style={{
              padding: "10px 18px", background: tab === "guide" ? "#fff" : "#1e1e1e", color: tab === "guide" ? "#000" : "#aaa",
              border: "1px solid #333", borderRadius: "6px", fontWeight: 800, cursor: "pointer", fontSize: "14px"
            }}
          >
            📖 Overview Guide
          </button>
          <button
            onClick={() => setTab("faq")}
            style={{
              padding: "10px 18px", background: tab === "faq" ? "#fff" : "#1e1e1e", color: tab === "faq" ? "#000" : "#aaa",
              border: "1px solid #333", borderRadius: "6px", fontWeight: 800, cursor: "pointer", fontSize: "14px"
            }}
          >
            ❓ Frequently Asked Questions
          </button>
        </div>

        <div style={{ overflowY: "auto", flex: 1, paddingRight: "8px", lineHeight: 1.6 }}>
          {tab === "guide" && (
            <div>
              <h3 style={{ color: "#06b6d4", marginTop: 0 }}>What does AlgoVisualizer do?</h3>
              <p style={{ color: "#ccc" }}>
                AlgoVisualizer is a high-performance interactive computational engine designed for computer science students, software engineers, and educators. It bridges the abstract gap between raw code execution and structural memory representation.
              </p>
              <h4 style={{ color: "#fff", marginBottom: "8px" }}>Core Modules Available:</h4>
              <ul style={{ color: "#aaa", paddingLeft: "20px" }}>
                <li><strong>Sorting & Searching:</strong> Real-time array transformations (Bubble, Merge, Quick, Linear, Binary).</li>
                <li><strong>Graph & Tree Exploration:</strong> BFS, DFS, Dijkstra, Inorder/Preorder/Postorder traversals.</li>
                <li><strong>Dynamic Programming & Recursion:</strong> Tower of Hanoi, Memoization matrices, Knapsack simulations.</li>
                <li><strong>Data Structures:</strong> Linked List pointer manipulation and Stack/Queue FIFO/LIFO buffers.</li>
              </ul>
            </div>
          )}

          {tab === "faq" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {faqs.map((f, i) => (
                <div key={i} style={{ background: "#0e0e0e", padding: "18px", borderRadius: "8px", border: "1px solid #222" }}>
                  <div style={{ fontWeight: 800, color: "#fff", marginBottom: "6px" }}>Q: {f.q}</div>
                  <div style={{ color: "#aaa", fontSize: "14px" }}>A: {f.a}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginTop: "24px", textAlign: "right", borderTop: "1px solid #222", paddingTop: "16px" }}>
          <button onClick={onClose} style={{ padding: "12px 24px", background: "#fff", color: "#000", border: "none", borderRadius: "6px", fontWeight: 800, cursor: "pointer" }}>Got it</button>
        </div>
      </div>
    </div>
  );
}
