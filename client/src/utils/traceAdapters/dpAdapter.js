function is2DNumericArray(value) {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((row) => Array.isArray(row) && row.every((cell) => typeof cell === 'number'))
  );
}

export function adaptDpTrace(trace) {
  if (!Array.isArray(trace) || trace.length === 0) return null;

  let varName = null;
  for (const record of trace) {
    for (const [name, value] of Object.entries(record.locals || {})) {
      if (is2DNumericArray(value)) {
        varName = name;
        break;
      }
    }
    if (varName) break;
  }
  if (!varName) return null;

  const frames = [];
  trace.forEach((record) => {
    const grid = record.locals ? record.locals[varName] : undefined;
    if (!is2DNumericArray(grid)) return;
    frames.push({
      data: grid.map((row) => [...row]),
      states: {},
      log: `Line ${record.line}: updated ${varName}`,
      type: 'info',
    });
  });

  if (frames.length === 0) return null;
  frames[frames.length - 1].type = 'done';
  return frames;
}
