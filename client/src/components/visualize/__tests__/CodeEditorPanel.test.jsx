import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CodeEditorPanel from '../CodeEditorPanel.jsx';

describe('CodeEditorPanel', () => {
  it('renders the current code in the textarea', () => {
    render(<CodeEditorPanel code="let x = 1;" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toHaveValue('let x = 1;');
  });

  it('renders one line-number row per line', () => {
    render(<CodeEditorPanel code={'a\nb\nc'} onChange={() => {}} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('calls onChange with the new value when edited', () => {
    const onChange = vi.fn();
    render(<CodeEditorPanel code="a" onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'ab' } });
    expect(onChange).toHaveBeenCalledWith('ab');
  });
});
