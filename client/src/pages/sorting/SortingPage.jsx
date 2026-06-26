import { useState, useRef, useCallback, useEffect } from "react";
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


  const [size, setSize] = useState(12);
  const [array, setArray] = useState(() => randArr(12));
  const [states, setStates] = useState({});
  const [steps, setSteps] = useState(0);
  const [swaps, setSwaps] = useState(0);
  const [speed, setSpeed] = useState(200);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [stepLog, setStepLog] = useState([]);
  const stopRef = useRef(false);

  useEffect(() => {
    stopRef.current = true;
    setRunning(false);
    const newArray = randArr(size);

    setArray(newArray);
    setStates({});
    setSteps(0);
    setSwaps(0);
    setDone(false);
    setStepLog([]);
    return () => {
      stopRef.current = true;
    };
  }, [algo, size]);

  const generate = useCallback(() => {
    stopRef.current = true;
    setTimeout(() => {
      const a = randArr(size);
      setArray(a);
      setStates({});
      setSteps(0); setSwaps(0); setDone(false); setRunning(false);
      setStepLog([]);
      stopRef.current = false;
    }, 50);
  }, [size]);

  const start = useCallback(async () => {
    if (running) return;
    stopRef.current = false;
    setRunning(true); setDone(false); setSteps(0); setSwaps(0);
    setStepLog([]);

    const frames = cfg.fn(array);
    for (let i = 0; i < frames.length; i++) {
      if (stopRef.current) break;
      const f = frames[i];
      setArray(f.arr);
      setStates(f.states);
      setSteps(i + 1);
      setSwaps(f.swaps);
      setStepLog(prev => [...prev, { text: f.log, type: f.type || "info" }]);
      await new Promise(r => setTimeout(r, speed));
    }
    if (!stopRef.current) setDone(true);
    setRunning(false);
  }, [running, array, cfg, speed]);

  return (
    <AppShell breadcrumb={`Sorting / ${cfg.name}`}>
      <div className="section-title">{cfg.name}</div>
      <div className="section-sub">Watch cubes move in real-time as the algorithm runs</div>

      {/* Controls */}
      <div className="controls-bar" style={{ marginBottom: 12 }}>
        <button className="btn btn-ghost" onClick={generate} disabled={running}>⟳ Generate</button>
        <button className="btn btn-primary" onClick={start} disabled={running || done}>▶ Start</button>
        <button className="btn btn-danger" onClick={() => { stopRef.current = true; setRunning(false); }}>■ Stop</button>
        <div style={{ width: 1, height: 20, background: "var(--border2)", margin: "0 4px" }} />
        <label>Size</label>
        <select className="size-select" value={size} onChange={e => { setSize(+e.target.value); }}>
          {[8, 12, 16, 20, 24].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <label>Speed</label>
        <input type="range" className="speed-slider" min={30} max={800} step={10}
          value={speed} onChange={e => setSpeed(+e.target.value)} />
        <span style={{ fontSize: 12, color: "var(--muted)", minWidth: 45 }}>{speed}ms</span>

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
          <CubeVisualizer array={array} states={states} />
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
