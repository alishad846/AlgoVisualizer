function computePositions(nodes) {
  const byDepth = {};
  nodes.forEach((n) => {
    const depth = n.depth ?? 0;
    byDepth[depth] = byDepth[depth] || [];
    byDepth[depth].push(n);
  });

  const positions = {};
  Object.entries(byDepth).forEach(([depth, list]) => {
    const y = 40 + Number(depth) * 60;
    list.forEach((n, i) => {
      const x = 60 + i * (480 / Math.max(list.length, 1));
      positions[n.id] = { x, y };
    });
  });
  return positions;
}

export default function TreeViz({ frame }) {
  const nodes = (frame && frame.data && frame.data.nodes) || [];
  const edges = (frame && frame.data && frame.data.edges) || [];
  const positions = computePositions(nodes);

  return (
    <div style={{ padding: 16, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'auto' }}>
      <svg width={560} height={260}>
        {edges.map((e, i) => {
          const from = positions[e.from];
          const to = positions[e.to];
          if (!from || !to) return null;
          return <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="var(--border2)" strokeWidth={2} />;
        })}
        {nodes.map((n) => {
          const pos = positions[n.id];
          if (!pos) return null;
          return (
            <g key={n.id}>
              <circle cx={pos.x} cy={pos.y} r={18} fill="var(--surface2)" stroke="var(--cyan)" strokeWidth={2} />
              <text x={pos.x} y={pos.y + 4} textAnchor="middle" fontSize={11} fontWeight="bold" fontFamily="monospace" fill="var(--text)">
                {n.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
