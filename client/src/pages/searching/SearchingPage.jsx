import { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import AppShell from "../../components/AppShell";
import AlgoExplain from "../../components/AlgoExplain";
import StepLog from "../../components/StepLog";
import { SEARCHING_EXPLANATIONS } from "../../data/algoExplanations";
import {
  linearSearchSteps, binarySearchSteps,
  jumpSearchSteps, interpolationSearchSteps, exponentialSearchSteps
} from "../../algorithms/searchingSteps";

const ALGOS = {
  "linear-search":       { name: "Linear Search",       fn: linearSearchSteps },
  "binary-search":       { name: "Binary Search",       fn: binarySearchSteps },
  "jump-search":         { name: "Jump Search",         fn: jumpSearchSteps },
  "interpolation-search":{ name: "Interpolation Search", fn: interpolationSearchSteps },
  "exponential-search":  { name: "Exponential Search",  fn: exponentialSearchSteps },
};

function randArr(n) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 90) + 5);
}

export default function SearchingPage() {
  const { algo } = useParams();
  const cfg = ALGOS[algo] || ALGOS["linear-search"];
  const explanation = SEARCHING_EXPLANATIONS[algo] || SEARCHING_EXPLANATIONS["linear-search"];

  const [array, setArray] = useState(() => randArr(14));
  const [target, setTarget] = useState(42);
  const [states, setStates] = useState({});
  const [pointer, setPointer] = useState(-1);
  const [steps, setSteps] = useState(0);
  const [foundIdx, setFoundIdx] = useState(-1);
  const [speed, setSpeed] = useState(300);
  const [running, setRunning] = useState(false);
  const [stepLog, setStepLog] = useState([]);
  const stopRef = useRef(false);

  const generate = () => {
    stopRef.current = true;
    setTimeout(() => {
      const a = randArr(14);
      setArray(a); setStates({}); setPointer(-1);
      setSteps(0); setFoundIdx(-1); setStepLog([]);
      setRunning(false); stopRef.current = false;
    }, 50);
  };

  const start = async () => {
    if (running) return;
    stopRef.current = false; setRunning(true);
    setStates({}); setFoundIdx(-1); setSteps(0); setStepLog([]);
    const frames = cfg.fn(array, target);
    for (let i = 0; i < frames.length; i++) {
      if (stopRef.current) break;
      const f = frames[i];
      setStates(f.states); setPointer(f.pointer);
      setSteps(i + 1);
      setStepLog(prev => [...prev, { text: f.log, type: f.type || "info" }]);
      if (f.found >= 0) { setFoundIdx(f.found); }
      await new Promise(r => setTimeout(r, speed));
      if (f.found >= 0) break;
    }
    setRunning(false);
  };

  const max = Math.max(...array, 1);

  return (
    <AppShell breadcrumb={`Searching / ${cfg.name}`}>
      <div className="section-title">{cfg.name}</div>
      <div className="section-sub">Cubes highlight as the algorithm scans for the target value</div>

      <div className="controls-bar" style={{ marginBottom: 12 }}>
        <button className="btn btn-ghost" onClick={generate} disabled={running}>⟳ Generate</button>
        <label>Target</label>
        <input
          type="number" value={target}
          onChange={e => setTarget(+e.target.value)}
          style={{ width: 64, background: "var(--surface2)", border: "1px solid var(--border2)", color: "var(--text)", padding: "6px 8px", borderRadius: 8, fontSize: 13 }}
        />
        <button className="btn btn-primary" onClick={start} disabled={running}>▶ Start</button>
        <button className="btn btn-danger" onClick={() => { stopRef.current = true; setRunning(false); }}>■ Stop</button>
        <label>Speed</label>
        <input type="range" className="speed-slider" min={50} max={800} step={10}
          value={speed} onChange={e => setSpeed(+e.target.value)} />
        <span style={{ fontSize: 12, color: "var(--muted)", minWidth: 45 }}>{speed}ms</span>
        <div style={{ marginLeft: "auto", fontSize: 12 }}>
          Steps: <strong style={{ color: "var(--cyan)" }}>{steps}</strong>
          {foundIdx >= 0 && <span style={{ color: "var(--green)", marginLeft: 12 }}>✓ Found at index {foundIdx}</span>}
          {!running && steps > 0 && foundIdx < 0 && <span style={{ color: "var(--red)", marginLeft: 12 }}>✗ Not found</span>}
        </div>
      </div>

      <div className="viz-layout-3">
        {/* LEFT — Explanation */}
        <div className="viz-left">
          <AlgoExplain explanation={explanation} />
        </div>

        {/* CENTER — Cubes + Pointer */}
        <div className="viz-center">
          {/* Pointer row */}
          <div style={{ display: "flex", justifyContent: "center", gap: 6, padding: "0 20px", minHeight: 16 }}>
            {array.map((_, i) => (
              <div key={i} style={{ width: 40, display: "flex", justifyContent: "center" }}>
                {pointer === i && (
                  <div style={{ width: 0, height: 0, borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderBottom: "10px solid var(--cyan)" }} />
                )}
              </div>
            ))}
          </div>

          {/* Cubes */}
          <div className="cubes-arena">
            {array.map((val, i) => {
              const state = states[i] || "default";
              const h = Math.max(18, Math.round((val / max) * 160));
              return (
                <div key={i} className="cube-wrap">
                  <div className={`cube-label state-${state}`}>{val}</div>
                  <div className={`cube state-${state}`} style={{ height: h }} />
                </div>
              );
            })}
          </div>

          {/* Target indicator */}
          <div style={{ textAlign: "center", marginTop: 8, fontSize: 13, color: "var(--muted)" }}>
            Target: <strong style={{ color: "var(--cyan)" }}>{target}</strong>
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
