import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import TreeSvg from '../TreeSvg.jsx';

describe('TreeSvg', () => {
  it('renders one circle+text per node', () => {
    const nodes = [
      { id: 'root', label: '4', depth: 0 },
      { id: 'rootL', label: '2', depth: 1 },
      { id: 'rootR', label: '6', depth: 1 },
    ];
    const edges = [{ from: 'root', to: 'rootL' }, { from: 'root', to: 'rootR' }];
    const { container } = render(<TreeSvg nodes={nodes} edges={edges} />);
    expect(container.querySelectorAll('circle').length).toBe(3);
    expect(container.querySelectorAll('line').length).toBe(2);
  });

  it('fills the active node with the active-bg color', () => {
    const nodes = [{ id: 'root', label: '4', depth: 0 }];
    const { container } = render(<TreeSvg nodes={nodes} edges={[]} activeId="root" />);
    const circle = container.querySelector('circle');
    expect(circle.getAttribute('fill')).toBe('var(--active-bg)');
  });

  it('renders a visited-order pill per entry when provided', () => {
    const { getByText } = render(<TreeSvg nodes={[]} edges={[]} visitedOrder={['4', '2']} />);
    expect(getByText('4')).toBeInTheDocument();
    expect(getByText('2')).toBeInTheDocument();
  });
});
