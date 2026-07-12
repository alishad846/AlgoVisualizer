import { describe, it, expect } from 'vitest';
import { adaptRecursionTrace } from '../recursionAdapter.js';

describe('adaptRecursionTrace', () => {
  it('returns null for an empty trace', () => {
    expect(adaptRecursionTrace([])).toBeNull();
  });

  it('builds a growing/shrinking call stack from call/return events', () => {
    const trace = [
      { line: 0, locals: { n: 3 }, callDepth: 1, event: 'call', functionName: 'factorial' },
      { line: 0, locals: { n: 2 }, callDepth: 2, event: 'call', functionName: 'factorial' },
      { line: 0, locals: {}, callDepth: 1, event: 'return', functionName: 'factorial' },
      { line: 0, locals: {}, callDepth: 0, event: 'return', functionName: 'factorial' },
    ];
    const frames = adaptRecursionTrace(trace);
    expect(frames).toHaveLength(4);
    expect(frames[0].data).toHaveLength(1);
    expect(frames[1].data).toHaveLength(2);
    expect(frames[2].data).toHaveLength(1);
    expect(frames[3].data).toHaveLength(0);
    expect(frames[3].type).toBe('done');
  });
});
