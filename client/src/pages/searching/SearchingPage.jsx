import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useParams,
  useSearchParams,
} from "react-router-dom";

import AppShell from "../../components/AppShell";
import AlgoExplain from "../../components/AlgoExplain";
import StepLog from "../../components/StepLog";

import {
  SEARCHING_EXPLANATIONS,
} from "../../data/algoExplanations";

import {
  linearSearchSteps,
  binarySearchSteps,
  ternarySearchSteps,
  jumpSearchSteps,
  interpolationSearchSteps,
  exponentialSearchSteps,
  twoSumSteps,
} from "../../algorithms/searchingSteps";

const ALGOS = {
  "linear-search": {
    name: "Linear Search",
    fn: linearSearchSteps,
  },

  "two-sum": {
    name: "Two Sum",
    fn: twoSumSteps,
  },

  "binary-search": {
    name: "Binary Search",
    fn: binarySearchSteps,
  },

  "ternary-search": {
  name: "Ternary Search",
  fn: ternarySearchSteps,
},

  "jump-search": {
    name: "Jump Search",
    fn: jumpSearchSteps,
  },

  "interpolation-search": {
    name: "Interpolation Search",
    fn: interpolationSearchSteps,
  },

  "exponential-search": {
    name: "Exponential Search",
    fn: exponentialSearchSteps,
  },
};

function randArr(size) {
  return Array.from(
    { length: size },
    () => Math.floor(Math.random() * 90) + 5
  );
}

export default function SearchingPage() {
  const { algo } = useParams();
  const [searchParams] = useSearchParams();

  const extensionNums = searchParams.get("nums");
  const extensionTarget = searchParams.get("target");
  const autoStart =
    searchParams.get("autoStart") === "true";

  const currentAlgo = ALGOS[algo]
    ? algo
    : "linear-search";

  const cfg = ALGOS[currentAlgo];

  const explanation =
    SEARCHING_EXPLANATIONS[currentAlgo] ||
    SEARCHING_EXPLANATIONS["linear-search"];

  const [array, setArray] = useState(() => {
    if (extensionNums) {
      try {
        const parsedNums = JSON.parse(extensionNums);

        if (Array.isArray(parsedNums)) {
          return parsedNums;
        }
      } catch (error) {
        console.error(
          "Invalid nums parameter:",
          error
        );
      }
    }

    return randArr(14);
  });

  const [target, setTarget] = useState(() => {
    const parsedTarget = Number(extensionTarget);

    return Number.isNaN(parsedTarget)
      ? 42
      : parsedTarget;
  });

  const [states, setStates] = useState({});
  const [pointer, setPointer] = useState(-1);
  const [steps, setSteps] = useState(0);
  const [foundIdx, setFoundIdx] = useState(-1);
  const [speed, setSpeed] = useState(300);
  const [running, setRunning] = useState(false);
  const [stepLog, setStepLog] = useState([]);

  // Each execution receives a unique ID.
  // Changing this value cancels an older execution.
  const runIdRef = useRef(0);

  // Allows speed changes while an algorithm is running.
  const speedRef = useRef(speed);

  // Prevents updates after leaving the page.
  const mountedRef = useRef(true);

  // Prevents repeated automatic execution from extension parameters.
  const autoStartRef = useRef(false);

  // Stores the state of every searching algorithm.
  const savedStatesRef = useRef({});

  // Remembers the previously selected algorithm.
  const previousAlgoRef = useRef(currentAlgo);

  // Stores the latest visible state.
  const latestStateRef = useRef({
    array,
    target,
    states,
    pointer,
    steps,
    foundIdx,
    stepLog,
  });

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    latestStateRef.current = {
      array,
      target,
      states,
      pointer,
      steps,
      foundIdx,
      stepLog,
    };
  }, [
    array,
    target,
    states,
    pointer,
    steps,
    foundIdx,
    stepLog,
  ]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      runIdRef.current += 1;
    };
  }, []);

  /*
   * Handles switching between searching algorithms.
   *
   * It stops the previous execution, saves its state,
   * and restores the selected algorithm's previous state.
   */
  useEffect(() => {
    const previousAlgo = previousAlgoRef.current;

    if (previousAlgo === currentAlgo) {
      return;
    }

    // Cancel the old search execution.
    runIdRef.current += 1;
    setRunning(false);

    // Save the previous algorithm state.
    savedStatesRef.current[previousAlgo] = {
      array: [...latestStateRef.current.array],
      target: latestStateRef.current.target,
      states: {
        ...latestStateRef.current.states,
      },
      pointer: latestStateRef.current.pointer,
      steps: latestStateRef.current.steps,
      foundIdx: latestStateRef.current.foundIdx,
      stepLog: [
        ...latestStateRef.current.stepLog,
      ],
    };

    const savedState =
      savedStatesRef.current[currentAlgo];

    if (savedState) {
      // Restore the selected algorithm state.
      setArray([...savedState.array]);
      setTarget(savedState.target);
      setStates({ ...savedState.states });
      setPointer(savedState.pointer);
      setSteps(savedState.steps);
      setFoundIdx(savedState.foundIdx);

      setStepLog([
        ...savedState.stepLog,
        {
          text:
            `Returned to ${ALGOS[currentAlgo].name}. ` +
            "Previous state restored.",
          type: "info",
        },
      ]);
    } else {
      // First time opening this algorithm.
      const generatedArray = randArr(14);

      setArray(generatedArray);
      setTarget(42);
      setStates({});
      setPointer(-1);
      setSteps(0);
      setFoundIdx(-1);

      setStepLog([
        {
          text:
            `Switched to ${ALGOS[currentAlgo].name}. ` +
            "New visualization created.",
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

    // Cancel any unfinished execution.
    runIdRef.current += 1;

    const generatedArray = randArr(14);

    setArray(generatedArray);
    setStates({});
    setPointer(-1);
    setSteps(0);
    setFoundIdx(-1);

    setStepLog([
      {
        text: "Generated a new random array.",
        type: "info",
      },
    ]);
  }, [running]);

  const start = useCallback(async () => {
    if (running) {
      return;
    }

    const currentRunId =
      runIdRef.current + 1;

    runIdRef.current = currentRunId;

    setRunning(true);
    setStates({});
    setPointer(-1);
    setSteps(0);
    setFoundIdx(-1);

    setStepLog([
      {
        text: `${cfg.name} started.`,
        type: "info",
      },
    ]);

    try {
      // Pass a copy to prevent direct mutation of React state.
      const frames = cfg.fn([...array], target);

      for (
        let index = 0;
        index < frames.length;
        index += 1
      ) {
        /*
         * Stop when:
         * 1. Stop is clicked.
         * 2. Another algorithm starts.
         * 3. The user switches algorithms.
         * 4. The page is closed.
         */
        if (
          runIdRef.current !== currentRunId ||
          !mountedRef.current
        ) {
          return;
        }

        const frame = frames[index];

        setStates(frame.states || {});

        setPointer(
          typeof frame.pointer === "number"
            ? frame.pointer
            : -1
        );

        setSteps(index + 1);

        if (frame.log) {
          setStepLog((previousSteps) => [
            ...previousSteps,
            {
              text: frame.log,
              type: frame.type || "info",
            },
          ]);
        }

        if (
          typeof frame.found === "number" &&
          frame.found >= 0
        ) {
          setFoundIdx(frame.found);
        }

        await new Promise((resolve) => {
          setTimeout(
            resolve,
            speedRef.current
          );
        });

        if (
          runIdRef.current !== currentRunId ||
          !mountedRef.current
        ) {
          return;
        }

        if (
          typeof frame.found === "number" &&
          frame.found >= 0
        ) {
          break;
        }
      }

      if (
        mountedRef.current &&
        runIdRef.current === currentRunId
      ) {
        setRunning(false);

        setStepLog((previousSteps) => [
          ...previousSteps,
          {
            text: `${cfg.name} completed.`,
            type: "success",
          },
        ]);
      }
    } catch (error) {
      console.error(
        "Visualization error:",
        error
      );

      if (
        mountedRef.current &&
        runIdRef.current === currentRunId
      ) {
        setRunning(false);

        setStepLog((previousSteps) => [
          ...previousSteps,
          {
            text:
              error?.message ||
              "Unable to run the visualization.",
            type: "error",
          },
        ]);
      }
    }
  }, [
    running,
    cfg,
    array,
    target,
  ]);

  const stop = useCallback(() => {
    if (!running) {
      return;
    }

    // Invalidate the current execution.
    runIdRef.current += 1;
    setRunning(false);

    setStepLog((previousSteps) => [
      ...previousSteps,
      {
        text: `${cfg.name} stopped by the user.`,
        type: "warning",
      },
    ]);
  }, [running, cfg]);

  const handleTargetChange = useCallback(
    (event) => {
      if (running) {
        window.alert(
          "Stop the algorithm before changing the target."
        );
        return;
      }

      const newTarget = Number(
        event.target.value
      );

      setTarget(newTarget);
      setStates({});
      setPointer(-1);
      setSteps(0);
      setFoundIdx(-1);

      setStepLog([
        {
          text: `Target changed to ${newTarget}.`,
          type: "info",
        },
      ]);
    },
    [running]
  );

  const handleSpeedChange = useCallback(
    (event) => {
      const newSpeed = Number(
        event.target.value
      );

      setSpeed(newSpeed);
      speedRef.current = newSpeed;
    },
    []
  );

  /*
   * Automatically starts Two Sum when values are
   * received from the browser extension.
   */
  useEffect(() => {
    if (
      ["two-sum", "binary-search"].includes(currentAlgo) &&
      autoStart &&
      extensionNums &&
      extensionTarget !== null &&
      !autoStartRef.current
    ) {
      autoStartRef.current = true;

      const timer = setTimeout(() => {
        start();
      }, 500);

      return () => {
        clearTimeout(timer);
      };
    }

    return undefined;
  }, [
    currentAlgo,
    autoStart,
    extensionNums,
    extensionTarget,
    start,
  ]);

  const max = Math.max(...array, 1);

  return (
    <AppShell
      breadcrumb={`Searching / ${cfg.name}`}
    >
      <div className="section-title">
        {cfg.name}
      </div>

      <div className="section-sub">
        Cubes highlight as the algorithm scans
        for the target value
      </div>

      <div
        className="controls-bar"
        style={{ marginBottom: 12 }}
      >
        <button
          className="btn btn-ghost"
          onClick={generate}
          disabled={running}
        >
          ↻ Generate
        </button>

        <label>Target</label>

        <input
          type="number"
          value={target}
          onChange={handleTargetChange}
          style={{
            width: 64,
            background: "var(--surface2)",
            border:
              "1px solid var(--border2)",
            color: "var(--text)",
          }}
        />

        <button
          className="btn btn-primary"
          onClick={start}
          disabled={running}
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

        <label>Speed</label>

        <input
          type="range"
          className="speed-slider"
          min="50"
          max="800"
          step="10"
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

        <div
          style={{
            marginLeft: "auto",
            fontSize: 13,
          }}
        >
          Steps:{" "}
          <strong
            style={{ color: "var(--cyan)" }}
          >
            {steps}
          </strong>

          {foundIdx >= 0 && (
            <span
              style={{
                color: "var(--green)",
                marginLeft: 12,
              }}
            >
              ✓ Found at index {foundIdx}
            </span>
          )}

          {!running &&
            steps > 0 &&
            foundIdx < 0 && (
              <span
                style={{
                  color: "var(--red)",
                  marginLeft: 12,
                }}
              >
                ✕ Not found
              </span>
            )}
        </div>
      </div>

      <div className="viz-layout-3">
        <div className="viz-left">
          <AlgoExplain
            explanation={explanation}
          />
        </div>

        <div className="viz-center">
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 6,
              padding: "0 20px",
              minHeight: 16,
            }}
          >
            {array.map((_, index) => (
              <div
                key={index}
                style={{
                  width: 40,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                {pointer === index && (
                  <div
                    style={{
                      width: 0,
                      height: 0,
                      borderLeft:
                        "6px solid transparent",
                      borderRight:
                        "6px solid transparent",
                      borderBottom:
                        "10px solid var(--cyan)",
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="cubes-arena">
            {array.map((value, index) => {
              const state =
                states[index] || "default";

              const height = Math.max(
                18,
                Math.round(
                  (value / max) * 160
                )
              );

              return (
                <div
                  key={index}
                  className="cube-wrap"
                >
                  <div
                    className={
                      `cube-label state-${state}`
                    }
                  >
                    {value}
                  </div>

                  <div
                    className={
                      `cube state-${state}`
                    }
                    style={{ height }}
                  />
                </div>
              );
            })}
          </div>

          <div
            style={{
              textAlign: "center",
              marginTop: 8,
              fontSize: 13,
              color: "var(--muted)",
            }}
          >
            Target:{" "}
            <strong
              style={{ color: "var(--cyan)" }}
            >
              {target}
            </strong>
          </div>
        </div>

        <div className="viz-right">
          <StepLog steps={stepLog} />
        </div>
      </div>
    </AppShell>
  );
}