import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import VisualizeMyCodePage from '../VisualizeMyCodePage.jsx';

vi.mock('../../../utils/tracer/runJsTrace.js', () => ({
  runJsTrace: vi.fn(),
}));

import { runJsTrace } from '../../../utils/tracer/runJsTrace.js';

function renderPage() {
  return render(
    <MemoryRouter>
      <VisualizeMyCodePage />
    </MemoryRouter>
  );
}

beforeEach(() => {
  runJsTrace.mockReset();
});

describe('VisualizeMyCodePage', () => {
  it('renders the default starter code in the editor', () => {
    renderPage();
    expect(screen.getByRole('textbox').value).toContain('bubbleSort');
  });

  it('runs detection + tracing and shows playback controls once frames exist', async () => {
    runJsTrace.mockResolvedValue({
      trace: [
        { line: 1, locals: { arr: [3, 1] }, callDepth: 0, event: 'step' },
        { line: 2, locals: { arr: [1, 3] }, callDepth: 0, event: 'step' },
      ],
      truncated: false,
    });

    renderPage();
    fireEvent.click(screen.getByText('Detect & Visualize'));

    await waitFor(() => expect(screen.getByText('▶ Play')).toBeInTheDocument());
    expect(screen.getByText(/Step:/)).toBeInTheDocument();
  });

  it('shows an error message instead of a fake animation when execution fails', async () => {
    runJsTrace.mockRejectedValue(new Error('Unexpected token'));

    renderPage();
    fireEvent.click(screen.getByText('Detect & Visualize'));

    await waitFor(() => expect(screen.getByText('Unexpected token')).toBeInTheDocument());
    expect(screen.queryByText('▶ Play')).not.toBeInTheDocument();
  });
});
