import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import AppShell from "../../components/AppShell";
import AlgoExplain from "../../components/AlgoExplain";
import StepLog from "../../components/StepLog";
import MultiLangCode from "../../components/MultiLangCode";
import { DP_EXPLANATIONS } from "../../data/algoExplanations";

/* Fibonacci DP table */
function fibSteps(n) {
  const dp = [0, 1];
  const frames = [{ dp:[...dp], active:1, log:`Base: fib(0)=0, fib(1)=1`, type:"info" }];
  for(let i=2;i<=n;i++){
    dp.push(dp[i-1]+dp[i-2]);
    frames.push({ dp:[...dp], active:i, log:`fib(${i}) = fib(${i-1}) + fib(${i-2}) = ${dp[i-1]} + ${dp[i-2]} = ${dp[i]}`, type:"swap" });
  }
  frames.push({ dp:[...dp], active:-1, log:`Done! fib(${n}) = ${dp[n]}`, type:"done", done:true });
  return frames;
}

/* 0/1 Knapsack */
function knapsackSteps(weights, values, W) {
  const n = weights.length;
  const dp = Array.from({length: n+1}, () => new Array(W+1).fill(0));
  const frames = [{ dp:dp.map(r=>[...r]), activeI:-1, activeW:-1, log:"Base: row 0 and col 0 initialized to 0", type:"info" }];
  
  for(let i=1;i<=n;i++){
    for(let w=1;w<=W;w++){
      if(weights[i-1] <= w){
        dp[i][w] = Math.max(dp[i-1][w], values[i-1] + dp[i-1][w - weights[i-1]]);
        frames.push({ dp:dp.map(r=>[...r]), activeI:i, activeW:w, log:`Item ${i} (w=${weights[i-1]}, v=${values[i-1]}): max(${dp[i-1][w]}, ${values[i-1]}+${dp[i-1][w-weights[i-1]]}) = ${dp[i][w]}`, type:"swap" });
      } else {
        dp[i][w] = dp[i-1][w];
        frames.push({ dp:dp.map(r=>[...r]), activeI:i, activeW:w, log:`Item ${i} too heavy (${weights[i-1]} > ${w}). Copy above: ${dp[i][w]}`, type:"compare" });
      }
    }
  }
  frames.push({ dp:dp.map(r=>[...r]), activeI:-1, activeW:-1, log:`Done! Max value is ${dp[n][W]}`, type:"done", done:true });
  return frames;
}

/* LCS */
function lcsSteps(s1, s2) {
  const m = s1.length, n = s2.length;
  const dp = Array.from({length: m+1}, () => new Array(n+1).fill(0));
  const frames = [{ dp:dp.map(r=>[...r]), activeI:-1, activeJ:-1, log:"Initialize DP table with 0s", type:"info" }];
  
  for(let i=1;i<=m;i++){
    for(let j=1;j<=n;j++){
      if(s1[i-1] === s2[j-1]){
        dp[i][j] = dp[i-1][j-1] + 1;
        frames.push({ dp:dp.map(r=>[...r]), activeI:i, activeJ:j, log:`Match '${s1[i-1]}' == '${s2[j-1]}'. dp[${i}][${j}] = dp[${i-1}][${j-1}] + 1 = ${dp[i][j]}`, type:"swap" });
      } else {
        dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
        frames.push({ dp:dp.map(r=>[...r]), activeI:i, activeJ:j, log:`Mismatch '${s1[i-1]}' vs '${s2[j-1]}'. max(${dp[i-1][j]}, ${dp[i][j-1]}) = ${dp[i][j]}`, type:"info" });
      }
    }
  }
  frames.push({ dp:dp.map(r=>[...r]), activeI:-1, activeJ:-1, log:`Done! LCS length is ${dp[m][n]}`, type:"done", done:true });
  return frames;
}

/* Coin Change */
function coinChangeSteps(coins, amount) {
  const dp = new Array(amount+1).fill(Infinity);
  dp[0] = 0;
  const frames = [{ dp:[...dp], active:-1, log:`Base: dp[0] = 0, rest = ∞`, type:"info" }];
  
  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (coin <= i && dp[i-coin] !== Infinity) {
        const old = dp[i];
        dp[i] = Math.min(dp[i], dp[i-coin] + 1);
        frames.push({ dp:[...dp], active:i, log:`Amount ${i}, coin ${coin}: min(${old===Infinity?"∞":old}, ${dp[i-coin]}+1) = ${dp[i]}`, type: old !== dp[i] ? "swap" : "compare" });
      } else {
        frames.push({ dp:[...dp], active:i, log:`Amount ${i}, coin ${coin}: Cannot use or no solution for ${i-coin}`, type:"info" });
      }
    }
  }
  const ans = dp[amount] === Infinity ? -1 : dp[amount];
  frames.push({ dp:[...dp], active:-1, log:`Done! Min coins for ${amount} is ${ans}`, type:"done", done:true });
  return frames;
}

export default function DPPage() {
  const { algo } = useParams();
  const explanation = DP_EXPLANATIONS[algo] || DP_EXPLANATIONS["fibonacci"];
  const isFib = algo === "fibonacci";
  const isKnapsack = algo === "knapsack";
  const isLcs = algo === "lcs";
  const isCoin = algo === "coin-change";

  const [running, setRunning] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const speed = Math.round(200 / speedMultiplier);
  const [stepLog, setStepLog] = useState([]);
  const stopRef = useRef(false);
  const [dpFrames, setDpFrames] = useState(null);
  const [dpFrameIdx, setDpFrameIdx] = useState(-1);

  useEffect(() => {
    stopRef.current = true;
    setRunning(false);
  }, [algo]);

  // Fib state
  const [fibN, setFibN] = useState(8);
  const [fibDp, setFibDp] = useState([]);
  const [fibActive, setFibActive] = useState(-1);

  // Knapsack state
  const weights=[2,3,4,5]; const values=[3,4,5,6]; const cap=8;
  const [knapTable, setKnapTable] = useState([]);
  const [knapActiveCell, setKnapActiveCell] = useState(null);

  // LCS state
  const s1 = "ABCD", s2 = "ACBAD";
  const [lcsTable, setLcsTable] = useState([]);
  const [lcsActiveCell, setLcsActiveCell] = useState(null);

  // Coin state
  const coins = [1, 2, 5];
  const [coinAmt, setCoinAmt] = useState(7);
  const [coinDp, setCoinDp] = useState([]);
  const [coinActive, setCoinActive] = useState(-1);

  const startFib = async () => {
    if(running) return; stopRef.current=false; setRunning(true); setStepLog([]);
    const frames = fibSteps(fibN);
    setDpFrames(frames); setDpFrameIdx(0);
    for(let i=0; i<frames.length; i++){
      if(stopRef.current) break;
      const f = frames[i];
      setFibDp(f.dp); setFibActive(f.active); setDpFrameIdx(i);
      setStepLog(prev => [...prev, {text:f.log, type:f.type}]);
      await new Promise(r=>setTimeout(r,speed));
    }
    setRunning(false);
  };

  const startKnapsack = async () => {
    if(running) return; stopRef.current=false; setRunning(true); setStepLog([]);
    const frames = knapsackSteps(weights,values,cap);
    setDpFrames(frames); setDpFrameIdx(0);
    for(let i=0; i<frames.length; i++){
      if(stopRef.current) break;
      const f = frames[i];
      setKnapTable(f.dp); setKnapActiveCell([f.activeI,f.activeW]); setDpFrameIdx(i);
      setStepLog(prev => [...prev, {text:f.log, type:f.type}]);
      await new Promise(r=>setTimeout(r,speed));
    }
    setRunning(false);
  };

  const startLcs = async () => {
    if(running) return; stopRef.current=false; setRunning(true); setStepLog([]);
    const frames = lcsSteps(s1,s2);
    setDpFrames(frames); setDpFrameIdx(0);
    for(let i=0; i<frames.length; i++){
      if(stopRef.current) break;
      const f = frames[i];
      setLcsTable(f.dp); setLcsActiveCell([f.activeI,f.activeJ]); setDpFrameIdx(i);
      setStepLog(prev => [...prev, {text:f.log, type:f.type}]);
      await new Promise(r=>setTimeout(r,speed));
    }
    setRunning(false);
  };

  const startCoin = async () => {
    if(running) return; stopRef.current=false; setRunning(true); setStepLog([]);
    const frames = coinChangeSteps(coins, coinAmt);
    setDpFrames(frames); setDpFrameIdx(0);
    for(let i=0; i<frames.length; i++){
      if(stopRef.current) break;
      const f = frames[i];
      setCoinDp(f.dp); setCoinActive(f.active); setDpFrameIdx(i);
      setStepLog(prev => [...prev, {text:f.log, type:f.type}]);
      await new Promise(r=>setTimeout(r,speed));
    }
    setRunning(false);
  };

  const handleDpPrev = () => {
    if (running || !dpFrames || dpFrameIdx <= 0) return;
    const nextIdx = dpFrameIdx - 1;
    const f = dpFrames[nextIdx];
    setDpFrameIdx(nextIdx);
    if (isFib) { setFibDp(f.dp); setFibActive(f.active); }
    else if (isKnapsack) { setKnapTable(f.dp); setKnapActiveCell([f.activeI, f.activeW]); }
    else if (isLcs) { setLcsTable(f.dp); setLcsActiveCell([f.activeI, f.activeJ]); }
    else if (isCoin) { setCoinDp(f.dp); setCoinActive(f.active); }
    setStepLog(dpFrames.slice(0, nextIdx + 1).map(frame => ({ text: frame.log, type: frame.type })));
  };

  const handleDpNext = () => {
    if (running || !dpFrames || dpFrameIdx >= dpFrames.length - 1) return;
    const nextIdx = dpFrameIdx + 1;
    const f = dpFrames[nextIdx];
    setDpFrameIdx(nextIdx);
    if (isFib) { setFibDp(f.dp); setFibActive(f.active); }
    else if (isKnapsack) { setKnapTable(f.dp); setKnapActiveCell([f.activeI, f.activeW]); }
    else if (isLcs) { setLcsTable(f.dp); setLcsActiveCell([f.activeI, f.activeJ]); }
    else if (isCoin) { setCoinDp(f.dp); setCoinActive(f.active); }
    setStepLog(dpFrames.slice(0, nextIdx + 1).map(frame => ({ text: frame.log, type: frame.type })));
  };

  const handleStart = () => {
    if(isFib) startFib();
    else if(isKnapsack) startKnapsack();
    else if(isLcs) startLcs();
    else if(isCoin) startCoin();
    else startFib();
  };

  return (
    <AppShell breadcrumb={`DP / ${explanation?.title || algo}`}>
      <div className="section-title">{explanation?.title || algo}</div>
      <div className="section-sub">Watch the DP table fill up step by step</div>

      <div className="controls-bar" style={{marginBottom:12}}>
        {isFib && (
          <><label>n</label>
          <select className="size-select" value={fibN} onChange={e=>setFibN(+e.target.value)} disabled={running}>
            {[8,10,12,15].map(v=><option key={v} value={v}>{v}</option>)}
          </select></>
        )}
        {isCoin && (
          <><label>Amount</label>
          <select className="size-select" value={coinAmt} onChange={e=>setCoinAmt(+e.target.value)} disabled={running}>
            {[5,7,9,11].map(v=><option key={v} value={v}>{v}</option>)}
          </select></>
        )}
        <button className="btn btn-primary" onClick={handleStart} disabled={running}>▶ Start</button>
        <button className="btn btn-danger" onClick={()=>{stopRef.current=true;setRunning(false);}} disabled={!running}>■ Stop</button>
        <button className="btn btn-ghost" onClick={handleDpPrev} disabled={running || !dpFrames || dpFrameIdx <= 0} style={{ opacity: (running || !dpFrames || dpFrameIdx <= 0) ? 0.4 : 1 }}>◀ Prev Step</button>
        <button className="btn btn-ghost" onClick={handleDpNext} disabled={running || !dpFrames || dpFrameIdx >= dpFrames.length - 1} style={{ opacity: (running || !dpFrames || dpFrameIdx >= dpFrames.length - 1) ? 0.4 : 1 }}>Next Step ▶</button>
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
          <div className="card" style={{overflow:"auto", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24, minHeight: 350}}>
            
            {/* Fibonacci */}
            {isFib && (
              <div style={{display:"flex",gap:6,flexWrap:"wrap", justifyContent:"center"}}>
                {fibDp.length === 0 && <span style={{color:"var(--muted)"}}>Press Start</span>}
                {fibDp.map((v,i)=>(
                  <div key={i} style={{
                    textAlign:"center",minWidth:48,
                    padding:"8px 4px",borderRadius:8,
                    background:i===fibActive?"var(--active-bg)":"var(--surface2)",
                    border:`1px solid ${i===fibActive?"var(--active-bg)":"var(--border)"}`,
                    transition:"all 0.3s",
                    color:i===fibActive?"var(--active-text)":"var(--text)"
                  }}>
                    <div style={{fontSize:10,color:i===fibActive?"var(--active-text)":"var(--muted)"}}>n={i}</div>
                    <div style={{fontWeight:700,fontFamily:"JetBrains Mono,monospace",fontSize:13}}>{v}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Coin Change */}
            {isCoin && (
              <div style={{display:"flex",gap:6,flexWrap:"wrap", justifyContent:"center"}}>
                {coinDp.length === 0 && <span style={{color:"var(--muted)"}}>Press Start</span>}
                {coinDp.map((v,i)=>(
                  <div key={i} style={{
                    textAlign:"center",minWidth:48,
                    padding:"8px 4px",borderRadius:8,
                    background:i===coinActive?"var(--active-bg)":"var(--surface2)",
                    border:`1px solid ${i===coinActive?"var(--active-bg)":"var(--border)"}`,
                    transition:"all 0.3s",
                    color:i===coinActive?"var(--active-text)":"var(--text)"
                  }}>
                    <div style={{fontSize:10,color:i===coinActive?"var(--active-text)":"var(--muted)"}}>amt={i}</div>
                    <div style={{fontWeight:700,fontFamily:"JetBrains Mono,monospace",fontSize:13}}>{v===Infinity?"∞":v}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Knapsack */}
            {isKnapsack && (
              <div style={{display:"flex", flexDirection:"column", alignItems:"center"}}>
                {knapTable.length === 0 && <span style={{color:"var(--muted)"}}>Press Start</span>}
                {knapTable.length > 0 && (
                  <table style={{borderCollapse:"separate",borderSpacing:3}}>
                    <tbody>
                      {knapTable.map((row,i)=>(
                        <tr key={i}>
                          {row.map((val,w)=>{
                            const isActive = knapActiveCell&&knapActiveCell[0]===i&&knapActiveCell[1]===w;
                            return (
                              <td key={w} style={{
                                width:36,height:32,textAlign:"center",borderRadius:6,
                                background:isActive?"var(--active-bg)":val>0?"var(--surface2)":"var(--surface)",
                                color:isActive?"var(--active-text)":val>0?"var(--green)":"var(--muted)",
                                fontFamily:"JetBrains Mono,monospace",fontSize:12,fontWeight:700,
                                transition:"all 0.3s"
                              }}>{val}</td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* LCS */}
            {isLcs && (
              <div style={{display:"flex", flexDirection:"column", alignItems:"center"}}>
                {lcsTable.length === 0 && <span style={{color:"var(--muted)"}}>Press Start</span>}
                {lcsTable.length > 0 && (
                  <table style={{borderCollapse:"separate",borderSpacing:3}}>
                    <tbody>
                      {/* Header Row */}
                      <tr>
                        <td></td><td></td>
                        {s2.split('').map((c, j) => <td key={j} style={{textAlign:"center", fontWeight:"bold", color:"var(--muted)"}}>{c}</td>)}
                      </tr>
                      {lcsTable.map((row,i)=>(
                        <tr key={i}>
                          <td style={{textAlign:"center", fontWeight:"bold", color:"var(--muted)", width: 20}}>
                            {i > 0 ? s1[i-1] : ''}
                          </td>
                          {row.map((val,j)=>{
                            const isActive = lcsActiveCell&&lcsActiveCell[0]===i&&lcsActiveCell[1]===j;
                            return (
                              <td key={j} style={{
                                width:36,height:32,textAlign:"center",borderRadius:6,
                                background:isActive?"var(--active-bg)":val>0?"var(--surface2)":"var(--surface)",
                                color:isActive?"var(--active-text)":val>0?"var(--purple)":"var(--muted)",
                                fontFamily:"JetBrains Mono,monospace",fontSize:12,fontWeight:700,
                                transition:"all 0.3s"
                              }}>{val}</td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
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
