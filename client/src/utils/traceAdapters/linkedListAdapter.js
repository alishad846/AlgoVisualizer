function isListNode(value) {
  return value && typeof value === 'object' && !Array.isArray(value) && 'next' in value;
}

function chainToValues(node) {
  const values = [];
  let current = node;
  let guard = 0;
  while (current && typeof current === 'object' && guard < 1000) {
    values.push('value' in current ? current.value : current);
    current = current.next;
    guard += 1;
  }
  return values;
}

export function adaptLinkedListTrace(trace) {
  if (!Array.isArray(trace) || trace.length === 0) return null;

  let headVarName = null;
  for (const record of trace) {
    for (const [name, value] of Object.entries(record.locals || {})) {
      if (isListNode(value)) {
        headVarName = name;
        break;
      }
    }
    if (headVarName) break;
  }
  if (!headVarName) return null;

  const frames = [];
  trace.forEach((record) => {
    const node = record.locals ? record.locals[headVarName] : undefined;
    if (node === undefined) return;
    const values = isListNode(node) ? chainToValues(node) : [];
    frames.push({
      data: { values, activeIndex: values.length > 0 ? 0 : -1 },
      states: {},
      log: `Line ${record.line}: ${headVarName} -> [${values.join(' -> ')}]`,
      type: 'info',
    });
  });

  if (frames.length === 0) return null;
  frames[frames.length - 1].type = 'done';
  return frames;
}
