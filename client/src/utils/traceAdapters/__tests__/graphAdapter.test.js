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
    expect(frames[1].states.b).toBe('active');
    expect(frames[1].type).toBe('done');
  });

  it('extracts edges from an adjacency-list local', () => {
    const trace = [
      {
        line: 1,
        locals: { visited: [], graph: { A: ['B', 'C'], B: ['D'], C: [], D: [] } },
        callDepth: 0, event: 'step',
      },
      {
        line: 2,
        locals: { visited: ['A'], graph: { A: ['B', 'C'], B: ['D'], C: [], D: [] } },
        callDepth: 0, event: 'step',
      },
    ];
    const frames = adaptGraphTrace(trace);
    expect(frames[0].data.edges).toEqual(
      expect.arrayContaining([{ from: 'A', to: 'B' }, { from: 'A', to: 'C' }, { from: 'B', to: 'D' }])
    );
  });

  it('extracts edges from an array-of-arrays adjacency list (graph[i] = list of neighbor ids)', () => {
    // The common `graph = [[1, 2], [0, 3], [0, 3], [1, 2, 4], [3]]` idiom: jagged rows,
    // node id is the array index, row values are neighbor ids (not a 0/1 matrix).
    const trace = [
      {
        line: 1,
        locals: { visited: [], graph: [[1, 2], [0, 3], [0, 3], [1, 2, 4], [3]] },
        callDepth: 0, event: 'step',
      },
    ];
    const frames = adaptGraphTrace(trace);
    expect(frames[0].data.edges).toEqual(
      expect.arrayContaining([
        { from: '0', to: '1' }, { from: '0', to: '2' },
        { from: '1', to: '0' }, { from: '1', to: '3' },
      ])
    );
    expect(frames[0].data.nodes.sort()).toEqual(['0', '1', '2', '3', '4']);
  });

  it('extracts edges from an adjacency-matrix local', () => {
    const trace = [
      {
        line: 1,
        locals: {
          visited: [],
          matrix: [
            [0, 1, 0],
            [0, 0, 1],
            [0, 0, 0],
          ],
        },
        callDepth: 0, event: 'step',
      },
    ];
    const frames = adaptGraphTrace(trace);
    expect(frames[0].data.edges).toEqual(
      expect.arrayContaining([{ from: '0', to: '1' }, { from: '1', to: '2' }])
    );
  });

  it('marks a newly-visited node active for that frame only', () => {
    const trace = [
      { line: 1, locals: { visited: [] }, callDepth: 0, event: 'step' },
      { line: 2, locals: { visited: ['A'] }, callDepth: 0, event: 'step' },
      { line: 3, locals: { visited: ['A', 'B'] }, callDepth: 0, event: 'step' },
    ];
    const frames = adaptGraphTrace(trace);
    expect(frames[1].states.A).toBe('active');
    expect(frames[2].states.A).toBe('sorted');
    expect(frames[2].states.B).toBe('active');
  });

  it('returns an empty edges array when no adjacency structure is found (graceful degradation)', () => {
    const trace = [{ line: 1, locals: { visited: ['A'] }, callDepth: 0, event: 'step' }];
    const frames = adaptGraphTrace(trace);
    expect(frames[0].data.edges).toEqual([]);
  });

  it('interprets a boolean[] visited local as node-indices-where-true, not literal true/false node names', () => {
    // Adjacency-matrix BFS idiom: visited = new Array(n).fill(false), indexed by node id.
    // [true, false, true, false] means nodes 0 and 2 are visited; 1 and 3 are not.
    const trace = [
      {
        line: 1,
        locals: {
          visited: [true, false, true, false],
          matrix: [
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1],
            [0, 0, 0, 0],
          ],
        },
        callDepth: 0, event: 'step',
      },
    ];
    const frames = adaptGraphTrace(trace);
    expect(frames).toHaveLength(1);

    // Bug reproduction: bogus 'true'/'false' pseudo-nodes must never appear.
    expect(frames[0].data.nodes).not.toContain('true');
    expect(frames[0].data.nodes).not.toContain('false');
    expect(frames[0].data.nodes.sort()).toEqual(['0', '1', '2', '3']);

    const { states } = frames[0];
    expect(['sorted', 'active']).toContain(states['0']);
    expect(['sorted', 'active']).toContain(states['2']);
    expect(states['1']).toBe('info');
    expect(states['3']).toBe('info');
  });
});
