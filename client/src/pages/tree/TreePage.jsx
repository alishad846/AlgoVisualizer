import { useState, useRef } from "react";
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
  const result = [];
  function inorder(n) { if(!n) return; inorder(n.left); result.push(n.val); inorder(n.right); }
  function preorder(n) { if(!n) return; result.push(n.val); preorder(n.left); preorder(n.right); }
  function postorder(n) { if(!n) return; postorder(n.left); postorder(n.right); result.push(n.val); }
  function levelorder(n) {
    if(!n) return; const q=[n];
    while(q.length){ const node=q.shift(); result.push(node.val); if(node.left) q.push(node.left); if(node.right) q.push(node.right); }
  }
  if(type==="inorder") inorder(root);
  else if(type==="preorder") preorder(root);
  else if(type==="postorder") postorder(root);
  else levelorder(root);
  return result;
}

function TreeNode({ node, activeSet, depth=0, x=50, spread=25 }) {
  if(!node) return null;
  const lx = x - spread / (depth+1);
  const rx = x + spread / (depth+1);
  const active = activeSet.has(node.val);
  return (
    <g>
      {node.left && <line x1={`${x}%`} y1={depth*70+30} x2={`${lx}%`} y2={(depth+1)*70+30} stroke="var(--border2)" strokeWidth={1.5}/>}
      {node.right && <line x1={`${x}%`} y1={depth*70+30} x2={`${rx}%`} y2={(depth+1)*70+30} stroke="var(--border2)" strokeWidth={1.5}/>}
      <circle cx={`${x}%`} cy={depth*70+30} r={20}
        fill={active?"var(--cyan)":"var(--surface2)"} stroke={active?"var(--cyan)":"var(--border2)"} strokeWidth={2}
        style={{transition:"fill 0.3s"}}/>
      <text x={`${x}%`} y={depth*70+35} textAnchor="middle" fontSize={12} fontWeight="bold"
        fill={active?"#000":"var(--text)"} style={{transition:"fill 0.3s"}}>{node.val}</text>
      {node.left && <TreeNode node={node.left} activeSet={activeSet} depth={depth+1} x={lx} spread={spread}/>}
      {node.right && <TreeNode node={node.right} activeSet={activeSet} depth={depth+1} x={rx} spread={spread}/>}
    </g>
  );
}

export default function TreePage() {
  const { algo } = useParams();
  const explanation = TREE_EXPLANATIONS[algo] || TREE_EXPLANATIONS["inorder"];
  
  const [activeSet, setActiveSet] = useState(new Set());
  const [visited, setVisited] = useState([]);
  
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [stepLog, setStepLog] = useState([]);
  const stopRef = useRef(false);

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
