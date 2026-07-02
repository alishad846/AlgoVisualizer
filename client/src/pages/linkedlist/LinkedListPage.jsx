import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import AppShell from "../../components/AppShell";
import AlgoExplain from "../../components/AlgoExplain";
import StepLog from "../../components/StepLog";
import MultiLangCode from "../../components/MultiLangCode";
import { LINKEDLIST_EXPLANATIONS } from "../../data/algoExplanations";
import "./LinkedListPage.css";

<<<<<<< HEAD
function Icon({ children, className = "" }) {
  return <span className={`material-symbols-outlined ${className}`}>{children}</span>;
}

export default function LinkedListPage() {
  const { algo } = useParams();

  if (algo !== "reverse" && algo !== "reverse-linked-list") {
    return <LegacyLinkedListPage algo={algo} />;
  }

  return <LinkedListModulePage />;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const SPEED_LEVELS = [
  { label: "0.5x", delay: 1000 },
  { label: "1.0x", delay: 600 },
  { label: "1.5x", delay: 350 },
  { label: "2.0x", delay: 150 },
];

const OP_META = {
  traversal: {
    title: "Linked List Traversal",
    sub: "Visit each node from head to tail",
    theory: "Traversal starts at the head node and follows each next pointer until null is reached. Each node is processed once, so it is the base operation behind search, insertion, deletion, and reverse.",
    code: `function traverse(head) {
  let current = head;

  while (current !== null) {
    visit(current.value);
    current = current.next;
  }
}`,
    best: "O(n)",
    average: "O(n)",
    worst: "O(n)",
    space: "O(1)",
  },
  insertion: {
    title: "Linked List Insertion",
    sub: "Insert a node at a selected position",
    theory: "Insertion creates a new node and adjusts next pointers. Inserting at the head is constant time, while inserting at an index requires traversal to the previous node.",
    code: `function insertAt(head, value, index) {
  const node = new Node(value);

  if (index === 0) {
    node.next = head;
    return node;
  }

  let current = head;
  for (let i = 0; i < index - 1; i++) {
    current = current.next;
  }

  node.next = current.next;
  current.next = node;
  return head;
}`,
    best: "O(1)",
    average: "O(n)",
    worst: "O(n)",
    space: "O(1)",
  },
  deletion: {
    title: "Linked List Deletion",
    sub: "Delete a node from a selected position",
    theory: "Deletion removes a node by reconnecting the previous node to the deleted node's next pointer. Deleting the head is constant time, while deleting by index requires traversal.",
    code: `function deleteAt(head, index) {
  if (index === 0) return head.next;

  let current = head;
  for (let i = 0; i < index - 1; i++) {
    current = current.next;
  }

  current.next = current.next.next;
  return head;
}`,
    best: "O(1)",
    average: "O(n)",
    worst: "O(n)",
    space: "O(1)",
  },
  search: {
    title: "Linked List Search",
    sub: "Find a node by value",
    theory: "Search checks each node value from head to tail until the target is found or the traversal reaches null.",
    code: `function search(head, target) {
  let current = head;
  let index = 0;

  while (current !== null) {
    if (current.value === target) return index;
    current = current.next;
    index++;
  }

  return -1;
}`,
    best: "O(1)",
    average: "O(n)",
    worst: "O(n)",
    space: "O(1)",
  },
  reverse: {
    title: "Reverse Linked List",
    sub: "Reverse links using three pointers",
    theory: "Reversal walks through the list and flips every next pointer. The previous pointer becomes the new head after the traversal completes.",
    code: `function reverse(head) {
  let prev = null;
  let current = head;

  while (current !== null) {
    const next = current.next;
    current.next = prev;
    prev = current;
    current = next;
  }

  return prev;
}`,
    best: "O(n)",
    average: "O(n)",
    worst: "O(n)",
    space: "O(1)",
  },
};

function normalizeOperation(algo) {
  if (algo === "insert" || algo === "insertion") return "insertion";
  if (algo === "delete" || algo === "deletion") return "deletion";
  if (algo === "search") return "search";
  if (algo === "reverse" || algo === "reverse-linked-list") return "reverse";
  if (algo === "traversal" || algo === "linked-list") return "traversal";
  return "traversal";
}

function LinkedListViz({ nodes, activeIdx, visitedSet, messageType }) {
  return (
    <div className="ll-stage">
      <div className="ll-indicator-row">
        <span>HEAD</span>
        <span>TAIL</span>
      </div>

      <div className="ll-track">
        {nodes.map((value, index) => (
          <div className="ll-node-wrap" key={`${value}-${index}`}>
            <div className="ll-marker-row">
              <span>{index === 0 ? "head" : ""}</span>
              <span>{index === nodes.length - 1 ? "tail" : ""}</span>
            </div>

            <div
              className={[
                "ll-node",
                activeIdx === index ? "ll-node-active" : "",
                visitedSet.has(index) ? "ll-node-visited" : "",
                messageType === "success" && activeIdx === index ? "ll-node-success" : "",
                messageType === "warning" && activeIdx === index ? "ll-node-warning" : "",
                messageType === "failure" && activeIdx === index ? "ll-node-failure" : "",
              ].join(" ")}
            >
              <span>data</span>
              <strong>{value}</strong>
            </div>

            {index < nodes.length - 1 && (
              <div className="ll-arrow">
                <span />
                <Icon>arrow_forward</Icon>
              </div>
            )}
          </div>
        ))}

        <div className="ll-null">NULL</div>
=======
/* Linked List Node display */
function LLNode({ val, active, visited, last, color = "var(--cyan)" }) {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <div className={`node-box ${active ? "active" : visited ? "visited" : ""}`}
        style={active ? { borderColor: color, boxShadow: `0 0 12px ${color}66` } : {}}>
        {val}
>>>>>>> 1948f82f0a7c1ab5f237809752dd77b6b88e50f4
      </div>
    </div>
  );
}

function LegacyNode({ val, active, visited, last, color = "var(--cyan)" }) {
  return (
    <div style={{ display:"flex", alignItems:"center" }}>
      <div className={`node-box ${active ? "active" : visited ? "visited" : ""}`}
           style={active ? { borderColor: color, boxShadow: `0 0 12px ${color}66` } : {}}>
        {val}
      </div>
      {!last && <div className="node-arrow">{"->"}</div>}
    </div>
  );
}

function LegacyLinkedListViz({ nodes, activeIdx, visitedSet, color }) {
  return (
<<<<<<< HEAD
    <div style={{ display:"flex", alignItems:"center", flexWrap:"wrap", gap:4, padding:16,
      background:"var(--bg)", border:"1px solid var(--border)", borderRadius:12, minHeight:80, flex: 1 }}>
      {nodes.map((v,i) => (
        <LegacyNode key={i} val={v} active={activeIdx===i} visited={visitedSet.has(i)} last={i===nodes.length-1} color={color} />
=======
    <div style={{
      display: "flex", alignItems: "center", flexWrap: "wrap", gap: 4, padding: 16,
      background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 12, minHeight: 80, flex: 1
    }}>
      {nodes.map((v, i) => (
        <LLNode key={i} val={v} active={activeIdx === i} visited={visitedSet.has(i)} last={i === nodes.length - 1} color={color} />
>>>>>>> 1948f82f0a7c1ab5f237809752dd77b6b88e50f4
      ))}
      <div className="node-box" style={{ borderStyle: "dashed", color: "var(--muted)" }}>null</div>
    </div>
  );
}

function LegacyMergeSortedViz({ l1, l2, merged, p1, p2 }) {
  return (
<<<<<<< HEAD
    <div style={{ display:"flex", flexDirection:"column", gap:16, width:"100%", padding: "0 20px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ width:40, color:"var(--muted)", fontSize:12, fontWeight:700 }}>L1:</span>
        {l1.map((v,i) => <LegacyNode key={i} val={v} active={p1===i} visited={p1>i} last={i===l1.length-1} color="var(--cyan)" />)}
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ width:40, color:"var(--muted)", fontSize:12, fontWeight:700 }}>L2:</span>
        {l2.map((v,i) => <LegacyNode key={i} val={v} active={p2===i} visited={p2>i} last={i===l2.length-1} color="var(--purple)" />)}
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:8, borderTop:"1px dashed var(--border2)", paddingTop:16 }}>
        <span style={{ width:40, color:"var(--green)", fontSize:12, fontWeight:700 }}>Res:</span>
        {merged.map((v,i) => <LegacyNode key={i} val={v} active={false} visited={true} last={i===merged.length-1} color="var(--green)" />)}
        {merged.length === 0 && <span style={{ color:"var(--muted)", fontSize:12 }}>Empty</span>}
=======
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
>>>>>>> 1948f82f0a7c1ab5f237809752dd77b6b88e50f4
      </div>
    </div>
  );
}

function LegacyLinkedListPage({ algo }) {
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
<<<<<<< HEAD
  const [l1] = useState([1, 3, 5, 7, 9]);
  const [l2] = useState([2, 4, 6, 8]);
=======

  // Merge Sorted State
  const [l1, setL1] = useState(randSortedList(5));
  const [l2, setL2] = useState(randSortedList(4));
>>>>>>> 1948f82f0a7c1ab5f237809752dd77b6b88e50f4
  const [merged, setMerged] = useState([]);
  const [p1, setP1] = useState(0);
  const [p2, setP2] = useState(0);
  const [running, setRunning] = useState(false);
<<<<<<< HEAD
  const [speedIndex, setSpeedIndex] = useState(1);
=======
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const speed = Math.round(400 / speedMultiplier);
>>>>>>> 1948f82f0a7c1ab5f237809752dd77b6b88e50f4
  const [stepLog, setStepLog] = useState([]);
  const stopRef = useRef(false);
  const speedRef = useRef(SPEED_LEVELS[speedIndex].delay);

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
<<<<<<< HEAD

  useEffect(() => {
    speedRef.current = SPEED_LEVELS[speedIndex].delay;
  }, [speedIndex]);
=======
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const [llFrames, setLlFrames] = useState(null);
  const [llFrameIdx, setLlFrameIdx] = useState(-1);
>>>>>>> 1948f82f0a7c1ab5f237809752dd77b6b88e50f4

  const reset = () => {
    stopRef.current = true;
    setTimeout(() => {
<<<<<<< HEAD
      setNodes([10,20,30,40,50,60]);
      setActiveIdx(-1);
      setVisitedSet(new Set());
      setStepLog([{text:"Reset.",type:"info"}]);
      setMerged([]);
      setP1(0);
      setP2(0);
=======
      setNodes(randList(6));
      setL1(randSortedList(5));
      setL2(randSortedList(4));
      setActiveIdx(-1);
      setVisitedSet(new Set()); setStepLog([{ text: "Reset.", type: "info" }]);
      setMerged([]); setP1(0); setP2(0);
      setLlFrames(null); setLlFrameIdx(-1);
>>>>>>> 1948f82f0a7c1ab5f237809752dd77b6b88e50f4
      setRunning(false);
      stopRef.current = false;
    }, 50);
  };

  const animateReverse = async () => {
    if (running) return;
    stopRef.current = false; setRunning(true); setStepLog([]);
    setLlFrames(null); setLlFrameIdx(-1);
    const recFrames = [];
    const logAcc = [];
    const addFrame = (sObj, text, type) => {
      logAcc.push({ text, type });
      recFrames.push({
        nodes: sObj.nodes ? [...sObj.nodes] : [...nodes],
        l1: [...l1], l2: [...l2], merged: [...merged],
        activeIdx: sObj.activeIdx !== undefined ? sObj.activeIdx : -1,
        visitedSet: new Set(), p1: 0, p2: 0,
        log: [...logAcc]
      });
    };

    const arr = [...nodes];
<<<<<<< HEAD
    setStepLog(prev => [...prev, {text:"Reversing linked list...", type:"info"}]);
    for(let i=0;i<arr.length;i++){
      if(stopRef.current) break;
      setActiveIdx(i);
      setStepLog(prev => [...prev, {text:`Processing node ${arr[i]}`, type:"compare"}]);
      await sleep(speedRef.current);
    }
    const reversed = [...arr].reverse();
    setNodes(reversed); setActiveIdx(-1);
    if(!stopRef.current) setStepLog(prev => [...prev, {text:"List reversed!", type:"done"}]);
=======
    setStepLog([{ text: "Reversing linked list...", type: "info" }]);
    addFrame({ nodes: arr, activeIdx: -1 }, "Reversing linked list...", "info");

    for (let i = 0; i < arr.length; i++) {
      if (stopRef.current) break;
      setActiveIdx(i);
      setStepLog(prev => [...prev, { text: `Processing node ${arr[i]}`, type: "compare" }]);
      addFrame({ nodes: arr, activeIdx: i }, `Processing node ${arr[i]}`, "compare");
      await sleep(speed);
    }
    const reversed = [...arr].reverse();
    setNodes(reversed); setActiveIdx(-1);
    if (!stopRef.current) {
      setStepLog(prev => [...prev, { text: "List reversed! ✓", type: "done" }]);
      addFrame({ nodes: reversed, activeIdx: -1 }, "List reversed! ✓", "done");
    }
    setLlFrames(recFrames); setLlFrameIdx(recFrames.length - 1);
>>>>>>> 1948f82f0a7c1ab5f237809752dd77b6b88e50f4
    setRunning(false);
  };

  const animateMiddle = async () => {
    if (running) return;
    stopRef.current = false; setRunning(true); setStepLog([]);
<<<<<<< HEAD
    let slow=0, fast=0;
    const visited = new Set();
    while(fast < nodes.length-1 && fast+1 < nodes.length){
      if(stopRef.current) break;
      visited.add(slow); fast+=2; slow+=1;
      setActiveIdx(slow); setVisitedSet(new Set(visited));
      setStepLog(prev => [...prev, {text:`Slow at ${slow} (${nodes[slow]}), Fast at ${fast} (${nodes[fast]})`, type:"compare"}]);
      await sleep(speedRef.current);
    }
    if(!stopRef.current) setStepLog(prev => [...prev, {text:`Middle node is ${nodes[slow]} at index ${slow}`, type:"done"}]);
=======
    setLlFrames(null); setLlFrameIdx(-1);
    const recFrames = [];
    const logAcc = [];
    const addFrame = (actIdx, visSet, text, type) => {
      logAcc.push({ text, type });
      recFrames.push({
        nodes: [...nodes], l1: [...l1], l2: [...l2], merged: [...merged],
        activeIdx: actIdx, visitedSet: new Set(visSet), p1: 0, p2: 0,
        log: [...logAcc]
      });
    };

    let slow = 0, fast = 0;
    const vis = new Set();
    while (fast < nodes.length - 1 && fast + 1 < nodes.length) {
      if (stopRef.current) break;
      vis.add(slow); fast += 2; slow += 1;
      setActiveIdx(slow); setVisitedSet(new Set(vis));
      setStepLog(prev => [...prev, { text: `Slow at ${slow} (${nodes[slow]}), Fast at ${fast} (${nodes[fast]})`, type: "compare" }]);
      addFrame(slow, vis, `Slow at ${slow} (${nodes[slow]}), Fast at ${fast} (${nodes[fast]})`, "compare");
      await sleep(speed);
    }
    if (!stopRef.current) {
      setStepLog(prev => [...prev, { text: `Middle node is ${nodes[slow]} at index ${slow} ✓`, type: "done" }]);
      addFrame(slow, vis, `Middle node is ${nodes[slow]} at index ${slow} ✓`, "done");
    }
    setLlFrames(recFrames); setLlFrameIdx(recFrames.length - 1);
>>>>>>> 1948f82f0a7c1ab5f237809752dd77b6b88e50f4
    setRunning(false);
  };

  const animateCycle = async () => {
    if (running) return;
    stopRef.current = false; setRunning(true); setStepLog([]);
    setLlFrames(null); setLlFrameIdx(-1);
    const recFrames = [];
    const logAcc = [];
    const addFrame = (actIdx, text, type) => {
      logAcc.push({ text, type });
      recFrames.push({
        nodes: [...nodes], l1: [...l1], l2: [...l2], merged: [...merged],
        activeIdx: actIdx, visitedSet: new Set(), p1: 0, p2: 0,
        log: [...logAcc]
      });
    };

    let slow = 0, fast = 0;
    for (let step = 0; step < nodes.length; step++) {
      if (stopRef.current) break;
      slow = (slow + 1) % nodes.length;
      fast = (fast + 2) % nodes.length;
      setActiveIdx(slow);
<<<<<<< HEAD
      setStepLog(prev => [...prev, {text:`Floyd's: slow at index ${slow}, fast at index ${fast}`, type:"compare"}]);
      await sleep(speedRef.current);
    }
    if(!stopRef.current) setStepLog(prev => [...prev, {text:"No cycle detected (linear list)", type:"done"}]);
=======
      setStepLog(prev => [...prev, { text: `Floyd's: slow at index ${slow}, fast at index ${fast}`, type: "compare" }]);
      addFrame(slow, `Floyd's: slow at index ${slow}, fast at index ${fast}`, "compare");
      await sleep(speed);
    }
    if (!stopRef.current) {
      setStepLog(prev => [...prev, { text: "No cycle detected (linear list) ✓", type: "done" }]);
      addFrame(-1, "No cycle detected (linear list) ✓", "done");
    }
    setLlFrames(recFrames); setLlFrameIdx(recFrames.length - 1);
>>>>>>> 1948f82f0a7c1ab5f237809752dd77b6b88e50f4
    setRunning(false);
  };

  const animateMerge = async () => {
    if (running) return;
    stopRef.current = false; setRunning(true); setStepLog([]);
    setMerged([]); setP1(0); setP2(0);
    setLlFrames(null); setLlFrameIdx(-1);
    const recFrames = [];
    const logAcc = [];
    const addFrame = (mArr, idx1, idx2, text, type) => {
      logAcc.push({ text, type });
      recFrames.push({
        nodes: [...nodes], l1: [...l1], l2: [...l2], merged: [...mArr],
        activeIdx: -1, visitedSet: new Set(), p1: idx1, p2: idx2,
        log: [...logAcc]
      });
    };

    let i = 0, j = 0;
    const m = [];
<<<<<<< HEAD
    setStepLog(prev => [...prev, {text:"Starting merge...", type:"info"}]);
=======

    setStepLog([{ text: "Starting merge...", type: "info" }]);
    addFrame(m, i, j, "Starting merge...", "info");
>>>>>>> 1948f82f0a7c1ab5f237809752dd77b6b88e50f4

    while (i < l1.length && j < l2.length) {
      if (stopRef.current) break;
      setP1(i); setP2(j);
<<<<<<< HEAD
      setStepLog(prev => [...prev, {text:`Comparing L1[${i}]=${l1[i]} and L2[${j}]=${l2[j]}`, type:"compare"}]);
      await sleep(speedRef.current);
=======
      setStepLog(prev => [...prev, { text: `Comparing L1[${i}]=${l1[i]} and L2[${j}]=${l2[j]}`, type: "compare" }]);
      addFrame(m, i, j, `Comparing L1[${i}]=${l1[i]} and L2[${j}]=${l2[j]}`, "compare");
      await sleep(speed);

>>>>>>> 1948f82f0a7c1ab5f237809752dd77b6b88e50f4
      if (l1[i] <= l2[j]) {
        m.push(l1[i]);
        setMerged([...m]);
        setStepLog(prev => [...prev, { text: `${l1[i]} <= ${l2[j]}, appending ${l1[i]} from L1`, type: "swap" }]);
        addFrame(m, i + 1, j, `${l1[i]} <= ${l2[j]}, appending ${l1[i]} from L1`, "swap");
        i++;
      } else {
        m.push(l2[j]);
        setMerged([...m]);
        setStepLog(prev => [...prev, { text: `${l1[i]} > ${l2[j]}, appending ${l2[j]} from L2`, type: "swap" }]);
        addFrame(m, i, j + 1, `${l1[i]} > ${l2[j]}, appending ${l2[j]} from L2`, "swap");
        j++;
      }
      setP1(i); setP2(j);
<<<<<<< HEAD
      await sleep(speedRef.current / 2);
=======
      await sleep(speed / 2);
>>>>>>> 1948f82f0a7c1ab5f237809752dd77b6b88e50f4
    }

    while (i < l1.length) {
      if (stopRef.current) break;
      setP1(i); setP2(j);
<<<<<<< HEAD
      setStepLog(prev => [...prev, {text:`L2 empty, appending ${l1[i]} from L1`, type:"swap"}]);
      await sleep(speedRef.current / 2);
=======
      setStepLog(prev => [...prev, { text: `L2 empty, appending ${l1[i]} from L1`, type: "swap" }]);
      addFrame(m, i + 1, j, `L2 empty, appending ${l1[i]} from L1`, "swap");
      await sleep(speed / 2);
>>>>>>> 1948f82f0a7c1ab5f237809752dd77b6b88e50f4
      m.push(l1[i]);
      setMerged([...m]);
      i++;
      setP1(i);
    }

    while (j < l2.length) {
      if (stopRef.current) break;
      setP1(i); setP2(j);
<<<<<<< HEAD
      setStepLog(prev => [...prev, {text:`L1 empty, appending ${l2[j]} from L2`, type:"swap"}]);
      await sleep(speedRef.current / 2);
=======
      setStepLog(prev => [...prev, { text: `L1 empty, appending ${l2[j]} from L2`, type: "swap" }]);
      addFrame(m, i, j + 1, `L1 empty, appending ${l2[j]} from L2`, "swap");
      await sleep(speed / 2);
>>>>>>> 1948f82f0a7c1ab5f237809752dd77b6b88e50f4
      m.push(l2[j]);
      setMerged([...m]);
      j++;
      setP2(j);
    }

<<<<<<< HEAD
    if(!stopRef.current) setStepLog(prev => [...prev, {text:"Merge complete!", type:"done"}]);
=======
    if (!stopRef.current) {
      setStepLog(prev => [...prev, { text: "Merge complete! ✓", type: "done" }]);
      addFrame(m, i, j, "Merge complete! ✓", "done");
    }
    setLlFrames(recFrames); setLlFrameIdx(recFrames.length - 1);
>>>>>>> 1948f82f0a7c1ab5f237809752dd77b6b88e50f4
    setRunning(false);
  };

  const handleLlPrev = () => {
    if (running || !llFrames || llFrameIdx <= 0) return;
    const nextIdx = llFrameIdx - 1;
    const f = llFrames[nextIdx];
    setLlFrameIdx(nextIdx);
    setNodes(f.nodes); setL1(f.l1); setL2(f.l2); setMerged(f.merged);
    setActiveIdx(f.activeIdx); setVisitedSet(f.visitedSet); setP1(f.p1); setP2(f.p2);
    setStepLog(f.log);
  };

  const handleLlNext = () => {
    if (running || !llFrames || llFrameIdx >= llFrames.length - 1) return;
    const nextIdx = llFrameIdx + 1;
    const f = llFrames[nextIdx];
    setLlFrameIdx(nextIdx);
    setNodes(f.nodes); setL1(f.l1); setL2(f.l2); setMerged(f.merged);
    setActiveIdx(f.activeIdx); setVisitedSet(f.visitedSet); setP1(f.p1); setP2(f.p2);
    setStepLog(f.log);
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

<<<<<<< HEAD
      <div className="controls-bar" style={{marginBottom:12}}>
        <button className="btn btn-ghost" onClick={reset} disabled={running}>Reset</button>
        <button className="btn btn-primary" onClick={handleStart} disabled={running}>Start</button>
        <button className="btn btn-danger" onClick={()=>{stopRef.current=true;setRunning(false);}}>Stop</button>
        <label>Speed</label>
        <input type="range" className="speed-slider" min={0} max={3} step={1}
          value={speedIndex} onChange={e=>setSpeedIndex(Number(e.target.value))} />
        <span style={{fontSize:12,color:"var(--muted)",minWidth:50}}>{SPEED_LEVELS[speedIndex].label}</span>
=======
      <div className="controls-bar" style={{ marginBottom: 12 }}>
        <button className="btn btn-ghost" onClick={reset} disabled={running}>⟳ Reset</button>
        <button className="btn btn-primary" onClick={handleStart} disabled={running}>▶ Start</button>
        <button className="btn btn-danger" onClick={() => { stopRef.current = true; setRunning(false); }} disabled={!running}>■ Stop</button>
        <button className="btn btn-ghost" onClick={handleLlPrev} disabled={running || !llFrames || llFrameIdx <= 0} style={{ opacity: (running || !llFrames || llFrameIdx <= 0) ? 0.4 : 1 }}>◀ Prev Step</button>
        <button className="btn btn-ghost" onClick={handleLlNext} disabled={running || !llFrames || llFrameIdx >= llFrames.length - 1} style={{ opacity: (running || !llFrames || llFrameIdx >= llFrames.length - 1) ? 0.4 : 1 }}>Next Step ▶</button>
        <label>Speed</label>
        <select className="size-select" value={speedMultiplier} onChange={e => setSpeedMultiplier(+e.target.value)} disabled={running}>
          <option value={0.5}>0.5x</option>
          <option value={1}>1x</option>
          <option value={2}>2x</option>
          <option value={3}>3x</option>
          <option value={4}>4x</option>
        </select>
>>>>>>> 1948f82f0a7c1ab5f237809752dd77b6b88e50f4
      </div>

      <div className="viz-layout-3">
        <div className="viz-left">
          <AlgoExplain explanation={explanation} stepLog={stepLog} />
        </div>

        <div className="viz-center">
          <div className="card" style={{ minHeight: 300, display: "flex", justifyContent: "center", alignItems: "center" }}>
            {isMerge ? (
              <LegacyMergeSortedViz l1={l1} l2={l2} merged={merged} p1={p1} p2={p2} />
            ) : (
              <LegacyLinkedListViz nodes={nodes} activeIdx={activeIdx} visitedSet={visitedSet} />
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

function LinkedListModulePage() {
  const { algo } = useParams();
  const initialOperation = normalizeOperation(algo);
  const explanation = LINKEDLIST_EXPLANATIONS[algo] || LINKEDLIST_EXPLANATIONS[initialOperation];

  const [operation, setOperation] = useState(initialOperation);
  const [nodes, setNodes] = useState([10, 20, 30, 40, 50, 60]);
  const [nodeValue, setNodeValue] = useState(25);
  const [position, setPosition] = useState(2);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [visitedSet, setVisitedSet] = useState(new Set());
  const [message, setMessage] = useState({ type: "info", text: "Ready." });
  const [running, setRunning] = useState(false);
  const [speedIndex, setSpeedIndex] = useState(1);
  const [steps, setSteps] = useState(0);
  const [logs, setLogs] = useState([]);
  const stopRef = useRef(false);
  const speedRef = useRef(SPEED_LEVELS[speedIndex].delay);

  const meta = OP_META[operation];

  useEffect(() => {
    stopRef.current = true;
    setRunning(false);
    setOperation(normalizeOperation(algo));
    return () => {
      stopRef.current = true;
    };
  }, [algo]);

  useEffect(() => {
    speedRef.current = SPEED_LEVELS[speedIndex].delay;
  }, [speedIndex]);

  const addLog = (msg, type = "info") => {
    const time = new Date().toLocaleTimeString([], {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    setLogs((prev) => [{ time, msg, type }, ...prev].slice(0, 50));
  };

  const resetState = () => {
    stopRef.current = true;
    setRunning(false);
    setNodes([10, 20, 30, 40, 50, 60]);
    setNodeValue(25);
    setPosition(2);
    setActiveIdx(-1);
    setVisitedSet(new Set());
    setSteps(0);
    setLogs([]);
    setMessage({ type: "info", text: "Generated default linked list." });
    addLog("Generated default linked list.");
  };

  const beginRun = (label) => {
    if (running) return false;
    stopRef.current = false;
    setRunning(true);
    setActiveIdx(-1);
    setVisitedSet(new Set());
    setSteps(0);
    setLogs([]);
    setMessage({ type: "info", text: label });
    addLog(label);
    return true;
  };

  const finishRun = (type, text) => {
    setMessage({ type, text });
    addLog(text, type === "success" ? "swap" : type);
    setRunning(false);
  };

  const visitIndex = async (index, text, type = "info") => {
    if (stopRef.current) return false;
    setActiveIdx(index);
    setVisitedSet((prev) => new Set([...prev, index]));
    setSteps((prev) => prev + 1);
    addLog(text, type === "success" ? "swap" : type);
    await sleep(speedRef.current);
    return !stopRef.current;
  };

  const startTraversal = async () => {
    if (!beginRun("Starting traversal from head.")) return;

    for (let i = 0; i < nodes.length; i++) {
      const ok = await visitIndex(i, `Visited index ${i}, value ${nodes[i]}.`);
      if (!ok) break;
    }

    if (!stopRef.current) {
      setActiveIdx(-1);
      finishRun("success", "Traversal completed. Reached NULL.");
    }
  };

  const startInsertion = async () => {
    if (!beginRun(`Preparing to insert ${nodeValue} at index ${position}.`)) return;

    const index = Number(position);
    const value = Number(nodeValue);
    if (!Number.isFinite(value)) {
      finishRun("warning", "Enter a valid node value.");
      return;
    }
    if (index < 0 || index > nodes.length) {
      finishRun("warning", `Position must be between 0 and ${nodes.length}.`);
      return;
    }

    if (index === 0) {
      await sleep(speedRef.current);
      setNodes([value, ...nodes]);
      setActiveIdx(0);
      setSteps(1);
      finishRun("success", `${value} inserted at head.`);
      return;
    }

    for (let i = 0; i < index; i++) {
      const label = i === index - 1 ? "previous node found" : "moving forward";
      const ok = await visitIndex(i, `At index ${i}, ${label}.`);
      if (!ok) break;
    }

    if (!stopRef.current) {
      const next = [...nodes];
      next.splice(index, 0, value);
      setNodes(next);
      setActiveIdx(index);
      finishRun("success", `${value} inserted at index ${index}.`);
    }
  };

  const startDeletion = async () => {
    if (!beginRun(`Preparing to delete node at index ${position}.`)) return;

    const index = Number(position);
    if (nodes.length === 0) {
      finishRun("failure", "Cannot delete from an empty list.");
      return;
    }
    if (index < 0 || index >= nodes.length) {
      finishRun("warning", `Position must be between 0 and ${nodes.length - 1}.`);
      return;
    }

    if (index === 0) {
      await visitIndex(0, `Deleting head node ${nodes[0]}.`, "warning");
      if (!stopRef.current) {
        setNodes(nodes.slice(1));
        setActiveIdx(-1);
        finishRun("success", "Head deleted successfully.");
      }
      return;
    }

    for (let i = 0; i <= index; i++) {
      const label = i === index ? "target node found" : "traversing";
      const ok = await visitIndex(i, `At index ${i}, ${label}.`, i === index ? "warning" : "info");
      if (!ok) break;
    }

    if (!stopRef.current) {
      const next = nodes.filter((_, i) => i !== index);
      setNodes(next);
      setActiveIdx(-1);
      finishRun("success", `Deleted node at index ${index}.`);
    }
  };

  const startSearch = async () => {
    if (!beginRun(`Searching for value ${nodeValue}.`)) return;

    const value = Number(nodeValue);
    if (!Number.isFinite(value)) {
      finishRun("warning", "Enter a valid search value.");
      return;
    }

    for (let i = 0; i < nodes.length; i++) {
      const found = nodes[i] === value;
      const ok = await visitIndex(i, `Checking index ${i}: ${nodes[i]} ${found ? "matches" : "does not match"} ${value}.`, found ? "success" : "info");
      if (!ok) break;
      if (found) {
        finishRun("success", `Found ${value} at index ${i}.`);
        return;
      }
    }

    if (!stopRef.current) {
      setActiveIdx(-1);
      finishRun("failure", `${value} was not found in the list.`);
    }
  };

  const startReverse = async () => {
    if (!beginRun("Starting linked-list reversal.")) return;

    for (let i = 0; i < nodes.length; i++) {
      const ok = await visitIndex(i, `Reversing pointer at index ${i}, value ${nodes[i]}.`, "info");
      if (!ok) break;
    }

    if (!stopRef.current) {
      setNodes([...nodes].reverse());
      setActiveIdx(-1);
      finishRun("success", "Linked list reversed successfully.");
    }
  };

  const handleStart = () => {
    if (operation === "traversal") startTraversal();
    else if (operation === "insertion") startInsertion();
    else if (operation === "deletion") startDeletion();
    else if (operation === "search") startSearch();
    else if (operation === "reverse") startReverse();
  };

  const runOperation = (nextOperation) => {
    if (running) return;
    setOperation(nextOperation);
    setTimeout(() => {
      if (nextOperation === "insertion") startInsertion();
      else if (nextOperation === "deletion") startDeletion();
      else if (nextOperation === "search") startSearch();
    }, 0);
  };

  const handleStop = () => {
    stopRef.current = true;
    setRunning(false);
    setMessage({ type: "warning", text: "Execution stopped by user." });
    addLog("Execution stopped by user.", "warning");
  };

  return (
    <AppShell breadcrumb={`Linked List / ${meta.title || explanation?.title || algo}`}>
      <div className="bs-page">
        <div className="bs-title-row">
          <div>
            <h1>{meta.title}</h1>
            <p>{meta.sub}</p>
          </div>
        </div>

        <div className="bs-info-grid">
          <div className="bs-left-info">
            <div className="bs-panel">
              <h2>{meta.title}</h2>
              <h3><Icon>info</Icon> Theory</h3>
              <p>{meta.theory}</p>
            </div>

            <div className="bs-panel">
              <h3><Icon>analytics</Icon> Complexity Analysis</h3>
              <div className="bs-complexity-grid">
                <div><span>BEST CASE</span><strong>{meta.best}</strong></div>
                <div><span>AVERAGE</span><strong>{meta.average}</strong></div>
                <div><span>WORST CASE</span><strong>{meta.worst}</strong></div>
                <div><span>SPACE</span><strong>{meta.space}</strong></div>
              </div>
              <div className="bs-tags-row">
                <span><Icon>schema</Icon> LINKED LIST</span>
                <span><Icon>arrow_forward</Icon> POINTERS</span>
              </div>
            </div>
          </div>

          <div className="bs-panel bs-code-panel">
            <div className="bs-code-head">
              <h3><Icon>code</Icon> Pseudo Code</h3>
              <span>JAVASCRIPT</span>
            </div>
            <pre>{meta.code}</pre>
          </div>
        </div>

        <div className="bs-controls ll-controls">
          <div className="bs-control-left">
            <button className="bs-outline-btn" onClick={resetState} disabled={running}>
              Generate / Reset
            </button>
            <button className="bs-primary-btn" onClick={handleStart} disabled={running}>
              <Icon>play_arrow</Icon> Start
            </button>
            <button className="bs-muted-btn" onClick={handleStop}>
              <Icon>stop</Icon> Stop
            </button>
            <button className="bs-muted-btn" onClick={() => runOperation("insertion")} disabled={running}>
              Insert
            </button>
            <button className="bs-muted-btn" onClick={() => runOperation("deletion")} disabled={running}>
              Delete
            </button>
            <button className="bs-muted-btn" onClick={() => runOperation("search")} disabled={running}>
              Search
            </button>
          </div>

          <div className="bs-control-right">
            <label className="ll-field">
              <span>Operation</span>
              <select value={operation} onChange={(e) => setOperation(e.target.value)} disabled={running}>
                <option value="traversal">Traversal</option>
                <option value="insertion">Insertion</option>
                <option value="deletion">Deletion</option>
                <option value="search">Search</option>
                <option value="reverse">Reverse</option>
              </select>
            </label>

            <label className="ll-field">
              <span>Value</span>
              <input
                type="number"
                value={nodeValue}
                onChange={(e) => setNodeValue(e.target.value)}
                disabled={running || operation === "traversal" || operation === "deletion" || operation === "reverse"}
              />
            </label>

            <label className="ll-field">
              <span>Index</span>
              <input
                type="number"
                value={position}
                min="0"
                onChange={(e) => setPosition(e.target.value)}
                disabled={running || operation === "traversal" || operation === "search" || operation === "reverse"}
              />
            </label>

            <label className="ll-field ll-speed">
              <span>Speed</span>
              <input type="range" min={0} max={3} step={1} value={speedIndex} onChange={(e) => setSpeedIndex(Number(e.target.value))} />
              <strong>{SPEED_LEVELS[speedIndex].label}</strong>
            </label>

            <div className="bs-stats">
              <div>
                <span>STEPS</span>
                <strong>{steps}</strong>
              </div>
              <div>
                <span>NODES</span>
                <strong>{nodes.length}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className={`ll-message ll-message-${message.type}`}>
          <Icon>{message.type === "success" ? "check_circle" : message.type === "failure" ? "cancel" : message.type === "warning" ? "warning" : "info"}</Icon>
          <span>{message.text}</span>
        </div>

        <div className="bs-visual-wrap">
          <div className="bs-bars ll-visual">
            <div className="bs-dot-bg" />
            <LinkedListViz nodes={nodes} activeIdx={activeIdx} visitedSet={visitedSet} messageType={message.type} />
          </div>

          <div className="bs-log-panel">
            <h3><Icon>terminal</Icon> Live Execution Trace</h3>
            <div className="bs-log-list">
              {logs.map((log, index) => (
                <div className={`bs-log-item ${log.type === "swap" ? "bs-log-swap" : ""}`} key={index}>
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
