import React from "react";
import AppShell from "../components/AppShell";

export default function DocumentationPage() {
  return (
    <AppShell breadcrumb="Documentation">
      <div className="section-title">Documentation & Architecture Guide</div>
      <div className="section-sub">Learn how AlgoVisualizer translates complex computational algorithms into visual intelligence</div>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px", marginTop: "16px", maxWidth: "900px" }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "24px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 800, color: "var(--cyan)", marginTop: 0, marginBottom: "12px" }}>System Overview</h3>
          <p style={{ color: "var(--muted)", lineHeight: 1.7, fontSize: "14px", margin: 0 }}>
            AlgoVisualizer is an advanced interactive algorithmic execution environment built with React and powered by a real-time step simulation engine. Each algorithm is broken down into atomic, measurable execution frames containing exact data state transformations, step logs, comparisons, and swap counters.
          </p>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "24px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#fff", marginTop: 0, marginBottom: "16px" }}>Supported Algorithm Categories</h3>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
            <div style={{ background: "var(--surface2)", padding: "16px", borderRadius: "8px" }}>
              <h4 style={{ color: "var(--cyan)", margin: "0 0 8px", fontSize: "15px" }}>Sorting Algorithms</h4>
              <p style={{ color: "var(--muted)", fontSize: "13px", margin: 0, lineHeight: 1.5 }}>
                Visualizes in-place sorting dynamics, pivot selections, and divide-and-conquer partitions (Bubble, Merge, Quick, Heap, Radix, etc.).
              </p>
            </div>

            <div style={{ background: "var(--surface2)", padding: "16px", borderRadius: "8px" }}>
              <h4 style={{ color: "var(--purple)", margin: "0 0 8px", fontSize: "15px" }}>Searching Algorithms</h4>
              <p style={{ color: "var(--muted)", fontSize: "13px", margin: 0, lineHeight: 1.5 }}>
                Highlights boundary narrowing and index comparisons across Linear, Binary, Jump, and Exponential search methods.
              </p>
            </div>

            <div style={{ background: "var(--surface2)", padding: "16px", borderRadius: "8px" }}>
              <h4 style={{ color: "var(--green)", margin: "0 0 8px", fontSize: "15px" }}>Graph & Tree Traversals</h4>
              <p style={{ color: "var(--muted)", fontSize: "13px", margin: 0, lineHeight: 1.5 }}>
                Simulates BFS queue frontiers, DFS recursion depth, shortest paths (Dijkstra), and binary search tree insertions.
              </p>
            </div>

            <div style={{ background: "var(--surface2)", padding: "16px", borderRadius: "8px" }}>
              <h4 style={{ color: "var(--orange)", margin: "0 0 8px", fontSize: "15px" }}>Dynamic Programming</h4>
              <p style={{ color: "var(--muted)", fontSize: "13px", margin: 0, lineHeight: 1.5 }}>
                Displays memoization tables and state evolution for Fibonacci, 0/1 Knapsack, Longest Common Subsequence, and Coin Change.
              </p>
            </div>
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "24px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#fff", marginTop: 0, marginBottom: "12px" }}>Background Simulation Caching</h3>
          <p style={{ color: "var(--muted)", lineHeight: 1.7, fontSize: "14px", margin: 0 }}>
            AlgoVisualizer features persistent background simulation states. When you initiate an algorithm execution and navigate to browse another method, your previous algorithm continues running and computing steps in the background. Returning to the tab restores the exact live state or final green completion display seamlessly without resetting.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
