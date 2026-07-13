import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CallStackViz from '../CallStackViz.jsx';

describe('CallStackViz', () => {
  it('shows an empty state with no frames', () => {
    render(<CallStackViz frame={{ data: [] }} />);
    expect(screen.getByText(/call stack is empty/i)).toBeInTheDocument();
  });

  it('renders each call with its name and args', () => {
    render(<CallStackViz frame={{ data: [{ name: 'fact', args: { n: 3 }, depth: 0 }] }} />);
    expect(screen.getByText('fact')).toBeInTheDocument();
    expect(screen.getByText(/n=3/)).toBeInTheDocument();
  });

  it('indents a deeper call further than a shallower one', () => {
    render(
      <CallStackViz
        frame={{
          data: [
            { name: 'fact', args: { n: 3 }, depth: 0 },
            { name: 'fact', args: { n: 2 }, depth: 1 },
          ],
        }}
      />
    );
    const calls = screen.getAllByText('fact');
    const shallow = calls[0].closest('div');
    const deep = calls[1].closest('div');
    expect(deep.style.marginLeft).not.toBe(shallow.style.marginLeft);
  });
});
