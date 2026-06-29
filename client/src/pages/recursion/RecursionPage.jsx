import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import AppShell from "../../components/AppShell";
import AlgoExplain from "../../components/AlgoExplain";
import StepLog from "../../components/StepLog";
import { RECURSION_EXPLANATIONS } from "../../data/algoExplanations";

/* ── Tower of Hanoi animation ── */
const DISK_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#8b5cf6", "#ec4899"
];

const ALGOS = {
  "tower-of-hanoi": "Tower of Hanoi",
  "n-queens": "N-Queens",
  "rat-in-maze": "Rat in a Maze",
  subsets: "Subset Generation",
};

function createHanoiPegs(n) {
  return [Array.from({ length: n }, (_, i) => n - i), [], []];
}

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
          <div key={pi} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
            <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>{labels[pi]}</div>
            <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: 4, height: poleH, background: "var(--border2)", borderRadius: 2, position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", zIndex: 0 }} />
              <div style={{ display: "flex", flexDirection: "column-reverse", alignItems: "center", position: "relative", zIndex: 1, gap: 2, minHeight: poleH, justifyContent: "flex-start", paddingBottom: 0 }}>
                {stack.map(d => {
                  const w = Math.round((d / numDisks) * maxW) + 20;
                  return (
                    <div key={d} style={{
                      width: w, height: 20, borderRadius: 4,
                      background: DISK_COLORS[(d - 1) % DISK_COLORS.length],
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, fontWeight: 700, color: "#fff",
                      transition: "all 0.4s ease", boxShadow: "0 2px 8px rgba(0,0,0,0.4)"
                    }}>{d}</div>
                  );
                })}
              </div>
            </div>
            <div style={{ width: maxW + 20, height: 6, background: "var(--border2)", borderRadius: 3, marginTop: 2 }} />
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
    <div style={{ display: "inline-grid", gridTemplateColumns: `repeat(${n},36px)`, gap: 2 }}>
      {board.map((row, ri) => row.map((cell, ci) => (
        <div key={`${ri}-${ci}`} style={{
          width: 36, height: 36, borderRadius: 4,
          background: cell ? "var(--purple)" : ((ri + ci) % 2 === 0 ? "var(--surface2)" : "var(--surface)"),
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, border: "1px solid var(--border)",
          transition: "background 0.3s"
        }}>{cell ? "♛" : ""}</div>
      )))}
    </div>
  );
}

function solveNQueens(n) {
  const frames = [];
  const board = Array.from({ length: n }, () => new Array(n).fill(0));
  function isSafe(row, col) {
    for (let i = 0; i < row; i++) if (board[i][col]) return false;
    for (let i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) if (board[i][j]) return false;
    for (let i = row - 1, j = col + 1; i >= 0 && j < n; i--, j++) if (board[i][j]) return false;
    return true;
  }
  function solve(row) {
    if (row === n) { frames.push({ board: board.map(r => [...r]), log: "Solution found! ♛", done: true, type: "done" }); return true; }
    for (let col = 0; col < n; col++) {
      board[row][col] = 1;
      frames.push({ board: board.map(r => [...r]), log: `Trying row ${row}, col ${col}`, done: false, type: "info" });
      if (isSafe(row, col)) {
        if (solve(row + 1)) return true;
      }
      board[row][col] = 0;
      frames.push({ board: board.map(r => [...r]), log: `Backtrack from row ${row}, col ${col}`, done: false, type: "compare" });
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
    <div style={{ display: "inline-grid", gridTemplateColumns: `repeat(${n},40px)`, gap: 2 }}>
      {maze.map((row, ri) => row.map((cell, ci) => (
        <div key={`${ri}-${ci}`} style={{
          width: 40, height: 40, borderRadius: 4,
          background: path[ri][ci] ? "var(--green)" : cell === 1 ? "var(--border2)" : "var(--surface)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, border: "1px solid var(--border)",
          transition: "background 0.3s"
        }}>
          {ri === 0 && ci === 0 ? "🐁" : ri === n - 1 && ci === n - 1 ? "🧀" : ""}
        </div>
      )))}
    </div>
  );
}

function solveMazeAlgo(n) {
  const frames = [];
  const mazes = {
    4: [[0, 0, 0, 0], [0, 1, 0, 1], [0, 0, 0, 0], [1, 0, 1, 0]],
    5: [[0, 1, 0, 0, 0], [0, 1, 0, 1, 0], [0, 0, 0, 1, 0], [1, 1, 0, 1, 0], [0, 0, 0, 0, 0]],
    6: [[0, 0, 0, 1, 0, 0], [1, 1, 0, 1, 0, 1], [0, 0, 0, 0, 0, 0], [0, 1, 1, 1, 1, 0], [0, 0, 0, 0, 1, 0], [1, 1, 1, 0, 0, 0]]
  };
  const maze = mazes[n] || mazes[4];
  const path = Array.from({ length: n }, () => new Array(n).fill(0));

  function isValid(r, c) {
    return r >= 0 && r < n && c >= 0 && c < n && maze[r][c] === 0 && path[r][c] === 0;
  }

  function solve(r, c) {
    if (r === n - 1 && c === n - 1) {
      path[r][c] = 1;
      frames.push({ path: path.map(row => [...row]), log: `Reached destination! 🧀`, done: true, type: "done" });
      return true;
    }
    if (isValid(r, c)) {
      path[r][c] = 1;
      frames.push({ path: path.map(row => [...row]), log: `Moving to [${r},${c}]`, done: false, type: "info" });

      if (solve(r, c + 1)) return true;
      if (solve(r + 1, c)) return true;
      if (solve(r, c - 1)) return true;
      if (solve(r - 1, c)) return true;

      path[r][c] = 0;
      frames.push({ path: path.map(row => [...row]), log: `Backtracking from [${r},${c}]`, done: false, type: "compare" });
    }
    return false;
  }
  solve(0, 0);
  return { frames, maze };
}

/* ── Subsets Generation ── */
function SubsetsViz({ current, result, nums }) {
  if (!nums) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center", width: "100%" }}>
      <div style={{ fontSize: 14, color: "var(--muted)" }}>Set: [{nums.join(", ")}]</div>
      <div style={{ fontSize: 16, fontWeight: "bold" }}>Current Subset:</div>
      <div style={{ display: "flex", gap: 8, minHeight: 40 }}>
        {current.length === 0 && <span style={{ color: "var(--muted)", alignSelf: "center" }}>∅</span>}
        {current.map(v => (
          <div key={v} style={{ width: 40, height: 40, background: "var(--cyan)", color: "#000", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>{v}</div>
        ))}
      </div>
      <div style={{ width: "100%", height: 1, background: "var(--border)" }} />
      <div style={{ fontSize: 16, fontWeight: "bold" }}>Found Subsets ({result.length}):</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
        {result.map((sub, i) => (
          <div key={i} style={{ padding: "4px 8px", background: "var(--surface2)", borderRadius: 4, border: "1px solid var(--border)", fontSize: 14 }}>
            {sub.length === 0 ? "∅" : `{${sub.join(", ")}}`}
          </div>
        ))}
      </div>
    </div>
  );
}

function generateSubsetsAlgo(n) {
  const frames = [];
  const nums = Array.from({ length: n }, (_, i) => i + 1);
  const result = [];

  function solve(idx, current) {
    if (idx === nums.length) {
      result.push([...current]);
      frames.push({ current: [...current], result: result.map(s => [...s]), log: `Added subset {${current.length === 0 ? "∅" : current.join(",")}}`, type: "done" });
      return;
    }

    frames.push({ current: [...current], result: result.map(s => [...s]), log: `Excluding ${nums[idx]}`, type: "info" });
    solve(idx + 1, current);

    current.push(nums[idx]);
    frames.push({ current: [...current], result: result.map(s => [...s]), log: `Including ${nums[idx]}`, type: "compare" });
    solve(idx + 1, current);

    current.pop();
    frames.push({ current: [...current], result: result.map(s => [...s]), log: `Backtracking from ${nums[idx]}`, type: "swap" });
  }
  solve(0, []);
  return { frames, nums };
}

export default function RecursionPage() {
  const { algo } = useParams();
  const currentAlgo = ALGOS[algo] ? algo : "tower-of-hanoi";
  const explanation = RECURSION_EXPLANATIONS[currentAlgo] || RECURSION_EXPLANATIONS["tower-of-hanoi"];

  const [numDisks, setNumDisks] = useState(4);
  const [queenN, setQueenN] = useState(5);
  const [mazeN, setMazeN] = useState(5);
  const [subsetN, setSubsetN] = useState(3);

  const [pegs, setPegs] = useState(() => createHanoiPegs(4));
  const [board, setBoard] = useState(() => Array.from({ length: 5 }, () => new Array(5).fill(0)));
  const [mazeData, setMazeData] = useState({ maze: null, path: null });
  const [subsetData, setSubsetData] = useState({ current: [], result: [], nums: null });

  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(400);
  const [stepLog, setStepLog] = useState([]);
  const speedRef = useRef(speed);
  const runIdRef = useRef(0);
  const runningRef = useRef(false);
  const mountedRef = useRef(true);
  const previousAlgoRef = useRef(currentAlgo);
  const savedStatesRef = useRef({});
  const latestStateRef = useRef({
    numDisks,
    queenN,
    mazeN,
    subsetN,
    pegs,
    board,
    mazeData,
    subsetData,
    stepLog,
  });

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    latestStateRef.current = {
      numDisks,
      queenN,
      mazeN,
      subsetN,
      pegs,
      board,
      mazeData,
      subsetData,
      stepLog,
    };
  }, [
    numDisks,
    queenN,
    mazeN,
    subsetN,
    pegs,
    board,
    mazeData,
    subsetData,
    stepLog,
  ]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      runningRef.current = false;
      runIdRef.current += 1;
    };
  }, []);

  useEffect(() => {
    const previousAlgo = previousAlgoRef.current;

    if (previousAlgo === currentAlgo) {
      return;
    }

    runIdRef.current += 1;
    runningRef.current = false;
    setRunning(false);

    savedStatesRef.current[previousAlgo] = {
      numDisks: latestStateRef.current.numDisks,
      queenN: latestStateRef.current.queenN,
      mazeN: latestStateRef.current.mazeN,
      subsetN: latestStateRef.current.subsetN,
      pegs: latestStateRef.current.pegs.map((peg) => [...peg]),
      board: latestStateRef.current.board.map((row) => [...row]),
      mazeData: {
        maze: latestStateRef.current.mazeData.maze
          ? latestStateRef.current.mazeData.maze.map((row) => [...row])
          : null,
        path: latestStateRef.current.mazeData.path
          ? latestStateRef.current.mazeData.path.map((row) => [...row])
          : null,
      },
      subsetData: {
        current: [...latestStateRef.current.subsetData.current],
        result: latestStateRef.current.subsetData.result.map((subset) => [...subset]),
        nums: latestStateRef.current.subsetData.nums
          ? [...latestStateRef.current.subsetData.nums]
          : null,
      },
      stepLog: [...latestStateRef.current.stepLog],
    };

    const savedState = savedStatesRef.current[currentAlgo];

    if (savedState) {
      setNumDisks(savedState.numDisks);
      setQueenN(savedState.queenN);
      setMazeN(savedState.mazeN);
      setSubsetN(savedState.subsetN);
      setPegs(savedState.pegs.map((peg) => [...peg]));
      setBoard(savedState.board.map((row) => [...row]));
      setMazeData({
        maze: savedState.mazeData.maze
          ? savedState.mazeData.maze.map((row) => [...row])
          : null,
        path: savedState.mazeData.path
          ? savedState.mazeData.path.map((row) => [...row])
          : null,
      });
      setSubsetData({
        current: [...savedState.subsetData.current],
        result: savedState.subsetData.result.map((subset) => [...subset]),
        nums: savedState.subsetData.nums
          ? [...savedState.subsetData.nums]
          : null,
      });

      setStepLog([
        ...savedState.stepLog,
        {
          text: `Returned to ${ALGOS[currentAlgo]}. Previous state restored.`,
          type: "info",
        },
      ]);
    } else {
      setRunning(false);
      setStepLog([
        {
          text: `Switched to ${ALGOS[currentAlgo]}. New visualization created.`,
          type: "info",
        },
      ]);
    }

    previousAlgoRef.current = currentAlgo;
  }, [currentAlgo]);

  const initHanoi = (n) => {
    setNumDisks(n);
    setPegs(createHanoiPegs(n));
    setStepLog([]);
  };

  const initMaze = (n) => {
    setMazeN(n);
    const { maze } = solveMazeAlgo(n);
    setMazeData({ maze, path: Array.from({ length: n }, () => new Array(n).fill(0)) });
    setStepLog([]);
  };

  const startHanoi = async () => {
    if (runningRef.current) return;
    const currentRunId = runIdRef.current + 1;
    runIdRef.current = currentRunId;
    runningRef.current = true;
    setRunning(true);
    setStepLog([]);

    const moves = hanoiMoves(numDisks, 0, 2, 1);
    const state = createHanoiPegs(numDisks);
    setPegs(state.map(p => [...p]));

    for (const move of moves) {
      if (runIdRef.current !== currentRunId || !mountedRef.current) {
        setRunning(false);
        runningRef.current = false;
        return;
      }
      const disk = state[move.from].pop();
      state[move.to].push(disk);
      setPegs(state.map(p => [...p]));
      setStepLog(prev => [...prev, {
        text: `Move disk ${disk} from ${["A", "B", "C"][move.from]} → ${["A", "B", "C"][move.to]}`,
        type: "info"
      }]);
      await new Promise(r => setTimeout(r, speedRef.current));
      if (runIdRef.current !== currentRunId || !mountedRef.current) {
        setRunning(false);
        runningRef.current = false;
        return;
      }
    }

    if (mountedRef.current && runIdRef.current === currentRunId) {
      setStepLog(prev => [...prev, { text: `Done! ${moves.length} moves total.`, type: "done" }]);
      setRunning(false);
      runningRef.current = false;
    }
  };

  const startQueens = async () => {
    if (runningRef.current) return;
    const currentRunId = runIdRef.current + 1;
    runIdRef.current = currentRunId;
    runningRef.current = true;
    setRunning(true);
    setStepLog([]);
    setBoard(Array.from({ length: queenN }, () => new Array(queenN).fill(0)));
    const frames = solveNQueens(queenN);
    for (const f of frames) {
      if (runIdRef.current !== currentRunId || !mountedRef.current) {
        setRunning(false);
        runningRef.current = false;
        return;
      }
      setBoard(f.board);
      setStepLog(prev => [...prev, { text: f.log, type: f.type || "info" }]);
      await new Promise(r => setTimeout(r, speedRef.current));
      if (runIdRef.current !== currentRunId || !mountedRef.current) {
        setRunning(false);
        runningRef.current = false;
        return;
      }
      if (f.done) break;
    }
    if (mountedRef.current && runIdRef.current === currentRunId) {
      setRunning(false);
      runningRef.current = false;
    }
  };

  const startMaze = async () => {
    if (runningRef.current) return;
    const currentRunId = runIdRef.current + 1;
    runIdRef.current = currentRunId;
    runningRef.current = true;
    setRunning(true);
    setStepLog([]);
    const { frames, maze } = solveMazeAlgo(mazeN);
    for (const f of frames) {
      if (runIdRef.current !== currentRunId || !mountedRef.current) {
        setRunning(false);
        runningRef.current = false;
        return;
      }
      setMazeData({ maze, path: f.path });
      setStepLog(prev => [...prev, { text: f.log, type: f.type || "info" }]);
      await new Promise(r => setTimeout(r, speedRef.current));
      if (runIdRef.current !== currentRunId || !mountedRef.current) {
        setRunning(false);
        runningRef.current = false;
        return;
      }
      if (f.done) break;
    }
    if (mountedRef.current && runIdRef.current === currentRunId) {
      setRunning(false);
      runningRef.current = false;
    }
  };

  const startSubsets = async () => {
    if (runningRef.current) return;
    const currentRunId = runIdRef.current + 1;
    runIdRef.current = currentRunId;
    runningRef.current = true;
    setRunning(true);
    setStepLog([]);
    const { frames, nums } = generateSubsetsAlgo(subsetN);
    for (const f of frames) {
      if (runIdRef.current !== currentRunId || !mountedRef.current) {
        setRunning(false);
        runningRef.current = false;
        return;
      }
      setSubsetData({ current: f.current, result: f.result, nums });
      setStepLog(prev => [...prev, { text: f.log, type: f.type || "info" }]);
      await new Promise(r => setTimeout(r, speedRef.current));
      if (runIdRef.current !== currentRunId || !mountedRef.current) {
        setRunning(false);
        runningRef.current = false;
        return;
      }
    }
    if (mountedRef.current && runIdRef.current === currentRunId) {
      setRunning(false);
      runningRef.current = false;
    }
  };

  const isHanoi = currentAlgo === "tower-of-hanoi";
  const isQueens = currentAlgo === "n-queens";
  const isMaze = currentAlgo === "rat-in-maze";
  const isSubsets = currentAlgo === "subsets";

  const handleStop = () => {
    if (!runningRef.current) return;
    runIdRef.current += 1;
    runningRef.current = false;
    setRunning(false);
    setStepLog(prev => [...prev, { text: `${ALGOS[currentAlgo]} stopped by the user.`, type: "warning" }]);
  };

  const handleHanoiDiskChange = (event) => {
    if (runningRef.current) {
      window.alert("Stop the algorithm before changing the number of disks.");
      return;
    }

    runIdRef.current += 1;
    initHanoi(+event.target.value);
  };

  const handleQueenNChange = (event) => {
    if (runningRef.current) {
      window.alert("Stop the algorithm before changing N.");
      return;
    }

    const nextN = +event.target.value;
    runIdRef.current += 1;
    setQueenN(nextN);
    setBoard(Array.from({ length: nextN }, () => new Array(nextN).fill(0)));
    setStepLog([]);
  };

  const handleMazeNChange = (event) => {
    if (runningRef.current) {
      window.alert("Stop the algorithm before changing N.");
      return;
    }

    runIdRef.current += 1;
    initMaze(+event.target.value);
  };

  const handleSubsetNChange = (event) => {
    if (runningRef.current) {
      window.alert("Stop the algorithm before changing N.");
      return;
    }

    const nextN = +event.target.value;
    runIdRef.current += 1;
    setSubsetN(nextN);
    setSubsetData({ current: [], result: [], nums: Array.from({ length: nextN }, (_, i) => i + 1) });
    setStepLog([]);
  };

  const stopButton = (
    <button className="btn btn-danger" onClick={handleStop} disabled={!running}>
      ■ Stop
    </button>
  );

  return (
    <AppShell breadcrumb={`Recursion / ${explanation?.title || currentAlgo}`}>
      <div className="section-title">{explanation?.title || "Recursion"}</div>
      <div className="section-sub">Watch recursive calls animate step by step</div>

      <div className="controls-bar" style={{ marginBottom: 12 }}>
        {isHanoi && (
          <>
            <label>Disks</label>
            <select
              className="size-select"
              value={numDisks}
              onChange={handleHanoiDiskChange}
            >
              {[3, 4, 5, 6].map(n => <option key={n} value={n}>{n}</option>)}
            </select>

            <button
              className="btn btn-primary"
              onClick={startHanoi}
              disabled={running}
            >
              ▶ Start
            </button>

            {stopButton}
          </>
        )}

        {isQueens && (
          <>
            <label>N</label>
            <select className="size-select" value={queenN} onChange={handleQueenNChange}>
              {[4, 5, 6, 7, 8].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <button className="btn btn-primary" onClick={startQueens} disabled={running}>▶ Start</button>
            {stopButton}
          </>
        )}
        {isMaze && (
          <>
            <label>N</label>
            <select className="size-select" value={mazeN} onChange={handleMazeNChange}>
              {[4, 5, 6].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <button className="btn btn-primary" onClick={startMaze} disabled={running}>▶ Start</button>
            {stopButton}
          </>
        )}
        {isSubsets && (
          <>
            <label>N</label>
            <select className="size-select" value={subsetN} onChange={handleSubsetNChange}>
              {[2, 3, 4].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <button className="btn btn-primary" onClick={startSubsets} disabled={running}>▶ Start</button>
            {stopButton}
          </>
        )}

        <label>Speed</label>
        <input type="range" className="speed-slider" min={50} max={1000}
          value={speed} onChange={e => {
            const newSpeed = +e.target.value;
            setSpeed(newSpeed);
            speedRef.current = newSpeed;   //  latest value store
          }}
        />
        <span style={{ fontSize: 12, color: "var(--muted)", minWidth: 50 }}>{speed}ms</span>
      </div>

      <div className="viz-layout-3">
        {/* LEFT — Explanation */}
        <div className="viz-left">
          <AlgoExplain explanation={explanation} />
        </div>

        {/* CENTER — Visualizer */}
        <div className="viz-center">
          <div className="card" style={{ minHeight: 300, display: "flex", justifyContent: "center", alignItems: "center", padding: "20px 0" }}>
            {isHanoi && <HanoiViz pegs={pegs} numDisks={numDisks} />}
            {isQueens && <NQueens board={board} />}
            {isMaze && <RatInMazeViz maze={mazeData.maze} path={mazeData.path} />}
            {isSubsets && <SubsetsViz current={subsetData.current} result={subsetData.result} nums={subsetData.nums || Array.from({ length: subsetN }, (_, i) => i + 1)} />}
            {!isHanoi && !isQueens && !isMaze && !isSubsets && (
              <div style={{ color: "var(--muted)", fontSize: 13 }}>Select an algorithm from the sidebar.</div>
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
