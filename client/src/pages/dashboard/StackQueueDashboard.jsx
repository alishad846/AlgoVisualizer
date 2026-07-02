import React from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../../components/AppShell";
import "../Dashboard.css";
import "./SortingDashboard.css";

function Icon({ children, className = "" }) {
  return <span className={`material-symbols-outlined ${className}`}>{children}</span>;
}

const stackQueueAlgorithms = [
  {
    title: "Stack",
    icon: "vertical_align_top",
    complexity: "O(1)",
    path: "/stack-queue/stack",
    desc: "Visualizes Last In First Out behavior where push adds to the top and pop removes from the top.",
  },
  {
    title: "Queue",
    icon: "view_stream",
    complexity: "O(1)",
    path: "/stack-queue/queue",
    desc: "Visualizes First In First Out behavior where enqueue adds to the back and dequeue removes from the front.",
  },
  {
    title: "Valid Parentheses",
    icon: "data_array",
    complexity: "O(n)",
    path: "/stack-queue/valid-parentheses",
    desc: "Uses a stack to match opening and closing brackets and decide whether the expression is valid.",
  },
  {
    title: "Next Greater Element",
    icon: "trending_up",
    complexity: "O(n)",
    path: "/stack-queue/next-greater",
    desc: "Uses a monotonic stack to find the next greater value for each element in an array.",
  },
];

export default function StackQueueDashboard() {
  const navigate = useNavigate();

  return (
    <AppShell breadcrumb="Stack & Queue Algorithms">
      <section className="av-sorting-page-header">
        <div>
          <h2>Stack & Queue Algorithms</h2>
          <p>
            Explore linear data structure behavior through stack operations, queue operations,
            bracket matching, and monotonic stack processing.
          </p>
        </div>
      </section>

      <section className="av-sorting-page-grid">
        {stackQueueAlgorithms.map((algo) => (
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