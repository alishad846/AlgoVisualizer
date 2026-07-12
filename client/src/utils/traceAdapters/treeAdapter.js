function isTreeNode(value) {
  return (
    value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    ('left' in value || 'right' in value || 'children' in value)
  );
}

function treeToNodesEdges(node, path, depth = 0) {
  const nodes = [];
  const edges = [];
  if (!node || typeof node !== 'object' || depth > 1000) return { nodes, edges };

  const value = 'value' in node ? node.value : 'val' in node ? node.val : path;
  nodes.push({ id: path, label: String(value), depth });

  if (node.left) {
    edges.push({ from: path, to: `${path}L` });
    const sub = treeToNodesEdges(node.left, `${path}L`, depth + 1);
    nodes.push(...sub.nodes);
    edges.push(...sub.edges);
  }
  if (node.right) {
    edges.push({ from: path, to: `${path}R` });
    const sub = treeToNodesEdges(node.right, `${path}R`, depth + 1);
    nodes.push(...sub.nodes);
    edges.push(...sub.edges);
  }
  if (Array.isArray(node.children)) {
    node.children.forEach((child, i) => {
      edges.push({ from: path, to: `${path}C${i}` });
      const sub = treeToNodesEdges(child, `${path}C${i}`, depth + 1);
      nodes.push(...sub.nodes);
      edges.push(...sub.edges);
    });
  }
  return { nodes, edges };
}

export function adaptTreeTrace(trace) {
  if (!Array.isArray(trace) || trace.length === 0) return null;

  let varName = null;
  for (const record of trace) {
    for (const [name, value] of Object.entries(record.locals || {})) {
      if (isTreeNode(value)) {
        varName = name;
        break;
      }
    }
    if (varName) break;
  }
  if (!varName) return null;

  const frames = [];
  trace.forEach((record) => {
    const node = record.locals ? record.locals[varName] : undefined;
    if (!isTreeNode(node)) return;
    const { nodes, edges } = treeToNodesEdges(node, 'root');
    frames.push({
      data: { nodes, edges },
      states: {},
      log: `Line ${record.line}: visiting ${varName}`,
      type: 'info',
    });
  });

  if (frames.length === 0) return null;
  frames[frames.length - 1].type = 'done';
  return frames;
}
