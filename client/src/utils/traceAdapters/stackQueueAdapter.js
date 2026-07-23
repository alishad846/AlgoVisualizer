const NAME_PATTERN = /stack|queue/i;

function inferDirection(trace, varName) {
  let endVotes = 0;
  let frontVotes = 0;
  let prev = null;
  trace.forEach((record) => {
    const value = record.locals ? record.locals[varName] : undefined;
    if (!Array.isArray(value)) return;
    if (prev && value.length === prev.length + 1) {
      const prefixMatches = prev.every((v, i) => value[i] === v);
      const suffixMatches = prev.every((v, i) => value[value.length - prev.length + i] === v);
      if (prefixMatches) endVotes += 1;
      else if (suffixMatches) frontVotes += 1;
    }
    prev = value;
  });
  if (endVotes === 0 && frontVotes === 0) return 'stack';
  return endVotes >= frontVotes ? 'stack' : 'queue';
}

export function adaptStackQueueTrace(trace) {
  if (!Array.isArray(trace) || trace.length === 0) return null;

  let varName = null;
  for (const record of trace) {
    for (const [name, value] of Object.entries(record.locals || {})) {
      if (NAME_PATTERN.test(name) && Array.isArray(value)) {
        varName = name;
        break;
      }
    }
    if (varName) break;
  }
  if (!varName) return null;

  const direction = inferDirection(trace, varName);

  const frames = [];
  trace.forEach((record) => {
    const value = record.locals ? record.locals[varName] : undefined;
    if (!Array.isArray(value)) return;
    const activeIndex = value.length === 0 ? -1 : direction === 'stack' ? value.length - 1 : 0;
    frames.push({
      data: { values: value, activeIndex, direction },
      states: {},
      log: `Line ${record.line}: ${varName} = [${value.join(', ')}]`,
      type: 'info',
    });
  });

  if (frames.length === 0) return null;
  frames[frames.length - 1].type = 'done';
  return frames;
}
