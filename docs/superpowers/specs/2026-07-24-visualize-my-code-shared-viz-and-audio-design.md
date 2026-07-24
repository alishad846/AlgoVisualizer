# Visualize My Code — Shared Visual Components, Adapter Correctness & Audio Fidelity — Design Spec

## 1. Context

The original "Visualize My Code" feature (spec: `2026-07-13-visualize-my-code-design.md`, plan: `2026-07-13-visualize-my-code.md`, 26 tasks) and its follow-up category-parity pass (spec: `2026-07-13-visualize-my-code-category-parity-design.md`) are both complete — every category (sorting, searching, recursion, linked-list, stack-queue, tree, graph, dp) has a working trace adapter and a purpose-built visualizer component, wired through `VisualizerRouter`.

Real user testing against that shipped feature (this session) found it still falls short in three concrete ways:

1. **Wrong visualization for non-trivial code.** Pasting a real merge sort renders a single, meaningless one-element bar instead of the array being sorted (see §3).
2. **Audio doesn't feel synced.** Most categories emit `type: 'info'` (silent) on nearly every frame, so the user hears one chime at the end and nothing else — it doesn't feel like the dedicated pages' running tick/swap/chime feedback.
3. **A category-override dropdown appears even though detection is meant to be automatic**, which reads as the feature not trusting its own detection.

This spec covers fixing all three. It also **revises one architectural decision** from the July-13 category-parity spec: that spec deliberately kept the custom-code visualizers as separate, hand-rebuilt-to-look-similar components ("generic ceiling... not a copy," §4.4/§4.5/§4.6/§4.8 "Dropped" notes). Per this session's user direction, five of those eight categories get upgraded from *visually similar* to *literally the same component*, extracted out of the dedicated pages so both consumers import one implementation and can never drift apart again.

## 2. Non-goals (carried forward from the July-13 spec, still true)

- **Recursion** and **Graph** still cannot reuse their dedicated pages' visuals. `RecursionPage` only renders algorithm-specific views (Tower of Hanoi pegs, N-Queens board, maze path, subset tree) with no generic "arbitrary recursive call" view to extract. `GraphPage` only renders an 8×12 walled grid (BFS/DFS/Dijkstra) or a hardcoded 6-node course-prerequisite DAG (topological sort) — neither is a generic node/edge renderer. These two categories keep their existing purpose-built components (`CallStackViz`, `GraphTraceViz`); only their color/timing/audio conventions are aligned to match the rest of the app (§5).
- ML category detection quality is unchanged — this spec doesn't retrain or touch `algoDetectorModel.json` beyond the `dp`→`recursion` fallback already shipped this session (see §6).
- Bespoke sub-algorithm visuals (parentheses char-chips, next-greater dual-row, 3-lane linked-list merge, LCS string-axis headers) remain out of scope, same reasoning as the July-13 spec: they require knowing the *specific* algorithm, which the classifier never provides.

## 3. Sorting adapter: array-variable selection is wrong for non-in-place sorts

`sortingSearchingAdapter.js`'s `pickArrayVarName` picks whichever array-of-primitives local *name* appears in the most trace records. This works for in-place sorts (bubble/selection/insertion — one array, mutated throughout) but breaks for divide-and-conquer sorts: a merge sort's `merge(left, right)` helper is called many times, so `left`/`right`/`result` (small fragments) outnumber the top-level `arr` parameter, and the adapter animates a fragment instead of the array being sorted.

**Fix:** prefer the array bound to the *shallowest call-depth* (outermost/entry-point) frame where an array-of-primitives local first appears, using each trace record's existing `callDepth` field, falling back to the current "most frequent name" heuristic only when depth data doesn't disambiguate (e.g. depth ties). This fixes the common case (top-level call site holds the full array at the shallowest depth) without needing to fully solve non-in-place-sort animation in general.

**Disclosed limitation:** even with this fix, a true divide-and-conquer sort doesn't mutate one array in place, so the animation will track the top-level array's value at each *traced line touching it* (its initial state, and its final `return`), not a blow-by-blow of every sub-merge the way the dedicated Sorting page's hand-written `mergeSortSteps` generator does. That generator is bespoke, non-generic step-by-step choreography — reproducing it from an arbitrary trace is a different, larger problem than this spec's array-selection fix. This gap gets called out in the UI copy only if it turns out to look broken after the fix (verify in testing, §7); the fix here is expected to at least show a real, complete, monotonically-more-sorted array rather than a random fragment.

## 4. Shared component extraction

| Category | Dedicated-page component today | Action |
|---|---|---|
| Sorting | `CubeVisualizer` (already shared) | No extraction needed — already correct architecture. Only §3's adapter fix applies. |
| Searching | Inline pointer+cubes JSX in `SearchingPage.jsx` | Extract to `components/visualize-shared/SearchArrayViz.jsx`. `SearchingPage` and the custom-code `VisualizerRouter`'s `'searching'` case both import it. |
| Linked List | Inline `LinkedListViz` function in `LinkedListPage.jsx` (nodes/activeIdx/visitedSet/color props) | Extract to `components/visualize-shared/LinkedListChainViz.jsx`. Custom-code's existing `components/visualize/LinkedListViz.jsx` (trace-frame-shaped wrapper) calls it instead of rendering its own boxes. |
| Tree | Inline recursive `TreeNode` SVG function in `TreePage.jsx` | Extract to `components/visualize-shared/TreeSvg.jsx`. Both pages' tree adapters already produce a plain node/edge/active-set shape close enough to this component's props (adapt at the call site, not inside the shared component). |
| DP | Inline 1-D chip-row / 2-D table JSX in `DPPage.jsx` (three near-identical copies for fib/coin/knapsack/lcs) | Extract to `components/visualize-shared/DpTableViz.jsx` taking `{dim, values \| grid, active}`. This also de-duplicates `DPPage`'s own three copy-pasted blocks — a real cleanup, not scope creep, since they're one component's worth of variation. |
| Stack/Queue | Inline vertical/horizontal chip-column JSX in `StackQueuePage.jsx` (the plain push/pop view, not the parens/NGE-specific blocks) | Extract to `components/visualize-shared/StackQueueChipsViz.jsx`. |

Each extraction is **pure lift-and-adapt**: move the JSX into the new shared file as a props-driven component, replace the dedicated page's inline render with an import, and pass the same values it already computes — no behavior change to the dedicated page. Each gets a render-test snapshot-equivalent check (existing props in, same DOM shape out) before wiring the second consumer, so a regression in an already-shipped, working page is caught immediately rather than discovered by the user.

`components/visualize/*.jsx` (the trace-frame-shaped adapters-to-props layer, e.g. `LinkedListViz.jsx`, `DPGridViz.jsx`) are **kept**, not deleted — they become thin: unwrap `frame.data`/`frame.states` into the shared component's props and render it. This keeps `VisualizerRouter`'s existing per-category switch and all existing adapter-layer tests intact.

## 5. Audio fidelity: every adapter must assign real per-frame types

`StepLog.jsx` already plays a sound (`playAudioFeedback(type, text)`) on every new step for *both* the dedicated pages and `VisualizeMyCodePage` — this plumbing needs no changes. The problem is upstream: several adapters currently tag nearly every frame `type: 'info'` (silent), only setting `'done'` on the last frame. Each adapter needs to assign `'compare'` / `'swap'` / `'done'` based on the real semantic event on that frame, mirroring what the equivalent dedicated page's hand-written step generator already does for the same operation:

- **Recursion:** `'compare'` on a `'call'`-event frame (entering a function — a soft tick), `'swap'` on a `'return'`-event frame at depth > 0 (a nested call unwinding), `'done'` on the final `'return'`-event frame at depth 0 (the outermost call completing). This is a direct mapping off the `event`/`callDepth` fields the recursion adapter already threads through per frame — no new detection heuristic.
- **Linked List:** `'compare'` when the active pointer advances (`node = node.next`), `'swap'` when a `.next` link is rewritten (the mutating case, e.g. list reversal), `'done'` on the last frame.
- **Tree:** `'compare'` when a new node becomes active (matches `TreePage`'s own `type: "compare"` for "Visiting node"), `'done'` on the last frame.
- **Graph:** `'compare'` when visiting a node, `'swap'` when marking previously-unvisited neighbors visited (matches `GraphPage`'s own `'compare'`/`'swap'` split for grid BFS/DFS), `'done'` on the last frame.
- **Stack/Queue:** `'swap'` on a push/pop-equivalent line (size changes), `'compare'` on a peek/comparison line (size unchanged, top/front read), `'done'` on the last frame.
- **DP:** `'swap'` when the active cell's value actually changes, `'compare'` when a line touches the table without changing the active cell's value (matches `DPPage`'s own `'swap'`-on-update/`'compare'`-on-skip split for knapsack), `'done'` on the last frame.

Sorting/Searching already do this correctly (verified this session) and need no change here.

## 6. Remove the manual category dropdown

`VisualizeMyCodePage.jsx` drops the `<select>` (category override) and its `manualCategory` state entirely. `category` becomes simply `detection.category` — always what `detectAlgorithm` returned, no user override. The `detected.category` display line stays (it's informative, not a control).

(Unrelated to the dropdown, but already shipped this session as a bug fix found during testing: `detectAlgorithm` now falls back `dp` → `recursion` when the code has no array-table assignment, since the DP visualizer has nothing to render for plain unmemoized recursion like `factorial`/`fib`. No further change needed here.)

## 7. Testing approach

- **Adapter changes** (§3, §5): Vitest unit tests over hand-built trace fixtures, same style as existing `traceAdapters/__tests__/*.test.js`. The sorting call-depth fix gets a regression test reproducing the merge-sort fragment bug (multiple array-of-primitives locals at different call depths; assert the shallowest-depth one wins). Each category's new type-assignment logic gets a test per new type transition (e.g. tree: assert `'compare'` on an active-node-change frame).
- **Shared component extractions** (§4): for each dedicated page, a render test asserting identical output before/after extraction (same props in, same DOM out) — run *before* wiring the second consumer, so any regression in an already-working page is caught in isolation. Then a render test for the custom-code adapter-to-props wrapper feeding the shared component a trace-derived frame.
- **Manual real-browser verification** (required before this lands, same Playwright-driven approach used throughout this session and the original plan's Task 24): re-run the representative snippet per category, this time watching for (a) visual shape matching the dedicated page's feel, (b) audible tick/swap/chime sounds firing at the right moments, not just at the end, (c) no dropdown visible. Specifically re-test the merge-sort snippet from this session's bug report as the sorting case, since it's the one that motivated §3.

## 8. Known limitations (disclosed, not hidden)

- Non-in-place sorts (merge/quick/heap) will show the array's state at each traced line touching the top-level array, not a full recursive-merge choreography — see §3's disclosed limitation.
- Recursion and Graph remain their own generic components, not extracted from dedicated pages, for the structural reasons in §2 — carried forward from the July-13 spec, still true.
- The per-frame audio type assignments in §5 are heuristics tied to each adapter's existing detection (active pointer, active cell, etc.); on unusual code where that detection already degrades gracefully (per the July-13 spec's established pattern), the audio degrades with it — this is consistent with existing behavior, not a new risk.
