import React from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../../components/AppShell";
import "../Dashboard.css";
import "./SortingDashboard.css";

function Icon({ children, className = "" }) {
  return <span className={`material-symbols-outlined ${className}`}>{children}</span>;
}

const mlAlgorithms = [
  {
    title: "Linear Regression",
    icon: "show_chart",
    complexity: "O(n)",
    path: "/ml/linear-regression",
    desc: "Fits a line through data points by adjusting slope and intercept to reduce prediction error.",
  },
  {
    title: "K-Means",
    icon: "scatter_plot",
    complexity: "O(nki)",
    path: "/ml/k-means",
    desc: "Groups points into clusters by repeatedly assigning points to centroids and moving centroids to cluster means.",
  },
  {
    title: "KNN",
    icon: "join_inner",
    complexity: "O(n)",
    path: "/ml/knn",
    desc: "Classifies a test point by finding the nearest neighbors and using majority voting.",
  },
  {
    title: "Decision Tree",
    icon: "account_tree",
    complexity: "O(depth)",
    path: "/ml/decision-tree",
    desc: "Classifies a sample by following decision rules from the root node to a final leaf class.",
  },
];

export default function MachineLearningDashboard() {
  const navigate = useNavigate();

  return (
    <AppShell breadcrumb="Machine Learning Algorithms">
      <section className="av-sorting-page-header">
        <div>
          <h2>Machine Learning Algorithms</h2>
          <p>
            Explore model behavior through regression fitting, clustering, nearest-neighbor
            classification, and decision-tree rule traversal.
          </p>
        </div>
      </section>

      <section className="av-sorting-page-grid">
        {mlAlgorithms.map((algo) => (
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