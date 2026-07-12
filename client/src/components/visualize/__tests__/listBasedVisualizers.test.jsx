import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CallStackViz from '../CallStackViz.jsx';
import LinkedListViz from '../LinkedListViz.jsx';
import StackQueueViz from '../StackQueueViz.jsx';

describe('CallStackViz', () => {
  it('shows an empty state with no frame data', () => {
    render(<CallStackViz frame={{ data: [] }} />);
    expect(screen.getByText(/call stack is empty/i)).toBeInTheDocument();
  });

  it('renders each call stack entry with its name and args', () => {
    render(<CallStackViz frame={{ data: [{ name: 'factorial', args: { n: 3 } }] }} />);
    expect(screen.getByText('factorial')).toBeInTheDocument();
    expect(screen.getByText(/n=3/)).toBeInTheDocument();
  });
});

describe('LinkedListViz', () => {
  it('shows an empty state with no values', () => {
    render(<LinkedListViz frame={{ data: [] }} />);
    expect(screen.getByText(/list is empty/i)).toBeInTheDocument();
  });

  it('renders each value in the chain', () => {
    render(<LinkedListViz frame={{ data: [1, 2, 3] }} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});

describe('StackQueueViz', () => {
  it('shows an empty state with no values', () => {
    render(<StackQueueViz frame={{ data: [] }} />);
    expect(screen.getByText(/empty/i)).toBeInTheDocument();
  });

  it('renders each value', () => {
    render(<StackQueueViz frame={{ data: [10, 20] }} />);
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });
});
