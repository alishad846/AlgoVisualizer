import React from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../../components/AppShell";
import "../Dashboard.css";
import "./SortingDashboard.css";

function Icon({ children, className = "" }) {
  return <span className={`material-symbols-outlined ${className}`}>{children}</span>;
}

const graphAlgorithms = [
  {
    title: "Breadth First Search",
    icon: "hub",
    complexity: "O(V+E)",
    path: "/graph/bfs",
    desc: "Explores graph nodes level by level using a queue, visiting all nearby nodes before moving deeper.",
  },
  {
    title: "Depth First Search",
    icon: "account_tree",
    complexity: "O(V+E)",
    path: "/graph/dfs",
    desc: "Explores as far as possible along one path before backtracking to visit remaining graph nodes.",
  },
  {
    title: "Dijkstra",
    icon: "route",
    complexity: "O(V²)",
    path: "/graph/dijkstra",
    desc: "Finds shortest paths from a starting node by repeatedly selecting the nearest unvisited node.",
  },
  {
    title: "Topological Sort",
    icon: "schema",
    complexity: "O(V+E)",
    path: "/graph/topological-sort",
    desc: "Orders nodes in a directed acyclic graph so each dependency appears before the node that depends on it.",
  },
];

export default function GraphDashboard() {
  const navigate = useNavigate();

  return (
    <AppShell breadcrumb="Graph Algorithms">
      <section className="av-sorting-page-header">
        <div>
          <h2>Graph Algorithms</h2>
          <p>
            Explore graph traversal, shortest path relaxation, and dependency ordering through
            grid-based and directed graph visualizations.
          </p>
        </div>
      </section>

      <section className="av-sorting-page-grid">
        {graphAlgorithms.map((algo) => (
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