export default function VariableInspectorViz({ frame }) {
  const vars = (frame && frame.data) || {};
  const entries = Object.entries(vars);
  return (
    <div style={{ padding: 16, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, minHeight: 160 }}>
      {entries.length === 0 && <div style={{ color: 'var(--muted)', fontSize: 13 }}>No variables captured at this step</div>}
      {entries.map(([name, value]) => (
        <div
          key={name}
          style={{
            display: 'flex', gap: 10, padding: '6px 0', borderBottom: '1px solid var(--border)',
            fontFamily: "'JetBrains Mono', monospace", fontSize: 13,
          }}
        >
          <span style={{ color: 'var(--cyan)', fontWeight: 700, minWidth: 90 }}>{name}</span>
          <span style={{ color: 'var(--text)' }}>{JSON.stringify(value)}</span>
        </div>
      ))}
    </div>
  );
}
