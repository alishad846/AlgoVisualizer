import React from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../../components/AppShell";
import "../Dashboard.css";
import "./SortingDashboard.css";

function Icon({ children, className = "" }) {
  return <span className={`material-symbols-outlined ${className}`}>{children}</span>;
}

const linkedListAlgorithms = [
  {
    title: "Reverse Linked List",
    icon: "sync_alt",
    complexity: "O(n)",
    path: "/linked-list/reverse",
    desc: "Reverses the direction of links in a list by visiting each node and changing pointer connections.",
  },
  {
    title: "Find Middle",
    icon: "adjust",
    complexity: "O(n)",
    path: "/linked-list/find-middle",
    desc: "Uses slow and fast pointers to locate the middle node of a linked list in a single traversal.",
  },
  {
    title: "Detect Cycle",
    icon: "cycle",
    complexity: "O(n)",
    path: "/linked-list/detect-cycle",
    desc: "Applies Floyd's cycle detection technique using slow and fast pointers to check for loops.",
  },
  {
    title: "Merge Sorted Lists",
    icon: "merge_type",
    complexity: "O(n+m)",
    path: "/linked-list/merge-sorted",
    desc: "Combines two sorted linked lists into one sorted result by comparing nodes one by one.",
  },
];

export default function LinkedListDashboard() {
  const navigate = useNavigate();

  return (
    <AppShell breadcrumb="Linked List Algorithms">
      <section className="av-sorting-page-header">
        <div>
          <h2>Linked List Algorithms</h2>
          <p>
            Explore pointer movement, node traversal, list reversal, cycle detection,
            and sorted merging through step-by-step linked list visualizations.
          </p>
        </div>
      </section>

      <section className="av-sorting-page-grid">
        {linkedListAlgorithms.map((algo) => (
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