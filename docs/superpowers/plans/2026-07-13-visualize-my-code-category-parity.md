# Visualize My Code — Category Feature Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring each of the 7 supported "Visualize My Code" categories (sorting, searching, recursion, linked-list, stack-queue, tree, graph, dp) close to the visual richness of their dedicated algorithm pages — active-element highlighting, pointer/target detection, drawn graph edges, completion banners — for arbitrary user-pasted code, not just the app's own demo algorithms.

**Architecture:** A new shared adapter helper (`activePointer.js`) detects which scalar local variable in a trace acts as a "current position" pointer into an already-tracked structure (array/tree/list/grid), by scanning for a varying scalar whose values are valid indices/keys most consistently. Each category's trace adapter is extended to use this helper (or a category-specific variant of the same idea) to mark active/visited state per frame; each category's visualizer component is extended to render that new state. Two real bugs are fixed along the way: the tree adapter currently re-derives the tree shape from a shrinking subtree pointer instead of the whole tree, and the DP adapter silently fails on 1-D arrays (Fibonacci/Coin-Change-shaped DP).

**Tech Stack:** Same as the existing "Visualize My Code" feature — React 19, Vitest + @testing-library/react, plain SVG/inline-style rendering (no new dependencies).

## Global Constraints

- ML stays out of scope for this plan — continues falling back to `VariableInspectorViz`.
- No bespoke per-sub-algorithm visuals (Tower-of-Hanoi pegs, N-Queens board, maze grid, valid-parentheses char-chips, next-greater dual-row, 3-lane merge view, DP string-axis headers) — these require knowing the *specific* algorithm, not just its category, which the ML classifier cannot tell us. They are intentionally dropped in favor of the best generic equivalent.
- No graph "grid maze" mode — arbitrary graph code gets a node-link diagram with drawn edges instead.
- No recursion return-value display — the JS/Python tracers don't currently capture a distinct "value about to be returned" field; adding one is a tracer-level change out of scope for this plan.
- Every heuristic (pointer detection, target detection, adjacency-structure detection) must degrade gracefully on failure: when a heuristic can't confidently find what it's looking for, the corresponding piece of data/UI is simply omitted — never a wrong or misleading guess.
- Every adapter change gets a Vitest unit test with hand-built trace fixtures, matching the existing style under `client/src/utils/traceAdapters/__tests__/`. Every visualizer component change gets an `@testing-library/react` render test, matching the existing style under `client/src/components/visualize/__tests__/`.
- Reuse existing CSS custom properties only (`--active-bg`, `--active-text`, `--green`, `--orange`, `--cyan`, `--border2`, `--surface2`, `--muted`, `--text`, `--bg`, `--border` — all confirmed defined in `client/src/index.css` for both themes). Do not invent new CSS variables.
- No user-pasted code is ever sent to a server or logged anywhere (unchanged from the original feature — nothing in this plan touches networking).

---

## Phase 1 — Shared adapter infrastructure

### Task 1: Active-pointer detection helper

**Files:**
- Create: `client/src/utils/traceAdapters/activePointer.js`
- Test: `client/src/utils/traceAdapters/__tests__/activePointer.test.js`

**Interfaces:**
- Produces: `detectPointerVar(trace, isValidKey) -> string | null` — scans `trace` (array of `{line, locals, callDepth, event}` records) for a scalar (`number`/`string`) local variable that (a) takes at least 2 distinct values across the trace, and (b) is a "valid key" (per the caller-supplied `isValidKey(value, record) -> boolean` predicate) in the highest fraction of records. Returns the variable's name, or `null` if no candidate qualifies (no variable varies, or none ever satisfies `isValidKey`).

- [ ] **Step 1: Write the failing test**

Create `client/src/utils/traceAdapters/__tests__/activePointer.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { detectPointerVar } from '../activePointer.js';

describe('detectPointerVar', () => {
  it('returns null for an empty trace', () => {
    expect(detectPointerVar([], () => true)).toBeNull();
  });

  it('returns null when no scalar variable varies', () => {
    const trace = [
      { line: 1, locals: { x: 5 }, callDepth: 0, event: 'step' },
      { line: 2, locals: { x: 5 }, callDepth: 0, event: 'step' },
    ];
    expect(detectPointerVar(trace, () => true)).toBeNull();
  });

  it('picks the varying scalar whose values are valid keys most often', () => {
    const trace = [
      { line: 1, locals: { i: 0, noise: 10 }, callDepth: 0, event: 'step' },
      { line: 2, locals: { i: 1, noise: 20 }, callDepth: 0, event: 'step' },
      { line: 3, locals: { i: 2, noise: 30 }, callDepth: 0, event: 'step' },
    ];
    const isValidKey = (value) => value === 0 || value === 1 || value === 2;
    expect(detectPointerVar(trace, isValidKey)).toBe('i');
  });

  it('ignores a constant scalar even if it would satisfy isValidKey', () => {
    const trace = [
      { line: 1, locals: { target: 5 }, callDepth: 0, event: 'step' },
      { line: 2, locals: { target: 5 }, callDepth: 0, event: 'step' },
    ];
    expect(detectPointerVar(trace, (value) => value === 5)).toBeNull();
  });

  it('returns null when no candidate ever satisfies isValidKey', () => {
    const trace = [
      { line: 1, locals: { i: 0 }, callDepth: 0, event: 'step' },
      { line: 2, locals: { i: 1 }, callDepth: 0, event: 'step' },
    ];
    expect(detectPointerVar(trace, () => false)).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run (from `client/`): `npm run test -- src/utils/traceAdapters/__tests__/activePointer.test.js`
Expected: FAIL — `activePointer.js` does not exist.

- [ ] **Step 3: Implement the helper**

Create `client/src/utils/traceAdapters/activePointer.js`:

```js
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
```

- [ ] **Step 4: Run test to verify it passes**

Run (from `client/`): `npm run test -- src/utils/traceAdapters/__tests__/activePointer.test.js`
Expected: PASS, 5 tests passed.

- [ ] **Step 5: Commit**

```bash
git add client/src/utils/traceAdapters/activePointer.js client/src/utils/traceAdapters/__tests__/activePointer.test.js
git commit -m "feat: add shared active-pointer detection helper for trace adapters"
```

---

## Phase 2 — Sorting & Searching

### Task 2: Searching target/found detection + sorting compare-highlight

**Files:**
- Modify: `client/src/utils/traceAdapters/sortingSearchingAdapter.js`
- Modify: `client/src/utils/traceAdapters/index.js`
- Modify: `client/src/utils/traceAdapters/__tests__/sortingSearchingAdapter.test.js`

**Interfaces:**
- Consumes: `detectPointerVar` (Task 1).
- Produces: `adaptArrayTrace(trace)` (unchanged signature, now also emits `type: 'compare'` frames and per-index `'compare'` states) — used for `sorting`. New export `adaptSearchingTrace(trace) -> Array<{data: {array, target, pointer, foundIdx}, states, log, type}> | null` — used for `searching`. `index.js`'s `ADAPTERS_BY_CATEGORY.searching` now points to `adaptSearchingTrace`.

- [ ] **Step 1: Write the failing tests**

Read the current `client/src/utils/traceAdapters/__tests__/sortingSearchingAdapter.test.js` first (3 existing tests must keep passing unchanged). Append these tests to the same file (add `adaptSearchingTrace` to the existing `import` line):

```js
import { adaptArrayTrace, adaptSearchingTrace } from '../sortingSearchingAdapter.js';
```

```js
describe('adaptArrayTrace compare highlighting', () => {
  it('marks a compared-but-unswapped index with a compare state', () => {
    const trace = [
      { line: 1, locals: { arr: [1, 3, 2], j: 0 }, callDepth: 0, event: 'step' },
      { line: 2, locals: { arr: [1, 3, 2], j: 1 }, callDepth: 0, event: 'step' },
    ];
    const frames = adaptArrayTrace(trace);
    expect(frames[1].states[1]).toBe('compare');
    expect(frames[1].type).toBe('compare');
  });
});

describe('adaptSearchingTrace', () => {
  it('returns null when no array-of-primitives local is found', () => {
    const trace = [{ line: 1, locals: { x: 1 }, callDepth: 0, event: 'step' }];
    expect(adaptSearchingTrace(trace)).toBeNull();
  });

  it('detects a constant target and a varying pointer, and marks found on the last frame', () => {
    const trace = [
      { line: 1, locals: { arr: [1, 3, 5, 7, 9], target: 5, low: 0, high: 4, mid: 2 }, callDepth: 0, event: 'step' },
      { line: 2, locals: { arr: [1, 3, 5, 7, 9], target: 5, low: 0, high: 4, mid: 2 }, callDepth: 0, event: 'step' },
    ];
    const frames = adaptSearchingTrace(trace);
    expect(frames).toHaveLength(2);
    expect(frames[0].data.array).toEqual([1, 3, 5, 7, 9]);
    expect(frames[0].data.target).toBe(5);
    expect(frames[1].data.foundIdx).toBe(2);
    expect(frames[0].data.foundIdx).toBe(-1);
  });

  it('reports foundIdx -1 on the last frame when the final pointer does not match the target', () => {
    const trace = [
      { line: 1, locals: { arr: [1, 3, 5, 7, 9], target: 99, low: 0, high: 4, mid: 2 }, callDepth: 0, event: 'step' },
      { line: 2, locals: { arr: [1, 3, 5, 7, 9], target: 99, low: 3, high: 2, mid: 4 }, callDepth: 0, event: 'step' },
    ];
    const frames = adaptSearchingTrace(trace);
    expect(frames[frames.length - 1].data.foundIdx).toBe(-1);
  });

  it('omits target when no constant scalar can be found', () => {
    const trace = [
      { line: 1, locals: { arr: [1, 2, 3], i: 0 }, callDepth: 0, event: 'step' },
      { line: 2, locals: { arr: [1, 2, 3], i: 1 }, callDepth: 0, event: 'step' },
    ];
    const frames = adaptSearchingTrace(trace);
    expect(frames[0].data.target).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run (from `client/`): `npm run test -- src/utils/traceAdapters/__tests__/sortingSearchingAdapter.test.js`
Expected: FAIL — `adaptSearchingTrace` is not exported yet; the compare-highlight test fails too (no `states[1]`).

- [ ] **Step 3: Implement**

Replace the full contents of `client/src/utils/traceAdapters/sortingSearchingAdapter.js`:

```js
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
```

In `client/src/utils/traceAdapters/index.js`, change:

```js
import { adaptArrayTrace } from './sortingSearchingAdapter.js';
```

to:

```js
import { adaptArrayTrace, adaptSearchingTrace } from './sortingSearchingAdapter.js';
```

and change:

```js
const ADAPTERS_BY_CATEGORY = {
  sorting: adaptArrayTrace,
  searching: adaptArrayTrace,
```

to:

```js
const ADAPTERS_BY_CATEGORY = {
  sorting: adaptArrayTrace,
  searching: adaptSearchingTrace,
```

- [ ] **Step 4: Run tests to verify they pass**

Run (from `client/`): `npm run test -- src/utils/traceAdapters/__tests__/sortingSearchingAdapter.test.js`
Expected: PASS, 10 tests passed (3 original + 1 compare-highlight + 6 new `adaptSearchingTrace` — note `adaptArrayTrace`'s `data` shape is unchanged, a plain array, so the 3 original tests keep passing unmodified).

Run (from `client/`): `npm run test -- src/utils/traceAdapters/__tests__/index.test.js`
Expected: PASS — confirm the dispatcher test still passes (it doesn't assert on `searching`'s specific data shape, only that `visualizer: 'searching'` is returned for category `'searching'`; if it does assert on shape, update it to match the new `{array, target, pointer, foundIdx}` shape).

- [ ] **Step 5: Commit**

```bash
git add client/src/utils/traceAdapters/sortingSearchingAdapter.js client/src/utils/traceAdapters/index.js client/src/utils/traceAdapters/__tests__/sortingSearchingAdapter.test.js
git commit -m "feat: add searching target/found detection and sorting compare-highlighting"
```

---

### Task 3: SearchingViz component + router wiring

**Files:**
- Create: `client/src/components/visualize/SearchingViz.jsx`
- Modify: `client/src/components/visualize/VisualizerRouter.jsx`
- Modify: `client/src/components/visualize/__tests__/gridAndRouter.test.jsx`

**Interfaces:**
- Consumes: `frame.data` shaped `{array, target, pointer, foundIdx}` (Task 2, `adaptSearchingTrace`); reuses `CubeVisualizer` (existing, unchanged).
- Produces: `SearchingViz({ frame })` — wired into `VisualizerRouter` for the `'searching'` case (the `'sorting'` case keeps calling `CubeVisualizer` directly, unchanged).

- [ ] **Step 1: Write the failing test**

Read the current `client/src/components/visualize/__tests__/gridAndRouter.test.jsx` first (it has 8 existing tests across `DPGridViz`/`VariableInspectorViz`/`VisualizerRouter` that must keep passing). Add this import and `describe` block to the file:

```jsx
import SearchingViz from '../SearchingViz.jsx';
```

```jsx
describe('SearchingViz', () => {
  it('renders the cubes and the target value when both are present', () => {
    render(<SearchingViz frame={{ data: { array: [1, 3, 5, 7], target: 5, pointer: 2, foundIdx: -1 } }} states={{}} />);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText(/target/i)).toBeInTheDocument();
  });

  it('shows a found badge when foundIdx is set', () => {
    render(<SearchingViz frame={{ data: { array: [1, 3, 5, 7], target: 5, pointer: 2, foundIdx: 2 } }} />);
    expect(screen.getByText(/found at index 2/i)).toBeInTheDocument();
  });

  it('omits the target line when target is undefined', () => {
    render(<SearchingViz frame={{ data: { array: [1, 2, 3], pointer: -1, foundIdx: -1 } }} />);
    expect(screen.queryByText(/target/i)).not.toBeInTheDocument();
  });
});
```

Also add a router test to the existing `describe('VisualizerRouter', ...)` block:

```jsx
  it('routes searching to SearchingViz output', () => {
    render(<VisualizerRouter visualizer="searching" frame={{ data: { array: [1, 2], target: 2, pointer: 1, foundIdx: 1 } }} />);
    expect(screen.getByText(/found at index 1/i)).toBeInTheDocument();
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run (from `client/`): `npm run test -- src/components/visualize/__tests__/gridAndRouter.test.jsx`
Expected: FAIL — `SearchingViz.jsx` does not exist; router still returns bare `CubeVisualizer` for `'searching'`.

- [ ] **Step 3: Implement**

Create `client/src/components/visualize/SearchingViz.jsx`:

```jsx
import CubeVisualizer from '../CubeVisualizer.jsx';

export default function SearchingViz({ frame }) {
  const payload = (frame && frame.data) || {};
  const array = payload.array || [];
  const pointer = typeof payload.pointer === 'number' ? payload.pointer : -1;
  const target = payload.target;
  const foundIdx = typeof payload.foundIdx === 'number' ? payload.foundIdx : -1;

  const states = { ...((frame && frame.states) || {}) };
  if (foundIdx >= 0) states[foundIdx] = 'found';

  return (
    <div>
      {pointer >= 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: '0 20px', minHeight: 16 }}>
          {array.map((_, i) => (
            <div key={i} style={{ width: 40, display: 'flex', justifyContent: 'center' }}>
              {pointer === i && (
                <div
                  style={{
                    width: 0, height: 0, borderLeft: '6px solid transparent',
                    borderRight: '6px solid transparent', borderBottom: '10px solid var(--active-bg)',
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}
      <CubeVisualizer array={array} states={states} />
      {target !== undefined && (
        <div style={{ textAlign: 'center', marginTop: 8, fontSize: 13, color: 'var(--muted)' }}>
          Target: <strong style={{ color: 'var(--active-bg)' }}>{target}</strong>
        </div>
      )}
      {foundIdx >= 0 && (
        <div style={{ textAlign: 'center', color: 'var(--green)', fontWeight: 700, fontSize: 13, padding: '8px 0' }}>
          ✓ Found at index {foundIdx}
        </div>
      )}
    </div>
  );
}
```

In `client/src/components/visualize/VisualizerRouter.jsx`, add the import:

```jsx
import SearchingViz from './SearchingViz.jsx';
```

and change:

```jsx
    case 'sorting':
    case 'searching':
      return <CubeVisualizer array={frame.data} states={frame.states} />;
```

to:

```jsx
    case 'sorting':
      return <CubeVisualizer array={frame.data} states={frame.states} />;
    case 'searching':
      return <SearchingViz frame={frame} />;
```

- [ ] **Step 4: Run test to verify it passes**

Run (from `client/`): `npm run test -- src/components/visualize/__tests__/gridAndRouter.test.jsx`
Expected: PASS, 12 tests passed (8 original + 3 new `SearchingViz` + 1 new router case).

- [ ] **Step 5: Commit**

```bash
git add client/src/components/visualize/SearchingViz.jsx client/src/components/visualize/VisualizerRouter.jsx client/src/components/visualize/__tests__/gridAndRouter.test.jsx
git commit -m "feat: add SearchingViz with pointer arrow, target, and found badge"
```

---

### Task 4: Sorting swaps counter + completion banner

**Files:**
- Modify: `client/src/pages/visualize/VisualizeMyCodePage.jsx`
- Modify: `client/src/pages/visualize/__tests__/VisualizeMyCodePage.test.jsx`

**Interfaces:**
- Consumes: `frames` (array of `{type, ...}`), `visualizer` (string) — both already page-local state.
- Produces: no new exports; adds a live "Swaps" counter and a "✓ Sorted in N steps · M swaps" banner, shown only when `visualizer === 'sorting'`.

- [ ] **Step 1: Write the failing test**

Read the current `client/src/pages/visualize/__tests__/VisualizeMyCodePage.test.jsx` first (4 existing tests must keep passing). Add this test inside the existing `describe('VisualizeMyCodePage', ...)` block:

```jsx
  it('shows a swaps counter and a sorted banner once a sorting run completes', async () => {
    runJsTrace.mockResolvedValue({
      trace: [
        { line: 1, locals: { arr: [3, 1] }, callDepth: 0, event: 'step' },
        { line: 2, locals: { arr: [1, 3] }, callDepth: 0, event: 'step' },
      ],
      truncated: false,
    });

    renderPage();
    fireEvent.click(screen.getByText('Detect & Visualize'));

    await waitFor(() => expect(screen.getByText(/Swaps:/)).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText(/Sorted in/i)).toBeInTheDocument());
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run (from `client/`): `npm run test -- src/pages/visualize/__tests__/VisualizeMyCodePage.test.jsx`
Expected: FAIL — no "Swaps:" or "Sorted in" text exists yet.

- [ ] **Step 3: Implement**

In `client/src/pages/visualize/VisualizeMyCodePage.jsx`, add these two lines right after `const currentFrame = frameIdx >= 0 ? frames[frameIdx] : null;`:

```jsx
  const swapsCount = frames.slice(0, frameIdx + 1).filter((f) => f.type === 'swap').length;
  const isSortDone = visualizer === 'sorting' && frames.length > 0 && frameIdx === frames.length - 1;
```

Inside the `controls-bar`'s live step-count `<span>`, change:

```jsx
            <span style={{ marginLeft: 'auto', fontSize: 12 }}>
              Step: <strong style={{ color: 'var(--cyan)' }}>{frameIdx + 1}</strong> / {frames.length}
            </span>
```

to:

```jsx
            <span style={{ marginLeft: 'auto', fontSize: 12 }}>
              {visualizer === 'sorting' && (
                <>
                  Swaps: <strong style={{ color: 'var(--orange)' }}>{swapsCount}</strong>{' '}
                </>
              )}
              Step: <strong style={{ color: 'var(--cyan)' }}>{frameIdx + 1}</strong> / {frames.length}
            </span>
```

Inside `viz-center`, change:

```jsx
          <div className="viz-center">
            <VisualizerRouter visualizer={visualizer} frame={currentFrame} />
          </div>
```

to:

```jsx
          <div className="viz-center">
            <VisualizerRouter visualizer={visualizer} frame={currentFrame} />
            {isSortDone && (
              <div style={{ textAlign: 'center', color: 'var(--green)', fontWeight: 700, fontSize: 13, padding: '8px 0' }}>
                ✓ Sorted in {frames.length} steps · {swapsCount} swaps
              </div>
            )}
          </div>
```

- [ ] **Step 4: Run test to verify it passes**

Run (from `client/`): `npm run test -- src/pages/visualize/__tests__/VisualizeMyCodePage.test.jsx`
Expected: PASS, 5 tests passed.

Run (from `client/`): `npm run test -- src/pages/visualize`
Expected: all VisualizeMyCodePage tests pass together, no regressions.

- [ ] **Step 5: Commit**

```bash
git add client/src/pages/visualize/VisualizeMyCodePage.jsx client/src/pages/visualize/__tests__/VisualizeMyCodePage.test.jsx
git commit -m "feat: add swaps counter and sorted banner to Visualize My Code page"
```

---

## Phase 3 — Recursion

### Task 5: Recursion adapter — call depth

**Files:**
- Modify: `client/src/utils/traceAdapters/recursionAdapter.js`
- Modify: `client/src/utils/traceAdapters/__tests__/recursionAdapter.test.js`

**Interfaces:**
- Produces: `adaptRecursionTrace(trace)` (unchanged signature) — each stack entry in `frame.data` now additionally has a `depth` field (0-based, number of ancestor calls at push time).

- [ ] **Step 1: Write the failing test**

Read the current `client/src/utils/traceAdapters/__tests__/recursionAdapter.test.js` first (existing tests must keep passing). Add this test:

```js
  it('attaches the call depth to each stack entry', () => {
    const trace = [
      { line: 1, locals: { n: 3 }, callDepth: 1, event: 'call', functionName: 'fact' },
      { line: 2, locals: { n: 2 }, callDepth: 2, event: 'call', functionName: 'fact' },
    ];
    const frames = adaptRecursionTrace(trace);
    expect(frames[0].data[0].depth).toBe(0);
    expect(frames[1].data[1].depth).toBe(1);
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run (from `client/`): `npm run test -- src/utils/traceAdapters/__tests__/recursionAdapter.test.js`
Expected: FAIL — `depth` is `undefined` on both entries.

- [ ] **Step 3: Implement**

Replace the full contents of `client/src/utils/traceAdapters/recursionAdapter.js`:

```js
export function adaptRecursionTrace(trace) {
  if (!Array.isArray(trace) || trace.length === 0) return null;

  const stack = [];
  const frames = [];
  let sawCallOrReturn = false;

  trace.forEach((record) => {
    if (record.event === 'call') {
      sawCallOrReturn = true;
      stack.push({ name: record.functionName || 'call', args: record.locals || {}, depth: stack.length });
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
```

(Only change from the current file: `stack.push({ name: ..., args: ... })` gains a third field, `depth: stack.length`, computed *before* the push so it reflects the number of ancestors.)

- [ ] **Step 4: Run test to verify it passes**

Run (from `client/`): `npm run test -- src/utils/traceAdapters/__tests__/recursionAdapter.test.js`
Expected: PASS, all tests (existing + 1 new) passed.

- [ ] **Step 5: Commit**

```bash
git add client/src/utils/traceAdapters/recursionAdapter.js client/src/utils/traceAdapters/__tests__/recursionAdapter.test.js
git commit -m "feat: attach call depth to each recursion stack frame"
```

---

### Task 6: CallStackViz — depth indentation and active-frame styling

**Files:**
- Modify: `client/src/components/visualize/CallStackViz.jsx`
- Test: `client/src/components/visualize/__tests__/CallStackViz.test.jsx`

**Interfaces:**
- Consumes: `frame.data` as an array of `{name, args, depth}` (Task 5).

- [ ] **Step 1: Write the failing test**

Create `client/src/components/visualize/__tests__/CallStackViz.test.jsx`:

```jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CallStackViz from '../CallStackViz.jsx';

describe('CallStackViz', () => {
  it('shows an empty state with no frames', () => {
    render(<CallStackViz frame={{ data: [] }} />);
    expect(screen.getByText(/call stack is empty/i)).toBeInTheDocument();
  });

  it('renders each call with its name and args', () => {
    render(<CallStackViz frame={{ data: [{ name: 'fact', args: { n: 3 }, depth: 0 }] }} />);
    expect(screen.getByText('fact')).toBeInTheDocument();
    expect(screen.getByText(/n=3/)).toBeInTheDocument();
  });

  it('indents a deeper call further than a shallower one', () => {
    render(
      <CallStackViz
        frame={{
          data: [
            { name: 'fact', args: { n: 3 }, depth: 0 },
            { name: 'fact', args: { n: 2 }, depth: 1 },
          ],
        }}
      />
    );
    const calls = screen.getAllByText('fact');
    const shallow = calls[0].closest('div');
    const deep = calls[1].closest('div');
    expect(deep.style.marginLeft).not.toBe(shallow.style.marginLeft);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run (from `client/`): `npm run test -- src/components/visualize/__tests__/CallStackViz.test.jsx`
Expected: PASS on the first 2 tests (unchanged behavior), FAIL on the 3rd (no indentation exists yet).

- [ ] **Step 3: Implement**

Replace the full contents of `client/src/components/visualize/CallStackViz.jsx`:

```jsx
export default function CallStackViz({ frame }) {
  const stack = (frame && frame.data) || [];
  return (
    <div
      style={{
        display: 'flex', flexDirection: 'column-reverse', gap: 6, padding: 16,
        background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, minHeight: 220,
      }}
    >
      {stack.length === 0 && <div style={{ color: 'var(--muted)', fontSize: 13 }}>Call stack is empty</div>}
      {stack.map((call, i) => {
        const isActive = i === stack.length - 1;
        return (
          <div
            key={i}
            style={{
              padding: '8px 14px', borderRadius: 8,
              background: isActive ? 'var(--active-bg)' : 'var(--surface2)',
              border: `1px solid ${isActive ? 'var(--active-bg)' : 'var(--border2)'}`,
              color: isActive ? 'var(--active-text)' : undefined,
              fontFamily: "'JetBrains Mono', monospace", fontSize: 13,
              marginLeft: (call.depth || 0) * 16,
              transition: 'all 0.3s ease',
            }}
          >
            <strong style={{ color: isActive ? 'var(--active-text)' : 'var(--cyan)' }}>{call.name}</strong>
            {'('}
            {Object.entries(call.args || {})
              .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
              .join(', ')}
            {')'}
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run (from `client/`): `npm run test -- src/components/visualize/__tests__/CallStackViz.test.jsx`
Expected: PASS, 3 tests passed.

- [ ] **Step 5: Commit**

```bash
git add client/src/components/visualize/CallStackViz.jsx client/src/components/visualize/__tests__/CallStackViz.test.jsx
git commit -m "feat: add depth indentation and active-frame styling to CallStackViz"
```

---

## Phase 4 — Linked List

### Task 7: Linked-list adapter — active index

**Files:**
- Modify: `client/src/utils/traceAdapters/linkedListAdapter.js`
- Modify: `client/src/utils/traceAdapters/__tests__/linkedListAdapter.test.js`

**Interfaces:**
- Produces: `adaptLinkedListTrace(trace)` (unchanged signature) — `frame.data` changes shape from a plain array to `{values, activeIndex}`. Since `chainToValues(node)` always walks starting from the *currently traced* node, index `0` of `values` is always the node currently being visited — no new detection logic is needed, just exposing that existing fact.

- [ ] **Step 1: Write the failing test**

Read the current `client/src/utils/traceAdapters/__tests__/linkedListAdapter.test.js` first — it asserts on `frames[i].data` as a plain array; **update those assertions** to the new `{values, activeIndex}` shape (this is an intentional, deliberate shape change, not a regression — update every existing assertion that reads `.data` directly as an array to read `.data.values` instead). After updating, add:

```js
  it('marks index 0 (the currently traced node) as active', () => {
    const trace = [
      { line: 1, locals: { node: { value: 1, next: { value: 2, next: null } } }, callDepth: 0, event: 'step' },
    ];
    const frames = adaptLinkedListTrace(trace);
    expect(frames[0].data.activeIndex).toBe(0);
    expect(frames[0].data.values).toEqual([1, 2]);
  });

  it('reports activeIndex -1 for an empty chain', () => {
    const trace = [{ line: 1, locals: { node: null }, callDepth: 0, event: 'step' }];
    expect(adaptLinkedListTrace(trace)).toBeNull();
  });
```

- [ ] **Step 2: Run tests to verify they fail**

Run (from `client/`): `npm run test -- src/utils/traceAdapters/__tests__/linkedListAdapter.test.js`
Expected: FAIL — `.data` is still a plain array, not `{values, activeIndex}`.

- [ ] **Step 3: Implement**

Replace the full contents of `client/src/utils/traceAdapters/linkedListAdapter.js`:

```js
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run (from `client/`): `npm run test -- src/utils/traceAdapters/__tests__/linkedListAdapter.test.js`
Expected: PASS, all tests passed.

- [ ] **Step 5: Commit**

```bash
git add client/src/utils/traceAdapters/linkedListAdapter.js client/src/utils/traceAdapters/__tests__/linkedListAdapter.test.js
git commit -m "feat: expose active-node index from linked-list adapter"
```

---

### Task 8: LinkedListViz — active-node styling and null terminator

**Files:**
- Modify: `client/src/components/visualize/LinkedListViz.jsx`
- Test: `client/src/components/visualize/__tests__/LinkedListViz.test.jsx`

**Interfaces:**
- Consumes: `frame.data` as `{values, activeIndex}` (Task 7).

- [ ] **Step 1: Write the failing test**

Create `client/src/components/visualize/__tests__/LinkedListViz.test.jsx`:

```jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LinkedListViz from '../LinkedListViz.jsx';

describe('LinkedListViz', () => {
  it('shows an empty state with no values', () => {
    render(<LinkedListViz frame={{ data: { values: [], activeIndex: -1 } }} />);
    expect(screen.getByText(/list is empty/i)).toBeInTheDocument();
  });

  it('renders a null terminator after the last node', () => {
    render(<LinkedListViz frame={{ data: { values: [1, 2], activeIndex: 0 } }} />);
    expect(screen.getByText('null')).toBeInTheDocument();
  });

  it('highlights the active index distinctly from other nodes', () => {
    render(<LinkedListViz frame={{ data: { values: [1, 2], activeIndex: 1 } }} />);
    const active = screen.getByText('2');
    const idle = screen.getByText('1');
    expect(active.style.background).not.toBe(idle.style.background);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run (from `client/`): `npm run test -- src/components/visualize/__tests__/LinkedListViz.test.jsx`
Expected: FAIL — component still reads `frame.data` as a plain array (`values.length` on an object is `undefined`), no null-terminator box exists.

- [ ] **Step 3: Implement**

Replace the full contents of `client/src/components/visualize/LinkedListViz.jsx`:

```jsx
export default function LinkedListViz({ frame }) {
  const payload = (frame && frame.data) || {};
  const values = payload.values || [];
  const activeIndex = typeof payload.activeIndex === 'number' ? payload.activeIndex : -1;

  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', padding: 16,
        background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, minHeight: 120,
      }}
    >
      {values.length === 0 && <div style={{ color: 'var(--muted)', fontSize: 13 }}>List is empty</div>}
      {values.map((v, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div
            style={{
              padding: '10px 16px', borderRadius: 8,
              background: i === activeIndex ? 'var(--active-bg)' : 'var(--surface2)',
              border: `1px solid ${i === activeIndex ? 'var(--active-bg)' : 'var(--cyan)'}`,
              color: i === activeIndex ? 'var(--active-text)' : undefined,
              fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
              boxShadow: i === activeIndex ? '0 0 0 3px rgba(6,182,212,0.25)' : undefined,
              transition: 'all 0.3s ease',
            }}
          >
            {String(v)}
          </div>
          <span style={{ color: 'var(--muted)' }}>&rarr;</span>
        </div>
      ))}
      {values.length > 0 && (
        <div
          style={{
            padding: '10px 16px', borderRadius: 8, border: '1px dashed var(--border2)',
            color: 'var(--muted)', fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          null
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run (from `client/`): `npm run test -- src/components/visualize/__tests__/LinkedListViz.test.jsx`
Expected: PASS, 3 tests passed.

- [ ] **Step 5: Commit**

```bash
git add client/src/components/visualize/LinkedListViz.jsx client/src/components/visualize/__tests__/LinkedListViz.test.jsx
git commit -m "feat: add active-node highlight and null terminator to LinkedListViz"
```

---

## Phase 5 — Stack / Queue

### Task 9: Stack/queue adapter — direction inference and active index

**Files:**
- Modify: `client/src/utils/traceAdapters/stackQueueAdapter.js`
- Modify: `client/src/utils/traceAdapters/__tests__/stackQueueAdapter.test.js`

**Interfaces:**
- Produces: `adaptStackQueueTrace(trace)` (unchanged signature) — `frame.data` changes shape from a plain array to `{values, activeIndex, direction}`, where `direction` is `'stack'` (grows at the end, LIFO) or `'queue'` (grows at the front, FIFO), inferred from length changes across the trace; defaults to `'stack'` when direction can't be determined.

- [ ] **Step 1: Write the failing test**

Read the current `client/src/utils/traceAdapters/__tests__/stackQueueAdapter.test.js` first; **update its existing assertions** from reading `.data` as a plain array to `.data.values`. After updating, add:

```js
  it('infers stack direction when growth happens at the end', () => {
    const trace = [
      { line: 1, locals: { stack: [1] }, callDepth: 0, event: 'step' },
      { line: 2, locals: { stack: [1, 2] }, callDepth: 0, event: 'step' },
    ];
    const frames = adaptStackQueueTrace(trace);
    expect(frames[1].data.direction).toBe('stack');
    expect(frames[1].data.activeIndex).toBe(1);
  });

  it('infers queue direction when growth happens at the front', () => {
    const trace = [
      { line: 1, locals: { queue: [1] }, callDepth: 0, event: 'step' },
      { line: 2, locals: { queue: [2, 1] }, callDepth: 0, event: 'step' },
    ];
    const frames = adaptStackQueueTrace(trace);
    expect(frames[1].data.direction).toBe('queue');
    expect(frames[1].data.activeIndex).toBe(0);
  });

  it('defaults to stack direction when growth direction is never observed', () => {
    const trace = [{ line: 1, locals: { stack: [1] }, callDepth: 0, event: 'step' }];
    const frames = adaptStackQueueTrace(trace);
    expect(frames[0].data.direction).toBe('stack');
  });
```

- [ ] **Step 2: Run tests to verify they fail**

Run (from `client/`): `npm run test -- src/utils/traceAdapters/__tests__/stackQueueAdapter.test.js`
Expected: FAIL — `.data` is still a plain array.

- [ ] **Step 3: Implement**

Replace the full contents of `client/src/utils/traceAdapters/stackQueueAdapter.js`:

```js
const NAME_PATTERN = /stack|queue/i;

function inferDirection(trace, varName) {
  let endVotes = 0;
  let frontVotes = 0;
  let prev = null;
  trace.forEach((record) => {
    const value = record.locals ? record.locals[varName] : undefined;
    if (!Array.isArray(value)) return;
    if (prev && value.length === prev.length + 1) {
      const prefixMatches = prev.every((v, i) => value[i] === v);
      const suffixMatches = prev.every((v, i) => value[value.length - prev.length + i] === v);
      if (prefixMatches) endVotes += 1;
      else if (suffixMatches) frontVotes += 1;
    }
    prev = value;
  });
  if (endVotes === 0 && frontVotes === 0) return 'stack';
  return endVotes >= frontVotes ? 'stack' : 'queue';
}

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

  const direction = inferDirection(trace, varName);

  const frames = [];
  trace.forEach((record) => {
    const value = record.locals ? record.locals[varName] : undefined;
    if (!Array.isArray(value)) return;
    const activeIndex = value.length === 0 ? -1 : direction === 'stack' ? value.length - 1 : 0;
    frames.push({
      data: { values: value, activeIndex, direction },
      states: {},
      log: `Line ${record.line}: ${varName} = [${value.join(', ')}]`,
      type: 'info',
    });
  });

  if (frames.length === 0) return null;
  frames[frames.length - 1].type = 'done';
  return frames;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run (from `client/`): `npm run test -- src/utils/traceAdapters/__tests__/stackQueueAdapter.test.js`
Expected: PASS, all tests passed.

- [ ] **Step 5: Commit**

```bash
git add client/src/utils/traceAdapters/stackQueueAdapter.js client/src/utils/traceAdapters/__tests__/stackQueueAdapter.test.js
git commit -m "feat: infer stack/queue growth direction and active index from trace"
```

---

### Task 10: StackQueueViz — layout switch and active-slot styling

**Files:**
- Modify: `client/src/components/visualize/StackQueueViz.jsx`
- Test: `client/src/components/visualize/__tests__/StackQueueViz.test.jsx`

**Interfaces:**
- Consumes: `frame.data` as `{values, activeIndex, direction}` (Task 9).

- [ ] **Step 1: Write the failing test**

Create `client/src/components/visualize/__tests__/StackQueueViz.test.jsx`:

```jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StackQueueViz from '../StackQueueViz.jsx';

describe('StackQueueViz', () => {
  it('shows an empty state with no values', () => {
    render(<StackQueueViz frame={{ data: { values: [], activeIndex: -1, direction: 'stack' } }} />);
    expect(screen.getByText(/empty/i)).toBeInTheDocument();
  });

  it('shows a TOP label for stack direction', () => {
    render(<StackQueueViz frame={{ data: { values: [1, 2], activeIndex: 1, direction: 'stack' } }} />);
    expect(screen.getByText(/top/i)).toBeInTheDocument();
  });

  it('shows a FRONT label for queue direction', () => {
    render(<StackQueueViz frame={{ data: { values: [1, 2], activeIndex: 0, direction: 'queue' } }} />);
    expect(screen.getByText(/front/i)).toBeInTheDocument();
  });

  it('highlights the active index distinctly', () => {
    render(<StackQueueViz frame={{ data: { values: [1, 2], activeIndex: 1, direction: 'stack' } }} />);
    const active = screen.getByText('2');
    const idle = screen.getByText('1');
    expect(active.style.background).not.toBe(idle.style.background);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run (from `client/`): `npm run test -- src/components/visualize/__tests__/StackQueueViz.test.jsx`
Expected: FAIL — component still reads `frame.data` as a plain array.

- [ ] **Step 3: Implement**

Replace the full contents of `client/src/components/visualize/StackQueueViz.jsx`:

```jsx
export default function StackQueueViz({ frame }) {
  const payload = (frame && frame.data) || {};
  const values = payload.values || [];
  const activeIndex = typeof payload.activeIndex === 'number' ? payload.activeIndex : -1;
  const direction = payload.direction || 'stack';
  const isStack = direction === 'stack';

  return (
    <div
      style={{
        display: 'flex', flexDirection: isStack ? 'column-reverse' : 'row', gap: 4, padding: 16,
        background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12,
        minHeight: isStack ? 220 : undefined, alignItems: 'center', flexWrap: isStack ? undefined : 'wrap',
      }}
    >
      {values.length === 0 && <div style={{ color: 'var(--muted)', fontSize: 13 }}>Empty</div>}
      {values.map((v, i) => (
        <div
          key={i}
          style={{
            padding: '8px 20px', borderRadius: 8,
            background: i === activeIndex ? 'var(--active-bg)' : 'var(--surface2)',
            border: `1px solid ${i === activeIndex ? 'var(--active-bg)' : 'var(--orange)'}`,
            color: i === activeIndex ? 'var(--active-text)' : undefined,
            fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, minWidth: 60, textAlign: 'center',
            boxShadow: i === activeIndex ? '0 0 0 3px rgba(6,182,212,0.25)' : undefined,
            transition: 'all 0.3s ease',
          }}
        >
          {String(v)}
        </div>
      ))}
      {values.length > 0 && (
        <div style={{ width: '100%', textAlign: 'center', marginTop: isStack ? 8 : 0, fontSize: 12, color: 'var(--muted)' }}>
          {isStack ? '↑ TOP' : '← FRONT'}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run (from `client/`): `npm run test -- src/components/visualize/__tests__/StackQueueViz.test.jsx`
Expected: PASS, 4 tests passed.

- [ ] **Step 5: Commit**

```bash
git add client/src/components/visualize/StackQueueViz.jsx client/src/components/visualize/__tests__/StackQueueViz.test.jsx
git commit -m "feat: switch StackQueueViz layout by direction and highlight active slot"
```

---

## Phase 6 — Tree

### Task 11: Tree adapter — full-tree bug fix, active node, visited order

**Files:**
- Modify: `client/src/utils/traceAdapters/treeAdapter.js`
- Modify: `client/src/utils/traceAdapters/__tests__/treeAdapter.test.js`

**Interfaces:**
- Produces: `adaptTreeTrace(trace)` (unchanged signature) — `frame.data` gains a `visitedOrder` field (array of labels, cumulative); `frame.states` now marks the current node's path `'active'`. **Bug fix:** the tree shape is now captured once from the first frame with a populated tree, instead of being re-derived from a (potentially shrinking) subtree pointer every frame.

- [ ] **Step 1: Write the failing test**

Read the current `client/src/utils/traceAdapters/__tests__/treeAdapter.test.js` first (4 existing tests must keep passing). Add these tests:

```js
  it('does not shrink the tree when the traced variable descends into a subtree', () => {
    const trace = [
      {
        line: 1,
        locals: { node: { value: 5, left: { value: 3, left: null, right: null }, right: { value: 8, left: null, right: null } } },
        callDepth: 0, event: 'step',
      },
      { line: 2, locals: { node: { value: 3, left: null, right: null } }, callDepth: 1, event: 'step' },
    ];
    const frames = adaptTreeTrace(trace);
    expect(frames[0].data.nodes.length).toBe(3);
    expect(frames[1].data.nodes.length).toBe(3);
  });

  it('marks the current node active and accumulates a visited-order list', () => {
    const trace = [
      {
        line: 1,
        locals: { node: { value: 5, left: { value: 3, left: null, right: null }, right: null } },
        callDepth: 0, event: 'step',
      },
      { line: 2, locals: { node: { value: 3, left: null, right: null } }, callDepth: 1, event: 'step' },
    ];
    const frames = adaptTreeTrace(trace);
    expect(frames[0].states.root).toBe('active');
    expect(frames[1].states.rootL).toBe('active');
    expect(frames[1].data.visitedOrder).toEqual(['5', '3']);
  });
```

- [ ] **Step 2: Run tests to verify they fail**

Run (from `client/`): `npm run test -- src/utils/traceAdapters/__tests__/treeAdapter.test.js`
Expected: FAIL — the shrinking-subtree bug reproduces (`frames[1].data.nodes.length` is 1, not 3); no `active` state or `visitedOrder` exists.

- [ ] **Step 3: Implement**

Replace the full contents of `client/src/utils/traceAdapters/treeAdapter.js`:

```js
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

function nodeIdentityKey(node) {
  if (!node || typeof node !== 'object') return JSON.stringify(node);
  const value = 'value' in node ? node.value : 'val' in node ? node.val : null;
  return JSON.stringify(value);
}

function findPathForNode(root, target, path = 'root', depth = 0) {
  if (!root || typeof root !== 'object' || depth > 1000) return null;
  if (nodeIdentityKey(root) === nodeIdentityKey(target)) return path;
  if (root.left) {
    const found = findPathForNode(root.left, target, `${path}L`, depth + 1);
    if (found) return found;
  }
  if (root.right) {
    const found = findPathForNode(root.right, target, `${path}R`, depth + 1);
    if (found) return found;
  }
  if (Array.isArray(root.children)) {
    for (let i = 0; i < root.children.length; i++) {
      const found = findPathForNode(root.children[i], target, `${path}C${i}`, depth + 1);
      if (found) return found;
    }
  }
  return null;
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

  let originalRoot = null;
  for (const record of trace) {
    const node = record.locals ? record.locals[varName] : undefined;
    if (isTreeNode(node)) {
      originalRoot = node;
      break;
    }
  }
  if (!originalRoot) return null;
  const { nodes, edges } = treeToNodesEdges(originalRoot, 'root');

  const frames = [];
  const visitedOrder = [];
  trace.forEach((record) => {
    const node = record.locals ? record.locals[varName] : undefined;
    if (!isTreeNode(node)) return;
    const activePath = findPathForNode(originalRoot, node);
    const states = {};
    if (activePath) {
      states[activePath] = 'active';
      const activeNode = nodes.find((n) => n.id === activePath);
      if (activeNode && (visitedOrder.length === 0 || visitedOrder[visitedOrder.length - 1] !== activeNode.label)) {
        visitedOrder.push(activeNode.label);
      }
    }
    frames.push({
      data: { nodes, edges, visitedOrder: [...visitedOrder] },
      states,
      log: `Line ${record.line}: visiting ${varName}`,
      type: 'info',
    });
  });

  if (frames.length === 0) return null;
  frames[frames.length - 1].type = 'done';
  return frames;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run (from `client/`): `npm run test -- src/utils/traceAdapters/__tests__/treeAdapter.test.js`
Expected: PASS, all tests (4 original + 2 new) passed. Note: the 3rd original test ("attaches the real depth...") still passes because `nodes`/`edges` are computed identically to before for a single-frame trace; the self-referential-node test still passes because `treeToNodesEdges`'s existing `depth > 1000` guard is unchanged, and the new `findPathForNode` has an equivalent guard.

- [ ] **Step 5: Commit**

```bash
git add client/src/utils/traceAdapters/treeAdapter.js client/src/utils/traceAdapters/__tests__/treeAdapter.test.js
git commit -m "fix: capture the full tree once instead of shrinking to the current subtree; add active-node and visited-order tracking"
```

---

### Task 12: TreeViz — active-node styling and visited-order strip

**Files:**
- Modify: `client/src/components/visualize/TreeViz.jsx`
- Test: `client/src/components/visualize/__tests__/TreeViz.test.jsx`

**Interfaces:**
- Consumes: `frame.data` as `{nodes, edges, visitedOrder}`, `frame.states` (Task 11).

- [ ] **Step 1: Write the failing test**

Create `client/src/components/visualize/__tests__/TreeViz.test.jsx`:

```jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TreeViz from '../TreeViz.jsx';

const NODES = [
  { id: 'root', label: '5', depth: 0 },
  { id: 'rootL', label: '3', depth: 1 },
];
const EDGES = [{ from: 'root', to: 'rootL' }];

describe('TreeViz', () => {
  it('renders a circle and label for each node', () => {
    render(<TreeViz frame={{ data: { nodes: NODES, edges: EDGES, visitedOrder: [] }, states: {} }} />);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('does not render a visited-order strip when empty', () => {
    render(<TreeViz frame={{ data: { nodes: NODES, edges: EDGES, visitedOrder: [] }, states: {} }} />);
    expect(screen.queryByText('5', { selector: 'span' })).not.toBeInTheDocument();
  });

  it('renders a visited-order pill for each visited label', () => {
    render(<TreeViz frame={{ data: { nodes: NODES, edges: EDGES, visitedOrder: ['5', '3'] }, states: { root: 'active' } }} />);
    expect(screen.getAllByText('5')).toHaveLength(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run (from `client/`): `npm run test -- src/components/visualize/__tests__/TreeViz.test.jsx`
Expected: PASS on the first 2 tests, FAIL on the 3rd (no visited-order strip exists yet, so `'5'` only appears once, not twice).

- [ ] **Step 3: Implement**

Replace the full contents of `client/src/components/visualize/TreeViz.jsx`:

```jsx
function computePositions(nodes) {
  const byDepth = {};
  nodes.forEach((n) => {
    const depth = n.depth ?? 0;
    byDepth[depth] = byDepth[depth] || [];
    byDepth[depth].push(n);
  });

  const positions = {};
  Object.entries(byDepth).forEach(([depth, list]) => {
    const y = 40 + Number(depth) * 60;
    list.forEach((n, i) => {
      const x = 60 + i * (480 / Math.max(list.length, 1));
      positions[n.id] = { x, y };
    });
  });
  return positions;
}

export default function TreeViz({ frame }) {
  const nodes = (frame && frame.data && frame.data.nodes) || [];
  const edges = (frame && frame.data && frame.data.edges) || [];
  const visitedOrder = (frame && frame.data && frame.data.visitedOrder) || [];
  const states = (frame && frame.states) || {};
  const positions = computePositions(nodes);

  return (
    <div style={{ padding: 16, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'auto' }}>
      <svg width={560} height={260}>
        {edges.map((e, i) => {
          const from = positions[e.from];
          const to = positions[e.to];
          if (!from || !to) return null;
          return <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="var(--border2)" strokeWidth={2} />;
        })}
        {nodes.map((n) => {
          const pos = positions[n.id];
          if (!pos) return null;
          const isActive = states[n.id] === 'active';
          return (
            <g key={n.id}>
              <circle
                cx={pos.x} cy={pos.y} r={18}
                fill={isActive ? 'var(--active-bg)' : 'var(--surface2)'}
                stroke={isActive ? 'var(--active-bg)' : 'var(--cyan)'}
                strokeWidth={2}
                style={{ transition: 'fill 0.3s ease, stroke 0.3s ease' }}
              />
              <text
                x={pos.x} y={pos.y + 4} textAnchor="middle" fontSize={11} fontWeight="bold"
                fontFamily="monospace" fill={isActive ? 'var(--active-text)' : 'var(--text)'}
              >
                {n.label}
              </text>
            </g>
          );
        })}
      </svg>
      {visitedOrder.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
          {visitedOrder.map((label, i) => (
            <span
              key={i}
              style={{
                padding: '4px 10px', borderRadius: 999, background: 'rgba(6,182,212,0.15)',
                color: 'var(--cyan)', fontSize: 12, fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run (from `client/`): `npm run test -- src/components/visualize/__tests__/TreeViz.test.jsx`
Expected: PASS, 3 tests passed.

- [ ] **Step 5: Commit**

```bash
git add client/src/components/visualize/TreeViz.jsx client/src/components/visualize/__tests__/TreeViz.test.jsx
git commit -m "feat: add active-node styling and visited-order strip to TreeViz"
```

---

## Phase 7 — Graph

### Task 13: Graph adapter — adjacency structure detection and edges

**Files:**
- Modify: `client/src/utils/traceAdapters/graphAdapter.js`
- Modify: `client/src/utils/traceAdapters/__tests__/graphAdapter.test.js`

**Interfaces:**
- Produces: `adaptGraphTrace(trace)` (unchanged signature) — `frame.data.edges` is now populated when an adjacency list or adjacency matrix local can be found (previously always `[]`... actually previously `data` only had `nodes`, no `edges` key at all); `frame.states` gains a 3rd value `'active'` for the node(s) newly added to the visited set this frame (in addition to the existing `'sorted'`/`'info'`).

- [ ] **Step 1: Write the failing test**

Read the current `client/src/utils/traceAdapters/__tests__/graphAdapter.test.js` first (existing tests must keep passing). Add these tests:

```js
  it('extracts edges from an adjacency-list local', () => {
    const trace = [
      {
        line: 1,
        locals: { visited: [], graph: { A: ['B', 'C'], B: ['D'], C: [], D: [] } },
        callDepth: 0, event: 'step',
      },
      {
        line: 2,
        locals: { visited: ['A'], graph: { A: ['B', 'C'], B: ['D'], C: [], D: [] } },
        callDepth: 0, event: 'step',
      },
    ];
    const frames = adaptGraphTrace(trace);
    expect(frames[0].data.edges).toEqual(
      expect.arrayContaining([{ from: 'A', to: 'B' }, { from: 'A', to: 'C' }, { from: 'B', to: 'D' }])
    );
  });

  it('extracts edges from an adjacency-matrix local', () => {
    const trace = [
      {
        line: 1,
        locals: {
          visited: [],
          matrix: [
            [0, 1, 0],
            [0, 0, 1],
            [0, 0, 0],
          ],
        },
        callDepth: 0, event: 'step',
      },
    ];
    const frames = adaptGraphTrace(trace);
    expect(frames[0].data.edges).toEqual(
      expect.arrayContaining([{ from: '0', to: '1' }, { from: '1', to: '2' }])
    );
  });

  it('marks a newly-visited node active for that frame only', () => {
    const trace = [
      { line: 1, locals: { visited: [] }, callDepth: 0, event: 'step' },
      { line: 2, locals: { visited: ['A'] }, callDepth: 0, event: 'step' },
      { line: 3, locals: { visited: ['A', 'B'] }, callDepth: 0, event: 'step' },
    ];
    const frames = adaptGraphTrace(trace);
    expect(frames[1].states.A).toBe('active');
    expect(frames[2].states.A).toBe('sorted');
    expect(frames[2].states.B).toBe('active');
  });

  it('returns an empty edges array when no adjacency structure is found (graceful degradation)', () => {
    const trace = [{ line: 1, locals: { visited: ['A'] }, callDepth: 0, event: 'step' }];
    const frames = adaptGraphTrace(trace);
    expect(frames[0].data.edges).toEqual([]);
  });
```

- [ ] **Step 2: Run tests to verify they fail**

Run (from `client/`): `npm run test -- src/utils/traceAdapters/__tests__/graphAdapter.test.js`
Expected: FAIL — `data.edges` doesn't exist at all yet; `states` never uses `'active'`.

- [ ] **Step 3: Implement**

Replace the full contents of `client/src/utils/traceAdapters/graphAdapter.js`:

```js
function toVisitedSet(value) {
  if (Array.isArray(value)) return new Set(value.map(String));
  if (value && typeof value === 'object') {
    return new Set(Object.entries(value).filter(([, v]) => v).map(([k]) => k));
  }
  return new Set();
}

function isAdjacencyList(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const keys = Object.keys(value);
  if (keys.length === 0) return false;
  return keys.every((k) => Array.isArray(value[k]));
}

function isAdjacencyMatrix(value) {
  if (!Array.isArray(value) || value.length === 0) return false;
  const n = value.length;
  return value.every((row) => Array.isArray(row) && row.length === n && row.every((cell) => typeof cell === 'number'));
}

function edgesFromAdjacencyList(adj) {
  const edges = [];
  Object.entries(adj).forEach(([from, neighbors]) => {
    neighbors.forEach((to) => edges.push({ from, to: String(to) }));
  });
  return edges;
}

function edgesFromAdjacencyMatrix(matrix) {
  const edges = [];
  matrix.forEach((row, i) => {
    row.forEach((cell, j) => {
      if (cell) edges.push({ from: String(i), to: String(j) });
    });
  });
  return edges;
}

function findAdjacencyStructure(trace) {
  for (const record of trace) {
    for (const value of Object.values(record.locals || {})) {
      if (isAdjacencyList(value)) {
        return { edges: edgesFromAdjacencyList(value), keys: Object.keys(value) };
      }
      if (isAdjacencyMatrix(value)) {
        return { edges: edgesFromAdjacencyMatrix(value), keys: value.map((_, i) => String(i)) };
      }
    }
  }
  return null;
}

export function adaptGraphTrace(trace) {
  if (!Array.isArray(trace) || trace.length === 0) return null;

  let varName = null;
  for (const record of trace) {
    for (const name of Object.keys(record.locals || {})) {
      if (/visited/i.test(name)) {
        varName = name;
        break;
      }
    }
    if (varName) break;
  }
  if (!varName) return null;

  const adjacency = findAdjacencyStructure(trace);

  const allNodes = new Set();
  trace.forEach((record) => {
    const raw = record.locals ? record.locals[varName] : undefined;
    if (raw === undefined) return;
    toVisitedSet(raw).forEach((n) => allNodes.add(n));
  });
  if (adjacency) {
    adjacency.keys.forEach((k) => allNodes.add(k));
    adjacency.edges.forEach((e) => {
      allNodes.add(e.from);
      allNodes.add(e.to);
    });
  }

  const frames = [];
  let prevVisited = new Set();
  trace.forEach((record) => {
    const raw = record.locals ? record.locals[varName] : undefined;
    if (raw === undefined) return;
    const visited = toVisitedSet(raw);
    const newlyVisited = [...visited].filter((n) => !prevVisited.has(n));
    const states = {};
    allNodes.forEach((n) => {
      states[n] = visited.has(n) ? 'sorted' : 'info';
    });
    newlyVisited.forEach((n) => {
      states[n] = 'active';
    });
    frames.push({
      data: { nodes: [...allNodes], edges: adjacency ? adjacency.edges : [] },
      states,
      log: `Line ${record.line}: visited = {${[...visited].join(', ')}}`,
      type: 'info',
    });
    prevVisited = visited;
  });

  if (frames.length === 0) return null;
  frames[frames.length - 1].type = 'done';
  return frames;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run (from `client/`): `npm run test -- src/utils/traceAdapters/__tests__/graphAdapter.test.js`
Expected: PASS, all tests (existing + 4 new) passed.

- [ ] **Step 5: Commit**

```bash
git add client/src/utils/traceAdapters/graphAdapter.js client/src/utils/traceAdapters/__tests__/graphAdapter.test.js
git commit -m "feat: detect adjacency structure to draw graph edges; mark newly-visited nodes active"
```

---

### Task 14: GraphTraceViz — draw edges, 3-way node coloring, legend

**Files:**
- Modify: `client/src/components/visualize/GraphTraceViz.jsx`
- Test: `client/src/components/visualize/__tests__/GraphTraceViz.test.jsx`

**Interfaces:**
- Consumes: `frame.data` as `{nodes, edges}`, `frame.states` with values `'active'`/`'sorted'`/`'info'` (Task 13).

- [ ] **Step 1: Write the failing test**

Create `client/src/components/visualize/__tests__/GraphTraceViz.test.jsx`:

```jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import GraphTraceViz from '../GraphTraceViz.jsx';

describe('GraphTraceViz', () => {
  it('renders a label for each node', () => {
    render(<GraphTraceViz frame={{ data: { nodes: ['A', 'B'], edges: [] }, states: {} }} />);
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('renders a line for each edge', () => {
    const { container } = render(
      <GraphTraceViz frame={{ data: { nodes: ['A', 'B'], edges: [{ from: 'A', to: 'B' }] }, states: {} }} />
    );
    expect(container.querySelectorAll('line')).toHaveLength(1);
  });

  it('renders a legend with Active/Visited/Unvisited labels', () => {
    render(<GraphTraceViz frame={{ data: { nodes: ['A'], edges: [] }, states: {} }} />);
    expect(screen.getByText(/active/i)).toBeInTheDocument();
    expect(screen.getByText(/visited/i)).toBeInTheDocument();
    expect(screen.getByText(/unvisited/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run (from `client/`): `npm run test -- src/components/visualize/__tests__/GraphTraceViz.test.jsx`
Expected: PASS on the first test, FAIL on the 2nd (no `<line>` elements exist) and 3rd (no legend exists).

- [ ] **Step 3: Implement**

Replace the full contents of `client/src/components/visualize/GraphTraceViz.jsx`:

```jsx
function colorFor(state) {
  if (state === 'active') return { fill: 'var(--active-bg)', text: 'var(--active-text)' };
  if (state === 'sorted') return { fill: 'var(--green)', text: '#fff' };
  return { fill: 'var(--surface2)', text: 'var(--text)' };
}

export default function GraphTraceViz({ frame }) {
  const nodes = (frame && frame.data && frame.data.nodes) || [];
  const edges = (frame && frame.data && frame.data.edges) || [];
  const states = (frame && frame.states) || {};
  const radius = 90;
  const cx = 140;
  const cy = 140;

  const positions = {};
  nodes.forEach((n, i) => {
    const angle = (2 * Math.PI * i) / Math.max(nodes.length, 1);
    positions[n] = { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  });

  return (
    <div style={{ padding: 16, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12 }}>
      <svg width={280} height={280}>
        {edges.map((e, i) => {
          const from = positions[e.from];
          const to = positions[e.to];
          if (!from || !to) return null;
          return <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="var(--border2)" strokeWidth={1.5} />;
        })}
        {nodes.map((n) => {
          const pos = positions[n];
          if (!pos) return null;
          const { fill, text } = colorFor(states[n]);
          return (
            <g key={n}>
              <circle
                cx={pos.x} cy={pos.y} r={16} fill={fill} stroke="var(--border2)" strokeWidth={2}
                style={{ transition: 'fill 0.3s ease' }}
              />
              <text x={pos.x} y={pos.y + 4} textAnchor="middle" fontSize={10} fontWeight="bold" fontFamily="monospace" fill={text}>
                {n}
              </text>
            </g>
          );
        })}
      </svg>
      <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 11, color: 'var(--muted)' }}>
        <span>
          <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: 'var(--active-bg)', marginRight: 4 }} />
          Active
        </span>
        <span>
          <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: 'var(--green)', marginRight: 4 }} />
          Visited
        </span>
        <span>
          <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: 'var(--surface2)', border: '1px solid var(--border2)', marginRight: 4 }} />
          Unvisited
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run (from `client/`): `npm run test -- src/components/visualize/__tests__/GraphTraceViz.test.jsx`
Expected: PASS, 3 tests passed.

- [ ] **Step 5: Commit**

```bash
git add client/src/components/visualize/GraphTraceViz.jsx client/src/components/visualize/__tests__/GraphTraceViz.test.jsx
git commit -m "feat: draw graph edges, add 3-way node coloring and legend to GraphTraceViz"
```

---

## Phase 8 — DP

### Task 15: DP adapter — 1-D array bug fix, active-cell tracking

**Files:**
- Modify: `client/src/utils/traceAdapters/dpAdapter.js`
- Modify: `client/src/utils/traceAdapters/__tests__/dpAdapter.test.js`

**Interfaces:**
- Consumes: `detectPointerVar` (Task 1).
- Produces: `adaptDpTrace(trace)` (unchanged signature) — `frame.data` changes shape to `{dim: 1, values: [...]}` for a 1-D DP array or `{dim: 2, grid: [[...]]}` for a 2-D DP grid (previously always a bare 2-D array, and 1-D arrays were never detected at all — this is the bug fix). `frame.states` marks the active cell: `states[i] = 'active'` for dim 1, `states['r,c'] = 'active'` for dim 2.

- [ ] **Step 1: Write the failing test**

Read the current `client/src/utils/traceAdapters/__tests__/dpAdapter.test.js` first; **update its existing assertions** from reading `.data` as a bare 2-D array to `.data.grid` (and confirm `.data.dim` is `2`). After updating, add:

```js
  it('detects a 1-D numeric array (e.g. Fibonacci) where the old adapter would have failed', () => {
    const trace = [
      { line: 1, locals: { dp: [0, 1, 1, 2, 3] }, callDepth: 0, event: 'step' },
    ];
    const frames = adaptDpTrace(trace);
    expect(frames).not.toBeNull();
    expect(frames[0].data.dim).toBe(1);
    expect(frames[0].data.values).toEqual([0, 1, 1, 2, 3]);
  });

  it('marks the active index for a 1-D dp array using a varying pointer local', () => {
    const trace = [
      { line: 1, locals: { dp: [0, 1, 1], i: 1 }, callDepth: 0, event: 'step' },
      { line: 2, locals: { dp: [0, 1, 1], i: 2 }, callDepth: 0, event: 'step' },
    ];
    const frames = adaptDpTrace(trace);
    expect(frames[0].states[1]).toBe('active');
    expect(frames[1].states[2]).toBe('active');
  });

  it('marks the active cell for a 2-D dp grid using two varying pointer locals', () => {
    const trace = [
      { line: 1, locals: { dp: [[0, 0], [0, 1]], i: 1, w: 1 }, callDepth: 0, event: 'step' },
      { line: 2, locals: { dp: [[0, 0], [0, 1]], i: 1, w: 0 }, callDepth: 0, event: 'step' },
    ];
    const frames = adaptDpTrace(trace);
    expect(frames[0].states['1,1']).toBe('active');
    expect(frames[1].states['1,0']).toBe('active');
  });
```

- [ ] **Step 2: Run tests to verify they fail**

Run (from `client/`): `npm run test -- src/utils/traceAdapters/__tests__/dpAdapter.test.js`
Expected: FAIL — 1-D arrays return `null` today; `.data` is a bare array, not `{dim, values/grid}`; no `states` are ever set.

- [ ] **Step 3: Implement**

Replace the full contents of `client/src/utils/traceAdapters/dpAdapter.js`:

```js
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
  trace.forEach((record) => {
    const grid = record.locals ? record.locals[varName] : undefined;
    if (!is2DNumericArray(grid)) return;
    Object.entries(record.locals || {}).forEach(([name, value]) => {
      if (name === varName) return;
      if (!Number.isInteger(value) || value < 0 || value >= grid.length) return;
      counts[name] = (counts[name] || 0) + 1;
    });
  });
  const ranked = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
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
  trace.forEach((record) => {
    const raw = record.locals ? record.locals[varName] : undefined;
    if (dim === 1 && !is1DNumericArray(raw)) return;
    if (dim === 2 && !is2DNumericArray(raw)) return;

    const states = {};
    if (dim === 1) {
      const p = pointerVarName && record.locals ? record.locals[pointerVarName] : undefined;
      if (Number.isInteger(p) && p >= 0 && p < raw.length) states[p] = 'active';
    } else {
      const r = pointerVarName && record.locals ? record.locals[pointerVarName] : undefined;
      const c = pointerVarName2 && record.locals ? record.locals[pointerVarName2] : undefined;
      if (Number.isInteger(r) && r >= 0 && r < raw.length && Number.isInteger(c) && raw[r] && c >= 0 && c < raw[r].length) {
        states[`${r},${c}`] = 'active';
      }
    }

    frames.push({
      data: dim === 1 ? { dim, values: [...raw] } : { dim, grid: raw.map((row) => [...row]) },
      states,
      log: `Line ${record.line}: updated ${varName}`,
      type: 'info',
    });
  });

  if (frames.length === 0) return null;
  frames[frames.length - 1].type = 'done';
  return frames;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run (from `client/`): `npm run test -- src/utils/traceAdapters/__tests__/dpAdapter.test.js`
Expected: PASS, all tests passed.

- [ ] **Step 5: Commit**

```bash
git add client/src/utils/traceAdapters/dpAdapter.js client/src/utils/traceAdapters/__tests__/dpAdapter.test.js
git commit -m "fix: support 1-D DP arrays (Fibonacci/Coin Change) which previously always failed detection; add active-cell tracking"
```

---

### Task 16: DPGridViz — dimension-aware rendering, color coding, formatting

**Files:**
- Modify: `client/src/components/visualize/DPGridViz.jsx`
- Test: `client/src/components/visualize/__tests__/gridAndRouter.test.jsx`

**Interfaces:**
- Consumes: `frame.data` as `{dim: 1, values}` or `{dim: 2, grid}`, `frame.states` (Task 15).

- [ ] **Step 1: Write the failing test**

In `client/src/components/visualize/__tests__/gridAndRouter.test.jsx`, replace the existing `describe('DPGridViz', ...)` block (which currently passes a bare 2-D array) with:

```jsx
describe('DPGridViz', () => {
  it('renders a table cell for each 2-D grid value', () => {
    render(<DPGridViz frame={{ data: { dim: 2, grid: [[0, 1], [1, 2]] }, states: {} }} />);
    expect(screen.getAllByText('1')).toHaveLength(2);
  });

  it('renders a strip cell for each 1-D value', () => {
    render(<DPGridViz frame={{ data: { dim: 1, values: [0, 1, 1, 2] }, states: {} }} />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('formats Infinity as the infinity symbol', () => {
    render(<DPGridViz frame={{ data: { dim: 1, values: [0, Infinity] }, states: {} }} />);
    expect(screen.getByText('∞')).toBeInTheDocument();
  });

  it('shows a Press Start empty state with no data', () => {
    render(<DPGridViz frame={{ data: { dim: 1, values: [] }, states: {} }} />);
    expect(screen.getByText(/press start/i)).toBeInTheDocument();
  });

  it('highlights the active cell', () => {
    render(<DPGridViz frame={{ data: { dim: 1, values: [3, 5] }, states: { 1: 'active' } }} />);
    const active = screen.getByText('5');
    const idle = screen.getByText('3');
    expect(active.style.background).not.toBe(idle.style.background);
  });
});
```

(This changes the router-test note in Task 3 was already about `SearchingViz`/router — this test block is `DPGridViz`-only and does not affect the `VariableInspectorViz`/`VisualizerRouter` blocks in the same file, which stay unchanged.)

- [ ] **Step 2: Run test to verify it fails**

Run (from `client/`): `npm run test -- src/components/visualize/__tests__/gridAndRouter.test.jsx`
Expected: FAIL — component still reads `frame.data` as a bare array; no `dim`/empty-state/formatting/highlighting logic exists.

- [ ] **Step 3: Implement**

Replace the full contents of `client/src/components/visualize/DPGridViz.jsx`:

```jsx
function formatCell(value) {
  if (value === Infinity) return '∞';
  if (value === -Infinity) return '-∞';
  return value;
}

function cellStyle(value, isActive) {
  if (isActive) return { background: 'var(--active-bg)', color: 'var(--active-text)' };
  if (typeof value === 'number' && value > 0) return { background: 'rgba(34,197,94,0.15)', color: 'var(--green)' };
  return { background: 'var(--surface2)', color: undefined };
}

const EMPTY_STATE = (
  <div style={{ padding: 16, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--muted)', fontSize: 13 }}>
    Press Start
  </div>
);

export default function DPGridViz({ frame }) {
  const payload = (frame && frame.data) || {};
  const states = (frame && frame.states) || {};
  const dim = payload.dim || 2;

  if (dim === 1) {
    const values = payload.values || [];
    if (values.length === 0) return EMPTY_STATE;
    return (
      <div style={{ padding: 16, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'auto' }}>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {values.map((v, i) => {
            const { background, color } = cellStyle(v, states[i] === 'active');
            return (
              <div
                key={i}
                style={{
                  border: '1px solid var(--border2)', padding: '6px 10px', borderRadius: 6,
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 12, background, color,
                  textAlign: 'center', minWidth: 32, transition: 'all 0.3s ease',
                }}
              >
                {formatCell(v)}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const grid = payload.grid || [];
  if (grid.length === 0) return EMPTY_STATE;

  return (
    <div style={{ padding: 16, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'auto' }}>
      <table style={{ borderCollapse: 'collapse' }}>
        <tbody>
          {grid.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => {
                const { background, color } = cellStyle(cell, states[`${i},${j}`] === 'active');
                return (
                  <td
                    key={j}
                    style={{
                      border: '1px solid var(--border2)', padding: '6px 10px',
                      fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
                      background, color, textAlign: 'center', minWidth: 32, transition: 'all 0.3s ease',
                    }}
                  >
                    {formatCell(cell)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run (from `client/`): `npm run test -- src/components/visualize/__tests__/gridAndRouter.test.jsx`
Expected: PASS, all tests passed.

- [ ] **Step 5: Commit**

```bash
git add client/src/components/visualize/DPGridViz.jsx client/src/components/visualize/__tests__/gridAndRouter.test.jsx
git commit -m "feat: add dimension-aware rendering, value color coding, and active-cell highlight to DPGridViz"
```

---

## Phase 9 — Verification

### Task 17: Full automated test suite + lint pass

**Files:** none (verification-only task, fixes applied as needed)

- [ ] **Step 1: Run the full test suite**

Run (from `client/`): `npm run test`
Expected: every test file passes, no failures. Pay particular attention to any test elsewhere in the suite that constructed a `frame.data` for `searching`/`linked-list`/`stack-queue`/`dp` as a bare array/value (the shape changes in Tasks 2, 7, 9, 15 are intentional breaking changes to those adapters' output — if any test outside the files already updated in this plan references the old shape, e.g. `VisualizeMyCodePage.test.jsx`'s mocked `runJsTrace` output flowing through `adaptTrace`, update it to match).

- [ ] **Step 2: Run lint**

Run (from `client/`): `npm run lint`
Expected: no errors. Fix any that appear (e.g. unused variables left over from a refactor).

- [ ] **Step 3: Run the production build**

Run (from `client/`): `npm run build`
Expected: build succeeds, no new errors or size regressions beyond what's expected from the added code.

- [ ] **Step 4: Commit (only if fixes were needed)**

```bash
git add -A
git commit -m "chore: fix test/lint issues found during category-parity verification pass"
```

---

### Task 18: Manual end-to-end verification

**Files:** none (manual verification task — real trace shapes flowing through real components can't be fully verified by adapter-level and component-level unit tests in isolation)

- [ ] **Step 1: Start the dev server**

Run (from `client/`): `npm run dev`

- [ ] **Step 2: Verify searching end-to-end**

Paste this into the code editor and click Detect & Visualize:

```javascript
function binarySearch(arr, target) {
  let low = 0, high = arr.length - 1;
  while (low <= high) {
    let mid = Math.floor((low + high) / 2);
    if (arr[mid] === target) return mid;
    else if (arr[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  return -1;
}
binarySearch([1, 3, 5, 7, 9, 11], 7);
```

Confirm: a pointer arrow appears above the cubes and moves as `mid` changes; "Target: 7" is shown; when the run completes, "✓ Found at index 3" appears.

- [ ] **Step 3: Verify sorting end-to-end**

Use the default starter bubble-sort code. Confirm: a live "Swaps:" counter appears next to the step counter and increases as swaps happen; once the run completes, "✓ Sorted in N steps · M swaps" appears below the cubes.

- [ ] **Step 4: Verify recursion end-to-end**

Paste:

```javascript
function fact(n) {
  if (n <= 1) return 1;
  return n * fact(n - 1);
}
fact(4);
```

Confirm: each call box is indented further than its caller; the topmost (most recent) call is visually distinct from the ones below it.

- [ ] **Step 5: Verify linked-list, stack/queue, tree, graph, dp end-to-end**

For each, paste a small representative snippet (a linked-list traversal building a `next`-chain of plain objects; a stack implemented as `arr.push`/`arr.pop`; a queue implemented as `arr.push`/`arr.shift`; a binary-tree traversal walking `.left`/`.right`; a BFS/DFS using an adjacency-list object and a `visited` array; a Fibonacci or 0/1-knapsack DP). Confirm for each: the active element/node/cell is visually highlighted and moves as the algorithm progresses; for stack vs queue, confirm the layout (vertical vs horizontal) and TOP/FRONT label match the actual push/pop behavior of the pasted code; for graph, confirm edges are drawn as lines between nodes (not just floating circles) when the pasted code uses an adjacency list or matrix.

- [ ] **Step 6: Verify graceful degradation**

Paste a deliberately "unusual" searching snippet with no separate target variable, e.g. one that hardcodes the search value inline (`if (arr[i] === 42)`) rather than storing it in its own variable. Confirm: no target label appears (rather than a wrong one), the rest of the visualization (cubes, pointer if detectable) still renders without error.

- [ ] **Step 7: Note results**

No commit for this task — if any step fails, file it as a fix in a small follow-up commit before considering this plan complete, referencing which verification step caught it.

---

## After Task 18

Per the `subagent-driven-development` skill: dispatch a final whole-branch code-reviewer (most capable model) over the diff introduced by this plan (from the commit before Task 1 to the final commit here), using `scripts/review-package`. Triage any findings. Then continue using **superpowers:finishing-a-development-branch** for the branch as a whole (this work lands on the same `Visualization` branch already in flight, not a new branch).
