import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LinkedListViz from '../LinkedListViz.jsx';

describe('LinkedListViz', () => {
  it('renders just the trailing null box with no values', () => {
    render(<LinkedListViz frame={{ data: { values: [], activeIndex: -1 } }} />);
    expect(screen.getByText('null')).toBeInTheDocument();
  });

  it('renders a null terminator after the last node', () => {
    render(<LinkedListViz frame={{ data: { values: [1, 2], activeIndex: 0 } }} />);
    expect(screen.getByText('null')).toBeInTheDocument();
  });

  it('highlights the active index distinctly from other nodes', () => {
    render(<LinkedListViz frame={{ data: { values: [1, 2], activeIndex: 1 } }} />);
    const active = screen.getByText('2');
    const idle = screen.getByText('1');
    expect(active.className).toContain('active');
    expect(idle.className).not.toContain('active');
  });
});
