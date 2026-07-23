function formatCell(value) {
  if (value === Infinity) return '∞';
  if (value === -Infinity) return '-∞';
  return value;
}

function cellStyle(value, isActive) {
  if (isActive) return { background: 'var(--active-bg)', color: 'var(--active-text)' };
  if (typeof value === 'number' && value > 0) return { background: 'rgba(34,197,94,0.15)', color: 'var(--green)' };
  return { background: 'var(--surface2)', color: undefined };
}

const EMPTY_STATE = (
  <div style={{ padding: 16, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--muted)', fontSize: 13 }}>
    Press Start
  </div>
);

export default function DPGridViz({ frame }) {
  const payload = (frame && frame.data) || {};
  const states = (frame && frame.states) || {};
  const dim = payload.dim || 2;

  if (dim === 1) {
    const values = payload.values || [];
    if (values.length === 0) return EMPTY_STATE;
    return (
      <div style={{ padding: 16, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'auto' }}>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {values.map((v, i) => {
            const { background, color } = cellStyle(v, states[i] === 'active');
            return (
              <div
                key={i}
                style={{
                  border: '1px solid var(--border2)', padding: '6px 10px', borderRadius: 6,
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 12, background, color,
                  textAlign: 'center', minWidth: 32, transition: 'all 0.3s ease',
                }}
              >
                {formatCell(v)}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const grid = payload.grid || [];
  if (grid.length === 0) return EMPTY_STATE;

  return (
    <div style={{ padding: 16, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'auto' }}>
      <table style={{ borderCollapse: 'collapse' }}>
        <tbody>
          {grid.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => {
                const { background, color } = cellStyle(cell, states[`${i},${j}`] === 'active');
                return (
                  <td
                    key={j}
                    style={{
                      border: '1px solid var(--border2)', padding: '6px 10px',
                      fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
                      background, color, textAlign: 'center', minWidth: 32, transition: 'all 0.3s ease',
                    }}
                  >
                    {formatCell(cell)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
