/**
 * Scans a trace for the scalar local variable most likely to represent a
 * "current position" pointer into an already-tracked structure. A pointer
 * candidate must vary across the trace (a constant can't be a pointer —
 * that's what distinguishes it from a fixed "target" value) and must be a
 * valid key (per isValidKey) in the largest fraction of the records where
 * it appears. Returns the variable's name, or null if none qualifies —
 * callers must treat null as "no highlight," never guess.
 */
export function detectPointerVar(trace, isValidKey) {
  if (!Array.isArray(trace) || trace.length === 0) return null;

  const seenValues = {};
  const hitCounts = {};
  const totalCounts = {};

  trace.forEach((record) => {
    const locals = record.locals || {};
    Object.entries(locals).forEach(([name, value]) => {
      if (typeof value !== 'number' && typeof value !== 'string') return;
      if (!seenValues[name]) seenValues[name] = new Set();
      seenValues[name].add(value);
      totalCounts[name] = (totalCounts[name] || 0) + 1;
      if (isValidKey(value, record)) {
        hitCounts[name] = (hitCounts[name] || 0) + 1;
      }
    });
  });

  let best = null;
  let bestScore = 0;
  Object.keys(seenValues).forEach((name) => {
    if (seenValues[name].size < 2) return;
    const hits = hitCounts[name] || 0;
    if (hits === 0) return;
    const score = hits / totalCounts[name];
    if (score > bestScore) {
      bestScore = score;
      best = name;
    }
  });

  return best;
}
