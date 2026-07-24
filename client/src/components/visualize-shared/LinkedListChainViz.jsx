function LLNode({ val, active, visited, last, color = 'var(--cyan)' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div
        className={`node-box ${active ? 'active' : visited ? 'visited' : ''}`}
        style={active ? { borderColor: color, boxShadow: `0 0 12px ${color}66` } : {}}
      >
        {val}
      </div>
      {!last && <div className="node-arrow">→</div>}
    </div>
  );
}

export default function LinkedListChainViz({ nodes = [], activeIdx = -1, visitedSet = new Set(), color }) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4, padding: 16,
        background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, minHeight: 80, flex: 1,
      }}
    >
      {nodes.map((v, i) => (
        <LLNode key={i} val={v} active={activeIdx === i} visited={visitedSet.has(i)} last={i === nodes.length - 1} color={color} />
      ))}
      <div className="node-box" style={{ borderStyle: 'dashed', color: 'var(--muted)' }}>null</div>
    </div>
  );
}
