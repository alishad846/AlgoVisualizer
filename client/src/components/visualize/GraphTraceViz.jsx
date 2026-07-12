export default function GraphTraceViz({ frame }) {
  const nodes = (frame && frame.data && frame.data.nodes) || [];
  const states = (frame && frame.states) || {};
  const radius = 90;
  const cx = 140;
  const cy = 140;

  return (
    <div style={{ padding: 16, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12 }}>
      <svg width={280} height={280}>
        {nodes.map((n, i) => {
          const angle = (2 * Math.PI * i) / Math.max(nodes.length, 1);
          const x = cx + radius * Math.cos(angle);
          const y = cy + radius * Math.sin(angle);
          const visited = states[n] === 'sorted';
          return (
            <g key={n}>
              <circle cx={x} cy={y} r={16} fill={visited ? 'var(--green)' : 'var(--surface2)'} stroke="var(--border2)" strokeWidth={2} />
              <text x={x} y={y + 4} textAnchor="middle" fontSize={10} fontWeight="bold" fontFamily="monospace" fill={visited ? '#fff' : 'var(--text)'}>
                {n}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
