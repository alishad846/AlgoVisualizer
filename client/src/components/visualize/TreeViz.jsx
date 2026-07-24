import TreeSvg from '../visualize-shared/TreeSvg.jsx';

export default function TreeViz({ frame }) {
  const nodes = (frame && frame.data && frame.data.nodes) || [];
  const edges = (frame && frame.data && frame.data.edges) || [];
  const visitedOrder = (frame && frame.data && frame.data.visitedOrder) || [];
  const states = (frame && frame.states) || {};
  const activeId = Object.keys(states).find((id) => states[id] === 'active');

  return <TreeSvg nodes={nodes} edges={edges} activeId={activeId} visitedOrder={visitedOrder} />;
}
