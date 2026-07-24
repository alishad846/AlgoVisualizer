import { detectPointerVar } from './activePointer.js';

function is2DNumericArray(value) {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((row) => Array.isArray(row) && row.every((cell) => typeof cell === 'number'))
  );
}

function is1DNumericArray(value) {
  return Array.isArray(value) && value.length > 0 && value.every((cell) => typeof cell === 'number');
}

function findDpVar(trace) {
  for (const record of trace) {
    for (const [name, value] of Object.entries(record.locals || {})) {
      if (is2DNumericArray(value)) return { varName: name, dim: 2 };
    }
  }
  for (const record of trace) {
    for (const [name, value] of Object.entries(record.locals || {})) {
      if (is1DNumericArray(value)) return { varName: name, dim: 1 };
    }
  }
  return null;
}

function detect2DPointers(trace, varName) {
  const counts = {};
  const seenValues = {};
  trace.forEach((record) => {
    const grid = record.locals ? record.locals[varName] : undefined;
    if (!is2DNumericArray(grid)) return;
    Object.entries(record.locals || {}).forEach(([name, value]) => {
      if (name === varName) return;
      if (typeof value !== 'number') return;
      if (!seenValues[name]) seenValues[name] = new Set();
      seenValues[name].add(value);
      if (!Number.isInteger(value) || value < 0 || value >= grid.length) return;
      counts[name] = (counts[name] || 0) + 1;
    });
  });
  // A pointer candidate must vary across the trace (same variance bar as
  // detectPointerVar in activePointer.js) — a constant local can't be a
  // moving row/col pointer no matter how often it happens to be in-range.
  const ranked = Object.keys(counts)
    .filter((name) => seenValues[name] && seenValues[name].size >= 2)
    .sort((a, b) => counts[b] - counts[a]);
  return [ranked[0] || null, ranked[1] || null];
}

export function adaptDpTrace(trace) {
  if (!Array.isArray(trace) || trace.length === 0) return null;

  const found = findDpVar(trace);
  if (!found) return null;
  const { varName, dim } = found;

  let pointerVarName = null;
  let pointerVarName2 = null;
  if (dim === 1) {
    pointerVarName = detectPointerVar(trace, (value, record) => {
      const arr = record.locals ? record.locals[varName] : undefined;
      return Array.isArray(arr) && Number.isInteger(value) && value >= 0 && value < arr.length;
    });
  } else {
    [pointerVarName, pointerVarName2] = detect2DPointers(trace, varName);
  }

  const frames = [];
  let prevRaw = null;
  trace.forEach((record) => {
    const raw = record.locals ? record.locals[varName] : undefined;
    if (dim === 1 && !is1DNumericArray(raw)) return;
    if (dim === 2 && !is2DNumericArray(raw)) return;

    const states = {};
    let activeR = null;
    let activeC = null;
    if (dim === 1) {
      const p = pointerVarName && record.locals ? record.locals[pointerVarName] : undefined;
      if (Number.isInteger(p) && p >= 0 && p < raw.length) {
        states[p] = 'active';
        activeR = p;
      }
    } else {
      const r = pointerVarName && record.locals ? record.locals[pointerVarName] : undefined;
      const c = pointerVarName2 && record.locals ? record.locals[pointerVarName2] : undefined;
      if (Number.isInteger(r) && r >= 0 && r < raw.length && Number.isInteger(c) && raw[r] && c >= 0 && c < raw[r].length) {
        states[`${r},${c}`] = 'active';
        activeR = r;
        activeC = c;
      }
    }

    // Matches DPPage's own step generators: the first (base-case-init) frame is 'info';
    // thereafter, a frame where the active cell's own value actually changed is 'swap'
    // (a real update), and a frame that only re-observes the table without changing the
    // active cell is 'compare' (matches e.g. knapsack's "item too heavy, copy above" case).
    let type = 'info';
    if (prevRaw) {
      if (dim === 1 && activeR !== null) {
        type = prevRaw[activeR] !== raw[activeR] ? 'swap' : 'compare';
      } else if (dim === 2 && activeR !== null && activeC !== null) {
        const prevRow = prevRaw[activeR];
        type = prevRow && prevRow[activeC] !== raw[activeR][activeC] ? 'swap' : 'compare';
      } else {
        type = 'compare';
      }
    }

    frames.push({
      data: dim === 1 ? { dim, values: [...raw] } : { dim, grid: raw.map((row) => [...row]) },
      states,
      log: `Line ${record.line}: updated ${varName}`,
      type,
    });
    prevRaw = raw;
  });

  if (frames.length === 0) return null;
  frames[frames.length - 1].type = 'done';
  return frames;
}
