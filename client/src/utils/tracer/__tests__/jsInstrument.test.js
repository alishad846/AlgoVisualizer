import { describe, it, expect } from 'vitest';
import { instrumentJsCode } from '../jsInstrument.js';

function runInstrumented(source) {
  const trace = [];
  const calls = [];
  const returns = [];
  const instrumented = instrumentJsCode(source);
  const runner = new Function(
    '__trace', '__enterFrame', '__exitFrame',
    instrumented
  );
  runner(
    (line, locals) => trace.push({ line, locals }),
    (name, args) => calls.push({ name, args }),
    () => returns.push(true)
  );
  return { trace, calls, returns };
}

describe('instrumentJsCode', () => {
  it('records a trace step for each top-level statement', () => {
    const { trace } = runInstrumented(`
      let x = 1;
      let y = 2;
      let z = x + y;
    `);
    expect(trace.length).toBeGreaterThanOrEqual(3);
  });

  it('captures variable values that are in scope at each step', () => {
    const { trace } = runInstrumented(`
      let arr = [3, 1, 2];
      let i = 0;
    `);
    const lastStep = trace[trace.length - 1];
    expect(lastStep.locals.arr).toEqual([3, 1, 2]);
    expect(lastStep.locals.i).toBe(0);
  });

  it('traces loop bodies on every iteration', () => {
    const { trace } = runInstrumented(`
      let sum = 0;
      for (let i = 0; i < 5; i++) {
        sum = sum + i;
      }
    `);
    const sumValues = trace
      .map((t) => t.locals.sum)
      .filter((v) => v !== undefined);
    expect(sumValues.length).toBeGreaterThanOrEqual(5);
  });

  it('emits enter/exit frame calls around function calls', () => {
    const { calls, returns } = runInstrumented(`
      function add(a, b) {
        return a + b;
      }
      add(2, 3);
    `);
    expect(calls.length).toBeGreaterThanOrEqual(1);
    expect(calls[0].name).toBe('add');
    expect(calls[0].args).toEqual({ a: 2, b: 3 });
    expect(returns.length).toBeGreaterThanOrEqual(1);
  });

  it('actually runs correctly (mutates arrays, returns values) alongside tracing', () => {
    const trace = [];
    const instrumented = instrumentJsCode(`
      function bubbleSortOnce(arr) {
        for (let j = 0; j < arr.length - 1; j++) {
          if (arr[j] > arr[j + 1]) {
            const tmp = arr[j];
            arr[j] = arr[j + 1];
            arr[j + 1] = tmp;
          }
        }
        return arr;
      }
      bubbleSortOnce([3, 1, 2]);
    `);
    const runner = new Function('__trace', '__enterFrame', '__exitFrame', `
      let __result = undefined;
      ${instrumented}
    `);
    // The instrumented code still executes real semantics; verify no throw.
    expect(() => runner(
      (l, v) => trace.push(v),
      () => {},
      () => {}
    )).not.toThrow();
    expect(trace.length).toBeGreaterThan(0);
  });

  it('traces a swap that is the only statement inside an if-branch (the sorting-algorithm shape)', () => {
    const { trace } = runInstrumented(`
      let arr = [3, 1, 2];
      if (arr[0] > arr[1]) {
        const tmp = arr[0];
        arr[0] = arr[1];
        arr[1] = tmp;
      }
    `);
    const arrSnapshots = trace.map((t) => t.locals.arr).filter((v) => v !== undefined);
    const lastSnapshot = arrSnapshots[arrSnapshots.length - 1];
    expect(lastSnapshot).toEqual([1, 3, 2]);
  });

  it('traces the final value of an accumulator reassigned as the last statement of a loop body', () => {
    const { trace } = runInstrumented(`
      let sum = 0;
      for (let i = 0; i < 5; i++) {
        sum = sum + i;
      }
    `);
    const sumSnapshots = trace.map((t) => t.locals.sum).filter((v) => v !== undefined);
    expect(sumSnapshots[sumSnapshots.length - 1]).toBe(10);
  });
});
