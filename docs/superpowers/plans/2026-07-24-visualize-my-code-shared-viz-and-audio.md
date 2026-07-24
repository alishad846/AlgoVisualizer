# Visualize My Code — Shared Visual Components, Adapter Correctness & Audio Fidelity — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make "Visualize My Code" look, sound, and behave like the dedicated algorithm pages for the same category — remove the manual category dropdown, fix the sorting adapter's wrong-array-variable bug (merge sort renders a fragment instead of the array), extract 5 categories' visual components so both the dedicated page and the custom-code path render identically, and give every adapter accurate per-frame audio typing so sound cues fire in sync with what's happening.

**Architecture:** `client/src/pages/<category>/<Category>Page.jsx` (dedicated, hand-driven) and `client/src/pages/visualize/VisualizeMyCodePage.jsx` (trace-driven, via `VisualizerRouter` → `components/visualize/*.jsx` wrappers → trace adapters in `client/src/utils/traceAdapters/*.js`) currently render their own independent visuals for the same conceptual thing. This plan extracts the dedicated page's visual JSX into a new `client/src/components/visualize-shared/*.jsx` component per category (Search, Linked List, Tree, DP, Stack/Queue), which both the dedicated page and the custom-code wrapper import. Recursion and Graph keep their existing custom-code-only components (their dedicated pages have no generic equivalent to extract — see the design spec, §2). Trace adapters get their `type` field (`'info'`/`'compare'`/`'swap'`/`'done'`) corrected to mirror the dedicated pages' own step-generator conventions, which `StepLog.jsx`'s existing `playAudioFeedback` call already turns into sound with no further plumbing needed.

**Tech Stack:** React 19 (function components, inline styles — this codebase does not use a CSS-in-JS library or Tailwind for these pages, just plain `style={{...}}` objects and a few global CSS classes like `.node-box`/`.cube`/`.cubes-arena`), Vitest + `@testing-library/react` for tests, plain JS (no TypeScript) trace-adapter modules.

**Full design spec:** `docs/superpowers/specs/2026-07-24-visualize-my-code-shared-viz-and-audio-design.md`. Read it before starting if anything below is unclear on *why* — this plan focuses on *what*.

## Global Constraints

- No TypeScript — this is a plain JS/JSX codebase throughout `client/src`.
- Test runner is Vitest; run tests with `npx vitest run <path>` from `client/` (not `npm test`, which also works but is slower to target a single file). The working directory for all commands in this plan is `C:\Users\sahil\OneDrive\Desktop\AlgoVisualizer\client`.
- Every existing dedicated page (`SearchingPage`, `LinkedListPage`, `TreePage`, `DPPage`, `StackQueuePage`) has **no existing automated test file** — extraction tasks must not change their visible behavior, verified by careful before/after code comparison (this plan shows exact diffs) since there is no regression suite to lean on. Task 14 does a manual browser pass over all five as the real safety net.
- Preserve existing inline color tokens exactly as written (`var(--active-bg)`, `var(--cyan)`, `var(--green)`, `var(--purple)`, `var(--muted)`, `var(--border)`, `var(--border2)`, `var(--surface2)`, `var(--bg)`, `var(--text)`, `var(--active-text)`) — do not invent new ones.
- Commit after every task (not every step) unless a step's instructions say otherwise — follow the existing repo convention of one commit per logical change, observed in `git log`.
- Never use `git add -A`/`git add .` — stage exact file paths, per this project's global instructions.

---

## Phase 1 — Quick, low-risk fixes

### Task 1: Remove the manual category-override dropdown

**Files:**
- Modify: `client/src/pages/visualize/VisualizeMyCodePage.jsx`
- Test: `client/src/pages/visualize/__tests__/VisualizeMyCodePage.test.jsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: `VisualizeMyCodePage` no longer has `manualCategory` state; `category` used for `adaptTrace(category, ...)` is always `detected.category`.

- [ ] **Step 1: Write the failing test**

Add to `client/src/pages/visualize/__tests__/VisualizeMyCodePage.test.jsx`, inside the existing `describe('VisualizeMyCodePage', ...)` block (after the last `it(...)`):

```jsx
  it('does not show a category-override dropdown', async () => {
    runJsTrace.mockResolvedValue({
      trace: [{ line: 1, locals: { arr: [3, 1] }, callDepth: 0, event: 'step' }],
      truncated: false,
    });

    const { container } = renderPage();
    fireEvent.click(screen.getByText('Detect & Visualize'));

    await waitFor(() => expect(screen.getByText(/Detected:/)).toBeInTheDocument());
    // Only the playback Speed <select> should remain — no category-override select.
    expect(container.querySelectorAll('select').length).toBe(1);
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/pages/visualize/__tests__/VisualizeMyCodePage.test.jsx`
Expected: FAIL — `container.querySelectorAll('select').length` is `2` (the category dropdown + the speed dropdown), not `1`.

- [ ] **Step 3: Remove the dropdown**

In `client/src/pages/visualize/VisualizeMyCodePage.jsx`:

Replace:
```jsx
  const [manualCategory, setManualCategory] = useState(null);
```
with: (delete the line entirely)

Replace:
```jsx
    const detected = detectAlgorithm(code);
    setDetection(detected);
    const category = manualCategory || detected.category;
```
with:
```jsx
    const detected = detectAlgorithm(code);
    setDetection(detected);
    const category = detected.category;
```

Replace:
```jsx
  }, [code, manualCategory]);
```
with:
```jsx
  }, [code]);
```

Replace:
```jsx
      {detection && detection.category && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, fontSize: 13 }}>
          <span>
            Detected: <strong style={{ color: 'var(--cyan)' }}>{CATEGORY_LABELS[detection.category] || detection.category}</strong>{' '}
            ({Math.round(detection.confidence * 100)}% confidence)
          </span>
          <select
            className="size-select"
            value={manualCategory || detection.category}
            onChange={(e) => setManualCategory(e.target.value)}
          >
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      )}
```
with:
```jsx
      {detection && detection.category && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, fontSize: 13 }}>
          <span>
            Detected: <strong style={{ color: 'var(--cyan)' }}>{CATEGORY_LABELS[detection.category] || detection.category}</strong>{' '}
            ({Math.round(detection.confidence * 100)}% confidence)
          </span>
        </div>
      )}
```

`CATEGORY_LABELS` itself stays (still used to render the label in the "Detected:" line).

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/pages/visualize/__tests__/VisualizeMyCodePage.test.jsx`
Expected: PASS (all tests in the file, including the new one).

- [ ] **Step 5: Commit**

```bash
git add client/src/pages/visualize/VisualizeMyCodePage.jsx client/src/pages/visualize/__tests__/VisualizeMyCodePage.test.jsx
git commit -m "fix: remove manual category-override dropdown from Visualize My Code

Category is auto-detected only now, matching the feature's own pitch
('we'll detect the algorithm') instead of immediately offering an
override that undermines it."
```

---

### Task 2: Fix sorting adapter's array-variable selection (merge-sort fragment bug)

**Files:**
- Modify: `client/src/utils/traceAdapters/sortingSearchingAdapter.js`
- Test: `client/src/utils/traceAdapters/__tests__/sortingSearchingAdapter.test.js`

**Interfaces:**
- Consumes: trace records' existing `callDepth` field (already present on every record — see `client/src/utils/tracer/traceHarness.js:31` and `pyodideWorker.js`'s `"callDepth": __depth[0]`).
- Produces: `pickArrayVarName(trace)` (internal, unexported) now prefers the array-of-primitives local first observed at the shallowest `callDepth`, tie-broken by the existing "most frequent name" heuristic among candidates sharing that depth. `adaptArrayTrace`/`adaptSearchingTrace`'s public behavior is unchanged for single-array traces (bubble/selection/insertion sort, linear/binary search) and fixed for multi-array traces (merge sort).

- [ ] **Step 1: Write the failing test**

Add to `client/src/utils/traceAdapters/__tests__/sortingSearchingAdapter.test.js`, inside `describe('adaptArrayTrace', ...)`:

```js
  it('prefers the array at the shallowest call depth over a more-frequent inner fragment (merge sort case)', () => {
    // Reproduces: mergeSort(arr) calls merge(left, right) many times; left/right/result
    // (small fragments, deep call depth) used to outvote the real top-level array on
    // raw frequency alone, so the adapter animated a leftover fragment instead of `arr`.
    const trace = [
      { line: 1, locals: { arr: [3, 1, 4, 2] }, callDepth: 0, event: 'step' },
      { line: 2, locals: { left: [3, 1], right: [4, 2] }, callDepth: 1, event: 'step' },
      { line: 3, locals: { left: [1, 3], right: [4, 2] }, callDepth: 1, event: 'step' },
      { line: 4, locals: { left: [1, 3], right: [2, 4] }, callDepth: 1, event: 'step' },
      { line: 5, locals: { result: [1, 3, 2, 4] }, callDepth: 1, event: 'step' },
      { line: 6, locals: { arr: [1, 2, 3, 4] }, callDepth: 0, event: 'step' },
    ];
    const frames = adaptArrayTrace(trace);
    expect(frames[0].data).toEqual([3, 1, 4, 2]);
    expect(frames[frames.length - 1].data).toEqual([1, 2, 3, 4]);
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/utils/traceAdapters/__tests__/sortingSearchingAdapter.test.js`
Expected: FAIL — with the current "most frequent name" heuristic, `left`/`right` (3 appearances each) outvote `arr` (2 appearances), so `frames[0].data` is `[3, 1]` (left's first value), not `[3, 1, 4, 2]`.

- [ ] **Step 3: Implement the fix**

In `client/src/utils/traceAdapters/sortingSearchingAdapter.js`, replace the entire `pickArrayVarName` function:

```js
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
```

with:

```js
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/utils/traceAdapters/__tests__/sortingSearchingAdapter.test.js`
Expected: PASS — all tests in the file, including the new one and every pre-existing test (all of which use single-depth traces, so the tie-break-by-frequency path still applies to them unchanged).

- [ ] **Step 5: Commit**

```bash
git add client/src/utils/traceAdapters/sortingSearchingAdapter.js client/src/utils/traceAdapters/__tests__/sortingSearchingAdapter.test.js
git commit -m "fix: prefer the shallowest-call-depth array over a more-frequent inner fragment when picking which local to animate as the sorted array

Fixes merge sort (and any other divide-and-conquer sort) rendering a
tiny leftover fragment from merge()'s left/right/result instead of
the actual array being sorted."
```

---

## Phase 2 — Shared visual component extractions

Each task in this phase: (a) creates a new file under `client/src/components/visualize-shared/`, lifted from the dedicated page's current inline JSX with no visual changes to the dedicated page, (b) points the dedicated page at it, (c) points the custom-code wrapper component (in `client/src/components/visualize/`) at it too, replacing that wrapper's own separate markup.

### Task 3: Extract `SearchArrayViz` (Searching)

**Files:**
- Create: `client/src/components/visualize-shared/SearchArrayViz.jsx`
- Test: `client/src/components/visualize-shared/__tests__/SearchArrayViz.test.jsx`
- Modify: `client/src/pages/searching/SearchingPage.jsx`
- Modify: `client/src/components/visualize/SearchingViz.jsx`

**Interfaces:**
- Produces: `SearchArrayViz({ array, states = {}, pointer = -1, target, foundIdx = -1, notFound = false })` — renders the pointer-arrow row + cube array + optional target label. Does **not** render a "Found"/"Not found" badge — callers render that themselves (it sits in different places in each consumer: the dedicated page's controls bar vs. the custom-code wrapper's own badge below the cubes), consistent with keeping this component focused on the part that's identical between the two.

- [ ] **Step 1: Write the failing test**

Create `client/src/components/visualize-shared/__tests__/SearchArrayViz.test.jsx`:

```jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SearchArrayViz from '../SearchArrayViz.jsx';

describe('SearchArrayViz', () => {
  it('renders one cube per array value', () => {
    render(<SearchArrayViz array={[5, 2, 8]} />);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
  });

  it('marks the found index with the found state class', () => {
    render(<SearchArrayViz array={[5, 2, 8]} foundIdx={1} />);
    const cube = screen.getAllByText('2')[0].closest('.cube-wrap').querySelector('.cube');
    expect(cube.className).toContain('state-found');
  });

  it('marks every cube notfound when notFound is true and nothing was found', () => {
    render(<SearchArrayViz array={[5, 2, 8]} notFound />);
    const cube = screen.getAllByText('5')[0].closest('.cube-wrap').querySelector('.cube');
    expect(cube.className).toContain('state-notfound');
  });

  it('shows the target label only when target is defined', () => {
    const { rerender } = render(<SearchArrayViz array={[1, 2]} target={2} />);
    expect(screen.getByText('2', { selector: 'strong' })).toBeInTheDocument();
    rerender(<SearchArrayViz array={[1, 2]} />);
    expect(screen.queryByText('Target:')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/visualize-shared/__tests__/SearchArrayViz.test.jsx`
Expected: FAIL — `Cannot find module '../SearchArrayViz.jsx'`.

- [ ] **Step 3: Create the shared component**

Create `client/src/components/visualize-shared/SearchArrayViz.jsx` (lifted verbatim from `SearchingPage.jsx`'s current inline center-viz JSX, lines ~180-214):

```jsx
export default function SearchArrayViz({ array, states = {}, pointer = -1, target, foundIdx = -1, notFound = false }) {
  const max = Math.max(...array, 1);

  return (
    <div>
      <div className="custom-h-scroll">
        <div style={{ minWidth: `${array.length * 48 + 40}px`, width: 'max(100%, fit-content)', margin: '0 auto' }}>
          {/* Pointer row */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: '0 20px', minHeight: 16, width: '100%' }}>
            {array.map((_, i) => (
              <div key={i} style={{ width: 40, display: 'flex', justifyContent: 'center' }}>
                {pointer === i && (
                  <div style={{ width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderBottom: '10px solid var(--active-bg)' }} />
                )}
              </div>
            ))}
          </div>

          {/* Cubes */}
          <div className="cubes-arena">
            {array.map((val, i) => {
              let state = states[i] || 'default';
              if (foundIdx === i) state = 'found';
              else if (notFound) state = 'notfound';
              const h = Math.max(18, Math.round((val / max) * 160));
              return (
                <div key={i} className="cube-wrap">
                  <div className={`cube-label state-${state}`}>{val}</div>
                  <div className={`cube state-${state}`} style={{ height: h }} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {target !== undefined && (
        <div style={{ textAlign: 'center', marginTop: 8, fontSize: 13, color: 'var(--muted)' }}>
          Target: <strong style={{ color: 'var(--active-bg)' }}>{target}</strong>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/visualize-shared/__tests__/SearchArrayViz.test.jsx`
Expected: PASS.

- [ ] **Step 5: Wire into `SearchingPage.jsx`**

Add the import at the top of `client/src/pages/searching/SearchingPage.jsx`:
```js
import SearchArrayViz from "../../components/visualize-shared/SearchArrayViz.jsx";
```

Replace this block (the entire `{/* CENTER — Cubes + Pointer */}` div, currently lines ~178-215):
```jsx
        {/* CENTER — Cubes + Pointer */}
        <div className="viz-center">
          <div className="custom-h-scroll">
            <div style={{ minWidth: `${array.length * 48 + 40}px`, width: "max(100%, fit-content)", margin: "0 auto" }}>
              {/* Pointer row */}
              <div style={{ display: "flex", justifyContent: "center", gap: 6, padding: "0 20px", minHeight: 16, width: "100%" }}>
                {array.map((_, i) => (
                  <div key={i} style={{ width: 40, display: "flex", justifyContent: "center" }}>
                    {pointer === i && (
                      <div style={{ width: 0, height: 0, borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderBottom: "10px solid var(--active-bg)" }} />
                    )}
                  </div>
                ))}
              </div>

              {/* Cubes */}
              <div className="cubes-arena">
                {array.map((val, i) => {
                  let state = states[i] || "default";
                  if (foundIdx === i) state = "found";
                  else if (!running && steps > 0 && foundIdx < 0) state = "notfound";
                  const h = Math.max(18, Math.round((val / max) * 160));
                  return (
                    <div key={i} className="cube-wrap">
                      <div className={`cube-label state-${state}`}>{val}</div>
                      <div className={`cube state-${state}`} style={{ height: h }} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Target indicator */}
          <div style={{ textAlign: "center", marginTop: 8, fontSize: 13, color: "var(--muted)" }}>
            Target: <strong style={{ color: "var(--active-bg)" }}>{target}</strong>
          </div>
        </div>
```
with:
```jsx
        {/* CENTER — Cubes + Pointer */}
        <div className="viz-center">
          <SearchArrayViz
            array={array}
            states={states}
            pointer={pointer}
            target={target}
            foundIdx={foundIdx}
            notFound={!running && steps > 0 && foundIdx < 0}
          />
        </div>
```

The `max` local variable (`const max = Math.max(...array, 1);`, currently declared just above the `return`) is no longer used anywhere else in this file — delete that line too.

- [ ] **Step 6: Run the full test suite to confirm no regression**

Run: `npx vitest run`
Expected: PASS — all existing tests still pass (no automated test exists for `SearchingPage` itself; this just confirms nothing else broke, e.g. an unused-import lint issue).

- [ ] **Step 7: Wire into the custom-code `SearchingViz.jsx` wrapper**

Replace the full contents of `client/src/components/visualize/SearchingViz.jsx`:

```jsx
import SearchArrayViz from '../visualize-shared/SearchArrayViz.jsx';

export default function SearchingViz({ frame }) {
  const payload = (frame && frame.data) || {};
  const array = payload.array || [];
  const pointer = typeof payload.pointer === 'number' ? payload.pointer : -1;
  const target = payload.target;
  const foundIdx = typeof payload.foundIdx === 'number' ? payload.foundIdx : -1;
  const states = (frame && frame.states) || {};
  const notFound = frame && frame.type === 'done' && foundIdx < 0;

  return (
    <div>
      <SearchArrayViz array={array} states={states} pointer={pointer} target={target} foundIdx={foundIdx} notFound={notFound} />
      {foundIdx >= 0 && (
        <div style={{ textAlign: 'center', color: 'var(--green)', fontWeight: 700, fontSize: 13, padding: '8px 0' }}>
          ✓ Found at index {foundIdx}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 8: Run the full test suite again**

Run: `npx vitest run`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add client/src/components/visualize-shared/SearchArrayViz.jsx client/src/components/visualize-shared/__tests__/SearchArrayViz.test.jsx client/src/pages/searching/SearchingPage.jsx client/src/components/visualize/SearchingViz.jsx
git commit -m "refactor: extract SearchArrayViz shared between SearchingPage and Visualize My Code

Both now render the exact same pointer-arrow-row + cube-array + target
component, including the 'not found' red-cube state the custom-code
path previously had no equivalent of."
```

---

### Task 4: Extract `StackQueueChipsViz` (Stack/Queue)

**Files:**
- Create: `client/src/components/visualize-shared/StackQueueChipsViz.jsx`
- Test: `client/src/components/visualize-shared/__tests__/StackQueueChipsViz.test.jsx`
- Modify: `client/src/pages/stackqueue/StackQueuePage.jsx`
- Modify: `client/src/components/visualize/StackQueueViz.jsx`

**Interfaces:**
- Produces: `StackQueueChipsViz({ values = [], activeIndex = -1, direction = 'stack', emptyLabel = 'Empty Stack' })` — the generic push/pop chip-column/row view. Does not cover the parentheses char-chip or next-greater dual-row views (those stay `StackQueuePage`-only, per the design spec's non-goals).

- [ ] **Step 1: Write the failing test**

Create `client/src/components/visualize-shared/__tests__/StackQueueChipsViz.test.jsx`:

```jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StackQueueChipsViz from '../StackQueueChipsViz.jsx';

describe('StackQueueChipsViz', () => {
  it('shows the empty label when there are no values', () => {
    render(<StackQueueChipsViz values={[]} />);
    expect(screen.getByText('Empty Stack')).toBeInTheDocument();
  });

  it('renders a chip per value and a TOP label for stack direction', () => {
    render(<StackQueueChipsViz values={[3, 1]} direction="stack" />);
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('↑ TOP')).toBeInTheDocument();
  });

  it('renders a FRONT label for queue direction', () => {
    render(<StackQueueChipsViz values={[3, 1]} direction="queue" />);
    expect(screen.getByText('← FRONT')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/visualize-shared/__tests__/StackQueueChipsViz.test.jsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Create the shared component**

Create `client/src/components/visualize-shared/StackQueueChipsViz.jsx` (lifted verbatim from `StackQueuePage.jsx`'s "Shared Stack/Queue Display" block, lines ~319-338):

```jsx
export default function StackQueueChipsViz({ values = [], activeIndex = -1, direction = 'stack', emptyLabel = 'Empty Stack' }) {
  const isQueue = direction === 'queue';

  if (values.length === 0) {
    return <div style={{ color: 'var(--muted)', fontSize: 13 }}>{emptyLabel}</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: isQueue ? 'row' : 'column', gap: 6, alignItems: 'center' }}>
      {values.map((v, i) => (
        <div
          key={i}
          style={{
            width: isQueue ? 56 : 160, height: isQueue ? 56 : 40,
            borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'JetBrains Mono,monospace', fontWeight: 800, fontSize: 16,
            background: i === activeIndex ? 'var(--active-bg)' : 'var(--surface2)',
            border: i === activeIndex ? '2px solid var(--active-text)' : '1px solid var(--border2)',
            color: i === activeIndex ? 'var(--active-text)' : 'var(--text)',
            transition: 'all 0.3s', boxShadow: i === 0 ? '0 0 12px rgba(6,182,212,0.3)' : 'none',
          }}
        >
          {String(v)}
        </div>
      ))}
      {!isQueue && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>↑ TOP</div>}
      {isQueue && <div style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 4 }}>← FRONT</div>}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/visualize-shared/__tests__/StackQueueChipsViz.test.jsx`
Expected: PASS.

- [ ] **Step 5: Wire into `StackQueuePage.jsx`**

Add the import at the top of `client/src/pages/stackqueue/StackQueuePage.jsx`:
```js
import StackQueueChipsViz from "../../components/visualize-shared/StackQueueChipsViz.jsx";
```

Replace:
```jsx
            {/* Shared Stack/Queue Display */}
            {items.length === 0 ? (
              <div style={{color:"var(--muted)",fontSize:13}}>Empty Stack</div>
            ) : (
              <div style={{display:"flex",flexDirection:isQueue?"row":"column",gap:6,alignItems:"center"}}>
                {items.map((v,i) => (
                  <div key={i} style={{
                    width:isQueue?56:160, height:isQueue?56:40,
                    borderRadius:8, display:"flex",alignItems:"center",justifyContent:"center",
                    fontFamily:"JetBrains Mono,monospace",fontWeight:800,fontSize:16,
                    background: i===highlighted ? "var(--active-bg)" : "var(--surface2)",
                    border: i===highlighted ? "2px solid var(--active-text)" : "1px solid var(--border2)",
                    color: i===highlighted ? "var(--active-text)" : "var(--text)",
                    transition:"all 0.3s", boxShadow: i===0?"0 0 12px rgba(6,182,212,0.3)":"none"
                  }}>{v}</div>
                ))}
                {!isQueue && <div style={{fontSize:11,color:"var(--muted)",marginTop:4}}>↑ TOP</div>}
                {isQueue && <div style={{fontSize:11,color:"var(--muted)",marginLeft:4}}>← FRONT</div>}
              </div>
            )}
```
with:
```jsx
            {/* Shared Stack/Queue Display */}
            <StackQueueChipsViz values={items} activeIndex={highlighted} direction={isQueue ? "queue" : "stack"} />
```

- [ ] **Step 6: Run the full test suite to confirm no regression**

Run: `npx vitest run`
Expected: PASS.

- [ ] **Step 7: Wire into the custom-code `StackQueueViz.jsx` wrapper**

Replace the full contents of `client/src/components/visualize/StackQueueViz.jsx`:

```jsx
import StackQueueChipsViz from '../visualize-shared/StackQueueChipsViz.jsx';

export default function StackQueueViz({ frame }) {
  const payload = (frame && frame.data) || {};
  const values = payload.values || [];
  const activeIndex = typeof payload.activeIndex === 'number' ? payload.activeIndex : -1;
  const direction = payload.direction || 'stack';

  return (
    <div
      style={{
        padding: 16, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12,
        minHeight: direction === 'stack' ? 220 : undefined, display: 'flex', justifyContent: 'center', alignItems: 'center',
      }}
    >
      <StackQueueChipsViz values={values} activeIndex={activeIndex} direction={direction} emptyLabel="Empty" />
    </div>
  );
}
```

Note: `emptyLabel="Empty"` is passed here (rather than the shared default `"Empty Stack"`) to preserve the custom-code path's prior "Empty" wording exactly, since a stack/queue detected from arbitrary code has no page-level "Stack" vs "Queue" framing to justify the more specific default.

- [ ] **Step 8: Run the full test suite again**

Run: `npx vitest run`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add client/src/components/visualize-shared/StackQueueChipsViz.jsx client/src/components/visualize-shared/__tests__/StackQueueChipsViz.test.jsx client/src/pages/stackqueue/StackQueuePage.jsx client/src/components/visualize/StackQueueViz.jsx
git commit -m "refactor: extract StackQueueChipsViz shared between StackQueuePage and Visualize My Code

Also fixes a pre-existing divergence: the custom-code path was using
flexDirection: column-reverse for stacks while the dedicated page uses
plain column — they now render items in the same visual order."
```

---

### Task 5: Extract `LinkedListChainViz` (Linked List)

**Files:**
- Create: `client/src/components/visualize-shared/LinkedListChainViz.jsx`
- Test: `client/src/components/visualize-shared/__tests__/LinkedListChainViz.test.jsx`
- Modify: `client/src/pages/linkedlist/LinkedListPage.jsx`
- Modify: `client/src/components/visualize/LinkedListViz.jsx`

**Interfaces:**
- Produces: `LinkedListChainViz({ nodes = [], activeIdx = -1, visitedSet = new Set(), color })` — renders the node-box-and-arrow chain plus a trailing dashed "null" box.

- [ ] **Step 1: Write the failing test**

Create `client/src/components/visualize-shared/__tests__/LinkedListChainViz.test.jsx`:

```jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LinkedListChainViz from '../LinkedListChainViz.jsx';

describe('LinkedListChainViz', () => {
  it('shows an empty-list message with no nodes', () => {
    render(<LinkedListChainViz nodes={[]} />);
    expect(screen.getByText(/list is empty/i)).toBeInTheDocument();
  });

  it('renders one box per node plus a trailing null box', () => {
    render(<LinkedListChainViz nodes={[1, 2, 3]} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('null')).toBeInTheDocument();
  });

  it('marks the active node with the active node-box class', () => {
    render(<LinkedListChainViz nodes={[1, 2, 3]} activeIdx={1} />);
    expect(screen.getByText('2').className).toContain('active');
  });

  it('marks visited nodes with the visited node-box class', () => {
    render(<LinkedListChainViz nodes={[1, 2, 3]} visitedSet={new Set([0])} />);
    expect(screen.getByText('1').className).toContain('visited');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/visualize-shared/__tests__/LinkedListChainViz.test.jsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Create the shared component**

Create `client/src/components/visualize-shared/LinkedListChainViz.jsx` (lifted verbatim from `LinkedListPage.jsx`'s `LLNode`/`LinkedListViz` functions, lines ~10-34):

```jsx
function LLNode({ val, active, visited, last, color = 'var(--cyan)' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div
        className={`node-box ${active ? 'active' : visited ? 'visited' : ''}`}
        style={active ? { borderColor: color, boxShadow: `0 0 12px ${color}66` } : {}}
      >
        {val}
      </div>
      {!last && <div className="node-arrow">→</div>}
    </div>
  );
}

export default function LinkedListChainViz({ nodes = [], activeIdx = -1, visitedSet = new Set(), color }) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4, padding: 16,
        background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, minHeight: 80, flex: 1,
      }}
    >
      {nodes.length === 0 && <div style={{ color: 'var(--muted)', fontSize: 13 }}>List is empty</div>}
      {nodes.map((v, i) => (
        <LLNode key={i} val={v} active={activeIdx === i} visited={visitedSet.has(i)} last={i === nodes.length - 1} color={color} />
      ))}
      {nodes.length > 0 && <div className="node-box" style={{ borderStyle: 'dashed', color: 'var(--muted)' }}>null</div>}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/visualize-shared/__tests__/LinkedListChainViz.test.jsx`
Expected: PASS.

- [ ] **Step 5: Wire into `LinkedListPage.jsx`**

Replace the entire `LLNode`/`LinkedListViz` function block (lines 9-34):
```jsx
/* Linked List Node display */
function LLNode({ val, active, visited, last, color = "var(--cyan)" }) {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <div className={`node-box ${active ? "active" : visited ? "visited" : ""}`}
        style={active ? { borderColor: color, boxShadow: `0 0 12px ${color}66` } : {}}>
        {val}
      </div>
      {!last && <div className="node-arrow">→</div>}
    </div>
  );
}

function LinkedListViz({ nodes, activeIdx, visitedSet, color }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", flexWrap: "wrap", gap: 4, padding: 16,
      background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 12, minHeight: 80, flex: 1
    }}>
      {nodes.map((v, i) => (
        <LLNode key={i} val={v} active={activeIdx === i} visited={visitedSet.has(i)} last={i === nodes.length - 1} color={color} />
      ))}
      <div className="node-box" style={{ borderStyle: "dashed", color: "var(--muted)" }}>null</div>
    </div>
  );
}
```
with:
```jsx
import LinkedListChainViz from "../../components/visualize-shared/LinkedListChainViz.jsx";
```
(add this import near the top of the file, with the other imports)

and delete the `LLNode`/`LinkedListViz` function block entirely. Then replace every remaining reference to `<LinkedListViz ...>` in this file (there are 4: 3 inside `MergeSortedViz`, 1 in the main render) with `<LinkedListChainViz ...>` — same prop names, so it's a pure rename:

```jsx
function MergeSortedViz({ l1, l2, merged, p1, p2 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%", padding: "0 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 30, fontWeight: "bold", color: "var(--cyan)", fontSize: 14 }}>L1:</div>
        <LinkedListChainViz nodes={l1} activeIdx={p1} visitedSet={new Set(Array.from({ length: p1 }, (_, i) => i))} color="var(--cyan)" />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 30, fontWeight: "bold", color: "var(--orange)", fontSize: 14 }}>L2:</div>
        <LinkedListChainViz nodes={l2} activeIdx={p2} visitedSet={new Set(Array.from({ length: p2 }, (_, i) => i))} color="var(--orange)" />
      </div>
      <div style={{ width: "100%", height: 1, background: "var(--border2)" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 60, fontWeight: "bold", color: "var(--green)", fontSize: 14 }}>Merged:</div>
        <LinkedListChainViz nodes={merged} activeIdx={merged.length - 1} visitedSet={new Set()} color="var(--green)" />
      </div>
    </div>
  );
}
```

and further down, in the main render:
```jsx
            {isMerge ? (
              <MergeSortedViz l1={l1} l2={l2} merged={merged} p1={p1} p2={p2} />
            ) : (
              <LinkedListChainViz nodes={nodes} activeIdx={activeIdx} visitedSet={visitedSet} />
            )}
```

- [ ] **Step 6: Run the full test suite to confirm no regression**

Run: `npx vitest run`
Expected: PASS.

- [ ] **Step 7: Wire into the custom-code `LinkedListViz.jsx` wrapper**

Replace the full contents of `client/src/components/visualize/LinkedListViz.jsx`:

```jsx
import LinkedListChainViz from '../visualize-shared/LinkedListChainViz.jsx';

export default function LinkedListViz({ frame }) {
  const payload = (frame && frame.data) || {};
  const values = payload.values || [];
  const activeIndex = typeof payload.activeIndex === 'number' ? payload.activeIndex : -1;

  return <LinkedListChainViz nodes={values} activeIdx={activeIndex} visitedSet={new Set()} />;
}
```

- [ ] **Step 8: Run the full test suite again**

Run: `npx vitest run`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add client/src/components/visualize-shared/LinkedListChainViz.jsx client/src/components/visualize-shared/__tests__/LinkedListChainViz.test.jsx client/src/pages/linkedlist/LinkedListPage.jsx client/src/components/visualize/LinkedListViz.jsx
git commit -m "refactor: extract LinkedListChainViz shared between LinkedListPage and Visualize My Code

Also fixes the custom-code path rendering raw inline-style boxes
instead of the .node-box/.node-arrow CSS classes the dedicated page
uses, and gives it the active/visited node styling it never had."
```

---

### Task 6: Extract `TreeSvg` (Tree)

**Files:**
- Create: `client/src/components/visualize-shared/TreeSvg.jsx`
- Test: `client/src/components/visualize-shared/__tests__/TreeSvg.test.jsx`
- Modify: `client/src/pages/tree/TreePage.jsx`
- Modify: `client/src/components/visualize/TreeViz.jsx`

**Interfaces:**
- Produces: `TreeSvg({ nodes = [], edges = [], activeId, visitedOrder = [] })` — takes the **flat** `{id, label, depth}` node shape (matching `treeAdapter.js`'s output, which is the more general shape: it works for both binary and n-ary trees and doesn't break on duplicate values, unlike the dedicated page's original by-*value* active lookup). `TreePage`, which currently holds a *nested* `{val, left, right}` tree, gets a small local `treeToFlat()` helper to convert at the call site — this is the "adapt at the call site" pattern called out in the design spec.
- Layout note: this adapts the *existing custom-code* `TreeViz.jsx`'s depth-bucket position algorithm (works for n-ary trees, unlike the dedicated page's original recursive-only algorithm) but restyles it to match the dedicated page's proportions (percentage-based x instead of fixed pixel x, 70px depth spacing instead of 60px, r=20 instead of r=18) — see the design spec §4 note on this being an intentional adaptation, not a corner cut.

- [ ] **Step 1: Write the failing test**

Create `client/src/components/visualize-shared/__tests__/TreeSvg.test.jsx`:

```jsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import TreeSvg from '../TreeSvg.jsx';

describe('TreeSvg', () => {
  it('renders one circle+text per node', () => {
    const nodes = [
      { id: 'root', label: '4', depth: 0 },
      { id: 'rootL', label: '2', depth: 1 },
      { id: 'rootR', label: '6', depth: 1 },
    ];
    const edges = [{ from: 'root', to: 'rootL' }, { from: 'root', to: 'rootR' }];
    const { container } = render(<TreeSvg nodes={nodes} edges={edges} />);
    expect(container.querySelectorAll('circle').length).toBe(3);
    expect(container.querySelectorAll('line').length).toBe(2);
  });

  it('fills the active node with the active-bg color', () => {
    const nodes = [{ id: 'root', label: '4', depth: 0 }];
    const { container } = render(<TreeSvg nodes={nodes} edges={[]} activeId="root" />);
    const circle = container.querySelector('circle');
    expect(circle.getAttribute('fill')).toBe('var(--active-bg)');
  });

  it('renders a visited-order pill per entry when provided', () => {
    const { getByText } = render(<TreeSvg nodes={[]} edges={[]} visitedOrder={['4', '2']} />);
    expect(getByText('4')).toBeInTheDocument();
    expect(getByText('2')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/visualize-shared/__tests__/TreeSvg.test.jsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Create the shared component**

Create `client/src/components/visualize-shared/TreeSvg.jsx`:

```jsx
function computeTreePositions(nodes) {
  const byDepth = {};
  nodes.forEach((n) => {
    const depth = n.depth ?? 0;
    byDepth[depth] = byDepth[depth] || [];
    byDepth[depth].push(n);
  });

  const positions = {};
  Object.entries(byDepth).forEach(([depth, list]) => {
    const y = 30 + Number(depth) * 70;
    list.forEach((n, i) => {
      const x = ((i + 1) * 100) / (list.length + 1);
      positions[n.id] = { x, y };
    });
  });
  return positions;
}

export default function TreeSvg({ nodes = [], edges = [], activeId, visitedOrder = [] }) {
  const positions = computeTreePositions(nodes);

  return (
    <div style={{ padding: 16, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'auto' }}>
      <svg width="100%" height={320}>
        {edges.map((e, i) => {
          const from = positions[e.from];
          const to = positions[e.to];
          if (!from || !to) return null;
          return (
            <line key={i} x1={`${from.x}%`} y1={from.y} x2={`${to.x}%`} y2={to.y} stroke="var(--border2)" strokeWidth={1.5} />
          );
        })}
        {nodes.map((n) => {
          const pos = positions[n.id];
          if (!pos) return null;
          const isActive = n.id === activeId;
          return (
            <g key={n.id}>
              <circle
                cx={`${pos.x}%`} cy={pos.y} r={20}
                fill={isActive ? 'var(--active-bg)' : 'var(--surface2)'}
                stroke={isActive ? 'var(--active-bg)' : 'var(--border2)'}
                strokeWidth={2}
                style={{ transition: 'fill 0.3s, stroke 0.3s' }}
              />
              <text
                x={`${pos.x}%`} y={pos.y + 5} textAnchor="middle" fontSize={12} fontWeight="bold"
                fill={isActive ? 'var(--active-text)' : 'var(--text)'}
                style={{ transition: 'fill 0.3s' }}
              >
                {n.label}
              </text>
            </g>
          );
        })}
      </svg>
      {visitedOrder.length > 0 && (
        <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4, padding: 8 }}>
          {visitedOrder.map((v, i) => (
            <div key={i} style={{ padding: '2px 10px', borderRadius: 20, background: 'rgba(6,182,212,0.15)', color: 'var(--cyan)', fontSize: 12, fontWeight: 700 }}>
              {v}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/visualize-shared/__tests__/TreeSvg.test.jsx`
Expected: PASS.

- [ ] **Step 5: Wire into `TreePage.jsx`**

Replace the `TreeNode` function (lines 36-54) with a flat-conversion helper. Replace:
```jsx
function TreeNode({ node, activeSet, depth = 0, x = 50, spread = 25 }) {
  if (!node) return null;
  const lx = x - spread / (depth + 1);
  const rx = x + spread / (depth + 1);
  const active = activeSet.has(node.val);
  return (
    <g>
      {node.left && <line x1={`${x}%`} y1={depth * 70 + 30} x2={`${lx}%`} y2={(depth + 1) * 70 + 30} stroke="var(--border2)" strokeWidth={1.5} />}
      {node.right && <line x1={`${x}%`} y1={depth * 70 + 30} x2={`${rx}%`} y2={(depth + 1) * 70 + 30} stroke="var(--border2)" strokeWidth={1.5} />}
      <circle cx={`${x}%`} cy={depth * 70 + 30} r={20}
        fill={active ? "var(--active-bg)" : "var(--surface2)"} stroke={active ? "var(--active-bg)" : "var(--border2)"} strokeWidth={2}
        style={{ transition: "fill 0.3s" }} />
      <text x={`${x}%`} y={depth * 70 + 35} textAnchor="middle" fontSize={12} fontWeight="bold"
        fill={active ? "var(--active-text)" : "var(--text)"} style={{ transition: "fill 0.3s" }}>{node.val}</text>
      {node.left && <TreeNode node={node.left} activeSet={activeSet} depth={depth + 1} x={lx} spread={spread} />}
      {node.right && <TreeNode node={node.right} activeSet={activeSet} depth={depth + 1} x={rx} spread={spread} />}
    </g>
  );
}
```
with:
```jsx
// Converts the page's nested {val,left,right} tree into the flat {nodes,edges} shape
// TreeSvg (and treeAdapter.js, for the custom-code path) both use — see treeAdapter.js's
// treeToNodesEdges for the parallel version operating on trace-derived nodes.
function treeToFlat(node, path = "root", depth = 0) {
  if (!node) return { nodes: [], edges: [] };
  const nodes = [{ id: path, label: String(node.val), depth }];
  const edges = [];
  if (node.left) {
    edges.push({ from: path, to: `${path}L` });
    const sub = treeToFlat(node.left, `${path}L`, depth + 1);
    nodes.push(...sub.nodes);
    edges.push(...sub.edges);
  }
  if (node.right) {
    edges.push({ from: path, to: `${path}R` });
    const sub = treeToFlat(node.right, `${path}R`, depth + 1);
    nodes.push(...sub.nodes);
    edges.push(...sub.edges);
  }
  return { nodes, edges };
}
```

Add the import near the top of the file:
```jsx
import TreeSvg from "../../components/visualize-shared/TreeSvg.jsx";
```

Replace the center-viz render block:
```jsx
        {/* CENTER — Visualizer */}
        <div className="viz-center">
          <div className="card" style={{ padding: 16, minHeight: 340 }}>
            <svg width="100%" height={320}>
              <TreeNode node={tree} activeSet={activeSet} depth={0} x={50} spread={28} />

            </svg>
          </div>

          {visited.length > 0 && (
            <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 4, padding: 8 }}>
              {visited.map((v, i) => (
                <div key={i} style={{ padding: "2px 10px", borderRadius: 20, background: "rgba(6,182,212,0.15)", color: "var(--cyan)", fontSize: 12, fontWeight: 700 }}>{v}</div>
              ))}
            </div>
          )}
        </div>
```
with:
```jsx
        {/* CENTER — Visualizer */}
        <div className="viz-center">
          {(() => {
            const { nodes: flatNodes, edges: flatEdges } = treeToFlat(tree);
            const activeValue = activeSet.size > 0 ? String([...activeSet][0]) : null;
            const activeNode = activeValue ? flatNodes.find((n) => n.label === activeValue) : null;
            return (
              <TreeSvg
                nodes={flatNodes}
                edges={flatEdges}
                activeId={activeNode ? activeNode.id : undefined}
                visitedOrder={visited.map(String)}
              />
            );
          })()}
        </div>
```

- [ ] **Step 6: Run the full test suite to confirm no regression**

Run: `npx vitest run`
Expected: PASS.

- [ ] **Step 7: Wire into the custom-code `TreeViz.jsx` wrapper**

Replace the full contents of `client/src/components/visualize/TreeViz.jsx`:

```jsx
import TreeSvg from '../visualize-shared/TreeSvg.jsx';

export default function TreeViz({ frame }) {
  const nodes = (frame && frame.data && frame.data.nodes) || [];
  const edges = (frame && frame.data && frame.data.edges) || [];
  const visitedOrder = (frame && frame.data && frame.data.visitedOrder) || [];
  const states = (frame && frame.states) || {};
  const activeId = Object.keys(states).find((id) => states[id] === 'active');

  return <TreeSvg nodes={nodes} edges={edges} activeId={activeId} visitedOrder={visitedOrder} />;
}
```

- [ ] **Step 8: Run the full test suite again**

Run: `npx vitest run`
Expected: PASS. If any existing `TreeViz.test.jsx`/`gridAndRouter.test.jsx`/`svgVisualizers.test.jsx` test asserted specific pixel `cx`/`cy` values from the old fixed-pixel layout, update its expected coordinates to match the new percentage-based `computeTreePositions` (30 + depth*70 for y; `((i+1)*100)/(list.length+1)` percent for x) — check `client/src/components/visualize/__tests__/TreeViz.test.jsx` and `svgVisualizers.test.jsx` for any such assertions and adjust them to the new formula rather than deleting coverage.

- [ ] **Step 9: Commit**

```bash
git add client/src/components/visualize-shared/TreeSvg.jsx client/src/components/visualize-shared/__tests__/TreeSvg.test.jsx client/src/pages/tree/TreePage.jsx client/src/components/visualize/TreeViz.jsx client/src/components/visualize/__tests__/TreeViz.test.jsx client/src/components/visualize/__tests__/svgVisualizers.test.jsx
git commit -m "refactor: extract TreeSvg shared between TreePage and Visualize My Code

TreePage now converts its nested tree to the flat node/edge shape
treeAdapter.js already produces, and both render through the same
component — the dedicated page's exact colors/radius/spacing/visited-
pill-strip, applied on top of the custom-code path's more general
depth-bucket layout (which, unlike the original recursive layout,
also supports n-ary/children-array trees)."
```

---

### Task 7: Extract `DpTableViz` (Dynamic Programming)

**Files:**
- Create: `client/src/components/visualize-shared/DpTableViz.jsx`
- Test: `client/src/components/visualize-shared/__tests__/DpTableViz.test.jsx`
- Modify: `client/src/pages/dp/DPPage.jsx`
- Modify: `client/src/components/visualize/DPGridViz.jsx`

**Interfaces:**
- Produces: `DpTableViz({ dim, values = [], grid = [], active, colorScheme = 'none', indexLabel, rowLabels, colLabels, emptyLabel = 'Press Start' })`.
  - `dim === 1`: renders `values` as a chip row; `active` is a number (or `-1`); `indexLabel` is an optional `(i) => string` for the small sub-label under each chip (fib passes `` i => `n=${i}` ``, coin passes `` i => `amt=${i}` ``, custom-code passes nothing).
  - `dim === 2`: renders `grid` as a table; `active` is `[row, col]` (or `[-1,-1]`/undefined); `colorScheme` is `'none' | 'green' | 'purple'` (knapsack passes `'green'`, LCS passes `'purple'`, fib/coin/custom-code pass `'none'`/`'green'` respectively — see step 5); `rowLabels`/`colLabels` are optional string arrays for LCS's string-axis headers (knapsack and custom-code pass neither).
  - `Infinity`/`-Infinity` values always render as `∞`/`-∞`.

- [ ] **Step 1: Write the failing test**

Create `client/src/components/visualize-shared/__tests__/DpTableViz.test.jsx`:

```jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DpTableViz from '../DpTableViz.jsx';

describe('DpTableViz', () => {
  it('shows the empty label when dim=1 and values is empty', () => {
    render(<DpTableViz dim={1} values={[]} />);
    expect(screen.getByText('Press Start')).toBeInTheDocument();
  });

  it('renders one chip per 1-D value, formatting Infinity as ∞', () => {
    render(<DpTableViz dim={1} values={[0, 1, Infinity]} />);
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('∞')).toBeInTheDocument();
  });

  it('renders an index label under each 1-D chip when provided', () => {
    render(<DpTableViz dim={1} values={[5, 8]} indexLabel={(i) => `n=${i}`} />);
    expect(screen.getByText('n=0')).toBeInTheDocument();
    expect(screen.getByText('n=1')).toBeInTheDocument();
  });

  it('renders a 2-D grid as a table', () => {
    render(<DpTableViz dim={2} grid={[[0, 0], [0, 3]]} />);
    const cells = screen.getAllByText('0');
    expect(cells.length).toBe(3);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders row/col labels when provided (LCS header case)', () => {
    render(<DpTableViz dim={2} grid={[[0, 0], [0, 1]]} rowLabels={['', 'A']} colLabels={['B']} />);
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('shows the empty label when dim=2 and grid is empty', () => {
    render(<DpTableViz dim={2} grid={[]} />);
    expect(screen.getByText('Press Start')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/visualize-shared/__tests__/DpTableViz.test.jsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Create the shared component**

Create `client/src/components/visualize-shared/DpTableViz.jsx`:

```jsx
function formatDpCell(value) {
  if (value === Infinity) return '∞';
  if (value === -Infinity) return '-∞';
  return value;
}

function dpCellStyle(value, isActive, colorScheme) {
  if (isActive) return { background: 'var(--active-bg)', color: 'var(--active-text)' };
  if (colorScheme === 'green' && typeof value === 'number' && value > 0) {
    return { background: 'var(--surface2)', color: 'var(--green)' };
  }
  if (colorScheme === 'purple' && typeof value === 'number' && value > 0) {
    return { background: 'var(--surface2)', color: 'var(--purple)' };
  }
  return { background: 'var(--surface2)', color: undefined };
}

export default function DpTableViz({
  dim, values = [], grid = [], active, colorScheme = 'none',
  indexLabel, rowLabels, colLabels, emptyLabel = 'Press Start',
}) {
  if (dim === 1) {
    if (values.length === 0) {
      return <span style={{ color: 'var(--muted)' }}>{emptyLabel}</span>;
    }
    return (
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
        {values.map((v, i) => {
          const isActive = active === i;
          const { background, color } = dpCellStyle(v, isActive, colorScheme);
          return (
            <div
              key={i}
              style={{
                textAlign: 'center', minWidth: 48, padding: '8px 4px', borderRadius: 8,
                background, border: `1px solid ${isActive ? 'var(--active-bg)' : 'var(--border)'}`,
                transition: 'all 0.3s', color,
              }}
            >
              {indexLabel && (
                <div style={{ fontSize: 10, color: isActive ? 'var(--active-text)' : 'var(--muted)' }}>
                  {indexLabel(i)}
                </div>
              )}
              <div style={{ fontWeight: 700, fontFamily: 'JetBrains Mono,monospace', fontSize: 13 }}>
                {formatDpCell(v)}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (grid.length === 0) {
    return <span style={{ color: 'var(--muted)' }}>{emptyLabel}</span>;
  }
  const [activeI, activeJ] = Array.isArray(active) ? active : [-1, -1];

  return (
    <table style={{ borderCollapse: 'separate', borderSpacing: 3 }}>
      <tbody>
        {colLabels && (
          <tr>
            <td /><td />
            {colLabels.map((c, j) => (
              <td key={j} style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--muted)' }}>{c}</td>
            ))}
          </tr>
        )}
        {grid.map((row, i) => (
          <tr key={i}>
            {rowLabels && (
              <td style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--muted)', width: 20 }}>
                {rowLabels[i]}
              </td>
            )}
            {row.map((val, j) => {
              const isActive = activeI === i && activeJ === j;
              const { background, color } = dpCellStyle(val, isActive, colorScheme);
              return (
                <td
                  key={j}
                  style={{
                    width: 36, height: 32, textAlign: 'center', borderRadius: 6,
                    background, color, fontFamily: 'JetBrains Mono,monospace', fontSize: 12,
                    fontWeight: 700, transition: 'all 0.3s',
                  }}
                >
                  {formatDpCell(val)}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/visualize-shared/__tests__/DpTableViz.test.jsx`
Expected: PASS.

- [ ] **Step 5: Wire into `DPPage.jsx`**

Add the import near the top of `client/src/pages/dp/DPPage.jsx`:
```jsx
import DpTableViz from "../../components/visualize-shared/DpTableViz.jsx";
```

Replace all four viz blocks inside the `viz-center` card (the Fibonacci, Coin Change, Knapsack, and LCS conditional blocks, lines ~264-368):

```jsx
            {/* Fibonacci */}
            {isFib && (
              <div style={{display:"flex",gap:6,flexWrap:"wrap", justifyContent:"center"}}>
                {fibDp.length === 0 && <span style={{color:"var(--muted)"}}>Press Start</span>}
                {fibDp.map((v,i)=>(
                  <div key={i} style={{
                    textAlign:"center",minWidth:48,
                    padding:"8px 4px",borderRadius:8,
                    background:i===fibActive?"var(--active-bg)":"var(--surface2)",
                    border:`1px solid ${i===fibActive?"var(--active-bg)":"var(--border)"}`,
                    transition:"all 0.3s",
                    color:i===fibActive?"var(--active-text)":"var(--text)"
                  }}>
                    <div style={{fontSize:10,color:i===fibActive?"var(--active-text)":"var(--muted)"}}>n={i}</div>
                    <div style={{fontWeight:700,fontFamily:"JetBrains Mono,monospace",fontSize:13}}>{v}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Coin Change */}
            {isCoin && (
              <div style={{display:"flex",gap:6,flexWrap:"wrap", justifyContent:"center"}}>
                {coinDp.length === 0 && <span style={{color:"var(--muted)"}}>Press Start</span>}
                {coinDp.map((v,i)=>(
                  <div key={i} style={{
                    textAlign:"center",minWidth:48,
                    padding:"8px 4px",borderRadius:8,
                    background:i===coinActive?"var(--active-bg)":"var(--surface2)",
                    border:`1px solid ${i===coinActive?"var(--active-bg)":"var(--border)"}`,
                    transition:"all 0.3s",
                    color:i===coinActive?"var(--active-text)":"var(--text)"
                  }}>
                    <div style={{fontSize:10,color:i===coinActive?"var(--active-text)":"var(--muted)"}}>amt={i}</div>
                    <div style={{fontWeight:700,fontFamily:"JetBrains Mono,monospace",fontSize:13}}>{v===Infinity?"∞":v}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Knapsack */}
            {isKnapsack && (
              <div style={{display:"flex", flexDirection:"column", alignItems:"center"}}>
                {knapTable.length === 0 && <span style={{color:"var(--muted)"}}>Press Start</span>}
                {knapTable.length > 0 && (
                  <table style={{borderCollapse:"separate",borderSpacing:3}}>
                    <tbody>
                      {knapTable.map((row,i)=>(
                        <tr key={i}>
                          {row.map((val,w)=>{
                            const isActive = knapActiveCell&&knapActiveCell[0]===i&&knapActiveCell[1]===w;
                            return (
                              <td key={w} style={{
                                width:36,height:32,textAlign:"center",borderRadius:6,
                                background:isActive?"var(--active-bg)":val>0?"var(--surface2)":"var(--surface)",
                                color:isActive?"var(--active-text)":val>0?"var(--green)":"var(--muted)",
                                fontFamily:"JetBrains Mono,monospace",fontSize:12,fontWeight:700,
                                transition:"all 0.3s"
                              }}>{val}</td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* LCS */}
            {isLcs && (
              <div style={{display:"flex", flexDirection:"column", alignItems:"center"}}>
                {lcsTable.length === 0 && <span style={{color:"var(--muted)"}}>Press Start</span>}
                {lcsTable.length > 0 && (
                  <table style={{borderCollapse:"separate",borderSpacing:3}}>
                    <tbody>
                      {/* Header Row */}
                      <tr>
                        <td></td><td></td>
                        {s2.split('').map((c, j) => <td key={j} style={{textAlign:"center", fontWeight:"bold", color:"var(--muted)"}}>{c}</td>)}
                      </tr>
                      {lcsTable.map((row,i)=>(
                        <tr key={i}>
                          <td style={{textAlign:"center", fontWeight:"bold", color:"var(--muted)", width: 20}}>
                            {i > 0 ? s1[i-1] : ''}
                          </td>
                          {row.map((val,j)=>{
                            const isActive = lcsActiveCell&&lcsActiveCell[0]===i&&lcsActiveCell[1]===j;
                            return (
                              <td key={j} style={{
                                width:36,height:32,textAlign:"center",borderRadius:6,
                                background:isActive?"var(--active-bg)":val>0?"var(--surface2)":"var(--surface)",
                                color:isActive?"var(--active-text)":val>0?"var(--purple)":"var(--muted)",
                                fontFamily:"JetBrains Mono,monospace",fontSize:12,fontWeight:700,
                                transition:"all 0.3s"
                              }}>{val}</td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
```

with:

```jsx
            {/* Fibonacci */}
            {isFib && (
              <DpTableViz dim={1} values={fibDp} active={fibActive} indexLabel={(i) => `n=${i}`} />
            )}

            {/* Coin Change */}
            {isCoin && (
              <DpTableViz dim={1} values={coinDp} active={coinActive} indexLabel={(i) => `amt=${i}`} />
            )}

            {/* Knapsack */}
            {isKnapsack && (
              <DpTableViz dim={2} grid={knapTable} active={knapActiveCell} colorScheme="green" />
            )}

            {/* LCS */}
            {isLcs && (
              <DpTableViz
                dim={2}
                grid={lcsTable}
                active={lcsActiveCell}
                colorScheme="purple"
                rowLabels={lcsTable.map((_, i) => (i > 0 ? s1[i - 1] : ''))}
                colLabels={s2.split('')}
              />
            )}
```

Note the color scheme is a deliberate, small deviation from the byte-for-byte original: the original knapsack/LCS cells used `val > 0 ? 'var(--surface2)' : 'var(--surface)'` for background (a two-tone background even for inactive cells) whereas `DpTableViz` always uses `'var(--surface2)'` for the background and only varies the *text* color. Confirm this visually in Task 14's manual pass — if the two-tone background turns out to matter more than expected, it's a one-line follow-up to `dpCellStyle`, not a structural problem.

- [ ] **Step 6: Run the full test suite to confirm no regression**

Run: `npx vitest run`
Expected: PASS.

- [ ] **Step 7: Wire into the custom-code `DPGridViz.jsx` wrapper**

Replace the full contents of `client/src/components/visualize/DPGridViz.jsx`:

```jsx
import DpTableViz from '../visualize-shared/DpTableViz.jsx';

export default function DPGridViz({ frame }) {
  const payload = (frame && frame.data) || {};
  const states = (frame && frame.states) || {};
  const dim = payload.dim || 2;

  if (dim === 1) {
    const activeKey = Object.keys(states).find((k) => states[k] === 'active');
    const active = activeKey !== undefined ? Number(activeKey) : -1;
    return <DpTableViz dim={1} values={payload.values || []} active={active} colorScheme="green" />;
  }

  const activeKey = Object.keys(states).find((k) => states[k] === 'active');
  const active = activeKey ? activeKey.split(',').map(Number) : [-1, -1];
  return <DpTableViz dim={2} grid={payload.grid || []} active={active} colorScheme="green" />;
}
```

- [ ] **Step 8: Run the full test suite again**

Run: `npx vitest run`
Expected: PASS. If any existing `DPGridViz` test in `client/src/components/visualize/__tests__/gridAndRouter.test.jsx` asserted a specific background color string, check it still matches `DpTableViz`'s `colorScheme="green"` output; adjust the assertion to the new color logic if needed rather than deleting the test.

- [ ] **Step 9: Commit**

```bash
git add client/src/components/visualize-shared/DpTableViz.jsx client/src/components/visualize-shared/__tests__/DpTableViz.test.jsx client/src/pages/dp/DPPage.jsx client/src/components/visualize/DPGridViz.jsx client/src/components/visualize/__tests__/gridAndRouter.test.jsx
git commit -m "refactor: extract DpTableViz shared between DPPage and Visualize My Code

One component now serves all of DPPage's four DP shapes (Fibonacci and
Coin Change's 1-D chip rows, Knapsack and LCS's 2-D tables, including
LCS's string-axis headers) plus the custom-code path's generic 1-D/2-D
rendering, de-duplicating what were four near-identical copies."
```

---

## Phase 3 — Audio fidelity: real per-frame types in every remaining adapter

Sorting/Searching adapters already assign `'compare'`/`'swap'`/`'done'` correctly (unchanged by this phase). The six tasks below fix the other six adapters, each of which currently tags nearly every frame `'info'`. Each task is a small, isolated change to one adapter file's frame-building loop — no dependency between these tasks, and none of them touch any file from Phase 2.

### Task 8: Recursion adapter — `'compare'` on call frames

**Files:**
- Modify: `client/src/utils/traceAdapters/recursionAdapter.js`
- Test: `client/src/utils/traceAdapters/__tests__/recursionAdapter.test.js`

- [ ] **Step 1: Write the failing test**

Add to `client/src/utils/traceAdapters/__tests__/recursionAdapter.test.js` (inspect the file first for its existing `describe` block name and import style, then add inside it):

```js
  it('tags a call-entry frame as compare (a tick sound), not info', () => {
    const trace = [
      { line: 1, event: 'call', functionName: 'fact', locals: { n: 3 }, callDepth: 1 },
      { line: 2, event: 'return', functionName: 'fact', locals: {}, callDepth: 1 },
    ];
    const frames = adaptRecursionTrace(trace);
    expect(frames[0].type).toBe('compare');
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/utils/traceAdapters/__tests__/recursionAdapter.test.js`
Expected: FAIL — `frames[0].type` is `'info'`.

- [ ] **Step 3: Implement**

In `client/src/utils/traceAdapters/recursionAdapter.js`, in the `record.event === 'call'` branch, replace:
```js
      frames.push({
        data: [...stack],
        states: {},
        log: `Entering ${record.functionName || 'function'}(${Object.values(record.locals || {}).join(', ')})`,
        type: 'info',
      });
```
with:
```js
      frames.push({
        data: [...stack],
        states: {},
        log: `Entering ${record.functionName || 'function'}(${Object.values(record.locals || {}).join(', ')})`,
        type: 'compare',
      });
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/utils/traceAdapters/__tests__/recursionAdapter.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add client/src/utils/traceAdapters/recursionAdapter.js client/src/utils/traceAdapters/__tests__/recursionAdapter.test.js
git commit -m "fix: tag recursion call frames as compare instead of info for a distinct tick sound per call"
```

---

### Task 9: Linked-list adapter — `'compare'` on advance, `'swap'` on same-length mutation

**Files:**
- Modify: `client/src/utils/traceAdapters/linkedListAdapter.js`
- Test: `client/src/utils/traceAdapters/__tests__/linkedListAdapter.test.js`

- [ ] **Step 1: Write the failing test**

Add to `client/src/utils/traceAdapters/__tests__/linkedListAdapter.test.js`:

```js
  it('tags a same-length, changed-content frame as swap (a mutation), and a shrinking-chain frame as compare (an advance)', () => {
    const n3 = { value: 3, next: null };
    const n2 = { value: 2, next: n3 };
    const n1 = { value: 1, next: n2 };
    // Reversed order of the same 3 nodes, still length 3 — represents an in-place mutation.
    const r3 = { value: 1, next: null };
    const r2 = { value: 2, next: r3 };
    const r1 = { value: 3, next: r2 };
    const trace = [
      { line: 1, locals: { node: n1 }, callDepth: 0, event: 'step' }, // [1,2,3] — first frame, default compare
      { line: 2, locals: { node: n2 }, callDepth: 0, event: 'step' }, // [2,3] — shrunk from 3 to 2 -> advance -> compare
      { line: 3, locals: { node: r1 }, callDepth: 0, event: 'step' }, // [3,2,1] — same length as [2,3]? no, length 3 vs 2, still shrink-or-grow path
    ];
    const frames = adaptLinkedListTrace(trace);
    expect(frames[0].type).toBe('compare');
    expect(frames[1].type).toBe('compare');
  });

  it('tags a frame whose chain is the same length but different content as swap', () => {
    const a2 = { value: 2, next: null };
    const a1 = { value: 1, next: a2 };
    const b2 = { value: 1, next: null };
    const b1 = { value: 2, next: b2 };
    const trace = [
      { line: 1, locals: { node: a1 }, callDepth: 0, event: 'step' }, // [1,2]
      { line: 2, locals: { node: b1 }, callDepth: 0, event: 'step' }, // [2,1] — same length, different content
    ];
    const frames = adaptLinkedListTrace(trace);
    expect(frames[1].type).toBe('swap');
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/utils/traceAdapters/__tests__/linkedListAdapter.test.js`
Expected: FAIL — every frame currently has `type: 'info'` except the last, which the code forces to `'done'`.

- [ ] **Step 3: Implement**

In `client/src/utils/traceAdapters/linkedListAdapter.js`, replace the `adaptLinkedListTrace` frame-building loop:

```js
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
```

with:

```js
  const frames = [];
  let prevValues = null;
  trace.forEach((record) => {
    const node = record.locals ? record.locals[headVarName] : undefined;
    if (node === undefined) return;
    const values = isListNode(node) ? chainToValues(node) : [];
    // Same length but different content -> the pointer didn't just advance, something
    // was mutated (e.g. list reversal rewriting .next pointers) -> 'swap'. Any other
    // change (typically the chain shrinking as the traversal pointer walks forward)
    // -> 'compare'.
    let type = 'compare';
    if (prevValues && values.length === prevValues.length && JSON.stringify(values) !== JSON.stringify(prevValues)) {
      type = 'swap';
    }
    frames.push({
      data: { values, activeIndex: values.length > 0 ? 0 : -1 },
      states: {},
      log: `Line ${record.line}: ${headVarName} -> [${values.join(' -> ')}]`,
      type,
    });
    prevValues = values;
  });
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/utils/traceAdapters/__tests__/linkedListAdapter.test.js`
Expected: PASS — all tests in the file, including the two new ones and the pre-existing ones (which don't assert on `type`, so are unaffected).

- [ ] **Step 5: Commit**

```bash
git add client/src/utils/traceAdapters/linkedListAdapter.js client/src/utils/traceAdapters/__tests__/linkedListAdapter.test.js
git commit -m "fix: distinguish compare (pointer advance) from swap (in-place mutation) in linked-list adapter frame types"
```

---

### Task 10: Tree adapter — `'compare'` on every visit

**Files:**
- Modify: `client/src/utils/traceAdapters/treeAdapter.js`
- Test: `client/src/utils/traceAdapters/__tests__/treeAdapter.test.js`

- [ ] **Step 1: Write the failing test**

Add to `client/src/utils/traceAdapters/__tests__/treeAdapter.test.js` (check the file's existing import/describe style first):

```js
  it('tags every visit frame as compare, matching TreePage\'s own "Visiting node" convention', () => {
    const root = { val: 4, left: { val: 2, left: null, right: null }, right: null };
    const trace = [
      { line: 1, locals: { node: root }, callDepth: 0, event: 'step' },
      { line: 2, locals: { node: root.left }, callDepth: 0, event: 'step' },
    ];
    const frames = adaptTreeTrace(trace);
    expect(frames[0].type).toBe('compare');
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/utils/traceAdapters/__tests__/treeAdapter.test.js`
Expected: FAIL — `frames[0].type` is `'info'`.

- [ ] **Step 3: Implement**

In `client/src/utils/traceAdapters/treeAdapter.js`, in `adaptTreeTrace`, replace:
```js
    frames.push({
      data: { nodes, edges, visitedOrder: [...visitedOrder] },
      states,
      log: `Line ${record.line}: visiting ${varName}`,
      type: 'info',
    });
```
with:
```js
    frames.push({
      data: { nodes, edges, visitedOrder: [...visitedOrder] },
      states,
      log: `Line ${record.line}: visiting ${varName}`,
      type: 'compare',
    });
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/utils/traceAdapters/__tests__/treeAdapter.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add client/src/utils/traceAdapters/treeAdapter.js client/src/utils/traceAdapters/__tests__/treeAdapter.test.js
git commit -m "fix: tag every tree-visit frame as compare, matching TreePage's own per-node-visit audio convention"
```

---

### Task 11: Graph adapter — `'swap'` on newly-visited neighbors, `'compare'` otherwise

**Files:**
- Modify: `client/src/utils/traceAdapters/graphAdapter.js`
- Test: `client/src/utils/traceAdapters/__tests__/graphAdapter.test.js`

- [ ] **Step 1: Write the failing test**

Add to `client/src/utils/traceAdapters/__tests__/graphAdapter.test.js`:

```js
  it('tags a frame that newly visits a node as swap, and a frame with no new visits as compare', () => {
    const trace = [
      { line: 1, locals: { visited: [] }, callDepth: 0, event: 'step' },
      { line: 2, locals: { visited: ['A'] }, callDepth: 0, event: 'step' }, // A newly visited -> swap
      { line: 3, locals: { visited: ['A'] }, callDepth: 0, event: 'step' }, // no change -> compare
    ];
    const frames = adaptGraphTrace(trace);
    expect(frames[1].type).toBe('swap');
    expect(frames[2].type).toBe('compare');
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/utils/traceAdapters/__tests__/graphAdapter.test.js`
Expected: FAIL — both frames currently have `type: 'info'` (frame 2 gets overridden to `'done'` since it's the last frame in this 3-frame trace... note: to keep the test meaningful, this trace has 3 frames so frame index 2 (the third, last) would get force-set to `'done'` by the existing "last frame is always done" rule, NOT `'compare'`. Adjust the test before running it: add a 4th no-op frame so frame index 2 is not the last one.

Corrected test (use this instead of the one above):
```js
  it('tags a frame that newly visits a node as swap, and a frame with no new visits as compare', () => {
    const trace = [
      { line: 1, locals: { visited: [] }, callDepth: 0, event: 'step' },
      { line: 2, locals: { visited: ['A'] }, callDepth: 0, event: 'step' }, // A newly visited -> swap
      { line: 3, locals: { visited: ['A'] }, callDepth: 0, event: 'step' }, // no change -> compare
      { line: 4, locals: { visited: ['A', 'B'] }, callDepth: 0, event: 'step' }, // last frame -> forced done
    ];
    const frames = adaptGraphTrace(trace);
    expect(frames[1].type).toBe('swap');
    expect(frames[2].type).toBe('compare');
    expect(frames[3].type).toBe('done');
  });
```

- [ ] **Step 3: Implement**

In `client/src/utils/traceAdapters/graphAdapter.js`, in `adaptGraphTrace`'s frame-building loop, replace:
```js
    frames.push({
      data: { nodes: [...allNodes], edges: adjacency ? adjacency.edges : [] },
      states,
      log: `Line ${record.line}: visited = {${[...visited].join(', ')}}`,
      type: 'info',
    });
```
with:
```js
    frames.push({
      data: { nodes: [...allNodes], edges: adjacency ? adjacency.edges : [] },
      states,
      log: `Line ${record.line}: visited = {${[...visited].join(', ')}}`,
      type: newlyVisited.length > 0 ? 'swap' : 'compare',
    });
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/utils/traceAdapters/__tests__/graphAdapter.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add client/src/utils/traceAdapters/graphAdapter.js client/src/utils/traceAdapters/__tests__/graphAdapter.test.js
git commit -m "fix: tag graph frames swap when marking new nodes visited, compare otherwise, matching GraphPage's own BFS/DFS audio convention"
```

---

### Task 12: Stack/Queue adapter — `'info'` on grow, `'swap'` on shrink, `'compare'` on unchanged

**Files:**
- Modify: `client/src/utils/traceAdapters/stackQueueAdapter.js`
- Test: `client/src/utils/traceAdapters/__tests__/stackQueueAdapter.test.js`

- [ ] **Step 1: Write the failing test**

Add to `client/src/utils/traceAdapters/__tests__/stackQueueAdapter.test.js` (check its existing import/describe style first):

```js
  it('tags a growing frame info, a shrinking frame swap, and an unchanged-size frame compare', () => {
    const trace = [
      { line: 1, locals: { stack: [1] }, callDepth: 0, event: 'step' },       // first frame -> info
      { line: 2, locals: { stack: [1, 2] }, callDepth: 0, event: 'step' },     // grew -> info
      { line: 3, locals: { stack: [1, 2] }, callDepth: 0, event: 'step' },     // unchanged -> compare
      { line: 4, locals: { stack: [1] }, callDepth: 0, event: 'step' },        // shrank -> swap
      { line: 5, locals: { stack: [] }, callDepth: 0, event: 'step' },         // last frame -> forced done
    ];
    const frames = adaptStackQueueTrace(trace);
    expect(frames[0].type).toBe('info');
    expect(frames[1].type).toBe('info');
    expect(frames[2].type).toBe('compare');
    expect(frames[3].type).toBe('swap');
    expect(frames[4].type).toBe('done');
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/utils/traceAdapters/__tests__/stackQueueAdapter.test.js`
Expected: FAIL — frames 0-3 currently all have `type: 'info'`, so `frames[2].type` (`'compare'` expected) and `frames[3].type` (`'swap'` expected) both fail.

- [ ] **Step 3: Implement**

In `client/src/utils/traceAdapters/stackQueueAdapter.js`, replace the `adaptStackQueueTrace` frame-building loop:

```js
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
```

with:

```js
  const frames = [];
  let prevLength = null;
  trace.forEach((record) => {
    const value = record.locals ? record.locals[varName] : undefined;
    if (!Array.isArray(value)) return;
    const activeIndex = value.length === 0 ? -1 : direction === 'stack' ? value.length - 1 : 0;
    // Matches StackQueuePage's own convention (see validParenthesesAlgo): a push/grow is
    // 'info', a pop/shrink is 'swap' (the "completing" action), an unchanged size (a
    // peek/comparison line) is 'compare'.
    let type = 'compare';
    if (prevLength === null || value.length > prevLength) type = 'info';
    else if (value.length < prevLength) type = 'swap';
    frames.push({
      data: { values: value, activeIndex, direction },
      states: {},
      log: `Line ${record.line}: ${varName} = [${value.join(', ')}]`,
      type,
    });
    prevLength = value.length;
  });
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/utils/traceAdapters/__tests__/stackQueueAdapter.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add client/src/utils/traceAdapters/stackQueueAdapter.js client/src/utils/traceAdapters/__tests__/stackQueueAdapter.test.js
git commit -m "fix: distinguish grow/shrink/unchanged frame types in stack-queue adapter, matching StackQueuePage's own push/pop/peek audio convention"
```

---

### Task 13: DP adapter — `'info'` on init, `'swap'` when the active cell changes, `'compare'` otherwise

**Files:**
- Modify: `client/src/utils/traceAdapters/dpAdapter.js`
- Test: `client/src/utils/traceAdapters/__tests__/dpAdapter.test.js`

- [ ] **Step 1: Write the failing test**

Add to `client/src/utils/traceAdapters/__tests__/dpAdapter.test.js` (check its existing import/describe style first):

```js
  it('tags the first frame info, a changed-active-cell frame swap, and an unchanged-active-cell frame compare (1-D)', () => {
    const trace = [
      { line: 1, locals: { dp: [0, 1], i: 1 }, callDepth: 0, event: 'step' },       // first frame -> info
      { line: 2, locals: { dp: [0, 1, 1], i: 2 }, callDepth: 0, event: 'step' },     // dp[2] is new (0 -> 1) -> swap
      { line: 3, locals: { dp: [0, 1, 1], i: 2 }, callDepth: 0, event: 'step' },     // dp[2] unchanged (1 -> 1) -> compare
      { line: 4, locals: { dp: [0, 1, 1, 2], i: 3 }, callDepth: 0, event: 'step' },  // last frame -> forced done
    ];
    const frames = adaptDpTrace(trace);
    expect(frames[0].type).toBe('info');
    expect(frames[1].type).toBe('swap');
    expect(frames[2].type).toBe('compare');
    expect(frames[3].type).toBe('done');
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/utils/traceAdapters/__tests__/dpAdapter.test.js`
Expected: FAIL — `frames[1].type` and `frames[2].type` are both currently `'info'`.

- [ ] **Step 3: Implement**

In `client/src/utils/traceAdapters/dpAdapter.js`, replace the `adaptDpTrace` frame-building loop:

```js
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
```

with:

```js
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/utils/traceAdapters/__tests__/dpAdapter.test.js`
Expected: PASS — all tests in the file, including the new one. Double-check no pre-existing test asserted `type: 'info'` unconditionally on a non-first frame (grep the test file for `.type).toBe('info')` before running); if one exists and now legitimately expects `'compare'`/`'swap'` instead per the new rule, update its expectation rather than reverting the fix.

- [ ] **Step 5: Commit**

```bash
git add client/src/utils/traceAdapters/dpAdapter.js client/src/utils/traceAdapters/__tests__/dpAdapter.test.js
git commit -m "fix: distinguish swap (active cell changed) from compare (unchanged) in DP adapter frame types, matching DPPage's own knapsack/LCS audio convention"
```

---

## Phase 4 — Final verification

### Task 14: Full automated suite + manual browser verification across all 8 categories

**Files:** none created/modified — this task only runs and observes.

- [ ] **Step 1: Full automated test suite**

Run: `npx vitest run`
Expected: PASS, 0 failures. (As of the start of this plan, the suite was at 148 passing tests across 32 files; expect roughly 148 + ~20 new tests from this plan, all passing.)

- [ ] **Step 2: Lint**

Run: `npx eslint .` (from `client/`)
Expected: no errors. Fix any unused-import or unused-variable warnings introduced by the extraction tasks (e.g. a dedicated page no longer using a variable that was only read by the deleted inline component) before proceeding.

- [ ] **Step 3: Start the dev server**

Run: `npm run dev` (from `client/`, in the background) and wait for `Local: http://localhost:5173/` (or whichever port it lands on if 5173 is occupied) in its output.

- [ ] **Step 4: Manual pass over the five extracted dedicated pages**

Using a real browser (Playwright via a throwaway script is the established pattern for this project this session — see the earlier test battery in this conversation for the exact `chromium.launch` + `page.goto` + screenshot approach), visit each of these and confirm it still looks and behaves exactly as before the extraction (no regressions — there is no automated test coverage for these pages, so this is the only safety net):
- `/searching/linear-search` — Start, confirm cubes animate with pointer arrow and target label, notfound styling on a target that isn't in the array.
- `/stack-queue/stack` and `/stack-queue/queue` — push/pop several values, confirm chip column/row and TOP/FRONT label look right.
- `/linked-list/reverse` and `/linked-list/merge-sorted` — Start, confirm node boxes/arrows/active-visited styling and the 3-lane merge view all look right.
- `/tree/inorder` — Start, confirm the tree renders with the same proportions as before (circles connected by lines, active node highlighted, visited-order pill strip below).
- `/dp/fibonacci`, `/dp/knapsack`, `/dp/lcs` — Start each, confirm chip row / table / LCS headers all render correctly.

- [ ] **Step 5: Manual pass over Visualize My Code — one snippet per category**

Navigate to `/visualize-my-code` and, for each snippet below, paste it, click "Detect & Visualize", confirm (a) no dropdown appears, (b) the correct category is auto-detected, (c) the visualization looks like the matching dedicated page's style, (d) click through a few "Next" steps and confirm sound plays (check the browser's mute icon / OS volume — this is the one thing a screenshot can't verify, so listen manually or use `page.evaluate` to spy on `AudioContext` calls if running headless):

```js
// Sorting — the exact merge-sort snippet that originally motivated this whole plan
function merge(left, right) {
  let result = [];
  while (left.length && right.length) {
    if (left[0] < right[0]) result.push(left.shift());
    else result.push(right.shift());
  }
  return result.concat(left, right);
}
function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  return merge(mergeSort(arr.slice(0, mid)), mergeSort(arr.slice(mid)));
}
mergeSort([38, 27, 43, 3, 9, 82, 10]);
```
Confirm: the cube array shown throughout is the full 7-element array (not a 1-element fragment), and it visibly progresses toward sorted order across frames (per the design spec's disclosed limitation, it does not need to show every sub-merge in full choreography — but it must not be a meaningless fragment).

```js
// Graph — array-of-arrays adjacency list
function bfs(graph, start) {
  const visited = new Array(graph.length).fill(false);
  const queue = [start];
  visited[start] = true;
  const order = [];
  while (queue.length > 0) {
    const node = queue.shift();
    order.push(node);
    for (const neighbor of graph[node]) {
      if (!visited[neighbor]) { visited[neighbor] = true; queue.push(neighbor); }
    }
  }
  return order;
}
bfs([[1, 2], [0, 3], [0, 3], [1, 2, 4], [3]], 0);
```

Also spot-check one snippet each for Recursion (plain factorial), Linked List (reverse), Stack/Queue (valid parentheses), Tree (inorder traversal), and DP (1-D Fibonacci or 2-D LCS) — reuse the exact snippets from this session's original bug-hunt battery if available, or write equivalents analogous to the dedicated pages' own algorithms.

- [ ] **Step 6: Stop the dev server**

Kill the background `npm run dev` process.

- [ ] **Step 7: Report findings**

If Step 5 surfaces anything that looks wrong (e.g. the merge-sort animation still doesn't look reasonable, or a specific dedicated page regressed visually), do not silently patch around it — stop and report exactly what was observed, referencing the specific task above whose code is implicated, so a human can decide whether it's an acceptable known limitation (per the design spec §8) or a real bug needing a follow-up task.

---

## Self-review notes (for the plan author, not a task)

- **Spec coverage:** §3 (sorting array-variable fix) → Task 2. §4 (5 extractions) → Tasks 3-7. §5 (audio typing, all 6 remaining adapters) → Tasks 8-13. §6 (dropdown removal) → Task 1. §7 (testing approach: adapter unit tests, component render tests, manual browser pass) → present in every task + Task 14. §8 (known limitations) → called out inline in Task 2 and Task 14 rather than silently "fixed."
- **Type consistency:** `DpTableViz`'s `active` prop (number for dim=1, `[row,col]` for dim=2) is used identically in Task 7 (DPPage — passes `fibActive`/`coinActive` numbers and `knapActiveCell`/`lcsActiveCell` pairs, which is exactly DPPage's own pre-existing state shape, zero conversion) and in the `DPGridViz.jsx` wrapper (derives the same shapes from `frame.states`). `TreeSvg`'s flat `{id,label,depth}` node shape matches `treeAdapter.js`'s existing output exactly, and `TreePage.jsx`'s new `treeToFlat` helper produces the same shape via the same id-path convention (`root`, `rootL`, `rootR`, ...) already established in `treeAdapter.js`.
