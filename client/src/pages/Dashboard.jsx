import { useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";

const CATEGORIES = [
  { label: "Sorting", desc: "11 algorithms", icon: "📊", color: "#06b6d4", bg: "rgba(6,182,212,0.1)", path: "/sorting/bubble-sort" },
  { label: "Searching", desc: "5 algorithms", icon: "🔍", color: "#10b981", bg: "rgba(16,185,129,0.1)", path: "/searching/linear-search" },
  { label: "Recursion", desc: "4 algorithms", icon: "🔁", color: "#f97316", bg: "rgba(249,115,22,0.1)", path: "/recursion/tower-of-hanoi" },
  { label: "Linked List", desc: "4 algorithms", icon: "🔗", color: "#8b5cf6", bg: "rgba(139,92,246,0.1)", path: "/linked-list/reverse" },
  { label: "Stack & Queue", desc: "4 variants", icon: "📦", color: "#eab308", bg: "rgba(234,179,8,0.1)", path: "/stack-queue/stack" },
  { label: "Tree", desc: "5 traversals", icon: "🌲", color: "#ec4899", bg: "rgba(236,72,153,0.1)", path: "/tree/inorder" },
  { label: "Graph", desc: "4 algorithms", icon: "🕸️", color: "#14b8a6", bg: "rgba(20,184,166,0.1)", path: "/graph/bfs" },
  { label: "Dynamic Prog.", desc: "4 problems", icon: "🧩", color: "#a78bfa", bg: "rgba(167,139,250,0.1)", path: "/dp/fibonacci" },
  { label: "Machine Learning", desc: "4 models", icon: "🤖", color: "#f43f5e", bg: "rgba(244,63,94,0.1)", path: "/ml/linear-regression" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  return (
    <AppShell breadcrumb="Dashboard">
      <div className="section-title">Algorithm Categories</div>
      <div className="section-sub">Select a category to start visualizing with real cube animations</div>
      <div className="dash-grid">
        {CATEGORIES.map(c => (
          <div key={c.label} className="dash-card" onClick={() => navigate(c.path)}>
            <div className="dash-card-icon" style={{ background: c.bg }}>
              <span>{c.icon}</span>
            </div>
            <div>
              <h3 style={{ color: c.color }}>{c.label}</h3>
              <p>{c.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
