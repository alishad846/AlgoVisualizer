import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TreeViz from '../TreeViz.jsx';

const NODES = [
  { id: 'root', label: '5', depth: 0 },
  { id: 'rootL', label: '3', depth: 1 },
];
const EDGES = [{ from: 'root', to: 'rootL' }];

describe('TreeViz', () => {
  it('renders a circle and label for each node', () => {
    render(<TreeViz frame={{ data: { nodes: NODES, edges: EDGES, visitedOrder: [] }, states: {} }} />);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('does not render a visited-order strip when empty', () => {
    render(<TreeViz frame={{ data: { nodes: NODES, edges: EDGES, visitedOrder: [] }, states: {} }} />);
    expect(screen.queryByText('5', { selector: 'span' })).not.toBeInTheDocument();
  });

  it('renders a visited-order pill for each visited label', () => {
    render(<TreeViz frame={{ data: { nodes: NODES, edges: EDGES, visitedOrder: ['5', '3'] }, states: { root: 'active' } }} />);
    expect(screen.getAllByText('5')).toHaveLength(2);
  });
});
