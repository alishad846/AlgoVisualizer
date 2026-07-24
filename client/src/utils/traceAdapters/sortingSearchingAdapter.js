import { detectPointerVar } from './activePointer.js';

function isArrayOfPrimitives(value) {
  return Array.isArray(value) && value.every((x) => typeof x === 'number' || typeof x === 'string');
}

// A divide-and-conquer sort (merge/quick sort) calls helper functions many times, so a
// small inner fragment (merge()'s `left`/`right`/`result`) can appear in more trace
// records than the real top-level array — pure frequency picks the wrong one. The
// top-level array is, by construction, always found at the *shallowest* call depth it
// ever appears at (it's bound in the outermost call and never appears deeper unless a
// same-named shadowing local exists, which is rare and not specially handled here).
// Prefer shallowest depth first; only fall back to frequency to break ties within that
// depth (this preserves existing behavior for in-place sorts, where every array-of-
// primitives candidate is at the same depth).
function pickArrayVarName(trace) {
  const candidateCounts = {};
  const candidateMinDepth = {};
  trace.forEach((record) => {
    const depth = typeof record.callDepth === 'number' ? record.callDepth : 0;
    Object.entries(record.locals || {}).forEach(([name, value]) => {
      if (!isArrayOfPrimitives(value)) return;
      candidateCounts[name] = (candidateCounts[name] || 0) + 1;
      candidateMinDepth[name] =
        candidateMinDepth[name] === undefined ? depth : Math.min(candidateMinDepth[name], depth);
    });
  });
  const candidates = Object.keys(candidateCounts);
  if (candidates.length === 0) return null;

  const shallowestDepth = Math.min(...candidates.map((name) => candidateMinDepth[name]));
  const shallowestCandidates = candidates.filter((name) => candidateMinDepth[name] === shallowestDepth);

  return shallowestCandidates.reduce(
    (best, name) => (candidateCounts[name] > candidateCounts[best] ? name : best),
    shallowestCandidates[0]
  );
}

function buildArrayFrames(trace, arrayVarName, pointerVarName) {
  const results = [];
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
      states[i] = 'comparing';
    });

    const pointerValue = pointerVarName && record.locals ? record.locals[pointerVarName] : undefined;
    let type = changedIndices.length > 0 ? 'swap' : 'info';
    if (
      changedIndices.length === 0 &&
      Number.isInteger(pointerValue) &&
      pointerValue >= 0 &&
      pointerValue < arr.length
    ) {
      states[pointerValue] = states[pointerValue] || 'comparing';
      type = 'compare';
    }

    results.push({
      record,
      frame: {
        data: arr,
        states,
        log: `Line ${record.line}: ${arrayVarName} = [${arr.join(', ')}]`,
        type,
      },
    });
    prevArr = arr;
  });
  return results;
}

function detectPointerForArray(trace, arrayVarName) {
  return detectPointerVar(trace, (value, record) => {
    const arr = record.locals ? record.locals[arrayVarName] : undefined;
    return Array.isArray(arr) && Number.isInteger(value) && value >= 0 && value < arr.length;
  });
}

function detectConstantScalar(trace, excludeNames) {
  const seen = {};
  const counts = {};
  trace.forEach((record) => {
    Object.entries(record.locals || {}).forEach(([name, value]) => {
      if (excludeNames.has(name)) return;
      if (typeof value !== 'number' && typeof value !== 'string') return;
      if (!seen[name]) seen[name] = new Set();
      seen[name].add(value);
      counts[name] = (counts[name] || 0) + 1;
    });
  });

  let best = null;
  let bestCount = 0;
  Object.keys(seen).forEach((name) => {
    if (seen[name].size !== 1) return;
    if (counts[name] > bestCount) {
      bestCount = counts[name];
      best = name;
    }
  });

  return best;
}

export function adaptArrayTrace(trace) {
  if (!Array.isArray(trace) || trace.length === 0) return null;
  const arrayVarName = pickArrayVarName(trace);
  if (!arrayVarName) return null;

  const pointerVarName = detectPointerForArray(trace, arrayVarName);
  const results = buildArrayFrames(trace, arrayVarName, pointerVarName);
  if (results.length === 0) return null;

  const frames = results.map((r) => r.frame);
  frames[frames.length - 1].type = 'done';
  return frames;
}

export function adaptSearchingTrace(trace) {
  if (!Array.isArray(trace) || trace.length === 0) return null;
  const arrayVarName = pickArrayVarName(trace);
  if (!arrayVarName) return null;

  const pointerVarName = detectPointerForArray(trace, arrayVarName);
  const excludeNames = new Set([arrayVarName, pointerVarName].filter(Boolean));
  const targetVarName = detectConstantScalar(trace, excludeNames);

  const results = buildArrayFrames(trace, arrayVarName, pointerVarName);
  if (results.length === 0) return null;

  const lastRecord = results[results.length - 1].record;
  let foundIdx = -1;
  if (targetVarName && pointerVarName && lastRecord.locals) {
    const target = lastRecord.locals[targetVarName];
    const pointerValue = lastRecord.locals[pointerVarName];
    const arr = lastRecord.locals[arrayVarName];
    if (
      Array.isArray(arr) &&
      Number.isInteger(pointerValue) &&
      pointerValue >= 0 &&
      pointerValue < arr.length &&
      arr[pointerValue] === target
    ) {
      foundIdx = pointerValue;
    }
  }

  const frames = results.map(({ record, frame }, i) => {
    const target = targetVarName && record.locals ? record.locals[targetVarName] : undefined;
    const pointerValue = pointerVarName && record.locals ? record.locals[pointerVarName] : undefined;
    return {
      ...frame,
      data: {
        array: frame.data,
        target,
        pointer: typeof pointerValue === 'number' ? pointerValue : -1,
        foundIdx: i === results.length - 1 ? foundIdx : -1,
      },
    };
  });
  frames[frames.length - 1].type = 'done';
  return frames;
}
