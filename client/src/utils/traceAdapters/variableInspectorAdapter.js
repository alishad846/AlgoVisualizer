export function adaptVariableInspectorTrace(trace) {
  if (!Array.isArray(trace) || trace.length === 0) {
    return [{ data: {}, states: {}, log: 'No trace data captured.', type: 'info' }];
  }

  const frames = trace.map((record) => ({
    data: record.locals || {},
    states: {},
    log: `Line ${record.line}${record.functionName ? ` (${record.functionName})` : ''}: ${Object.entries(
      record.locals || {}
    )
      .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
      .join(', ')}`,
    type: 'info',
  }));

  frames[frames.length - 1].type = 'done';
  return frames;
}
