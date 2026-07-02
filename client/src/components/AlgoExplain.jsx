import { useState } from "react";

function getActiveLineIndex(pseudocode, stepLog) {
  if (!pseudocode || !stepLog || stepLog.length === 0) return -1;
  const latest = stepLog[stepLog.length - 1];
  if (!latest) return -1;

  if (latest.type === "done") return -1;

  const lines = pseudocode.split("\n");
  const text = (latest.text || "").toLowerCase();
  const type = latest.type || "";

  if (type === "compare" || text.includes("compar")) {
    const idx = lines.findIndex(l => l.includes("if") || l.includes(">") || l.includes("<") || l.includes("==") || l.includes("compar"));
    if (idx !== -1) return idx;
  }
  if (type === "swap" || text.includes("swap") || text.includes("exchang")) {
    const idx = lines.findIndex(l => l.toLowerCase().includes("swap") || (l.includes("=") && !l.includes("==") && !l.includes("for")));
    if (idx !== -1) return idx;
  }

  for (let i = 0; i < lines.length; i++) {
    const lineLow = lines[i].toLowerCase();
    if (text.includes("found") && (lineLow.includes("return") || lineLow.includes("found"))) return i;
    if (text.includes("push") && lineLow.includes("push")) return i;
    if (text.includes("pop") && lineLow.includes("pop")) return i;
    if (text.includes("pass") || text.includes("loop") || text.includes("start")) {
      if (lineLow.includes("for") || lineLow.includes("while")) return i;
    }
  }

  return lines.length > 1 ? 1 : 0;
}

/**
 * Algorithm explanation panel with tabs: Theory | Pseudocode | Complexity
 * Props: explanation = { title, theory, howItWorks, pseudocode, timeBest, timeAvg, timeWorst, space, stable, inPlace }
 */
export default function AlgoExplain({ explanation, stepLog = [] }) {
  const [tab, setTab] = useState("theory");
  if (!explanation) return null;

  return (
    <div className="algo-explain">
      <div className="algo-explain-tabs">
        {["theory", "pseudocode", "complexity"].map(t => (
          <button
            key={t}
            className={`algo-explain-tab ${tab === t ? "active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t === "theory" ? "📖 Theory" : t === "pseudocode" ? "💻 Pseudocode" : "📊 Complexity"}
          </button>
        ))}
      </div>

      <div className="algo-explain-body">
        {tab === "theory" && (
          <div>
            <h4 className="algo-explain-heading">{explanation.title || "Algorithm"}</h4>
            <p className="algo-explain-text">{explanation.theory}</p>
            {explanation.howItWorks && (
              <>
                <h5 className="algo-explain-subheading">How It Works</h5>
                <ol className="algo-explain-steps">
                  {explanation.howItWorks.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </>
            )}
          </div>
        )}

        {tab === "pseudocode" && (
          <div className="algo-explain-code-container" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", lineHeight: "1.6", background: "var(--surface2)", padding: "12px", borderRadius: "8px" }}>
            {explanation.pseudocode ? explanation.pseudocode.split('\n').map((line, idx) => {
              const activeIdx = getActiveLineIndex(explanation.pseudocode, stepLog);
              const isActive = activeIdx === idx;
              return (
                <div 
                  key={idx} 
                  className={`pseudocode-line ${isActive ? "active-line" : ""}`}
                  style={{
                    display: "flex",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    background: isActive ? "rgba(255, 255, 0, 0.15)" : "transparent",
                    borderLeft: isActive ? "3px solid var(--yellow)" : "3px solid transparent",
                    color: isActive ? "var(--text)" : "var(--on-surface-variant)",
                    transition: "all 0.25s ease",
                    fontWeight: isActive ? 600 : 400
                  }}
                >
                  <span style={{ width: "30px", color: isActive ? "var(--yellow)" : "var(--muted)", userSelect: "none", display: "inline-block" }}>{idx + 1}</span>
                  <span style={{ whiteSpace: "pre-wrap" }}>{line}</span>
                </div>
              );
            }) : <pre className="algo-explain-code">{explanation.pseudocode}</pre>}
          </div>
        )}

        {tab === "complexity" && (
          <div>
            <div className="complexity-grid">
              <div className="complexity-item">
                <div className="label">Best Case</div>
                <div className="value" style={{ color: "var(--green)" }}>{explanation.timeBest}</div>
              </div>
              <div className="complexity-item">
                <div className="label">Average</div>
                <div className="value" style={{ color: "var(--yellow)" }}>{explanation.timeAvg}</div>
              </div>
              <div className="complexity-item">
                <div className="label">Worst Case</div>
                <div className="value" style={{ color: "var(--red)" }}>{explanation.timeWorst}</div>
              </div>
              <div className="complexity-item">
                <div className="label">Space</div>
                <div className="value" style={{ color: "var(--cyan)" }}>{explanation.space}</div>
              </div>
            </div>
            {(explanation.stable !== undefined || explanation.inPlace !== undefined) && (
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                {explanation.stable !== undefined && (
                  <span className={`badge ${explanation.stable ? "badge-green" : "badge-red"}`}>
                    {explanation.stable ? "✓ Stable" : "✗ Not Stable"}
                  </span>
                )}
                {explanation.inPlace !== undefined && (
                  <span className={`badge ${explanation.inPlace ? "badge-cyan" : "badge-orange"}`}>
                    {explanation.inPlace ? "✓ In-Place" : "✗ Not In-Place"}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
