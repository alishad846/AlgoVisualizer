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
    expect(frames[1].data.dim).toBe(2);
    expect(frames[1].data.grid).toEqual([[0, 1], [1, 1]]);
    expect(frames[1].type).toBe('done');
  });

  it('detects a 1-D numeric array (e.g. Fibonacci) where the old adapter would have failed', () => {
    const trace = [
      { line: 1, locals: { dp: [0, 1, 1, 2, 3] }, callDepth: 0, event: 'step' },
    ];
    const frames = adaptDpTrace(trace);
    expect(frames).not.toBeNull();
    expect(frames[0].data.dim).toBe(1);
    expect(frames[0].data.values).toEqual([0, 1, 1, 2, 3]);
  });

  it('marks the active index for a 1-D dp array using a varying pointer local', () => {
    const trace = [
      { line: 1, locals: { dp: [0, 1, 1], i: 1 }, callDepth: 0, event: 'step' },
      { line: 2, locals: { dp: [0, 1, 1], i: 2 }, callDepth: 0, event: 'step' },
    ];
    const frames = adaptDpTrace(trace);
    expect(frames[0].states[1]).toBe('active');
    expect(frames[1].states[2]).toBe('active');
  });

  it('marks the active cell for a 2-D dp grid using two varying pointer locals', () => {
    const trace = [
      { line: 1, locals: { dp: [[0, 0], [0, 1]], i: 1, w: 1 }, callDepth: 0, event: 'step' },
      { line: 2, locals: { dp: [[0, 0], [0, 1]], i: 1, w: 0 }, callDepth: 0, event: 'step' },
    ];
    const frames = adaptDpTrace(trace);
    expect(frames[0].states['1,1']).toBe('active');
    expect(frames[1].states['1,0']).toBe('active');
  });
});
