import SearchArrayViz from '../visualize-shared/SearchArrayViz.jsx';

export default function SearchingViz({ frame }) {
  const payload = (frame && frame.data) || {};
  const array = payload.array || [];
  const pointer = typeof payload.pointer === 'number' ? payload.pointer : -1;
  const target = payload.target;
  const foundIdx = typeof payload.foundIdx === 'number' ? payload.foundIdx : -1;
  const states = (frame && frame.states) || {};
  const notFound = frame && frame.type === 'done' && foundIdx < 0;

  return (
    <div>
      <SearchArrayViz array={array} states={states} pointer={pointer} target={target} foundIdx={foundIdx} notFound={notFound} />
      {foundIdx >= 0 && (
        <div style={{ textAlign: 'center', color: 'var(--green)', fontWeight: 700, fontSize: 13, padding: '8px 0' }}>
          ✓ Found at index {foundIdx}
        </div>
      )}
    </div>
  );
}
