import { describe, it, expect } from 'vitest';
import { adaptVariableInspectorTrace } from '../variableInspectorAdapter.js';

describe('adaptVariableInspectorTrace', () => {
  it('never returns null, even for an empty trace', () => {
    const frames = adaptVariableInspectorTrace([]);
    expect(frames.length).toBeGreaterThanOrEqual(1);
  });

  it('reshapes every trace record into a frame carrying its raw locals', () => {
    const trace = [
      { line: 1, locals: { a: 1 }, callDepth: 0, event: 'step' },
      { line: 2, locals: { a: 2 }, callDepth: 0, event: 'step' },
    ];
    const frames = adaptVariableInspectorTrace(trace);
    expect(frames).toHaveLength(2);
    expect(frames[0].data).toEqual({ a: 1 });
    expect(frames[1].type).toBe('done');
  });
});
