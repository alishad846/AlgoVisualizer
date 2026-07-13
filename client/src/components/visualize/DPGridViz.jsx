export default function DPGridViz({ frame }) {
  const grid = (frame && frame.data) || [];
  return (
    <div style={{ padding: 16, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'auto' }}>
      <table style={{ borderCollapse: 'collapse' }}>
        <tbody>
          {grid.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  style={{
                    border: '1px solid var(--border2)', padding: '6px 10px',
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
                    background: 'var(--surface2)', textAlign: 'center', minWidth: 32,
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
