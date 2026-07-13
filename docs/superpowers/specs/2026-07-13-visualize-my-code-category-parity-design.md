# Visualize My Code — Category Feature Parity — Design Spec

## 1. Problem & Goals

The "Visualize My Code" feature (shipped on the `Visualization` branch) currently renders pasted code with generic, thin visualizers: bare cubes, an unstyled function-call list, floating tree/graph nodes with no highlighting, a plain grid. Every dedicated algorithm page (`SortingPage`, `SearchingPage`, `RecursionPage`, `LinkedListPage`, `StackQueuePage`, `TreePage`, `GraphPage`, `DPPage`) is visually much richer — active-element highlighting, pointer/target indicators, completion banners, counters — because those pages are hand-built for known, specific algorithms with known data shapes.

**Goal:** bring "Visualize My Code" as close as possible to feeling like "one of the other algorithm pages, but for the user's own source code" — for every one of the 7 supported categories (sorting, searching, recursion, linked-list, stack-queue, tree, graph, dp). ML stays out of scope (see Non-goals).

**Constraint that shapes everything below:** the ML classifier only ever detects a *category* ("this looks like a graph algorithm"), never a *specific* algorithm ("this is Dijkstra"). Any feature on a dedicated page that depends on knowing the specific algorithm (Tower-of-Hanoi peg rendering, N-Queens board, a maze layout, LCS's string-axis headers, "this is a merge of two lists") cannot be reproduced for arbitrary pasted code, no matter how good the adapter is. The design below draws that line explicitly per category rather than pretending it doesn't exist.

## 2. Non-goals

- **ML category.** Not added. Continues falling back to `VariableInspectorViz`, which is the feature's existing, intentional safety net.
- **Bespoke per-sub-algorithm visuals** for recursion (Hanoi towers/N-Queens board/maze), stack-queue (parentheses char-chips, next-greater dual-row), linked-list (3-lane merge view), dp (string-axis headers). These require knowing which *specific* algorithm the user pasted, which the classifier cannot tell us. Where a dedicated page's richness comes from this kind of algorithm-specific knowledge, "Visualize My Code" gets the best **generic** equivalent instead (see per-category sections), not a copy.
- **Return-value display on recursion return frames.** The JS/Python tracers currently capture `locals` at trace-record time; neither tracer records "the value this call is about to return" as a distinct field today. Adding it would require a tracer-level change (Acorn instrumentation + the Python `sys.settrace` harness), which is out of scope for an adapter/visualizer-layer enhancement. Flagged as a future tracer enhancement, not attempted here.
- **Graph "grid maze" mode.** `GraphPage`'s BFS/DFS/Dijkstra views assume an 8×12 grid with wall cells — that's specific to how that page generates its demo data, not a property of graph algorithms in general. Arbitrary pasted graph code (adjacency list/matrix, no grid) gets a **node-link diagram** instead (see §5.7), which is the correct generic representation, not a lesser version of the grid.

## 3. Core technique: active-pointer detection

Today, only `sortingSearchingAdapter.js` marks any per-element state (`states[i] = 'swap'` via array-diffing). Every other adapter (`tree`, `linkedList`, `dp`, `graph`, `stackQueue`) extracts structure each frame but leaves `states: {}` empty — this is the single biggest reason the new visualizers look flat compared to the dedicated pages.

**New shared helper** (`client/src/utils/traceAdapters/activePointer.js`): given a trace and the name of the structural variable already being tracked (array/tree/list/grid var), scan each record's `locals` for scalar (`number` or short `string`) variables that:
1. Change value across at least 2 frames (a constant isn't a "pointer"), and
2. At least sometimes take a value that's a valid index/key into the structural variable's current shape.

Return the best-scoring candidate's name (ties broken by "closest declaration to the structural variable" is unnecessary — just take the first stable candidate by trace order, matching the existing `sortingSearchingAdapter`/`graphAdapter` candidate-selection style already in the codebase). Each adapter then marks that variable's current value as `states[pointerValue] = 'active'` (or the tree/graph/list-specific node-id equivalent) per frame.

This is a heuristic — on unusual code it may pick the wrong variable or find none. **Failure mode is silent degradation**: no active-highlight is shown (current behavior), never a wrong/misleading highlight. This matches the plan's existing "detection failure never blocks visualization" principle.

## 4. Per-category design

### 4.1 Sorting — low risk

- Adapter: no change needed beyond adopting the shared active-pointer helper for `'compare'`-vs-`'swap'` distinction (a frame where the pointer moved but the array didn't change → `type: 'compare'`; a frame where the array changed → `type: 'swap'`, as today).
- `VisualizeMyCodePage.jsx`: add a live "Swaps" counter (derived by counting `type === 'swap'` frames up to the current index — no new adapter field needed) and a "✓ Sorted in N steps · M swaps" banner once the last frame is reached, mirroring `SortingPage.jsx`'s completion banner.
- `CubeVisualizer` itself needs no change (already reused directly); the active-pointer state renders through the existing `states` prop.

### 4.2 Searching — medium risk

New adapter logic (extends `sortingSearchingAdapter.js`, which already serves both categories):
- **Target detection:** a scalar local that is present from the *first* frame and never changes for the entire trace (distinguishes it from the pointer, which must change). If none found, `target` is simply omitted from `frame.data` and the UI hides the target label (graceful degradation, not a guess).
- **Found detection:** the last trace record is a `'return'` event with a non-negative/non-null value, OR the pointer's final value satisfies `array[pointer] === target` in the last frame. If neither holds, treat as not-found (matches `SearchingPage`'s own "not found" styling).
- `SearchingViz` (new, replaces the bare `CubeVisualizer` call for the `'searching'` case in `VisualizerRouter`): cubes (reusing `CubeVisualizer`'s rendering, extended with a pointer-arrow row above it, matching `SearchingPage.jsx`'s layout) + target label below + Found/Not-found badge, all conditional on whether target/found were actually detected.

### 4.3 Recursion — low risk

- Adapter: no structural change. Apply the same call/return frames already produced; add depth (`stack.length` at push time) to each stack entry so the component can indent.
- `CallStackViz`: render each stack frame indented by `depth * 16px`, color the top (currently active) frame distinctly from frames below it (which are "waiting," analogous to `RecursionPage`'s active-vs-idle coloring), add a subtle push/pop transition (CSS, matching the `transition: all 0.4s ease` pattern already used in `HanoiViz`/`NQueens`).

### 4.4 Linked List — low risk

- Adapter: apply the shared active-pointer helper — the traced head/current-node variable itself (already being walked to build `data`) doubles as the "active" pointer; mark the node at that position `active` in `states`.
- `LinkedListViz`: add `active`/`visited` class support (mirroring `LLNode`'s existing CSS classes verbatim — no new styling vocabulary needed, just wiring the existing `.active`/`.visited` node-box classes through) and a trailing dashed "null" terminator box.
- **Dropped:** the 3-lane merge view (`MergeSortedViz`). Detecting "this traced code represents two lists merging into a third" from arbitrary locals isn't reliable — a single, richly-highlighted list view is the correct generic ceiling.

### 4.5 Stack / Queue — low risk

- Adapter: apply active-pointer for the top/front element (index `0` or `length-1` depending on push/pop direction inferred from length deltas — grew at the end → stack-like, LIFO; grew at index 0 → queue-like, FIFO). Infer stack-vs-queue purely from *behavior* (which end grows), not from the variable's name — more robust than the current `/stack|queue/i` name-only heuristic, and it's the same "diff vs. previous frame" technique `sortingSearchingAdapter` already uses. If the trace never shows more than one length change (so direction can't be inferred), default to the current vertical/stack-like layout — today's only layout — rather than guessing.
- `StackQueueViz`: vertical column for stack-like growth, horizontal row for queue-like growth (matching `StackQueuePage`'s layout switch), top/front label, brief highlight flash on the newly-pushed/popped element (CSS transition, same 400-600ms flash timing already used on the dedicated page), size readout.
- **Dropped:** parentheses char-chip view and next-greater dual-row view — both algorithm-specific, not inferable from arbitrary code. The enhanced generic stack/queue view (above) is the ceiling.

### 4.6 Tree — medium risk (includes a real bug fix)

- **Bug fix:** `treeAdapter.js` currently calls `treeToNodesEdges(node, 'root')` fresh every frame using *whatever the traced variable currently points to* as the root. During a recursive traversal (`node = node.left`), later frames' "tree" is actually just that subtree — the visualization would shrink instead of showing the whole tree with a moving position marker. Fix: capture the tree shape once from the **first** frame where the tracked variable is fully populated, and thereafter only update *which node is active* (matched by structural path, not object identity, since Python/JS may not preserve object identity through the trace's clone step) rather than re-deriving the shape from a shrinking pointer.
- Apply active-pointer to mark the current node's `path` as `active` in `states`.
- `TreeViz`: active-node fill/stroke color change (mirroring `TreePage`'s `--active-bg` treatment) + a visited-order pill strip below the tree (mirroring `TreePage`'s exactly, since it's pure UI, no new adapter data needed beyond an accumulated visited-list which the page can derive by scanning prior frames' active nodes).

### 4.7 Graph — high risk (the one genuinely new capability)

Today `graphAdapter.js` only looks for a `/visited/i`-named variable and never extracts edges — graphs currently render as floating unconnected nodes.

- **New structure detection:** scan `locals` for a variable shaped like an adjacency list (`{nodeId: [neighborIds...]}` or `Map`) or adjacency matrix (2-D array where `matrix[i][j]` is truthy/numeric). This is a **new, separate detection pass** from the existing visited-set detection — the two are found independently and combined.
- If no adjacency structure is found, degrade gracefully: keep today's node-only rendering (no edges) rather than guessing wrong ones. This is a real, disclosed limitation — flagged in §7.
- If found: extract a static edge list once (adjacency structures are normally not mutated during traversal) and pass `{nodes, edges}` every frame, with `states` still driven by the existing visited-set detection plus the new active-pointer helper for "currently visiting."
- `GraphTraceViz`: switch from the current fixed-circle layout to a force-directed-ish or simple layered layout that actually draws edges as lines (reuse the `TreeViz`/`treeAdapter` line-drawing approach — same SVG primitive, different layout math since graphs aren't trees). Node states: default / active / visited (three-way, up from today's two-way sorted/not).
- A small legend (Active / Visited / Unvisited swatches), mirroring `GraphPage`'s legend row.

### 4.8 DP — medium risk (includes a real bug fix)

- **Bug fix:** `dpAdapter.js`'s `is2DNumericArray` check requires every element to itself be an array — a 1-D DP array (Fibonacci: `dp = [0,1,1,2,3,5]`, Coin Change: same shape) fails this check entirely today and silently falls through to the generic variable inspector. Fix: also accept a 1-D numeric array, tagging the frame's `data` shape (`{dim: 1, values: [...]}` vs `{dim: 2, grid: [...]}`) so `DPGridViz` can render either a strip (matching `DPPage`'s Fibonacci/Coin-Change layout) or a table (matching Knapsack/LCS).
- Apply active-pointer for 1-D (single active index) and a 2-D variant (look for a *pair* of scalar locals that together index the grid, e.g. `i`/`j` or `i`/`w`) for the 2-D case.
- `DPGridViz`: value-based color coding (`val > 0` → a distinct color from `val === 0`, matching the green/purple treatment on the dedicated page — pick one consistent color rather than trying to guess which hue a specific algorithm "should" use, since that hue choice on the dedicated page is arbitrary per-algorithm styling, not signal), active-cell highlight, `Infinity` → `∞` formatting, "Press Start" empty state.
- **Dropped:** row/column axis-value headers (LCS's string-character headers). Requires knowing which two locals are "the two strings being compared," which isn't reliably inferable from arbitrary code — the enhanced grid (above) is the ceiling.

## 5. Audio

No new work needed. `StepLog` already auto-plays a sound keyed off each step's `type` (`info`/`compare`/`swap`/`done`), and `VisualizeMyCodePage` already renders `StepLog`. Once the adapters above assign `type` more precisely (distinguishing `compare` from `swap`, always setting `done` on the final frame — most already do), the existing audio system reflects that automatically. No changes to `sound.js` or `StepLog.jsx`.

## 6. Testing approach

Every adapter change gets Vitest unit tests feeding hand-built trace fixtures (same style as the existing `traceAdapters/__tests__/*.test.js` files) — no browser/worker needed, since adapters are pure functions over trace arrays. Visualizer component changes get `@testing-library/react` render tests (same style as existing `components/visualize/__tests__/*.test.jsx`) verifying the new active/highlight/banner states render given a crafted `frame`. The tree-adapter and dp-adapter bug fixes each get a regression test reproducing the original bug (shrinking-subtree-view for tree; 1-D array silently failing for dp) before the fix, per this project's established TDD pattern from the original 26-task plan.

Given the heuristic nature of target/found/adjacency-structure detection (§4.2, §4.7), each of those also gets a "detection fails gracefully" test: feed a trace where the heuristic legitimately can't find what it's looking for, assert the adapter doesn't crash and simply omits that piece of data rather than guessing.

Manual real-browser verification (the same Playwright-driven approach used for Tasks 24-26 of the original plan) is required before this lands, covering at minimum one representative real-world snippet per category (reusing the bubble-sort/binary-search examples already used in Task 24, plus one linked-list, one stack, one tree, one graph, and one DP example) to confirm the new visuals actually render correctly against genuine traced execution, not just adapter unit tests.

## 7. Known limitations (disclosed, not hidden)

- Target/found detection for searching, and adjacency-structure detection for graphs, are heuristics over variable shape and naming/behavior patterns — they will occasionally miss on unusual code (e.g., a search that doesn't store its target in a separate variable, or a graph represented in an unconventional shape). When they miss, the feature degrades to today's simpler rendering (no target label; nodes without edges) rather than showing something wrong.
- Recursion return values are not shown (tracer limitation, not adapter/visualizer — see Non-goals).
- Several dedicated-page features are intentionally not reproduced because they require knowing the *specific* algorithm, not just its category (see Non-goals) — this is a structural ceiling of the "detect category, trace real execution" architecture, not a shortfall in this enhancement's scope.

## 8. Open items carried into the implementation plan

- Exact scoring/tie-breaking rule for the shared active-pointer helper when multiple scalar candidates are found (the "first stable candidate by trace order" default in §3 should be validated against a few real multi-loop-variable snippets, e.g. binary search's `low`/`mid`/`high`, where `mid` is the one that should win).
- Exact SVG layout algorithm for the new graph node-link diagram (simple layered/BFS-depth layout vs. a lightweight force simulation) — a decision for the implementation plan, not this design doc.
