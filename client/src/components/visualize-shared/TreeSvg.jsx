function computeTreePositions(nodes) {
  const byDepth = {};
  nodes.forEach((n) => {
    const depth = n.depth ?? 0;
    byDepth[depth] = byDepth[depth] || [];
    byDepth[depth].push(n);
  });

  const positions = {};
  Object.entries(byDepth).forEach(([depth, list]) => {
    const y = 30 + Number(depth) * 70;
    list.forEach((n, i) => {
      const x = ((i + 1) * 100) / (list.length + 1);
      positions[n.id] = { x, y };
    });
  });
  return positions;
}

export default function TreeSvg({ nodes = [], edges = [], activeId, visitedOrder = [] }) {
  const positions = computeTreePositions(nodes);

  return (
    <div style={{ padding: 16, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'auto' }}>
      <svg width="100%" height={320}>
        {edges.map((e, i) => {
          const from = positions[e.from];
          const to = positions[e.to];
          if (!from || !to) return null;
          return (
            <line key={i} x1={`${from.x}%`} y1={from.y} x2={`${to.x}%`} y2={to.y} stroke="var(--border2)" strokeWidth={1.5} />
          );
        })}
        {nodes.map((n) => {
          const pos = positions[n.id];
          if (!pos) return null;
          const isActive = n.id === activeId;
          return (
            <g key={n.id}>
              <circle
                cx={`${pos.x}%`} cy={pos.y} r={20}
                fill={isActive ? 'var(--active-bg)' : 'var(--surface2)'}
                stroke={isActive ? 'var(--active-bg)' : 'var(--border2)'}
                strokeWidth={2}
                style={{ transition: 'fill 0.3s, stroke 0.3s' }}
              />
              <text
                x={`${pos.x}%`} y={pos.y + 5} textAnchor="middle" fontSize={12} fontWeight="bold"
                fill={isActive ? 'var(--active-text)' : 'var(--text)'}
                style={{ transition: 'fill 0.3s' }}
              >
                {n.label}
              </text>
            </g>
          );
        })}
      </svg>
      {visitedOrder.length > 0 && (
        <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4, padding: 8 }}>
          {visitedOrder.map((v, i) => (
            <div key={i} style={{ padding: '2px 10px', borderRadius: 20, background: 'rgba(6,182,212,0.15)', color: 'var(--cyan)', fontSize: 12, fontWeight: 700 }}>
              {v}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
