import React, { useEffect, useRef, useState } from "react";
import AppShell from "../../components/AppShell";
import "./SortingPage.css";

function Icon({ children, className = "" }) {
  return <span className={`material-symbols-outlined ${className}`}>{children}</span>;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
    </AppShell>
  );
}