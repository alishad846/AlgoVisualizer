import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import GraphTraceViz from '../GraphTraceViz.jsx';

describe('GraphTraceViz', () => {
  it('renders a label for each node', () => {
    render(<GraphTraceViz frame={{ data: { nodes: ['A', 'B'], edges: [] }, states: {} }} />);
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('renders a line for each edge', () => {
    const { container } = render(
      <GraphTraceViz frame={{ data: { nodes: ['A', 'B'], edges: [{ from: 'A', to: 'B' }] }, states: {} }} />
    );
    expect(container.querySelectorAll('line')).toHaveLength(1);
  });

  it('renders a legend with Active/Visited/Unvisited labels', () => {
    render(<GraphTraceViz frame={{ data: { nodes: ['A'], edges: [] }, states: {} }} />);
    expect(screen.getByText(/active/i)).toBeInTheDocument();
    expect(screen.getByText(/\bvisited\b/i)).toBeInTheDocument();
    expect(screen.getByText(/unvisited/i)).toBeInTheDocument();
  });
});
