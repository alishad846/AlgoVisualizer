import Sidebar from "./Sidebar";

export default function AppShell({ children, breadcrumb }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-breadcrumb">
            <span style={{ color: "var(--muted)" }}>AlgoVision</span>
            <span style={{ color: "var(--border2)" }}>/</span>
            <span>{breadcrumb || "Dashboard"}</span>
          </div>
        </div>
        <div className="page">{children}</div>
      </div>
    </div>
  );
}
