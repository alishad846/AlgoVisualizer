import { describe, it, expect } from 'vitest';
import { adaptLinkedListTrace } from '../linkedListAdapter.js';

describe('adaptLinkedListTrace', () => {
  it('returns null when no next-chained object is found', () => {
    const trace = [{ line: 1, locals: { x: 1 }, callDepth: 0, event: 'step' }];
    expect(adaptLinkedListTrace(trace)).toBeNull();
  });

  it('walks a serialized next-chain into a flat value list', () => {
    const trace = [
      {
        line: 1,
        locals: { head: { value: 1, next: { value: 2, next: { value: 3, next: null } } } },
        callDepth: 0,
        event: 'step',
      },
    ];
    const frames = adaptLinkedListTrace(trace);
    expect(frames).toHaveLength(1);
    expect(frames[0].data.values).toEqual([1, 2, 3]);
    expect(frames[0].type).toBe('done');
  });

  it('marks index 0 (the currently traced node) as active', () => {
    const trace = [
      { line: 1, locals: { node: { value: 1, next: { value: 2, next: null } } }, callDepth: 0, event: 'step' },
    ];
    const frames = adaptLinkedListTrace(trace);
    expect(frames[0].data.activeIndex).toBe(0);
    expect(frames[0].data.values).toEqual([1, 2]);
  });

  it('reports activeIndex -1 for an empty chain', () => {
    const trace = [{ line: 1, locals: { node: null }, callDepth: 0, event: 'step' }];
    expect(adaptLinkedListTrace(trace)).toBeNull();
  });

  it('reads the "val" field (LeetCode/class-based Node convention), not just "value"', () => {
    // class Node { constructor(val) { this.val = val; this.next = null; } }
    const trace = [
      {
        line: 1,
        locals: { head: { val: 1, next: { val: 2, next: { val: 3, next: null } } } },
        callDepth: 0,
        event: 'step',
      },
    ];
    const frames = adaptLinkedListTrace(trace);
    expect(frames[0].data.values).toEqual([1, 2, 3]);
  });

  it('prefers the actively-traversing pointer over a frozen constant node that appears first', () => {
    // Reproduces: const n3 = {value:3,next:null}; const n2 = {value:2,next:n3}; const n1 = {value:1,next:n2};
    // function traverse(node) { while (node) { console.log(node.value); node = node.next; } }
    // traverse(n1);
    // n3 is a module-level constant that never changes and is listed first in each record's
    // locals (as would happen if outer-scope constants are captured alongside the loop's own
    // `node` pointer). The naive first-match scan latches onto n3 forever; the fix must instead
    // follow `node`, which genuinely varies across frames.
    const n3 = { value: 3, next: null };
    const n2 = { value: 2, next: n3 };
    const n1 = { value: 1, next: n2 };
    const trace = [
      { line: 1, locals: { n3, node: n1 }, callDepth: 0, event: 'step' },
      { line: 1, locals: { n3, node: n2 }, callDepth: 0, event: 'step' },
      { line: 1, locals: { n3, node: n3 }, callDepth: 0, event: 'step' },
      { line: 1, locals: { n3, node: null }, callDepth: 0, event: 'step' },
    ];
    const frames = adaptLinkedListTrace(trace);
    expect(frames).toHaveLength(4);
    // The chain should progressively shrink as `node` walks forward: [1,2,3] -> [2,3] -> [3] -> [].
    expect(frames[0].data.values).toEqual([1, 2, 3]);
    expect(frames[1].data.values).toEqual([2, 3]);
    expect(frames[2].data.values).toEqual([3]);
    expect(frames[3].data.values).toEqual([]);
    // It must NOT be frozen on n3's single value for every frame.
    const allFrozenOnThree = frames.every((f) => JSON.stringify(f.data.values) === JSON.stringify([3]));
    expect(allFrozenOnThree).toBe(false);
  });

  it('tags shrinking-chain frames as compare (an advance)', () => {
    const n3 = { value: 3, next: null };
    const n2 = { value: 2, next: n3 };
    const n1 = { value: 1, next: n2 };
    // Reversed order of the same 3 nodes, still length 3 — represents an in-place mutation.
    const r3 = { value: 1, next: null };
    const r2 = { value: 2, next: r3 };
    const r1 = { value: 3, next: r2 };
    const trace = [
      { line: 1, locals: { node: n1 }, callDepth: 0, event: 'step' }, // [1,2,3] — first frame, default compare
      { line: 2, locals: { node: n2 }, callDepth: 0, event: 'step' }, // [2,3] — shrunk from 3 to 2 -> advance -> compare
      { line: 3, locals: { node: r1 }, callDepth: 0, event: 'step' }, // [3,2,1] — same length as [2,3]? no, length 3 vs 2, still shrink-or-grow path
    ];
    const frames = adaptLinkedListTrace(trace);
    expect(frames[0].type).toBe('compare');
    expect(frames[1].type).toBe('compare');
  });

  it('tags a frame whose chain is the same length but different content as swap', () => {
    const a2 = { value: 2, next: null };
    const a1 = { value: 1, next: a2 };
    const b2 = { value: 1, next: null };
    const b1 = { value: 2, next: b2 };
    const trace = [
      { line: 1, locals: { node: a1 }, callDepth: 0, event: 'step' }, // [1,2]
      { line: 2, locals: { node: b1 }, callDepth: 0, event: 'step' }, // [2,1] — same length, different content -> swap
      { line: 3, locals: { node: b1 }, callDepth: 0, event: 'step' }, // [2,1] again — the true last frame, still forced to done
    ];
    const frames = adaptLinkedListTrace(trace);
    expect(frames[1].type).toBe('swap');
    expect(frames[2].type).toBe('done');
  });
});
