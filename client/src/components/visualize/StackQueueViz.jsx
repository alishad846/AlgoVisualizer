import StackQueueChipsViz from '../visualize-shared/StackQueueChipsViz.jsx';

export default function StackQueueViz({ frame }) {
  const payload = (frame && frame.data) || {};
  const values = payload.values || [];
  const activeIndex = typeof payload.activeIndex === 'number' ? payload.activeIndex : -1;
  const direction = payload.direction || 'stack';

  return (
    <div
      style={{
        padding: 16, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12,
        minHeight: direction === 'stack' ? 220 : undefined, display: 'flex', justifyContent: 'center', alignItems: 'center',
      }}
    >
      <StackQueueChipsViz values={values} activeIndex={activeIndex} direction={direction} emptyLabel="Empty" />
    </div>
  );
}
