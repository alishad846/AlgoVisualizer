export default function LinkedListViz({ frame }) {
  const values = (frame && frame.data) || [];
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', padding: 16,
        background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, minHeight: 120,
      }}
    >
      {values.length === 0 && <div style={{ color: 'var(--muted)', fontSize: 13 }}>List is empty</div>}
      {values.map((v, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div
            style={{
              padding: '10px 16px', borderRadius: 8, background: 'var(--surface2)',
              border: '1px solid var(--cyan)', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
            }}
          >
            {String(v)}
          </div>
          {i < values.length - 1 && <span style={{ color: 'var(--muted)' }}>&rarr;</span>}
        </div>
      ))}
    </div>
  );
}
