import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import AppShell from "../../components/AppShell";
import AlgoExplain from "../../components/AlgoExplain";
import StepLog from "../../components/StepLog";
import { ML_EXPLANATIONS } from "../../data/algoExplanations";

/* K-Means Clustering */
const COLORS = ["#06b6d4", "#8b5cf6", "#10b981", "#f97316", "#ef4444"];

function randPoints(n) {
  return Array.from({ length: n }, () => ({ x: Math.random() * 380 + 10, y: Math.random() * 240 + 10, cluster: 0 }));
}
function randCentroids(k) {
  return Array.from({ length: k }, (_, i) => ({ x: Math.random() * 380 + 10, y: Math.random() * 240 + 10, id: i }));
}
function dist(a, b) { return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2); }

/* Linear Regression */
function linRegSteps(points) {
  const n = points.length;
  const frames = [];
  let m = 0, b = 50;
  const lr = 0.0001;
  for (let iter = 0; iter < 40; iter++) {
    let dm = 0, db = 0;
    for (const p of points) { const pred = m * p.x + b; dm -= 2 * p.x * (p.y - pred); db -= 2 * (p.y - pred); }
    m -= lr * dm; b -= lr * db;
    const loss = points.reduce((s, p) => s + (p.y - (m * p.x + b)) ** 2, 0) / n;
    frames.push({ m, b, loss: loss.toFixed(2), iter, log: `Iter ${iter + 1}: loss=${loss.toFixed(2)}, slope=${m.toFixed(4)}`, type: "info" });
  }
  return frames;
}

/* Decision Tree Visualization */
const DT_TREE = {
  val: "X > 200?",
  left: { val: "Y > 150?", left: { val: "Class A", isLeaf: true }, right: { val: "Class B", isLeaf: true } },
  right: { val: "X > 300?", left: { val: "Class C", isLeaf: true }, right: { val: "Class A", isLeaf: true } }
};

function DtNode({ node, activeSet, depth = 0, x = 50, spread = 25 }) {
  if (!node) return null;
  const lx = x - spread / (depth + 1);
  const rx = x + spread / (depth + 1);
  const active = activeSet.has(node.val);

  return (
    <g>
      {node.left && <line x1={`${x}%`} y1={depth * 70 + 20} x2={`${lx}%`} y2={(depth + 1) * 70 + 20} stroke="var(--border2)" strokeWidth={1.5} />}
      {node.right && <line x1={`${x}%`} y1={depth * 70 + 20} x2={`${rx}%`} y2={(depth + 1) * 70 + 20} stroke="var(--border2)" strokeWidth={1.5} />}

      <rect x={`${x - 10}%`} y={depth * 70 + 5} width="20%" height="30" rx="4"
        fill={active ? "var(--cyan)" : node.isLeaf ? "var(--surface2)" : "var(--surface)"}
        stroke={active ? "var(--cyan)" : "var(--border2)"} strokeWidth={2}
        style={{ transition: "all 0.3s" }} />

      <text x={`${x}%`} y={depth * 70 + 25} textAnchor="middle" fontSize={11} fontWeight="bold"
        fill={active ? "#000" : "var(--text)"} style={{ transition: "fill 0.3s" }}>{node.val}</text>

      {node.left && <DtNode node={node.left} activeSet={activeSet} depth={depth + 1} x={lx} spread={spread} />}
      {node.right && <DtNode node={node.right} activeSet={activeSet} depth={depth + 1} x={rx} spread={spread} />}
    </g>
  );
}

const ALGO_NAMES = {
  "k-means": "K-Means Clustering",
  "linear-regression": "Linear Regression",
  "knn": "K-Nearest Neighbors",
  "decision-tree": "Decision Tree",
};

export default function MLPage() {
  const { algo } = useParams();
  const currentAlgo = algo || "linear-regression";
  const explanation = ML_EXPLANATIONS[currentAlgo] || ML_EXPLANATIONS["linear-regression"];

  const isKMeans = currentAlgo === "k-means";
  const isLinReg = currentAlgo === "linear-regression";
  const isKnn = currentAlgo === "knn";
  const isDt = currentAlgo === "decision-tree";

  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(200);
  const [stepLog, setStepLog] = useState([]);

  const runIdRef = useRef(0);
  const runningRef = useRef(false);
  const mountedRef = useRef(true);
  const speedRef = useRef(speed);

  // Stores the state of every ML algorithm.
  const savedStatesRef = useRef({});

  // Remembers the previously selected algorithm.
  const previousAlgoRef = useRef(currentAlgo);

  // K-Means state
  const K = 3;
  const [points, setPoints] = useState(() => randPoints(40));
  const [centroids, setCentroids] = useState(() => randCentroids(K));
  const [iter, setIter] = useState(0);

  // Linear Regression state
  const [regPoints] = useState(() => Array.from({ length: 20 }, () => ({ x: Math.random() * 350 + 10, y: Math.random() * 200 + 20 })));
  const [line, setLine] = useState({ m: 0, b: 50 });
  const [loss, setLoss] = useState("--");

  // KNN state
  const [knnPoints, setKnnPoints] = useState(() => Array.from({ length: 30 }, () => ({
    x: Math.random() * 350 + 20, y: Math.random() * 220 + 20, cluster: Math.floor(Math.random() * 3)
  })));
  const [testPoint, setTestPoint] = useState({ x: 200, y: 120 });
  const [kNeighbors, setKNeighbors] = useState([]);
  const knnK = 5;

  // Decision Tree state
  const [dtActiveSet, setDtActiveSet] = useState(new Set());

  // Stores the latest visible state for caching on algo switch.
  const latestStateRef = useRef({
    points, centroids, iter,
    line, loss,
    knnPoints, testPoint, kNeighbors,
    dtActiveSet,
    stepLog, speed,
  });

  useEffect(() => {
    latestStateRef.current = {
      points, centroids, iter,
      line, loss,
      knnPoints, testPoint, kNeighbors,
      dtActiveSet,
      stepLog, speed,
    };
  }, [points, centroids, iter, line, loss, knnPoints, testPoint, kNeighbors, dtActiveSet, stepLog, speed]);

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
   * Handles switching between ML algorithms.
   * 1. Stops the previous algorithm.
   * 2. Saves its current visualization state.
   * 3. Restores the selected algorithm previous state.
   */
  useEffect(() => {
    const previousAlgo = previousAlgoRef.current;
    if (previousAlgo === currentAlgo) return;

    // Cancel the old algorithm execution.
    runIdRef.current += 1;
    runningRef.current = false;
    setRunning(false);

    // Save the previous algorithm state.
    savedStatesRef.current[previousAlgo] = {
      points: latestStateRef.current.points.map(p => ({ ...p })),
      centroids: latestStateRef.current.centroids.map(c => ({ ...c })),
      iter: latestStateRef.current.iter,
      line: { ...latestStateRef.current.line },
      loss: latestStateRef.current.loss,
      knnPoints: latestStateRef.current.knnPoints.map(p => ({ ...p })),
      testPoint: { ...latestStateRef.current.testPoint },
      kNeighbors: [...latestStateRef.current.kNeighbors],
      dtActiveSet: new Set(latestStateRef.current.dtActiveSet),
      stepLog: [...latestStateRef.current.stepLog],
      speed: latestStateRef.current.speed,
    };

    const savedState = savedStatesRef.current[currentAlgo];

    if (savedState) {
      setPoints(savedState.points);
      setCentroids(savedState.centroids);
      setIter(savedState.iter);
      setLine(savedState.line);
      setLoss(savedState.loss);
      setKnnPoints(savedState.knnPoints);
      setTestPoint(savedState.testPoint);
      setKNeighbors(savedState.kNeighbors);
      setDtActiveSet(savedState.dtActiveSet);
      setSpeed(savedState.speed);
      speedRef.current = savedState.speed;
      setStepLog([
        ...savedState.stepLog,
        { text: `Returned to ${ALGO_NAMES[currentAlgo] || currentAlgo}. Previous state restored.`, type: "info" },
      ]);
    } else {
      setStepLog([
        { text: `Switched to ${ALGO_NAMES[currentAlgo] || currentAlgo}. New visualization created.`, type: "info" },
      ]);
    }

    previousAlgoRef.current = currentAlgo;
  }, [currentAlgo]);

  const startKMeans = async (currentRunId) => {
    let pts = [...points.map(p => ({ ...p }))];
    let cents = centroids.map(c => ({ ...c }));
    setStepLog([{ text: "Randomly initialized K centroids.", type: "info" }]);

    for (let it = 0; it < 10; it++) {
      if (runIdRef.current !== currentRunId || !mountedRef.current) return;

      // Assign points to nearest centroid
      pts = pts.map(p => ({ ...p, cluster: cents.reduce((bi, c, i) => dist(p, c) < dist(p, cents[bi]) ? i : bi, 0) }));
      setPoints(pts.map(p => ({ ...p }))); setIter(it + 1);
      setStepLog(prev => [...prev, { text: `Iteration ${it + 1}: Assigned all points to nearest centroid`, type: "compare" }]);

      await new Promise(resolve => setTimeout(resolve, speedRef.current * 2));
      if (runIdRef.current !== currentRunId || !mountedRef.current) return;

      // Move centroids to cluster means
      cents = cents.map((c, ci) => {
        const cluster = pts.filter(p => p.cluster === ci);
        if (!cluster.length) return c;
        return { ...c, x: cluster.reduce((s, p) => s + p.x, 0) / cluster.length, y: cluster.reduce((s, p) => s + p.y, 0) / cluster.length };
      });
      setCentroids(cents.map(c => ({ ...c })));
      setStepLog(prev => [...prev, { text: `Iteration ${it + 1}: Moved centroids to cluster means`, type: "swap" }]);

      await new Promise(resolve => setTimeout(resolve, speedRef.current * 2));
      if (runIdRef.current !== currentRunId || !mountedRef.current) return;
    }

    if (mountedRef.current && runIdRef.current === currentRunId) {
      setStepLog(prev => [...prev, { text: "K-Means converged!", type: "done" }]);
      runningRef.current = false;
      setRunning(false);
    }
  };

  const startLinReg = async (currentRunId) => {
    const frames = linRegSteps(regPoints);
    setLine({ m: 0, b: 50 }); setLoss("--");
    setStepLog([{ text: "Linear Regression started.", type: "info" }]);

    for (const f of frames) {
      if (runIdRef.current !== currentRunId || !mountedRef.current) return;
      setLine({ m: f.m, b: f.b }); setLoss(f.loss);
      setStepLog(prev => [...prev, { text: f.log, type: f.type }]);
      await new Promise(resolve => setTimeout(resolve, speedRef.current));
    }

    if (mountedRef.current && runIdRef.current === currentRunId) {
      setStepLog(prev => [...prev, { text: "Linear Regression converged!", type: "done" }]);
      runningRef.current = false;
      setRunning(false);
    }
  };

  const startKnn = async (currentRunId) => {
    setKNeighbors([]);
    setStepLog([{ text: `Testing point at (${Math.round(testPoint.x)}, ${Math.round(testPoint.y)})`, type: "info" }]);

    await new Promise(resolve => setTimeout(resolve, speedRef.current));
    if (runIdRef.current !== currentRunId || !mountedRef.current) return;

    setStepLog(prev => [...prev, { text: "Calculating distances to all training points...", type: "info" }]);
    await new Promise(resolve => setTimeout(resolve, speedRef.current * 2));
    if (runIdRef.current !== currentRunId || !mountedRef.current) return;

    const distances = knnPoints.map((p, i) => ({ ...p, d: dist(p, testPoint), idx: i }));
    distances.sort((a, b) => a.d - b.d);
    const nearest = distances.slice(0, knnK);
    setKNeighbors(nearest.map(n => n.idx));
    setStepLog(prev => [...prev, { text: `Found ${knnK} nearest neighbors.`, type: "compare" }]);

    const votes = {};
    nearest.forEach(n => { votes[n.cluster] = (votes[n.cluster] || 0) + 1; });
    const winner = Object.keys(votes).reduce((a, b) => votes[a] > votes[b] ? a : b);

    await new Promise(resolve => setTimeout(resolve, speedRef.current * 2));
    if (runIdRef.current !== currentRunId || !mountedRef.current) return;

    if (mountedRef.current && runIdRef.current === currentRunId) {
      setStepLog(prev => [...prev, { text: `Majority vote wins! Assigned to Class ${winner}`, type: "done" }]);
      runningRef.current = false;
      setRunning(false);
    }
  };

  const startDt = async (currentRunId) => {
    setDtActiveSet(new Set());
    setStepLog([{ text: "Decision Tree traversal started.", type: "info" }]);

    const path = ["X > 200?", "Y > 150?", "Class A"];

    for (let i = 0; i < path.length; i++) {
      if (runIdRef.current !== currentRunId || !mountedRef.current) return;
      setDtActiveSet(new Set([path[i]]));
      setStepLog(prev => [...prev, { text: `Evaluating node: ${path[i]}`, type: i === path.length - 1 ? "done" : "compare" }]);
      await new Promise(resolve => setTimeout(resolve, speedRef.current * 3));
    }

    if (mountedRef.current && runIdRef.current === currentRunId) {
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

    if (isKMeans) startKMeans(currentRunId);
    else if (isLinReg) startLinReg(currentRunId);
    else if (isKnn) startKnn(currentRunId);
    else if (isDt) startDt(currentRunId);
    else startLinReg(currentRunId);
  };

  const stop = () => {
    if (!runningRef.current) return;
    runIdRef.current += 1;
    runningRef.current = false;
    setRunning(false);
    setStepLog(prev => [...prev, { text: `${ALGO_NAMES[currentAlgo] || currentAlgo} stopped by user.`, type: "warning" }]);
  };

  return (
    <AppShell breadcrumb={`ML / ${explanation?.title || currentAlgo}`}>
      <div className="section-title">{explanation?.title || currentAlgo}</div>
      <div className="section-sub">
        {isKMeans ? "Watch centroids move until clusters converge" :
          isLinReg ? "Watch the regression line fit the data iteratively" :
            isKnn ? "Watch finding the nearest neighbors to a test point" :
              "Watch a decision tree traverse a path to classify a sample"}
      </div>

      <div className="controls-bar" style={{ marginBottom: 12 }}>
        {isKMeans && <button className="btn btn-ghost" onClick={() => {
          if (runningRef.current) { window.alert("Stop the algorithm before randomizing."); return; }
          runIdRef.current += 1;
          setPoints(randPoints(40)); setCentroids(randCentroids(K)); setIter(0);
          setStepLog([{ text: "Reset.", type: "info" }]);
        }} disabled={running}>Randomize</button>}
        {isKnn && <button className="btn btn-ghost" onClick={() => {
          if (runningRef.current) { window.alert("Stop the algorithm before moving the test point."); return; }
          runIdRef.current += 1;
          setTestPoint({ x: Math.random() * 300 + 50, y: Math.random() * 150 + 50 });
          setKNeighbors([]); setStepLog([{ text: "Test point moved.", type: "info" }]);
        }} disabled={running}>Move Test Point</button>}
        <button className="btn btn-primary" onClick={handleStart} disabled={running}>Start</button>
        <button className="btn btn-danger" onClick={stop} disabled={!running}>Stop</button>
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
        <span style={{ fontSize: 12, color: "var(--muted)", minWidth: 45 }}>{speed}ms</span>
      </div>

      <div className="viz-layout-3">
        {/* LEFT -- Explanation */}
        <div className="viz-left">
          <AlgoExplain explanation={explanation} />
        </div>

        {/* CENTER -- Visualizer */}
        <div className="viz-center">
          <div className="card" style={{ minHeight: 350, display: "flex", flexDirection: "column" }}>
            <svg width="100%" height={isDt ? 280 : 300} style={{ display: "block", marginTop: isDt ? 20 : 0 }}>
              {/* K-Means */}
              {isKMeans && (<>
                {points.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r={5} fill={COLORS[p.cluster % COLORS.length]} opacity={0.7}
                    style={{ transition: "cx 0.4s,cy 0.4s,fill 0.4s" }} />
                ))}
                {centroids.map((c, i) => (
                  <g key={i}>
                    <circle cx={c.x} cy={c.y} r={10} fill="none" stroke={COLORS[i % COLORS.length]} strokeWidth={2.5}
                      style={{ transition: "cx 0.4s,cy 0.4s" }} />
                    <circle cx={c.x} cy={c.y} r={4} fill={COLORS[i % COLORS.length]}
                      style={{ transition: "cx 0.4s,cy 0.4s" }} />
                  </g>
                ))}
              </>)}

              {/* Linear Regression */}
              {isLinReg && (<>
                {regPoints.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r={4} fill="var(--cyan)" opacity={0.7} />
                ))}
                <line x1={0} y1={line.b} x2={400} y2={line.m * 400 + line.b}
                  stroke="var(--orange)" strokeWidth={2}
                  style={{ transition: "all 0.2s" }} />
              </>)}

              {/* KNN */}
              {isKnn && (<>
                {knnPoints.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r={6}
                    fill={COLORS[p.cluster % COLORS.length]} opacity={kNeighbors.includes(i) ? 1 : 0.4}
                    stroke={kNeighbors.includes(i) ? "#fff" : "none"} strokeWidth={1} />
                ))}
                {kNeighbors.map((nIdx, i) => (
                  <line key={`line-${i}`} x1={testPoint.x} y1={testPoint.y} x2={knnPoints[nIdx].x} y2={knnPoints[nIdx].y}
                    stroke="var(--text)" strokeWidth={1} strokeDasharray="4" opacity={0.5} />
                ))}
                <circle cx={testPoint.x} cy={testPoint.y} r={8} fill="var(--text)" stroke="#000" strokeWidth={2} />
                <text x={testPoint.x + 12} y={testPoint.y - 12} fill="var(--text)" fontSize={12} fontWeight="bold">Test</text>
              </>)}

              {/* Decision Tree */}
              {isDt && (
                <DtNode node={DT_TREE} activeSet={dtActiveSet} depth={0} x={50} spread={28} />
              )}
            </svg>

            <div style={{ padding: "0 16px 16px 16px", display: "flex", justifyContent: "center" }}>
              {isKMeans && <div style={{ fontSize: 12, color: "var(--muted)" }}>Iteration: <strong style={{ color: "var(--cyan)" }}>{iter}</strong> &middot; K={K} clusters</div>}
              {isLinReg && <div style={{ fontSize: 12, color: "var(--muted)" }}>Loss: <strong style={{ color: "var(--orange)" }}>{loss}</strong></div>}
              {isKnn && <div style={{ fontSize: 12, color: "var(--muted)" }}>K: <strong style={{ color: "var(--cyan)" }}>{knnK}</strong> nearest neighbors</div>}
            </div>
          </div>
        </div>

        {/* RIGHT -- Step Log */}
        <div className="viz-right">
          <StepLog steps={stepLog} />
        </div>
      </div>
    </AppShell>
  );
}
