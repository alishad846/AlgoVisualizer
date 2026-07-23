import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CallStackViz from '../CallStackViz.jsx';

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
