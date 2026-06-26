import {
  useState,
  useRef,
  useCallback,
  useEffect,
} from "react";
import { useParams } from "react-router-dom";

import AppShell from "../../components/AppShell";
import CubeVisualizer from "../../components/CubeVisualizer";
import AlgoExplain from "../../components/AlgoExplain";
import StepLog from "../../components/StepLog";
import { SORTING_EXPLANATIONS } from "../../data/algoExplanations";

import {
  bubbleSortSteps,
  selectionSortSteps,
  insertionSortSteps,
  mergeSortSteps,
  quickSortSteps,
  heapSortSteps,
  countingSortSteps,
  radixSortSteps,
  shellSortSteps,
  bucketSortSteps,
} from "../../algorithms/sortingSteps";

const ALGOS = {
  "bubble-sort": {
    name: "Bubble Sort",
    fn: bubbleSortSteps,
  },
  "selection-sort": {
    name: "Selection Sort",
    fn: selectionSortSteps,
  },
  "insertion-sort": {
    name: "Insertion Sort",
    fn: insertionSortSteps,
  },
  "merge-sort": {
    name: "Merge Sort",
    fn: mergeSortSteps,
  },
  "quick-sort": {
    name: "Quick Sort",
    fn: quickSortSteps,
  },
  "heap-sort": {
    name: "Heap Sort",
    fn: heapSortSteps,
  },
  "counting-sort": {
    name: "Counting Sort",
    fn: countingSortSteps,
  },
  "radix-sort": {
    name: "Radix Sort",
    fn: radixSortSteps,
  },
  "shell-sort": {
    name: "Shell Sort",
    fn: shellSortSteps,
  },
  "bucket-sort": {
    name: "Bucket Sort",
    fn: bucketSortSteps,
  },
};

function randArr(size) {
  return Array.from(
    { length: size },
    () => Math.floor(Math.random() * 90) + 10
  );
}

export default function SortingPage() {
  const { algo } = useParams();

  const currentAlgo = ALGOS[algo] ? algo : "bubble-sort";
  const cfg = ALGOS[currentAlgo];

  const explanation =
    SORTING_EXPLANATIONS[currentAlgo] ||
    SORTING_EXPLANATIONS["bubble-sort"];

  const [size, setSize] = useState(12);
  const [array, setArray] = useState(() => randArr(12));
  const [states, setStates] = useState({});
  const [steps, setSteps] = useState(0);
  const [swaps, setSwaps] = useState(0);
  const [speed, setSpeed] = useState(200);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [stepLog, setStepLog] = useState([]);

  // Used for live speed updates.
  const speedRef = useRef(speed);

  // Every algorithm execution receives a unique run ID.
  // Changing this ID stops any previous execution.
  const runIdRef = useRef(0);

  // Stores the state of every sorting algorithm.
  const savedStatesRef = useRef({});

  // Remembers which algorithm was open previously.
  const previousAlgoRef = useRef(currentAlgo);

  // Keeps the latest visible state available while switching algorithms.
  const latestStateRef = useRef({
    size,
    array,
    states,
    steps,
    swaps,
    done,
    stepLog,
  });

  // Prevent state updates after leaving the sorting page.
  const mountedRef = useRef(true);

  useEffect(() => {
    latestStateRef.current = {
      size,
      array,
      states,
      steps,
      swaps,
      done,
      stepLog,
    };
  }, [size, array, states, steps, swaps, done, stepLog]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      runIdRef.current += 1;
    };
  }, []);

  /*
   * Handles algorithm switching.
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

    // Stop the old algorithm execution.
    runIdRef.current += 1;
    setRunning(false);

    // Save the previous algorithm's state.
    savedStatesRef.current[previousAlgo] = {
      size: latestStateRef.current.size,
      array: [...latestStateRef.current.array],
      states: { ...latestStateRef.current.states },
      steps: latestStateRef.current.steps,
      swaps: latestStateRef.current.swaps,
      done: latestStateRef.current.done,
      stepLog: [...latestStateRef.current.stepLog],
    };

    const savedState = savedStatesRef.current[currentAlgo];

    if (savedState) {
      // Restore the previous state of the selected algorithm.
      setSize(savedState.size);
      setArray([...savedState.array]);
      setStates({ ...savedState.states });
      setSteps(savedState.steps);
      setSwaps(savedState.swaps);
      setDone(savedState.done);

      setStepLog([
        ...savedState.stepLog,
        {
          text: `Returned to ${ALGOS[currentAlgo].name}. Previous state restored.`,
          type: "info",
        },
      ]);
    } else {
      // First time opening this algorithm.
      const initialSize = 12;

      setSize(initialSize);
      setArray(randArr(initialSize));
      setStates({});
      setSteps(0);
      setSwaps(0);
      setDone(false);

      setStepLog([
        {
          text: `Switched to ${ALGOS[currentAlgo].name}. New visualization created.`,
          type: "info",
        },
      ]);
    }

    previousAlgoRef.current = currentAlgo;
  }, [currentAlgo]);

  const generate = useCallback(() => {
    if (running) {
      window.alert(
        "Stop the algorithm before generating a new array."
      );
      return;
    }

    // Cancel any old unfinished execution.
    runIdRef.current += 1;

    const newArray = randArr(size);

    setArray(newArray);
    setStates({});
    setSteps(0);
    setSwaps(0);
    setDone(false);

    setStepLog([
      {
        text: `Generated a new array with ${size} elements.`,
        type: "info",
      },
    ]);
  }, [running, size]);

  const start = useCallback(async () => {
    if (running) {
      return;
    }

    // Create a unique ID for this execution.
    const currentRunId = runIdRef.current + 1;
    runIdRef.current = currentRunId;

    setRunning(true);
    setDone(false);
    setSteps(0);
    setSwaps(0);

    setStepLog([
      {
        text: `${cfg.name} started.`,
        type: "info",
      },
    ]);

    try {
      // Pass a copy so the algorithm cannot directly mutate React state.
      const frames = cfg.fn([...array]);

      for (let i = 0; i < frames.length; i += 1) {
        // Stop if another run started, the algorithm changed,
        // Stop was clicked, or the page was closed.
        if (
          runIdRef.current !== currentRunId ||
          !mountedRef.current
        ) {
          return;
        }

        const frame = frames[i];

        setArray([...frame.arr]);
        setStates(frame.states || {});
        setSteps(i + 1);
        setSwaps(frame.swaps || 0);

        if (frame.log) {
          setStepLog((previousLogs) => [
            ...previousLogs,
            {
              text: frame.log,
              type: frame.type || "info",
            },
          ]);
        }

        await new Promise((resolve) => {
          setTimeout(resolve, speedRef.current);
        });
      }

      if (
        mountedRef.current &&
        runIdRef.current === currentRunId
      ) {
        setDone(true);
        setRunning(false);

        setStepLog((previousLogs) => [
          ...previousLogs,
          {
            text: `${cfg.name} completed successfully.`,
            type: "success",
          },
        ]);
      }
    } catch (error) {
      console.error(`${cfg.name} failed:`, error);

      if (
        mountedRef.current &&
        runIdRef.current === currentRunId
      ) {
        setRunning(false);

        setStepLog((previousLogs) => [
          ...previousLogs,
          {
            text: `${cfg.name} stopped because an error occurred.`,
            type: "error",
          },
        ]);
      }
    }
  }, [running, array, cfg]);

  const stop = useCallback(() => {
    if (!running) {
      return;
    }

    // Invalidate the current execution.
    runIdRef.current += 1;

    setRunning(false);
    setDone(false);
    setStates({});

    setStepLog((previousLogs) => [
      ...previousLogs,
      {
        text: `${cfg.name} stopped by the user.`,
        type: "warning",
      },
    ]);
  }, [running, cfg]);

  const handleSizeChange = useCallback(
    (event) => {
      if (running) {
        window.alert(
          "Stop the algorithm before changing the array size."
        );
        return;
      }

      const newSize = Number(event.target.value);

      runIdRef.current += 1;

      setSize(newSize);
      setArray(randArr(newSize));
      setStates({});
      setSteps(0);
      setSwaps(0);
      setDone(false);

      setStepLog([
        {
          text: `Array size changed to ${newSize}.`,
          type: "info",
        },
      ]);
    },
    [running]
  );

  const handleSpeedChange = useCallback((event) => {
    const newSpeed = Number(event.target.value);

    setSpeed(newSpeed);
    speedRef.current = newSpeed;
  }, []);

  return (
    <AppShell breadcrumb={`Sorting / ${cfg.name}`}>
      <div className="section-title">{cfg.name}</div>

      <div className="section-sub">
        Watch cubes move in real-time as the algorithm runs
      </div>

      {/* Controls */}
      <div
        className="controls-bar"
        style={{ marginBottom: 12 }}
      >
        <button
          className="btn btn-ghost"
          onClick={generate}
          disabled={running}
        >
          ⟳ Generate
        </button>

        <button
          className="btn btn-primary"
          onClick={start}
          disabled={running || done}
        >
          ▶ Start
        </button>

        <button
          className="btn btn-danger"
          onClick={stop}
          disabled={!running}
        >
          ■ Stop
        </button>

        <div
          style={{
            width: 1,
            height: 20,
            background: "var(--border2)",
            margin: "0 4px",
          }}
        />

        <label>Size</label>

        <select
          className="size-select"
          value={size}
          onChange={handleSizeChange}
        >
          {[8, 12, 16, 20, 24].map((currentSize) => (
            <option
              key={currentSize}
              value={currentSize}
            >
              {currentSize}
            </option>
          ))}
        </select>

        <label>Speed</label>

        <input
          type="range"
          className="speed-slider"
          min={30}
          max={800}
          step={10}
          value={speed}
          onChange={handleSpeedChange}
        />

        <span
          style={{
            fontSize: 12,
            color: "var(--muted)",
            minWidth: 45,
          }}
        >
          {speed}ms
        </span>

        {/* Live stats */}
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            gap: 12,
            fontSize: 12,
          }}
        >
          <span>
            Steps:{" "}
            <strong style={{ color: "var(--cyan)" }}>
              {steps}
            </strong>
          </span>

          <span>
            Swaps:{" "}
            <strong style={{ color: "var(--orange)" }}>
              {swaps}
            </strong>
          </span>
        </div>
      </div>

      {/* Visualization layout */}
      <div className="viz-layout-3">
        <div className="viz-left">
          <AlgoExplain explanation={explanation} />
        </div>

        <div className="viz-center">
          <CubeVisualizer
            array={array}
            states={states}
          />

          {done && (
            <div
              style={{
                textAlign: "center",
                color: "var(--green)",
                fontWeight: 700,
                fontSize: 13,
                padding: "8px 0",
              }}
            >
              ✓ Sorted in {steps} steps · {swaps} swaps
            </div>
          )}
        </div>

        <div className="viz-right">
          <StepLog steps={stepLog} />
        </div>
      </div>
    </AppShell>
  );
}