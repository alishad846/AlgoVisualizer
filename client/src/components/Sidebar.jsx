import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  BarChart2, Search, RefreshCw, List, GitBranch,
  Binary, Database, Cpu, ChevronDown, ChevronRight,
  LayoutDashboard, Menu, X, TrendingUp, Layers, Zap, AlignLeft, Triangle
} from "lucide-react";

const NAV = [
  {
    key: "sorting", label: "Sorting", icon: BarChart2, color: "#06b6d4",
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
    key: "searching", label: "Searching", icon: Search, color: "#10b981",
    items: [
      { label: "Linear Search", path: "/searching/linear-search" },
      { label: "Binary Search", path: "/searching/binary-search" },
      { label: "Ternary Search", path: "/searching/ternary-search" },
      { label: "Jump Search", path: "/searching/jump-search" },
      { label: "Interpolation Search", path: "/searching/interpolation-search" },
      { label: "Exponential Search", path: "/searching/exponential-search" },
    ]
  },
  {
    key: "recursion", label: "Recursion", icon: RefreshCw, color: "#f97316",
    items: [
      { label: "Tower of Hanoi", path: "/recursion/tower-of-hanoi" },
      { label: "N-Queens", path: "/recursion/n-queens" },
      { label: "Rat in a Maze", path: "/recursion/rat-in-maze" },
      { label: "Subset Generation", path: "/recursion/subsets" },
    ]
  },
  {
    key: "linked-list", label: "Linked List", icon: List, color: "#8b5cf6",
    items: [
      { label: "Reverse List", path: "/linked-list/reverse" },
      { label: "Detect Cycle", path: "/linked-list/detect-cycle" },
      { label: "Merge Sorted", path: "/linked-list/merge-sorted" },
      { label: "Find Middle", path: "/linked-list/find-middle" },
    ]
  },
  {
    key: "stack-queue", label: "Stack & Queue", icon: Layers, color: "#eab308",
    items: [
      { label: "Stack (Push/Pop)", path: "/stack-queue/stack" },
      { label: "Queue", path: "/stack-queue/queue" },
      { label: "Valid Parentheses", path: "/stack-queue/valid-parentheses" },
      { label: "Next Greater", path: "/stack-queue/next-greater" },
    ]
  },
  {
    key: "tree", label: "Tree", icon: Binary, color: "#ec4899",
    items: [
      { label: "Inorder", path: "/tree/inorder" },
      { label: "Preorder", path: "/tree/preorder" },
      { label: "Postorder", path: "/tree/postorder" },
      { label: "Level Order", path: "/tree/level-order" },
      { label: "BST Insert", path: "/tree/bst-insert" },
    ]
  },
  {
    key: "graph", label: "Graph", icon: GitBranch, color: "#14b8a6",
    items: [
      { label: "BFS", path: "/graph/bfs" },
      { label: "DFS", path: "/graph/dfs" },
      { label: "Dijkstra", path: "/graph/dijkstra" },
      { label: "Topological Sort", path: "/graph/topological-sort" },
    ]
  },
  {
    key: "dp", label: "Dynamic Prog.", icon: Database, color: "#a78bfa",
    items: [
      { label: "Fibonacci", path: "/dp/fibonacci" },
      { label: "0/1 Knapsack", path: "/dp/knapsack" },
      { label: "LCS", path: "/dp/lcs" },
      { label: "Coin Change", path: "/dp/coin-change" },
    ]
  },
  {
    key: "ml", label: "Machine Learning", icon: Cpu, color: "#f43f5e",
    items: [
      { label: "Linear Regression", path: "/ml/linear-regression" },
      { label: "K-Means", path: "/ml/k-means" },
      { label: "KNN", path: "/ml/knn" },
      { label: "Decision Tree", path: "/ml/decision-tree" },
    ]
  },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [openCats, setOpenCats] = useState(() => {
    const active = NAV.find(c => c.items.some(i => location.pathname.startsWith(i.path.split('/').slice(0,2).join('/'))));
    return active ? { [active.key]: true } : { sorting: true };
  });

  const toggleCat = (key) => setOpenCats(p => ({ ...p, [key]: !p[key] }));

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-logo">
        {!collapsed && <span className="sidebar-logo-text">AlgoVision</span>}
        <button className="sidebar-toggle" onClick={() => setCollapsed(p => !p)}>
          {collapsed ? <Menu size={16} /> : <X size={16} />}
        </button>
      </div>

      <div className="sidebar-nav">
        {/* Dashboard link */}
        <Link
          to="/dashboard"
          className={`sidebar-item ${location.pathname === "/dashboard" ? "active" : ""}`}
          style={{ paddingLeft: 10, marginBottom: 4 }}
        >
          <LayoutDashboard size={14} />
          {!collapsed && "Dashboard"}
        </Link>

        {NAV.map(cat => {
          const Icon = cat.icon;
          const isOpen = openCats[cat.key];
          const isActive = cat.items.some(i => location.pathname === i.path);
          return (
            <div key={cat.key} className="sidebar-category">
              <button
                className={`sidebar-cat-btn ${isActive ? "active" : ""}`}
                onClick={() => !collapsed && toggleCat(cat.key)}
                title={cat.label}
              >
                <Icon size={14} className="sidebar-cat-icon" style={{ color: isActive ? cat.color : undefined }} />
                {!collapsed && (
                  <>
                    <span style={{ flex: 1, textAlign: "left" }}>{cat.label}</span>
                    {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  </>
                )}
              </button>
              {!collapsed && isOpen && (
                <div className="sidebar-items">
                  {cat.items.map(item => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`sidebar-item ${location.pathname === item.path ? "active" : ""}`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
