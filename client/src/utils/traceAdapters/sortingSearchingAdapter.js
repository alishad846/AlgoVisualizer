import { detectPointerVar } from './activePointer.js';

function isArrayOfPrimitives(value) {
  return Array.isArray(value) && value.every((x) => typeof x === 'number' || typeof x === 'string');
}

function pickArrayVarName(trace) {
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
  return candidates.reduce(
    (best, name) => (candidateCounts[name] > candidateCounts[best] ? name : best),
    candidates[0]
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
      states[i] = 'swap';
    });

    const pointerValue = pointerVarName && record.locals ? record.locals[pointerVarName] : undefined;
    let type = changedIndices.length > 0 ? 'swap' : 'info';
    if (
      changedIndices.length === 0 &&
      Number.isInteger(pointerValue) &&
      pointerValue >= 0 &&
      pointerValue < arr.length
    ) {
      states[pointerValue] = states[pointerValue] || 'compare';
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
  const lastFrame = frames[frames.length - 1];
  if (lastFrame.type !== 'compare') {
    lastFrame.type = 'done';
  }
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
