import React from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../../components/AppShell";
import "../Dashboard.css";
import "./SortingDashboard.css";

function Icon({ children, className = "" }) {
  return <span className={`material-symbols-outlined ${className}`}>{children}</span>;
}

const searchingAlgorithms = [
  {
    title: "Linear Search",
    icon: "search",
    complexity: "O(n)",
    path: "/searching/linear-search",
    desc: "Sequentially checks each element from start to end until the target value is found or the list is exhausted.",
  },
  {
    title: "Binary Search",
    icon: "manage_search",
    complexity: "O(log n)",
    path: "/searching/binary-search",
    desc: "Works on sorted data by repeatedly cutting the search range in half until the target is found.",
  },
  {
    title: "Jump Search",
    icon: "keyboard_double_arrow_right",
    complexity: "O(√n)",
    path: "/searching/jump-search",
    desc: "Skips ahead in fixed-size blocks, then performs a linear scan inside the block where the target may exist.",
  },
  {
    title: "Interpolation Search",
    icon: "travel_explore",
    complexity: "O(log log n)",
    path: "/searching/interpolation-search",
    desc: "Estimates the likely position of the target based on value distribution, then narrows the search area.",
  },
  {
    title: "Exponential Search",
    icon: "speed",
    complexity: "O(log n)",
    path: "/searching/exponential-search",
    desc: "Expands the search boundary exponentially, then applies binary search within the discovered range.",
  },
];

export default function SearchingDashboard() {
  const navigate = useNavigate();

  return (
    <AppShell breadcrumb="Searching Algorithms">
      <section className="av-sorting-page-header">
        <div>
          <h2>Searching Algorithms</h2>
          <p>
            Explore how algorithms locate target values across sequential scans, sorted ranges,
            block jumps, estimated positions, and exponential boundaries.
          </p>
        </div>

        
      </section>

      <section className="av-sorting-page-grid">
        {searchingAlgorithms.map((algo) => (
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