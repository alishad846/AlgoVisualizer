import { describe, it, expect } from 'vitest';
import { adaptArrayTrace, adaptSearchingTrace } from '../sortingSearchingAdapter.js';

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

  it('marks changed indices with a comparing state', () => {
    const trace = [
      { line: 1, locals: { arr: [3, 1, 2] }, callDepth: 0, event: 'step' },
      { line: 2, locals: { arr: [1, 3, 2] }, callDepth: 0, event: 'step' },
    ];
    const frames = adaptArrayTrace(trace);
    expect(frames[1].states[0]).toBe('comparing');
    expect(frames[1].states[1]).toBe('comparing');
    expect(frames[1].type).toBe('done');
  });

  it('prefers the array at the shallowest call depth over a more-frequent inner fragment (merge sort case)', () => {
    // Reproduces: mergeSort(arr) calls merge(left, right) many times; left/right/result
    // (small fragments, deep call depth) used to outvote the real top-level array on
    // raw frequency alone, so the adapter animated a leftover fragment instead of `arr`.
    const trace = [
      { line: 1, locals: { arr: [3, 1, 4, 2] }, callDepth: 0, event: 'step' },
      { line: 2, locals: { left: [3, 1], right: [4, 2] }, callDepth: 1, event: 'step' },
      { line: 3, locals: { left: [1, 3], right: [4, 2] }, callDepth: 1, event: 'step' },
      { line: 4, locals: { left: [1, 3], right: [2, 4] }, callDepth: 1, event: 'step' },
      { line: 5, locals: { result: [1, 3, 2, 4] }, callDepth: 1, event: 'step' },
      { line: 6, locals: { arr: [1, 2, 3, 4] }, callDepth: 0, event: 'step' },
    ];
    const frames = adaptArrayTrace(trace);
    expect(frames[0].data).toEqual([3, 1, 4, 2]);
    expect(frames[frames.length - 1].data).toEqual([1, 2, 3, 4]);
  });
});

describe('adaptArrayTrace compare highlighting', () => {
  it('marks a compared-but-unswapped index with a comparing state', () => {
    const trace = [
      { line: 1, locals: { arr: [1, 3, 2], j: 0 }, callDepth: 0, event: 'step' },
      { line: 2, locals: { arr: [1, 3, 2], j: 1 }, callDepth: 0, event: 'step' },
      { line: 3, locals: { arr: [1, 2, 3], j: 1 }, callDepth: 0, event: 'step' },
    ];
    const frames = adaptArrayTrace(trace);
    expect(frames[1].states[1]).toBe('comparing');
    expect(frames[1].type).toBe('compare');
    expect(frames[2].type).toBe('done');
  });
});

describe('adaptSearchingTrace', () => {
  it('returns null when no array-of-primitives local is found', () => {
    const trace = [{ line: 1, locals: { x: 1 }, callDepth: 0, event: 'step' }];
    expect(adaptSearchingTrace(trace)).toBeNull();
  });

  it('detects a constant target and a varying pointer, and marks found on the last frame', () => {
    const trace = [
      { line: 1, locals: { arr: [1, 3, 5, 7, 9], target: 5, low: 0, high: 4, mid: 0 }, callDepth: 0, event: 'step' },
      { line: 2, locals: { arr: [1, 3, 5, 7, 9], target: 5, low: 0, high: 4, mid: 2 }, callDepth: 0, event: 'step' },
    ];
    const frames = adaptSearchingTrace(trace);
    expect(frames).toHaveLength(2);
    expect(frames[0].data.array).toEqual([1, 3, 5, 7, 9]);
    expect(frames[0].data.target).toBe(5);
    expect(frames[1].data.foundIdx).toBe(2);
    expect(frames[0].data.foundIdx).toBe(-1);
  });

  it('reports foundIdx -1 on the last frame when the final pointer does not match the target', () => {
    const trace = [
      { line: 1, locals: { arr: [1, 3, 5, 7, 9], target: 99, low: 0, high: 4, mid: 2 }, callDepth: 0, event: 'step' },
      { line: 2, locals: { arr: [1, 3, 5, 7, 9], target: 99, low: 3, high: 2, mid: 4 }, callDepth: 0, event: 'step' },
    ];
    const frames = adaptSearchingTrace(trace);
    expect(frames[frames.length - 1].data.foundIdx).toBe(-1);
  });

  it('omits target when no constant scalar can be found', () => {
    const trace = [
      { line: 1, locals: { arr: [1, 2, 3], i: 0 }, callDepth: 0, event: 'step' },
      { line: 2, locals: { arr: [1, 2, 3], i: 1 }, callDepth: 0, event: 'step' },
    ];
    const frames = adaptSearchingTrace(trace);
    expect(frames[0].data.target).toBeUndefined();
  });
});
