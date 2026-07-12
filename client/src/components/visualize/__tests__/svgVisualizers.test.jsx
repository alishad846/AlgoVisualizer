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

  it('places two 10+ children-array siblings at the same computed row despite differing id string length', () => {
    const frame = {
      data: {
        nodes: [
          { id: 'root', label: 'root', depth: 0 },
          { id: 'rootC9', label: 'c9', depth: 1 },
          { id: 'rootC10', label: 'c10', depth: 1 },
        ],
        edges: [
          { from: 'root', to: 'rootC9' },
          { from: 'root', to: 'rootC10' },
        ],
      },
    };
    const { container } = render(<TreeViz frame={frame} />);
    const circles = Array.from(container.querySelectorAll('circle'));
    const c9 = circles.find((c) => c.nextSibling && c.nextSibling.textContent === 'c9');
    const c10 = circles.find((c) => c.nextSibling && c.nextSibling.textContent === 'c10');
    expect(c9.getAttribute('cy')).toBe(c10.getAttribute('cy'));
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
