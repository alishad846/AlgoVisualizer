import { describe, it, expect } from 'vitest';
import { createTraceHarness } from '../traceHarness.js';

describe('createTraceHarness', () => {
  it('collects step records with line, locals, callDepth and event', () => {
    const harness = createTraceHarness();
    harness.__trace(1, { x: 1 });
    harness.__trace(2, { x: 2 });
    const trace = harness.getTrace();
    expect(trace).toHaveLength(2);
    expect(trace[0]).toEqual({ line: 1, locals: { x: 1 }, callDepth: 0, event: 'step' });
  });

  it('tracks call depth across enter/exit frame calls', () => {
    const harness = createTraceHarness();
    harness.__enterFrame('outer', { a: 1 });
    harness.__trace(5, { a: 1 });
    harness.__enterFrame('inner', { b: 2 });
    harness.__trace(6, { b: 2 });
    harness.__exitFrame();
    harness.__exitFrame();
    const trace = harness.getTrace();
    expect(trace.find((r) => r.line === 5).callDepth).toBe(1);
    expect(trace.find((r) => r.line === 6).callDepth).toBe(2);
  });

  it('throws once the step budget is exceeded and marks the harness truncated', () => {
    const harness = createTraceHarness({ maxSteps: 3 });
    harness.__trace(1, {});
    harness.__trace(2, {});
    harness.__trace(3, {});
    expect(() => harness.__trace(4, {})).toThrow('__TRACE_BUDGET_EXCEEDED__');
    expect(harness.isTruncated()).toBe(true);
    expect(harness.getTrace()).toHaveLength(3);
  });

  it('safely clones locals so later mutation of the source object does not affect the trace', () => {
    const harness = createTraceHarness();
    const arr = [1, 2, 3];
    harness.__trace(1, { arr });
    arr.push(4);
    expect(harness.getTrace()[0].locals.arr).toEqual([1, 2, 3]);
  });

  it('falls back to an empty object when locals are not JSON-serializable', () => {
    const harness = createTraceHarness();
    const circular = {};
    circular.self = circular;
    harness.__trace(1, { circular });
    expect(harness.getTrace()[0].locals).toEqual({});
  });

  it('clones a Set local as an array instead of discarding its contents', () => {
    const harness = createTraceHarness();
    harness.__trace(1, { visited: new Set(['A', 'B']) });
    expect(harness.getTrace()[0].locals.visited).toEqual(['A', 'B']);
  });

  it('clones a Map local as a plain object instead of discarding its contents', () => {
    const harness = createTraceHarness();
    harness.__trace(1, { visited: new Map([['A', true], ['B', false]]) });
    expect(harness.getTrace()[0].locals.visited).toEqual({ A: true, B: false });
  });
});
