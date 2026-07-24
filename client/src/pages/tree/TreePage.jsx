import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import AppShell from "../../components/AppShell";
import AlgoExplain from "../../components/AlgoExplain";
import StepLog from "../../components/StepLog";
import MultiLangCode from "../../components/MultiLangCode";
import { TREE_EXPLANATIONS } from "../../data/algoExplanations";
import TreeSvg from "../../components/visualize-shared/TreeSvg.jsx";

/* Simple binary tree node layout */
function randTree(depth = 3) {
  if (depth === 0) return null;
  return {
    val: Math.floor(Math.random() * 90) + 10,
    left: randTree(depth - 1),
    right: randTree(depth - 1)
  };
}


function getTraversal(root, type) {
  const result = [];
  function inorder(n) { if (!n) return; inorder(n.left); result.push(n.val); inorder(n.right); }
  function preorder(n) { if (!n) return; result.push(n.val); preorder(n.left); preorder(n.right); }
  function postorder(n) { if (!n) return; postorder(n.left); postorder(n.right); result.push(n.val); }
  function levelorder(n) {
    if (!n) return; const q = [n];
    while (q.length) { const node = q.shift(); result.push(node.val); if (node.left) q.push(node.left); if (node.right) q.push(node.right); }
  }
  if (type === "inorder") inorder(root);
  else if (type === "preorder") preorder(root);
  else if (type === "postorder") postorder(root);
  else levelorder(root);
  return result;
}

// Converts the page's nested {val,left,right} tree into the flat {nodes,edges} shape
// TreeSvg (and treeAdapter.js, for the custom-code path) both use — see treeAdapter.js's
// treeToNodesEdges for the parallel version operating on trace-derived nodes.
function treeToFlat(node, path = "root", depth = 0) {
  if (!node) return { nodes: [], edges: [] };
  const nodes = [{ id: path, label: String(node.val), depth }];
  const edges = [];
  if (node.left) {
    edges.push({ from: path, to: `${path}L` });
    const sub = treeToFlat(node.left, `${path}L`, depth + 1);
    nodes.push(...sub.nodes);
    edges.push(...sub.edges);
  }
  if (node.right) {
    edges.push({ from: path, to: `${path}R` });
    const sub = treeToFlat(node.right, `${path}R`, depth + 1);
    nodes.push(...sub.nodes);
    edges.push(...sub.edges);
  }
  return { nodes, edges };
}

export default function TreePage() {
  const { algo } = useParams();
  const explanation = TREE_EXPLANATIONS[algo] || TREE_EXPLANATIONS["inorder"];

  const [tree, setTree] = useState(randTree(3));
  const [activeSet, setActiveSet] = useState(new Set());
  const [visited, setVisited] = useState([]);


  const [running, setRunning] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const speed = Math.round(400 / speedMultiplier);
  const [stepLog, setStepLog] = useState([]);
  const stopRef = useRef(false);
  const [treeOrder, setTreeOrder] = useState(null);
  const [treeIdx, setTreeIdx] = useState(-1);

  // See LinkedListPage.jsx / StackQueuePage.jsx for why this is a
  // render-phase reset plus a separate stopRef-only effect rather than one
  // effect calling setState.
  const [prevAlgo, setPrevAlgo] = useState(algo);
  if (algo !== prevAlgo) {
    setPrevAlgo(algo);
    setRunning(false);
    const newTree = randTree(3); // depth 3 ka random tree
    setTree(newTree);
    setActiveSet(new Set());
    setVisited([]);
    setStepLog([{ text: "New tree generated.", type: "info" }]);
  }

  useEffect(() => {
    stopRef.current = true;
  }, [algo]);

  const typeMap = { inorder: "inorder", preorder: "preorder", postorder: "postorder", "level-order": "level" };
  const travType = typeMap[algo] || "inorder";

  const start = async () => {
    if (running) return;
    stopRef.current = false; setRunning(true);
    setActiveSet(new Set()); setVisited([]); setStepLog([]);
    const order = getTraversal(tree, travType === "level" ? "levelorder" : travType);
    setTreeOrder(order); setTreeIdx(0);

    for (let i = 0; i < order.length; i++) {
      if (stopRef.current) break;
      setActiveSet(new Set([order[i]]));
      setVisited(order.slice(0, i + 1));
      setTreeIdx(i);
      setStepLog(prev => [...prev, { text: `Visiting node: ${order[i]}`, type: "compare" }]);
      await new Promise(r => setTimeout(r, speed));
    }
    if (!stopRef.current) {
      setStepLog(prev => [...prev, { text: `${algo} complete: [${order.join(" → ")}]`, type: "done" }]);
      setTreeIdx(order.length - 1);
    }
    setRunning(false);
  };

  const handleTreePrev = () => {
    if (running || !treeOrder || treeIdx <= 0) return;
    const nextIdx = treeIdx - 1;
    setTreeIdx(nextIdx);
    setActiveSet(new Set([treeOrder[nextIdx]]));
    setVisited(treeOrder.slice(0, nextIdx + 1));
    setStepLog(treeOrder.slice(0, nextIdx + 1).map(val => ({ text: `Visiting node: ${val}`, type: "compare" })));
  };

  const handleTreeNext = () => {
    if (running || !treeOrder || treeIdx >= treeOrder.length - 1) return;
    const nextIdx = treeIdx + 1;
    setTreeIdx(nextIdx);
    setActiveSet(new Set([treeOrder[nextIdx]]));
    setVisited(treeOrder.slice(0, nextIdx + 1));
    setStepLog(treeOrder.slice(0, nextIdx + 1).map(val => ({ text: `Visiting node: ${val}`, type: "compare" })));
  };

  return (
    <AppShell breadcrumb={`Tree / ${explanation?.title || algo}`}>
      <div className="section-title">{explanation?.title || algo}</div>
      <div className="section-sub">Watch tree nodes light up as the traversal visits each node</div>

      <div className="controls-bar" style={{ marginBottom: 12 }}>
        <button className="btn btn-primary" onClick={start} disabled={running}>▶ Start</button>
        <button className="btn btn-danger" onClick={() => { stopRef.current = true; setRunning(false); }} disabled={!running}>■ Stop</button>
        <button className="btn btn-ghost" onClick={handleTreePrev} disabled={running || !treeOrder || treeIdx <= 0} style={{ opacity: (running || !treeOrder || treeIdx <= 0) ? 0.4 : 1 }}>◀ Prev Step</button>
        <button className="btn btn-ghost" onClick={handleTreeNext} disabled={running || !treeOrder || treeIdx >= treeOrder.length - 1} style={{ opacity: (running || !treeOrder || treeIdx >= treeOrder.length - 1) ? 0.4 : 1 }}>Next Step ▶</button>
        <button className="btn btn-ghost" disabled={running} onClick={() => {
          setTree(randTree(3));  
          setActiveSet(new Set());
          setVisited([]);
          setTreeOrder(null);
          setStepLog([{ text: "Reset.", type: "info" }]);
        }}>
          ⟳ Reset
        </button>

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
          <AlgoExplain explanation={explanation} stepLog={stepLog} />
        </div>

        {/* CENTER — Visualizer */}
        <div className="viz-center">
          {(() => {
            const { nodes: flatNodes, edges: flatEdges } = treeToFlat(tree);
            const activeValue = activeSet.size > 0 ? String([...activeSet][0]) : null;
            const activeNode = activeValue ? flatNodes.find((n) => n.label === activeValue) : null;
            return (
              <TreeSvg
                nodes={flatNodes}
                edges={flatEdges}
                activeId={activeNode ? activeNode.id : undefined}
                visitedOrder={visited.map(String)}
              />
            );
          })()}
        </div>

        {/* RIGHT — Step Log */}
        <div className="viz-right">
          <StepLog steps={stepLog} />
        </div>
      </div>

      <MultiLangCode algoKey={algo} />
    </AppShell>
  );
}
