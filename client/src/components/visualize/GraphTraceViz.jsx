function colorFor(state) {
  if (state === 'active') return { fill: 'var(--active-bg)', text: 'var(--active-text)' };
  if (state === 'sorted') return { fill: 'var(--green)', text: '#fff' };
  return { fill: 'var(--surface2)', text: 'var(--text)' };
}

export default function GraphTraceViz({ frame }) {
  const nodes = (frame && frame.data && frame.data.nodes) || [];
  const edges = (frame && frame.data && frame.data.edges) || [];
  const states = (frame && frame.states) || {};
  const radius = 90;
  const cx = 140;
  const cy = 140;

  const positions = {};
  nodes.forEach((n, i) => {
    const angle = (2 * Math.PI * i) / Math.max(nodes.length, 1);
    positions[n] = { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  });

  return (
    <div style={{ padding: 16, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12 }}>
      <svg width={280} height={280}>
        {edges.map((e, i) => {
          const from = positions[e.from];
          const to = positions[e.to];
          if (!from || !to) return null;
          return <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="var(--border2)" strokeWidth={1.5} />;
        })}
        {nodes.map((n) => {
          const pos = positions[n];
          if (!pos) return null;
          const { fill, text } = colorFor(states[n]);
          return (
            <g key={n}>
              <circle
                cx={pos.x} cy={pos.y} r={16} fill={fill} stroke="var(--border2)" strokeWidth={2}
                style={{ transition: 'fill 0.3s ease' }}
              />
              <text x={pos.x} y={pos.y + 4} textAnchor="middle" fontSize={10} fontWeight="bold" fontFamily="monospace" fill={text}>
                {n}
              </text>
            </g>
          );
        })}
      </svg>
      <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 11, color: 'var(--muted)' }}>
        <span>
          <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: 'var(--active-bg)', marginRight: 4 }} />
          Active
        </span>
        <span>
          <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: 'var(--green)', marginRight: 4 }} />
          Visited
        </span>
        <span>
          <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: 'var(--surface2)', border: '1px solid var(--border2)', marginRight: 4 }} />
          Unvisited
        </span>
      </div>
    </div>
  );
}
