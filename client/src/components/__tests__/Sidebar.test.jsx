import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from '../Sidebar.jsx';

describe('Sidebar', () => {
  it('renders a link to Visualize My Code below the algorithm categories', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );
    const link = screen.getByRole('link', { name: /visualize my code/i });
    expect(link).toHaveAttribute('href', '/visualize-my-code');
  });

  it('still renders the Documentation and Support footer links', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );
    expect(screen.getByRole('link', { name: /documentation/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /support/i })).toBeInTheDocument();
  });
});
