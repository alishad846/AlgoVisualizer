import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import AppShell from "../../components/AppShell";
import AlgoExplain from "../../components/AlgoExplain";
import StepLog from "../../components/StepLog";
import MultiLangCode from "../../components/MultiLangCode";
import { DP_EXPLANATIONS } from "../../data/algoExplanations";
import "./DPPage.css";

function Icon({ children, className = "" }) {
  return <span className={`material-symbols-outlined ${className}`}>{children}</span>;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function fibSteps(n) {
  const dp = [0, 1];
  const frames = [{ dp: [...dp], active: 1, log: "Base: fib(0)=0, fib(1)=1", type: "info" }];

  for (let i = 2; i <= n; i++) {
    dp.push(dp[i - 1] + dp[i - 2]);
    frames.push({
      dp: [...dp],
      active: i,
      log: `fib(${i}) = fib(${i - 1}) + fib(${i - 2}) = ${dp[i - 1]} + ${dp[i - 2]} = ${dp[i]}`,
      type: "swap",
    });
  }

  frames.push({ dp: [...dp], active: -1, log: `Done! fib(${n}) = ${dp[n]}`, type: "done", done: true });
  return frames;
}

function FibonacciViz({ dp, active }) {
  return (
    <div className="fib-strip">
      {dp.length === 0 && <span className="fib-empty">Press Start</span>}
      {dp.map((value, index) => (
        <div className={`fib-card ${index === active ? "fib-card-active" : ""}`} key={index}>
          <span>n={index}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}

function knapsackSteps(weights, values, W) {
  const n = weights.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0));
  const frames = [{ dp: dp.map((r) => [...r]), activeI: -1, activeW: -1, log: "Base: row 0 and col 0 initialized to 0", type: "info" }];

  for (let i = 1; i <= n; i++) {
    for (let w = 1; w <= W; w++) {
      if (weights[i - 1] <= w) {
        dp[i][w] = Math.max(dp[i - 1][w], values[i - 1] + dp[i - 1][w - weights[i - 1]]);
        frames.push({
          dp: dp.map((r) => [...r]),
          activeI: i,
          activeW: w,
          log: `Item ${i} (w=${weights[i - 1]}, v=${values[i - 1]}): max(${dp[i - 1][w]}, ${values[i - 1]}+${dp[i - 1][w - weights[i - 1]]}) = ${dp[i][w]}`,
          type: "swap",
        });
      } else {
        dp[i][w] = dp[i - 1][w];
        frames.push({
          dp: dp.map((r) => [...r]),
          activeI: i,
          activeW: w,
          log: `Item ${i} too heavy (${weights[i - 1]} > ${w}). Copy above: ${dp[i][w]}`,
          type: "compare",
        });
      }
    }
  }

  frames.push({ dp: dp.map((r) => [...r]), activeI: -1, activeW: -1, log: `Done! Max value is ${dp[n][W]}`, type: "done", done: true });
  return frames;
}

function lcsSteps(s1, s2) {
  const m = s1.length;
  const n = s2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  const frames = [{ dp: dp.map((r) => [...r]), activeI: -1, activeJ: -1, log: "Initialize DP table with 0s", type: "info" }];

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
        frames.push({
          dp: dp.map((r) => [...r]),
          activeI: i,
          activeJ: j,
          log: `Match '${s1[i - 1]}' == '${s2[j - 1]}'. dp[${i}][${j}] = dp[${i - 1}][${j - 1}] + 1 = ${dp[i][j]}`,
          type: "swap",
        });
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        frames.push({
          dp: dp.map((r) => [...r]),
          activeI: i,
          activeJ: j,
          log: `Mismatch '${s1[i - 1]}' vs '${s2[j - 1]}'. max(${dp[i - 1][j]}, ${dp[i][j - 1]}) = ${dp[i][j]}`,
          type: "info",
        });
      }
    }
  }

  frames.push({ dp: dp.map((r) => [...r]), activeI: -1, activeJ: -1, log: `Done! LCS length is ${dp[m][n]}`, type: "done", done: true });
  return frames;
}

function coinChangeSteps(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  const frames = [{ dp: [...dp], active: -1, log: "Base: dp[0] = 0, rest = infinity", type: "info" }];

  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (coin <= i && dp[i - coin] !== Infinity) {
        const old = dp[i];
        dp[i] = Math.min(dp[i], dp[i - coin] + 1);
        frames.push({
          dp: [...dp],
          active: i,
          log: `Amount ${i}, coin ${coin}: min(${old === Infinity ? "infinity" : old}, ${dp[i - coin]}+1) = ${dp[i]}`,
          type: old !== dp[i] ? "swap" : "compare",
        });
      } else {
        frames.push({ dp: [...dp], active: i, log: `Amount ${i}, coin ${coin}: Cannot use or no solution for ${i - coin}`, type: "info" });
      }
    }
  }

  const ans = dp[amount] === Infinity ? -1 : dp[amount];
  frames.push({ dp: [...dp], active: -1, log: `Done! Min coins for ${amount} is ${ans}`, type: "done", done: true });
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
  const [speed, setSpeed] = useState(100);
  const [speedLabel, setSpeedLabel] = useState("2.0x");
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [stepLog, setStepLog] = useState([]);
  const stopRef = useRef(false);
  const [dpFrames, setDpFrames] = useState(null);
  const [dpFrameIdx, setDpFrameIdx] = useState(-1);

  useEffect(() => {
    stopRef.current = true;
    setRunning(false);
  }, [algo]);

  const [fibN, setFibN] = useState(8);
  const [fibDp, setFibDp] = useState([]);
  const [fibActive, setFibActive] = useState(-1);
  const [fibLogs, setFibLogs] = useState([]);
  const [fibStepsDone, setFibStepsDone] = useState(0);
  const [fibUpdates, setFibUpdates] = useState(0);
  const [fibOpen, setFibOpen] = useState(false);
  const [speedOpen, setSpeedOpen] = useState(false);

  const weights = [2, 3, 4, 5];
  const values = [3, 4, 5, 6];
  const cap = 8;

  const [knapTable, setKnapTable] = useState([]);
  const [knapActiveCell, setKnapActiveCell] = useState(null);

  const s1 = "ABCD";
  const s2 = "ACBAD";

  const [lcsTable, setLcsTable] = useState([]);
  const [lcsActiveCell, setLcsActiveCell] = useState(null);

  const coins = [1, 2, 5];

  const [coinAmt, setCoinAmt] = useState(7);
  const [coinDp, setCoinDp] = useState([]);
  const [coinActive, setCoinActive] = useState(-1);

  const addFibLog = (msg, type = "info") => {
    const time = new Date().toLocaleTimeString([], {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    setFibLogs((prev) => [{ time, msg, type }, ...prev].slice(0, 50));
  };

  const resetFibStats = () => {
    setFibStepsDone(0);
    setFibUpdates(0);
    setFibLogs([]);
  };

  const initFib = (n = fibN) => {
    if (running) return;

    setFibN(n);
    setFibDp([]);
    setFibActive(-1);
    setStepLog([]);
    resetFibStats();
    setFibOpen(false);
    addFibLog(`Fibonacci input reset to n=${n}.`);
  };

  const handleSpeed = (value, label) => {
    setSpeed(value);
    setSpeedLabel(label);
    setSpeedOpen(false);
  };

  const handleSpeedMultiplier = (value) => {
    setSpeedMultiplier(value);
    setSpeed(Math.round(200 / value));
  };

  const startFib = async () => {
    if (running) return;

    stopRef.current = false;
    setRunning(true);
    setStepLog([]);
    resetFibStats();
    addFibLog(`Starting Fibonacci DP for n=${fibN}.`);

    const frames = fibSteps(fibN);
    let localSteps = 0;
    let localUpdates = 0;

    setDpFrames(frames);
    setDpFrameIdx(0);

    for (let i = 0; i < frames.length; i++) {
      if (stopRef.current) break;

      const f = frames[i];
      setFibDp(f.dp);
      setFibActive(f.active);
      setDpFrameIdx(i);

      localSteps += 1;
      setFibStepsDone(localSteps);

      if (f.type === "swap") {
        localUpdates += 1;
        setFibUpdates(localUpdates);
      }

      setStepLog((prev) => [...prev, { text: f.log, type: f.type }]);
      addFibLog(f.log, f.type === "swap" ? "swap" : f.type);
      await sleep(speed);
    }

    if (!stopRef.current) {
      addFibLog(`Algorithm completed. fib(${fibN}) = ${frames[frames.length - 1].dp[fibN]}.`);
    }

    setRunning(false);
  };

  const stopFib = () => {
    stopRef.current = true;
    setRunning(false);
    addFibLog("Execution interrupted by user.");
  };

  const startKnapsack = async () => {
    if (running) return;

    stopRef.current = false;
    setRunning(true);
    setStepLog([]);

    const frames = knapsackSteps(weights, values, cap);
    setDpFrames(frames);
    setDpFrameIdx(0);

    for (let i = 0; i < frames.length; i++) {
      if (stopRef.current) break;

      const f = frames[i];
      setKnapTable(f.dp);
      setKnapActiveCell([f.activeI, f.activeW]);
      setDpFrameIdx(i);
      setStepLog((prev) => [...prev, { text: f.log, type: f.type }]);
      await sleep(speed);
    }

    setRunning(false);
  };

  const startLcs = async () => {
    if (running) return;

    stopRef.current = false;
    setRunning(true);
    setStepLog([]);

    const frames = lcsSteps(s1, s2);
    setDpFrames(frames);
    setDpFrameIdx(0);

    for (let i = 0; i < frames.length; i++) {
      if (stopRef.current) break;

      const f = frames[i];
      setLcsTable(f.dp);
      setLcsActiveCell([f.activeI, f.activeJ]);
      setDpFrameIdx(i);
      setStepLog((prev) => [...prev, { text: f.log, type: f.type }]);
      await sleep(speed);
    }

    setRunning(false);
  };

  const startCoin = async () => {
    if (running) return;

    stopRef.current = false;
    setRunning(true);
    setStepLog([]);

    const frames = coinChangeSteps(coins, coinAmt);
    setDpFrames(frames);
    setDpFrameIdx(0);

    for (let i = 0; i < frames.length; i++) {
      if (stopRef.current) break;

      const f = frames[i];
      setCoinDp(f.dp);
      setCoinActive(f.active);
      setDpFrameIdx(i);
      setStepLog((prev) => [...prev, { text: f.log, type: f.type }]);
      await sleep(speed);
    }

    setRunning(false);
  };

  const handleDpPrev = () => {
    if (running || !dpFrames || dpFrameIdx <= 0) return;

    const nextIdx = dpFrameIdx - 1;
    const f = dpFrames[nextIdx];

    setDpFrameIdx(nextIdx);

    if (isFib) {
      setFibDp(f.dp);
      setFibActive(f.active);
    } else if (isKnapsack) {
      setKnapTable(f.dp);
      setKnapActiveCell([f.activeI, f.activeW]);
    } else if (isLcs) {
      setLcsTable(f.dp);
      setLcsActiveCell([f.activeI, f.activeJ]);
    } else if (isCoin) {
      setCoinDp(f.dp);
      setCoinActive(f.active);
    }

    setStepLog(dpFrames.slice(0, nextIdx + 1).map((frame) => ({ text: frame.log, type: frame.type })));
  };

  const handleDpNext = () => {
    if (running || !dpFrames || dpFrameIdx >= dpFrames.length - 1) return;

    const nextIdx = dpFrameIdx + 1;
    const f = dpFrames[nextIdx];

    setDpFrameIdx(nextIdx);

    if (isFib) {
      setFibDp(f.dp);
      setFibActive(f.active);
    } else if (isKnapsack) {
      setKnapTable(f.dp);
      setKnapActiveCell([f.activeI, f.activeW]);
    } else if (isLcs) {
      setLcsTable(f.dp);
      setLcsActiveCell([f.activeI, f.activeJ]);
    } else if (isCoin) {
      setCoinDp(f.dp);
      setCoinActive(f.active);
    }

    setStepLog(dpFrames.slice(0, nextIdx + 1).map((frame) => ({ text: frame.log, type: frame.type })));
  };

  const handleStart = () => {
    if (isFib) startFib();
    else if (isKnapsack) startKnapsack();
    else if (isLcs) startLcs();
    else if (isCoin) startCoin();
    else startFib();
  };

  if (isFib) {
    return (
      <AppShell breadcrumb="Fibonacci Series">
        <div className="bs-page">
          <div className="bs-title-row">
            <div>
              <h1>Fibonacci Series</h1>
              <p>Dynamic Programming Algorithm</p>
            </div>
          </div>

          <div className="bs-info-grid">
            <div className="bs-left-info">
              <div className="bs-panel">
                <h2>Fibonacci Series Algorithm</h2>
                <h3>
                  <Icon>info</Icon> Theory
                </h3>
                <p>
                  Fibonacci builds each value from the two previous values. Dynamic
                  programming stores already computed answers in a table, so every
                  Fibonacci number from 0 to n is calculated once and reused.
                </p>
              </div>

              <div className="bs-panel">
                <h3>
                  <Icon>analytics</Icon> Complexity Analysis
                </h3>

                <div className="bs-complexity-grid">
                  <div><span>BEST CASE</span><strong>O(n)</strong></div>
                  <div><span>AVERAGE</span><strong>O(n)</strong></div>
                  <div><span>WORST CASE</span><strong>O(n)</strong></div>
                  <div><span>SPACE</span><strong>O(n)</strong></div>
                </div>

                <div className="bs-tags-row">
                  <span><Icon>table_chart</Icon> TABULATION</span>
                  <span><Icon>memory</Icon> DP ARRAY</span>
                </div>
              </div>
            </div>

            <div className="bs-panel bs-code-panel">
              <div className="bs-code-head">
                <h3><Icon>code</Icon> Pseudo Code</h3>
                <span>JAVASCRIPT</span>
              </div>

              <pre>{`function fibonacci(n) {
  const dp = [0, 1];

  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }

  return dp[n];
}`}</pre>
            </div>
          </div>

          <div className="bs-controls">
            <div className="bs-control-left">
              <button className="bs-outline-btn" onClick={() => initFib()} disabled={running}>
                Generate / Reset
              </button>

              <button className="bs-primary-btn" onClick={startFib} disabled={running}>
                <Icon>play_arrow</Icon> Start
              </button>

              <button className="bs-muted-btn" onClick={stopFib}>
                <Icon>stop</Icon> Stop
              </button>
            </div>

            <div className="bs-control-right">
              <div className="bs-dropdown">
                <button onClick={() => { setFibOpen(!fibOpen); setSpeedOpen(false); }} disabled={running}>
                  <span>N:</span>
                  <strong>{fibN}</strong>
                  <Icon>expand_more</Icon>
                </button>

                {fibOpen && (
                  <div className="bs-dropdown-menu">
                    {[8, 10, 12, 15].map((n) => (
                      <button key={n} onClick={() => initFib(n)}>{n}</button>
                    ))}
                  </div>
                )}
              </div>

              <div className="bs-dropdown">
                <button onClick={() => { setSpeedOpen(!speedOpen); setFibOpen(false); }}>
                  <span>SPEED:</span>
                  <strong>{speedLabel}</strong>
                  <Icon>expand_more</Icon>
                </button>

                {speedOpen && (
                  <div className="bs-dropdown-menu">
                    <button onClick={() => handleSpeed(800, "0.5x")}>0.5x</button>
                    <button onClick={() => handleSpeed(400, "1.0x")}>1.0x</button>
                    <button onClick={() => handleSpeed(250, "1.5x")}>1.5x</button>
                    <button onClick={() => handleSpeed(100, "2.0x")}>2.0x</button>
                  </div>
                )}
              </div>

              <div className="bs-stats">
                <div>
                  <span>UPDATES</span>
                  <strong>{fibUpdates}</strong>
                </div>
                <div>
                  <span>STEPS</span>
                  <strong>{fibStepsDone}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="bs-visual-wrap">
            <div className="bs-bars fib-visual">
              <div className="bs-dot-bg" />
              <FibonacciViz dp={fibDp} active={fibActive} />
            </div>

            <div className="bs-log-panel">
              <h3><Icon>terminal</Icon> Live Execution Trace</h3>

              <div className="bs-log-list">
                {fibLogs.map((log, index) => (
                  <div className={`bs-log-item ${log.type === "swap" ? "bs-log-swap" : ""}`} key={index}>
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
    <AppShell breadcrumb={`DP / ${explanation?.title || algo}`}>
      <div className="section-title">{explanation?.title || algo}</div>
      <div className="section-sub">Watch the DP table fill up step by step</div>

      <div className="controls-bar" style={{ marginBottom: 12 }}>
        {isCoin && (
          <>
            <label>Amount</label>
            <select className="size-select" value={coinAmt} onChange={(e) => setCoinAmt(+e.target.value)} disabled={running}>
              {[5, 7, 9, 11].map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </>
        )}

        <button className="btn btn-primary" onClick={handleStart} disabled={running}>Start</button>
        <button className="btn btn-danger" onClick={() => { stopRef.current = true; setRunning(false); }} disabled={!running}>Stop</button>
        <button className="btn btn-ghost" onClick={handleDpPrev} disabled={running || !dpFrames || dpFrameIdx <= 0}>Prev Step</button>
        <button className="btn btn-ghost" onClick={handleDpNext} disabled={running || !dpFrames || dpFrameIdx >= dpFrames.length - 1}>Next Step</button>

        <label>Speed</label>
        <select className="size-select" value={speedMultiplier} onChange={(e) => handleSpeedMultiplier(+e.target.value)} disabled={running}>
          <option value={0.5}>0.5x</option>
          <option value={1}>1x</option>
          <option value={2}>2x</option>
          <option value={3}>3x</option>
          <option value={4}>4x</option>
        </select>
      </div>

      <div className="viz-layout-3">
        <div className="viz-left">
          <AlgoExplain explanation={explanation} stepLog={stepLog} />
        </div>

        <div className="viz-center">
          <div className="card" style={{ overflow: "auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, minHeight: 350 }}>
            {isCoin && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
                {coinDp.length === 0 && <span style={{ color: "var(--muted)" }}>Press Start</span>}
                {coinDp.map((v, i) => (
                  <div key={i} style={{
                    textAlign: "center",
                    minWidth: 48,
                    padding: "8px 4px",
                    borderRadius: 8,
                    background: i === coinActive ? "var(--active-bg)" : "var(--surface2)",
                    border: `1px solid ${i === coinActive ? "var(--active-bg)" : "var(--border)"}`,
                    transition: "all 0.3s",
                    color: i === coinActive ? "var(--active-text)" : "var(--text)",
                  }}>
                    <div style={{ fontSize: 10, color: i === coinActive ? "var(--active-text)" : "var(--muted)" }}>amt={i}</div>
                    <div style={{ fontWeight: 700, fontFamily: "JetBrains Mono,monospace", fontSize: 13 }}>{v === Infinity ? "infinity" : v}</div>
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
                              <td
                                key={w}
                                style={{
                                  width: 36,
                                  height: 32,
                                  textAlign: "center",
                                  borderRadius: 6,
                                  background: isActive ? "var(--active-bg)" : val > 0 ? "var(--surface2)" : "var(--surface)",
                                  color: isActive ? "var(--active-text)" : val > 0 ? "var(--green)" : "var(--muted)",
                                  fontFamily: "JetBrains Mono,monospace",
                                  fontSize: 12,
                                  fontWeight: 700,
                                  transition: "all 0.3s",
                                }}
                              >
                                {val}
                              </td>
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
                        <td></td>
                        <td></td>
                        {s2.split("").map((c, j) => (
                          <td key={j} style={{ textAlign: "center", fontWeight: "bold", color: "var(--muted)" }}>
                            {c}
                          </td>
                        ))}
                      </tr>

                      {lcsTable.map((row, i) => (
                        <tr key={i}>
                          <td style={{ textAlign: "center", fontWeight: "bold", color: "var(--muted)", width: 20 }}>
                            {i > 0 ? s1[i - 1] : ""}
                          </td>

                          {row.map((val, j) => {
                            const isActive = lcsActiveCell && lcsActiveCell[0] === i && lcsActiveCell[1] === j;

                            return (
                              <td
                                key={j}
                                style={{
                                  width: 36,
                                  height: 32,
                                  textAlign: "center",
                                  borderRadius: 6,
                                  background: isActive ? "var(--active-bg)" : val > 0 ? "var(--surface2)" : "var(--surface)",
                                  color: isActive ? "var(--active-text)" : val > 0 ? "var(--purple)" : "var(--muted)",
                                  fontFamily: "JetBrains Mono,monospace",
                                  fontSize: 12,
                                  fontWeight: 700,
                                  transition: "all 0.3s",
                                }}
                              >
                                {val}
                              </td>
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

      <MultiLangCode algoKey={algo} />
    </AppShell>
  );
}