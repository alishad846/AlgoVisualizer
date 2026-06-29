import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import AppShell from "../../components/AppShell";
import AlgoExplain from "../../components/AlgoExplain";
import StepLog from "../../components/StepLog";
import { RECURSION_EXPLANATIONS } from "../../data/algoExplanations";
import "./RecursionPage.css";

function Icon({ children, className = "" }) {
  return <span className={`material-symbols-outlined ${className}`}>{children}</span>;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* -- Tower of Hanoi animation -- */
const DISK_COLORS = [
  "#ffffff", "#e2e2e2", "#c4c7c8", "#8e9192", "#6f7273", "#535556", "#353535"
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
  const maxW = 170;
  const labels = ["A", "B", "C"];

  return (
    <div className="hanoi-stage">
      {pegs.map((stack, pi) => (
        <div className="hanoi-peg" key={pi}>
          <div className="hanoi-label">PEG {labels[pi]}</div>
          <div className="hanoi-pole-wrap">
            <div className="hanoi-pole" />
            <div className="hanoi-stack">
              {stack.map((disk) => {
                const width = Math.round((disk / numDisks) * maxW) + 36;

                return (
                  <div
                    className="hanoi-disk"
                    key={disk}
                    style={{
                      width,
                      background: DISK_COLORS[(disk - 1) % DISK_COLORS.length],
                      color: disk <= 3 ? "#2f3131" : "#ffffff",
                    }}
                  >
                    {disk}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="hanoi-base" />
        </div>
      ))}
    </div>
  );
}

/* -- N-Queens -- */
function NQueens({ board }) {
  const n = board.length;
  return (
    <div className="queens-board" style={{ gridTemplateColumns:`repeat(${n}, minmax(0, 1fr))` }}>
      {board.map((row,ri) => row.map((cell,ci) => (
        <div
          className={`queens-cell ${(ri + ci) % 2 === 0 ? "queens-cell-light" : "queens-cell-dark"} ${cell ? "queens-cell-active" : ""}`}
          key={`${ri}-${ci}`}
        >
          {cell ? "Q" : ""}
        </div>
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
    if(row===n){frames.push({board:board.map(r=>[...r]),log:"Solution found!",done:true,type:"done"});return true;}
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

/* -- Rat in a Maze -- */
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
          {ri===0 && ci===0 ? "S" : ri===n-1 && ci===n-1 ? "E" : ""}
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
      frames.push({ path:path.map(row=>[...row]), log:"Reached destination!", done:true, type:"done" });
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

/* -- Subsets Generation -- */
function SubsetsViz({ current, result, nums }) {
  if (!nums) return null;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16, alignItems:"center", width:"100%" }}>
      <div style={{ fontSize:14, color:"var(--muted)" }}>Set: [{nums.join(", ")}]</div>
      <div style={{ fontSize:16, fontWeight:"bold" }}>Current Subset:</div>
      <div style={{ display:"flex", gap:8, minHeight:40 }}>
        {current.length===0 && <span style={{color:"var(--muted)", alignSelf:"center"}}>empty</span>}
        {current.map(v => (
          <div key={v} style={{ width:40,height:40,background:"var(--cyan)",color:"#000",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"bold" }}>{v}</div>
        ))}
      </div>
      <div style={{ width:"100%", height:1, background:"var(--border)" }}/>
      <div style={{ fontSize:16, fontWeight:"bold" }}>Found Subsets ({result.length}):</div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:8, justifyContent:"center" }}>
        {result.map((sub,i) => (
          <div key={i} style={{ padding:"4px 8px", background:"var(--surface2)", borderRadius:4, border:"1px solid var(--border)", fontSize:14 }}>
            {sub.length===0 ? "empty" : `{${sub.join(", ")}}`}
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
      frames.push({ current:[...current], result:result.map(s=>[...s]), log:`Added subset {${current.length===0?"empty":current.join(",")}}`, type:"done" });
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
  const [speed, setSpeed] = useState(400);
  const [speedLabel, setSpeedLabel] = useState("1.0x");
  const [stepLog, setStepLog] = useState([]);
  const [hanoiLogs, setHanoiLogs] = useState([]);
  const [hanoiSteps, setHanoiSteps] = useState(0);
  const [hanoiMovesDone, setHanoiMovesDone] = useState(0);
  const [queenLogs, setQueenLogs] = useState([]);
  const [queenSteps, setQueenSteps] = useState(0);
  const [queenBacktracks, setQueenBacktracks] = useState(0);
  const [diskOpen, setDiskOpen] = useState(false);
  const [queenOpen, setQueenOpen] = useState(false);
  const [speedOpen, setSpeedOpen] = useState(false);
  const stopRef = useRef(false);

  const addHanoiLog = (msg, type = "info") => {
    const time = new Date().toLocaleTimeString([], {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    setHanoiLogs((prev) => [{ time, msg, type }, ...prev].slice(0, 50));
  };

  const resetHanoiStats = () => {
    setHanoiSteps(0);
    setHanoiMovesDone(0);
    setHanoiLogs([]);
  };

  const addQueenLog = (msg, type = "info") => {
    const time = new Date().toLocaleTimeString([], {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    setQueenLogs((prev) => [{ time, msg, type }, ...prev].slice(0, 50));
  };

  const resetQueenStats = () => {
    setQueenSteps(0);
    setQueenBacktracks(0);
    setQueenLogs([]);
  };

  useEffect(() => {
    stopRef.current = true;
    setRunning(false);
    return () => {
      stopRef.current = true;
    };
  }, [algo]);

  const initHanoi = (n = numDisks) => {
    if (running) return;

    setNumDisks(n);
    setPegs([Array.from({length:n},(_,i)=>n-i),[],[]]);
    setStepLog([]);
    resetHanoiStats();
    setDiskOpen(false);
    addHanoiLog(`Tower reset with ${n} disks.`);
  };

  const initMaze = (n) => {
    setMazeN(n);
    const { maze } = solveMazeAlgo(n);
    setMazeData({ maze, path:Array.from({length:n},()=>new Array(n).fill(0)) });
    setStepLog([]);
  };

  const initQueens = (n = queenN) => {
    if (running) return;

    setQueenN(n);
    setBoard(Array.from({length:n},()=>new Array(n).fill(0)));
    setStepLog([]);
    resetQueenStats();
    setQueenOpen(false);
    addQueenLog(`Board reset to ${n} x ${n}.`);
  };

  const startHanoi = async () => {
    if(running) return;
    stopRef.current = false; setRunning(true);
    setStepLog([]);
    resetHanoiStats();
    addHanoiLog(`Starting Tower of Hanoi with ${numDisks} disks.`);
    const moves = hanoiMoves(numDisks, 0, 2, 1);
    const state = [Array.from({length:numDisks},(_,i)=>numDisks-i),[],[]];
    for(const move of moves){
      if(stopRef.current) break;
      const disk = state[move.from].pop();
      state[move.to].push(disk);
      setPegs(state.map(p=>[...p]));
      setHanoiSteps((prev) => prev + 1);
      setHanoiMovesDone((prev) => prev + 1);
      setStepLog(prev => [...prev, { text: `Move disk ${disk} from ${["A","B","C"][move.from]} -> ${["A","B","C"][move.to]}`, type: "info" }]);
      addHanoiLog(`Move disk ${disk} from ${["A","B","C"][move.from]} to ${["A","B","C"][move.to]}`, "swap");
      await sleep(speed);
    }
    if(!stopRef.current) {
      setStepLog(prev => [...prev, { text: `Done! ${moves.length} moves total.`, type: "done" }]);
      addHanoiLog(`Algorithm completed in ${moves.length} moves.`);
    }
    setRunning(false);
  };

  const stopHanoi = () => {
    stopRef.current = true;
    setRunning(false);
    addHanoiLog("Execution interrupted by user.");
  };

  const handleHanoiSpeed = (value, label) => {
    setSpeed(value);
    setSpeedLabel(label);
    setSpeedOpen(false);
  };

  const startQueens = async () => {
    if(running) return;
    stopRef.current = false; setRunning(true);
    setStepLog([]);
    resetQueenStats();
    addQueenLog(`Starting N-Queens search on ${queenN} x ${queenN} board.`);
    setBoard(Array.from({length:queenN},()=>new Array(queenN).fill(0)));
    const frames = solveNQueens(queenN);
    let localSteps = 0;
    let localBacktracks = 0;
    for(const f of frames){
      if(stopRef.current) break;
      setBoard(f.board);
      localSteps += 1;
      setQueenSteps(localSteps);
      if (f.type === "compare") {
        localBacktracks += 1;
        setQueenBacktracks(localBacktracks);
      }
      setStepLog(prev => [...prev, { text: f.log, type: f.type || "info" }]);
      addQueenLog(f.log, f.type === "compare" ? "swap" : f.type || "info");
      await sleep(speed);
      if(f.done) break;
    }
    if(!stopRef.current) {
      addQueenLog("Algorithm completed. Valid queen placement found.");
    }
    setRunning(false);
  };

  const stopQueens = () => {
    stopRef.current = true;
    setRunning(false);
    addQueenLog("Execution interrupted by user.");
  };

  const startMaze = async () => {
    if(running) return;
    stopRef.current = false; setRunning(true);
    setStepLog([]);
    const { frames, maze } = solveMazeAlgo(mazeN);
    for(const f of frames){
      if(stopRef.current) break;
      setMazeData({ maze, path: f.path });
      setStepLog(prev => [...prev, { text: f.log, type: f.type || "info" }]);
      await sleep(speed);
      if(f.done) break;
    }
    setRunning(false);
  };

  const startSubsets = async () => {
    if(running) return;
    stopRef.current = false; setRunning(true);
    setStepLog([]);
    const { frames, nums } = generateSubsetsAlgo(subsetN);
    for(const f of frames){
      if(stopRef.current) break;
      setSubsetData({ current: f.current, result: f.result, nums });
      setStepLog(prev => [...prev, { text: f.log, type: f.type || "info" }]);
      await sleep(speed);
    }
    setRunning(false);
  };

  const isHanoi = algo === "tower-of-hanoi";
  const isQueens = algo === "n-queens";
  const isMaze = algo === "rat-in-maze";
  const isSubsets = algo === "subsets";

  if (isHanoi) {
    return (
      <AppShell breadcrumb="Tower of Hanoi">
        <div className="bs-page">
          <div className="bs-title-row">
            <div>
              <h1>Tower of Hanoi</h1>
              <p>Recursive Puzzle Algorithm</p>
            </div>
          </div>

          <div className="bs-info-grid">
            <div className="bs-left-info">
              <div className="bs-panel">
                <h2>Tower of Hanoi Algorithm</h2>
                <h3>
                  <Icon>info</Icon> Theory
                </h3>
                <p>
                  Tower of Hanoi is a classic recursion problem where disks are moved
                  from a source peg to a destination peg using one auxiliary peg. Only
                  one disk can move at a time, and a larger disk can never sit on top
                  of a smaller disk.
                </p>
              </div>

              <div className="bs-panel">
                <h3>
                  <Icon>analytics</Icon> Complexity Analysis
                </h3>

                <div className="bs-complexity-grid">
                  <div><span>BEST CASE</span><strong>O(2^n)</strong></div>
                  <div><span>AVERAGE</span><strong>O(2^n)</strong></div>
                  <div><span>WORST CASE</span><strong>O(2^n)</strong></div>
                  <div><span>SPACE</span><strong>O(n)</strong></div>
                </div>

                <div className="bs-tags-row">
                  <span><Icon>account_tree</Icon> RECURSIVE</span>
                  <span><Icon>functions</Icon> 2^N - 1 MOVES</span>
                </div>
              </div>
            </div>

            <div className="bs-panel bs-code-panel">
              <div className="bs-code-head">
                <h3><Icon>code</Icon> Pseudo Code</h3>
                <span>JAVASCRIPT</span>
              </div>

              <pre>{`function towerOfHanoi(n, from, to, aux) {
  if (n === 0) return;

  towerOfHanoi(n - 1, from, aux, to);
  moveDisk(n, from, to);
  towerOfHanoi(n - 1, aux, to, from);
}`}</pre>
            </div>
          </div>

          <div className="bs-controls">
            <div className="bs-control-left">
              <button className="bs-outline-btn" onClick={() => initHanoi()} disabled={running}>
                Generate / Reset
              </button>

              <button className="bs-primary-btn" onClick={startHanoi} disabled={running}>
                <Icon>play_arrow</Icon> Start
              </button>

              <button className="bs-muted-btn" onClick={stopHanoi}>
                <Icon>stop</Icon> Stop
              </button>
            </div>

            <div className="bs-control-right">
              <div className="bs-dropdown">
                <button onClick={() => { setDiskOpen(!diskOpen); setSpeedOpen(false); }} disabled={running}>
                  <span>DISKS:</span>
                  <strong>{numDisks}</strong>
                  <Icon>expand_more</Icon>
                </button>

                {diskOpen && (
                  <div className="bs-dropdown-menu">
                    {[3, 4, 5, 6].map((n) => (
                      <button key={n} onClick={() => initHanoi(n)}>{n}</button>
                    ))}
                  </div>
                )}
              </div>

              <div className="bs-dropdown">
                <button onClick={() => { setSpeedOpen(!speedOpen); setDiskOpen(false); }}>
                  <span>SPEED:</span>
                  <strong>{speedLabel}</strong>
                  <Icon>expand_more</Icon>
                </button>

                {speedOpen && (
                  <div className="bs-dropdown-menu">
                    <button onClick={() => handleHanoiSpeed(1000, "0.5x")}>0.5x</button>
                    <button onClick={() => handleHanoiSpeed(400, "1.0x")}>1.0x</button>
                    <button onClick={() => handleHanoiSpeed(250, "1.5x")}>1.5x</button>
                    <button onClick={() => handleHanoiSpeed(100, "2.0x")}>2.0x</button>
                  </div>
                )}
              </div>

              <div className="bs-stats">
                <div>
                  <span>MOVES</span>
                  <strong>{hanoiMovesDone}</strong>
                </div>
                <div>
                  <span>STEPS</span>
                  <strong>{hanoiSteps}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="bs-visual-wrap">
            <div className="bs-bars hanoi-visual">
              <div className="bs-dot-bg" />
              <HanoiViz pegs={pegs} numDisks={numDisks} />
            </div>

            <div className="bs-log-panel">
              <h3><Icon>terminal</Icon> Live Execution Trace</h3>

              <div className="bs-log-list">
                {hanoiLogs.map((log, index) => (
                  <div
                    className={`bs-log-item ${log.type === "swap" ? "bs-log-swap" : ""}`}
                    key={index}
                  >
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

  if (isQueens) {
    return (
      <AppShell breadcrumb="N-Queens">
        <div className="bs-page">
          <div className="bs-title-row">
            <div>
              <h1>N-Queens</h1>
              <p>Backtracking Algorithm</p>
            </div>
          </div>

          <div className="bs-info-grid">
            <div className="bs-left-info">
              <div className="bs-panel">
                <h2>N-Queens Algorithm</h2>
                <h3>
                  <Icon>info</Icon> Theory
                </h3>
                <p>
                  N-Queens places N queens on an N x N chessboard so that no two
                  queens attack each other. The algorithm tries a queen position row
                  by row, continues only when the position is safe, and backtracks
                  when a partial placement cannot lead to a solution.
                </p>
              </div>

              <div className="bs-panel">
                <h3>
                  <Icon>analytics</Icon> Complexity Analysis
                </h3>

                <div className="bs-complexity-grid">
                  <div><span>BEST CASE</span><strong>O(n!)</strong></div>
                  <div><span>AVERAGE</span><strong>O(n!)</strong></div>
                  <div><span>WORST CASE</span><strong>O(n!)</strong></div>
                  <div><span>SPACE</span><strong>O(n^2)</strong></div>
                </div>

                <div className="bs-tags-row">
                  <span><Icon>account_tree</Icon> RECURSIVE</span>
                  <span><Icon>undo</Icon> BACKTRACKING</span>
                </div>
              </div>
            </div>

            <div className="bs-panel bs-code-panel">
              <div className="bs-code-head">
                <h3><Icon>code</Icon> Pseudo Code</h3>
                <span>JAVASCRIPT</span>
              </div>

              <pre>{`function solve(row) {
  if (row === n) return true;

  for (let col = 0; col < n; col++) {
    placeQueen(row, col);

    if (isSafe(row, col)) {
      if (solve(row + 1)) return true;
    }

    removeQueen(row, col);
  }

  return false;
}`}</pre>
            </div>
          </div>

          <div className="bs-controls">
            <div className="bs-control-left">
              <button className="bs-outline-btn" onClick={() => initQueens()} disabled={running}>
                Generate / Reset
              </button>

              <button className="bs-primary-btn" onClick={startQueens} disabled={running}>
                <Icon>play_arrow</Icon> Start
              </button>

              <button className="bs-muted-btn" onClick={stopQueens}>
                <Icon>stop</Icon> Stop
              </button>
            </div>

            <div className="bs-control-right">
              <div className="bs-dropdown">
                <button onClick={() => { setQueenOpen(!queenOpen); setSpeedOpen(false); }} disabled={running}>
                  <span>N:</span>
                  <strong>{queenN}</strong>
                  <Icon>expand_more</Icon>
                </button>

                {queenOpen && (
                  <div className="bs-dropdown-menu">
                    {[4, 5, 6, 7, 8].map((n) => (
                      <button key={n} onClick={() => initQueens(n)}>{n}</button>
                    ))}
                  </div>
                )}
              </div>

              <div className="bs-dropdown">
                <button onClick={() => { setSpeedOpen(!speedOpen); setQueenOpen(false); }}>
                  <span>SPEED:</span>
                  <strong>{speedLabel}</strong>
                  <Icon>expand_more</Icon>
                </button>

                {speedOpen && (
                  <div className="bs-dropdown-menu">
                    <button onClick={() => handleHanoiSpeed(1000, "0.5x")}>0.5x</button>
                    <button onClick={() => handleHanoiSpeed(400, "1.0x")}>1.0x</button>
                    <button onClick={() => handleHanoiSpeed(250, "1.5x")}>1.5x</button>
                    <button onClick={() => handleHanoiSpeed(100, "2.0x")}>2.0x</button>
                  </div>
                )}
              </div>

              <div className="bs-stats">
                <div>
                  <span>BACKTRACKS</span>
                  <strong>{queenBacktracks}</strong>
                </div>
                <div>
                  <span>STEPS</span>
                  <strong>{queenSteps}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="bs-visual-wrap">
            <div className="bs-bars queens-visual">
              <div className="bs-dot-bg" />
              <NQueens board={board} />
            </div>

            <div className="bs-log-panel">
              <h3><Icon>terminal</Icon> Live Execution Trace</h3>

              <div className="bs-log-list">
                {queenLogs.map((log, index) => (
                  <div
                    className={`bs-log-item ${log.type === "swap" ? "bs-log-swap" : ""}`}
                    key={index}
                  >
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

  return (
    <AppShell breadcrumb={`Recursion / ${explanation?.title || algo}`}>
      <div className="section-title">{explanation?.title || "Recursion"}</div>
      <div className="section-sub">Watch recursive calls animate step by step</div>

      <div className="controls-bar" style={{ marginBottom:12 }}>
        {isQueens && (
          <>
            <label>N</label>
            <select className="size-select" value={queenN} onChange={e=>setQueenN(+e.target.value)} disabled={running}>
              {[4,5,6,7,8].map(n=><option key={n} value={n}>{n}</option>)}
            </select>
            <button className="btn btn-primary" onClick={startQueens} disabled={running}>Start</button>
          </>
        )}
        {isMaze && (
          <>
            <label>N</label>
            <select className="size-select" value={mazeN} onChange={e=>initMaze(+e.target.value)} disabled={running}>
              {[4,5,6].map(n=><option key={n} value={n}>{n}</option>)}
            </select>
            <button className="btn btn-primary" onClick={startMaze} disabled={running}>Start</button>
          </>
        )}
        {isSubsets && (
          <>
            <label>N</label>
            <select className="size-select" value={subsetN} onChange={e=>setSubsetN(+e.target.value)} disabled={running}>
              {[2,3,4].map(n=><option key={n} value={n}>{n}</option>)}
            </select>
            <button className="btn btn-primary" onClick={startSubsets} disabled={running}>Start</button>
          </>
        )}
        <button className="btn btn-danger" onClick={()=>{stopRef.current=true;setRunning(false);}}>Stop</button>
        <label>Speed</label>
        <input type="range" className="speed-slider" min={50} max={1000}
          value={speed} onChange={e=>setSpeed(+e.target.value)} />
        <span style={{fontSize:12,color:"var(--muted)",minWidth:50}}>{speed}ms</span>
      </div>

      <div className="viz-layout-3">
        <div className="viz-left">
          <AlgoExplain explanation={explanation} />
        </div>

        <div className="viz-center">
          <div className="card" style={{minHeight: 300, display:"flex", justifyContent:"center", alignItems:"center", padding:"20px 0"}}>
            {isQueens && <NQueens board={board} />}
            {isMaze && <RatInMazeViz maze={mazeData.maze} path={mazeData.path} />}
            {isSubsets && <SubsetsViz current={subsetData.current} result={subsetData.result} nums={subsetData.nums || Array.from({length:subsetN},(_,i)=>i+1)} />}
            {!isQueens && !isMaze && !isSubsets && (
              <div style={{color:"var(--muted)",fontSize:13}}>Select an algorithm from the sidebar.</div>
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
