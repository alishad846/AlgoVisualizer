import { useCallback } from "react";
import { useParams } from "react-router-dom";
import AppShell from "../../components/AppShell";
import AlgoExplain from "../../components/AlgoExplain";
import StepLog from "../../components/StepLog";
import MultiLangCode from "../../components/MultiLangCode";
import { SEARCHING_EXPLANATIONS } from "../../data/algoExplanations";
import {
  linearSearchSteps,
  binarySearchSteps,
  jumpSearchSteps,
  interpolationSearchSteps,
  exponentialSearchSteps,
  twoSumSteps,
  reverseIntegerSteps,
  zigzagConversionSteps,
  containerWithMostWaterSteps,
  integerToRomanSteps,
  romanToIntegerSteps,
  longestCommonPrefixSteps,
  slidingWindowSteps
} from "../../algorithms/searchingSteps";
import { useAlgoManager } from "../../utils/algoCache";

const ALGOS = {
  "linear-search": {
    name: "Linear Search",
    fn: linearSearchSteps
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
  },
  "two-sum": {
  name: "Two Sum",
  fn: twoSumSteps
},
"reverse-integer": {
  name: "Reverse Integer",
  fn: reverseIntegerSteps
},
"zigzag-conversion": {
  name: "Zigzag Conversion",
  fn: zigzagConversionSteps
},
"container-with-most-water": {
  name: "Container With Most Water",
  fn: containerWithMostWaterSteps
},
"integer-to-roman": {
  name: "Integer to Roman",
  fn: integerToRomanSteps
},
"roman-to-integer": {
  name: "Roman to Integer",
  fn: romanToIntegerSteps
},
"longest-common-prefix": {
  name: "Longest Common Prefix",
  fn: longestCommonPrefixSteps
},
  "sliding-window": {
    name: "Longest Substring Without Repeating Characters",
    fn: slidingWindowSteps
  }
};

function randArr(n) {
  return Array.from(
    { length: n },
    () => Math.floor(Math.random() * 20) + 1
  );
}

export default function SearchingPage() {
  const { algo } = useParams();

  const cfg = ALGOS[algo] || ALGOS["linear-search"];

  const explanation =
    SEARCHING_EXPLANATIONS[algo] ||
    SEARCHING_EXPLANATIONS["linear-search"];

  const isSlidingWindow = algo === "sliding-window";

  const {
    state,
    update,
    stop,
    cacheObj
  } = useAlgoManager(
    `searching_${algo}`,
    () => ({
      array: randArr(14),
      target: 42,
      states: {},
      pointer: -1,
      steps: 0,
      foundIdx: -1,
      speedMultiplier: 1,
      running: false,
      stepLog: [],
      frames: null,
      frameIdx: -1
    })
  );

  const {
    array,
    target,
    states,
    pointer,
    steps,
    foundIdx,
    speedMultiplier,
    running,
    stepLog,
    frames,
    frameIdx
  } = state;

  const generate = useCallback(() => {
    stop();

    setTimeout(() => {
      update({
        array: randArr(14),
        states: {},
        pointer: -1,
        steps: 0,
        foundIdx: -1,
        stepLog: [],
        running: false,
        frames: null,
        frameIdx: -1
      });

      if (cacheObj?.stopRef) {
        cacheObj.stopRef.current = false;
      }
    }, 50);
  }, [update, stop, cacheObj]);

  const start = useCallback(async () => {
    if (!cacheObj || cacheObj.running) return;

    cacheObj.stopRef.current = false;

    let computedFrames;

    if (isSlidingWindow) {
      computedFrames = cfg.fn(cacheObj.array);
    } else {
      const numTarget =
        cacheObj.target === "" ||
        cacheObj.target === null ||
        Number.isNaN(Number(cacheObj.target))
          ? 0
          : Number(cacheObj.target);

      if (
        cacheObj.target === "" ||
        cacheObj.target === null ||
        Number.isNaN(Number(cacheObj.target))
      ) {
        update({ target: 0 });
      }

      computedFrames = cfg.fn(
        cacheObj.array,
        numTarget
      );
    }

    update({
      running: true,
      states: {},
      foundIdx: -1,
      steps: 0,
      stepLog: [],
      frames: computedFrames,
      frameIdx: 0
    });

    for (
      let i = 0;
      i < computedFrames.length;
      i++
    ) {
      if (cacheObj.stopRef.current) break;

      const frame = computedFrames[i];

      update({
        array: frame.arr,
        states: frame.states,
        pointer: frame.pointer,
        steps: i + 1,
        foundIdx:
          frame.found !== undefined
            ? frame.found
            : -1,
        frameIdx: i,
        stepLog: [
          ...cacheObj.stepLog,
          {
            text: frame.log,
            type: frame.type || "info"
          }
        ]
      });

      const delay = Math.round(
        300 /
          (cacheObj.speedMultiplier || 1)
      );

      await new Promise(resolve =>
        setTimeout(resolve, delay)
      );
    }

    update({ running: false });
  }, [
    cfg,
    update,
    cacheObj,
    isSlidingWindow
  ]);

  const handlePrev = () => {
    if (
      running ||
      !frames ||
      frames.length === 0 ||
      frameIdx <= 0
    ) {
      return;
    }

    const nextIdx = frameIdx - 1;
    const frame = frames[nextIdx];

    update({
      array: frame.arr,
      states: frame.states,
      pointer: frame.pointer,
      steps: nextIdx + 1,
      foundIdx:
        frame.found !== undefined
          ? frame.found
          : -1,
      frameIdx: nextIdx,
      stepLog: frames
        .slice(0, nextIdx + 1)
        .map(item => ({
          text: item.log,
          type: item.type || "info"
        }))
    });
  };

  const handleNext = () => {
    if (
      running ||
      !frames ||
      frames.length === 0 ||
      frameIdx >= frames.length - 1
    ) {
      return;
    }

    const nextIdx = frameIdx + 1;
    const frame = frames[nextIdx];

    update({
      array: frame.arr,
      states: frame.states,
      pointer: frame.pointer,
      steps: nextIdx + 1,
      foundIdx:
        frame.found !== undefined
          ? frame.found
          : -1,
      frameIdx: nextIdx,
      stepLog: frames
        .slice(0, nextIdx + 1)
        .map(item => ({
          text: item.log,
          type: item.type || "info"
        }))
    });
  };

  const max = Math.max(...array, 1);

  const prevDisabled =
    running ||
    !frames ||
    frames.length === 0 ||
    frameIdx <= 0;

  const nextDisabled =
    running ||
    !frames ||
    frames.length === 0 ||
    frameIdx >= frames.length - 1;

  return (
    <AppShell
      breadcrumb={`Searching / ${cfg.name}`}
    >
      <div className="section-title">
        {cfg.name}
      </div>

      <div className="section-sub">
        {isSlidingWindow
          ? "The highlighted cubes show the current sliding window without repeated values"
          : "Cubes highlight as the algorithm scans for the target value"}
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
          ⟳ Generate
        </button>

        {!isSlidingWindow && (
          <>
            <label>Target</label>

            <input
              type="number"
              value={target}
              onChange={event =>
                update({
                  target:
                    event.target.value === ""
                      ? ""
                      : Number(
                          event.target.value
                        )
                })
              }
              onBlur={() => {
                if (
                  target === "" ||
                  target === null ||
                  Number.isNaN(Number(target))
                ) {
                  update({ target: 0 });
                }
              }}
              disabled={running}
              style={{
                width: 64,
                background: "var(--surface2)",
                border:
                  "1px solid var(--border2)",
                color: "var(--text)",
                padding: "6px 8px",
                borderRadius: 8,
                fontSize: 13
              }}
            />
          </>
        )}

        <button
          className="btn btn-primary"
          onClick={start}
          disabled={running}
        >
          ▶️ Start
        </button>

        <button
          className="btn btn-danger"
          onClick={stop}
          disabled={!running}
        >
          ■ Stop
        </button>

        <button
          className="btn btn-ghost"
          onClick={handlePrev}
          disabled={prevDisabled}
          style={{
            opacity: prevDisabled ? 0.4 : 1
          }}
        >
          ◀️ Prev Step
        </button>

        <button
          className="btn btn-ghost"
          onClick={handleNext}
          disabled={nextDisabled}
          style={{
            opacity: nextDisabled ? 0.4 : 1
          }}
        >
          Next Step ▶️
        </button>

        <label>Speed</label>

        <select
          className="size-select"
          value={speedMultiplier}
          onChange={event =>
            update({
              speedMultiplier: Number(
                event.target.value
              )
            })
          }
          disabled={running}
        >
          <option value={0.5}>0.5x</option>
          <option value={1}>1x</option>
          <option value={2}>2x</option>
          <option value={3}>3x</option>
          <option value={4}>4x</option>
        </select>

        <div
          style={{
            marginLeft: "auto",
            fontSize: 12
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
              {isSlidingWindow
                ? "✓ Longest window found"
                : `✓ Found at index ${foundIdx}`}
            </span>
          )}

          {!isSlidingWindow &&
            !running &&
            steps > 0 &&
            foundIdx < 0 && (
              <span
                style={{
                  color: "var(--red)",
                  marginLeft: 12
                }}
              >
                ✗ Not found
              </span>
            )}
        </div>
      </div>

      <div className="viz-layout-3">
        <div className="viz-left">
          <AlgoExplain
            explanation={explanation}
            stepLog={stepLog}
          />
        </div>

        <div className="viz-center">
          <div className="custom-h-scroll">
            <div
              style={{
                minWidth: `${
                  array.length * 48 + 40
                }px`,
                width: "max(100%, fit-content)",
                margin: "0 auto"
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 6,
                  padding: "0 20px",
                  minHeight: 16,
                  width: "100%"
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
                            "10px solid var(--active-bg)"
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="cubes-arena">
                {array.map((value, index) => {
                  let itemState =
                    states[index] || "default";

                  if (
                    !isSlidingWindow &&
                    foundIdx === index
                  ) {
                    itemState = "found";
                  } else if (
                    !isSlidingWindow &&
                    !running &&
                    steps > 0 &&
                    foundIdx < 0
                  ) {
                    itemState = "notfound";
                  }

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
                        className={`cube-label state-${itemState}`}
                      >
                        {value}
                      </div>

                      <div
                        className={`cube state-${itemState}`}
                        style={{ height }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div
            style={{
              textAlign: "center",
              marginTop: 8,
              fontSize: 13,
              color: "var(--muted)"
            }}
          >
            {isSlidingWindow ? (
              <span>
                Highlighted values represent the
                current window
              </span>
            ) : (
              <span>
                Target:{" "}
                <strong
                  style={{
                    color:
                      "var(--active-bg)"
                  }}
                >
                  {target}
                </strong>
              </span>
            )}
          </div>
        </div>

        <div className="viz-right">
          <StepLog steps={stepLog} />
        </div>
      </div>

      <MultiLangCode algoKey={algo} />
    </AppShell>
  );
}