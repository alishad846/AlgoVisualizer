import React from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../../components/AppShell";
import "../Dashboard.css";
import "./SortingDashboard.css";

function Icon({ children, className = "" }) {
  return <span className={`material-symbols-outlined ${className}`}>{children}</span>;
}

const sortingAlgorithms = [
  {
    title: "Bubble Sort",
    icon: "bubble_chart",
    complexity: "O(n²)",
    path: "/sorting/bubble-sort",
    desc: "The simplest sorting strategy. It repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order.",
  },
  {
    title: "Selection Sort",
    icon: "checklist_rtl",
    complexity: "O(n²)",
    path: "/sorting/selection-sort",
    desc: "Divides input into sorted and unsorted parts, repeatedly finding the minimum element to move to the sorted part.",
  },
  {
    title: "Insertion Sort",
    icon: "playlist_add_check",
    complexity: "O(n²)",
    path: "/sorting/insertion-sort",
    desc: "Builds the final sorted array one item at a time. Much less efficient on large lists than advanced algorithms.",
  },
  {
    title: "Merge Sort",
    icon: "splitscreen",
    complexity: "O(n log n)",
    path: "/sorting/merge-sort",
    desc: "A stable, divide-and-conquer algorithm. Recursively splits data into smaller subarrays, sorts them, and merges back.",
  },
  {
    title: "Quick Sort",
    icon: "bolt",
    complexity: "O(n log n)",
    path: "/sorting/quick-sort",
    desc: "High-performance partitioning. Picks a pivot and reorders array so elements smaller than pivot come before it.",
  },
  {
    title: "Heap Sort",
    icon: "account_tree",
    complexity: "O(n log n)",
    path: "/sorting/heap-sort",
    desc: "Comparison-based sorting technique based on a Binary Heap. Similar to selection sort but uses a max heap.",
  },
  {
    title: "Counting Sort",
    icon: "calculate",
    complexity: "O(n+k)",
    path: "/sorting/counting-sort",
    desc: "Integer sorting algorithm that operates by counting occurrences of distinct key values.",
  },
  {
    title: "Radix Sort",
    icon: "timer_1",
    complexity: "O(nk)",
    path: "/sorting/radix-sort",
    desc: "Non-comparative sorting. Distributes elements into buckets according to their radix, or digit positions.",
  },
  {
    title: "Shell Sort",
    icon: "waves",
    complexity: "O(n log² n)",
    path: "/sorting/shell-sort",
    desc: "Optimization of insertion sort that allows the exchange of items far apart using gap sequences.",
  },
  {
    title: "Bucket Sort",
    icon: "shopping_basket",
    complexity: "O(n+k) avg",
    path: "/sorting/bucket-sort",
    desc: "Partitioning into buckets, then sorting each individually using another algorithm.",
  },
];

export default function SortingDashboard() {
  const navigate = useNavigate();

  return (
    <AppShell breadcrumb="Sorting Algorithms">
      <section className="av-sorting-page-header">
        <div>
          <h2>Sorting Algorithms</h2>
          <p>
            Explore the computational mechanics of array ordering. From divide-and-conquer
            strategies to non-comparative distribution, visualize how data finds its structure.
          </p>
        </div>

       
      </section>

      <section className="av-sorting-page-grid">
        {sortingAlgorithms.map((algo) => (
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