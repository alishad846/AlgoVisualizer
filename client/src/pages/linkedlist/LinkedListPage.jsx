import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import AppShell from "../../components/AppShell";
import AlgoExplain from "../../components/AlgoExplain";
import StepLog from "../../components/StepLog";
import { LINKEDLIST_EXPLANATIONS } from "../../data/algoExplanations";

/* Linked List Node display */
function LLNode({ val, active, visited, last, color = "var(--cyan)" }) {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <div className={`node-box ${active ? "active" : visited ? "visited" : ""}`}
        style={active ? { borderColor: color, boxShadow: `0 0 12px ${color}66` } : {}}>
        {val}
      </div>
      {!last && <div className="node-arrow">→</div>}
    </div>
  );
}

function LinkedListViz({ nodes, activeIdx, visitedSet, color }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", flexWrap: "wrap", gap: 4, padding: 16,
      background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 12, minHeight: 80, flex: 1
    }}>
      {nodes.map((v, i) => (
        <LLNode key={i} val={v} active={activeIdx === i} visited={visitedSet.has(i)} last={i === nodes.length - 1} color={color} />
      ))}
      <div className="node-box" style={{ borderStyle: "dashed", color: "var(--muted)" }}>null</div>
    </div>
  );
}

function MergeSortedViz({ l1, l2, merged, p1, p2 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%", padding: "0 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 30, fontWeight: "bold", color: "var(--cyan)", fontSize: 14 }}>L1:</div>
        <LinkedListViz nodes={l1} activeIdx={p1} visitedSet={new Set(Array.from({ length: p1 }, (_, i) => i))} color="var(--cyan)" />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 30, fontWeight: "bold", color: "var(--orange)", fontSize: 14 }}>L2:</div>
        <LinkedListViz nodes={l2} activeIdx={p2} visitedSet={new Set(Array.from({ length: p2 }, (_, i) => i))} color="var(--orange)" />
      </div>
      <div style={{ width: "100%", height: 1, background: "var(--border2)" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 60, fontWeight: "bold", color: "var(--green)", fontSize: 14 }}>Merged:</div>
        <LinkedListViz nodes={merged} activeIdx={merged.length - 1} visitedSet={new Set()} color="var(--green)" />
      </div>
    </div>
  );
}

export default function LinkedListPage() {
  const { algo } = useParams();
  const explanation = LINKEDLIST_EXPLANATIONS[algo] || LINKEDLIST_EXPLANATIONS["reverse"];
  const isMerge = algo === "merge-sorted";

  // Random list generators
  function randList(n = 6) {
    return Array.from({ length: n }, () => Math.floor(Math.random() * 90) + 10);
  }

  function randSortedList(n = 5) {
    const arr = Array.from({ length: n }, () => Math.floor(Math.random() * 90) + 10);
    return arr.sort((a, b) => a - b);
  }

  // States
  const [nodes, setNodes] = useState(randList(6));
  const [activeIdx, setActiveIdx] = useState(-1);
  const [visitedSet, setVisitedSet] = useState(new Set());

  // Merge Sorted State
  const [l1, setL1] = useState(randSortedList(5));
  const [l2, setL2] = useState(randSortedList(4));
  const [merged, setMerged] = useState([]);
  const [p1, setP1] = useState(0);
  const [p2, setP2] = useState(0);

  const [running, setRunning] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const speed = Math.round(400 / speedMultiplier);
  const [stepLog, setStepLog] = useState([]);
  const stopRef = useRef(false);

  useEffect(() => {
    stopRef.current = true;
    setRunning(false);
    if (algo === "merge-sorted") {
      setL1(randSortedList(5));
      setL2(randSortedList(4));
      setMerged([]);
      setP1(0); setP2(0);
    } else {
      setNodes(randList(6));
      setActiveIdx(-1);
      setVisitedSet(new Set());
    }
    setStepLog([{ text: "New list generated.", type: "info" }]);
  }, [algo]);
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  const reset = () => {
    stopRef.current = true;
    setTimeout(() => {
      setNodes(randList(6));
      setL1(randSortedList(5));
      setL2(randSortedList(4));
      setActiveIdx(-1);
      setVisitedSet(new Set()); setStepLog([{ text: "Reset.", type: "info" }]);
      setMerged([]); setP1(0); setP2(0);
      setRunning(false);
      stopRef.current = false;
    }, 50);
  };

  const animateReverse = async () => {
    if (running) return;
    stopRef.current = false; setRunning(true); setStepLog([]);
    const arr = [...nodes];
    setStepLog(prev => [...prev, { text: "Reversing linked list...", type: "info" }]);
    for (let i = 0; i < arr.length; i++) {
      if (stopRef.current) break;
      setActiveIdx(i);
      setStepLog(prev => [...prev, { text: `Processing node ${arr[i]}`, type: "compare" }]);
      await sleep(speed);
    }
    const reversed = [...arr].reverse();
    setNodes(reversed); setActiveIdx(-1);
    if (!stopRef.current) setStepLog(prev => [...prev, { text: "List reversed! ✓", type: "done" }]);
    setRunning(false);
  };

  const animateMiddle = async () => {
    if (running) return;
    stopRef.current = false; setRunning(true); setStepLog([]);
    let slow = 0, fast = 0;
    const visited = new Set();
    while (fast < nodes.length - 1 && fast + 1 < nodes.length) {
      if (stopRef.current) break;
      visited.add(slow); fast += 2; slow += 1;
      setActiveIdx(slow); setVisitedSet(new Set(visited));
      setStepLog(prev => [...prev, { text: `Slow at ${slow} (${nodes[slow]}), Fast at ${fast} (${nodes[fast]})`, type: "compare" }]);
      await sleep(speed);
    }
    if (!stopRef.current) setStepLog(prev => [...prev, { text: `Middle node is ${nodes[slow]} at index ${slow} ✓`, type: "done" }]);
    setRunning(false);
  };

  const animateCycle = async () => {
    if (running) return;
    stopRef.current = false; setRunning(true); setStepLog([]);
    let slow = 0, fast = 0;
    for (let step = 0; step < nodes.length; step++) {
      if (stopRef.current) break;
      slow = (slow + 1) % nodes.length;
      fast = (fast + 2) % nodes.length;
      setActiveIdx(slow);
      setStepLog(prev => [...prev, { text: `Floyd's: slow at index ${slow}, fast at index ${fast}`, type: "compare" }]);
      await sleep(speed);
    }
    if (!stopRef.current) setStepLog(prev => [...prev, { text: "No cycle detected (linear list) ✓", type: "done" }]);
    setRunning(false);
  };

  const animateMerge = async () => {
    if (running) return;
    stopRef.current = false; setRunning(true); setStepLog([]);
    setMerged([]); setP1(0); setP2(0);
    let i = 0, j = 0;
    const m = [];

    setStepLog(prev => [...prev, { text: "Starting merge...", type: "info" }]);

    while (i < l1.length && j < l2.length) {
      if (stopRef.current) break;
      setP1(i); setP2(j);
      setStepLog(prev => [...prev, { text: `Comparing L1[${i}]=${l1[i]} and L2[${j}]=${l2[j]}`, type: "compare" }]);
      await sleep(speed);

      if (l1[i] <= l2[j]) {
        m.push(l1[i]);
        setMerged([...m]);
        setStepLog(prev => [...prev, { text: `${l1[i]} <= ${l2[j]}, appending ${l1[i]} from L1`, type: "swap" }]);
        i++;
      } else {
        m.push(l2[j]);
        setMerged([...m]);
        setStepLog(prev => [...prev, { text: `${l1[i]} > ${l2[j]}, appending ${l2[j]} from L2`, type: "swap" }]);
        j++;
      }
      setP1(i); setP2(j);
      await sleep(speed / 2);
    }

    while (i < l1.length) {
      if (stopRef.current) break;
      setP1(i); setP2(j);
      setStepLog(prev => [...prev, { text: `L2 empty, appending ${l1[i]} from L1`, type: "swap" }]);
      await sleep(speed / 2);
      m.push(l1[i]);
      setMerged([...m]);
      i++;
      setP1(i);
    }

    while (j < l2.length) {
      if (stopRef.current) break;
      setP1(i); setP2(j);
      setStepLog(prev => [...prev, { text: `L1 empty, appending ${l2[j]} from L2`, type: "swap" }]);
      await sleep(speed / 2);
      m.push(l2[j]);
      setMerged([...m]);
      j++;
      setP2(j);
    }

    if (!stopRef.current) setStepLog(prev => [...prev, { text: "Merge complete! ✓", type: "done" }]);
    setRunning(false);
  };

  const handleStart = () => {
    if (algo === "reverse") animateReverse();
    else if (algo === "find-middle") animateMiddle();
    else if (algo === "detect-cycle") animateCycle();
    else if (algo === "merge-sorted") animateMerge();
    else animateReverse();
  };

  return (
    <AppShell breadcrumb={`Linked List / ${explanation?.title || algo}`}>
      <div className="section-title">{explanation?.title || algo}</div>
      <div className="section-sub">Nodes animate as the pointer traverses the list</div>

      <div className="controls-bar" style={{ marginBottom: 12 }}>
        <button className="btn btn-ghost" onClick={reset} disabled={running}>⟳ Reset</button>
        <button className="btn btn-primary" onClick={handleStart} disabled={running}>▶ Start</button>
        <button className="btn btn-danger" onClick={() => { stopRef.current = true; setRunning(false); }} disabled={!running}>■ Stop</button>
        <label>Speed</label>
        <select className="size-select" value={speedMultiplier} onChange={e => setSpeedMultiplier(+e.target.value)} disabled={running}>
          <option value={0.5}>0.5x</option>
          <option value={1}>1x</option>
          <option value={2}>2x</option>
          <option value={3}>3x</option>
          <option value={4}>4x</option>
        </select>
      </div>

      <div className="viz-layout-3">
        {/* LEFT — Explanation */}
        <div className="viz-left">
          <AlgoExplain explanation={explanation} />
        </div>

        {/* CENTER — Visualizer */}
        <div className="viz-center">
          <div className="card" style={{ minHeight: 300, display: "flex", justifyContent: "center", alignItems: "center" }}>
            {isMerge ? (
              <MergeSortedViz l1={l1} l2={l2} merged={merged} p1={p1} p2={p2} />
            ) : (
              <LinkedListViz nodes={nodes} activeIdx={activeIdx} visitedSet={visitedSet} />
            )}
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
