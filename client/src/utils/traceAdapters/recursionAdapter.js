export function adaptRecursionTrace(trace) {
  if (!Array.isArray(trace) || trace.length === 0) return null;

  const stack = [];
  const frames = [];
  let sawCallOrReturn = false;

  trace.forEach((record) => {
    if (record.event === 'call') {
      sawCallOrReturn = true;
      stack.push({ name: record.functionName || 'call', args: record.locals || {} });
      frames.push({
        data: [...stack],
        states: {},
        log: `Entering ${record.functionName || 'function'}(${Object.values(record.locals || {}).join(', ')})`,
        type: 'info',
      });
    } else if (record.event === 'return') {
      sawCallOrReturn = true;
      const popped = stack.pop();
      frames.push({
        data: [...stack],
        states: {},
        log: `Returning from ${popped ? popped.name : record.functionName || 'function'}`,
        type: 'swap',
      });
    }
  });

  if (!sawCallOrReturn || frames.length === 0) return null;
  frames[frames.length - 1].type = 'done';
  return frames;
}
