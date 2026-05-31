import { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import AppShell from "../../components/AppShell";
import AlgoExplain from "../../components/AlgoExplain";
import StepLog from "../../components/StepLog";
import { STACKQUEUE_EXPLANATIONS } from "../../data/algoExplanations";

const COLORS = ["#06b6d4","#8b5cf6","#10b981","#f97316","#ef4444","#eab308","#ec4899"];

function validParenthesesAlgo(str) {
  const frames = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  const stack = [];
  
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === '(' || char === '{' || char === '[') {
      stack.push(char);
      frames.push({ stack: [...stack], activeIdx: i, log: `Pushed '${char}' to stack`, type: "info" });
    } else if (char === ')' || char === '}' || char === ']') {
      if (stack.length === 0) {
        frames.push({ stack: [...stack], activeIdx: i, log: `Stack empty, cannot match '${char}'! Invalid.`, done: true, valid: false, type: "compare" });
        return frames;
      }
      const top = stack[stack.length - 1];
      if (top !== map[char]) {
        frames.push({ stack: [...stack], activeIdx: i, log: `Top is '${top}', doesn't match '${char}'. Invalid.`, done: true, valid: false, type: "compare" });
        return frames;
      }
      stack.pop();
      frames.push({ stack: [...stack], activeIdx: i, log: `Matched '${char}' with '${top}'. Popped stack.`, type: "swap" });
    }
  }
  
  if (stack.length === 0) {
    frames.push({ stack: [...stack], activeIdx: -1, log: `String fully processed. Stack is empty. Valid!`, done: true, valid: true, type: "done" });
  } else {
    frames.push({ stack: [...stack], activeIdx: -1, log: `String processed but stack not empty. Invalid.`, done: true, valid: false, type: "compare" });
  }
  return frames;
}

function nextGreaterAlgo(arr) {
  const frames = [];
  const stack = []; 
  const result = new Array(arr.length).fill(-1);
  
  for (let i = arr.length - 1; i >= 0; i--) {
    frames.push({ arr: [...arr], stack: [...stack], result: [...result], activeI: i, log: `Processing arr[${i}] = ${arr[i]}`, type: "info" });
    
    while (stack.length > 0 && stack[stack.length - 1] <= arr[i]) {
      const popped = stack.pop();
      frames.push({ arr: [...arr], stack: [...stack], result: [...result], activeI: i, log: `Popped ${popped} (<= ${arr[i]})`, type: "compare" });
    }
    
    if (stack.length > 0) {
      result[i] = stack[stack.length - 1];
      frames.push({ arr: [...arr], stack: [...stack], result: [...result], activeI: i, log: `Next greater for ${arr[i]} is ${result[i]}`, type: "swap" });
    } else {
      frames.push({ arr: [...arr], stack: [...stack], result: [...result], activeI: i, log: `Stack empty, next greater for ${arr[i]} is -1`, type: "info" });
    }
    
    stack.push(arr[i]);
    frames.push({ arr: [...arr], stack: [...stack], result: [...result], activeI: i, log: `Pushed ${arr[i]} to stack`, type: "info" });
  }
  frames.push({ arr: [...arr], stack: [...stack], result: [...result], activeI: -1, log: `Finished processing array`, type: "done", done: true });
  return frames;
}

export default function StackQueuePage() {
  const { algo } = useParams();
  const explanation = STACKQUEUE_EXPLANATIONS[algo] || STACKQUEUE_EXPLANATIONS["stack"];
  
  const isQueue = algo === "queue";
  const isStack = algo === "stack";
  const isParens = algo === "valid-parentheses";
  const isNGE = algo === "next-greater";

  // Shared state
  const [items, setItems] = useState([]);
  const [input, setInput] = useState("");
  const [highlighted, setHighlighted] = useState(-1);
  const [stepLog, setStepLog] = useState([]);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(400);
  const stopRef = useRef(false);

  // Parens State
  const [parensStr, setParensStr] = useState("({[]})");
  const [parensActiveIdx, setParensActiveIdx] = useState(-1);

  // NGE State
  const [ngeArr, setNgeArr] = useState([4, 12, 5, 3, 1, 2, 5, 3, 1, 2, 4, 6].slice(0, 7));
  const [ngeResult, setNgeResult] = useState(new Array(7).fill(-1));
  const [ngeActiveIdx, setNgeActiveIdx] = useState(-1);

  const push = () => {
    const val = input.trim() || Math.floor(Math.random()*99)+1;
    setItems(p => isQueue ? [...p, +val] : [+val, ...p]);
    setInput("");
    setStepLog(prev => [...prev, { text: `${isQueue?"Enqueued":"Pushed"}: ${val}`, type: "info" }]);
    setHighlighted(0);
    setTimeout(() => setHighlighted(-1), 600);
  };

  const pop = () => {
    if (!items.length) { setStepLog(prev => [...prev, { text: "Empty!", type: "compare" }]); return; }
    const val = items[0];
    setStepLog(prev => [...prev, { text: `${isQueue?"Dequeued":"Popped"}: ${val}`, type: "swap" }]);
    setHighlighted(0);
    setTimeout(() => { setItems(p => p.slice(1)); setHighlighted(-1); }, 400);
  };

  const startParens = async () => {
    if (running) return;
    stopRef.current = false; setRunning(true);
    setItems([]); setParensActiveIdx(-1); setStepLog([]);
    const frames = validParenthesesAlgo(parensStr);
    for (const f of frames) {
      if (stopRef.current) break;
      setItems(f.stack);
      setParensActiveIdx(f.activeIdx);
      setStepLog(prev => [...prev, { text: f.log, type: f.type }]);
      await new Promise(r => setTimeout(r, speed));
      if (f.done) break;
    }
    setRunning(false);
  };

  const startNGE = async () => {
    if (running) return;
    stopRef.current = false; setRunning(true);
    setItems([]); setNgeResult(new Array(ngeArr.length).fill(-1)); setNgeActiveIdx(-1); setStepLog([]);
    const frames = nextGreaterAlgo(ngeArr);
    for (const f of frames) {
      if (stopRef.current) break;
      setItems(f.stack.slice().reverse()); // Reverse to show top of stack first
      setNgeResult(f.result);
      setNgeActiveIdx(f.activeI);
      setStepLog(prev => [...prev, { text: f.log, type: f.type }]);
      await new Promise(r => setTimeout(r, speed));
      if (f.done) break;
    }
    setRunning(false);
  };

  return (
    <AppShell breadcrumb={`Stack & Queue / ${explanation?.title || algo}`}>
      <div className="section-title">{explanation?.title || "Stack & Queue"}</div>
      <div className="section-sub">
        {isParens ? "Animate bracket matching using a stack" :
         isNGE ? "Find next greater element using a monotonic stack" :
         isQueue ? "First In First Out — Enqueue adds to back, Dequeue removes from front" : 
         "Last In First Out — Push adds to top, Pop removes from top"}
      </div>

      <div className="controls-bar" style={{marginBottom:12}}>
        {(isStack || isQueue) && (
          <>
            <input
              type="number" value={input} placeholder="Value"
              onChange={e=>setInput(e.target.value)}
              style={{width:80,background:"var(--surface2)",border:"1px solid var(--border2)",color:"var(--text)",padding:"6px 8px",borderRadius:8,fontSize:13}}
            />
            <button className="btn btn-primary" onClick={push}>{isQueue?"Enqueue ↓":"Push ↑"}</button>
            <button className="btn btn-danger" onClick={pop} disabled={!items.length}>{isQueue?"Dequeue ↑":"Pop ↑"}</button>
            <button className="btn btn-ghost" onClick={()=>{setItems([]);setStepLog([{text:"Cleared.",type:"info"}]);}}>Clear</button>
          </>
        )}
        
        {isParens && (
          <>
            <input
              type="text" value={parensStr} placeholder="String..."
              onChange={e=>setParensStr(e.target.value)}
              style={{width:120,background:"var(--surface2)",border:"1px solid var(--border2)",color:"var(--text)",padding:"6px 8px",borderRadius:8,fontSize:13}}
            />
            <button className="btn btn-primary" onClick={startParens} disabled={running}>▶ Start</button>
          </>
        )}

        {isNGE && (
          <>
            <button className="btn btn-ghost" onClick={()=>{setNgeArr(Array.from({length:7},()=>Math.floor(Math.random()*20)))}}>⟳ Randomize</button>
            <button className="btn btn-primary" onClick={startNGE} disabled={running}>▶ Start</button>
          </>
        )}

        {(isParens || isNGE) && (
          <>
            <button className="btn btn-danger" onClick={()=>{stopRef.current=true;setRunning(false);}}>■ Stop</button>
            <label>Speed</label>
            <input type="range" className="speed-slider" min={50} max={1000}
              value={speed} onChange={e=>setSpeed(+e.target.value)}/>
            <span style={{fontSize:12,color:"var(--muted)",minWidth:50}}>{speed}ms</span>
          </>
        )}
      </div>

      <div className="viz-layout-3">
        {/* LEFT — Explanation */}
        <div className="viz-left">
          <AlgoExplain explanation={explanation} />
        </div>

        {/* CENTER — Visualizer */}
        <div className="viz-center">
          <div className="card" style={{minHeight:300,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
            
            {/* Parens Specific Visual */}
            {isParens && (
              <div style={{display:"flex", gap:4, marginBottom:32, fontSize:24, fontFamily:"monospace"}}>
                {parensStr.split('').map((char, i) => (
                  <span key={i} style={{ 
                    padding: "4px 8px", 
                    borderRadius: 4,
                    background: i === parensActiveIdx ? "var(--cyan)" : "var(--surface2)",
                    color: i === parensActiveIdx ? "#000" : "var(--text)"
                  }}>
                    {char}
                  </span>
                ))}
              </div>
            )}

            {/* NGE Specific Visual */}
            {isNGE && (
              <div style={{display:"flex", flexDirection:"column", gap:8, marginBottom:32, width:"100%"}}>
                <div style={{display:"flex", gap:8, justifyContent:"center"}}>
                  {ngeArr.map((v, i) => (
                    <div key={i} style={{
                      width:40, height:40, borderRadius:8,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      background: i === ngeActiveIdx ? "var(--cyan)" : "var(--surface2)",
                      color: i === ngeActiveIdx ? "#000" : "var(--text)",
                      border: "1px solid var(--border)", fontWeight:"bold"
                    }}>{v}</div>
                  ))}
                </div>
                <div style={{display:"flex", gap:8, justifyContent:"center"}}>
                  {ngeResult.map((v, i) => (
                    <div key={i} style={{
                      width:40, height:30, borderRadius:4,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      background: "var(--surface)", color: v === -1 ? "var(--muted)" : "var(--green)",
                      border: "1px dashed var(--border)", fontSize: 14
                    }}>{v === -1 ? "?" : v}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Shared Stack/Queue Display */}
            {items.length === 0 ? (
              <div style={{color:"var(--muted)",fontSize:13}}>Empty Stack</div>
            ) : (
              <div style={{display:"flex",flexDirection:isQueue?"row":"column",gap:6,alignItems:"center"}}>
                {items.map((v,i) => (
                  <div key={i} style={{
                    width:isQueue?56:160, height:isQueue?56:40,
                    borderRadius:8, display:"flex",alignItems:"center",justifyContent:"center",
                    fontFamily:"JetBrains Mono,monospace",fontWeight:700,fontSize:14,
                    background: i===highlighted ? "var(--cyan)" : `linear-gradient(135deg,${COLORS[i%COLORS.length]}33,${COLORS[i%COLORS.length]}11)`,
                    border:`1px solid ${COLORS[i%COLORS.length]}66`,
                    color: i===highlighted ? "#000" : COLORS[i%COLORS.length],
                    transition:"all 0.3s", boxShadow: i===0?"0 0 12px rgba(6,182,212,0.3)":"none"
                  }}>{v}</div>
                ))}
                {!isQueue && <div style={{fontSize:11,color:"var(--muted)",marginTop:4}}>↑ TOP</div>}
                {isQueue && <div style={{fontSize:11,color:"var(--muted)",marginLeft:4}}>← FRONT</div>}
              </div>
            )}
            
            {(isStack || isQueue) && (
              <div style={{display:"flex",gap:8,marginTop:16,fontSize:12,color:"var(--muted)"}}>
                <span>Size: <strong style={{color:"var(--cyan)"}}>{items.length}</strong></span>
                {items.length>0 && <span>Top/Front: <strong style={{color:"var(--green)"}}>{items[0]}</strong></span>}
              </div>
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
