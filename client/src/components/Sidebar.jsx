import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { NAV } from "./navConfig";

function Icon({ children, className = "" }) {
  return <span className={`material-symbols-outlined ${className}`}>{children}</span>;
}

function SidebarItem({ section, location }) {
  const isActiveCat = section.items.some(i => location.pathname === i.path);
  const [isOpen, setIsOpen] = useState(isActiveCat);

  // Force the submenu open/closed to track isActiveCat whenever it changes,
  // while still letting the user manually toggle it in between. This is the
  // "adjust state when a prop changes" pattern applied during render instead
  // of in a useEffect (react.dev/learn/you-might-not-need-an-effect).
  const [prevIsActiveCat, setPrevIsActiveCat] = useState(isActiveCat);
  if (isActiveCat !== prevIsActiveCat) {
    setPrevIsActiveCat(isActiveCat);
    setIsOpen(isActiveCat);
  }

  return (
    <div className="av-nav-item">
      <button className="av-nav-button" onClick={() => setIsOpen(!isOpen)} style={{ color: isActiveCat ? "var(--primary)" : undefined }}>
        <span className="av-nav-left">
          <span className="av-nav-icon"><Icon>{section.icon}</Icon></span>
          <span style={{ fontWeight: isActiveCat ? 700 : 500 }}>{section.title}</span>
        </span>
        <Icon className={`av-chevron ${isOpen ? "av-rotate" : ""}`}>chevron_right</Icon>
      </button>
      <div className={`av-submenu ${isOpen ? "av-submenu-open" : ""}`}>
        {section.items.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              to={item.path}
              key={item.path}
              style={{
                display: "block",
                paddingTop: "6px",
                paddingBottom: "6px",
                color: active ? "var(--primary)" : "var(--on-surface-variant)",
                fontWeight: active ? 700 : 400,
                paddingLeft: active ? "10px" : undefined,
                borderLeft: active ? "2px solid var(--primary)" : undefined,
                textDecoration: "none"
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function Sidebar({ sidebarOpen = true }) {
  const location = useLocation();

  return (
    <aside className={`av-sidebar ${sidebarOpen ? "" : "av-sidebar-collapsed"}`}>
      <div className="av-sidebar-inner">
        <div className="av-sidebar-main">
          <p className="av-sidebar-label">ALGORITHM LIBRARY</p>
          <nav className="av-nav">
            <Link
              className="av-nav-link"
              to="/dashboard"
              style={{
                color: location.pathname === "/dashboard" ? "var(--primary)" : undefined,
                fontWeight: location.pathname === "/dashboard" ? 700 : 400,
                textDecoration: "none"
              }}
            >
              <span className="av-nav-icon"><Icon>dashboard</Icon></span>
              <span>Dashboard</span>
            </Link>
            {NAV.map((section) => (
              <SidebarItem key={section.key} section={section} location={location} />
            ))}
            <Link
              className="av-nav-link"
              to="/visualize-my-code"
              style={{
                color: location.pathname === "/visualize-my-code" ? "var(--primary)" : undefined,
                fontWeight: location.pathname === "/visualize-my-code" ? 700 : 400,
                textDecoration: "none"
              }}
            >
              <span className="av-nav-icon"><Icon>auto_awesome</Icon></span>
              <span>Visualize My Code</span>
            </Link>
          </nav>
        </div>

        <div className="av-sidebar-footer">
          <Link to="/documentation" className="av-footer-link" style={{ textDecoration: "none" }}><span className="av-nav-icon"><Icon>menu_book</Icon></span><span>Documentation</span></Link>
          <Link to="/support" className="av-footer-link" style={{ textDecoration: "none" }}><span className="av-nav-icon"><Icon>help_outline</Icon></span><span>Support</span></Link>
        </div>
      </div>
    </aside>
  );
}
