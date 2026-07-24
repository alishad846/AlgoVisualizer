import DpTableViz from '../visualize-shared/DpTableViz.jsx';

export default function DPGridViz({ frame }) {
  const payload = (frame && frame.data) || {};
  const states = (frame && frame.states) || {};
  const dim = payload.dim || 2;

  if (dim === 1) {
    const activeKey = Object.keys(states).find((k) => states[k] === 'active');
    const active = activeKey !== undefined ? Number(activeKey) : -1;
    return <DpTableViz dim={1} values={payload.values || []} active={active} colorScheme="green" />;
  }

  const activeKey = Object.keys(states).find((k) => states[k] === 'active');
  const active = activeKey !== undefined ? activeKey.split(',').map(Number) : [-1, -1];
  return <DpTableViz dim={2} grid={payload.grid || []} active={active} colorScheme="green" />;
}
