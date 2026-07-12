export default function StackQueueViz({ frame }) {
  const values = (frame && frame.data) || [];
  return (
    <div
      style={{
        display: 'flex', flexDirection: 'column-reverse', gap: 4, padding: 16,
        background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12,
        minHeight: 220, alignItems: 'center',
      }}
    >
      {values.length === 0 && <div style={{ color: 'var(--muted)', fontSize: 13 }}>Empty</div>}
      {values.map((v, i) => (
        <div
          key={i}
          style={{
            padding: '8px 20px', borderRadius: 8, background: 'var(--surface2)',
            border: '1px solid var(--orange)', fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700, minWidth: 60, textAlign: 'center',
          }}
        >
          {String(v)}
        </div>
      ))}
    </div>
  );
}
