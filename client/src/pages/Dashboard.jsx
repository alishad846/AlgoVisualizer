import React from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import "./Dashboard.css";

function Icon({ children, className = "" }) {
  return <span className={`material-symbols-outlined ${className}`}>{children}</span>;
}

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

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <AppShell breadcrumb="Dashboard">
      <section className="av-hero">
        <div>
          <h2>Algorithm Explorer</h2>
          <p>Master complex logic through interactive high-fidelity visualizations. Select a category below to begin your visual execution path.</p>
        </div>
      </section>

      <section className="av-grid">
        <div className="av-card av-sorting-card" onClick={() => navigate('/sorting/bubble-sort')} style={{ cursor: "pointer" }}>
          <div className="av-card-content">
            <Icon className="av-card-icon av-big-icon">sort</Icon>
            <h3>Sorting</h3>
            <p>Visualizing the spatial efficiency of 10 distinct sorting protocols, from Bubble to Bucket Sort.</p>
          </div>
          <div className="av-card-bottom av-z">
            <span className="av-chip">10 ALGORITHMS</span>
            <button className="av-explore" onClick={(e) => { e.stopPropagation(); navigate('/sorting/bubble-sort'); }}>Explore <Icon>arrow_forward</Icon></button>
          </div>
          <Icon className="av-watermark">sort</Icon>
        </div>

        <SmallCard icon="search" title="Searching" text="Binary, Linear, and Jump paths." meta="5 VARIANTS" onClick={() => navigate('/searching/linear-search')} />
        <SmallCard icon="rebase_edit" title="Recursion" text="Visualizing Tower of Hanoi and Backtracking." meta="4 TYPES" onClick={() => navigate('/recursion/tower-of-hanoi')} />
        <SmallCard icon="link" title="Linked List" text="Pointers and memory allocation nodes." meta="4 ALGORITHMS" onClick={() => navigate('/linked-list/reverse')} />
        <SmallCard icon="account_tree" title="Trees" text="In Order, Pre Order, and BST operations." meta="5 ALGORITHMS" onClick={() => navigate('/tree/inorder')} />

        <div className="av-card av-graphs-card" onClick={() => navigate('/graph/bfs')} style={{ cursor: "pointer" }}>
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
          <button className="av-graph-btn" onClick={(e) => { e.stopPropagation(); navigate('/graph/bfs'); }}>Launch Graph Runner</button>
        </div>

        <SmallCard icon="view_agenda" title="Stack & Queue" text="LIFO and FIFO operations." meta="4 VARIATIONS" onClick={() => navigate('/stack-queue/stack')} />

        <div className="av-card av-dp-card" onClick={() => navigate('/dp/fibonacci')} style={{ cursor: "pointer" }}>
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

        <div className="av-card av-ml-card" onClick={() => navigate('/ml/linear-regression')} style={{ cursor: "pointer" }}>
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
    </AppShell>
  );
}
