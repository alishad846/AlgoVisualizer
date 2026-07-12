function toVisitedSet(value) {
  if (Array.isArray(value)) return new Set(value.map(String));
  if (value && typeof value === 'object') {
    return new Set(Object.entries(value).filter(([, v]) => v).map(([k]) => k));
  }
  return new Set();
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

  const allNodes = new Set();
  trace.forEach((record) => {
    const raw = record.locals ? record.locals[varName] : undefined;
    if (raw === undefined) return;
    toVisitedSet(raw).forEach((n) => allNodes.add(n));
  });

  const frames = [];
  trace.forEach((record) => {
    const raw = record.locals ? record.locals[varName] : undefined;
    if (raw === undefined) return;
    const visited = toVisitedSet(raw);
    const states = {};
    allNodes.forEach((n) => {
      states[n] = visited.has(n) ? 'sorted' : 'info';
    });
    frames.push({
      data: { nodes: [...allNodes] },
      states,
      log: `Line ${record.line}: visited = {${[...visited].join(', ')}}`,
      type: 'info',
    });
  });

  if (frames.length === 0) return null;
  frames[frames.length - 1].type = 'done';
  return frames;
}
