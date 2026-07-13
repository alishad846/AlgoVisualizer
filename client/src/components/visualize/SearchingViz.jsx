import CubeVisualizer from '../CubeVisualizer.jsx';

export default function SearchingViz({ frame }) {
  const payload = (frame && frame.data) || {};
  const array = payload.array || [];
  const pointer = typeof payload.pointer === 'number' ? payload.pointer : -1;
  const target = payload.target;
  const foundIdx = typeof payload.foundIdx === 'number' ? payload.foundIdx : -1;

  const states = { ...((frame && frame.states) || {}) };
  if (foundIdx >= 0) states[foundIdx] = 'found';

  return (
    <div>
      {pointer >= 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: '0 20px', minHeight: 16 }}>
          {array.map((_, i) => (
            <div key={i} style={{ width: 40, display: 'flex', justifyContent: 'center' }}>
              {pointer === i && (
                <div
                  style={{
                    width: 0, height: 0, borderLeft: '6px solid transparent',
                    borderRight: '6px solid transparent', borderBottom: '10px solid var(--active-bg)',
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}
      <CubeVisualizer array={array} states={states} />
      {target !== undefined && (
        <div style={{ textAlign: 'center', marginTop: 8, fontSize: 13, color: 'var(--muted)' }}>
          Target: <strong style={{ color: 'var(--active-bg)' }}>{target}</strong>
        </div>
      )}
      {foundIdx >= 0 && (
        <div style={{ textAlign: 'center', color: 'var(--green)', fontWeight: 700, fontSize: 13, padding: '8px 0' }}>
          ✓ Found at index {foundIdx}
        </div>
      )}
    </div>
  );
}
