import { useEffect, useRef, useState } from "react";
import {
  useParams,
  useSearchParams
} from "react-router-dom";

import AppShell from "../../components/AppShell";
import AlgoExplain from "../../components/AlgoExplain";
import StepLog from "../../components/StepLog";

import {
  SEARCHING_EXPLANATIONS
} from "../../data/algoExplanations";

import {
  linearSearchSteps,
  binarySearchSteps,
  jumpSearchSteps,
  interpolationSearchSteps,
  exponentialSearchSteps,
  twoSumSteps
} from "../../algorithms/searchingSteps";

const ALGOS = {
  "linear-search": {
    name: "Linear Search",
    fn: linearSearchSteps
  },

  "two-sum": {
    name: "Two Sum",
    fn: twoSumSteps
  },

  "binary-search": {
    name: "Binary Search",
    fn: binarySearchSteps
  },

  "jump-search": {
    name: "Jump Search",
    fn: jumpSearchSteps
  },

  "interpolation-search": {
    name: "Interpolation Search",
    fn: interpolationSearchSteps
  },

  "exponential-search": {
    name: "Exponential Search",
    fn: exponentialSearchSteps
  }
};

function randArr(n) {
  return Array.from(
    { length: n },
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

  const cfg =
    ALGOS[algo] || ALGOS["linear-search"];

  const explanation =
    SEARCHING_EXPLANATIONS[algo] ||
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

  const stopRef = useRef(false);
  const autoStartRef = useRef(false);

  const generate = () => {
    stopRef.current = true;

    setTimeout(() => {
      const generatedArray = randArr(14);

      setArray(generatedArray);
      setStates({});
      setPointer(-1);
      setSteps(0);
      setFoundIdx(-1);
      setStepLog([]);
      setRunning(false);

      stopRef.current = false;
    }, 50);
  };

  const start = async () => {
    if (running) {
      return;
    }

    stopRef.current = false;
    setRunning(true);

    setStates({});
    setPointer(-1);
    setSteps(0);
    setFoundIdx(-1);
    setStepLog([]);

    try {
      const frames = cfg.fn(array, target);

      for (
        let index = 0;
        index < frames.length;
        index += 1
      ) {
        if (stopRef.current) {
          break;
        }

        const frame = frames[index];

        setStates(frame.states || {});
        setPointer(
          typeof frame.pointer === "number"
            ? frame.pointer
            : -1
        );

        setSteps(index + 1);

        setStepLog((previousSteps) => [
          ...previousSteps,
          {
            text: frame.log,
            type: frame.type || "info"
          }
        ]);

        if (
          typeof frame.found === "number" &&
          frame.found >= 0
        ) {
          setFoundIdx(frame.found);
        }

        await new Promise((resolve) => {
          setTimeout(resolve, speed);
        });

        if (
          typeof frame.found === "number" &&
          frame.found >= 0
        ) {
          break;
        }
      }
    } catch (error) {
      console.error(
        "Visualization error:",
        error
      );

      setStepLog((previousSteps) => [
        ...previousSteps,
        {
          text:
            error?.message ||
            "Unable to run the visualization.",
          type: "error"
        }
      ]);
    } finally {
      setRunning(false);
    }
  };

  useEffect(() => {
    if (
      algo === "two-sum" &&
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
    algo,
    autoStart,
    extensionNums,
    extensionTarget
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
          onChange={(event) => {
            setTarget(Number(event.target.value));
          }}
          style={{
            width: 64,
            background: "var(--surface2)",
            border: "1px solid var(--border2)",
            color: "var(--text)"
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
          onClick={() => {
            stopRef.current = true;
            setRunning(false);
          }}
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
          onChange={(event) => {
            setSpeed(Number(event.target.value));
          }}
        />

        <span
          style={{
            fontSize: 12,
            color: "var(--muted)",
            minWidth: 45
          }}
        >
          {speed}ms
        </span>

        <div
          style={{
            marginLeft: "auto",
            fontSize: 13
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
                marginLeft: 12
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
                  marginLeft: 12
                }}
              >
                ✕ Not found
              </span>
            )}
        </div>
      </div>


      <div className="viz-layout-3">
        <div className="viz-left">
          <AlgoExplain explanation={explanation} />
        </div>

        <div className="viz-center">
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 6,
              padding: "0 20px",
              minHeight: 16
            }}
          >
            {array.map((_, index) => (
              <div
                key={index}
                style={{
                  width: 40,
                  display: "flex",
                  justifyContent: "center"
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
                        "10px solid var(--cyan)"
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
                Math.round((value / max) * 160)
              );

              return (
                <div
                  key={index}
                  className="cube-wrap"
                >
                  <div
                    className={`cube-label state-${state}`}
                  >
                    {value}
                  </div>

                  <div
                    className={`cube state-${state}`}
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
              color: "var(--muted)"
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