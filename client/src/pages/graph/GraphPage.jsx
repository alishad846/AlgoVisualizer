import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import AppShell from "../../components/AppShell";
import AlgoExplain from "../../components/AlgoExplain";
import StepLog from "../../components/StepLog";
import { GRAPH_EXPLANATIONS } from "../../data/algoExplanations";

/* 8x12 grid graph — BFS/DFS/Dijkstra */
const ROWS = 8, COLS = 12;

function makeGrid() {
  return Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => ({
    visited: false, active: false, wall: false, weight: Math.floor(Math.random() * 9) + 1, dist: Infinity
  })));
}

function neighbors(r, c, grid) {
  return [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].filter(([nr, nc]) => nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !grid[nr][nc].wall);
}

/* Topological Sort DAG */
const DAG_NODES = [
  { id: 0, x: 50, y: 50, label: "0" },
  { id: 1, x: 150, y: 50, label: "1" },
  { id: 2, x: 50, y: 150, label: "2" },
  { id: 3, x: 150, y: 150, label: "3" },
  { id: 4, x: 250, y: 100, label: "4" },
  { id: 5, x: 350, y: 100, label: "5" }
];
const DAG_EDGES = [
  { from: 0, to: 1 }, { from: 0, to: 2 },
  { from: 1, to: 3 }, { from: 2, to: 3 },
  { from: 3, to: 4 }, { from: 4, to: 5 }, { from: 1, to: 4 }
];

function DagViz({ activeNode, visitedNodes, order }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
      <svg width={400} height={220} style={{ background: "var(--surface2)", borderRadius: 8, border: "1px solid var(--border)" }}>
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="22" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="var(--border2)" />
          </marker>
        </defs>
        {DAG_EDGES.map((edge, i) => {
          const n1 = DAG_NODES.find(n => n.id === edge.from);
          const n2 = DAG_NODES.find(n => n.id === edge.to);
          return (
            <line key={i} x1={n1.x} y1={n1.y} x2={n2.x} y2={n2.y}
              stroke="var(--border2)" strokeWidth={2} markerEnd="url(#arrowhead)" />
          );
        })}
        {DAG_NODES.map(n => {
          const isActive = activeNode === n.id;
          const isVisited = visitedNodes.has(n.id);
          return (
            <g key={n.id}>
              <circle cx={n.x} cy={n.y} r={16}
                fill={isActive ? "var(--cyan)" : isVisited ? "rgba(6,182,212,0.2)" : "var(--surface)"}
                stroke={isActive ? "var(--cyan)" : isVisited ? "var(--cyan)" : "var(--border)"}
                strokeWidth={2} style={{ transition: "all 0.3s" }} />
              <text x={n.x} y={n.y + 5} textAnchor="middle" fontSize={14} fontWeight="bold"
                fill={isActive ? "#000" : "var(--text)"}>{n.label}</text>
            </g>
          );
        })}
      </svg>
      {order.length > 0 && (
        <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          <div style={{ fontSize: 13, color: "var(--muted)", width: "100%", textAlign: "center", marginBottom: 4 }}>Topological Order:</div>
          {order.map((nodeId, i) => (
            <div key={i} style={{ padding: "4px 12px", background: "var(--cyan)", color: "#000", borderRadius: 16, fontWeight: "bold", fontSize: 14 }}>
              {nodeId}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function GraphPage() {
  const { algo } = useParams();
  const currentAlgo = algo || "bfs";
  const explanation = GRAPH_EXPLANATIONS[currentAlgo] || GRAPH_EXPLANATIONS["bfs"];
  const isTopo = currentAlgo === "topological-sort";
  const isDijkstra = currentAlgo === "dijkstra";

  const [grid, setGrid] = useState(makeGrid);

  // Topo state
  const [activeNode, setActiveNode] = useState(null);
  const [visitedNodes, setVisitedNodes] = useState(new Set());
  const [topoOrder, setTopoOrder] = useState([]);

  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(isTopo ? 600 : 50);
  const [stepLog, setStepLog] = useState([]);

  const runIdRef = useRef(0);
  const runningRef = useRef(false);
  const mountedRef = useRef(true);
  const speedRef = useRef(speed);

  // Stores the state of every graph algorithm.
  const savedStatesRef = useRef({});

  // Remembers the previously selected algorithm.
  const previousAlgoRef = useRef(currentAlgo);

  // Stores the latest visible state.
  const latestStateRef = useRef({
    grid,
    activeNode,
    visitedNodes,
    topoOrder,
    stepLog,
    speed,
  });

  useEffect(() => {
    latestStateRef.current = {
      grid,
      activeNode,
      visitedNodes,
      topoOrder,
      stepLog,
      speed,
    };
  }, [grid, activeNode, visitedNodes, topoOrder, stepLog, speed]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      runningRef.current = false;
      runIdRef.current += 1;
    };
  }, []);

  /*
   * Handles switching between graph algorithms.
   *
   * 1. Stops the previous algorithm.
   * 2. Saves its current visualization state.
   * 3. Restores the selected algorithm's previous state.
   */
  useEffect(() => {
    const previousAlgo = previousAlgoRef.current;

    if (previousAlgo === currentAlgo) {
      return;
    }

    // Cancel the old algorithm execution.
    runIdRef.current += 1;
    runningRef.current = false;
    setRunning(false);

    // Save the previous algorithm's state at the point it was stopped.
    savedStatesRef.current[previousAlgo] = {
      grid: latestStateRef.current.grid.map(row => row.map(cell => ({ ...cell }))),
      activeNode: latestStateRef.current.activeNode,
      visitedNodes: new Set(latestStateRef.current.visitedNodes),
      topoOrder: [...latestStateRef.current.topoOrder],
      stepLog: [...latestStateRef.current.stepLog],
      speed: latestStateRef.current.speed,
    };

    const savedState = savedStatesRef.current[currentAlgo];

    if (savedState) {
      setGrid(savedState.grid);
      setActiveNode(savedState.activeNode);
      setVisitedNodes(savedState.visitedNodes);
      setTopoOrder(savedState.topoOrder);
      setSpeed(savedState.speed);
      speedRef.current = savedState.speed;

      setStepLog([
        ...savedState.stepLog,
        {
          text: `Returned to ${GRAPH_EXPLANATIONS[currentAlgo]?.title || currentAlgo}. Previous state restored.`,
          type: "info",
        },
      ]);
    } else {
      const isNewTopo = currentAlgo === "topological-sort";
      
      if (isNewTopo) {
        setGrid(makeGrid());
        setActiveNode(null);
        setVisitedNodes(new Set());
        setTopoOrder([]);
      } else {
        // Copy walls and weights from current grid, reset visualization states
        const currentGrid = latestStateRef.current.grid;
        const newGrid = currentGrid.map(row => row.map(cell => ({
          ...cell,
          visited: false,
          active: false,
          dist: Infinity,
        })));
        setGrid(newGrid);
        setActiveNode(null);
        setVisitedNodes(new Set());
        setTopoOrder([]);
      }

      const initialSpeed = isNewTopo ? 600 : 50;
      setSpeed(initialSpeed);
      speedRef.current = initialSpeed;

      setStepLog([
        {
          text: `Switched to ${GRAPH_EXPLANATIONS[currentAlgo]?.title || currentAlgo}. New visualization created.`,
          type: "info",
        },
      ]);
    }

    previousAlgoRef.current = currentAlgo;
  }, [currentAlgo]);

  const reset = () => {
    runIdRef.current += 1;
    runningRef.current = false;
    setGrid(makeGrid());
    setActiveNode(null);
    setVisitedNodes(new Set());
    setTopoOrder([]);
    setStepLog([{ text: "Reset.", type: "info" }]);
    setRunning(false);
  };

  const toggleWall = (r, c) => {
    if (runningRef.current || isTopo) return;
    setGrid(g => {
      const ng = g.map(row => row.map(cell => ({ ...cell })));
      ng[r][c].wall = !ng[r][c].wall;
      return ng;
    });
  };

  const runBFSDFS = async (isBFS, currentRunId) => {
    // Reset steps while preserving walls/weights
    const g = grid.map(row => row.map(c => ({ ...c, visited: false, active: false, dist: Infinity })));
    const start = [0, 0];

    const frontier = [start];
    g[0][0].visited = true;
    setGrid(g.map(r => r.map(c => ({ ...c }))));
    setStepLog([{ text: `Starting ${isBFS ? "BFS" : "DFS"} from [0,0]`, type: "info" }]);

    const pop = isBFS ? () => frontier.shift() : () => frontier.pop();

    while (frontier.length > 0) {
      if (runIdRef.current !== currentRunId || !mountedRef.current) return;

      const [r, c] = pop();
      g[r][c].active = true;
      setGrid(g.map(row => row.map(cc => ({ ...cc }))));
      setStepLog(prev => [...prev, { text: `Visiting [${r},${c}]`, type: "compare" }]);

      await new Promise(resolve => setTimeout(resolve, speedRef.current));

      if (runIdRef.current !== currentRunId || !mountedRef.current) return;

      g[r][c].active = false;

      let added = 0;
      for (const [nr, nc] of neighbors(r, c, g)) {
        if (!g[nr][nc].visited && !g[nr][nc].wall) {
          g[nr][nc].visited = true;
          frontier.push([nr, nc]);
          added++;
        }
      }
      if (added > 0) {
        setStepLog(prev => [...prev, { text: `Added ${added} neighbors of [${r},${c}]`, type: "swap" }]);
      }
      setGrid(g.map(row => row.map(cc => ({ ...cc }))));
    }

    if (mountedRef.current && runIdRef.current === currentRunId) {
      setStepLog(prev => [...prev, { text: `${isBFS ? "BFS" : "DFS"} complete!`, type: "done" }]);
      runningRef.current = false;
      setRunning(false);
    }
  };

  const runDijkstra = async (currentRunId) => {
    const g = grid.map(row => row.map(c => ({ ...c, visited: false, active: false, dist: Infinity })));

    g[0][0].dist = 0;
    setGrid(g.map(r => r.map(c => ({ ...c }))));
    setStepLog([{ text: "Starting Dijkstra from [0,0]", type: "info" }]);

    while (true) {
      if (runIdRef.current !== currentRunId || !mountedRef.current) return;

      // Find min dist unvisited
      let minD = Infinity, minR = -1, minC = -1;
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (!g[r][c].visited && !g[r][c].wall && g[r][c].dist < minD) {
            minD = g[r][c].dist; minR = r; minC = c;
          }
        }
      }

      if (minR === -1) break; // done

      g[minR][minC].visited = true;
      g[minR][minC].active = true;
      setGrid(g.map(row => row.map(cc => ({ ...cc }))));
      setStepLog(prev => [...prev, { text: `Extract min: [${minR},${minC}] with dist ${minD}`, type: "compare" }]);

      await new Promise(resolve => setTimeout(resolve, speedRef.current));

      if (runIdRef.current !== currentRunId || !mountedRef.current) return;

      for (const [nr, nc] of neighbors(minR, minC, g)) {
        if (!g[nr][nc].visited && !g[nr][nc].wall) {
          const alt = g[minR][minC].dist + g[nr][nc].weight;
          if (alt < g[nr][nc].dist) {
            g[nr][nc].dist = alt;
            setStepLog(prev => [...prev, { text: `Relax edge to [${nr},${nc}], new dist = ${alt}`, type: "swap" }]);
          }
        }
      }
      g[minR][minC].active = false;
      setGrid(g.map(row => row.map(cc => ({ ...cc }))));
    }

    if (mountedRef.current && runIdRef.current === currentRunId) {
      setStepLog(prev => [...prev, { text: "Dijkstra complete!", type: "done" }]);
      runningRef.current = false;
      setRunning(false);
    }
  };

  const runTopoSort = async (currentRunId) => {
    setActiveNode(null); setVisitedNodes(new Set()); setTopoOrder([]);

    const inDegree = {};
    DAG_NODES.forEach(n => inDegree[n.id] = 0);
    DAG_EDGES.forEach(e => inDegree[e.to]++);

    const queue = Object.keys(inDegree).filter(k => inDegree[k] === 0).map(Number);
    const order = [];
    const visited = new Set();

    setStepLog([{ text: `Initial queue (in-degree 0): [${queue.join(",")}]`, type: "info" }]);
    
    await new Promise(resolve => setTimeout(resolve, speedRef.current));

    if (runIdRef.current !== currentRunId || !mountedRef.current) return;

    while (queue.length > 0) {
      if (runIdRef.current !== currentRunId || !mountedRef.current) return;
      const u = queue.shift();
      setActiveNode(u);
      order.push(u);
      visited.add(u);
      setVisitedNodes(new Set(visited));
      setTopoOrder([...order]);

      setStepLog(prev => [...prev, { text: `Process node ${u}`, type: "compare" }]);
      
      await new Promise(resolve => setTimeout(resolve, speedRef.current));

      if (runIdRef.current !== currentRunId || !mountedRef.current) return;

      const neighbors = DAG_EDGES.filter(e => e.from === u).map(e => e.to);
      for (const v of neighbors) {
        inDegree[v]--;
        setStepLog(prev => [...prev, { text: `Edge ${u}→${v}: decrement ${v} in-degree to ${inDegree[v]}`, type: "swap" }]);
        if (inDegree[v] === 0) {
          queue.push(v);
          setStepLog(prev => [...prev, { text: `Node ${v} in-degree is 0, add to queue`, type: "info" }]);
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, speedRef.current));
      
      if (runIdRef.current !== currentRunId || !mountedRef.current) return;
    }
    setActiveNode(null);
    if (mountedRef.current && runIdRef.current === currentRunId) {
      setStepLog(prev => [...prev, { text: `Topological Sort complete!`, type: "done" }]);
      runningRef.current = false;
      setRunning(false);
    }
  };

  const handleStart = () => {
    if (runningRef.current) return;

    const currentRunId = runIdRef.current + 1;
    runIdRef.current = currentRunId;
    runningRef.current = true;
    setRunning(true);

    if (currentAlgo === "bfs") runBFSDFS(true, currentRunId);
    else if (currentAlgo === "dfs") runBFSDFS(false, currentRunId);
    else if (currentAlgo === "dijkstra") runDijkstra(currentRunId);
    else if (currentAlgo === "topological-sort") runTopoSort(currentRunId);
    else runBFSDFS(true, currentRunId);
  };

  const stop = () => {
    if (!runningRef.current) return;
    runIdRef.current += 1;
    runningRef.current = false;
    setRunning(false);
    const displayName = GRAPH_EXPLANATIONS[currentAlgo]?.title || currentAlgo;
    setStepLog(prev => [...prev, { text: `${displayName} stopped by user.`, type: "warning" }]);
  };

  const CELL = 40;

  return (
    <AppShell breadcrumb={`Graph / ${explanation?.title || currentAlgo}`}>
      <div className="section-title">{explanation?.title || currentAlgo}</div>
      <div className="section-sub">
        {isTopo ? "Watch node ordering in a Directed Acyclic Graph" : "Click cells to toggle walls. Watch the algorithm explore the grid live."}
      </div>

      <div className="controls-bar" style={{ marginBottom: 12 }}>
        <button className="btn btn-ghost" onClick={reset} disabled={running}>⟳ Reset</button>
        <button className="btn btn-primary" onClick={handleStart} disabled={running}>
          ▶ Start {isTopo ? "" : "from [0,0]"}
        </button>
        <button className="btn btn-danger" onClick={stop} disabled={!running}>■ Stop</button>
        <label>Speed</label>
        <input
          type="range"
          className="speed-slider"
          min={50}
          max={1000}
          step={10}
          value={speed}
          onChange={e => {
            const newSpeed = +e.target.value;
            setSpeed(newSpeed);
            speedRef.current = newSpeed;   //  latest value store
          }}
        />

        <span style={{ fontSize: 12, color: "var(--muted)", minWidth: 45 }}>{speed}ms</span>
      </div>

      <div className="viz-layout-3">
        {/* LEFT — Explanation */}
        <div className="viz-left">
          <AlgoExplain explanation={explanation} />
        </div>

        {/* CENTER — Visualizer */}
        <div className="viz-center">
          <div className="card" style={{ overflow: "auto", display: "flex", flexDirection: "column", alignItems: "center", padding: 16, minHeight: 350 }}>

            {isTopo ? (
              <DagViz activeNode={activeNode} visitedNodes={visitedNodes} order={topoOrder} />
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${COLS},${CELL}px)`, gap: 2, padding: 8 }}>
                {grid.map((row, r) => row.map((cell, c) => (
                  <div key={`${r}-${c}`} onClick={() => toggleWall(r, c)} style={{
                    width: CELL, height: CELL, borderRadius: 6, cursor: "pointer",
                    background: cell.wall ? "var(--border2)" :
                      r === 0 && c === 0 ? "var(--green)" :
                        cell.active ? "var(--cyan)" :
                          cell.visited ? "rgba(6,182,212,0.25)" : "var(--surface2)",
                    border: `1px solid var(--border)`,
                    transition: "background 0.15s",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    fontSize: 10, color: cell.active ? "#000" : "var(--muted)", position: "relative"
                  }}>
                    {r === 0 && c === 0 && <span style={{ position: "absolute", top: 2, left: 4, fontWeight: "bold", color: "#fff" }}>S</span>}
                    {isDijkstra && !cell.wall && <span style={{ fontSize: 9, opacity: 0.6 }}>{cell.weight}</span>}
                    {isDijkstra && cell.dist !== Infinity && <span style={{ fontWeight: "bold", fontSize: 11 }}>{cell.dist}</span>}
                  </div>
                )))}
              </div>
            )}

            {!isTopo && (
              <div style={{ display: "flex", gap: 12, marginTop: 16, fontSize: 11, color: "var(--muted)", flexWrap: "wrap", justifyContent: "center" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 12, height: 12, borderRadius: 3, background: "var(--cyan)", opacity: 0.25 }} /> Visited</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 12, height: 12, borderRadius: 3, background: "var(--cyan)" }} /> Current</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 12, height: 12, borderRadius: 3, background: "var(--border2)" }} /> Wall (click)</span>
                {isDijkstra && <span style={{ display: "flex", alignItems: "center", gap: 4 }}>Top num: Edge Weight, Center num: Dist</span>}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — Step Log */}
        <div className="viz-right">
          <StepLog steps={stepLog} />
        </div>
      </div>
    </AppShell>
  );
}
