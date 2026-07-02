<<<<<<< HEAD
import React, { useEffect, useRef, useState } from "react";
import AppShell from "../../components/AppShell";
import "./SortingPage.css";

function Icon({ children, className = "" }) {
  return <span className={`material-symbols-outlined ${className}`}>{children}</span>;
=======
import { useCallback } from "react";
import { useParams } from "react-router-dom";
import AppShell from "../../components/AppShell";
import CubeVisualizer from "../../components/CubeVisualizer";
import AlgoExplain from "../../components/AlgoExplain";
import StepLog from "../../components/StepLog";
import MultiLangCode from "../../components/MultiLangCode";
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
>>>>>>> 1948f82f0a7c1ab5f237809752dd77b6b88e50f4
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

<<<<<<< HEAD
export default function SortingPage() {
  const [array, setArray] = useState([]);
  const [size, setSize] = useState(24);
  const [speed, setSpeed] = useState(100);
  const [speedLabel, setSpeedLabel] = useState("2.0x");
  const [swaps, setSwaps] = useState(0);
  const [steps, setSteps] = useState(0);
  const [active, setActive] = useState([]);
  const [compare, setCompare] = useState([]);
  const [sorted, setSorted] = useState([]);
  const [logs, setLogs] = useState([]);
  const [sizeOpen, setSizeOpen] = useState(false);
  const [speedOpen, setSpeedOpen] = useState(false);

  const sortingRef = useRef(false);
  const stopRef = useRef(false);

  const addLog = (msg, type = "info") => {
    const time = new Date().toLocaleTimeString([], {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    setLogs((prev) => [{ time, msg, type }, ...prev].slice(0, 50));
  };

  const resetStats = () => {
    setSwaps(0);
    setSteps(0);
    setActive([]);
    setCompare([]);
    setSorted([]);
  };

  const generateArray = (newSize = size) => {
    if (sortingRef.current) return;

    const next = Array.from(
      { length: newSize },
      () => Math.floor(Math.random() * 85) + 10
    );

    setArray(next);
    resetStats();
    addLog(`New array of size ${newSize} generated.`);
  };

  useEffect(() => {
    generateArray(24);
  }, []);

  const startBubbleSort = async () => {
    if (sortingRef.current) return;

    sortingRef.current = true;
    stopRef.current = false;
    resetStats();

    let arr = [...array];
    let localSwaps = 0;
    let localSteps = 0;
    let localSorted = [];

    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr.length - i - 1; j++) {
        if (stopRef.current) {
          sortingRef.current = false;
          setActive([]);
          setCompare([]);
          return;
        }

        localSteps += 1;
        setSteps(localSteps);
        setCompare([j, j + 1]);
        setActive([]);
        addLog(`Comparing indices ${j} & ${j + 1} (${arr[j]} vs ${arr[j + 1]})`);

        await sleep(speed);

        if (arr[j] > arr[j + 1]) {
          localSwaps += 1;
          setSwaps(localSwaps);

          const beforeLeft = arr[j];
          const beforeRight = arr[j + 1];

          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          setArray([...arr]);
          setCompare([]);
          setActive([j, j + 1]);
          addLog(`SWAP: ${beforeLeft} > ${beforeRight}`, "swap");

          await sleep(speed);
        }
      }

      localSorted = [...localSorted, arr.length - i - 1];
      setSorted(localSorted);
    }

    sortingRef.current = false;
    setActive([]);
    setCompare([]);
    setSorted(Array.from({ length: arr.length }, (_, i) => i));
    addLog("Algorithm completed. All elements sorted.");
  };

  const stopSorting = () => {
    stopRef.current = true;
    addLog("Execution interrupted by user.");
  };

  const handleSize = (value) => {
    setSize(value);
    setSizeOpen(false);
    generateArray(value);
  };

  const handleSpeed = (value, label) => {
    setSpeed(value);
    setSpeedLabel(label);
    setSpeedOpen(false);
  };

  return (
    <AppShell breadcrumb="Bubble Sort">
      <div className="bs-page">
        <div className="bs-title-row">
          <div>
            <h1>Bubble Sort</h1>
            <p>Sinking Sort • Comparison Algorithm</p>
          </div>
        </div>

        <div className="bs-info-grid">
          <div className="bs-left-info">
            <div className="bs-panel">
              <h2>Bubble Sort Algorithm</h2>
              <h3>
                <Icon>info</Icon> Definition
              </h3>
              <p>
                Bubble Sort is a simple comparison-based algorithm that repeatedly
                steps through the list, compares adjacent elements and swaps them
                if they are in the wrong order.
              </p>
=======
  const { state, update, stop, cacheObj } = useAlgoManager("sorting_" + algo, () => ({
    size: 12,
    array: randArr(12),
    states: {},
    steps: 0,
    swaps: 0,
    speedMultiplier: 1,
    running: false,
    done: false,
    stepLog: [],
    frames: null,
    frameIdx: -1
  }));

  const { size, array, states, steps, swaps, speedMultiplier, running, done, stepLog, frames, frameIdx } = state;

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
        stepLog: [],
        frames: null,
        frameIdx: -1
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
        stepLog: [],
        frames: null,
        frameIdx: -1
      });
      if (cacheObj && cacheObj.stopRef) cacheObj.stopRef.current = false;
    }, 50);
  };

  const start = useCallback(async () => {
    if (!cacheObj || cacheObj.running) return;
    cacheObj.stopRef.current = false;
    const computedFrames = cfg.fn(cacheObj.array);
    update({ running: true, done: false, steps: 0, swaps: 0, stepLog: [], frames: computedFrames, frameIdx: 0 });

    for (let i = 0; i < computedFrames.length; i++) {
      if (cacheObj.stopRef.current) break;
      const f = computedFrames[i];
      update({
        array: f.arr,
        states: f.states,
        steps: i + 1,
        swaps: f.swaps,
        frameIdx: i,
        stepLog: [...cacheObj.stepLog, { text: f.log, type: f.type || "info" }]
      });
      const delay = Math.round(300 / (cacheObj.speedMultiplier || 1));
      await new Promise(r => setTimeout(r, delay));
    }
    if (!cacheObj.stopRef.current) {
      const finalStates = {};
      cacheObj.array.forEach((_, idx) => { finalStates[idx] = "done"; });
      update({ done: true, running: false, states: finalStates, frameIdx: computedFrames.length - 1 });
    } else {
      update({ running: false });
    }
  }, [cfg, update, cacheObj]);

  const handlePrev = () => {
    if (running || !frames || frames.length === 0 || frameIdx <= 0) return;
    const nextIdx = frameIdx - 1;
    const f = frames[nextIdx];
    update({
      array: f.arr,
      states: f.states,
      steps: nextIdx + 1,
      swaps: f.swaps,
      frameIdx: nextIdx,
      done: false,
      stepLog: frames.slice(0, nextIdx + 1).map(frame => ({ text: frame.log, type: frame.type || "info" }))
    });
  };

  const handleNext = () => {
    if (running || !frames || frames.length === 0 || frameIdx >= frames.length - 1) return;
    const nextIdx = frameIdx + 1;
    const f = frames[nextIdx];
    const isDone = nextIdx === frames.length - 1;
    update({
      array: f.arr,
      states: isDone ? array.reduce((acc, _, i) => ({ ...acc, [i]: "done" }), {}) : f.states,
      steps: nextIdx + 1,
      swaps: f.swaps,
      frameIdx: nextIdx,
      done: isDone,
      stepLog: frames.slice(0, nextIdx + 1).map(frame => ({ text: frame.log, type: frame.type || "info" }))
    });
  };

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
        <button className="btn btn-ghost" onClick={handlePrev} disabled={running || !frames || frames.length === 0 || frameIdx <= 0} style={{ opacity: (running || !frames || frames.length === 0 || frameIdx <= 0) ? 0.4 : 1 }}>◀ Prev Step</button>
        <button className="btn btn-ghost" onClick={handleNext} disabled={running || !frames || frames.length === 0 || frameIdx >= frames.length - 1} style={{ opacity: (running || !frames || frames.length === 0 || frameIdx >= frames.length - 1) ? 0.4 : 1 }}>Next Step ▶</button>
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
          <AlgoExplain explanation={explanation} stepLog={stepLog} />
        </div>

        {/* CENTER — Cube Visualizer */}
        <div className="viz-center">
          <CubeVisualizer array={array} states={finalStatesMap} />
          {done && (
            <div style={{ textAlign: "center", color: "var(--green)", fontWeight: 700, fontSize: 13, padding: "8px 0" }}>
              ✓ Sorted in {steps} steps · {swaps} swaps
>>>>>>> 1948f82f0a7c1ab5f237809752dd77b6b88e50f4
            </div>

            <div className="bs-panel">
              <h3>
                <Icon>analytics</Icon> Complexity Analysis
              </h3>

              <div className="bs-complexity-grid">
                <div><span>BEST CASE</span><strong>O(n)</strong></div>
                <div><span>AVERAGE</span><strong>O(n²)</strong></div>
                <div><span>WORST CASE</span><strong>O(n²)</strong></div>
                <div><span>SPACE</span><strong>O(1)</strong></div>
              </div>

              <div className="bs-tags-row">
                <span><Icon>check_circle</Icon> STABLE</span>
                <span><Icon>check_circle</Icon> IN-PLACE</span>
              </div>
            </div>
          </div>

          <div className="bs-panel bs-code-panel">
            <div className="bs-code-head">
              <h3><Icon>code</Icon> Pseudo Code</h3>
              <span>JAVASCRIPT</span>
            </div>

            <pre>{`function bubbleSort(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}`}</pre>
          </div>
        </div>

        <div className="bs-controls">
          <div className="bs-control-left">
            <button className="bs-outline-btn" onClick={() => generateArray()}>
              Generate
            </button>

            <button className="bs-primary-btn" onClick={startBubbleSort}>
              <Icon>play_arrow</Icon> Start
            </button>

            <button className="bs-muted-btn" onClick={stopSorting}>
              <Icon>stop</Icon> Stop
            </button>
          </div>

          <div className="bs-control-right">
            <div className="bs-dropdown">
              <button onClick={() => { setSizeOpen(!sizeOpen); setSpeedOpen(false); }}>
                <span>SIZE:</span>
                <strong>{size}</strong>
                <Icon>expand_more</Icon>
              </button>

              {sizeOpen && (
                <div className="bs-dropdown-menu">
                  {[8, 12, 16, 20, 24].map((n) => (
                    <button key={n} onClick={() => handleSize(n)}>{n}</button>
                  ))}
                </div>
              )}
            </div>

            <div className="bs-dropdown">
              <button onClick={() => { setSpeedOpen(!speedOpen); setSizeOpen(false); }}>
                <span>SPEED:</span>
                <strong>{speedLabel}</strong>
                <Icon>expand_more</Icon>
              </button>

              {speedOpen && (
                <div className="bs-dropdown-menu">
                  <button onClick={() => handleSpeed(1000, "0.5x")}>0.5x</button>
                  <button onClick={() => handleSpeed(500, "1.0x")}>1.0x</button>
                  <button onClick={() => handleSpeed(250, "1.5x")}>1.5x</button>
                  <button onClick={() => handleSpeed(100, "2.0x")}>2.0x</button>
                </div>
              )}
            </div>

            <div className="bs-stats">
              <div>
                <span>SWAPS</span>
                <strong>{swaps}</strong>
              </div>
              <div>
                <span>STEPS</span>
                <strong>{steps}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="bs-visual-wrap">
          <div className="bs-bars">
            <div className="bs-dot-bg" />

            {array.map((value, index) => {
              let className = "bs-bar";

              if (active.includes(index)) className += " bs-bar-active";
              else if (compare.includes(index)) className += " bs-bar-compare";
              else if (sorted.includes(index)) className += " bs-bar-sorted";

              return (
                <div
                  className={className}
                  key={`${value}-${index}`}
                  style={{ height: `${value}%` }}
                >
                  <span>{value}</span>
                </div>
              );
            })}
          </div>

          <div className="bs-log-panel">
            <h3><Icon>terminal</Icon> Live Execution Trace</h3>

            <div className="bs-log-list">
              {logs.map((log, index) => (
                <div
                  className={`bs-log-item ${log.type === "swap" ? "bs-log-swap" : ""}`}
                  key={index}
                >
                  <span>{log.time}</span>
                  <strong>{log.msg}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <MultiLangCode algoKey={algo} />
    </AppShell>
  );
}