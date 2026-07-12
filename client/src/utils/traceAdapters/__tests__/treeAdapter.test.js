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
});
