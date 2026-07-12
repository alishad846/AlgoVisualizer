import { describe, it, expect } from 'vitest';
import { adaptTrace } from '../index.js';

describe('adaptTrace dispatcher', () => {
  it('routes to the matching category adapter when a signal is found', () => {
    const trace = [
      { line: 1, locals: { arr: [2, 1] }, callDepth: 0, event: 'step' },
      { line: 2, locals: { arr: [1, 2] }, callDepth: 0, event: 'step' },
    ];
    const result = adaptTrace('sorting', trace);
    expect(result.visualizer).toBe('sorting');
    expect(result.frames.length).toBeGreaterThan(0);
  });

  it('falls back to the variable inspector when the category adapter finds nothing', () => {
    const trace = [{ line: 1, locals: { unrelated: true }, callDepth: 0, event: 'step' }];
    const result = adaptTrace('graph', trace);
    expect(result.visualizer).toBe('variable-inspector');
    expect(result.frames.length).toBeGreaterThan(0);
  });

  it('falls back to the variable inspector for an unknown/null category', () => {
    const trace = [{ line: 1, locals: { a: 1 }, callDepth: 0, event: 'step' }];
    const result = adaptTrace(null, trace);
    expect(result.visualizer).toBe('variable-inspector');
  });
});
