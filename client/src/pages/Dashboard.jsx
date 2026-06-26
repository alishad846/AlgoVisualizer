import React from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import "./Dashboard.css";

function Icon({ children, className = "" }) {
  return <span className={`material-symbols-outlined ${className}`}>{children}</span>;
}

const sortingAlgorithms = [
  { title: "Bubble Sort", icon: "bubble_chart", complexity: "O(n²)", path: "/sorting/bubble-sort", desc: "The simplest sorting strategy. It repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order." },
  { title: "Selection Sort", icon: "checklist_rtl", complexity: "O(n²)", path: "/sorting/selection-sort", desc: "Divides input into sorted and unsorted parts, repeatedly finding the minimum element to move to the sorted part." },
  { title: "Insertion Sort", icon: "playlist_add_check", complexity: "O(n²)", path: "/sorting/insertion-sort", desc: "Builds the final sorted array one item at a time. Much less efficient on large lists than advanced algorithms." },
  { title: "Merge Sort", icon: "splitscreen", complexity: "O(n log n)", path: "/sorting/merge-sort", desc: "A stable, divide-and-conquer algorithm. Recursively splits data into smaller subarrays, sorts them, and merges back." },
  { title: "Quick Sort", icon: "bolt", complexity: "O(n log n)", path: "/sorting/quick-sort", desc: "High-performance partitioning. Picks a 'pivot' and reorders array so elements smaller than pivot come before it." },
  { title: "Heap Sort", icon: "account_tree", complexity: "O(n log n)", path: "/sorting/heap-sort", desc: "Comparison-based sorting technique based on a Binary Heap. Similar to selection sort but uses a max heap." },
  { title: "Counting Sort", icon: "calculate", complexity: "O(n+k)", path: "/sorting/counting-sort", desc: "Integer sorting algorithm that operates by counting occurrences of distinct key values." },
  { title: "Radix Sort", icon: "timer_1", complexity: "O(nk)", path: "/sorting/radix-sort", desc: "Non-comparative sorting. Distributes elements into buckets according to their radix (digit positions)." },
  { title: "Shell Sort", icon: "waves", complexity: "O(n log² n)", path: "/sorting/shell-sort", desc: "Optimization of insertion sort that allows the exchange of items far apart using gap sequences." },
  { title: "Bucket Sort", icon: "shopping_basket", complexity: "O(n+k) avg", path: "/sorting/bucket-sort", desc: "Partitioning into buckets, then sorting each individually using another algorithm." },
];

function SmallCard({ icon, title, text, meta, onClick }) {
  return (
    <div className="av-card av-small-card" onClick={onClick} style={{ cursor: "pointer" }}>
      <div>
        <Icon className="av-card-icon">{icon}</Icon>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
      <div className="av-card-bottom">
        <span>{meta}</span>
        <Icon className="av-arrow">chevron_right</Icon>
      </div>
    </div>
  );
}

function SortingDashboardContent() {
  const navigate = useNavigate();

  return (
    <>
      <section className="av-sorting-page-header">
        <div>
          <h2>Sorting Algorithms</h2>
          <p>
            Explore the computational mechanics of array ordering. From divide-and-conquer
            strategies to non-comparative distribution, visualize how data finds its structure.
          </p>
        </div>

        <div className="av-active-module">
          <span>Active Module:</span>
          <strong>Running</strong>
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
    </>
  );
}

function DashboardHomeContent() {
  const navigate = useNavigate();

  return (
    <>
      <section className="av-hero">
        <div>
          <h2>Algorithm Explorer</h2>
          <p>Master complex logic through interactive high-fidelity visualizations. Select a category below to begin your visual execution path.</p>
        </div>
        <div className="av-status"><span></span><strong>SYSTEM: ACTIVE</strong></div>
      </section>

      <section className="av-grid">
        <div className="av-card av-sorting-card" onClick={() => navigate("/dashboard/sorting")} style={{ cursor: "pointer" }}>
          <div className="av-card-content">
            <Icon className="av-card-icon av-big-icon">sort</Icon>
            <h3>Sorting</h3>
            <p>Visualizing the spatial efficiency of 10 distinct sorting protocols, from Bubble to Bucket Sort.</p>
          </div>
          <div className="av-card-bottom av-z">
            <span className="av-chip">10 ALGORITHMS</span>
            <button className="av-explore" onClick={(e) => { e.stopPropagation(); navigate("/dashboard/sorting"); }}>
              Explore <Icon>arrow_forward</Icon>
            </button>
          </div>
          <Icon className="av-watermark">sort</Icon>
        </div>

        <SmallCard icon="search" title="Searching" text="Binary, Linear, and Jump paths." meta="5 VARIANTS" onClick={() => navigate("/searching/linear-search")} />
        <SmallCard icon="rebase_edit" title="Recursion" text="Visualizing Tower of Hanoi and Backtracking." meta="4 TYPES" onClick={() => navigate("/recursion/tower-of-hanoi")} />
        <SmallCard icon="link" title="Linked List" text="Pointers and memory allocation nodes." meta="4 ALGORITHMS" onClick={() => navigate("/linked-list/reverse")} />
        <SmallCard icon="account_tree" title="Trees" text="In Order, Pre Order, and BST operations." meta="5 ALGORITHMS" onClick={() => navigate("/tree/inorder")} />

        <div className="av-card av-graphs-card" onClick={() => navigate("/graph/bfs")} style={{ cursor: "pointer" }}>
          <div>
            <Icon className="av-card-icon av-big-icon">hub</Icon>
            <h3>Graphs</h3>
            <p>Explore Dijkstra, BFS, and DFS through dynamic pathfinding visuals.</p>
            <ul>
              <li><span></span>Pathfinding Matrix</li>
              <li><span></span>Traversal Logic</li>
              <li><span></span>Shortest Path</li>
              <li><span></span>Topological Sort</li>
            </ul>
          </div>
          <div className="av-graph-meta">4 VARIANTS</div>
          <button className="av-graph-btn" onClick={(e) => { e.stopPropagation(); navigate("/graph/bfs"); }}>Launch Graph Runner</button>
        </div>

        <SmallCard icon="view_agenda" title="Stack & Queue" text="LIFO and FIFO operations." meta="4 VARIATIONS" onClick={() => navigate("/stack-queue/stack")} />

        <div className="av-card av-dp-card" onClick={() => navigate("/dp/fibonacci")} style={{ cursor: "pointer" }}>
          <div>
            <Icon className="av-card-icon">layers</Icon>
            <h3>Dynamic Programming</h3>
            <p>Fibonacci, Knapsack, and LCS optimization.</p>
          </div>
          <div className="av-card-bottom">
            <span>4 CORE CONCEPTS</span>
            <Icon className="av-arrow">chevron_right</Icon>
          </div>
        </div>

        <div className="av-card av-ml-card" onClick={() => navigate("/ml/linear-regression")} style={{ cursor: "pointer" }}>
          <div className="av-ml-left">
            <Icon className="av-card-icon av-ml-icon">memory</Icon>
            <h3>Machine Learning</h3>
            <p>Regression models, K-Means, and Decision Tree visualization.</p>
            <div className="av-graph-meta">4 MODELS</div>
            <div className="av-tags">
              <span>LinReg</span><span>K-Means</span><span>KNN</span><span>Decision Tree</span>
            </div>
          </div>
          <div className="av-ml-box"><Icon>hub</Icon></div>
        </div>
      </section>

      <div className="av-bg-noise" />
    </>
  );
}

export default function Dashboard({ page = "home" }) {
  return (
    <AppShell breadcrumb={page === "sorting" ? "Sorting Algorithms" : "Dashboard"}>
      {page === "sorting" ? <SortingDashboardContent /> : <DashboardHomeContent />}
    </AppShell>
  );
}
