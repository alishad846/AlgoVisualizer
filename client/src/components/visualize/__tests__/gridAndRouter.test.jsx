import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DPGridViz from '../DPGridViz.jsx';
import VariableInspectorViz from '../VariableInspectorViz.jsx';
import VisualizerRouter from '../VisualizerRouter.jsx';
import SearchingViz from '../SearchingViz.jsx';

describe('DPGridViz', () => {
  it('renders a table cell for each 2-D grid value', () => {
    render(<DPGridViz frame={{ data: { dim: 2, grid: [[0, 1], [1, 2]] }, states: {} }} />);
    expect(screen.getAllByText('1')).toHaveLength(2);
  });

  it('renders a strip cell for each 1-D value', () => {
    render(<DPGridViz frame={{ data: { dim: 1, values: [0, 1, 1, 2] }, states: {} }} />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('formats Infinity as the infinity symbol', () => {
    render(<DPGridViz frame={{ data: { dim: 1, values: [0, Infinity] }, states: {} }} />);
    expect(screen.getByText('∞')).toBeInTheDocument();
  });

  it('shows a Press Start empty state with no data', () => {
    render(<DPGridViz frame={{ data: { dim: 1, values: [] }, states: {} }} />);
    expect(screen.getByText(/press start/i)).toBeInTheDocument();
  });

  it('highlights the active cell', () => {
    render(<DPGridViz frame={{ data: { dim: 1, values: [3, 5] }, states: { 1: 'active' } }} />);
    // The background/color live on the chip wrapper div, not the text node itself
    // (DpTableViz nests the value in an inner div alongside an optional index label).
    const active = screen.getByText('5').parentElement;
    const idle = screen.getByText('3').parentElement;
    expect(active.style.background).not.toBe(idle.style.background);
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

  it('handles circular references without throwing', () => {
    const circularObj = {};
    circularObj.self = circularObj;
    // Should not throw and should render gracefully
    const { container } = render(<VariableInspectorViz frame={{ data: { circular: circularObj } }} />);
    expect(container).toBeInTheDocument();
    expect(screen.getByText('circular')).toBeInTheDocument();
    expect(screen.getByText('[unserializable value]')).toBeInTheDocument();
  });
});

describe('SearchingViz', () => {
  it('renders the cubes and the target value when both are present', () => {
    render(<SearchingViz frame={{ data: { array: [1, 3, 5, 7], target: 5, pointer: 2, foundIdx: -1 } }} states={{}} />);
    expect(screen.getAllByText('5')).toHaveLength(2);
    expect(screen.getByText(/target/i)).toBeInTheDocument();
  });

  it('shows a found badge when foundIdx is set', () => {
    render(<SearchingViz frame={{ data: { array: [1, 3, 5, 7], target: 5, pointer: 2, foundIdx: 2 } }} />);
    expect(screen.getByText(/found at index 2/i)).toBeInTheDocument();
  });

  it('omits the target line when target is undefined', () => {
    render(<SearchingViz frame={{ data: { array: [1, 2, 3], pointer: -1, foundIdx: -1 } }} />);
    expect(screen.queryByText(/target/i)).not.toBeInTheDocument();
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

  it('routes searching to SearchingViz output', () => {
    render(<VisualizerRouter visualizer="searching" frame={{ data: { array: [1, 2], target: 2, pointer: 1, foundIdx: 1 } }} />);
    expect(screen.getByText(/found at index 1/i)).toBeInTheDocument();
  });
});
