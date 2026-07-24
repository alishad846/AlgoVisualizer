function formatDpCell(value) {
  if (value === Infinity) return '∞';
  if (value === -Infinity) return '-∞';
  return value;
}

function dpCellStyle(value, isActive, colorScheme) {
  if (isActive) return { background: 'var(--active-bg)', color: 'var(--active-text)' };
  if (colorScheme === 'green' && typeof value === 'number' && value > 0) {
    return { background: 'var(--surface2)', color: 'var(--green)' };
  }
  if (colorScheme === 'purple' && typeof value === 'number' && value > 0) {
    return { background: 'var(--surface2)', color: 'var(--purple)' };
  }
  return { background: 'var(--surface2)', color: undefined };
}

export default function DpTableViz({
  dim, values = [], grid = [], active, colorScheme = 'none',
  indexLabel, rowLabels, colLabels, emptyLabel = 'Press Start',
}) {
  if (dim === 1) {
    if (values.length === 0) {
      return <span style={{ color: 'var(--muted)' }}>{emptyLabel}</span>;
    }
    return (
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
        {values.map((v, i) => {
          const isActive = active === i;
          const { background, color } = dpCellStyle(v, isActive, colorScheme);
          return (
            <div
              key={i}
              style={{
                textAlign: 'center', minWidth: 48, padding: '8px 4px', borderRadius: 8,
                background, border: `1px solid ${isActive ? 'var(--active-bg)' : 'var(--border)'}`,
                transition: 'all 0.3s', color,
              }}
            >
              {indexLabel && (
                <div style={{ fontSize: 10, color: isActive ? 'var(--active-text)' : 'var(--muted)' }}>
                  {indexLabel(i)}
                </div>
              )}
              <div style={{ fontWeight: 700, fontFamily: 'JetBrains Mono,monospace', fontSize: 13 }}>
                {formatDpCell(v)}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (grid.length === 0) {
    return <span style={{ color: 'var(--muted)' }}>{emptyLabel}</span>;
  }
  const [activeI, activeJ] = Array.isArray(active) ? active : [-1, -1];

  return (
    <table style={{ borderCollapse: 'separate', borderSpacing: 3 }}>
      <tbody>
        {colLabels && (
          <tr>
            <td /><td />
            {colLabels.map((c, j) => (
              <td key={j} style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--muted)' }}>{c}</td>
            ))}
          </tr>
        )}
        {grid.map((row, i) => (
          <tr key={i}>
            {rowLabels && (
              <td style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--muted)', width: 20 }}>
                {rowLabels[i]}
              </td>
            )}
            {row.map((val, j) => {
              const isActive = activeI === i && activeJ === j;
              const { background, color } = dpCellStyle(val, isActive, colorScheme);
              return (
                <td
                  key={j}
                  style={{
                    width: 36, height: 32, textAlign: 'center', borderRadius: 6,
                    background, color, fontFamily: 'JetBrains Mono,monospace', fontSize: 12,
                    fontWeight: 700, transition: 'all 0.3s',
                  }}
                >
                  {formatDpCell(val)}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
