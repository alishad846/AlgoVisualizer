import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TreeViz from '../TreeViz.jsx';
import GraphTraceViz from '../GraphTraceViz.jsx';

describe('TreeViz', () => {
  it('renders a labeled circle for each node', () => {
    const frame = {
      data: {
        nodes: [{ id: 'root', label: '5' }, { id: 'rootL', label: '3' }],
        edges: [{ from: 'root', to: 'rootL' }],
      },
    };
    render(<TreeViz frame={frame} />);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders without crashing when there is no data', () => {
    render(<TreeViz frame={{ data: { nodes: [], edges: [] } }} />);
  });
});

describe('GraphTraceViz', () => {
  it('renders a labeled circle for each node', () => {
    const frame = { data: { nodes: ['a', 'b'] }, states: { a: 'sorted', b: 'info' } };
    render(<GraphTraceViz frame={frame} />);
    expect(screen.getByText('a')).toBeInTheDocument();
    expect(screen.getByText('b')).toBeInTheDocument();
  });

  it('renders without crashing when there is no data', () => {
    render(<GraphTraceViz frame={{ data: { nodes: [] }, states: {} }} />);
  });
});
