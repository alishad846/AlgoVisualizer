const NAME_PATTERN = /stack|queue/i;

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

  const frames = [];
  trace.forEach((record) => {
    const value = record.locals ? record.locals[varName] : undefined;
    if (!Array.isArray(value)) return;
    frames.push({
      data: value,
      states: {},
      log: `Line ${record.line}: ${varName} = [${value.join(', ')}]`,
      type: 'info',
    });
  });

  if (frames.length === 0) return null;
  frames[frames.length - 1].type = 'done';
  return frames;
}
