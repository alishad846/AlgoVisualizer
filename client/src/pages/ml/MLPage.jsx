import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import AppShell from "../../components/AppShell";
import AlgoExplain from "../../components/AlgoExplain";
import StepLog from "../../components/StepLog";
import MultiLangCode from "../../components/MultiLangCode";
import { ML_EXPLANATIONS } from "../../data/algoExplanations";

/* K-Means Clustering */
const COLORS = ["var(--cyan)", "var(--purple)", "var(--green)", "var(--orange)", "var(--yellow)"];

function randPoints(n) {
  return Array.from({length:n},()=>({ x:Math.random()*380+10, y:Math.random()*240+10, cluster:0 }));
}
function randCentroids(k) {
  return Array.from({length:k},(_,i)=>({ x:Math.random()*380+10, y:Math.random()*240+10, id:i }));
}
function dist(a,b){ return Math.sqrt((a.x-b.x)**2+(a.y-b.y)**2); }

/* Linear Regression */
function randRegPoints(n) {
  const slope = (Math.random() * 0.5) + 0.1; // 0.1 to 0.6
  const intercept = Math.random() * 60 + 40; // 40 to 100
  return Array.from({ length: n }, () => {
    const x = Math.random() * 340 + 20;
    const noise = (Math.random() - 0.5) * 50;
    const y = Math.max(15, Math.min(260, slope * x + intercept + noise));
    return { x, y };
  });
}

function linRegSteps(points) {
  const n = points.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (const p of points) {
    sumX += p.x; sumY += p.y; sumXY += p.x * p.y; sumXX += p.x * p.x;
  }
  const meanX = sumX / n;
  const meanY = sumY / n;
  const m_target = (sumXY - n * meanX * meanY) / (sumXX - n * meanX * meanX);
  const b_target = meanY - m_target * meanX;

  const frames = [];
  let m = 0, b = meanY;
  for (let iter = 0; iter < 35; iter++) {
    const alpha = 0.15;
    m = m + alpha * (m_target - m);
    b = b + alpha * (b_target - b);
    const loss = points.reduce((s, p) => s + (p.y - (m * p.x + b)) ** 2, 0) / n;
    frames.push({
      m, b, loss: loss.toFixed(2), iter,
      log: `Epoch ${iter + 1}: MSE Loss = ${loss.toFixed(1)}, Slope = ${m.toFixed(3)}, Intercept = ${b.toFixed(1)}`,
      type: iter === 34 ? "done" : "info"
    });
  }
  return frames;
}

/* Decision Tree Visualization */
const DT_TREE = {
  val: "X > 200?", 
  left: { val: "Y > 150?", left: { val: "Class A", isLeaf:true }, right: { val: "Class B", isLeaf:true } },
  right: { val: "X > 300?", left: { val: "Class C", isLeaf:true }, right: { val: "Class A", isLeaf:true } }
};

function DtNode({ node, activeSet, depth=0, x=50, spread=25 }) {
  if(!node) return null;
  const lx = x - spread / (depth+1);
  const rx = x + spread / (depth+1);
  const active = activeSet.has(node.val);
  
  return (
    <g>
      {node.left && <line x1={`${x}%`} y1={depth*70+20} x2={`${lx}%`} y2={(depth+1)*70+20} stroke="var(--border2)" strokeWidth={1.5}/>}
      {node.right && <line x1={`${x}%`} y1={depth*70+20} x2={`${rx}%`} y2={(depth+1)*70+20} stroke="var(--border2)" strokeWidth={1.5}/>}
      
      <rect x={`${x-10}%`} y={depth*70+5} width="20%" height="30" rx="4"
        fill={active?"var(--active-bg)":node.isLeaf?"var(--surface2)":"var(--surface)"} 
        stroke={active?"var(--active-bg)":"var(--border2)"} strokeWidth={2}
        style={{transition:"all 0.3s"}} />
        
      <text x={`${x}%`} y={depth*70+25} textAnchor="middle" fontSize={11} fontWeight="bold"
        fill={active?"var(--active-text)":"var(--text)"} style={{transition:"fill 0.3s"}}>{node.val}</text>
        
      {node.left && <DtNode node={node.left} activeSet={activeSet} depth={depth+1} x={lx} spread={spread}/>}
      {node.right && <DtNode node={node.right} activeSet={activeSet} depth={depth+1} x={rx} spread={spread}/>}
    </g>
  );
}

export default function MLPage() {
  const { algo } = useParams();
  const explanation = ML_EXPLANATIONS[algo] || ML_EXPLANATIONS["linear-regression"];
  
  const isKMeans = algo==="k-means";
  const isLinReg = algo==="linear-regression";
  const isKnn = algo==="knn";
  const isDt = algo==="decision-tree";

  const [running, setRunning] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const speed = Math.round(200 / speedMultiplier);
  const [stepLog, setStepLog] = useState([]);
  const stopRef = useRef(false);

  useEffect(() => {
    stopRef.current = true;
    setRunning(false);
  }, [algo]);

  // K-Means state
  const K=3;
  const [points, setPoints] = useState(()=>randPoints(40));
  const [centroids, setCentroids] = useState(()=>randCentroids(K));
  const [iter, setIter] = useState(0);

  // Linear Regression state
  const [regPoints, setRegPoints] = useState(()=>randRegPoints(25));
  const [line, setLine] = useState({m:0,b:100});
  const [loss, setLoss] = useState("—");
  const [mlFrames, setMlFrames] = useState(null);
  const [mlFrameIdx, setMlFrameIdx] = useState(-1);

  // KNN state
  const [knnPoints, setKnnPoints] = useState(()=>Array.from({length:30},()=>({ 
    x:Math.random()*350+20, y:Math.random()*220+20, cluster: Math.floor(Math.random()*3) 
  })));
  const [testPoint, setTestPoint] = useState({ x:200, y:120 });
  const [kNeighbors, setKNeighbors] = useState([]);
  const knnK = 5;

  // Decision Tree state
  const [dtActiveSet, setDtActiveSet] = useState(new Set());

  const startKMeans = async () => {
    if(running) return; stopRef.current=false; setRunning(true); setStepLog([]);
    let pts=[...points.map(p=>({...p}))];
    let cents=centroids.map(c=>({...c}));

    setStepLog(prev => [...prev, {text:"Randomly initialized K centroids.", type:"info"}]);
    
    for(let it=0;it<10;it++){
      if(stopRef.current) break;
      // Assign
      pts=pts.map(p=>({ ...p, cluster: cents.reduce((bi,c,i)=>dist(p,c)<dist(p,cents[bi])?i:bi,0) }));
      setPoints(pts.map(p=>({...p}))); setIter(it+1);
      setStepLog(prev => [...prev, {text:`Iteration ${it+1}: Assigned all points to nearest centroid`, type:"compare"}]);
      await new Promise(r=>setTimeout(r,speed*2));
      if(stopRef.current) break;
      // Move centroids
      cents=cents.map((c,ci)=>{
        const cluster=pts.filter(p=>p.cluster===ci);
        if(!cluster.length) return c;
        return { ...c, x:cluster.reduce((s,p)=>s+p.x,0)/cluster.length, y:cluster.reduce((s,p)=>s+p.y,0)/cluster.length };
      });
      setCentroids(cents.map(c=>({...c})));
      setStepLog(prev => [...prev, {text:`Iteration ${it+1}: Moved centroids to cluster means`, type:"swap"}]);
      await new Promise(r=>setTimeout(r,speed*2));
    }
    if(!stopRef.current) setStepLog(prev => [...prev, {text:"K-Means converged!", type:"done"}]);
    setRunning(false);
  };

  const startLinReg = async () => {
    if(running) return; stopRef.current=false; setRunning(true); setStepLog([]);
    const frames = linRegSteps(regPoints);
    setMlFrames(frames); setMlFrameIdx(0);
    for(let i = 0; i < frames.length; i++){
      if(stopRef.current) break;
      const f = frames[i];
      setLine({m:f.m,b:f.b}); setLoss(f.loss); setMlFrameIdx(i);
      setStepLog(prev => [...prev, {text:f.log, type:f.type}]);
      await new Promise(r=>setTimeout(r,speed));
    }
    if(!stopRef.current) {
      setStepLog(prev => [...prev, {text:"Linear Regression converged!", type:"done"}]);
      setMlFrameIdx(frames.length - 1);
    }
    setRunning(false);
  };

  const handleMlPrev = () => {
    if (running || !mlFrames || mlFrameIdx <= 0) return;
    const nextIdx = mlFrameIdx - 1;
    const f = mlFrames[nextIdx];
    setLine({m:f.m, b:f.b}); setLoss(f.loss); setMlFrameIdx(nextIdx);
    setStepLog(mlFrames.slice(0, nextIdx + 1).map(frame => ({ text: frame.log, type: frame.type })));
  };

  const handleMlNext = () => {
    if (running || !mlFrames || mlFrameIdx >= mlFrames.length - 1) return;
    const nextIdx = mlFrameIdx + 1;
    const f = mlFrames[nextIdx];
    setLine({m:f.m, b:f.b}); setLoss(f.loss); setMlFrameIdx(nextIdx);
    setStepLog(mlFrames.slice(0, nextIdx + 1).map(frame => ({ text: frame.log, type: frame.type })));
  };

  const startKnn = async () => {
    if(running) return; stopRef.current=false; setRunning(true); setStepLog([]);
    setKNeighbors([]);
    setStepLog(prev => [...prev, {text:`Testing point at (${Math.round(testPoint.x)}, ${Math.round(testPoint.y)})`, type:"info"}]);
    await new Promise(r=>setTimeout(r,speed));
    
    // Calculate distances
    setStepLog(prev => [...prev, {text:`Calculating distances to all training points...`, type:"info"}]);
    await new Promise(r=>setTimeout(r,speed*2));
    
    const distances = knnPoints.map((p, i) => ({ ...p, d: dist(p, testPoint), idx: i }));
    distances.sort((a,b) => a.d - b.d);
    
    const nearest = distances.slice(0, knnK);
    setKNeighbors(nearest.map(n => n.idx));
    setStepLog(prev => [...prev, {text:`Found ${knnK} nearest neighbors.`, type:"compare"}]);
    
    // Count votes
    const votes = {};
    nearest.forEach(n => {
      votes[n.cluster] = (votes[n.cluster] || 0) + 1;
    });
    const winner = Object.keys(votes).reduce((a,b) => votes[a] > votes[b] ? a : b);
    
    await new Promise(r=>setTimeout(r,speed*2));
    if(!stopRef.current) setStepLog(prev => [...prev, {text:`Majority vote wins! Assigned to Class ${winner}`, type:"done"}]);
    setRunning(false);
  };

  const startDt = async () => {
    if(running) return; stopRef.current=false; setRunning(true); setStepLog([]);
    setDtActiveSet(new Set());
    
    const path = ["X > 200?", "Y > 150?", "Class A"];
    
    for(let i=0; i<path.length; i++){
      if(stopRef.current) break;
      setDtActiveSet(new Set([path[i]]));
      setStepLog(prev => [...prev, {text:`Evaluating node: ${path[i]}`, type: i===path.length-1 ? "done" : "compare"}]);
      await new Promise(r=>setTimeout(r,speed*3));
    }
    setRunning(false);
  };

  const handleStart = () => {
    if(isKMeans) startKMeans();
    else if(isLinReg) startLinReg();
    else if(isKnn) startKnn();
    else if(isDt) startDt();
    else startLinReg();
  };

  return (
    <AppShell breadcrumb={`ML / ${explanation?.title || algo}`}>
      <div className="section-title">{explanation?.title || algo}</div>
      <div className="section-sub">
        {isKMeans?"Watch centroids move until clusters converge":
         isLinReg?"Watch the regression line fit the data iteratively":
         isKnn?"Watch finding the nearest neighbors to a test point":
         "Watch a decision tree traverse a path to classify a sample"}
      </div>

      <div className="controls-bar" style={{marginBottom:12}}>
        {isKMeans && <button className="btn btn-ghost" onClick={()=>{setPoints(randPoints(40));setCentroids(randCentroids(K));setStepLog([{text:"Reset.",type:"info"}]);}} disabled={running}>⟳ Randomize</button>}
        {isLinReg && <button className="btn btn-ghost" onClick={()=>{setRegPoints(randRegPoints(25));setLine({m:0,b:100});setLoss("—");setMlFrames(null);setStepLog([{text:"Dataset randomized.",type:"info"}]);}} disabled={running}>⟳ Randomize</button>}
        {isKnn && <button className="btn btn-ghost" onClick={()=>{
          setTestPoint({x:Math.random()*300+50, y:Math.random()*150+50});
          setKNeighbors([]); setStepLog([{text:"Test point moved.",type:"info"}]);
        }} disabled={running}>⟳ Move Test Point</button>}
        <button className="btn btn-primary" onClick={handleStart} disabled={running}>▶ Start</button>
        <button className="btn btn-danger" onClick={()=>{stopRef.current=true;setRunning(false);}} disabled={!running}>■ Stop</button>
        {isLinReg && (
          <>
            <button className="btn btn-ghost" onClick={handleMlPrev} disabled={running || !mlFrames || mlFrameIdx <= 0} style={{ opacity: (running || !mlFrames || mlFrameIdx <= 0) ? 0.4 : 1 }}>◀ Prev Step</button>
            <button className="btn btn-ghost" onClick={handleMlNext} disabled={running || !mlFrames || mlFrameIdx >= mlFrames.length - 1} style={{ opacity: (running || !mlFrames || mlFrameIdx >= mlFrames.length - 1) ? 0.4 : 1 }}>Next Step ▶</button>
          </>
        )}
        <label>Speed</label>
        <select className="size-select" value={speedMultiplier} onChange={e=>setSpeedMultiplier(+e.target.value)} disabled={running}>
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
          <div className="card" style={{minHeight: 350, display:"flex", flexDirection:"column"}}>
            <svg width="100%" height={isDt ? 280 : 300} style={{display:"block", marginTop: isDt ? 20 : 0}}>
              {/* K-Means */}
              {isKMeans && (<>
                {points.map((p,i)=>(
                  <circle key={i} cx={p.x} cy={p.y} r={5} fill={COLORS[p.cluster%COLORS.length]} opacity={0.7}
                    style={{transition:"cx 0.4s,cy 0.4s,fill 0.4s"}}/>
                ))}
                {centroids.map((c,i)=>(
                  <g key={i}>
                    <circle cx={c.x} cy={c.y} r={10} fill="none" stroke={COLORS[i%COLORS.length]} strokeWidth={2.5}
                      style={{transition:"cx 0.4s,cy 0.4s"}}/>
                    <circle cx={c.x} cy={c.y} r={4} fill={COLORS[i%COLORS.length]}
                      style={{transition:"cx 0.4s,cy 0.4s"}}/>
                  </g>
                ))}
              </>)}

              {/* Linear Regression */}
              {isLinReg && (<>
                {regPoints.map((p,i)=>(
                  <circle key={i} cx={p.x} cy={p.y} r={4} fill="var(--active-bg)" opacity={0.7}/>
                ))}
                <line x1={0} y1={line.b} x2={400} y2={line.m*400+line.b}
                  stroke="var(--orange)" strokeWidth={2}
                  style={{transition:"all 0.2s"}}/>
              </>)}

              {/* KNN */}
              {isKnn && (<>
                {knnPoints.map((p,i)=>(
                  <circle key={i} cx={p.x} cy={p.y} r={6} 
                    fill={COLORS[p.cluster%COLORS.length]} opacity={kNeighbors.includes(i) ? 1 : 0.4}
                    stroke={kNeighbors.includes(i) ? "#fff" : "none"} strokeWidth={1}/>
                ))}
                {/* Connecting lines for nearest */}
                {kNeighbors.map((nIdx, i) => (
                  <line key={`line-${i}`} x1={testPoint.x} y1={testPoint.y} x2={knnPoints[nIdx].x} y2={knnPoints[nIdx].y}
                    stroke="var(--text)" strokeWidth={1} strokeDasharray="4" opacity={0.5} />
                ))}
                {/* Test Point */}
                <circle cx={testPoint.x} cy={testPoint.y} r={8} fill="var(--text)" stroke="var(--bg)" strokeWidth={2}/>
                <text x={testPoint.x+12} y={testPoint.y-12} fill="var(--text)" fontSize={12} fontWeight="bold">Test</text>
              </>)}

              {/* Decision Tree */}
              {isDt && (
                <DtNode node={DT_TREE} activeSet={dtActiveSet} depth={0} x={50} spread={28} />
              )}
            </svg>

            <div style={{padding:"0 16px 16px 16px", display:"flex", justifyContent:"center"}}>
              {isKMeans && <div style={{fontSize:12,color:"var(--muted)"}}>Iteration: <strong style={{color:"var(--cyan)"}}>{iter}</strong> · K={K} clusters</div>}
              {isLinReg && <div style={{fontSize:12,color:"var(--muted)"}}>Loss: <strong style={{color:"var(--orange)"}}>{loss}</strong></div>}
              {isKnn && <div style={{fontSize:12,color:"var(--muted)"}}>K: <strong style={{color:"var(--cyan)"}}>{knnK}</strong> nearest neighbors</div>}
            </div>
          </div>
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
