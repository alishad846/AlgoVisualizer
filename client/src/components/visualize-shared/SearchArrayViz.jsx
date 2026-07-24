export default function SearchArrayViz({ array = [], states = {}, pointer = -1, target, foundIdx = -1, notFound = false }) {
  const max = Math.max(...array, 1);

  return (
    <div>
      <div className="custom-h-scroll">
        <div style={{ minWidth: `${array.length * 48 + 40}px`, width: 'max(100%, fit-content)', margin: '0 auto' }}>
          {/* Pointer row */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: '0 20px', minHeight: 16, width: '100%' }}>
            {array.map((_, i) => (
              <div key={i} style={{ width: 40, display: 'flex', justifyContent: 'center' }}>
                {pointer === i && (
                  <div style={{ width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderBottom: '10px solid var(--active-bg)' }} />
                )}
              </div>
            ))}
          </div>

          {/* Cubes */}
          <div className="cubes-arena">
            {array.map((val, i) => {
              let state = states[i] || 'default';
              if (foundIdx === i) state = 'found';
              else if (notFound) state = 'notfound';
              const h = Math.max(18, Math.round((val / max) * 160));
              return (
                <div key={i} className="cube-wrap">
                  <div className={`cube-label state-${state}`}>{val}</div>
                  <div className={`cube state-${state}`} style={{ height: h }} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {target !== undefined && (
        <div style={{ textAlign: 'center', marginTop: 8, fontSize: 13, color: 'var(--muted)' }}>
          Target: <strong style={{ color: 'var(--active-bg)' }}>{target}</strong>
        </div>
      )}
    </div>
  );
}
