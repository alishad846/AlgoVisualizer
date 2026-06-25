import React, { useEffect, useState } from "react";
import "./Dashboard.css";

const navSections = [
  { title: "Sorting", icon: "sort", items: ["Bubble Sort", "Selection Sort", "Insertion Sort", "Merge Sort", "Quick Sort", "Heap Sort", "Counting Sort", "Radix Sort", "Shell Sort", "Bucket Sort"] },
  { title: "Searching", icon: "search", items: ["Linear Search", "Binary Search", "Jump Search", "Interpolation Search", "Exponential Search"] },
  { title: "Recursion", icon: "rebase_edit", items: ["Tower of Hanoi", "N-Queens", "Rat in a Maze", "Subset Generation"] },
  { title: "Linked List", icon: "link", items: ["Reverse List", "Detect Cycle", "Merge Sorted", "Find Middle"] },
  { title: "Stack & Queue", icon: "view_agenda", items: ["Stack (Push/Pop)", "Queue", "Valid Parentheses", "Next Greater"] },
  { title: "Tree", icon: "account_tree", items: ["In Order", "Pre Order", "Post Order", "Level Order", "BST Insert"] },
  { title: "Graph", icon: "hub", items: ["BFS", "DFS", "Dijkstra", "Topological Sort"] },
  { title: "Dynamic Progress", icon: "layers", items: ["Fibonacci", "0/1 Knapsack", "LCS", "Coin Change"] },
  { title: "Machine Learning", icon: "memory", items: ["Linear Regression", "K-Means", "KNN", "Decision Tree"] },
];

function Icon({ children, className = "" }) {
  return <span className={`material-symbols-outlined ${className}`}>{children}</span>;
}

function SidebarItem({ section, openKey, setOpenKey }) {
  const isOpen = openKey === section.title;
  return (
    <div className="av-nav-item">
      <button className="av-nav-button" onClick={() => setOpenKey(isOpen ? "" : section.title)}>
        <span className="av-nav-left">
          <span className="av-nav-icon"><Icon>{section.icon}</Icon></span>
          <span>{section.title}</span>
        </span>
        <Icon className={`av-chevron ${isOpen ? "av-rotate" : ""}`}>chevron_right</Icon>
      </button>
      <div className={`av-submenu ${isOpen ? "av-submenu-open" : ""}`}>
        {section.items.map((item) => (
          <a href="#" key={item}>{item}</a>
        ))}
      </div>
    </div>
  );
}

function SmallCard({ icon, title, text, meta }) {
  return (
    <div className="av-card av-small-card">
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

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openKey, setOpenKey] = useState("");

  useEffect(() => {
    document.documentElement.classList.add("dark");
    document.body.classList.add("av-body-lock");

    const fontId = "av-dashboard-fonts";
    if (!document.getElementById(fontId)) {
      const link = document.createElement("link");
      link.id = fontId;
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap";
      document.head.appendChild(link);
    }

    return () => document.body.classList.remove("av-body-lock");
  }, []);

  return (
    <div className="av-dashboard-root">
      <header className="av-topbar">
        <div className="av-top-left">
          <button aria-label="Toggle Sidebar" className="av-icon-btn" onClick={() => setSidebarOpen((v) => !v)}>
            <Icon>menu</Icon>
          </button>
          <h1>AlgoVisualizer</h1>
          <a href="#">Dashboard</a>
        </div>
        <button className="av-icon-btn av-user"><Icon>account_circle</Icon></button>
      </header>

      <div className={`av-overlay ${sidebarOpen ? "" : "av-hide"}`} onClick={() => setSidebarOpen(false)} />

      <aside className={`av-sidebar ${sidebarOpen ? "" : "av-sidebar-collapsed"}`}>
        <div className="av-sidebar-inner">
          <div className="av-sidebar-main">
            <p className="av-sidebar-label">ALGORITHM LIBRARY</p>
            <nav className="av-nav">
              <a className="av-nav-link" href="#">
                <span className="av-nav-icon"><Icon>dashboard</Icon></span>
                <span>Dashboard</span>
              </a>
              {navSections.map((section) => (
                <SidebarItem key={section.title} section={section} openKey={openKey} setOpenKey={setOpenKey} />
              ))}
            </nav>
          </div>

          <div className="av-sidebar-footer">
            <button className="av-runner-btn"><Icon>play_arrow</Icon><span>Launch Runner</span></button>
            <a className="av-footer-link" href="#"><span className="av-nav-icon"><Icon>menu_book</Icon></span><span>Documentation</span></a>
            <a className="av-footer-link" href="#"><span className="av-nav-icon"><Icon>help_outline</Icon></span><span>Support</span></a>
          </div>
        </div>
      </aside>

      <main className={`av-main ${sidebarOpen ? "" : "av-main-expanded"}`}>
        <div className="av-container">
          <section className="av-hero">
            <div>
              <h2>Algorithm Explorer</h2>
              <p>Master complex logic through interactive high-fidelity visualizations. Select a category below to begin your visual execution path.</p>
            </div>
            <div className="av-status"><span></span><strong>SYSTEM: ACTIVE</strong></div>
          </section>

          <section className="av-grid">
            <div className="av-card av-sorting-card">
              <div className="av-card-content">
                <Icon className="av-card-icon av-big-icon">sort</Icon>
                <h3>Sorting</h3>
                <p>Visualizing the spatial efficiency of 10 distinct sorting protocols, from Bubble to Bucket Sort.</p>
              </div>
              <div className="av-card-bottom av-z">
                <span className="av-chip">10 ALGORITHMS</span>
                <button className="av-explore">Explore <Icon>arrow_forward</Icon></button>
              </div>
              <Icon className="av-watermark">sort</Icon>
            </div>

            <SmallCard icon="search" title="Searching" text="Binary, Linear, and Jump paths." meta="5 VARIANTS" />
            <SmallCard icon="rebase_edit" title="Recursion" text="Visualizing Tower of Hanoi and Backtracking." meta="4 TYPES" />
            <SmallCard icon="link" title="Linked List" text="Pointers and memory allocation nodes." meta="4 ALGORITHMS" />
            <SmallCard icon="account_tree" title="Trees" text="In Order, Pre Order, and BST operations." meta="5 ALGORITHMS" />

            <div className="av-card av-graphs-card">
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
              <button className="av-graph-btn">Launch Graph Runner</button>
            </div>

            <SmallCard icon="view_agenda" title="Stack & Queue" text="LIFO and FIFO operations." meta="4 VARIATIONS" />

            <div className="av-card av-dp-card">
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

            <div className="av-card av-ml-card">
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
        </div>
      </main>
      <div className="av-bg-noise" />
    </div>
  );
}
