# Visualize My Code — Design Spec

Date: 2026-07-13
Branch: `Visualization`
Status: Approved by user, pending written-spec review

## 1. Problem & Goals

AlgoVisualizer currently ships ~40 hand-built algorithm visualizations, each driven by a
hand-written "step generator" function (e.g. `bubbleSortSteps()` in
`client/src/algorithms/sortingSteps.js`) that produces an array of animation frames. The
"source code" panel shown under each visualizer (`MultiLangCode.jsx`) is a **static reference
snippet** (`codeSnippets.js`) — it is not actually executed and is not what drives the
animation.

Goal: add a new top-level feature, **"Visualize My Code"**, where a user pastes their own
algorithm code and gets a smooth, accurate, frame-by-frame visualization of what that code
actually does — reusing the existing playback UI conventions (Start/Stop/Prev/Next/Speed/live
step log) so it feels native to the rest of the app.

Hard constraint from product owner: **no fake visualizations**. Whatever is animated must be
traceable back to real execution of the user's real code — an LLM "reasoning about" what code
probably does was explicitly rejected as untrustworthy, even though it would have been simpler
to build. Correctness of the trace is non-negotiable; breadth of language support is
negotiable.

Secondary goal (smaller, folded into the same branch): a general QA/stabilization pass over the
existing site — fix clearly-broken things found while testing, no new spec needed for that part.

## 2. Non-goals (v1)

- C, C++, Java support for real step-by-step tracing. There is no lightweight, trustworthy,
  in-browser way to execute these today without either a large WASM toolchain (e.g. a JVM in
  WASM) or a server-side execution sandbox (which reintroduces real arbitrary-code-execution
  security risk on our own infrastructure for a comparatively small payoff). The page will say
  plainly that full visualization currently supports JavaScript and Python, rather than doing a
  degraded job silently on other languages.
- Any backend code execution. Everything executes client-side.
- Any use of a third-party LLM (Gemini or otherwise) for generating trace data. Explicitly
  rejected — see Goals.

## 3. Architecture

```
[Visualize My Code page]
   user pastes code, no manual language picker required
        │
        ▼
[ML Detection Engine]  (client-side, offline-trained, instant)
   Multinomial Naive Bayes over TF-IDF of language-agnostic code tokens.
   Trained OFFLINE by a one-time script against a corpus seeded from the
   repo's existing codeSnippets.js (~40 algorithms x 5 languages), augmented
   with light synthetic variation (identifier renaming, comment/whitespace
   noise) to avoid pure memorization.
   Output: { category, algorithm, confidence }. User can override via a
   dropdown if detection is wrong.
        │
        ▼
[Language check]
   JS or Python  → continue to real tracing
   other/unknown → friendly "full visualization supports JS & Python right
                    now" message; user can still edit/retry
        │
        ▼
[Universal Tracer]  (100% client-side, sandboxed Web Worker)
   JavaScript: Acorn parses the code; a small AST transform inserts a trace
     call after every statement; executed in a Web Worker with a hard
     step-count + wall-clock budget.
   Python: executed via Pyodide (real CPython compiled to WASM) inside a
     Web Worker, using the standard library's sys.settrace for a genuine
     line-by-line trace with real variable snapshots. No code rewriting
     needed for Python.
   Both produce the SAME real, generic, line-level execution trace format:
     a list of { line, locals: {...}, callDepth, event } records straight
     from the real interpreter. Nothing here is category-specific or
     guessed — it's what actually happened.
        │
        ▼
[Trace Adapter]  (deterministic, per detected category)
   Looks at the real trace and the detected category to pick out which
   local variable(s) matter for rendering (e.g. "the array being mutated",
   "the visited set", "the .next-chained variable") and reshapes the trace
   into the app's existing frame schema: { data, states, log, type }.
   If no confident match is found, falls back to VariableInspectorViz
   (always correct — shows literally every real local variable changing
   over time). This adapter can NEVER fabricate a value; it only selects
   and reshapes real trace data, or falls back to the generic view.
        │
        ▼
[Visualizer Router] → renders the frames with the matching component
        │
        ▼
[Playback UI] → same Start/Stop/Prev/Next/Speed/live-step-count pattern as
   every existing algorithm page (frame array + frameIdx, useAlgoManager-
   style state).
```

## 4. ML Detection Engine

- **Training data**: seeded from `client/src/data/codeSnippets.js` (already-labeled by
  algorithm and language), augmented synthetically. Target corpus: low thousands of samples
  across 8 top-level categories (sorting, searching, recursion, linked-list, stack-queue, tree,
  graph, dp).
- **Model**: Multinomial Naive Bayes over TF-IDF of language-agnostic code tokens (keywords,
  identifiers, operators, literal shapes — comments/strings stripped before tokenizing so it
  generalizes across languages).
- **Training**: a one-time, offline Node script (`scripts/train-detector.js`), not run at
  request time. Produces a small JSON model artifact (vocabulary + per-class weights) checked
  into the repo, likely tens of KB.
- **Inference**: pure arithmetic over the JSON artifact at runtime — no ML runtime dependency,
  works offline, sub-millisecond.
- **Evaluation**: held out ~20% of the corpus to report real accuracy in the implementation
  PR/notes so the confidence score is meaningful, not decorative.
- **Scope boundary**: the model only ever produces a *label* (category + guessed specific
  algorithm + confidence). It has no involvement in generating trace/animation data — that
  comes exclusively from the Universal Tracer in section 3. This keeps "ML-powered" honest: it's
  real trained ML doing a real classification job, not standing in for execution.
- Low-confidence or wrong detections are recoverable: a manual override dropdown lets the user
  pick the correct category themselves, which just changes which Trace Adapter/visualizer is
  used — the underlying real trace doesn't change.

## 5. Visualizer components

| Category | Component | Trace signal used |
|---|---|---|
| Sorting / Searching | reuse `CubeVisualizer` | array variable being mutated + compared indices |
| Recursion | new `CallStackViz` | real call stack (function, args, depth) from the trace |
| Linked List | new `LinkedListViz` | `.next`-chained variable |
| Stack / Queue | new `StackQueueViz` | push/pop or enqueue/dequeue-shaped variable |
| Tree | new `TreeViz` | `.left`/`.right`/`.children`-shaped variable |
| Graph | new `GraphTraceViz` | adjacency structure + visited set |
| DP | new `DPGridViz` | 2D array/object indexed by two loop counters |
| *(fallback)* | `VariableInspectorViz` | every real local variable over time + current line — always available, never fails |

All new components are small, flat, CSS-box-based (consistent with the rest of the app's visual
language) — no heavy canvas/3D work, to keep animation smooth and cheap to render.

## 6. Page & sidebar UX

- Sidebar (`Sidebar.jsx`): new **"Visualize My Code"** entry added directly below the existing
  `NAV.map(...)` category list and above the Documentation/Support footer links — i.e. below all
  the existing visualization sections, as requested. Single page, no submenu.
- Route: `/visualize-my-code` → new `client/src/pages/visualize/VisualizeMyCodePage.jsx`.
- Flow: paste code (styled textarea + line-number gutter, no heavy third-party editor) →
  "Detect & Visualize" → detected category/algorithm badge with confidence, plus a manual
  override dropdown → same 3-column layout as every other algorithm page (explanation panel /
  visualizer / step log) → a collapsible **"Real execution trace"** panel showing the raw
  captured variable snapshots, as visible, inspectable proof the animation isn't faked.
- Error states are explicit and visible, never silently swallowed: syntax errors, execution
  timeout/infinite loop (caught by the step/time budget), unsupported language.

## 7. Security & performance

- No backend involvement in execution, at all. JS runs in a sandboxed Web Worker; Python runs in
  Pyodide inside a Web Worker. Our server is never asked to execute user-supplied code, so there
  is no server-side arbitrary-code-execution attack surface for this feature.
- Every run is bounded by a hard step-count and wall-clock budget; the worker is terminated
  cleanly on timeout, on Stop, or on navigating away.
- Collected trace length is capped (e.g. a few thousand frames) with a friendly "trace
  truncated, try a smaller input" notice rather than handing the UI an unbounded frame list.
- Pyodide (~6-10MB) and Acorn are loaded via dynamic `import()` only when this page is opened,
  and Pyodide specifically only when Python is the detected/selected language — the rest of the
  site's bundle and load time are unaffected.
- No user-pasted code is ever transmitted to a server or logged anywhere.

## 8. Existing-site QA pass

Independent of the new feature: a stabilization pass on the current `develop` baseline —
clean build + lint, click through every nav category and the auth flow, fix clearly-broken
issues (console errors, dead links, obvious UI bugs) as small, separate commits on the
`Visualization` branch. No separate design needed; tracked as implementation-plan tasks.

## 9. Open items carried into the implementation plan

- Exact token-augmentation strategy and corpus size for the classifier.
- Exact Acorn AST transform shape for JS statement-level tracing.
- Pyodide version/pinning and worker bootstrap approach.
- Per-category Trace Adapter heuristics (how each one identifies "the array" / "the visited
  set" / etc. from raw locals).
