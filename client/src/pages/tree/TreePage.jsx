import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import AppShell from "../../components/AppShell";
import AlgoExplain from "../../components/AlgoExplain";
import StepLog from "../../components/StepLog";
import { TREE_EXPLANATIONS } from "../../data/algoExplanations";

/* Simple binary tree node layout */
const SAMPLE_TREE = {
  val: 50,
  left: { val: 30, left: { val: 20, left: null, right: null }, right: { val: 40, left: null, right: null } },
  right: { val: 70, left: { val: 60, left: null, right: null }, right: { val: 80, left: null, right: null } }
};

function getTraversal(root, type) {
  const res = [];
  function dfs(n) {
    if (!n) return;
    if (type === "preorder") res.push(n.val);
    dfs(n.left);
    if (type === "inorder") res.push(n.val);
    dfs(n.right);
    if (type === "postorder") res.push(n.val);
  }
  if (type === "levelorder") {
    const q = [root];
    while (q.length) {
      const cur = q.shift();
      res.push(cur.val);
      if (cur.left) q.push(cur.left);
      if (cur.right) q.push(cur.right);
    }
  } else { dfs(root); }
  return res;
}

function TreeViz({ activeSet, visitedList }) {
  const nodes = [
    { id:50, x:200, y:40 },
    { id:30, x:100, y:100 }, { id:70, x:300, y:100 },
    { id:20, x:50, y:160 }, { id:40, x:150, y:160 },
    { id:60, x:250, y:160 }, { id:80, x:350, y:160 },
  ];
  const edges = [
    [50,30], [50,70], [30,20], [30,40], [70,60], [70,80]
  ];
  return (
    <div style={{ display:"flex", justifyContent:"center", padding:16, background:"var(--bg)", border:"1px solid var(--border)", borderRadius:12 }}>
      <svg width={400} height={200}>
        {edges.map(([p,c],i) => {
          const pn = nodes.find(n=>n.id===p); const cn = nodes.find(n=>n.id===c);
          return <line key={i} x1={pn.x} y1={pn.y} x2={cn.x} y2={cn.y} stroke="var(--border2)" strokeWidth={2}/>;
        })}
        {nodes.map(node => {
          const active = activeSet.has(node.id);
          const visited = visitedList.includes(node.id);
          return (
            <g key={node.id}>
              <circle cx={node.x} cy={node.y} r={20}
                fill={active?"var(--cyan)":"var(--surface2)"} stroke={active?"var(--cyan)":"var(--border2)"} strokeWidth={2}
                style={{ transition:"all 0.3s" }}/>
              <text x={node.x} y={node.y+5} textAnchor="middle" fontWeight="bold" fontFamily="monospace"
                fill={active?"#000":"var(--text)"} style={{transition:"fill 0.3s"}}>{node.val || node.id}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function TreePage() {
  const { algo } = useParams();
  const explanation = TREE_EXPLANATIONS[algo] || TREE_EXPLANATIONS["inorder"];
  
  const [activeSet, setActiveSet] = useState(new Set());
  const [visited, setVisited] = useState([]);
  
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(400);
  const [stepLog, setStepLog] = useState([]);
  const stopRef = useRef(false);

  useEffect(() => {
    stopRef.current = true;
    setRunning(false);
    return () => {
      stopRef.current = true;
    };
  }, [algo]);

  const typeMap = { inorder:"inorder", preorder:"preorder", postorder:"postorder", "level-order":"level" };
  const travType = typeMap[algo] || "inorder";

  const start = async () => {
    if(running) return;
    stopRef.current = false; setRunning(true);
    setActiveSet(new Set()); setVisited([]); setStepLog([]);
    const order = getTraversal(SAMPLE_TREE, travType==="level"?"levelorder":travType);
    for(let i=0;i<order.length;i++){
      if(stopRef.current) break;
      setActiveSet(new Set([order[i]]));
      setVisited(order.slice(0,i+1));
      setStepLog(prev => [...prev, { text: `Visiting node: ${order[i]}`, type: "compare" }]);
      await new Promise(r=>setTimeout(r,speed));
    }
    if(!stopRef.current) { setStepLog(prev => [...prev, { text: `${algo} complete: [${order.join(" → ")}]`, type: "done" }]); }
    setRunning(false);
  };

  return (
    <AppShell breadcrumb={`Tree / ${explanation?.title || algo}`}>
      <div className="section-title">{explanation?.title || algo}</div>
      <div className="section-sub">Watch tree nodes light up as the traversal visits each node</div>

      <div className="controls-bar" style={{marginBottom:12}}>
        <button className="btn btn-primary" onClick={start} disabled={running}>▶ Start</button>
        <button className="btn btn-danger" onClick={()=>{stopRef.current=true;setRunning(false);}}>■ Stop</button>
        <button className="btn btn-ghost" onClick={()=>{setActiveSet(new Set());setVisited([]);setStepLog([{text:"Reset.",type:"info"}]);}}>⟳ Reset</button>
        <label>Speed</label>
        <input type="range" className="speed-slider" min={100} max={1200}
          value={speed} onChange={e=>setSpeed(+e.target.value)}/>
        <span style={{fontSize:12,color:"var(--muted)",minWidth:50}}>{speed}ms</span>
      </div>

      <div className="viz-layout-3">
        {/* LEFT — Explanation */}
        <div className="viz-left">
          <AlgoExplain explanation={explanation} />
        </div>

        {/* CENTER — Visualizer */}
        <div className="viz-center">
          <div className="card" style={{padding:16, minHeight:340}}>
            <svg width="100%" height={320}>
              <TreeNode node={SAMPLE_TREE} activeSet={activeSet} depth={0} x={50} spread={28}/>
            </svg>
          </div>

          {visited.length>0 && (
            <div style={{marginTop:8,display:"flex",flexWrap:"wrap",gap:4, padding: 8}}>
              {visited.map((v,i) => (
                <div key={i} style={{padding:"2px 10px",borderRadius:20,background:"rgba(6,182,212,0.15)",color:"var(--cyan)",fontSize:12,fontWeight:700}}>{v}</div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — Step Log */}
        <div className="viz-right">
          <StepLog steps={stepLog} />
        </div>
      </div>
    </AppShell>
  );
}
