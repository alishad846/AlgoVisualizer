import React from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../../components/AppShell";
import "../Dashboard.css";
import "./SortingDashboard.css";

function Icon({ children, className = "" }) {
  return <span className={`material-symbols-outlined ${className}`}>{children}</span>;
}

const treeAlgorithms = [
  {
    title: "Inorder Traversal",
    icon: "account_tree",
    complexity: "O(n)",
    path: "/tree/inorder",
    desc: "Visits the left subtree, then the root node, then the right subtree in a binary tree.",
  },
  {
    title: "Preorder Traversal",
    icon: "format_list_numbered",
    complexity: "O(n)",
    path: "/tree/preorder",
    desc: "Visits the root node first, then recursively traverses the left and right subtrees.",
  },
  {
    title: "Postorder Traversal",
    icon: "playlist_add_check",
    complexity: "O(n)",
    path: "/tree/postorder",
    desc: "Visits the left and right subtrees first, then processes the root node at the end.",
  },
  {
    title: "Level Order Traversal",
    icon: "lan",
    complexity: "O(n)",
    path: "/tree/level-order",
    desc: "Visits tree nodes level by level from top to bottom using breadth-first traversal.",
  },
];

export default function TreeDashboard() {
  const navigate = useNavigate();

  return (
    <AppShell breadcrumb="Tree Algorithms">
      <section className="av-sorting-page-header">
        <div>
          <h2>Tree Algorithms</h2>
          <p>
            Explore binary tree traversal patterns as nodes are visited in depth-first
            and breadth-first execution orders.
          </p>
        </div>
      </section>

      <section className="av-sorting-page-grid">
        {treeAlgorithms.map((algo) => (
          <div
            className="av-algorithm-card"
            key={algo.title}
            onClick={() => navigate(algo.path)}
            style={{ cursor: "pointer" }}
          >
            <div className="av-algo-card-top">
              <div className="av-algo-icon">
                <Icon>{algo.icon}</Icon>
              </div>

              <span className="av-algo-complexity">{algo.complexity}</span>
            </div>

            <h3>{algo.title}</h3>
            <p>{algo.desc}</p>

            <button
              className="av-open-visualizer"
              onClick={(e) => {
                e.stopPropagation();
                navigate(algo.path);
              }}
            >
              <span>Open Visualizer</span>
              <Icon>arrow_forward</Icon>
            </button>
          </div>
        ))}
      </section>

      <div className="av-bg-noise" />
    </AppShell>
  );
}