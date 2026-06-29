import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import AppShell from "../../components/AppShell";
import AlgoExplain from "../../components/AlgoExplain";
import StepLog from "../../components/StepLog";
import { LINKEDLIST_EXPLANATIONS } from "../../data/algoExplanations";

const ALGOS = {
  reverse: "Reverse Linked List",
  "find-middle": "Find Middle",
  "detect-cycle": "Detect Cycle",
  "merge-sorted": "Merge Sorted Lists",
};

function randList(n = 6) {
  return Array.from(
    { length: n },
    () => Math.floor(Math.random() * 90) + 10
  );
}

function randSortedList(n = 5) {
  const arr = Array.from(
    { length: n },
    () => Math.floor(Math.random() * 90) + 10
  );

  return arr.sort((a, b) => a - b);
}

function LLNode({
  val,
  active,
  visited,
  last,
  color = "var(--cyan)",
}) {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <div
        className={`node-box ${active ? "active" : visited ? "visited" : ""}`}
        style={
          active
            ? {
                borderColor: color,
                boxShadow: `0 0 12px ${color}66`,
              }
            : {}
        }
      >
        {val}
      </div>

      {!last && <div className="node-arrow">-&gt;</div>}
    </div>
  );
}

function LinkedListViz({
  nodes,
  activeIdx,
  visitedSet,
  color,
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 4,
        padding: 16,
        background: "var(--bg)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        minHeight: 80,
        flex: 1,
      }}
    >
      {nodes.map((value, index) => (
        <LLNode
          key={index}
          val={value}
          active={activeIdx === index}
          visited={visitedSet.has(index)}
          last={index === nodes.length - 1}
          color={color}
        />
      ))}

      <div
        className="node-box"
        style={{
          borderStyle: "dashed",
          color: "var(--muted)",
        }}
      >
        null
      </div>
    </div>
  );
}

function MergeSortedViz({
  l1,
  l2,
  merged,
  p1,
  p2,
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        width: "100%",
        padding: "0 20px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 30,
            fontWeight: "bold",
            color: "var(--cyan)",
            fontSize: 14,
          }}
        >
          L1:
        </div>

        <LinkedListViz
          nodes={l1}
          activeIdx={p1}
          visitedSet={new Set(Array.from({ length: p1 }, (_, i) => i))}
          color="var(--cyan)"
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 30,
            fontWeight: "bold",
            color: "var(--orange)",
            fontSize: 14,
          }}
        >
          L2:
        </div>

        <LinkedListViz
          nodes={l2}
          activeIdx={p2}
          visitedSet={new Set(Array.from({ length: p2 }, (_, i) => i))}
          color="var(--orange)"
        />
      </div>

      <div
        style={{
          width: "100%",
          height: 1,
          background: "var(--border2)",
        }}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 60,
            fontWeight: "bold",
            color: "var(--green)",
            fontSize: 14,
          }}
        >
          Merged:
        </div>

        <LinkedListViz
          nodes={merged}
          activeIdx={merged.length - 1}
          visitedSet={new Set()}
          color="var(--green)"
        />
      </div>
    </div>
  );
}

export default function LinkedListPage() {
  const { algo } = useParams();
  const currentAlgo = ALGOS[algo] ? algo : "reverse";
  const explanation =
    LINKEDLIST_EXPLANATIONS[currentAlgo] ||
    LINKEDLIST_EXPLANATIONS.reverse;
  const isMerge = currentAlgo === "merge-sorted";

  const [nodes, setNodes] = useState(() => randList(6));
  const [activeIdx, setActiveIdx] = useState(-1);
  const [visitedSet, setVisitedSet] = useState(new Set());

  const [l1, setL1] = useState(() => randSortedList(5));
  const [l2, setL2] = useState(() => randSortedList(4));
  const [merged, setMerged] = useState([]);
  const [p1, setP1] = useState(0);
  const [p2, setP2] = useState(0);

  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(400);
  const [stepLog, setStepLog] = useState([]);

  const speedRef = useRef(speed);
  const runIdRef = useRef(0);
  const runningRef = useRef(false);
  const mountedRef = useRef(true);
  const previousAlgoRef = useRef(currentAlgo);
  const savedStatesRef = useRef({});
  const latestStateRef = useRef({
    nodes,
    activeIdx,
    visitedSet,
    l1,
    l2,
    merged,
    p1,
    p2,
    stepLog,
  });

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    latestStateRef.current = {
      nodes,
      activeIdx,
      visitedSet,
      l1,
      l2,
      merged,
      p1,
      p2,
      stepLog,
    };
  }, [
    nodes,
    activeIdx,
    visitedSet,
    l1,
    l2,
    merged,
    p1,
    p2,
    stepLog,
  ]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      runningRef.current = false;
      runIdRef.current += 1;
    };
  }, []);

  useEffect(() => {
    const previousAlgo = previousAlgoRef.current;

    if (previousAlgo === currentAlgo) {
      return;
    }

    runIdRef.current += 1;
    runningRef.current = false;
    setRunning(false);

    savedStatesRef.current[previousAlgo] = {
      nodes: [...latestStateRef.current.nodes],
      activeIdx: latestStateRef.current.activeIdx,
      visitedSet: new Set(latestStateRef.current.visitedSet),
      l1: [...latestStateRef.current.l1],
      l2: [...latestStateRef.current.l2],
      merged: [...latestStateRef.current.merged],
      p1: latestStateRef.current.p1,
      p2: latestStateRef.current.p2,
      stepLog: [...latestStateRef.current.stepLog],
    };

    const savedState = savedStatesRef.current[currentAlgo];

    if (savedState) {
      setNodes([...savedState.nodes]);
      setActiveIdx(savedState.activeIdx);
      setVisitedSet(new Set(savedState.visitedSet));
      setL1([...savedState.l1]);
      setL2([...savedState.l2]);
      setMerged([...savedState.merged]);
      setP1(savedState.p1);
      setP2(savedState.p2);

      setStepLog([
        ...savedState.stepLog,
        {
          text: `Returned to ${ALGOS[currentAlgo]}. Previous state restored.`,
          type: "info",
        },
      ]);
    } else if (currentAlgo === "merge-sorted") {
      setL1(randSortedList(5));
      setL2(randSortedList(4));
      setMerged([]);
      setP1(0);
      setP2(0);
      setStepLog([
        {
          text: "New merge lists generated.",
          type: "info",
        },
      ]);
    } else {
      setNodes(randList(6));
      setActiveIdx(-1);
      setVisitedSet(new Set());
      setStepLog([
        {
          text: "New list generated.",
          type: "info",
        },
      ]);
    }

    previousAlgoRef.current = currentAlgo;
  }, [currentAlgo]);

  const sleep = (ms) =>
    new Promise((resolve) => {
      setTimeout(resolve, ms);
    });

  const isCurrentRun = (runId) =>
    mountedRef.current && runIdRef.current === runId;

  const stopCurrentRun = () => {
    setRunning(false);
    runningRef.current = false;
  };

  const reset = () => {
    runIdRef.current += 1;
    runningRef.current = false;

    if (currentAlgo === "merge-sorted") {
      setL1(randSortedList(5));
      setL2(randSortedList(4));
      setMerged([]);
      setP1(0);
      setP2(0);
    } else {
      setNodes(randList(6));
      setActiveIdx(-1);
      setVisitedSet(new Set());
    }

    setStepLog([
      {
        text: "Reset.",
        type: "info",
      },
    ]);
    setRunning(false);
  };

  const animateReverse = async () => {
    if (runningRef.current) return;

    const currentRunId = runIdRef.current + 1;
    runIdRef.current = currentRunId;
    runningRef.current = true;

    setRunning(true);
    setStepLog([
      {
        text: "Reversing linked list...",
        type: "info",
      },
    ]);

    const arr = [...nodes];

    for (let i = 0; i < arr.length; i += 1) {
      if (!isCurrentRun(currentRunId)) {
        stopCurrentRun();
        return;
      }

      setActiveIdx(i);
      setStepLog((prev) => [
        ...prev,
        {
          text: `Processing node ${arr[i]}`,
          type: "compare",
        },
      ]);

      await sleep(speedRef.current);

      if (!isCurrentRun(currentRunId)) {
        stopCurrentRun();
        return;
      }
    }

    if (isCurrentRun(currentRunId)) {
      setNodes([...arr].reverse());
      setActiveIdx(-1);
      setStepLog((prev) => [
        ...prev,
        {
          text: "List reversed!",
          type: "done",
        },
      ]);
      stopCurrentRun();
    }
  };

  const animateMiddle = async () => {
    if (runningRef.current) return;

    const currentRunId = runIdRef.current + 1;
    runIdRef.current = currentRunId;
    runningRef.current = true;

    setRunning(true);
    setStepLog([]);

    let slow = 0;
    let fast = 0;
    const visited = new Set();

    while (fast < nodes.length - 1 && fast + 1 < nodes.length) {
      if (!isCurrentRun(currentRunId)) {
        stopCurrentRun();
        return;
      }

      visited.add(slow);
      fast += 2;
      slow += 1;
      setActiveIdx(slow);
      setVisitedSet(new Set(visited));
      setStepLog((prev) => [
        ...prev,
        {
          text: `Slow at ${slow} (${nodes[slow]}), Fast at ${fast} (${nodes[fast]})`,
          type: "compare",
        },
      ]);

      await sleep(speedRef.current);

      if (!isCurrentRun(currentRunId)) {
        stopCurrentRun();
        return;
      }
    }

    if (isCurrentRun(currentRunId)) {
      setStepLog((prev) => [
        ...prev,
        {
          text: `Middle node is ${nodes[slow]} at index ${slow}`,
          type: "done",
        },
      ]);
      stopCurrentRun();
    }
  };

  const animateCycle = async () => {
    if (runningRef.current) return;

    const currentRunId = runIdRef.current + 1;
    runIdRef.current = currentRunId;
    runningRef.current = true;

    setRunning(true);
    setStepLog([]);

    let slow = 0;
    let fast = 0;

    for (let step = 0; step < nodes.length; step += 1) {
      if (!isCurrentRun(currentRunId)) {
        stopCurrentRun();
        return;
      }

      slow = (slow + 1) % nodes.length;
      fast = (fast + 2) % nodes.length;
      setActiveIdx(slow);
      setStepLog((prev) => [
        ...prev,
        {
          text: `Floyd's: slow at index ${slow}, fast at index ${fast}`,
          type: "compare",
        },
      ]);

      await sleep(speedRef.current);

      if (!isCurrentRun(currentRunId)) {
        stopCurrentRun();
        return;
      }
    }

    if (isCurrentRun(currentRunId)) {
      setStepLog((prev) => [
        ...prev,
        {
          text: "No cycle detected (linear list)",
          type: "done",
        },
      ]);
      stopCurrentRun();
    }
  };

  const animateMerge = async () => {
    if (runningRef.current) return;

    const currentRunId = runIdRef.current + 1;
    runIdRef.current = currentRunId;
    runningRef.current = true;

    setRunning(true);
    setMerged([]);
    setP1(0);
    setP2(0);
    setStepLog([
      {
        text: "Starting merge...",
        type: "info",
      },
    ]);

    let i = 0;
    let j = 0;
    const nextMerged = [];

    while (i < l1.length && j < l2.length) {
      if (!isCurrentRun(currentRunId)) {
        stopCurrentRun();
        return;
      }

      setP1(i);
      setP2(j);
      setStepLog((prev) => [
        ...prev,
        {
          text: `Comparing L1[${i}]=${l1[i]} and L2[${j}]=${l2[j]}`,
          type: "compare",
        },
      ]);

      await sleep(speedRef.current);

      if (!isCurrentRun(currentRunId)) {
        stopCurrentRun();
        return;
      }

      if (l1[i] <= l2[j]) {
        nextMerged.push(l1[i]);
        setMerged([...nextMerged]);
        setStepLog((prev) => [
          ...prev,
          {
            text: `${l1[i]} <= ${l2[j]}, appending ${l1[i]} from L1`,
            type: "swap",
          },
        ]);
        i += 1;
      } else {
        nextMerged.push(l2[j]);
        setMerged([...nextMerged]);
        setStepLog((prev) => [
          ...prev,
          {
            text: `${l1[i]} > ${l2[j]}, appending ${l2[j]} from L2`,
            type: "swap",
          },
        ]);
        j += 1;
      }

      setP1(i);
      setP2(j);
      await sleep(speedRef.current / 2);
    }

    while (i < l1.length) {
      if (!isCurrentRun(currentRunId)) {
        stopCurrentRun();
        return;
      }

      setP1(i);
      setP2(j);
      setStepLog((prev) => [
        ...prev,
        {
          text: `L2 empty, appending ${l1[i]} from L1`,
          type: "swap",
        },
      ]);

      await sleep(speedRef.current / 2);

      if (!isCurrentRun(currentRunId)) {
        stopCurrentRun();
        return;
      }

      nextMerged.push(l1[i]);
      setMerged([...nextMerged]);
      i += 1;
      setP1(i);
    }

    while (j < l2.length) {
      if (!isCurrentRun(currentRunId)) {
        stopCurrentRun();
        return;
      }

      setP1(i);
      setP2(j);
      setStepLog((prev) => [
        ...prev,
        {
          text: `L1 empty, appending ${l2[j]} from L2`,
          type: "swap",
        },
      ]);

      await sleep(speedRef.current / 2);

      if (!isCurrentRun(currentRunId)) {
        stopCurrentRun();
        return;
      }

      nextMerged.push(l2[j]);
      setMerged([...nextMerged]);
      j += 1;
      setP2(j);
    }

    if (isCurrentRun(currentRunId)) {
      setStepLog((prev) => [
        ...prev,
        {
          text: "Merge complete!",
          type: "done",
        },
      ]);
      stopCurrentRun();
    }
  };

  const handleStart = () => {
    if (currentAlgo === "reverse") animateReverse();
    else if (currentAlgo === "find-middle") animateMiddle();
    else if (currentAlgo === "detect-cycle") animateCycle();
    else if (currentAlgo === "merge-sorted") animateMerge();
    else animateReverse();
  };

  const handleStop = () => {
    if (!runningRef.current) return;

    runIdRef.current += 1;
    runningRef.current = false;
    setRunning(false);
    setStepLog((prev) => [
      ...prev,
      {
        text: `${ALGOS[currentAlgo]} stopped by the user.`,
        type: "warning",
      },
    ]);
  };

  const handleSpeedChange = (event) => {
    const newSpeed = Number(event.target.value);

    setSpeed(newSpeed);
    speedRef.current = newSpeed;
  };

  return (
    <AppShell
      breadcrumb={`Linked List / ${explanation?.title || currentAlgo}`}
    >
      <div className="section-title">
        {explanation?.title || currentAlgo}
      </div>

      <div className="section-sub">
        Nodes animate as the pointer traverses the list
      </div>

      <div
        className="controls-bar"
        style={{ marginBottom: 12 }}
      >
        <button
          className="btn btn-ghost"
          onClick={reset}
          disabled={running}
        >
          Reset
        </button>

        <button
          className="btn btn-primary"
          onClick={handleStart}
          disabled={running}
        >
          Start
        </button>

        <button
          className="btn btn-danger"
          onClick={handleStop}
          disabled={!running}
        >
          Stop
        </button>

        <label>Speed</label>

        <input
          type="range"
          className="speed-slider"
          min={100}
          max={1000}
          value={speed}
          onChange={handleSpeedChange}
        />

        <span
          style={{
            fontSize: 12,
            color: "var(--muted)",
            minWidth: 50,
          }}
        >
          {speed}ms
        </span>
      </div>

      <div className="viz-layout-3">
        <div className="viz-left">
          <AlgoExplain explanation={explanation} />
        </div>

        <div className="viz-center">
          <div
            className="card"
            style={{
              minHeight: 300,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {isMerge ? (
              <MergeSortedViz
                l1={l1}
                l2={l2}
                merged={merged}
                p1={p1}
                p2={p2}
              />
            ) : (
              <LinkedListViz
                nodes={nodes}
                activeIdx={activeIdx}
                visitedSet={visitedSet}
              />
            )}
          </div>
        </div>

        <div className="viz-right">
          <StepLog steps={stepLog} />
        </div>
      </div>
    </AppShell>
  );
}
