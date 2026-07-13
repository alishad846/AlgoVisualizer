import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DPGridViz from '../DPGridViz.jsx';
import VariableInspectorViz from '../VariableInspectorViz.jsx';
import VisualizerRouter from '../VisualizerRouter.jsx';

describe('DPGridViz', () => {
  it('renders a table cell for each grid value', () => {
    render(<DPGridViz frame={{ data: [[0, 1], [1, 2]] }} />);
    expect(screen.getAllByText('1')).toHaveLength(2);
  });
});

describe('VariableInspectorViz', () => {
  it('shows an empty state with no variables', () => {
    render(<VariableInspectorViz frame={{ data: {} }} />);
    expect(screen.getByText(/no variables captured/i)).toBeInTheDocument();
  });

  it('renders each variable name and value', () => {
    render(<VariableInspectorViz frame={{ data: { count: 5 } }} />);
    expect(screen.getByText('count')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });
});

describe('VisualizerRouter', () => {
  it('returns null when there is no current frame', () => {
    const { container } = render(<VisualizerRouter visualizer="sorting" frame={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('routes recursion to CallStackViz output', () => {
    render(<VisualizerRouter visualizer="recursion" frame={{ data: [] }} />);
    expect(screen.getByText(/call stack is empty/i)).toBeInTheDocument();
  });

  it('routes an unknown visualizer to the variable inspector', () => {
    render(<VisualizerRouter visualizer="variable-inspector" frame={{ data: {} }} />);
    expect(screen.getByText(/no variables captured/i)).toBeInTheDocument();
  });
});
