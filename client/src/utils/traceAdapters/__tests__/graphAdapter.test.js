import { describe, it, expect } from 'vitest';
import { adaptGraphTrace } from '../graphAdapter.js';

describe('adaptGraphTrace', () => {
  it('returns null when no visited-named local is found', () => {
    const trace = [{ line: 1, locals: { x: 1 }, callDepth: 0, event: 'step' }];
    expect(adaptGraphTrace(trace)).toBeNull();
  });

  it('marks nodes as visited/unvisited based on a visited set across the trace', () => {
    const trace = [
      { line: 1, locals: { visited: ['a'] }, callDepth: 0, event: 'step' },
      { line: 2, locals: { visited: ['a', 'b'] }, callDepth: 0, event: 'step' },
    ];
    const frames = adaptGraphTrace(trace);
    expect(frames).toHaveLength(2);
    expect(frames[1].states.a).toBe('sorted');
    expect(frames[1].states.b).toBe('sorted');
    expect(frames[1].type).toBe('done');
  });
});
