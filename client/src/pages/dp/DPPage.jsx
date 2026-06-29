import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import AppShell from "../../components/AppShell";
import AlgoExplain from "../../components/AlgoExplain";
import StepLog from "../../components/StepLog";
import { DP_EXPLANATIONS } from "../../data/algoExplanations";

/* Fibonacci DP table */
function fibSteps(n) {
  const dp = [0, 1];
  const frames = [{ dp: [...dp], active: 1, log: `Base: fib(0)=0, fib(1)=1`, type: "info" }];
  for (let i = 2; i <= n; i++) {
    dp.push(dp[i - 1] + dp[i - 2]);
    frames.push({ dp: [...dp], active: i, log: `fib(${i}) = fib(${i-1}) + fib(${i-2}) = ${dp[i-1]} + ${dp[i-2]} = ${dp[i]}`, type: "swap" });
  }
  frames.push({ dp: [...dp], active: -1, log: `Done! fib(${n}) = ${dp[n]}`, type: "done", done: true });
  return frames;
}

/* 0/1 Knapsack */
function knapsackSteps(weights, values, cap) {
  const n = weights.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(cap + 1).fill(0));
  const frames = [];
  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= cap; w++) {
      if (weights[i - 1] <= w) {
        dp[i][w] = Math.max(dp[i-1][w], values[i-1] + dp[i-1][w - weights[i-1]]);
        frames.push({ dp: dp.map(r => [...r]), activeI: i, activeW: w, log: `Item ${i} (w=${weights[i-1]}, v=${values[i-1]}) fits in cap ${w}. max(${dp[i-1][w]}, ${values[i-1]}+${dp[i-1][w-weights[i-1]]}) = ${dp[i][w]}`, type: "compare" });
      } else {
        dp[i][w] = dp[i-1][w];
        frames.push({ dp: dp.map(r => [...r]), activeI: i, activeW: w, log: `Item ${i} (w=${weights[i-1]}) > cap ${w}. Carry over ${dp[i-1][w]}`, type: "info" });
      }
    }
  }
  frames.push({ dp: dp.map(r => [...r]), activeI: -1, activeW: -1, log: `Done! Max value is ${dp[n][cap]}`, type: "done", done: true });
  return frames;
}

/* LCS */
function lcsSteps(s1, s2) {
  const m = s1.length, n = s2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  const frames = [];
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i-1][j-1] + 1;
        frames.push({ dp: dp.map(r => [...r]), activeI: i, activeJ: j, log: `'${s1[i-1]}' matches! dp[${i}][${j}] = ${dp[i-1][j-1]} + 1 = ${dp[i][j]}`, type: "swap" });
      } else {
        dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
        frames.push({ dp: dp.map(r => [...r]), activeI: i, activeJ: j, log: `Mismatch '${s1[i-1]}' vs '${s2[j-1]}'. max(${dp[i-1][j]}, ${dp[i][j-1]}) = ${dp[i][j]}`, type: "info" });
      }
    }
  }
  frames.push({ dp: dp.map(r => [...r]), activeI: -1, activeJ: -1, log: `Done! LCS length is ${dp[m][n]}`, type: "done", done: true });
  return frames;
}

/* Coin Change */
function coinChangeSteps(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  const frames = [{ dp: [...dp], active: -1, log: `Base: dp[0] = 0, rest = INF`, type: "info" }];
  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (coin <= i && dp[i - coin] !== Infinity) {
        const old = dp[i];
        dp[i] = Math.min(dp[i], dp[i - coin] + 1);
        frames.push({ dp: [...dp], active: i, log: `Amount ${i}, coin ${coin}: min(${old === Infinity ? "INF" : old}, ${dp[i-coin]}+1) = ${dp[i]}`, type: old !== dp[i] ? "swap" : "compare" });
      } else {
        frames.push({ dp: [...dp], active: i, log: `Amount ${i}, coin ${coin}: Cannot use or no solution for ${i - coin}`, type: "info" });
      }
    }
  }
  const ans = dp[amount] === Infinity ? -1 : dp[amount];
  frames.push({ dp: [...dp], active: -1, log: `Done! Min coins for ${amount} is ${ans}`, type: "done", done: true });
  return frames;
}

const ALGO_NAMES = {
  fibonacci: "Fibonacci",
  knapsack: "0/1 Knapsack",
  lcs: "Longest Common Subsequence",
  "coin-change": "Coin Change",
};

export default function DPPage() {
  const { algo } = useParams();
  const currentAlgo = algo || "fibonacci";
  const explanation = DP_EXPLANATIONS[currentAlgo] || DP_EXPLANATIONS["fibonacci"];
  const isFib = currentAlgo === "fibonacci";
  const isKnapsack = currentAlgo === "knapsack";
  const isLcs = currentAlgo === "lcs";
  const isCoin = currentAlgo === "coin-change";

  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(100);
  const [stepLog, setStepLog] = useState([]);

  const runIdRef = useRef(0);
  const runningRef = useRef(false);
  const mountedRef = useRef(true);
  const speedRef = useRef(speed);

  const savedStatesRef = useRef({});
  const previousAlgoRef = useRef(currentAlgo);

  const [fibN, setFibN] = useState(8);
  const [fibDp, setFibDp] = useState([]);
  const [fibActive, setFibActive] = useState(-1);

  const weights = [2, 3, 4, 5]; const values = [3, 4, 5, 6]; const cap = 8;
  const [knapTable, setKnapTable] = useState([]);
  const [knapActiveCell, setKnapActiveCell] = useState(null);

  const s1 = "ABCD", s2 = "ACBAD";
  const [lcsTable, setLcsTable] = useState([]);
  const [lcsActiveCell, setLcsActiveCell] = useState(null);

  const coins = [1, 2, 5];
  const [coinAmt, setCoinAmt] = useState(7);
  const [coinDp, setCoinDp] = useState([]);
  const [coinActive, setCoinActive] = useState(-1);

  const latestStateRef = useRef({
    fibN, fibDp, fibActive,
    knapTable, knapActiveCell,
    lcsTable, lcsActiveCell,
    coinAmt, coinDp, coinActive,
    stepLog, speed,
  });

  useEffect(() => {
    latestStateRef.current = {
      fibN, fibDp, fibActive,
      knapTable, knapActiveCell,
      lcsTable, lcsActiveCell,
      coinAmt, coinDp, coinActive,
      stepLog, speed,
    };
  }, [fibN, fibDp, fibActive, knapTable, knapActiveCell, lcsTable, lcsActiveCell, coinAmt, coinDp, coinActive, stepLog, speed]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

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
    if (previousAlgo === currentAlgo) return;

    runIdRef.current += 1;
    runningRef.current = false;
    setRunning(false);

    savedStatesRef.current[previousAlgo] = {
      fibN: latestStateRef.current.fibN,
      fibDp: [...latestStateRef.current.fibDp],
      fibActive: latestStateRef.current.fibActive,
      knapTable: latestStateRef.current.knapTable.map(r => [...r]),
      knapActiveCell: latestStateRef.current.knapActiveCell,
      lcsTable: latestStateRef.current.lcsTable.map(r => [...r]),
      lcsActiveCell: latestStateRef.current.lcsActiveCell,
      coinAmt: latestStateRef.current.coinAmt,
      coinDp: [...latestStateRef.current.coinDp],
      coinActive: latestStateRef.current.coinActive,
      stepLog: [...latestStateRef.current.stepLog],
      speed: latestStateRef.current.speed,
    };

    const savedState = savedStatesRef.current[currentAlgo];

    if (savedState) {
      setFibN(savedState.fibN);
      setFibDp(savedState.fibDp);
      setFibActive(savedState.fibActive);
      setKnapTable(savedState.knapTable);
      setKnapActiveCell(savedState.knapActiveCell);
      setLcsTable(savedState.lcsTable);
      setLcsActiveCell(savedState.lcsActiveCell);
      setCoinAmt(savedState.coinAmt);
      setCoinDp(savedState.coinDp);
      setCoinActive(savedState.coinActive);
      setSpeed(savedState.speed);
      speedRef.current = savedState.speed;
      setStepLog([
        ...savedState.stepLog,
        { text: `Returned to ${ALGO_NAMES[currentAlgo] || currentAlgo}. Previous state restored.`, type: "info" },
      ]);
    } else {
      setStepLog([
        { text: `Switched to ${ALGO_NAMES[currentAlgo] || currentAlgo}. New visualization created.`, type: "info" },
      ]);
    }

    previousAlgoRef.current = currentAlgo;
  }, [currentAlgo]);

  const startFib = async (currentRunId) => {
    const frames = fibSteps(fibN);
    setFibDp([]); setFibActive(-1);
    setStepLog([{ text: `Fibonacci (n=${fibN}) started.`, type: "info" }]);
    for (const f of frames) {
      if (runIdRef.current !== currentRunId || !mountedRef.current) return;
      setFibDp(f.dp); setFibActive(f.active);
      setStepLog(prev => [...prev, { text: f.log, type: f.type }]);
      await new Promise(resolve => setTimeout(resolve, speedRef.current));
    }
    if (mountedRef.current && runIdRef.current === currentRunId) {
      runningRef.current = false;
      setRunning(false);
    }
  };

  const startKnapsack = async (currentRunId) => {
    const frames = knapsackSteps(weights, values, cap);
    setKnapTable([]); setKnapActiveCell(null);
    setStepLog([{ text: `0/1 Knapsack started.`, type: "info" }]);
    for (const f of frames) {
      if (runIdRef.current !== currentRunId || !mountedRef.current) return;
      setKnapTable(f.dp); setKnapActiveCell([f.activeI, f.activeW]);
      setStepLog(prev => [...prev, { text: f.log, type: f.type }]);
      await new Promise(resolve => setTimeout(resolve, speedRef.current));
    }
    if (mountedRef.current && runIdRef.current === currentRunId) {
      runningRef.current = false;
      setRunning(false);
    }
  };

  const startLcs = async (currentRunId) => {
    const frames = lcsSteps(s1, s2);
    setLcsTable([]); setLcsActiveCell(null);
    setStepLog([{ text: `LCS started.`, type: "info" }]);
    for (const f of frames) {
      if (runIdRef.current !== currentRunId || !mountedRef.current) return;
      setLcsTable(f.dp); setLcsActiveCell([f.activeI, f.activeJ]);
      setStepLog(prev => [...prev, { text: f.log, type: f.type }]);
      await new Promise(resolve => setTimeout(resolve, speedRef.current));
    }
    if (mountedRef.current && runIdRef.current === currentRunId) {
      runningRef.current = false;
      setRunning(false);
    }
  };

  const startCoin = async (currentRunId) => {
    const frames = coinChangeSteps(coins, coinAmt);
    setCoinDp([]); setCoinActive(-1);
    setStepLog([{ text: `Coin Change (amount=${coinAmt}) started.`, type: "info" }]);
    for (const f of frames) {
      if (runIdRef.current !== currentRunId || !mountedRef.current) return;
      setCoinDp(f.dp); setCoinActive(f.active);
      setStepLog(prev => [...prev, { text: f.log, type: f.type }]);
      await new Promise(resolve => setTimeout(resolve, speedRef.current));
    }
    if (mountedRef.current && runIdRef.current === currentRunId) {
      runningRef.current = false;
      setRunning(false);
    }
  };

  const handleStart = () => {
    if (runningRef.current) return;
    const currentRunId = runIdRef.current + 1;
    runIdRef.current = currentRunId;
    runningRef.current = true;
    setRunning(true);
    if (isFib) startFib(currentRunId);
    else if (isKnapsack) startKnapsack(currentRunId);
    else if (isLcs) startLcs(currentRunId);
    else if (isCoin) startCoin(currentRunId);
    else startFib(currentRunId);
  };

  const stop = () => {
    if (!runningRef.current) return;
    runIdRef.current += 1;
    runningRef.current = false;
    setRunning(false);
    setStepLog(prev => [...prev, { text: `${ALGO_NAMES[currentAlgo] || currentAlgo} stopped by user.`, type: "warning" }]);
  };

  const handleFibNChange = (e) => {
    if (runningRef.current) {
      window.alert("Stop the algorithm before changing n.");
      return;
    }
    runIdRef.current += 1;
    setFibN(+e.target.value);
    setFibDp([]);
    setFibActive(-1);
    setStepLog([{ text: `n changed to ${e.target.value}. Press Start to run.`, type: "info" }]);
  };

  const handleCoinAmtChange = (e) => {
    if (runningRef.current) {
      window.alert("Stop the algorithm before changing the amount.");
      return;
    }
    runIdRef.current += 1;
    setCoinAmt(+e.target.value);
    setCoinDp([]);
    setCoinActive(-1);
    setStepLog([{ text: `Amount changed to ${e.target.value}. Press Start to run.`, type: "info" }]);
  };

  return (
    <AppShell breadcrumb={`DP / ${explanation?.title || currentAlgo}`}>
      <div className="section-title">{explanation?.title || currentAlgo}</div>
      <div className="section-sub">Watch the DP table fill up step by step</div>

      <div className="controls-bar" style={{ marginBottom: 12 }}>
        {isFib && (
          <><label>n</label>
            <select className="size-select" value={fibN} onChange={handleFibNChange}>
              {[8, 10, 12, 15].map(v => <option key={v} value={v}>{v}</option>)}
            </select></>
        )}
        {isCoin && (
          <><label>Amount</label>
            <select className="size-select" value={coinAmt} onChange={handleCoinAmtChange}>
              {[5, 7, 9, 11].map(v => <option key={v} value={v}>{v}</option>)}
            </select></>
        )}
        <button className="btn btn-primary" onClick={handleStart} disabled={running}>Start</button>
        <button className="btn btn-danger" onClick={stop} disabled={!running}>Stop</button>
        <label>Speed</label>
        <input
          type="range"
          className="speed-slider"
          min={50}
          max={1000}
          step={10}
          value={speed}
          onChange={e => {
            const newSpeed = +e.target.value;
            setSpeed(newSpeed);
            speedRef.current = newSpeed;
          }}
        />
        <span style={{ fontSize: 12, color: "var(--muted)", minWidth: 45 }}>{speed}ms</span>
      </div>

      <div className="viz-layout-3">
        <div className="viz-left">
          <AlgoExplain explanation={explanation} />
        </div>

        <div className="viz-center">
          <div className="card" style={{ overflow: "auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, minHeight: 350 }}>

            {isFib && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
                {fibDp.length === 0 && <span style={{ color: "var(--muted)" }}>Press Start</span>}
                {fibDp.map((v, i) => (
                  <div key={i} style={{
                    textAlign: "center", minWidth: 48,
                    padding: "8px 4px", borderRadius: 8,
                    background: i === fibActive ? "var(--cyan)" : "var(--surface2)",
                    border: `1px solid ${i === fibActive ? "var(--cyan)" : "var(--border)"}`,
                    transition: "all 0.3s",
                    color: i === fibActive ? "#000" : "var(--text)"
                  }}>
                    <div style={{ fontSize: 10, color: i === fibActive ? "#0008" : "var(--muted)" }}>n={i}</div>
                    <div style={{ fontWeight: 700, fontFamily: "JetBrains Mono,monospace", fontSize: 13 }}>{v}</div>
                  </div>
                ))}
              </div>
            )}

            {isCoin && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
                {coinDp.length === 0 && <span style={{ color: "var(--muted)" }}>Press Start</span>}
                {coinDp.map((v, i) => (
                  <div key={i} style={{
                    textAlign: "center", minWidth: 48,
                    padding: "8px 4px", borderRadius: 8,
                    background: i === coinActive ? "var(--orange)" : "var(--surface2)",
                    border: `1px solid ${i === coinActive ? "var(--orange)" : "var(--border)"}`,
                    transition: "all 0.3s",
                    color: i === coinActive ? "#000" : "var(--text)"
                  }}>
                    <div style={{ fontSize: 10, color: i === coinActive ? "#0008" : "var(--muted)" }}>amt={i}</div>
                    <div style={{ fontWeight: 700, fontFamily: "JetBrains Mono,monospace", fontSize: 13 }}>{v === Infinity ? "INF" : v}</div>
                  </div>
                ))}
              </div>
            )}

            {isKnapsack && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                {knapTable.length === 0 && <span style={{ color: "var(--muted)" }}>Press Start</span>}
                {knapTable.length > 0 && (
                  <table style={{ borderCollapse: "separate", borderSpacing: 3 }}>
                    <tbody>
                      {knapTable.map((row, i) => (
                        <tr key={i}>
                          {row.map((val, w) => {
                            const isActive = knapActiveCell && knapActiveCell[0] === i && knapActiveCell[1] === w;
                            return (
                              <td key={w} style={{
                                width: 36, height: 32, textAlign: "center", borderRadius: 6,
                                background: isActive ? "var(--cyan)" : val > 0 ? "rgba(16,185,129,0.2)" : "var(--surface2)",
                                color: isActive ? "#000" : val > 0 ? "var(--green)" : "var(--muted)",
                                fontFamily: "JetBrains Mono,monospace", fontSize: 12, fontWeight: 700,
                                transition: "all 0.3s"
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

            {isLcs && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                {lcsTable.length === 0 && <span style={{ color: "var(--muted)" }}>Press Start</span>}
                {lcsTable.length > 0 && (
                  <table style={{ borderCollapse: "separate", borderSpacing: 3 }}>
                    <tbody>
                      <tr>
                        <td></td><td></td>
                        {s2.split("").map((c, j) => <td key={j} style={{ textAlign: "center", fontWeight: "bold", color: "var(--muted)" }}>{c}</td>)}
                      </tr>
                      {lcsTable.map((row, i) => (
                        <tr key={i}>
                          <td style={{ textAlign: "center", fontWeight: "bold", color: "var(--muted)", width: 20 }}>
                            {i > 0 ? s1[i - 1] : ""}
                          </td>
                          {row.map((val, j) => {
                            const isActive = lcsActiveCell && lcsActiveCell[0] === i && lcsActiveCell[1] === j;
                            return (
                              <td key={j} style={{
                                width: 36, height: 32, textAlign: "center", borderRadius: 6,
                                background: isActive ? "var(--cyan)" : val > 0 ? "rgba(139,92,246,0.2)" : "var(--surface2)",
                                color: isActive ? "#000" : val > 0 ? "var(--purple)" : "var(--muted)",
                                fontFamily: "JetBrains Mono,monospace", fontSize: 12, fontWeight: 700,
                                transition: "all 0.3s"
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

        <div className="viz-right">
          <StepLog steps={stepLog} />
        </div>
      </div>
    </AppShell>
  );
}
