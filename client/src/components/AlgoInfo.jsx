export default function AlgoInfo({ name, timeAvg, timeWorst, timeBest, space, steps, comparisons, log }) {
  return (
    <div className="info-panel">
      <div className="card card-sm">
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{name}</div>
        <div className="complexity-grid">
          <div className="complexity-item">
            <div className="label">Best</div>
            <div className="value" style={{ color: "var(--green)" }}>{timeBest || "—"}</div>
          </div>
          <div className="complexity-item">
            <div className="label">Average</div>
            <div className="value" style={{ color: "var(--yellow)" }}>{timeAvg || "—"}</div>
          </div>
          <div className="complexity-item">
            <div className="label">Worst</div>
            <div className="value" style={{ color: "var(--red)" }}>{timeWorst || "—"}</div>
          </div>
          <div className="complexity-item">
            <div className="label">Space</div>
            <div className="value" style={{ color: "var(--cyan)" }}>{space || "—"}</div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <div className="stat-chip" style={{ flex: 1 }}>
          <div>
            <div className="s-label">Steps</div>
            <div className="s-value" style={{ color: "var(--cyan)" }}>{steps || 0}</div>
          </div>
        </div>
        <div className="stat-chip" style={{ flex: 1 }}>
          <div>
            <div className="s-label">Swaps</div>
            <div className="s-value" style={{ color: "var(--orange)" }}>{comparisons || 0}</div>
          </div>
        </div>
      </div>

      {log && (
        <div className="activity-log">&gt; {log}</div>
      )}
    </div>
  );
}
