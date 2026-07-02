import React from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../../components/AppShell";
import "../Dashboard.css";
import "./SortingDashboard.css";

function Icon({ children, className = "" }) {
  return <span className={`material-symbols-outlined ${className}`}>{children}</span>;
}

const recursionAlgorithms = [
  {
    title: "Tower of Hanoi",
    icon: "view_column",
    complexity: "O(2ⁿ)",
    path: "/recursion/tower-of-hanoi",
    desc: "Moves disks between pegs using recursive subproblems while following the rule that larger disks cannot sit on smaller disks.",
  },
  {
    title: "N Queens",
    icon: "chess",
    complexity: "O(n!)",
    path: "/recursion/n-queens",
    desc: "Uses recursive backtracking to place queens on a board so no two queens attack each other.",
  },
  {
    title: "Rat in a Maze",
    icon: "route",
    complexity: "O(4ⁿ)",
    path: "/recursion/rat-in-maze",
    desc: "Explores possible paths through a maze using recursion, backtracking when a route reaches a dead end.",
  },
  {
    title: "Subsets",
    icon: "account_tree",
    complexity: "O(2ⁿ)",
    path: "/recursion/subsets",
    desc: "Generates every possible subset by recursively choosing whether to include or exclude each element.",
  },
];

export default function RecursionDashboard() {
  const navigate = useNavigate();

  return (
    <AppShell breadcrumb="Recursion Algorithms">
      <section className="av-sorting-page-header">
        <div>
          <h2>Recursion Algorithms</h2>
          <p>
            Explore recursive thinking through base cases, call stacks, branching decisions,
            and backtracking paths across classic recursion problems.
          </p>
        </div>
      </section>

      <section className="av-sorting-page-grid">
        {recursionAlgorithms.map((algo) => (
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