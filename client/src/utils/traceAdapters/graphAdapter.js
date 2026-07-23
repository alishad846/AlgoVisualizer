function toVisitedSet(value) {
  if (Array.isArray(value)) {
    // Adjacency-matrix idiom: visited = new Array(n).fill(false), indexed by node id.
    // Only take this path when EVERY element is a boolean; otherwise fall back to
    // treating the array as a list of node names (the pre-existing behavior).
    if (value.length > 0 && value.every((el) => typeof el === 'boolean')) {
      return new Set(
        value.reduce((acc, el, i) => {
          if (el) acc.push(String(i));
          return acc;
        }, [])
      );
    }
    return new Set(value.map(String));
  }
  if (value && typeof value === 'object') {
    return new Set(Object.entries(value).filter(([, v]) => v).map(([k]) => k));
  }
  return new Set();
}

function isAdjacencyList(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const keys = Object.keys(value);
  if (keys.length === 0) return false;
  return keys.every((k) => Array.isArray(value[k]));
}

function isAdjacencyMatrix(value) {
  if (!Array.isArray(value) || value.length === 0) return false;
  const n = value.length;
  return value.every((row) => Array.isArray(row) && row.length === n && row.every((cell) => typeof cell === 'number'));
}

function edgesFromAdjacencyList(adj) {
  const edges = [];
  Object.entries(adj).forEach(([from, neighbors]) => {
    neighbors.forEach((to) => edges.push({ from, to: String(to) }));
  });
  return edges;
}

function edgesFromAdjacencyMatrix(matrix) {
  const edges = [];
  matrix.forEach((row, i) => {
    row.forEach((cell, j) => {
      if (cell) edges.push({ from: String(i), to: String(j) });
    });
  });
  return edges;
}

function findAdjacencyStructure(trace) {
  for (const record of trace) {
    for (const value of Object.values(record.locals || {})) {
      if (isAdjacencyList(value)) {
        return { edges: edgesFromAdjacencyList(value), keys: Object.keys(value) };
      }
      if (isAdjacencyMatrix(value)) {
        return { edges: edgesFromAdjacencyMatrix(value), keys: value.map((_, i) => String(i)) };
      }
    }
  }
  return null;
}

export function adaptGraphTrace(trace) {
  if (!Array.isArray(trace) || trace.length === 0) return null;

  let varName = null;
  for (const record of trace) {
    for (const name of Object.keys(record.locals || {})) {
      if (/visited/i.test(name)) {
        varName = name;
        break;
      }
    }
    if (varName) break;
  }
  if (!varName) return null;

  const adjacency = findAdjacencyStructure(trace);

  const allNodes = new Set();
  trace.forEach((record) => {
    const raw = record.locals ? record.locals[varName] : undefined;
    if (raw === undefined) return;
    toVisitedSet(raw).forEach((n) => allNodes.add(n));
  });
  if (adjacency) {
    adjacency.keys.forEach((k) => allNodes.add(k));
    adjacency.edges.forEach((e) => {
      allNodes.add(e.from);
      allNodes.add(e.to);
    });
  }

  const frames = [];
  let prevVisited = new Set();
  trace.forEach((record) => {
    const raw = record.locals ? record.locals[varName] : undefined;
    if (raw === undefined) return;
    const visited = toVisitedSet(raw);
    const newlyVisited = [...visited].filter((n) => !prevVisited.has(n));
    const states = {};
    allNodes.forEach((n) => {
      states[n] = visited.has(n) ? 'sorted' : 'info';
    });
    newlyVisited.forEach((n) => {
      states[n] = 'active';
    });
    frames.push({
      data: { nodes: [...allNodes], edges: adjacency ? adjacency.edges : [] },
      states,
      log: `Line ${record.line}: visited = {${[...visited].join(', ')}}`,
      type: 'info',
    });
    prevVisited = visited;
  });

  if (frames.length === 0) return null;
  frames[frames.length - 1].type = 'done';
  return frames;
}
