import { describe, it, expect } from 'vitest';
import { adaptDpTrace } from '../dpAdapter.js';

describe('adaptDpTrace', () => {
  it('returns null when no 2D numeric array local is found', () => {
    const trace = [{ line: 1, locals: { x: 1 }, callDepth: 0, event: 'step' }];
    expect(adaptDpTrace(trace)).toBeNull();
  });

  it('tracks a 2D numeric array local as a grid over time', () => {
    const trace = [
      { line: 1, locals: { dp: [[0, 0], [0, 1]] }, callDepth: 0, event: 'step' },
      { line: 2, locals: { dp: [[0, 1], [1, 1]] }, callDepth: 0, event: 'step' },
    ];
    const frames = adaptDpTrace(trace);
    expect(frames).toHaveLength(2);
    expect(frames[1].data).toEqual([[0, 1], [1, 1]]);
    expect(frames[1].type).toBe('done');
  });
});
