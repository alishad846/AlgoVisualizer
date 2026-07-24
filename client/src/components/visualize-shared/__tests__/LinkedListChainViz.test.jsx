import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LinkedListChainViz from '../LinkedListChainViz.jsx';

describe('LinkedListChainViz', () => {
  it('renders just the trailing null box with no nodes (matching LinkedListPage\'s original unconditional-null-box behavior)', () => {
    render(<LinkedListChainViz nodes={[]} />);
    expect(screen.getByText('null')).toBeInTheDocument();
  });

  it('renders one box per node plus a trailing null box', () => {
    render(<LinkedListChainViz nodes={[1, 2, 3]} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('null')).toBeInTheDocument();
  });

  it('marks the active node with the active node-box class', () => {
    render(<LinkedListChainViz nodes={[1, 2, 3]} activeIdx={1} />);
    expect(screen.getByText('2').className).toContain('active');
  });

  it('marks visited nodes with the visited node-box class', () => {
    render(<LinkedListChainViz nodes={[1, 2, 3]} visitedSet={new Set([0])} />);
    expect(screen.getByText('1').className).toContain('visited');
  });
});
