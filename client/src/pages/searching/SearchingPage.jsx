import { useCallback } from "react";
import { useParams } from "react-router-dom";
import AppShell from "../../components/AppShell";
import AlgoExplain from "../../components/AlgoExplain";
import StepLog from "../../components/StepLog";
import { SEARCHING_EXPLANATIONS } from "../../data/algoExplanations";
import {
  linearSearchSteps, binarySearchSteps,
  jumpSearchSteps, interpolationSearchSteps, exponentialSearchSteps
} from "../../algorithms/searchingSteps";
import { useAlgoManager } from "../../utils/algoCache";

const ALGOS = {
  "linear-search": { name: "Linear Search", fn: linearSearchSteps },
  "binary-search": { name: "Binary Search", fn: binarySearchSteps },
  "jump-search": { name: "Jump Search", fn: jumpSearchSteps },
  "interpolation-search": { name: "Interpolation Search", fn: interpolationSearchSteps },
  "exponential-search": { name: "Exponential Search", fn: exponentialSearchSteps },
};

function randArr(n) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 90) + 5);
}

export default function SearchingPage() {
  const { algo } = useParams();
  const cfg = ALGOS[algo] || ALGOS["linear-search"];
  const explanation = SEARCHING_EXPLANATIONS[algo] || SEARCHING_EXPLANATIONS["linear-search"];

  const { state, update, stop, cacheObj } = useAlgoManager("searching_" + algo, () => ({
    array: randArr(14),
    target: 42,
    states: {},
    pointer: -1,
    steps: 0,
    foundIdx: -1,
    speedMultiplier: 1,
    running: false,
    stepLog: []
  }));

  const { array, target, states, pointer, steps, foundIdx, speedMultiplier, running, stepLog } = state;

  const generate = useCallback(() => {
    stop();
    setTimeout(() => {
      const a = randArr(14);
      update({
        array: a,
        states: {},
        pointer: -1,
        steps: 0,
        foundIdx: -1,
        stepLog: [],
        running: false
      });
      if (cacheObj && cacheObj.stopRef) cacheObj.stopRef.current = false;
    }, 50);
  }, [update, stop, cacheObj]);

  const start = useCallback(async () => {
    if (!cacheObj || cacheObj.running) return;
    cacheObj.stopRef.current = false;
    update({ running: true, states: {}, foundIdx: -1, steps: 0, stepLog: [] });

    const numTarget = cacheObj.target === '' || cacheObj.target === null || isNaN(cacheObj.target) ? 0 : Number(cacheObj.target);
    if (cacheObj.target === '' || cacheObj.target === null || isNaN(cacheObj.target)) {
      update({ target: 0 });
    }
    const frames = cfg.fn(cacheObj.array, numTarget);
    for (let i = 0; i < frames.length; i++) {
      if (cacheObj.stopRef.current) break;
      const f = frames[i];
      update({
        array: f.arr,
        states: f.states,
        pointer: f.pointer,
        steps: i + 1,
        foundIdx: f.found !== undefined ? f.found : -1,
        stepLog: [...cacheObj.stepLog, { text: f.log, type: f.type || "info" }]
      });
      const delay = Math.round(300 / (cacheObj.speedMultiplier || 1));
      await new Promise(r => setTimeout(r, delay));
      if (f.found >= 0) break;
    }
    update({ running: false });
  }, [cfg, update, cacheObj]);

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
          onChange={e => update({ target: e.target.value === '' ? '' : Number(e.target.value) })}
          onBlur={() => { if (target === '' || target === null || isNaN(target)) update({ target: 0 }); }}
          disabled={running}
          style={{ width: 64, background: "var(--surface2)", border: "1px solid var(--border2)", color: "var(--text)", padding: "6px 8px", borderRadius: 8, fontSize: 13 }}
        />
        <button className="btn btn-primary" onClick={start} disabled={running}>▶ Start</button>
        <button className="btn btn-danger" onClick={stop} disabled={!running}>■ Stop</button>
        <label>Speed</label>
        <select className="size-select" value={speedMultiplier} onChange={e => update({ speedMultiplier: +e.target.value })} disabled={running}>
          <option value={0.5}>0.5x</option>
          <option value={1}>1x</option>
          <option value={2}>2x</option>
          <option value={3}>3x</option>
          <option value={4}>4x</option>
        </select>
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
          <div className="custom-h-scroll">
            <div style={{ minWidth: `${array.length * 48 + 40}px`, width: "max(100%, fit-content)", margin: "0 auto" }}>
              {/* Pointer row */}
              <div style={{ display: "flex", justifyContent: "center", gap: 6, padding: "0 20px", minHeight: 16, width: "100%" }}>
                {array.map((_, i) => (
                  <div key={i} style={{ width: 40, display: "flex", justifyContent: "center" }}>
                    {pointer === i && (
                      <div style={{ width: 0, height: 0, borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderBottom: "10px solid var(--active-bg)" }} />
                    )}
                  </div>
                ))}
              </div>

              {/* Cubes */}
              <div className="cubes-arena">
                {array.map((val, i) => {
                  let state = states[i] || "default";
                  if (foundIdx === i) state = "found";
                  else if (!running && steps > 0 && foundIdx < 0) state = "notfound";
                  const h = Math.max(18, Math.round((val / max) * 160));
                  return (
                    <div key={i} className="cube-wrap">
                      <div className={`cube-label state-${state}`}>{val}</div>
                      <div className={`cube state-${state}`} style={{ height: h }} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Target indicator */}
          <div style={{ textAlign: "center", marginTop: 8, fontSize: 13, color: "var(--muted)" }}>
            Target: <strong style={{ color: "var(--active-bg)" }}>{target}</strong>
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
