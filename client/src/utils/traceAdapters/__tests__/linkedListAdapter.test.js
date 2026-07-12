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
    expect(frames[0].data).toEqual([1, 2, 3]);
    expect(frames[0].type).toBe('done');
  });
});
