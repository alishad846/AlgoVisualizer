export default function CallStackViz({ frame }) {
  const stack = (frame && frame.data) || [];
  return (
    <div
      style={{
        display: 'flex', flexDirection: 'column-reverse', gap: 6, padding: 16,
        background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, minHeight: 220,
      }}
    >
      {stack.length === 0 && <div style={{ color: 'var(--muted)', fontSize: 13 }}>Call stack is empty</div>}
      {stack.map((call, i) => (
        <div
          key={i}
          style={{
            padding: '8px 14px', borderRadius: 8, background: 'var(--surface2)',
            border: '1px solid var(--border2)', fontFamily: "'JetBrains Mono', monospace", fontSize: 13,
          }}
        >
          <strong style={{ color: 'var(--cyan)' }}>{call.name}</strong>
          {'('}
          {Object.entries(call.args || {})
            .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
            .join(', ')}
          {')'}
        </div>
      ))}
    </div>
  );
}
