function isListNode(value) {
  return value && typeof value === 'object' && !Array.isArray(value) && 'next' in value;
}

// JSON.stringify throws on circular structures; traced values are normally deep clones and can't
// be circular, but a defensively-guarded self-referential node must not crash the "how many
// distinct values does this candidate take" scoring below.
function safeStringify(value) {
  const seen = new WeakSet();
  try {
    return JSON.stringify(value, (key, val) => {
      if (val && typeof val === 'object') {
        if (seen.has(val)) return '[Circular]';
        seen.add(val);
      }
      return val;
    });
  } catch {
    return String(value);
  }
}

function nodeValue(node) {
  if ('val' in node) return node.val;
  if ('value' in node) return node.value;
  if ('data' in node) return node.data;
  return node;
}

function chainToValues(node) {
  const values = [];
  let current = node;
  let guard = 0;
  while (current && typeof current === 'object' && guard < 1000) {
    values.push(nodeValue(current));
    current = current.next;
    guard += 1;
  }
  return values;
}

// Picks which local to visualize by scoring each structurally list-node-shaped candidate by how
// many distinct values (by structural content, since traced locals are deep clones and can never
// be === across frames) it takes across the whole trace. The pointer that's actually being
// traversed changes on every iteration and will have by far the highest distinct-value count; a
// frozen constant that merely looks like a node (e.g. a tail sentinel) will score 1 and lose. Ties
// (including the "everything is constant" case) fall back to first-found trace order, so a single
// static node with no traversal at all still renders instead of being turned into a null result.
function pickHeadVarName(trace) {
  const order = [];
  const orderIndex = new Map();
  const distinctValues = new Map();

  trace.forEach((record) => {
    Object.entries(record.locals || {}).forEach(([name, value]) => {
      if (!isListNode(value)) return;
      if (!orderIndex.has(name)) {
        orderIndex.set(name, order.length);
        order.push(name);
        distinctValues.set(name, new Set());
      }
      distinctValues.get(name).add(safeStringify(value));
    });
  });

  let headVarName = null;
  let bestCount = -1;
  order.forEach((name) => {
    const count = distinctValues.get(name).size;
    if (count > bestCount) {
      bestCount = count;
      headVarName = name;
    }
  });
  return headVarName;
}

export function adaptLinkedListTrace(trace) {
  if (!Array.isArray(trace) || trace.length === 0) return null;

  const headVarName = pickHeadVarName(trace);
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
