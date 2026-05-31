import { useState } from "react";

/**
 * Algorithm explanation panel with tabs: Theory | Pseudocode | Complexity
 * Props: explanation = { title, theory, howItWorks, pseudocode, timeBest, timeAvg, timeWorst, space, stable, inPlace }
 */
export default function AlgoExplain({ explanation }) {
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
          <pre className="algo-explain-code">{explanation.pseudocode}</pre>
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
