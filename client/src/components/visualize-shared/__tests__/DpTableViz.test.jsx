import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DpTableViz from '../DpTableViz.jsx';

describe('DpTableViz', () => {
  it('shows the empty label when dim=1 and values is empty', () => {
    render(<DpTableViz dim={1} values={[]} />);
    expect(screen.getByText('Press Start')).toBeInTheDocument();
  });

  it('renders one chip per 1-D value, formatting Infinity as ∞', () => {
    render(<DpTableViz dim={1} values={[0, 1, Infinity]} />);
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('∞')).toBeInTheDocument();
  });

  it('renders an index label under each 1-D chip when provided', () => {
    render(<DpTableViz dim={1} values={[5, 8]} indexLabel={(i) => `n=${i}`} />);
    expect(screen.getByText('n=0')).toBeInTheDocument();
    expect(screen.getByText('n=1')).toBeInTheDocument();
  });

  it('renders a 2-D grid as a table', () => {
    render(<DpTableViz dim={2} grid={[[0, 0], [0, 3]]} />);
    const cells = screen.getAllByText('0');
    expect(cells.length).toBe(3);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders row/col labels when provided (LCS header case)', () => {
    render(<DpTableViz dim={2} grid={[[0, 0], [0, 1]]} rowLabels={['', 'A']} colLabels={['B']} />);
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('shows the empty label when dim=2 and grid is empty', () => {
    render(<DpTableViz dim={2} grid={[]} />);
    expect(screen.getByText('Press Start')).toBeInTheDocument();
  });
});
