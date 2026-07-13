import { describe, it, expect } from 'vitest';
import workerSource from '../pyodideWorker.js?raw';

// Regression guard for a real Critical bug: pyodideWorker.js is a
// module-type Worker, and module workers do not support the classic
// `importScripts()` API — calling it broke Python execution end-to-end.
// The fix was to dynamically `import()` Pyodide's ESM build instead. This
// test is a trivial static trip-wire so that regression can't silently
// reappear (Vitest cannot exercise the real Worker/WASM path directly).
describe('pyodideWorker.js', () => {
  it('does not call importScripts (unsupported in module workers)', () => {
    expect(workerSource).not.toContain('importScripts');
  });
});
