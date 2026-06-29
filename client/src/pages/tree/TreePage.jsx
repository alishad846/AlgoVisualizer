import { useState, useRef, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import AppShell from "../../components/AppShell";
import AlgoExplain from "../../components/AlgoExplain";
import StepLog from "../../components/StepLog";
import { TREE_EXPLANATIONS } from "../../data/algoExplanations";

/* Simple binary tree node layout */
function randTree(depth = 3) {
  if (depth === 0) return null;
  return {
    val: Math.floor(Math.random() * 90) + 10,
    left: randTree(depth - 1),
    right: randTree(depth - 1)
  };
}

function getTraversal(root, type) {
  const result = [];
  function inorder(n) { if (!n) return; inorder(n.left); result.push(n.val); inorder(n.right); }
  function preorder(n) { if (!n) return; result.push(n.val); preorder(n.left); preorder(n.right); }
  function postorder(n) { if (!n) return; postorder(n.left); postorder(n.right); result.push(n.val); }
  function levelorder(n) {
    if (!n) return; const q = [n];
    while (q.length) { const node = q.shift(); result.push(node.val); if (node.left) q.push(node.left); if (node.right) q.push(node.right); }
  }
  if (type === "inorder") inorder(root);
  else if (type === "preorder") preorder(root);
  else if (type === "postorder") postorder(root);
  else levelorder(root);
  return result;
}

function TreeNode({ node, activeSet, depth = 0, x = 50, spread = 25 }) {
  if (!node) return null;
  const lx = x - spread / (depth + 1);
  const rx = x + spread / (depth + 1);
  const active = activeSet.has(node.val);
  return (
    <g>
      {node.left && <line x1={`${x}%`} y1={depth * 70 + 30} x2={`${lx}%`} y2={(depth + 1) * 70 + 30} stroke="var(--border2)" strokeWidth={1.5} />}
      {node.right && <line x1={`${x}%`} y1={depth * 70 + 30} x2={`${rx}%`} y2={(depth + 1) * 70 + 30} stroke="var(--border2)" strokeWidth={1.5} />}
      <circle cx={`${x}%`} cy={depth * 70 + 30} r={20}
        fill={active ? "var(--cyan)" : "var(--surface2)"} stroke={active ? "var(--cyan)" : "var(--border2)"} strokeWidth={2}
        style={{ transition: "fill 0.3s" }} />
      <text x={`${x}%`} y={depth * 70 + 35} textAnchor="middle" fontSize={12} fontWeight="bold"
        fill={active ? "#000" : "var(--text)"} style={{ transition: "fill 0.3s" }}>{node.val}</text>
      {node.left && <TreeNode node={node.left} activeSet={activeSet} depth={depth + 1} x={lx} spread={spread} />}
      {node.right && <TreeNode node={node.right} activeSet={activeSet} depth={depth + 1} x={rx} spread={spread} />}
    </g>
  );
}

const TREE_ALGOS = {
  "inorder": { name: "Inorder Traversal" },
  "preorder": { name: "Preorder Traversal" },
  "postorder": { name: "Postorder Traversal" },
  "level-order": { name: "Level Order Traversal" }
};

export default function TreePage() {
  const { algo } = useParams();
  const currentAlgo = TREE_ALGOS[algo] ? algo : "inorder";
  const explanation = TREE_EXPLANATIONS[currentAlgo] || TREE_EXPLANATIONS["inorder"];

  const [tree, setTree] = useState(() => randTree(3));
  const [activeSet, setActiveSet] = useState(new Set());
  const [visited, setVisited] = useState([]);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [stepLog, setStepLog] = useState([]);

  // Refs for tracking, cancellation and state persistence
  const runIdRef = useRef(0);
  const runningRef = useRef(false);
  const speedRef = useRef(speed);
  const mountedRef = useRef(true);
  const savedStatesRef = useRef({});
  const previousAlgoRef = useRef(currentAlgo);

  const latestStateRef = useRef({
    tree,
    activeSet,
    visited,
    stepLog,
  });

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    latestStateRef.current = {
      tree,
      activeSet,
      visited,
      stepLog,
    };
  }, [tree, activeSet, visited, stepLog]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      runningRef.current = false;
      runIdRef.current += 1;
    };
  }, []);

  // Handle switching algorithm state save/restore
  useEffect(() => {
    const previousAlgo = previousAlgoRef.current;
    if (previousAlgo === currentAlgo) {
      return;
    }

    // Cancel previous running execution
    runIdRef.current += 1;
    runningRef.current = false;
    setRunning(false);

    // Save previous state
    savedStatesRef.current[previousAlgo] = {
      tree: latestStateRef.current.tree,
      activeSet: new Set(latestStateRef.current.activeSet),
      visited: [...latestStateRef.current.visited],
      stepLog: [...latestStateRef.current.stepLog],
    };

    // Restore next state if exists
    const savedState = savedStatesRef.current[currentAlgo];
    if (savedState) {
      setTree(savedState.tree);
      setActiveSet(new Set(savedState.activeSet));
      setVisited([...savedState.visited]);
      setStepLog([
        ...savedState.stepLog,
        {
          text: `Returned to ${TREE_ALGOS[currentAlgo].name}. Previous state restored.`,
          type: "info",
        }
      ]);
    } else {
      // Default initial states
      const initialTree = randTree(3);
      setTree(initialTree);
      setActiveSet(new Set());
      setVisited([]);
      setStepLog([
        {
          text: `Switched to ${TREE_ALGOS[currentAlgo].name}. New tree generated.`,
          type: "info",
        }
      ]);
    }

    previousAlgoRef.current = currentAlgo;
  }, [currentAlgo]);

  const typeMap = { inorder: "inorder", preorder: "preorder", postorder: "postorder", "level-order": "level" };
  const travType = typeMap[currentAlgo] || "inorder";

  const start = useCallback(async () => {
    if (runningRef.current) return;

    const currentRunId = runIdRef.current + 1;
    runIdRef.current = currentRunId;
    runningRef.current = true;
    setRunning(true);

    setActiveSet(new Set());
    setVisited([]);
    setStepLog([
      { text: `${TREE_ALGOS[currentAlgo].name} started.`, type: "info" }
    ]);

    const order = getTraversal(tree, travType === "level" ? "levelorder" : travType);

    for (let i = 0; i < order.length; i++) {
      if (runIdRef.current !== currentRunId || !mountedRef.current) {
        if (runIdRef.current === currentRunId) {
          runningRef.current = false;
          setRunning(false);
        }
        return;
      }

      setActiveSet(new Set([order[i]]));
      setVisited(order.slice(0, i + 1));
      setStepLog(prev => [...prev, { text: `Visiting node: ${order[i]}`, type: "compare" }]);

      await new Promise(r => setTimeout(r, speedRef.current));

      if (runIdRef.current !== currentRunId || !mountedRef.current) {
        if (runIdRef.current === currentRunId) {
          runningRef.current = false;
          setRunning(false);
        }
        return;
      }
    }

    if (mountedRef.current && runIdRef.current === currentRunId) {
      setStepLog(prev => [...prev, { text: `${TREE_ALGOS[currentAlgo].name} complete: [${order.join(" → ")}]`, type: "done" }]);
      runningRef.current = false;
      setRunning(false);
    }
  }, [tree, travType, currentAlgo]);

  const stop = useCallback(() => {
    if (!runningRef.current) return;

    runIdRef.current += 1;
    runningRef.current = false;
    setRunning(false);

    setStepLog(prev => [
      ...prev,
      { text: "Stopped by the user.", type: "warning" }
    ]);
  }, []);

  const reset = useCallback(() => {
    if (runningRef.current) return;

    setTree(randTree(3));
    setActiveSet(new Set());
    setVisited([]);
    setStepLog([{ text: "Reset.", type: "info" }]);
  }, []);

  return (
    <AppShell breadcrumb={`Tree / ${explanation?.title || currentAlgo}`}>
      <div className="section-title">{explanation?.title || currentAlgo}</div>
      <div className="section-sub">Watch tree nodes light up as the traversal visits each node</div>

      <div className="controls-bar" style={{ marginBottom: 12 }}>
        <button className="btn btn-primary" onClick={start} disabled={running}>▶ Start</button>
        <button className="btn btn-danger" onClick={stop} disabled={!running}>■ Stop</button>
        <button className="btn btn-ghost" onClick={reset} disabled={running}>
          ⟳ Reset
        </button>

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
            speedRef.current = newSpeed;
          }}
        />

        <span style={{ fontSize: 12, color: "var(--muted)", minWidth: 50 }}>{speed}ms</span>
      </div>

      <div className="viz-layout-3">
        {/* LEFT — Explanation */}
        <div className="viz-left">
          <AlgoExplain explanation={explanation} />
        </div>

        {/* CENTER — Visualizer */}
        <div className="viz-center">
          <div className="card" style={{ padding: 16, minHeight: 340 }}>
            <svg width="100%" height={320}>
              <TreeNode node={tree} activeSet={activeSet} depth={0} x={50} spread={28} />
            </svg>
          </div>

          {visited.length > 0 && (
            <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 4, padding: 8 }}>
              {visited.map((v, i) => (
                <div key={i} style={{ padding: "2px 10px", borderRadius: 20, background: "rgba(6,182,212,0.15)", color: "var(--cyan)", fontSize: 12, fontWeight: 700 }}>{v}</div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — Step Log */}
        <div className="viz-right">
          <StepLog steps={stepLog} />
        </div>
      </div>
    </AppShell>
  );
}
