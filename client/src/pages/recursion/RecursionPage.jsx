import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import AppShell from "../../components/AppShell";
import AlgoExplain from "../../components/AlgoExplain";
import StepLog from "../../components/StepLog";
import MultiLangCode from "../../components/MultiLangCode";
import { RECURSION_EXPLANATIONS } from "../../data/algoExplanations";

/* ── Tower of Hanoi animation ── */
const DISK_COLORS = [
  "var(--cyan)","var(--purple)","var(--green)","var(--orange)","var(--yellow)"
];

function hanoiMoves(n, from, to, aux) {
  if (n === 0) return [];
  return [
    ...hanoiMoves(n - 1, from, aux, to),
    { disk: n, from, to },
    ...hanoiMoves(n - 1, aux, to, from),
  ];
}

function HanoiViz({ pegs, numDisks }) {
  const maxW = 110;
  return (
    <div className="hanoi-arena" style={{ display: "flex", justifyContent: "center", gap: 24 }}>
      {pegs.map((stack, pi) => {
        const labels = ["A", "B", "C"];
        const poleH = (numDisks + 1) * 24;
        return (
          <div key={pi} style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:0 }}>
            <div style={{ fontSize:11,color:"var(--muted)",marginBottom:4 }}>{labels[pi]}</div>
            <div style={{ position:"relative",display:"flex",flexDirection:"column",alignItems:"center" }}>
              <div style={{ width:4,height:poleH,background:"var(--border2)",borderRadius:2,position:"absolute",bottom:0,left:"50%",transform:"translateX(-50%)",zIndex:0 }} />
              <div style={{ display:"flex",flexDirection:"column-reverse",alignItems:"center",position:"relative",zIndex:1,gap:2,minHeight:poleH,justifyContent:"flex-start",paddingBottom:0 }}>
                {stack.map(d => {
                  const w = Math.round((d / numDisks) * maxW) + 20;
                  return (
                    <div key={d} style={{
                      width:w, height:20, borderRadius:4,
                      background: "var(--surface2)", border: "1px solid var(--border2)",
                      display:"flex",alignItems:"center",justifyContent:"center",
                      fontSize:11,fontWeight:800,color:"var(--text)",
                      transition:"all 0.4s ease", boxShadow:"0 2px 8px rgba(0,0,0,0.15)"
                    }}>{d}</div>
                  );
                })}
              </div>
            </div>
            <div style={{ width:maxW+20,height:6,background:"var(--border2)",borderRadius:3,marginTop:2 }} />
          </div>
        );
      })}
    </div>
  );
}

/* ── N-Queens ── */
function NQueens({ board }) {
  const n = board.length;
  return (
    <div style={{ display:"inline-grid", gridTemplateColumns:`repeat(${n},36px)`, gap:2 }}>
      {board.map((row,ri) => row.map((cell,ci) => (
        <div key={`${ri}-${ci}`} style={{
          width:36,height:36,borderRadius:4,
          background: cell ? "var(--purple)" : ((ri+ci)%2===0 ? "var(--surface2)" : "var(--surface)"),
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:18,border:"1px solid var(--border)",
          transition:"background 0.3s"
        }}>{cell ? "♛" : ""}</div>
      )))}
    </div>
  );
}

function solveNQueens(n) {
  const frames = [];
  const board = Array.from({length:n},()=>new Array(n).fill(0));
  function isSafe(row,col) {
    for (let i=0;i<row;i++) if(board[i][col]) return false;
    for (let i=row-1,j=col-1;i>=0&&j>=0;i--,j--) if(board[i][j]) return false;
    for (let i=row-1,j=col+1;i>=0&&j<n;i--,j++) if(board[i][j]) return false;
    return true;
  }
  function solve(row) {
    if(row===n){frames.push({board:board.map(r=>[...r]),log:"Solution found! ♛",done:true,type:"done"});return true;}
    for(let col=0;col<n;col++){
      board[row][col]=1;
      frames.push({board:board.map(r=>[...r]),log:`Trying row ${row}, col ${col}`,done:false,type:"info"});
      if(isSafe(row,col)){
        if(solve(row+1)) return true;
      }
      board[row][col]=0;
      frames.push({board:board.map(r=>[...r]),log:`Backtrack from row ${row}, col ${col}`,done:false,type:"compare"});
    }
    return false;
  }
  solve(0);
  return frames;
}

/* ── Rat in a Maze ── */
function RatInMazeViz({ maze, path }) {
  if (!maze || !path) return null;
  const n = maze.length;
  return (
    <div style={{ display:"inline-grid", gridTemplateColumns:`repeat(${n},40px)`, gap:2 }}>
      {maze.map((row,ri) => row.map((cell,ci) => (
        <div key={`${ri}-${ci}`} style={{
          width:40,height:40,borderRadius:4,
          background: path[ri][ci] ? "var(--green)" : cell===1 ? "var(--border2)" : "var(--surface)",
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:20,border:"1px solid var(--border)",
          transition:"background 0.3s"
        }}>
          {ri===0 && ci===0 ? "🐁" : ri===n-1 && ci===n-1 ? "🧀" : ""}
        </div>
      )))}
    </div>
  );
}

function solveMazeAlgo(n) {
  const frames = [];
  const mazes = {
    4: [[0,0,0,0],[0,1,0,1],[0,0,0,0],[1,0,1,0]],
    5: [[0,1,0,0,0],[0,1,0,1,0],[0,0,0,1,0],[1,1,0,1,0],[0,0,0,0,0]],
    6: [[0,0,0,1,0,0],[1,1,0,1,0,1],[0,0,0,0,0,0],[0,1,1,1,1,0],[0,0,0,0,1,0],[1,1,1,0,0,0]]
  };
  const maze = mazes[n] || mazes[4];
  const path = Array.from({length:n},()=>new Array(n).fill(0));
  
  function isValid(r,c) {
    return r>=0 && r<n && c>=0 && c<n && maze[r][c]===0 && path[r][c]===0;
  }
  
  function solve(r, c) {
    if (r===n-1 && c===n-1) {
      path[r][c] = 1;
      frames.push({ path:path.map(row=>[...row]), log:`Reached destination! 🧀`, done:true, type:"done" });
      return true;
    }
    if (isValid(r,c)) {
      path[r][c] = 1;
      frames.push({ path:path.map(row=>[...row]), log:`Moving to [${r},${c}]`, done:false, type:"info" });
      
      if (solve(r, c+1)) return true;
      if (solve(r+1, c)) return true;
      if (solve(r, c-1)) return true;
      if (solve(r-1, c)) return true;
      
      path[r][c] = 0;
      frames.push({ path:path.map(row=>[...row]), log:`Backtracking from [${r},${c}]`, done:false, type:"compare" });
    }
    return false;
  }
  solve(0,0);
  return { frames, maze };
}

/* ── Subsets Generation ── */
function SubsetsViz({ current, result, nums }) {
  if (!nums) return null;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16, alignItems:"center", width:"100%" }}>
      <div style={{ fontSize:14, color:"var(--muted)" }}>Set: [{nums.join(", ")}]</div>
      <div style={{ fontSize:16, fontWeight:"bold" }}>Current Subset:</div>
      <div style={{ display:"flex", gap:8, minHeight:40 }}>
        {current.length===0 && <span style={{color:"var(--muted)", alignSelf:"center"}}>∅</span>}
        {current.map(v => (
          <div key={v} style={{ width:40,height:40,background:"var(--active-bg)",color:"var(--active-text)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"bold" }}>{v}</div>
        ))}
      </div>
      <div style={{ width:"100%", height:1, background:"var(--border)" }}/>
      <div style={{ fontSize:16, fontWeight:"bold" }}>Found Subsets ({result.length}):</div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:8, justifyContent:"center" }}>
        {result.map((sub,i) => (
          <div key={i} style={{ padding:"4px 8px", background:"var(--surface2)", borderRadius:4, border:"1px solid var(--border)", fontSize:14 }}>
            {sub.length===0 ? "∅" : `{${sub.join(", ")}}`}
          </div>
        ))}
      </div>
    </div>
  );
}

function generateSubsetsAlgo(n) {
  const frames = [];
  const nums = Array.from({length:n},(_,i)=>i+1);
  const result = [];
  
  function solve(idx, current) {
    if (idx === nums.length) {
      result.push([...current]);
      frames.push({ current:[...current], result:result.map(s=>[...s]), log:`Added subset {${current.length===0?"∅":current.join(",")}}`, type:"done" });
      return;
    }
    
    frames.push({ current:[...current], result:result.map(s=>[...s]), log:`Excluding ${nums[idx]}`, type:"info" });
    solve(idx+1, current);
    
    current.push(nums[idx]);
    frames.push({ current:[...current], result:result.map(s=>[...s]), log:`Including ${nums[idx]}`, type:"compare" });
    solve(idx+1, current);
    
    current.pop();
    frames.push({ current:[...current], result:result.map(s=>[...s]), log:`Backtracking from ${nums[idx]}`, type:"swap" });
  }
  solve(0, []);
  return { frames, nums };
}

export default function RecursionPage() {
  const { algo } = useParams();
  const explanation = RECURSION_EXPLANATIONS[algo] || RECURSION_EXPLANATIONS["tower-of-hanoi"];

  const [numDisks, setNumDisks] = useState(4);
  const [queenN, setQueenN] = useState(5);
  const [mazeN, setMazeN] = useState(5);
  const [subsetN, setSubsetN] = useState(3);
  
  const [pegs, setPegs] = useState([[4,3,2,1],[],[]]); 
  const [board, setBoard] = useState(() => Array.from({length:5},()=>new Array(5).fill(0)));
  const [mazeData, setMazeData] = useState({ maze:null, path:null });
  const [subsetData, setSubsetData] = useState({ current:[], result:[], nums:null });
  
  const [running, setRunning] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const speed = Math.round(400 / speedMultiplier);
  const [stepLog, setStepLog] = useState([]);
  const stopRef = useRef(false);
  const [recFrames, setRecFrames] = useState(null);
  const [recFrameIdx, setRecFrameIdx] = useState(-1);

  useEffect(() => {
    stopRef.current = true;
    setRunning(false);
  }, [algo]);

  const initHanoi = (n) => {
    setNumDisks(n);
    setPegs([Array.from({length:n},(_,i)=>n-i),[],[]]);
    setStepLog([]);
  };

  const initMaze = (n) => {
    setMazeN(n);
    const { maze } = solveMazeAlgo(n);
    setMazeData({ maze, path:Array.from({length:n},()=>new Array(n).fill(0)) });
    setStepLog([]);
  };

  const startHanoi = async () => {
    if(running) return;
    stopRef.current = false; setRunning(true);
    setStepLog([]);
    const moves = hanoiMoves(numDisks, 0, 2, 1);
    const state = [Array.from({length:numDisks},(_,i)=>numDisks-i),[],[]];
    const hFrames = [{ pegs: state.map(p=>[...p]), log: "Starting Tower of Hanoi", type: "info" }];
    for(const move of moves){
      const disk = state[move.from].pop();
      state[move.to].push(disk);
      hFrames.push({ pegs: state.map(p=>[...p]), log: `Move disk ${disk} from ${["A","B","C"][move.from]} → ${["A","B","C"][move.to]}`, type: "info" });
    }
    hFrames[hFrames.length - 1].type = "done";
    setRecFrames(hFrames); setRecFrameIdx(0);

    for(let i=0; i<hFrames.length; i++){
      if(stopRef.current) break;
      const f = hFrames[i];
      setPegs(f.pegs); setRecFrameIdx(i);
      setStepLog(prev => [...prev, { text: f.log, type: f.type }]);
      await new Promise(r=>setTimeout(r,speed));
    }
    setRunning(false);
  };

  const startQueens = async () => {
    if(running) return;
    stopRef.current = false; setRunning(true);
    setStepLog([]);
    setBoard(Array.from({length:queenN},()=>new Array(queenN).fill(0)));
    const frames = solveNQueens(queenN);
    setRecFrames(frames); setRecFrameIdx(0);
    for(let i=0; i<frames.length; i++){
      if(stopRef.current) break;
      const f = frames[i];
      setBoard(f.board); setRecFrameIdx(i);
      setStepLog(prev => [...prev, { text: f.log, type: f.type || "info" }]);
      await new Promise(r=>setTimeout(r,speed));
      if(f.done) break;
    }
    setRunning(false);
  };

  const startMaze = async () => {
    if(running) return;
    stopRef.current = false; setRunning(true);
    setStepLog([]);
    const { frames, maze } = solveMazeAlgo(mazeN);
    setRecFrames(frames); setRecFrameIdx(0);
    for(let i=0; i<frames.length; i++){
      if(stopRef.current) break;
      const f = frames[i];
      setMazeData({ maze, path: f.path }); setRecFrameIdx(i);
      setStepLog(prev => [...prev, { text: f.log, type: f.type || "info" }]);
      await new Promise(r=>setTimeout(r,speed));
      if(f.done) break;
    }
    setRunning(false);
  };

  const startSubsets = async () => {
    if(running) return;
    stopRef.current = false; setRunning(true);
    setStepLog([]);
    const { frames, nums } = generateSubsetsAlgo(subsetN);
    setRecFrames(frames); setRecFrameIdx(0);
    for(let i=0; i<frames.length; i++){
      if(stopRef.current) break;
      const f = frames[i];
      setSubsetData({ current: f.current, result: f.result, nums }); setRecFrameIdx(i);
      setStepLog(prev => [...prev, { text: f.log, type: f.type || "info" }]);
      await new Promise(r=>setTimeout(r,speed));
    }
    setRunning(false);
  };

  const isHanoi = algo === "tower-of-hanoi";
  const isQueens = algo === "n-queens";
  const isMaze = algo === "rat-in-maze";
  const isSubsets = algo === "subsets";

  const handleRecPrev = () => {
    if (running || !recFrames || recFrameIdx <= 0) return;
    const nextIdx = recFrameIdx - 1;
    const f = recFrames[nextIdx];
    setRecFrameIdx(nextIdx);
    if (isHanoi) setPegs(f.pegs);
    else if (isQueens) setBoard(f.board);
    else if (isMaze) setMazeData(prev => ({ ...prev, path: f.path }));
    else if (isSubsets) setSubsetData(prev => ({ ...prev, current: f.current, result: f.result }));
    setStepLog(recFrames.slice(0, nextIdx + 1).map(frame => ({ text: frame.log, type: frame.type || "info" })));
  };

  const handleRecNext = () => {
    if (running || !recFrames || recFrameIdx >= recFrames.length - 1) return;
    const nextIdx = recFrameIdx + 1;
    const f = recFrames[nextIdx];
    setRecFrameIdx(nextIdx);
    if (isHanoi) setPegs(f.pegs);
    else if (isQueens) setBoard(f.board);
    else if (isMaze) setMazeData(prev => ({ ...prev, path: f.path }));
    else if (isSubsets) setSubsetData(prev => ({ ...prev, current: f.current, result: f.result }));
    setStepLog(recFrames.slice(0, nextIdx + 1).map(frame => ({ text: frame.log, type: frame.type || "info" })));
  };

  return (
    <AppShell breadcrumb={`Recursion / ${explanation?.title || algo}`}>
      <div className="section-title">{explanation?.title || "Recursion"}</div>
      <div className="section-sub">Watch recursive calls animate step by step</div>

      <div className="controls-bar" style={{ marginBottom:12 }}>
        {isHanoi && (
          <>
            <label>Disks</label>
            <select className="size-select" value={numDisks} onChange={e=>{initHanoi(+e.target.value)}} disabled={running}>
              {[3,4,5,6].map(n=><option key={n} value={n}>{n}</option>)}
            </select>
            <button className="btn btn-primary" onClick={startHanoi} disabled={running}>▶ Start</button>
          </>
        )}
        {isQueens && (
          <>
            <label>N</label>
            <select className="size-select" value={queenN} onChange={e=>setQueenN(+e.target.value)} disabled={running}>
              {[4,5,6,7,8].map(n=><option key={n} value={n}>{n}</option>)}
            </select>
            <button className="btn btn-primary" onClick={startQueens} disabled={running}>▶ Start</button>
          </>
        )}
        {isMaze && (
          <>
            <label>N</label>
            <select className="size-select" value={mazeN} onChange={e=>initMaze(+e.target.value)} disabled={running}>
              {[4,5,6].map(n=><option key={n} value={n}>{n}</option>)}
            </select>
            <button className="btn btn-primary" onClick={startMaze} disabled={running}>▶ Start</button>
          </>
        )}
        {isSubsets && (
          <>
            <label>N</label>
            <select className="size-select" value={subsetN} onChange={e=>setSubsetN(+e.target.value)} disabled={running}>
              {[2,3,4].map(n=><option key={n} value={n}>{n}</option>)}
            </select>
            <button className="btn btn-primary" onClick={startSubsets} disabled={running}>▶ Start</button>
          </>
        )}
        <button className="btn btn-danger" onClick={()=>{stopRef.current=true;setRunning(false);}} disabled={!running}>■ Stop</button>
        <button className="btn btn-ghost" onClick={handleRecPrev} disabled={running || !recFrames || recFrameIdx <= 0} style={{ opacity: (running || !recFrames || recFrameIdx <= 0) ? 0.4 : 1 }}>◀ Prev Step</button>
        <button className="btn btn-ghost" onClick={handleRecNext} disabled={running || !recFrames || recFrameIdx >= recFrames.length - 1} style={{ opacity: (running || !recFrames || recFrameIdx >= recFrames.length - 1) ? 0.4 : 1 }}>Next Step ▶</button>
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
          <div className="card" style={{minHeight: 300, display:"flex", justifyContent:"center", alignItems:"center", padding:"20px 0"}}>
            {isHanoi && <HanoiViz pegs={pegs} numDisks={numDisks} />}
            {isQueens && <NQueens board={board} />}
            {isMaze && <RatInMazeViz maze={mazeData.maze} path={mazeData.path} />}
            {isSubsets && <SubsetsViz current={subsetData.current} result={subsetData.result} nums={subsetData.nums || Array.from({length:subsetN},(_,i)=>i+1)} />}
            {!isHanoi && !isQueens && !isMaze && !isSubsets && (
              <div style={{color:"var(--muted)",fontSize:13}}>Select an algorithm from the sidebar.</div>
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
