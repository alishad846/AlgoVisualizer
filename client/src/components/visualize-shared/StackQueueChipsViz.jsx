export default function StackQueueChipsViz({ values = [], activeIndex = -1, direction = 'stack', emptyLabel = 'Empty Stack' }) {
  const isQueue = direction === 'queue';

  if (values.length === 0) {
    return <div style={{ color: 'var(--muted)', fontSize: 13 }}>{emptyLabel}</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: isQueue ? 'row' : 'column', gap: 6, alignItems: 'center' }}>
      {values.map((v, i) => (
        <div
          key={i}
          style={{
            width: isQueue ? 56 : 160, height: isQueue ? 56 : 40,
            borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'JetBrains Mono,monospace', fontWeight: 800, fontSize: 16,
            background: i === activeIndex ? 'var(--active-bg)' : 'var(--surface2)',
            border: i === activeIndex ? '2px solid var(--active-text)' : '1px solid var(--border2)',
            color: i === activeIndex ? 'var(--active-text)' : 'var(--text)',
            transition: 'all 0.3s', boxShadow: i === 0 ? '0 0 12px rgba(6,182,212,0.3)' : 'none',
          }}
        >
          {String(v)}
        </div>
      ))}
      {!isQueue && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>↑ TOP</div>}
      {isQueue && <div style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 4 }}>← FRONT</div>}
    </div>
  );
}
