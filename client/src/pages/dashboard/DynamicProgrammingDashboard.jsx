import React from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../../components/AppShell";
import "../Dashboard.css";
import "./SortingDashboard.css";

function Icon({ children, className = "" }) {
  return <span className={`material-symbols-outlined ${className}`}>{children}</span>;
}

const dpAlgorithms = [
  {
    title: "Fibonacci",
    icon: "functions",
    complexity: "O(n)",
    path: "/dp/fibonacci",
    desc: "Builds Fibonacci values using a DP array so each value is computed once and reused.",
  },
  {
    title: "Knapsack",
    icon: "inventory_2",
    complexity: "O(nW)",
    path: "/dp/knapsack",
    desc: "Fills a DP table to choose items with maximum value while staying within capacity.",
  },
  {
    title: "Longest Common Subsequence",
    icon: "compare_arrows",
    complexity: "O(mn)",
    path: "/dp/lcs",
    desc: "Finds the longest sequence shared by two strings using a two-dimensional DP table.",
  },
  {
    title: "Coin Change",
    icon: "paid",
    complexity: "O(nA)",
    path: "/dp/coin-change",
    desc: "Computes the minimum number of coins needed to form an amount using dynamic programming.",
  },
];

export default function DynamicProgrammingDashboard() {
  const navigate = useNavigate();

  return (
    <AppShell breadcrumb="Dynamic Programming Algorithms">
      <section className="av-sorting-page-header">
        <div>
          <h2>Dynamic Programming Algorithms</h2>
          <p>
            Explore overlapping subproblems, table filling, stored results, and optimal choices
            through classic dynamic programming visualizations.
          </p>
        </div>
      </section>

      <section className="av-sorting-page-grid">
        {dpAlgorithms.map((algo) => (
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