import { describe, it, expect } from 'vitest';
import { adaptTreeTrace } from '../treeAdapter.js';

describe('adaptTreeTrace', () => {
  it('returns null when no left/right/children-shaped local is found', () => {
    const trace = [{ line: 1, locals: { x: 1 }, callDepth: 0, event: 'step' }];
    expect(adaptTreeTrace(trace)).toBeNull();
  });

  it('flattens a left/right tree into nodes and edges', () => {
    const trace = [
      {
        line: 1,
        locals: { node: { value: 5, left: { value: 3, left: null, right: null }, right: null } },
        callDepth: 0,
        event: 'step',
      },
    ];
    const frames = adaptTreeTrace(trace);
    expect(frames).toHaveLength(1);
    expect(frames[0].data.nodes.length).toBeGreaterThanOrEqual(2);
    expect(frames[0].data.edges.length).toBeGreaterThanOrEqual(1);
    expect(frames[0].type).toBe('done');
  });

  it('does not crash on a self-referential node (defensive depth guard)', () => {
    const selfRefNode = { value: 1, left: null, right: null };
    selfRefNode.left = selfRefNode;
    const trace = [{ line: 1, locals: { node: selfRefNode }, callDepth: 0, event: 'step' }];
    expect(() => adaptTreeTrace(trace)).not.toThrow();
  });

  it('attaches the real depth to each node, not inferred from id string length', () => {
    const trace = [
      {
        line: 1,
        locals: {
          node: {
            value: 1,
            left: { value: 2, left: null, right: null },
            right: null,
          },
        },
        callDepth: 0,
        event: 'step',
      },
    ];
    const frames = adaptTreeTrace(trace);
    const root = frames[0].data.nodes.find((n) => n.id === 'root');
    const child = frames[0].data.nodes.find((n) => n.id === 'rootL');
    expect(root.depth).toBe(0);
    expect(child.depth).toBe(1);
  });

  it('does not shrink the tree when the traced variable descends into a subtree', () => {
    const trace = [
      {
        line: 1,
        locals: { node: { value: 5, left: { value: 3, left: null, right: null }, right: { value: 8, left: null, right: null } } },
        callDepth: 0, event: 'step',
      },
      { line: 2, locals: { node: { value: 3, left: null, right: null } }, callDepth: 1, event: 'step' },
    ];
    const frames = adaptTreeTrace(trace);
    expect(frames[0].data.nodes.length).toBe(3);
    expect(frames[1].data.nodes.length).toBe(3);
  });

  it('marks the current node active and accumulates a visited-order list', () => {
    const trace = [
      {
        line: 1,
        locals: { node: { value: 5, left: { value: 3, left: null, right: null }, right: null } },
        callDepth: 0, event: 'step',
      },
      { line: 2, locals: { node: { value: 3, left: null, right: null } }, callDepth: 1, event: 'step' },
    ];
    const frames = adaptTreeTrace(trace);
    expect(frames[0].states.root).toBe('active');
    expect(frames[1].states.rootL).toBe('active');
    expect(frames[1].data.visitedOrder).toEqual(['5', '3']);
  });

  it('prefers the recursing traversal parameter over an outer constant that only bookends the call', () => {
    // Reproduces: const tree = {...}; inorder(tree); where `tree` is only visible in the two
    // outer-scope records before/after the call, while `node` (the function's own recursing
    // parameter) is visible in every nested call/visit frame and genuinely descends through the
    // tree. The naive first-match scan picks `tree` (first in trace order) and collapses the
    // whole traversal to 2 frames stuck on the root. The fix must follow `node` instead.
    const n1 = { value: 1, left: null, right: null };
    const n3 = { value: 3, left: n1, right: null };
    const n9 = { value: 9, left: null, right: null };
    const n8 = { value: 8, left: null, right: n9 };
    const root = { value: 5, left: n3, right: n8 };

    const trace = [
      { line: 1, locals: { tree: root }, callDepth: 0, event: 'call' }, // outer, before call
      { line: 2, locals: { node: root }, callDepth: 1, event: 'call' }, // inorder(root) entered - FULL tree
      { line: 2, locals: { node: n3 }, callDepth: 2, event: 'call' }, // recurse left
      { line: 2, locals: { node: n1 }, callDepth: 3, event: 'call' }, // recurse left-left, visit 1
      { line: 2, locals: { node: n3 }, callDepth: 2, event: 'step' }, // back up, visit 3
      { line: 2, locals: { node: root }, callDepth: 1, event: 'step' }, // back up, visit 5
      { line: 2, locals: { node: n8 }, callDepth: 2, event: 'call' }, // recurse right, visit 8
      { line: 2, locals: { node: n9 }, callDepth: 3, event: 'call' }, // recurse right-right, visit 9
      { line: 1, locals: { tree: root }, callDepth: 0, event: 'return' }, // outer, after call
    ];

    const frames = adaptTreeTrace(trace);
    // Must not collapse to the outer-scope-only 2 frames.
    expect(frames.length).toBeGreaterThan(2);
    // visitedOrder must grow past a single entry stuck on the root.
    expect(frames[frames.length - 1].data.visitedOrder.length).toBeGreaterThan(1);
    expect(frames[frames.length - 1].data.visitedOrder).toEqual(['5', '3', '1', '3', '5', '8', '9']);
    // The full tree (5 nodes) must be captured, not a shrinking subtree - re-verifying the
    // previously-fixed shrinking-subtree regression isn't reintroduced by this change.
    frames.forEach((f) => {
      expect(f.data.nodes.length).toBe(5);
    });
  });
});
