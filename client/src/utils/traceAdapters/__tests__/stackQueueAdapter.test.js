import { describe, it, expect } from 'vitest';
import { adaptStackQueueTrace } from '../stackQueueAdapter.js';

describe('adaptStackQueueTrace', () => {
  it('returns null when no stack/queue-named array local is found', () => {
    const trace = [{ line: 1, locals: { arr: [1, 2] }, callDepth: 0, event: 'step' }];
    expect(adaptStackQueueTrace(trace)).toBeNull();
  });

  it('tracks an array local whose name contains "stack" or "queue"', () => {
    const trace = [
      { line: 1, locals: { queue: [1] }, callDepth: 0, event: 'step' },
      { line: 2, locals: { queue: [1, 2] }, callDepth: 0, event: 'step' },
    ];
    const frames = adaptStackQueueTrace(trace);
    expect(frames).toHaveLength(2);
    expect(frames[1].data).toEqual([1, 2]);
    expect(frames[1].type).toBe('done');
  });
});
