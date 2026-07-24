import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StackQueueChipsViz from '../StackQueueChipsViz.jsx';

describe('StackQueueChipsViz', () => {
  it('shows the empty label when there are no values', () => {
    render(<StackQueueChipsViz values={[]} />);
    expect(screen.getByText('Empty Stack')).toBeInTheDocument();
  });

  it('renders a chip per value and a TOP label for stack direction', () => {
    render(<StackQueueChipsViz values={[3, 1]} direction="stack" />);
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('↑ TOP')).toBeInTheDocument();
  });

  it('renders a FRONT label for queue direction', () => {
    render(<StackQueueChipsViz values={[3, 1]} direction="queue" />);
    expect(screen.getByText('← FRONT')).toBeInTheDocument();
  });
});
