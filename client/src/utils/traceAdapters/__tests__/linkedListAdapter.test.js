import { describe, it, expect } from 'vitest';
import { adaptLinkedListTrace } from '../linkedListAdapter.js';

describe('adaptLinkedListTrace', () => {
  it('returns null when no next-chained object is found', () => {
    const trace = [{ line: 1, locals: { x: 1 }, callDepth: 0, event: 'step' }];
    expect(adaptLinkedListTrace(trace)).toBeNull();
  });

  it('walks a serialized next-chain into a flat value list', () => {
    const trace = [
      {
        line: 1,
        locals: { head: { value: 1, next: { value: 2, next: { value: 3, next: null } } } },
        callDepth: 0,
        event: 'step',
      },
    ];
    const frames = adaptLinkedListTrace(trace);
    expect(frames).toHaveLength(1);
    expect(frames[0].data.values).toEqual([1, 2, 3]);
    expect(frames[0].type).toBe('done');
  });

  it('marks index 0 (the currently traced node) as active', () => {
    const trace = [
      { line: 1, locals: { node: { value: 1, next: { value: 2, next: null } } }, callDepth: 0, event: 'step' },
    ];
    const frames = adaptLinkedListTrace(trace);
    expect(frames[0].data.activeIndex).toBe(0);
    expect(frames[0].data.values).toEqual([1, 2]);
  });

  it('reports activeIndex -1 for an empty chain', () => {
    const trace = [{ line: 1, locals: { node: null }, callDepth: 0, event: 'step' }];
    expect(adaptLinkedListTrace(trace)).toBeNull();
  });
});
