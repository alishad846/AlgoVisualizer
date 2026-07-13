export default function LinkedListViz({ frame }) {
  const payload = (frame && frame.data) || {};
  const values = payload.values || [];
  const activeIndex = typeof payload.activeIndex === 'number' ? payload.activeIndex : -1;

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
              padding: '10px 16px', borderRadius: 8,
              background: i === activeIndex ? 'var(--active-bg)' : 'var(--surface2)',
              border: `1px solid ${i === activeIndex ? 'var(--active-bg)' : 'var(--cyan)'}`,
              color: i === activeIndex ? 'var(--active-text)' : undefined,
              fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
              boxShadow: i === activeIndex ? '0 0 0 3px rgba(6,182,212,0.25)' : undefined,
              transition: 'all 0.3s ease',
            }}
          >
            {String(v)}
          </div>
          <span style={{ color: 'var(--muted)' }}>&rarr;</span>
        </div>
      ))}
      {values.length > 0 && (
        <div
          style={{
            padding: '10px 16px', borderRadius: 8, border: '1px dashed var(--border2)',
            color: 'var(--muted)', fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          null
        </div>
      )}
    </div>
  );
}
