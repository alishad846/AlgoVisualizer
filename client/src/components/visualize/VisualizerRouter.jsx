import CubeVisualizer from '../CubeVisualizer.jsx';
import CallStackViz from './CallStackViz.jsx';
import LinkedListViz from './LinkedListViz.jsx';
import StackQueueViz from './StackQueueViz.jsx';
import TreeViz from './TreeViz.jsx';
import GraphTraceViz from './GraphTraceViz.jsx';
import DPGridViz from './DPGridViz.jsx';
import VariableInspectorViz from './VariableInspectorViz.jsx';

export default function VisualizerRouter({ visualizer, frame }) {
  if (!frame) return null;

  switch (visualizer) {
    case 'sorting':
    case 'searching':
      return <CubeVisualizer array={frame.data} states={frame.states} />;
    case 'recursion':
      return <CallStackViz frame={frame} />;
    case 'linked-list':
      return <LinkedListViz frame={frame} />;
    case 'stack-queue':
      return <StackQueueViz frame={frame} />;
    case 'tree':
      return <TreeViz frame={frame} />;
    case 'graph':
      return <GraphTraceViz frame={frame} />;
    case 'dp':
      return <DPGridViz frame={frame} />;
    default:
      return <VariableInspectorViz frame={frame} />;
  }
}
