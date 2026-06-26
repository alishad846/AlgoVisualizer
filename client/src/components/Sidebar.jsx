import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export const NAV = [
  {
    key: "sorting", title: "Sorting", icon: "sort",
    items: [
      { label: "Bubble Sort", path: "/sorting/bubble-sort" },
      { label: "Selection Sort", path: "/sorting/selection-sort" },
      { label: "Insertion Sort", path: "/sorting/insertion-sort" },
      { label: "Merge Sort", path: "/sorting/merge-sort" },
      { label: "Quick Sort", path: "/sorting/quick-sort" },
      { label: "Heap Sort", path: "/sorting/heap-sort" },
      { label: "Counting Sort", path: "/sorting/counting-sort" },
      { label: "Radix Sort", path: "/sorting/radix-sort" },
      { label: "Shell Sort", path: "/sorting/shell-sort" },
      { label: "Bucket Sort", path: "/sorting/bucket-sort" },
    ]
  },
  {
    key: "searching", title: "Searching", icon: "search",
    items: [
      { label: "Linear Search", path: "/searching/linear-search" },
      { label: "Binary Search", path: "/searching/binary-search" },
      { label: "Jump Search", path: "/searching/jump-search" },
      { label: "Interpolation Search", path: "/searching/interpolation-search" },
      { label: "Exponential Search", path: "/searching/exponential-search" },
    ]
  },
  {
    key: "recursion", title: "Recursion", icon: "rebase_edit",
    items: [
      { label: "Tower of Hanoi", path: "/recursion/tower-of-hanoi" },
      { label: "N-Queens", path: "/recursion/n-queens" },
      { label: "Rat in a Maze", path: "/recursion/rat-in-maze" },
      { label: "Subset Generation", path: "/recursion/subsets" },
    ]
  },
  {
    key: "linked-list", title: "Linked List", icon: "link",
    items: [
      { label: "Reverse List", path: "/linked-list/reverse" },
      { label: "Detect Cycle", path: "/linked-list/detect-cycle" },
      { label: "Merge Sorted", path: "/linked-list/merge-sorted" },
      { label: "Find Middle", path: "/linked-list/find-middle" },
    ]
  },
  {
    key: "stack-queue", title: "Stack & Queue", icon: "view_agenda",
    items: [
      { label: "Stack (Push/Pop)", path: "/stack-queue/stack" },
      { label: "Queue", path: "/stack-queue/queue" },
      { label: "Valid Parentheses", path: "/stack-queue/valid-parentheses" },
      { label: "Next Greater", path: "/stack-queue/next-greater" },
    ]
  },
  {
    key: "tree", title: "Tree", icon: "account_tree",
    items: [
      { label: "In Order", path: "/tree/inorder" },
      { label: "Pre Order", path: "/tree/preorder" },
      { label: "Post Order", path: "/tree/postorder" },
      { label: "Level Order", path: "/tree/level-order" },
      { label: "BST Insert", path: "/tree/bst-insert" },
    ]
  },
  {
    key: "graph", title: "Graph", icon: "hub",
    items: [
      { label: "BFS", path: "/graph/bfs" },
      { label: "DFS", path: "/graph/dfs" },
      { label: "Dijkstra", path: "/graph/dijkstra" },
      { label: "Topological Sort", path: "/graph/topological-sort" },
    ]
  },
  {
    key: "dp", title: "Dynamic Progress", icon: "layers",
    items: [
      { label: "Fibonacci", path: "/dp/fibonacci" },
      { label: "0/1 Knapsack", path: "/dp/knapsack" },
      { label: "LCS", path: "/dp/lcs" },
      { label: "Coin Change", path: "/dp/coin-change" },
    ]
  },
  {
    key: "ml", title: "Machine Learning", icon: "memory",
    items: [
      { label: "Linear Regression", path: "/ml/linear-regression" },
      { label: "K-Means", path: "/ml/k-means" },
      { label: "KNN", path: "/ml/knn" },
      { label: "Decision Tree", path: "/ml/decision-tree" },
    ]
  },
];

function Icon({ children, className = "" }) {
  return <span className={`material-symbols-outlined ${className}`}>{children}</span>;
}

function SidebarItem({ section, location }) {
  const isActiveCat = section.items.some(i => location.pathname === i.path);
  const [isOpen, setIsOpen] = useState(isActiveCat || section.key === "sorting");

  return (
    <div className="av-nav-item">
      <button className="av-nav-button" onClick={() => setIsOpen(!isOpen)} style={{ color: isActiveCat ? "#ffffff" : undefined }}>
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
                color: active ? "#ffffff" : "var(--on-surface-variant)",
                fontWeight: active ? 700 : 400,
                paddingLeft: active ? "10px" : undefined,
                borderLeft: active ? "2px solid #ffffff" : undefined,
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
                color: location.pathname === "/dashboard" ? "#ffffff" : undefined,
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
          </nav>
        </div>

        <div className="av-sidebar-footer">
          <Link to="/sorting/bubble-sort" className="av-runner-btn" style={{ textDecoration: "none" }}>
            <Icon>play_arrow</Icon><span>Launch Runner</span>
          </Link>
          <a className="av-footer-link" href="#"><span className="av-nav-icon"><Icon>menu_book</Icon></span><span>Documentation</span></a>
          <a className="av-footer-link" href="#"><span className="av-nav-icon"><Icon>help_outline</Icon></span><span>Support</span></a>
        </div>
      </div>
    </aside>
  );
}
