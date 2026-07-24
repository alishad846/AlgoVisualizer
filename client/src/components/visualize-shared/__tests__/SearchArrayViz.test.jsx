import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SearchArrayViz from '../SearchArrayViz.jsx';

describe('SearchArrayViz', () => {
  it('renders one cube per array value', () => {
    render(<SearchArrayViz array={[5, 2, 8]} />);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
  });

  it('marks the found index with the found state class', () => {
    render(<SearchArrayViz array={[5, 2, 8]} foundIdx={1} />);
    const cube = screen.getAllByText('2')[0].closest('.cube-wrap').querySelector('.cube');
    expect(cube.className).toContain('state-found');
  });

  it('marks every cube notfound when notFound is true and nothing was found', () => {
    render(<SearchArrayViz array={[5, 2, 8]} notFound />);
    const cube = screen.getAllByText('5')[0].closest('.cube-wrap').querySelector('.cube');
    expect(cube.className).toContain('state-notfound');
  });

  it('shows the target label only when target is defined', () => {
    const { rerender } = render(<SearchArrayViz array={[1, 2]} target={2} />);
    expect(screen.getByText('2', { selector: 'strong' })).toBeInTheDocument();
    rerender(<SearchArrayViz array={[1, 2]} />);
    expect(screen.queryByText('Target:')).not.toBeInTheDocument();
  });
});
