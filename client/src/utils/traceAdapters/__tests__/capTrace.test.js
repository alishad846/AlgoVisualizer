import { describe, it, expect } from 'vitest';
import { capTrace } from '../capTrace.js';

describe('capTrace', () => {
  it('returns the trace unchanged when under the cap', () => {
    const trace = [{ line: 1 }, { line: 2 }];
    const result = capTrace(trace, 10);
    expect(result.frames).toEqual(trace);
    expect(result.truncated).toBe(false);
  });

  it('truncates and flags when over the cap', () => {
    const trace = Array.from({ length: 20 }, (_, i) => ({ line: i }));
    const result = capTrace(trace, 5);
    expect(result.frames).toHaveLength(5);
    expect(result.truncated).toBe(true);
  });

  it('handles a non-array input gracefully', () => {
    const result = capTrace(undefined, 5);
    expect(result.frames).toEqual([]);
    expect(result.truncated).toBe(false);
  });
});
