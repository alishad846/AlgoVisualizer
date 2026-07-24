import LinkedListChainViz from '../visualize-shared/LinkedListChainViz.jsx';

export default function LinkedListViz({ frame }) {
  const payload = (frame && frame.data) || {};
  const values = payload.values || [];
  const activeIndex = typeof payload.activeIndex === 'number' ? payload.activeIndex : -1;

  return <LinkedListChainViz nodes={values} activeIdx={activeIndex} visitedSet={new Set()} />;
}
