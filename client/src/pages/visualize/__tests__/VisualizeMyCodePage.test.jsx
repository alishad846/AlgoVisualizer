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

  it('shows an error message when language is not supported', async () => {
    renderPage();
    const editor = screen.getByRole('textbox');
    fireEvent.change(editor, { target: { value: 'hello world this is not code' } });
    fireEvent.click(screen.getByText('Detect & Visualize'));

    await waitFor(() =>
      expect(screen.getByText('Full visualization currently supports JavaScript and Python. Paste code in one of these languages for the smoothest experience.')).toBeInTheDocument()
    );
    expect(screen.queryByText('▶ Play')).not.toBeInTheDocument();
  });

  it('shows a swaps counter and a sorted banner once a sorting run completes', async () => {
    runJsTrace.mockResolvedValue({
      trace: [
        { line: 1, locals: { arr: [1, 3] }, callDepth: 0, event: 'step' },
      ],
      truncated: false,
    });

    renderPage();
    fireEvent.click(screen.getByText('Detect & Visualize'));

    await waitFor(() => expect(screen.getByText(/Swaps:/)).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText(/Sorted in/i)).toBeInTheDocument());
  });

  it('does not show the sorted banner until the final frame of a multi-frame run', async () => {
    runJsTrace.mockResolvedValue({
      trace: [
        { line: 1, locals: { arr: [3, 1, 2] }, callDepth: 0, event: 'step' },
        { line: 2, locals: { arr: [1, 3, 2] }, callDepth: 0, event: 'step' },
        { line: 3, locals: { arr: [1, 2, 3] }, callDepth: 0, event: 'step' },
      ],
      truncated: false,
    });

    renderPage();
    fireEvent.click(screen.getByText('Detect & Visualize'));

    await waitFor(() => expect(screen.getByText(/Swaps:/)).toBeInTheDocument());
    expect(screen.queryByText(/Sorted in/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Next ▶'));
    expect(screen.queryByText(/Sorted in/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Next ▶'));
    await waitFor(() => expect(screen.getByText(/Sorted in/i)).toBeInTheDocument());
  });

  it('does not show a category-override dropdown', async () => {
    runJsTrace.mockResolvedValue({
      trace: [{ line: 1, locals: { arr: [3, 1] }, callDepth: 0, event: 'step' }],
      truncated: false,
    });

    const { container } = renderPage();
    fireEvent.click(screen.getByText('Detect & Visualize'));

    await waitFor(() => expect(screen.getByText(/Detected:/)).toBeInTheDocument());
    // Only the playback Speed <select> should remain — no category-override select.
    expect(container.querySelectorAll('select').length).toBe(1);
  });
});
