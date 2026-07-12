# Resume Point — Visualize My Code Implementation

**Paused:** 2026-07-13, by explicit user request, right after Task 17 completed cleanly.

## How to resume

Tell Claude: *"Continue the Visualize My Code plan using subagent-driven development, resuming at Task 18. Read `docs/superpowers/plans/2026-07-13-visualize-my-code-RESUME.md` first."*

Claude should then:
1. Invoke the `superpowers:subagent-driven-development` skill.
2. Confirm current branch is `Visualization` and `git log --oneline -1` shows `3de5ad4` (or later) as HEAD.
3. Re-create the 26-task todo list from `docs/superpowers/plans/2026-07-13-visualize-my-code.md` (Tasks 1-17 = completed, Task 18 = next) — the harness's own TaskList from this session will not carry over to a new session, so it needs to be rebuilt from this document.
4. Resume the per-task loop (dispatch implementer → review → fix loop → mark complete → next) starting at **Task 18**.

Note: `.superpowers/sdd/` (progress ledger, task briefs, task reports, review diffs) is **gitignored** — it will NOT exist in a fresh clone or a different machine. This document is the durable, committed substitute. If `.superpowers/sdd/progress.md` happens to still be present locally, it has richer blow-by-blow detail than this summary and can be read for extra context, but do not depend on it existing.

## State

- **Branch:** `Visualization` (created off `develop`, not yet merged/pushed anywhere).
- **HEAD commit:** `3de5ad414262949a1b53135cf65852ae38712379` — `fix: use real tracked depth for tree node positioning instead of inferring from id string length`.
- **Design spec:** `docs/superpowers/specs/2026-07-13-visualize-my-code-design.md` (approved).
- **Implementation plan:** `docs/superpowers/plans/2026-07-13-visualize-my-code.md` (26 tasks, approved, being executed via subagent-driven-development).
- **Working tree:** clean, nothing uncommitted.
- **Tasks 1-17: DONE and reviewed clean** (see full commit-by-commit history below). **Tasks 18-26: NOT STARTED.**

## What's built so far (Tasks 1-17)

- **Phase 0-1 (ML detection):** Vitest set up; language-agnostic tokenizer; TF-IDF Naive Bayes train/predict; training corpus (seeded from `codeSnippets.js` + hand-written supplemental samples); offline-trained model artifact at `client/src/data/algoDetectorModel.json` (94.4% held-out accuracy); runtime `detectAlgorithm(code)` API at `client/src/utils/algoDetector.js`.
- **Phase 2 (JS tracer):** Acorn-based statement instrumenter (`client/src/utils/tracer/jsInstrument.js`) that injects real trace calls into arbitrary JS; trace harness with step/time budget + deep-clone anti-aliasing (`client/src/utils/tracer/traceHarness.js`); sandboxed Web Worker + main-thread wrapper (`jsWorker.js` / `runJsTrace.js`).
- **Phase 3 (Python tracer):** Pyodide-based worker using real `sys.settrace` (`client/src/utils/tracer/pyodideWorker.js` / `runPyTrace.js`).
- **Phase 4 (Trace adapters, ALL DONE):** `capTrace`, and adapters for sorting/searching, recursion, linked-list, stack/queue, tree, graph, DP, plus the always-succeeding `variableInspectorAdapter` fallback, all wired through `client/src/utils/traceAdapters/index.js`'s `adaptTrace(category, trace)` dispatcher.
- **Phase 5 (Visualizer components, IN PROGRESS):** `CallStackViz`, `LinkedListViz`, `StackQueueViz`, `TreeViz`, `GraphTraceViz` are done (Tasks 16-17). **Still needed: Task 18** (`DPGridViz`, `VariableInspectorViz`, `VisualizerRouter`).

## What's left (Tasks 18-26, per the plan file)

18. DPGridViz, VariableInspectorViz, VisualizerRouter (finishes Phase 5)
19. Language detection heuristic (`detectLanguage.js`) + `CodeEditorPanel.jsx`
20. `VisualizeMyCodePage.jsx` — the main page wiring everything together
21. Sidebar entry ("Visualize My Code" link)
22. Route wiring (`/visualize-my-code` in `App.jsx`)
23. Full automated test suite + lint pass
24. Manual end-to-end verification (JS + Python + unsupported-language + fallback + bundle-isolation checks in a real browser)
25. Build + lint baseline for the **existing** site (separate QA pass, per the original two-part user request)
26. Manual click-through of every existing page, fixing anything clearly broken

## Important things a fresh session needs to know before continuing

These were real bugs found and fixed during Tasks 1-17 — the fixes are already committed and working, but the **reasoning** matters if similar patterns show up again in Tasks 18-26:

1. **Object.prototype collision (fixed, Task 3/5):** never use bare `{}` as a hash map keyed by arbitrary tokens/strings from user code — a key literally named `"constructor"` (very common in real class-based code) silently corrupts lookups. Use `Object.create(null)` for any object keyed by untrusted/arbitrary strings. This bug briefly made the whole ML classifier degenerate (predicted `stack-queue` for almost everything) before it was caught and fixed.

2. **Trace aliasing / must-clone contract (fixed, Task 7/8):** `jsInstrument.js`'s generated code calls `__trace(line, locals)` with LIVE references to running variables (arrays/objects are not copied by the instrumented code itself). Whatever function receives `__trace` MUST deep-clone `locals` before storing it (`traceHarness.js` does this via `JSON.parse(JSON.stringify(...))`), or every stored trace record sharing a mutated array converges to its final value — completely breaking step-by-step sorting-algorithm visualization. This is documented directly in a comment in `jsInstrument.js` above `instrumentJsCode`. **If Task 20's page or any later code ever bypasses `traceHarness.js` and wires `__trace` some other way, it must clone.**

3. **Last-statement-in-a-block trace visibility (fixed, Task 7):** a naive per-statement tracer only shows a statement's effect in the trace call for the NEXT statement — so a block's last statement (e.g. a swap as the only line of an `if` block, the exact shape every sorting algorithm here uses) was invisible until a general trailing-trace-per-block fix was added.

4. **Depth-guard pattern for recursive/chain-walking code (established, Task 13/14):** both `linkedListAdapter.js` (`chainToValues`, cap 1000 iterations) and `treeAdapter.js` (`treeToNodesEdges`, cap depth 1000) guard against unbounded traversal on malformed/self-referential traced data (a buggy user algorithm could produce a node that's its own child). If Task 18+ adds any other adapter/component that walks a data structure recursively based on trace content, apply the same defensive pattern.

5. **Don't infer structural properties from string IDs (fixed, Task 17):** `TreeViz.jsx` originally inferred a node's depth from its id string's length, which broke for n-ary (`children`-array) trees with 10+ siblings. Fixed by having `treeAdapter.js` attach the real tracked `depth` directly to each node object instead. General lesson: when an adapter already tracks a real value during traversal, thread it through explicitly rather than having the consumer re-derive it heuristically.

## Minor items logged for the final whole-branch review (not blocking, but should be triaged then)

- `codeTokenizer.js` doesn't handle Python triple-quoted strings (tokenizes as 3 separate `__STR__` tokens) — low impact on classification.
- `naiveBayesPredict.js:12` uses `idf[token] || 1` instead of `?? 1` — dormant falsy-zero footgun, not currently reachable.
- `task-5-report.md`'s bubble-sort real-world check was reported as prose, not captured command output (documentation rigor only).
- Arrow function bodies are never instrumented by `jsInstrument.js` (only `function`/`FunctionExpression`) — real gap if pasted code uses arrow functions with block bodies. Also `try/catch` and `switch/case` bodies are never instrumented.
- `jsWorker.js`/`pyodideWorker.js` have no automated tests by design (Worker/WASM/network can't run in Vitest) — covered by manual verification in Task 24 instead.

## Process notes for continuing

- This is being executed via **superpowers:subagent-driven-development**: fresh implementer subagent per task → review subagent (spec + quality) → fix loop if needed → mark complete → next task. Follow that skill's process exactly; it's already loaded once per session via the Skill tool.
- Use `scripts/task-brief` and `scripts/review-package` (from the `subagent-driven-development` skill's directory) exactly as used throughout Tasks 1-17 — see this session's actual tool calls in conversation history if available, or just follow the skill's own documented usage.
- Several review rounds in Tasks 1-17 found real bugs in the PLAN's own reference code (not implementer mistakes) — when that happens again, verify the finding independently (don't just trust either the implementer or the reviewer), decide the right fix, dispatch it as a small follow-up fix, and get it re-reviewed before moving on. Don't skip fixes just because "the plan said so" — the plan's authorship doesn't grade its own work.
- Keep using the ledger pattern (`.superpowers/sdd/progress.md`, even though gitignored — it's still useful within a single session) plus periodic updates to a durable resume doc like this one if the session might be interrupted again.

## After Task 26

Per the `subagent-driven-development` skill: dispatch a final whole-branch code-reviewer (most capable model) over the full `develop..Visualization` diff, using `scripts/review-package` with `MERGE_BASE=$(git merge-base develop HEAD)` and `HEAD`. Triage any findings (especially the "Minor items" list above). Then use **superpowers:finishing-a-development-branch** to decide how to land the branch (the user will want to review before any merge/push, per this project's earlier stated preferences).
