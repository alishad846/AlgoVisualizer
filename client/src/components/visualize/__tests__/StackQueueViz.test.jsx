import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StackQueueViz from '../StackQueueViz.jsx';

describe('StackQueueViz', () => {
  it('shows an empty state with no values', () => {
    render(<StackQueueViz frame={{ data: { values: [], activeIndex: -1, direction: 'stack' } }} />);
    expect(screen.getByText(/empty/i)).toBeInTheDocument();
  });

  it('shows a TOP label for stack direction', () => {
    render(<StackQueueViz frame={{ data: { values: [1, 2], activeIndex: 1, direction: 'stack' } }} />);
    expect(screen.getByText(/top/i)).toBeInTheDocument();
  });

  it('shows a FRONT label for queue direction', () => {
    render(<StackQueueViz frame={{ data: { values: [1, 2], activeIndex: 0, direction: 'queue' } }} />);
    expect(screen.getByText(/front/i)).toBeInTheDocument();
  });

  it('highlights the active index distinctly', () => {
    render(<StackQueueViz frame={{ data: { values: [1, 2], activeIndex: 1, direction: 'stack' } }} />);
    const active = screen.getByText('2');
    const idle = screen.getByText('1');
    expect(active.style.background).not.toBe(idle.style.background);
  });
});
