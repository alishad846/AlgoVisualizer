import { describe, it, expect } from 'vitest';
import { adaptArrayTrace } from '../sortingSearchingAdapter.js';

describe('adaptArrayTrace', () => {
  it('returns null when no array-of-primitives local is found', () => {
    const trace = [{ line: 1, locals: { x: 1 }, callDepth: 0, event: 'step' }];
    expect(adaptArrayTrace(trace)).toBeNull();
  });

  it('tracks the most frequently seen array local across the trace', () => {
    const trace = [
      { line: 1, locals: { arr: [3, 1, 2] }, callDepth: 0, event: 'step' },
      { line: 2, locals: { arr: [1, 3, 2] }, callDepth: 0, event: 'step' },
      { line: 3, locals: { arr: [1, 2, 3] }, callDepth: 0, event: 'step' },
    ];
    const frames = adaptArrayTrace(trace);
    expect(frames).toHaveLength(3);
    expect(frames[0].data).toEqual([3, 1, 2]);
    expect(frames[2].data).toEqual([1, 2, 3]);
    expect(frames[2].type).toBe('done');
  });

  it('marks changed indices with a swap state', () => {
    const trace = [
      { line: 1, locals: { arr: [3, 1, 2] }, callDepth: 0, event: 'step' },
      { line: 2, locals: { arr: [1, 3, 2] }, callDepth: 0, event: 'step' },
    ];
    const frames = adaptArrayTrace(trace);
    expect(frames[1].states[0]).toBe('swap');
    expect(frames[1].states[1]).toBe('swap');
    expect(frames[1].type).toBe('done');
  });
});
