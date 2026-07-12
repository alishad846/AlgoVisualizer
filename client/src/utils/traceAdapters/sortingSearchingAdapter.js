function isArrayOfPrimitives(value) {
  return Array.isArray(value) && value.every((x) => typeof x === 'number' || typeof x === 'string');
}

export function adaptArrayTrace(trace) {
  if (!Array.isArray(trace) || trace.length === 0) return null;

  const candidateCounts = {};
  trace.forEach((record) => {
    Object.entries(record.locals || {}).forEach(([name, value]) => {
      if (isArrayOfPrimitives(value)) {
        candidateCounts[name] = (candidateCounts[name] || 0) + 1;
      }
    });
  });

  const candidates = Object.keys(candidateCounts);
  if (candidates.length === 0) return null;

  const arrayVarName = candidates.reduce(
    (best, name) => (candidateCounts[name] > candidateCounts[best] ? name : best),
    candidates[0]
  );

  const frames = [];
  let prevArr = null;
  trace.forEach((record) => {
    const arr = record.locals ? record.locals[arrayVarName] : undefined;
    if (!isArrayOfPrimitives(arr)) return;

    const changedIndices =
      prevArr && prevArr.length === arr.length
        ? arr.reduce((acc, v, i) => (v !== prevArr[i] ? [...acc, i] : acc), [])
        : [];
    const states = {};
    changedIndices.forEach((i) => {
      states[i] = 'swap';
    });

    frames.push({
      data: arr,
      states,
      log: `Line ${record.line}: ${arrayVarName} = [${arr.join(', ')}]`,
      type: changedIndices.length > 0 ? 'swap' : 'info',
    });
    prevArr = arr;
  });

  if (frames.length === 0) return null;
  frames[frames.length - 1].type = 'done';
  return frames;
}
