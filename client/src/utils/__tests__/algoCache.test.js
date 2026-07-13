import { describe, it, expect } from 'vitest';
import { getAlgoState, updateAlgoState, stopAlgoState } from '../algoCache.js';

// Regression guard for a real Critical bug: updateAlgoState/stopAlgoState
// used to mutate the cached state object in place with Object.assign. That
// broke useSyncExternalStore's referential-equality change detection (its
// snapshot comparison can't see a mutation of the same reference), which
// SortingPage/SearchingPage's step-log accumulation depends on. The fix was
// to replace the cache entry with a new object on every update. These are
// pure, browser-free assertions that the replacement (not mutation)
// invariant holds.

describe('algoCache reference-replacement invariant', () => {
  it('updateAlgoState replaces the cache entry with a new object reference, leaving the old one untouched', () => {
    const key = 'test-update-ref-replacement';
    const before = getAlgoState(key, () => ({ count: 0, running: false }));
    const beforeSnapshot = { ...before };

    updateAlgoState(key, { count: 1 });

    const after = getAlgoState(key, () => ({ count: 0, running: false }));

    expect(after).not.toBe(before);
    expect(after.count).toBe(1);
    // The previous reference's own content must be unchanged, proving the
    // update did not mutate it in place.
    expect(before).toEqual(beforeSnapshot);
  });

  it('stopAlgoState replaces the cache entry with a new object reference, leaving the old one untouched', () => {
    const key = 'test-stop-ref-replacement';
    const before = getAlgoState(key, () => ({ running: true }));
    const beforeSnapshot = { ...before };

    stopAlgoState(key);

    const after = getAlgoState(key, () => ({ running: true }));

    expect(after).not.toBe(before);
    expect(after.running).toBe(false);
    expect(before).toEqual(beforeSnapshot);
  });
});
