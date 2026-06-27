import { useCallback } from "react";
import { useParams } from "react-router-dom";
import AppShell from "../../components/AppShell";
import CubeVisualizer from "../../components/CubeVisualizer";
import AlgoExplain from "../../components/AlgoExplain";
import StepLog from "../../components/StepLog";
import { SORTING_EXPLANATIONS } from "../../data/algoExplanations";
import {
  bubbleSortSteps, selectionSortSteps, insertionSortSteps,
  mergeSortSteps, quickSortSteps, heapSortSteps,
  countingSortSteps, radixSortSteps, shellSortSteps, bucketSortSteps
} from "../../algorithms/sortingSteps";
import { useAlgoManager } from "../../utils/algoCache";

const ALGOS = {
  "bubble-sort": { name: "Bubble Sort", fn: bubbleSortSteps },
  "selection-sort": { name: "Selection Sort", fn: selectionSortSteps },
  "insertion-sort": { name: "Insertion Sort", fn: insertionSortSteps },
  "merge-sort": { name: "Merge Sort", fn: mergeSortSteps },
  "quick-sort": { name: "Quick Sort", fn: quickSortSteps },
  "heap-sort": { name: "Heap Sort", fn: heapSortSteps },
  "counting-sort": { name: "Counting Sort", fn: countingSortSteps },
  "radix-sort": { name: "Radix Sort", fn: radixSortSteps },
  "shell-sort": { name: "Shell Sort", fn: shellSortSteps },
  "bucket-sort": { name: "Bucket Sort", fn: bucketSortSteps },
};

function randArr(size) {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
}

export default function SortingPage() {
  const { algo } = useParams();
  const cfg = ALGOS[algo] || ALGOS["bubble-sort"];
  const explanation = SORTING_EXPLANATIONS[algo] || SORTING_EXPLANATIONS["bubble-sort"];

  const { state, update, stop, cacheObj } = useAlgoManager("sorting_" + algo, () => ({
    size: 12,
    array: randArr(12),
    states: {},
    steps: 0,
    swaps: 0,
    speedMultiplier: 1,
    running: false,
    done: false,
    stepLog: []
  }));

  const { size, array, states, steps, swaps, speedMultiplier, running, done, stepLog } = state;

  const generate = useCallback(() => {
    stop();
    setTimeout(() => {
      const newArray = randArr(size);
      update({
        array: newArray,
        states: {},
        steps: 0,
        swaps: 0,
        done: false,
        running: false,
        stepLog: []
      });
      if (cacheObj && cacheObj.stopRef) cacheObj.stopRef.current = false;
    }, 50);
  }, [size, update, stop, cacheObj]);

  const handleSizeChange = (newSize) => {
    stop();
    setTimeout(() => {
      const newArray = randArr(newSize);
      update({
        size: newSize,
        array: newArray,
        states: {},
        steps: 0,
        swaps: 0,
        done: false,
        running: false,
        stepLog: []
      });
      if (cacheObj && cacheObj.stopRef) cacheObj.stopRef.current = false;
    }, 50);
  };

  const start = useCallback(async () => {
    if (!cacheObj || cacheObj.running) return;
    cacheObj.stopRef.current = false;
    update({ running: true, done: false, steps: 0, swaps: 0, stepLog: [] });

    const frames = cfg.fn(cacheObj.array);
    for (let i = 0; i < frames.length; i++) {
      if (cacheObj.stopRef.current) break;
      const f = frames[i];
      update({
        array: f.arr,
        states: f.states,
        steps: i + 1,
        swaps: f.swaps,
        stepLog: [...cacheObj.stepLog, { text: f.log, type: f.type || "info" }]
      });
      const delay = Math.round(300 / (cacheObj.speedMultiplier || 1));
      await new Promise(r => setTimeout(r, delay));
    }
    if (!cacheObj.stopRef.current) {
      const finalStates = {};
      cacheObj.array.forEach((_, idx) => { finalStates[idx] = "done"; });
      update({ done: true, running: false, states: finalStates });
    } else {
      update({ running: false });
    }
  }, [cfg, update, cacheObj]);

  const finalStatesMap = done ? array.reduce((acc, _, i) => ({ ...acc, [i]: "done" }), {}) : states;

  return (
    <AppShell breadcrumb={`Sorting / ${cfg.name}`}>
      <div className="section-title">{cfg.name}</div>
      <div className="section-sub">Watch cubes move in real-time as the algorithm runs</div>

      {/* Controls */}
      <div className="controls-bar" style={{ marginBottom: 12 }}>
        <button className="btn btn-ghost" onClick={generate} disabled={running}>⟳ Generate</button>
        <button className="btn btn-primary" onClick={start} disabled={running}>▶ Start</button>
        <button className="btn btn-danger" onClick={stop} disabled={!running}>■ Stop</button>
        <div style={{ width: 1, height: 20, background: "var(--border2)", margin: "0 4px" }} />
        <label>Size</label>
        <select className="size-select" value={size} onChange={e => handleSizeChange(+e.target.value)} disabled={running}>
          {[8, 12, 16, 20, 24].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <label>Speed</label>
        <select className="size-select" value={speedMultiplier} onChange={e => update({ speedMultiplier: +e.target.value })} disabled={running}>
          <option value={0.5}>0.5x</option>
          <option value={1}>1x</option>
          <option value={2}>2x</option>
          <option value={3}>3x</option>
          <option value={4}>4x</option>
        </select>

        {/* Live stats */}
        <div style={{ marginLeft: "auto", display: "flex", gap: 12, fontSize: 12 }}>
          <span>Steps: <strong style={{ color: "var(--cyan)" }}>{steps}</strong></span>
          <span>Swaps: <strong style={{ color: "var(--orange)" }}>{swaps}</strong></span>
        </div>
      </div>

      {/* 3-column layout: Explanation | Cubes | Step Log */}
      <div className="viz-layout-3">
        {/* LEFT — Algorithm Explanation */}
        <div className="viz-left">
          <AlgoExplain explanation={explanation} />
        </div>

        {/* CENTER — Cube Visualizer */}
        <div className="viz-center">
          <CubeVisualizer array={array} states={finalStatesMap} />
          {done && (
            <div style={{ textAlign: "center", color: "var(--green)", fontWeight: 700, fontSize: 13, padding: "8px 0" }}>
              ✓ Sorted in {steps} steps · {swaps} swaps
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
