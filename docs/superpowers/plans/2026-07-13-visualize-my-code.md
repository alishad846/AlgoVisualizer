# Visualize My Code Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a user paste JavaScript or Python algorithm code into a new "Visualize My Code" page and see a real, frame-by-frame animation of what that exact code does, with the same Start/Stop/Prev/Next/Speed playback UX as every other page in the app.

**Architecture:** A trained Naive Bayes classifier (TF-IDF over language-agnostic code tokens) labels the pasted code's algorithm category. Real execution tracing — Acorn-instrumented JS in a sandboxed Web Worker, and Pyodide's `sys.settrace` for Python — produces a genuine line-by-line trace of the actual interpreter state (never simulated/guessed). A small deterministic "trace adapter" per category reshapes that real trace into the app's existing `{data, states, log, type}` frame format, falling back to a generic (always-correct) variable inspector when no category-specific shape is found. Everything runs client-side; there is no backend execution and no LLM anywhere in this pipeline.

**Tech Stack:** React 19 + Vite (existing), Vitest + @testing-library/react (new, for TDD), Acorn + astring (new, JS parsing/codegen for instrumentation), Pyodide loaded via CDN inside a Web Worker (new, Python execution — not an npm dependency).

## Global Constraints

- Full step-by-step visualization supports **JavaScript and Python only** in this version. Other languages get a clear, friendly message — never a degraded/fake animation.
- **No backend code execution and no LLM anywhere in this feature.** All detection and execution happens client-side.
- Every execution run is bounded by a hard step-count (3000 trace records) and wall-clock budget (4000ms inside the worker, 6000ms overall timeout on the main thread) — infinite loops must fail safely, not hang the tab.
- Pyodide and Acorn/astring must not affect the bundle size or load time of any other page — load them lazily, only when `/visualize-my-code` is opened (and Pyodide only when Python is actually used).
- No user-pasted code is ever sent to a server or logged anywhere.
- The ML classifier only ever produces a **label** (category + confidence). It must never generate or influence trace/animation data — that always comes from real execution.
- New sidebar entry "Visualize My Code" goes directly below the existing algorithm category list (`NAV.map(...)` in `Sidebar.jsx`) and above the Documentation/Support footer links.
- Reuse the existing playback UX pattern (Start/Stop/Prev/Next/Speed/live step count) and the existing 3-column layout (`viz-layout-3` / `viz-left` / `viz-center` / `viz-right` classes already used by `SortingPage.jsx` etc.) so the new page feels native.
- Detection failure or low confidence must never block visualization — the user can always override the category manually, and the `VariableInspectorViz` fallback must always succeed.

---

## Phase 0 — Test tooling

### Task 1: Add Vitest + Testing Library to the client

**Files:**
- Modify: `client/package.json`
- Modify: `client/vite.config.js`
- Create: `client/src/utils/__tests__/sanity.test.js`

**Interfaces:**
- Produces: `npm run test` (from `client/`) runs Vitest once; `npm run test:watch` runs it in watch mode. All later tasks' test steps use `npm run test -- <path>`.

- [ ] **Step 1: Install dependencies**

```bash
cd client
npm install --save-dev vitest jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 2: Add test scripts to `client/package.json`**

Add to the `"scripts"` block (keep existing `dev`/`build`/`lint`/`preview` entries):

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Configure Vitest in `client/vite.config.js`**

Replace the file contents with:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.js'],
  },
})
```

- [ ] **Step 4: Create the test setup file**

Create `client/src/test-setup.js`:

```js
import '@testing-library/jest-dom';
```

- [ ] **Step 5: Write a sanity test**

Create `client/src/utils/__tests__/sanity.test.js`:

```js
import { describe, it, expect } from 'vitest';

describe('vitest setup', () => {
  it('runs a basic assertion', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 6: Run it and verify it passes**

Run (from `client/`): `npm run test`
Expected: `sanity.test.js` passes, 1 test passed.

- [ ] **Step 7: Commit**

```bash
git add client/package.json client/package-lock.json client/vite.config.js client/src/test-setup.js client/src/utils/__tests__/sanity.test.js
git commit -m "test: add vitest + testing-library to client"
```

---

## Phase 1 — ML Detection Engine

### Task 2: Language-agnostic code tokenizer

**Files:**
- Create: `client/src/utils/codeTokenizer.js`
- Test: `client/src/utils/__tests__/codeTokenizer.test.js`

**Interfaces:**
- Produces: `tokenize(code: string) -> string[]` — used by both the offline training script and the runtime detector.

- [ ] **Step 1: Write the failing test**

Create `client/src/utils/__tests__/codeTokenizer.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { tokenize } from '../codeTokenizer.js';

describe('tokenize', () => {
  it('returns an empty array for empty input', () => {
    expect(tokenize('')).toEqual([]);
    expect(tokenize(null)).toEqual([]);
  });

  it('extracts identifiers and keywords', () => {
    const tokens = tokenize('function bubbleSort(arr) { return arr; }');
    expect(tokens).toContain('function');
    expect(tokens).toContain('bubbleSort');
    expect(tokens).toContain('arr');
    expect(tokens).toContain('return');
  });

  it('strips line comments and string contents', () => {
    const tokens = tokenize('let x = "hello world"; // a comment about arr\nlet y = 1;');
    expect(tokens).not.toContain('hello');
    expect(tokens).not.toContain('comment');
    expect(tokens).toContain('__STR__');
  });

  it('strips python-style comments', () => {
    const tokens = tokenize('# this mentions graph and visited\ndef f(): pass');
    expect(tokens).not.toContain('graph');
    expect(tokens).not.toContain('visited');
    expect(tokens).toContain('def');
  });

  it('captures multi-character operators as single tokens', () => {
    const tokens = tokenize('if (arr[j] <= arr[j+1]) { i++; }');
    expect(tokens).toContain('<=');
    expect(tokens).toContain('++');
  });

  it('normalizes numeric literals to a placeholder token', () => {
    const tokens = tokenize('let mid = (low + high) / 2;');
    expect(tokens).toContain('__NUM__');
    expect(tokens).not.toContain('2');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run (from `client/`): `npm run test -- src/utils/__tests__/codeTokenizer.test.js`
Expected: FAIL — `codeTokenizer.js` does not exist.

- [ ] **Step 3: Implement the tokenizer**

Create `client/src/utils/codeTokenizer.js`:

```js
const BLOCK_COMMENT = /\/\*[\s\S]*?\*\//g;
const STRING_OR_CHAR = /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g;
const LINE_COMMENT = /\/\/.*$|#.*$/gm;
const NUMBER = /\b\d+(\.\d+)?\b/g;

const MULTI_CHAR_OPERATORS = [
  '<=', '>=', '===', '!==', '==', '!=', '&&', '||', '->', '=>',
  '++', '--', '+=', '-=', '*=', '/=', '::',
];

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const OPERATOR_ALTERNATION = MULTI_CHAR_OPERATORS.map(escapeRegExp).join('|');
const TOKEN_PATTERN = new RegExp(
  `([A-Za-z_][A-Za-z0-9_]*)|(${OPERATOR_ALTERNATION})|([{}()\\[\\];,.<>+\\-*/%=!&|^~:])`,
  'g'
);

export function tokenize(code) {
  if (!code || typeof code !== 'string') return [];

  let stripped = code
    .replace(BLOCK_COMMENT, ' ')
    .replace(STRING_OR_CHAR, ' __STR__ ')
    .replace(LINE_COMMENT, ' ')
    .replace(NUMBER, ' __NUM__ ');

  const tokens = [];
  let match;
  TOKEN_PATTERN.lastIndex = 0;
  while ((match = TOKEN_PATTERN.exec(stripped)) !== null) {
    const token = match[1] || match[2] || match[3];
    if (token) tokens.push(token);
  }
  return tokens;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run (from `client/`): `npm run test -- src/utils/__tests__/codeTokenizer.test.js`
Expected: PASS, 6 tests passed.

- [ ] **Step 5: Commit**

```bash
git add client/src/utils/codeTokenizer.js client/src/utils/__tests__/codeTokenizer.test.js
git commit -m "feat: add language-agnostic code tokenizer"
```

---

### Task 3: Naive Bayes training + prediction

**Files:**
- Create: `client/tools/detector-training/naiveBayesTrain.js`
- Create: `client/src/utils/naiveBayesPredict.js`
- Test: `client/tools/detector-training/__tests__/naiveBayesTrain.test.js`

**Interfaces:**
- Consumes: `tokenize` from Task 2 (test only, not required by these modules directly).
- Produces: `trainNaiveBayes(docsTokens: string[][], labels: string[], opts?) -> { classes, priors, logProb, idf, vocab }` and `predictCategory(tokens: string[], model: { classes, priors, logProb, idf }) -> { category, confidence, scores }`. `model` is the exact shape produced by `trainNaiveBayes`, and is also the shape of the JSON artifact built in Task 5.

- [ ] **Step 1: Write the failing test**

Create `client/tools/detector-training/__tests__/naiveBayesTrain.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { trainNaiveBayes } from '../naiveBayesTrain.js';
import { predictCategory } from '../../../src/utils/naiveBayesPredict.js';

const SORTING_DOCS = [
  ['for', 'swap', 'arr', 'compare', 'sort'],
  ['bubble', 'swap', 'arr', 'j', 'compare'],
  ['quick', 'pivot', 'partition', 'swap', 'arr'],
];
const GRAPH_DOCS = [
  ['visited', 'queue', 'neighbor', 'graph', 'bfs'],
  ['visited', 'stack', 'dfs', 'neighbor', 'graph'],
  ['visited', 'adjacency', 'graph', 'queue', 'bfs'],
];

describe('trainNaiveBayes + predictCategory', () => {
  it('trains a model with priors, vocab and per-class log-probabilities', () => {
    const docs = [...SORTING_DOCS, ...GRAPH_DOCS];
    const labels = [
      'sorting', 'sorting', 'sorting',
      'graph', 'graph', 'graph',
    ];
    const model = trainNaiveBayes(docs, labels);

    expect(model.classes.sort()).toEqual(['graph', 'sorting']);
    expect(model.priors.sorting).toBeCloseTo(0.5, 5);
    expect(model.priors.graph).toBeCloseTo(0.5, 5);
    expect(model.logProb.sorting).toBeDefined();
    expect(model.logProb.graph).toBeDefined();
    expect(model.vocab.length).toBeGreaterThan(0);
  });

  it('predicts the correct category for a clear-cut example', () => {
    const docs = [...SORTING_DOCS, ...GRAPH_DOCS];
    const labels = [
      'sorting', 'sorting', 'sorting',
      'graph', 'graph', 'graph',
    ];
    const model = trainNaiveBayes(docs, labels);

    const sortingPrediction = predictCategory(['swap', 'arr', 'compare', 'pivot'], model);
    expect(sortingPrediction.category).toBe('sorting');
    expect(sortingPrediction.confidence).toBeGreaterThan(0.5);

    const graphPrediction = predictCategory(['visited', 'queue', 'graph', 'neighbor'], model);
    expect(graphPrediction.category).toBe('graph');
    expect(graphPrediction.confidence).toBeGreaterThan(0.5);
  });

  it('returns a valid probability distribution over all classes', () => {
    const docs = [...SORTING_DOCS, ...GRAPH_DOCS];
    const labels = ['sorting', 'sorting', 'sorting', 'graph', 'graph', 'graph'];
    const model = trainNaiveBayes(docs, labels);

    const { scores } = predictCategory(['arr', 'swap'], model);
    const sum = Object.values(scores).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1, 5);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run (from `client/`): `npm run test -- tools/detector-training/__tests__/naiveBayesTrain.test.js`
Expected: FAIL — neither module exists yet.

- [ ] **Step 3: Implement training**

Create `client/tools/detector-training/naiveBayesTrain.js`:

```js
export function trainNaiveBayes(docsTokens, labels, { alpha = 1, maxVocabSize = 800 } = {}) {
  const classes = [...new Set(labels)];
  const N = docsTokens.length;

  const df = {};
  docsTokens.forEach((tokens) => {
    new Set(tokens).forEach((t) => {
      df[t] = (df[t] || 0) + 1;
    });
  });

  const vocab = Object.keys(df)
    .sort((a, b) => df[b] - df[a])
    .slice(0, maxVocabSize);
  const vocabSet = new Set(vocab);

  const idf = {};
  vocab.forEach((t) => {
    idf[t] = Math.log(N / (1 + df[t])) + 1;
  });

  const priors = {};
  classes.forEach((cls) => {
    priors[cls] = labels.filter((l) => l === cls).length / N;
  });

  const termWeight = {};
  const totalWeight = {};
  classes.forEach((cls) => {
    termWeight[cls] = {};
    totalWeight[cls] = 0;
  });

  docsTokens.forEach((tokens, i) => {
    const cls = labels[i];
    const counts = {};
    tokens.forEach((t) => {
      if (!vocabSet.has(t)) return;
      counts[t] = (counts[t] || 0) + 1;
    });
    Object.entries(counts).forEach(([token, count]) => {
      const weight = count * idf[token];
      termWeight[cls][token] = (termWeight[cls][token] || 0) + weight;
      totalWeight[cls] += weight;
    });
  });

  const logProb = {};
  classes.forEach((cls) => {
    logProb[cls] = {};
    vocab.forEach((token) => {
      const w = termWeight[cls][token] || 0;
      logProb[cls][token] = Math.log((w + alpha) / (totalWeight[cls] + alpha * vocab.length));
    });
  });

  return { classes, priors, logProb, idf, vocab };
}
```

- [ ] **Step 4: Implement prediction**

Create `client/src/utils/naiveBayesPredict.js`:

```js
export function predictCategory(tokens, model) {
  const { classes, priors, logProb, idf } = model;

  const termFreq = {};
  tokens.forEach((t) => {
    termFreq[t] = (termFreq[t] || 0) + 1;
  });

  const scoresLog = {};
  classes.forEach((cls) => {
    let score = Math.log(priors[cls]);
    Object.entries(termFreq).forEach(([token, count]) => {
      const clsLogProb = logProb[cls][token];
      if (clsLogProb === undefined) return;
      const weight = count * (idf[token] || 1);
      score += weight * clsLogProb;
    });
    scoresLog[cls] = score;
  });

  const maxScore = Math.max(...Object.values(scoresLog));
  let sumExp = 0;
  const expScores = {};
  classes.forEach((cls) => {
    expScores[cls] = Math.exp(scoresLog[cls] - maxScore);
    sumExp += expScores[cls];
  });

  const scores = {};
  classes.forEach((cls) => {
    scores[cls] = expScores[cls] / sumExp;
  });

  const category = classes.reduce(
    (best, cls) => (scores[cls] > scores[best] ? cls : best),
    classes[0]
  );

  return { category, confidence: scores[category], scores };
}
```

- [ ] **Step 5: Run test to verify it passes**

Run (from `client/`): `npm run test -- tools/detector-training/__tests__/naiveBayesTrain.test.js`
Expected: PASS, 3 tests passed.

- [ ] **Step 6: Commit**

```bash
git add client/tools/detector-training/naiveBayesTrain.js client/src/utils/naiveBayesPredict.js client/tools/detector-training/__tests__/naiveBayesTrain.test.js
git commit -m "feat: implement TF-IDF weighted Naive Bayes train + predict"
```

---

### Task 4: Training corpus from existing code snippets + supplemental samples

**Files:**
- Create: `client/tools/detector-training/corpus.js`
- Test: `client/tools/detector-training/__tests__/corpus.test.js`

**Interfaces:**
- Consumes: `CODE_SNIPPETS` from `client/src/data/codeSnippets.js` (existing, keyed by algorithm slug, each value an object keyed by language: `C`, `CPlusPlus`, `Java`, `Python`, `JavaScript`).
- Produces: `buildCorpus() -> { texts: string[], labels: string[] }`, where every label is one of: `sorting`, `searching`, `recursion`, `linked-list`, `stack-queue`, `tree`, `graph`, `dp`.

**Context:** `codeSnippets.js` only covers 17 algorithm slugs, and has **zero** examples for `tree` and only one each for `recursion`/`dp`-adjacent code. This task adds a small set of real, hand-written supplemental snippets (JS + Python) for the underrepresented categories so every one of the 8 categories has multiple real training examples. This is a known, honest limitation — noted in the design spec's open items — not a placeholder.

- [ ] **Step 1: Write the failing test**

Create `client/tools/detector-training/__tests__/corpus.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { buildCorpus } from '../corpus.js';

const EXPECTED_CATEGORIES = [
  'sorting', 'searching', 'recursion', 'linked-list',
  'stack-queue', 'tree', 'graph', 'dp',
];

describe('buildCorpus', () => {
  it('produces parallel texts and labels arrays', () => {
    const { texts, labels } = buildCorpus();
    expect(texts.length).toBe(labels.length);
    expect(texts.length).toBeGreaterThan(50);
  });

  it('has at least 3 examples for every category', () => {
    const { labels } = buildCorpus();
    EXPECTED_CATEGORIES.forEach((cat) => {
      const count = labels.filter((l) => l === cat).length;
      expect(count, `category "${cat}" should have >= 3 examples`).toBeGreaterThanOrEqual(3);
    });
  });

  it('only produces known category labels', () => {
    const { labels } = buildCorpus();
    labels.forEach((l) => {
      expect(EXPECTED_CATEGORIES).toContain(l);
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run (from `client/`): `npm run test -- tools/detector-training/__tests__/corpus.test.js`
Expected: FAIL — `corpus.js` does not exist.

- [ ] **Step 3: Implement the corpus builder**

Create `client/tools/detector-training/corpus.js`:

```js
import { CODE_SNIPPETS } from '../../src/data/codeSnippets.js';

const SLUG_TO_CATEGORY = {
  'bubble-sort': 'sorting',
  'selection-sort': 'sorting',
  'insertion-sort': 'sorting',
  'merge-sort': 'sorting',
  'quick-sort': 'sorting',
  'linear-search': 'searching',
  'binary-search': 'searching',
  'stack': 'stack-queue',
  'queue': 'stack-queue',
  'valid-parentheses': 'stack-queue',
  'singly-linked-list': 'linked-list',
  'bfs': 'graph',
  'dfs': 'graph',
  'tower-of-hanoi': 'recursion',
  'fibonacci': 'dp',
};

const SUPPLEMENTAL_SAMPLES = [
  // tree
  { category: 'tree', text: `function inorder(node, out = []) {
  if (!node) return out;
  inorder(node.left, out);
  out.push(node.value);
  inorder(node.right, out);
  return out;
}` },
  { category: 'tree', text: `def inorder(node, out=None):
    if out is None:
        out = []
    if node is None:
        return out
    inorder(node.left, out)
    out.append(node.value)
    inorder(node.right, out)
    return out` },
  { category: 'tree', text: `function insertBST(root, value) {
  if (!root) return { value, left: null, right: null };
  if (value < root.value) root.left = insertBST(root.left, value);
  else root.right = insertBST(root.right, value);
  return root;
}` },
  { category: 'tree', text: `def level_order(root):
    if root is None:
        return []
    queue = [root]
    order = []
    while queue:
        node = queue.pop(0)
        order.append(node.value)
        if node.left:
            queue.append(node.left)
        if node.right:
            queue.append(node.right)
    return order` },
  // recursion (beyond tower-of-hanoi)
  { category: 'recursion', text: `function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}` },
  { category: 'recursion', text: `def power_set(items):
    if not items:
        return [[]]
    first, rest = items[0], items[1:]
    without_first = power_set(rest)
    with_first = [[first] + subset for subset in without_first]
    return without_first + with_first` },
  { category: 'recursion', text: `function solveNQueens(n, row, cols) {
  if (row === n) return 1;
  let count = 0;
  for (let col = 0; col < n; col++) {
    if (!cols.has(col)) {
      cols.add(col);
      count += solveNQueens(n, row + 1, cols);
      cols.delete(col);
    }
  }
  return count;
}` },
  // dp (beyond fibonacci)
  { category: 'dp', text: `function knapsack(weights, values, capacity) {
  const n = weights.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(capacity + 1).fill(0));
  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= capacity; w++) {
      dp[i][w] = dp[i - 1][w];
      if (weights[i - 1] <= w) {
        dp[i][w] = Math.max(dp[i][w], dp[i - 1][w - weights[i - 1]] + values[i - 1]);
      }
    }
  }
  return dp[n][capacity];
}` },
  { category: 'dp', text: `def lcs(a, b):
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[m][n]` },
  { category: 'dp', text: `function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let a = 1; a <= amount; a++) {
    for (const c of coins) {
      if (c <= a) dp[a] = Math.min(dp[a], dp[a - c] + 1);
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}` },
  // linked-list (beyond singly-linked-list)
  { category: 'linked-list', text: `def reverse_list(head):
    prev = None
    current = head
    while current is not None:
        next_node = current.next
        current.next = prev
        prev = current
        current = next_node
    return prev` },
  { category: 'linked-list', text: `function findMiddle(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  return slow;
}` },
  // graph (beyond bfs/dfs)
  { category: 'graph', text: `def topological_sort(graph):
    visited = set()
    order = []

    def visit(node):
        if node in visited:
            return
        visited.add(node)
        for neighbor in graph.get(node, []):
            visit(neighbor)
        order.append(node)

    for node in graph:
        visit(node)
    return order[::-1]` },
];

export function buildCorpus() {
  const texts = [];
  const labels = [];

  Object.entries(CODE_SNIPPETS).forEach(([slug, byLanguage]) => {
    const category = SLUG_TO_CATEGORY[slug];
    if (!category) return;
    Object.values(byLanguage).forEach((code) => {
      texts.push(code);
      labels.push(category);
    });
  });

  SUPPLEMENTAL_SAMPLES.forEach(({ category, text }) => {
    texts.push(text);
    labels.push(category);
  });

  return { texts, labels };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run (from `client/`): `npm run test -- tools/detector-training/__tests__/corpus.test.js`
Expected: PASS, 3 tests passed. If the "at least 3 examples" test fails for any category, add one more supplemental sample for that category and rerun.

- [ ] **Step 5: Commit**

```bash
git add client/tools/detector-training/corpus.js client/tools/detector-training/__tests__/corpus.test.js
git commit -m "feat: build ML training corpus from existing snippets + supplemental samples"
```

---

### Task 5: Offline model-build script + generated model artifact

**Files:**
- Create: `client/tools/detector-training/build-model.js`
- Create: `client/src/data/algoDetectorModel.json` (generated by running the script, then committed)

**Interfaces:**
- Consumes: `buildCorpus` (Task 4), `tokenize` (Task 2), `trainNaiveBayes` (Task 3).
- Produces: `client/src/data/algoDetectorModel.json` matching the `trainNaiveBayes` output shape exactly (`{ classes, priors, logProb, idf, vocab }`) — this is the exact `model` object `predictCategory` expects.

- [ ] **Step 1: Write the build script**

Create `client/tools/detector-training/build-model.js`:

```js
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { buildCorpus } from './corpus.js';
import { trainNaiveBayes } from './naiveBayesTrain.js';
import { tokenize } from '../../src/utils/codeTokenizer.js';
import { predictCategory } from '../../src/utils/naiveBayesPredict.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = join(__dirname, '..', '..', 'src', 'data', 'algoDetectorModel.json');

function shuffleInPlace(array, seedSource) {
  // deterministic shuffle so re-running the script is reproducible
  let seed = seedSource;
  for (let i = array.length - 1; i > 0; i--) {
    seed = (seed * 9301 + 49297) % 233280;
    const j = Math.floor((seed / 233280) * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function main() {
  const { texts, labels } = buildCorpus();
  const indices = texts.map((_, i) => i);
  shuffleInPlace(indices, 42);

  const splitPoint = Math.floor(indices.length * 0.8);
  const trainIdx = indices.slice(0, splitPoint);
  const testIdx = indices.slice(splitPoint);

  const trainDocs = trainIdx.map((i) => tokenize(texts[i]));
  const trainLabels = trainIdx.map((i) => labels[i]);

  const model = trainNaiveBayes(trainDocs, trainLabels);

  let correct = 0;
  testIdx.forEach((i) => {
    const prediction = predictCategory(tokenize(texts[i]), model);
    if (prediction.category === labels[i]) correct += 1;
  });
  const accuracy = testIdx.length > 0 ? correct / testIdx.length : 1;

  writeFileSync(OUTPUT_PATH, JSON.stringify(model, null, 2));

  console.log(`Trained on ${trainDocs.length} samples, held out ${testIdx.length}.`);
  console.log(`Held-out accuracy: ${(accuracy * 100).toFixed(1)}%`);
  console.log(`Model written to ${OUTPUT_PATH}`);
}

main();
```

- [ ] **Step 2: Run the script**

Run (from `client/`): `node tools/detector-training/build-model.js`
Expected: prints a training/held-out sample count and an accuracy percentage, and creates `client/src/data/algoDetectorModel.json`. Note the accuracy in the PR description — given the corpus size (~90-100 samples across 8 classes), don't expect or require above ~70-80%; this is a small, honestly-scoped corpus per the design spec's noted limitation, not a production-scale dataset.

- [ ] **Step 3: Sanity-check the generated file**

Run (from `client/`): `node -e "console.log(JSON.parse(require('fs').readFileSync('./src/data/algoDetectorModel.json', 'utf8')).classes)"`
Expected: prints an array containing all 8 categories: `sorting, searching, recursion, linked-list, stack-queue, tree, graph, dp`. (Using `readFileSync` + `JSON.parse` here instead of `require(...)` on the JSON file directly, since `require` of JSON resolves as CommonJS and the surrounding package is `"type": "module"` — this sidesteps any ambiguity.)

- [ ] **Step 4: Commit**

```bash
git add client/tools/detector-training/build-model.js client/src/data/algoDetectorModel.json
git commit -m "feat: add offline model training script and generated detector model"
```

---

### Task 6: Runtime detection API

**Files:**
- Create: `client/src/utils/algoDetector.js`
- Test: `client/src/utils/__tests__/algoDetector.test.js`

**Interfaces:**
- Consumes: `tokenize` (Task 2), `predictCategory` (Task 3), `client/src/data/algoDetectorModel.json` (Task 5).
- Produces: `detectAlgorithm(code: string) -> { category: string|null, confidence: number, scores: object }`. This is what the page (Task 22) calls directly.

- [ ] **Step 1: Write the failing test**

Create `client/src/utils/__tests__/algoDetector.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { detectAlgorithm } from '../algoDetector.js';

const BUBBLE_SORT_JS = `function bubbleSort(arr) {
  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        const temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
  return arr;
}`;

const BFS_PY = `def bfs(graph, start):
    visited = set([start])
    queue = [start]
    order = []
    while queue:
        node = queue.pop(0)
        order.append(node)
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    return order`;

describe('detectAlgorithm', () => {
  it('detects a sorting algorithm with a real category and confidence', () => {
    const result = detectAlgorithm(BUBBLE_SORT_JS);
    expect(result.category).toBe('sorting');
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });

  it('detects a graph traversal algorithm', () => {
    const result = detectAlgorithm(BFS_PY);
    expect(result.category).toBe('graph');
  });

  it('returns a null category for empty input instead of throwing', () => {
    const result = detectAlgorithm('');
    expect(result.category).toBeNull();
    expect(result.confidence).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run (from `client/`): `npm run test -- src/utils/__tests__/algoDetector.test.js`
Expected: FAIL — `algoDetector.js` does not exist.

- [ ] **Step 3: Implement it**

Create `client/src/utils/algoDetector.js`:

```js
import { tokenize } from './codeTokenizer.js';
import { predictCategory } from './naiveBayesPredict.js';
import model from '../data/algoDetectorModel.json';

export function detectAlgorithm(code) {
  const tokens = tokenize(code);
  if (tokens.length === 0) {
    return { category: null, confidence: 0, scores: {} };
  }
  return predictCategory(tokens, model);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run (from `client/`): `npm run test -- src/utils/__tests__/algoDetector.test.js`
Expected: PASS, 3 tests passed. If `bfs` or `bubbleSort` are misclassified, this indicates the corpus (Task 4) needs more/better supplemental examples for that category — go back and add 1-2 more real, distinguishing samples, rerun `build-model.js` (Task 5), then rerun this test.

- [ ] **Step 5: Commit**

```bash
git add client/src/utils/algoDetector.js client/src/utils/__tests__/algoDetector.test.js
git commit -m "feat: add runtime algorithm detection API"
```

---

## Phase 2 — JavaScript execution tracer

### Task 7: Acorn-based statement instrumentation

**Files:**
- Create: `client/src/utils/tracer/jsInstrument.js`
- Test: `client/src/utils/tracer/__tests__/jsInstrument.test.js`

**Interfaces:**
- Produces: `instrumentJsCode(source: string) -> string` — returns instrumented source that, when run with `__trace(line, locals)`, `__enterFrame(name, args)`, `__exitFrame()` provided as globals/params, calls them at every statement and function entry/exit.

- [ ] **Step 1: Install dependencies**

```bash
cd client
npm install acorn astring
```

- [ ] **Step 2: Write the failing test**

Create `client/src/utils/tracer/__tests__/jsInstrument.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { instrumentJsCode } from '../jsInstrument.js';

function runInstrumented(source) {
  const trace = [];
  const calls = [];
  const returns = [];
  const instrumented = instrumentJsCode(source);
  const runner = new Function(
    '__trace', '__enterFrame', '__exitFrame',
    instrumented
  );
  runner(
    (line, locals) => trace.push({ line, locals }),
    (name, args) => calls.push({ name, args }),
    () => returns.push(true)
  );
  return { trace, calls, returns };
}

describe('instrumentJsCode', () => {
  it('records a trace step for each top-level statement', () => {
    const { trace } = runInstrumented(`
      let x = 1;
      let y = 2;
      let z = x + y;
    `);
    expect(trace.length).toBeGreaterThanOrEqual(3);
  });

  it('captures variable values that are in scope at each step', () => {
    const { trace } = runInstrumented(`
      let arr = [3, 1, 2];
      let i = 0;
    `);
    const lastStep = trace[trace.length - 1];
    expect(lastStep.locals.arr).toEqual([3, 1, 2]);
    expect(lastStep.locals.i).toBe(0);
  });

  it('traces loop bodies on every iteration', () => {
    const { trace } = runInstrumented(`
      let sum = 0;
      for (let i = 0; i < 5; i++) {
        sum = sum + i;
      }
    `);
    const sumValues = trace
      .map((t) => t.locals.sum)
      .filter((v) => v !== undefined);
    expect(sumValues.length).toBeGreaterThanOrEqual(5);
  });

  it('emits enter/exit frame calls around function calls', () => {
    const { calls, returns } = runInstrumented(`
      function add(a, b) {
        return a + b;
      }
      add(2, 3);
    `);
    expect(calls.length).toBeGreaterThanOrEqual(1);
    expect(calls[0].name).toBe('add');
    expect(calls[0].args).toEqual({ a: 2, b: 3 });
    expect(returns.length).toBeGreaterThanOrEqual(1);
  });

  it('actually runs correctly (mutates arrays, returns values) alongside tracing', () => {
    const trace = [];
    const instrumented = instrumentJsCode(`
      function bubbleSortOnce(arr) {
        for (let j = 0; j < arr.length - 1; j++) {
          if (arr[j] > arr[j + 1]) {
            const tmp = arr[j];
            arr[j] = arr[j + 1];
            arr[j + 1] = tmp;
          }
        }
        return arr;
      }
      bubbleSortOnce([3, 1, 2]);
    `);
    const runner = new Function('__trace', '__enterFrame', '__exitFrame', `
      let __result = undefined;
      ${instrumented}
    `);
    // The instrumented code still executes real semantics; verify no throw.
    expect(() => runner(
      (l, v) => trace.push(v),
      () => {},
      () => {}
    )).not.toThrow();
    expect(trace.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run (from `client/`): `npm run test -- src/utils/tracer/__tests__/jsInstrument.test.js`
Expected: FAIL — `jsInstrument.js` does not exist.

- [ ] **Step 4: Implement the instrumenter**

Create `client/src/utils/tracer/jsInstrument.js`:

```js
import * as acorn from 'acorn';
import { generate } from 'astring';

function identifier(name) {
  return { type: 'Identifier', name };
}

function objectFromNames(names) {
  return {
    type: 'ObjectExpression',
    properties: names.map((name) => ({
      type: 'Property',
      kind: 'init',
      method: false,
      shorthand: true,
      computed: false,
      key: identifier(name),
      value: identifier(name),
    })),
  };
}

function traceCall(line, knownNames) {
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'CallExpression',
      callee: identifier('__trace'),
      arguments: [
        { type: 'Literal', value: line },
        objectFromNames(knownNames),
      ],
    },
  };
}

function enterFrameCall(name, paramNames) {
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'CallExpression',
      callee: identifier('__enterFrame'),
      arguments: [
        { type: 'Literal', value: name },
        objectFromNames(paramNames),
      ],
    },
  };
}

function exitFrameCall() {
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'CallExpression',
      callee: identifier('__exitFrame'),
      arguments: [],
    },
  };
}

function declaredNamesFromPattern(pattern, out) {
  if (!pattern) return;
  if (pattern.type === 'Identifier') out.push(pattern.name);
  else if (pattern.type === 'ArrayPattern') {
    pattern.elements.forEach((el) => declaredNamesFromPattern(el, out));
  } else if (pattern.type === 'ObjectPattern') {
    pattern.properties.forEach((p) => declaredNamesFromPattern(p.value || p.argument, out));
  } else if (pattern.type === 'AssignmentPattern') {
    declaredNamesFromPattern(pattern.left, out);
  } else if (pattern.type === 'RestElement') {
    declaredNamesFromPattern(pattern.argument, out);
  }
}

function instrumentBlockLike(body, known) {
  if (body.type === 'BlockStatement') {
    return { ...body, body: instrumentBlock(body.body, known) };
  }
  return { type: 'BlockStatement', body: instrumentBlock([body], known) };
}

function instrumentBlock(bodyArray, known) {
  const result = [];
  const scopeKnown = [...known];
  bodyArray.forEach((stmt) => {
    const line = stmt.loc ? stmt.loc.start.line : 0;
    result.push(traceCall(line, scopeKnown));
    if (stmt.type === 'ReturnStatement') {
      result.push(exitFrameCall());
    }
    result.push(instrumentStatement(stmt, scopeKnown));
    if (stmt.type === 'VariableDeclaration') {
      stmt.declarations.forEach((d) => declaredNamesFromPattern(d.id, scopeKnown));
    }
  });
  return result;
}

function instrumentStatement(stmt, known) {
  switch (stmt.type) {
    case 'BlockStatement':
      return { ...stmt, body: instrumentBlock(stmt.body, known) };

    case 'ForStatement': {
      const loopKnown = [...known];
      if (stmt.init && stmt.init.type === 'VariableDeclaration') {
        stmt.init.declarations.forEach((d) => declaredNamesFromPattern(d.id, loopKnown));
      }
      return { ...stmt, body: instrumentBlockLike(stmt.body, loopKnown) };
    }

    case 'ForInStatement':
    case 'ForOfStatement': {
      const loopKnown = [...known];
      if (stmt.left.type === 'VariableDeclaration') {
        stmt.left.declarations.forEach((d) => declaredNamesFromPattern(d.id, loopKnown));
      }
      return { ...stmt, body: instrumentBlockLike(stmt.body, loopKnown) };
    }

    case 'WhileStatement':
    case 'DoWhileStatement':
      return { ...stmt, body: instrumentBlockLike(stmt.body, known) };

    case 'IfStatement':
      return {
        ...stmt,
        consequent: instrumentBlockLike(stmt.consequent, known),
        alternate: stmt.alternate ? instrumentBlockLike(stmt.alternate, known) : null,
      };

    case 'FunctionDeclaration':
    case 'FunctionExpression': {
      const paramNames = [];
      stmt.params.forEach((p) => declaredNamesFromPattern(p, paramNames));
      const fnName = stmt.id ? stmt.id.name : 'anonymous';
      const newBody = {
        ...stmt.body,
        body: [enterFrameCall(fnName, paramNames), ...instrumentBlock(stmt.body.body, paramNames)],
      };
      return { ...stmt, body: newBody };
    }

    default:
      return stmt;
  }
}

export function instrumentJsCode(source) {
  const ast = acorn.parse(source, { ecmaVersion: 2020, sourceType: 'script', locations: true });
  const instrumentedBody = instrumentBlock(ast.body, []);
  return generate({ ...ast, body: instrumentedBody });
}
```

- [ ] **Step 5: Run test to verify it passes**

Run (from `client/`): `npm run test -- src/utils/tracer/__tests__/jsInstrument.test.js`
Expected: PASS, 5 tests passed.

- [ ] **Step 6: Commit**

```bash
git add client/package.json client/package-lock.json client/src/utils/tracer/jsInstrument.js client/src/utils/tracer/__tests__/jsInstrument.test.js
git commit -m "feat: add Acorn-based JS statement instrumentation for real execution tracing"
```

---

### Task 8: Trace harness (step/time budget + trace collection)

**Files:**
- Create: `client/src/utils/tracer/traceHarness.js`
- Test: `client/src/utils/tracer/__tests__/traceHarness.test.js`

**Interfaces:**
- Produces: `createTraceHarness(opts?: { maxSteps?, maxRuntimeMs? }) -> { __trace, __enterFrame, __exitFrame, getTrace, isTruncated }`. `__trace`/`__enterFrame`/`__exitFrame` match exactly the three globals `instrumentJsCode`'s output expects (Task 7). Each trace record has shape `{ line, locals, callDepth, event: 'step'|'call'|'return', functionName? }` — this exact shape is what every Trace Adapter (Phase 4) consumes.

- [ ] **Step 1: Write the failing test**

Create `client/src/utils/tracer/__tests__/traceHarness.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { createTraceHarness } from '../traceHarness.js';

describe('createTraceHarness', () => {
  it('collects step records with line, locals, callDepth and event', () => {
    const harness = createTraceHarness();
    harness.__trace(1, { x: 1 });
    harness.__trace(2, { x: 2 });
    const trace = harness.getTrace();
    expect(trace).toHaveLength(2);
    expect(trace[0]).toEqual({ line: 1, locals: { x: 1 }, callDepth: 0, event: 'step' });
  });

  it('tracks call depth across enter/exit frame calls', () => {
    const harness = createTraceHarness();
    harness.__enterFrame('outer', { a: 1 });
    harness.__trace(5, { a: 1 });
    harness.__enterFrame('inner', { b: 2 });
    harness.__trace(6, { b: 2 });
    harness.__exitFrame();
    harness.__exitFrame();
    const trace = harness.getTrace();
    expect(trace.find((r) => r.line === 5).callDepth).toBe(1);
    expect(trace.find((r) => r.line === 6).callDepth).toBe(2);
  });

  it('throws once the step budget is exceeded and marks the harness truncated', () => {
    const harness = createTraceHarness({ maxSteps: 3 });
    harness.__trace(1, {});
    harness.__trace(2, {});
    harness.__trace(3, {});
    expect(() => harness.__trace(4, {})).toThrow('__TRACE_BUDGET_EXCEEDED__');
    expect(harness.isTruncated()).toBe(true);
  });

  it('safely clones locals so later mutation of the source object does not affect the trace', () => {
    const harness = createTraceHarness();
    const arr = [1, 2, 3];
    harness.__trace(1, { arr });
    arr.push(4);
    expect(harness.getTrace()[0].locals.arr).toEqual([1, 2, 3]);
  });

  it('falls back to an empty object when locals are not JSON-serializable', () => {
    const harness = createTraceHarness();
    const circular = {};
    circular.self = circular;
    harness.__trace(1, { circular });
    expect(harness.getTrace()[0].locals).toEqual({});
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run (from `client/`): `npm run test -- src/utils/tracer/__tests__/traceHarness.test.js`
Expected: FAIL — `traceHarness.js` does not exist.

- [ ] **Step 3: Implement it**

Create `client/src/utils/tracer/traceHarness.js`:

```js
export function createTraceHarness({ maxSteps = 3000, maxRuntimeMs = 4000 } = {}) {
  const trace = [];
  const callStack = [];
  const startTime = Date.now();
  let truncated = false;

  function checkBudget() {
    if (trace.length >= maxSteps || Date.now() - startTime > maxRuntimeMs) {
      truncated = true;
      throw new Error('__TRACE_BUDGET_EXCEEDED__');
    }
  }

  function safeClone(value) {
    try {
      return JSON.parse(JSON.stringify(value));
    } catch {
      return {};
    }
  }

  return {
    __trace(line, locals) {
      checkBudget();
      trace.push({ line, locals: safeClone(locals), callDepth: callStack.length, event: 'step' });
    },
    __enterFrame(name, args) {
      checkBudget();
      callStack.push(name);
      trace.push({
        line: 0,
        locals: safeClone(args),
        callDepth: callStack.length,
        event: 'call',
        functionName: name,
      });
    },
    __exitFrame() {
      const name = callStack.pop();
      trace.push({
        line: 0,
        locals: {},
        callDepth: callStack.length,
        event: 'return',
        functionName: name,
      });
    },
    getTrace() {
      return trace;
    },
    isTruncated() {
      return truncated;
    },
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run (from `client/`): `npm run test -- src/utils/tracer/__tests__/traceHarness.test.js`
Expected: PASS, 5 tests passed.

- [ ] **Step 5: Commit**

```bash
git add client/src/utils/tracer/traceHarness.js client/src/utils/tracer/__tests__/traceHarness.test.js
git commit -m "feat: add trace harness with step/time budget enforcement"
```

---

### Task 9: JS Web Worker + main-thread wrapper

**Files:**
- Create: `client/src/utils/tracer/jsWorker.js`
- Create: `client/src/utils/tracer/runJsTrace.js`

**Interfaces:**
- Consumes: `instrumentJsCode` (Task 7), `createTraceHarness` (Task 8).
- Produces: `runJsTrace(code: string, opts？: { timeoutMs?: number }) -> Promise<{ trace: object[], truncated: boolean }>` — rejects with an `Error` on syntax/runtime errors or overall timeout. This is what the page (Task 22) calls for JavaScript input.

**Testing note:** Web Workers using `import.meta.url` module workers cannot run inside Vitest's jsdom environment (no real worker thread / module loader). This task's correctness is verified manually in the browser in Task 25 (end-to-end verification), not by an automated unit test. `jsInstrument.js` and `traceHarness.js`, which hold all the actual logic, already have full unit coverage from Tasks 7-8 — this task is thin wiring on top of them.

- [ ] **Step 1: Implement the worker**

Create `client/src/utils/tracer/jsWorker.js`:

```js
import { instrumentJsCode } from './jsInstrument.js';
import { createTraceHarness } from './traceHarness.js';

self.onmessage = function handleMessage(event) {
  const { code } = event.data;
  const harness = createTraceHarness({ maxSteps: 3000, maxRuntimeMs: 4000 });

  try {
    const instrumented = instrumentJsCode(code);
    const runner = new Function('__trace', '__enterFrame', '__exitFrame', instrumented);
    runner(harness.__trace, harness.__enterFrame, harness.__exitFrame);
    self.postMessage({ ok: true, trace: harness.getTrace(), truncated: harness.isTruncated() });
  } catch (err) {
    if (err.message === '__TRACE_BUDGET_EXCEEDED__') {
      self.postMessage({ ok: true, trace: harness.getTrace(), truncated: true });
    } else {
      self.postMessage({ ok: false, error: err.message || String(err) });
    }
  }
};
```

- [ ] **Step 2: Implement the main-thread wrapper**

Create `client/src/utils/tracer/runJsTrace.js`:

```js
export function runJsTrace(code, { timeoutMs = 6000 } = {}) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./jsWorker.js', import.meta.url), { type: 'module' });

    const timer = setTimeout(() => {
      worker.terminate();
      reject(new Error('Execution timed out. Check for an infinite loop.'));
    }, timeoutMs);

    worker.onmessage = (event) => {
      clearTimeout(timer);
      worker.terminate();
      if (event.data.ok) {
        resolve({ trace: event.data.trace, truncated: !!event.data.truncated });
      } else {
        reject(new Error(event.data.error));
      }
    };

    worker.onerror = (err) => {
      clearTimeout(timer);
      worker.terminate();
      reject(new Error(err.message || 'Worker execution failed.'));
    };

    worker.postMessage({ code });
  });
}
```

- [ ] **Step 3: Manual verification (deferred)**

No automated test for this task — see the Testing note above. Manual verification happens in Task 25 once the full page is wired up: paste a real JS snippet, confirm the browser DevTools Network/Sources tab shows a Worker starting and a trace coming back.

- [ ] **Step 4: Commit**

```bash
git add client/src/utils/tracer/jsWorker.js client/src/utils/tracer/runJsTrace.js
git commit -m "feat: add JS sandboxed Web Worker execution + main-thread wrapper"
```

---

## Phase 3 — Python execution tracer

### Task 10: Pyodide worker (real `sys.settrace`) + main-thread wrapper

**Files:**
- Create: `client/src/utils/tracer/pyodideWorker.js`
- Create: `client/src/utils/tracer/runPyTrace.js`

**Interfaces:**
- Produces: `runPyTrace(code: string, opts?: { timeoutMs?: number }) -> Promise<{ trace: object[], truncated: boolean }>` — same contract as `runJsTrace` (Task 9), so the page (Task 22) can use either interchangeably. Trace records have the same shape as the JS tracer: `{ line, locals, callDepth, event, functionName? }`.

**Testing note:** Same as Task 9 — Pyodide is a ~6-10MB WASM runtime fetched over the network inside a Web Worker; it cannot run inside Vitest. Verified manually in Task 25.

- [ ] **Step 1: Implement the worker**

Create `client/src/utils/tracer/pyodideWorker.js`:

```js
const PYODIDE_CDN_URL = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';

let pyodideReadyPromise = null;

async function getPyodide() {
  if (!pyodideReadyPromise) {
    self.importScripts(PYODIDE_CDN_URL);
    // eslint-disable-next-line no-undef
    pyodideReadyPromise = loadPyodide();
  }
  return pyodideReadyPromise;
}

const TRACE_HARNESS_PY = `
import sys, json

__trace_records = []
__depth = [0]
__MAX_STEPS = 3000

def __tracer(frame, event, arg):
    if event not in ("line", "call", "return"):
        return __tracer
    if len(__trace_records) >= __MAX_STEPS:
        raise RuntimeError("__TRACE_STEP_LIMIT__")
    if event == "call":
        __depth[0] += 1
    locals_snapshot = {}
    for k, v in frame.f_locals.items():
        if k.startswith("__"):
            continue
        try:
            json.dumps(v)
            locals_snapshot[k] = v
        except Exception:
            locals_snapshot[k] = str(v)
    __trace_records.append({
        "line": frame.f_lineno,
        "locals": locals_snapshot,
        "callDepth": __depth[0],
        "event": event,
        "functionName": frame.f_code.co_name,
    })
    if event == "return":
        __depth[0] -= 1
    return __tracer

sys.settrace(__tracer)
`;

self.onmessage = async function handleMessage(event) {
  const { code } = event.data;
  try {
    const pyodide = await getPyodide();
    await pyodide.runPythonAsync(TRACE_HARNESS_PY);
    try {
      await pyodide.runPythonAsync(code);
    } finally {
      await pyodide.runPythonAsync('sys.settrace(None)');
    }
    const records = pyodide.globals.get('__trace_records').toJs({ dict_converter: Object.fromEntries });
    self.postMessage({ ok: true, trace: records, truncated: false });
  } catch (err) {
    const message = err && err.message ? err.message : String(err);
    if (message.includes('__TRACE_STEP_LIMIT__')) {
      self.postMessage({ ok: true, trace: [], truncated: true });
    } else {
      self.postMessage({ ok: false, error: message });
    }
  }
};
```

- [ ] **Step 2: Implement the main-thread wrapper**

Create `client/src/utils/tracer/runPyTrace.js`:

```js
export function runPyTrace(code, { timeoutMs = 15000 } = {}) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./pyodideWorker.js', import.meta.url), { type: 'module' });

    const timer = setTimeout(() => {
      worker.terminate();
      reject(new Error('Execution timed out. Check for an infinite loop.'));
    }, timeoutMs);

    worker.onmessage = (event) => {
      clearTimeout(timer);
      worker.terminate();
      if (event.data.ok) {
        resolve({ trace: event.data.trace, truncated: !!event.data.truncated });
      } else {
        reject(new Error(event.data.error));
      }
    };

    worker.onerror = (err) => {
      clearTimeout(timer);
      worker.terminate();
      reject(new Error(err.message || 'Worker execution failed.'));
    };

    worker.postMessage({ code });
  });
}
```

Note: `timeoutMs` defaults higher than the JS tracer (15s vs 6s) because Pyodide's first load in a session includes fetching and initializing the WASM runtime, which can take several seconds on a cold cache.

- [ ] **Step 3: Manual verification (deferred)**

No automated test — verified manually in Task 25.

- [ ] **Step 4: Commit**

```bash
git add client/src/utils/tracer/pyodideWorker.js client/src/utils/tracer/runPyTrace.js
git commit -m "feat: add Python execution tracer via Pyodide + sys.settrace"
```

---

## Phase 4 — Trace adapters

### Task 11: Trace cap (truncation guard)

**Files:**
- Create: `client/src/utils/traceAdapters/capTrace.js`
- Test: `client/src/utils/traceAdapters/__tests__/capTrace.test.js`

**Interfaces:**
- Produces: `capTrace(trace: object[], maxFrames?: number) -> { frames: object[], truncated: boolean }`.

- [ ] **Step 1: Write the failing test**

Create `client/src/utils/traceAdapters/__tests__/capTrace.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { capTrace } from '../capTrace.js';

describe('capTrace', () => {
  it('returns the trace unchanged when under the cap', () => {
    const trace = [{ line: 1 }, { line: 2 }];
    const result = capTrace(trace, 10);
    expect(result.frames).toEqual(trace);
    expect(result.truncated).toBe(false);
  });

  it('truncates and flags when over the cap', () => {
    const trace = Array.from({ length: 20 }, (_, i) => ({ line: i }));
    const result = capTrace(trace, 5);
    expect(result.frames).toHaveLength(5);
    expect(result.truncated).toBe(true);
  });

  it('handles a non-array input gracefully', () => {
    const result = capTrace(undefined, 5);
    expect(result.frames).toEqual([]);
    expect(result.truncated).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run (from `client/`): `npm run test -- src/utils/traceAdapters/__tests__/capTrace.test.js`
Expected: FAIL — `capTrace.js` does not exist.

- [ ] **Step 3: Implement it**

Create `client/src/utils/traceAdapters/capTrace.js`:

```js
export function capTrace(trace, maxFrames = 3000) {
  if (!Array.isArray(trace)) {
    return { frames: [], truncated: false };
  }
  if (trace.length <= maxFrames) {
    return { frames: trace, truncated: false };
  }
  return { frames: trace.slice(0, maxFrames), truncated: true };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run (from `client/`): `npm run test -- src/utils/traceAdapters/__tests__/capTrace.test.js`
Expected: PASS, 3 tests passed.

- [ ] **Step 5: Commit**

```bash
git add client/src/utils/traceAdapters/capTrace.js client/src/utils/traceAdapters/__tests__/capTrace.test.js
git commit -m "feat: add trace truncation guard"
```

---

### Task 12: Sorting/searching adapter + recursion adapter

**Files:**
- Create: `client/src/utils/traceAdapters/sortingSearchingAdapter.js`
- Create: `client/src/utils/traceAdapters/recursionAdapter.js`
- Test: `client/src/utils/traceAdapters/__tests__/sortingSearchingAdapter.test.js`
- Test: `client/src/utils/traceAdapters/__tests__/recursionAdapter.test.js`

**Interfaces:**
- Consumes: trace record shape from Task 8 (`{ line, locals, callDepth, event, functionName? }`).
- Produces: `adaptArrayTrace(trace) -> frame[]|null` and `adaptRecursionTrace(trace) -> frame[]|null`, where each frame is `{ data, states, log, type }`. Both return `null` when no usable signal is found (the Task 15 dispatcher falls back to the variable inspector in that case) — never fabricate a frame.

- [ ] **Step 1: Write the failing tests**

Create `client/src/utils/traceAdapters/__tests__/sortingSearchingAdapter.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { adaptArrayTrace } from '../sortingSearchingAdapter.js';

describe('adaptArrayTrace', () => {
  it('returns null when no array-of-primitives local is found', () => {
    const trace = [{ line: 1, locals: { x: 1 }, callDepth: 0, event: 'step' }];
    expect(adaptArrayTrace(trace)).toBeNull();
  });

  it('tracks the most frequently seen array local across the trace', () => {
    const trace = [
      { line: 1, locals: { arr: [3, 1, 2] }, callDepth: 0, event: 'step' },
      { line: 2, locals: { arr: [1, 3, 2] }, callDepth: 0, event: 'step' },
      { line: 3, locals: { arr: [1, 2, 3] }, callDepth: 0, event: 'step' },
    ];
    const frames = adaptArrayTrace(trace);
    expect(frames).toHaveLength(3);
    expect(frames[0].data).toEqual([3, 1, 2]);
    expect(frames[2].data).toEqual([1, 2, 3]);
    expect(frames[2].type).toBe('done');
  });

  it('marks changed indices with a swap state', () => {
    const trace = [
      { line: 1, locals: { arr: [3, 1, 2] }, callDepth: 0, event: 'step' },
      { line: 2, locals: { arr: [1, 3, 2] }, callDepth: 0, event: 'step' },
    ];
    const frames = adaptArrayTrace(trace);
    expect(frames[1].states[0]).toBe('swap');
    expect(frames[1].states[1]).toBe('swap');
    expect(frames[1].type).toBe('done');
  });
});
```

Create `client/src/utils/traceAdapters/__tests__/recursionAdapter.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { adaptRecursionTrace } from '../recursionAdapter.js';

describe('adaptRecursionTrace', () => {
  it('returns null for an empty trace', () => {
    expect(adaptRecursionTrace([])).toBeNull();
  });

  it('builds a growing/shrinking call stack from call/return events', () => {
    const trace = [
      { line: 0, locals: { n: 3 }, callDepth: 1, event: 'call', functionName: 'factorial' },
      { line: 0, locals: { n: 2 }, callDepth: 2, event: 'call', functionName: 'factorial' },
      { line: 0, locals: {}, callDepth: 1, event: 'return', functionName: 'factorial' },
      { line: 0, locals: {}, callDepth: 0, event: 'return', functionName: 'factorial' },
    ];
    const frames = adaptRecursionTrace(trace);
    expect(frames).toHaveLength(4);
    expect(frames[0].data).toHaveLength(1);
    expect(frames[1].data).toHaveLength(2);
    expect(frames[2].data).toHaveLength(1);
    expect(frames[3].data).toHaveLength(0);
    expect(frames[3].type).toBe('done');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run (from `client/`): `npm run test -- src/utils/traceAdapters/__tests__/sortingSearchingAdapter.test.js src/utils/traceAdapters/__tests__/recursionAdapter.test.js`
Expected: FAIL — neither module exists.

- [ ] **Step 3: Implement the sorting/searching adapter**

Create `client/src/utils/traceAdapters/sortingSearchingAdapter.js`:

```js
function isArrayOfPrimitives(value) {
  return Array.isArray(value) && value.every((x) => typeof x === 'number' || typeof x === 'string');
}

export function adaptArrayTrace(trace) {
  if (!Array.isArray(trace) || trace.length === 0) return null;

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

  const arrayVarName = candidates.reduce(
    (best, name) => (candidateCounts[name] > candidateCounts[best] ? name : best),
    candidates[0]
  );

  const frames = [];
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

    frames.push({
      data: arr,
      states,
      log: `Line ${record.line}: ${arrayVarName} = [${arr.join(', ')}]`,
      type: changedIndices.length > 0 ? 'swap' : 'info',
    });
    prevArr = arr;
  });

  if (frames.length === 0) return null;
  frames[frames.length - 1].type = 'done';
  return frames;
}
```

- [ ] **Step 4: Implement the recursion adapter**

Create `client/src/utils/traceAdapters/recursionAdapter.js`:

```js
export function adaptRecursionTrace(trace) {
  if (!Array.isArray(trace) || trace.length === 0) return null;

  const stack = [];
  const frames = [];
  let sawCallOrReturn = false;

  trace.forEach((record) => {
    if (record.event === 'call') {
      sawCallOrReturn = true;
      stack.push({ name: record.functionName || 'call', args: record.locals || {} });
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

- [ ] **Step 5: Run tests to verify they pass**

Run (from `client/`): `npm run test -- src/utils/traceAdapters/__tests__/sortingSearchingAdapter.test.js src/utils/traceAdapters/__tests__/recursionAdapter.test.js`
Expected: PASS, 3 + 2 tests passed.

- [ ] **Step 6: Commit**

```bash
git add client/src/utils/traceAdapters/sortingSearchingAdapter.js client/src/utils/traceAdapters/recursionAdapter.js client/src/utils/traceAdapters/__tests__/sortingSearchingAdapter.test.js client/src/utils/traceAdapters/__tests__/recursionAdapter.test.js
git commit -m "feat: add sorting/searching and recursion trace adapters"
```

---

### Task 13: Linked-list adapter + stack/queue adapter

**Files:**
- Create: `client/src/utils/traceAdapters/linkedListAdapter.js`
- Create: `client/src/utils/traceAdapters/stackQueueAdapter.js`
- Test: `client/src/utils/traceAdapters/__tests__/linkedListAdapter.test.js`
- Test: `client/src/utils/traceAdapters/__tests__/stackQueueAdapter.test.js`

**Interfaces:**
- Produces: `adaptLinkedListTrace(trace) -> frame[]|null`, `adaptStackQueueTrace(trace) -> frame[]|null`. Same frame shape as Task 12.

- [ ] **Step 1: Write the failing tests**

Create `client/src/utils/traceAdapters/__tests__/linkedListAdapter.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { adaptLinkedListTrace } from '../linkedListAdapter.js';

describe('adaptLinkedListTrace', () => {
  it('returns null when no next-chained object is found', () => {
    const trace = [{ line: 1, locals: { x: 1 }, callDepth: 0, event: 'step' }];
    expect(adaptLinkedListTrace(trace)).toBeNull();
  });

  it('walks a serialized next-chain into a flat value list', () => {
    const trace = [
      {
        line: 1,
        locals: { head: { value: 1, next: { value: 2, next: { value: 3, next: null } } } },
        callDepth: 0,
        event: 'step',
      },
    ];
    const frames = adaptLinkedListTrace(trace);
    expect(frames).toHaveLength(1);
    expect(frames[0].data).toEqual([1, 2, 3]);
    expect(frames[0].type).toBe('done');
  });
});
```

Create `client/src/utils/traceAdapters/__tests__/stackQueueAdapter.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { adaptStackQueueTrace } from '../stackQueueAdapter.js';

describe('adaptStackQueueTrace', () => {
  it('returns null when no stack/queue-named array local is found', () => {
    const trace = [{ line: 1, locals: { arr: [1, 2] }, callDepth: 0, event: 'step' }];
    expect(adaptStackQueueTrace(trace)).toBeNull();
  });

  it('tracks an array local whose name contains "stack" or "queue"', () => {
    const trace = [
      { line: 1, locals: { queue: [1] }, callDepth: 0, event: 'step' },
      { line: 2, locals: { queue: [1, 2] }, callDepth: 0, event: 'step' },
    ];
    const frames = adaptStackQueueTrace(trace);
    expect(frames).toHaveLength(2);
    expect(frames[1].data).toEqual([1, 2]);
    expect(frames[1].type).toBe('done');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run (from `client/`): `npm run test -- src/utils/traceAdapters/__tests__/linkedListAdapter.test.js src/utils/traceAdapters/__tests__/stackQueueAdapter.test.js`
Expected: FAIL — neither module exists.

- [ ] **Step 3: Implement the linked-list adapter**

Create `client/src/utils/traceAdapters/linkedListAdapter.js`:

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
      data: values,
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

- [ ] **Step 4: Implement the stack/queue adapter**

Create `client/src/utils/traceAdapters/stackQueueAdapter.js`:

```js
const NAME_PATTERN = /stack|queue/i;

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

  const frames = [];
  trace.forEach((record) => {
    const value = record.locals ? record.locals[varName] : undefined;
    if (!Array.isArray(value)) return;
    frames.push({
      data: value,
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

- [ ] **Step 5: Run tests to verify they pass**

Run (from `client/`): `npm run test -- src/utils/traceAdapters/__tests__/linkedListAdapter.test.js src/utils/traceAdapters/__tests__/stackQueueAdapter.test.js`
Expected: PASS, 2 + 2 tests passed.

- [ ] **Step 6: Commit**

```bash
git add client/src/utils/traceAdapters/linkedListAdapter.js client/src/utils/traceAdapters/stackQueueAdapter.js client/src/utils/traceAdapters/__tests__/linkedListAdapter.test.js client/src/utils/traceAdapters/__tests__/stackQueueAdapter.test.js
git commit -m "feat: add linked-list and stack/queue trace adapters"
```

---

### Task 14: Tree adapter + graph adapter

**Files:**
- Create: `client/src/utils/traceAdapters/treeAdapter.js`
- Create: `client/src/utils/traceAdapters/graphAdapter.js`
- Test: `client/src/utils/traceAdapters/__tests__/treeAdapter.test.js`
- Test: `client/src/utils/traceAdapters/__tests__/graphAdapter.test.js`

**Interfaces:**
- Produces: `adaptTreeTrace(trace) -> frame[]|null` where `frame.data = { nodes: [{id, label}], edges: [{from, to}] }`; `adaptGraphTrace(trace) -> frame[]|null` where `frame.data = { nodes: string[] }` and `frame.states[nodeId]` is `'sorted'` (visited) or `'info'` (unvisited) — these `data`/`states` shapes are exactly what `TreeViz` and `GraphTraceViz` (Task 17) expect.

- [ ] **Step 1: Write the failing tests**

Create `client/src/utils/traceAdapters/__tests__/treeAdapter.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { adaptTreeTrace } from '../treeAdapter.js';

describe('adaptTreeTrace', () => {
  it('returns null when no left/right/children-shaped local is found', () => {
    const trace = [{ line: 1, locals: { x: 1 }, callDepth: 0, event: 'step' }];
    expect(adaptTreeTrace(trace)).toBeNull();
  });

  it('flattens a left/right tree into nodes and edges', () => {
    const trace = [
      {
        line: 1,
        locals: { node: { value: 5, left: { value: 3, left: null, right: null }, right: null } },
        callDepth: 0,
        event: 'step',
      },
    ];
    const frames = adaptTreeTrace(trace);
    expect(frames).toHaveLength(1);
    expect(frames[0].data.nodes.length).toBeGreaterThanOrEqual(2);
    expect(frames[0].data.edges.length).toBeGreaterThanOrEqual(1);
    expect(frames[0].type).toBe('done');
  });
});
```

Create `client/src/utils/traceAdapters/__tests__/graphAdapter.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { adaptGraphTrace } from '../graphAdapter.js';

describe('adaptGraphTrace', () => {
  it('returns null when no visited-named local is found', () => {
    const trace = [{ line: 1, locals: { x: 1 }, callDepth: 0, event: 'step' }];
    expect(adaptGraphTrace(trace)).toBeNull();
  });

  it('marks nodes as visited/unvisited based on a visited set across the trace', () => {
    const trace = [
      { line: 1, locals: { visited: ['a'] }, callDepth: 0, event: 'step' },
      { line: 2, locals: { visited: ['a', 'b'] }, callDepth: 0, event: 'step' },
    ];
    const frames = adaptGraphTrace(trace);
    expect(frames).toHaveLength(2);
    expect(frames[1].states.a).toBe('sorted');
    expect(frames[1].states.b).toBe('sorted');
    expect(frames[1].type).toBe('done');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run (from `client/`): `npm run test -- src/utils/traceAdapters/__tests__/treeAdapter.test.js src/utils/traceAdapters/__tests__/graphAdapter.test.js`
Expected: FAIL — neither module exists.

- [ ] **Step 3: Implement the tree adapter**

Create `client/src/utils/traceAdapters/treeAdapter.js`:

```js
function isTreeNode(value) {
  return (
    value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    ('left' in value || 'right' in value || 'children' in value)
  );
}

function treeToNodesEdges(node, path) {
  const nodes = [];
  const edges = [];
  if (!node || typeof node !== 'object') return { nodes, edges };

  const value = 'value' in node ? node.value : 'val' in node ? node.val : path;
  nodes.push({ id: path, label: String(value) });

  if (node.left) {
    edges.push({ from: path, to: `${path}L` });
    const sub = treeToNodesEdges(node.left, `${path}L`);
    nodes.push(...sub.nodes);
    edges.push(...sub.edges);
  }
  if (node.right) {
    edges.push({ from: path, to: `${path}R` });
    const sub = treeToNodesEdges(node.right, `${path}R`);
    nodes.push(...sub.nodes);
    edges.push(...sub.edges);
  }
  if (Array.isArray(node.children)) {
    node.children.forEach((child, i) => {
      edges.push({ from: path, to: `${path}C${i}` });
      const sub = treeToNodesEdges(child, `${path}C${i}`);
      nodes.push(...sub.nodes);
      edges.push(...sub.edges);
    });
  }
  return { nodes, edges };
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

  const frames = [];
  trace.forEach((record) => {
    const node = record.locals ? record.locals[varName] : undefined;
    if (!isTreeNode(node)) return;
    const { nodes, edges } = treeToNodesEdges(node, 'root');
    frames.push({
      data: { nodes, edges },
      states: {},
      log: `Line ${record.line}: visiting ${varName}`,
      type: 'info',
    });
  });

  if (frames.length === 0) return null;
  frames[frames.length - 1].type = 'done';
  return frames;
}
```

- [ ] **Step 4: Implement the graph adapter**

Create `client/src/utils/traceAdapters/graphAdapter.js`:

```js
function toVisitedSet(value) {
  if (Array.isArray(value)) return new Set(value.map(String));
  if (value && typeof value === 'object') {
    return new Set(Object.entries(value).filter(([, v]) => v).map(([k]) => k));
  }
  return new Set();
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

  const allNodes = new Set();
  trace.forEach((record) => {
    const raw = record.locals ? record.locals[varName] : undefined;
    if (raw === undefined) return;
    toVisitedSet(raw).forEach((n) => allNodes.add(n));
  });

  const frames = [];
  trace.forEach((record) => {
    const raw = record.locals ? record.locals[varName] : undefined;
    if (raw === undefined) return;
    const visited = toVisitedSet(raw);
    const states = {};
    allNodes.forEach((n) => {
      states[n] = visited.has(n) ? 'sorted' : 'info';
    });
    frames.push({
      data: { nodes: [...allNodes] },
      states,
      log: `Line ${record.line}: visited = {${[...visited].join(', ')}}`,
      type: 'info',
    });
  });

  if (frames.length === 0) return null;
  frames[frames.length - 1].type = 'done';
  return frames;
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run (from `client/`): `npm run test -- src/utils/traceAdapters/__tests__/treeAdapter.test.js src/utils/traceAdapters/__tests__/graphAdapter.test.js`
Expected: PASS, 2 + 2 tests passed.

- [ ] **Step 6: Commit**

```bash
git add client/src/utils/traceAdapters/treeAdapter.js client/src/utils/traceAdapters/graphAdapter.js client/src/utils/traceAdapters/__tests__/treeAdapter.test.js client/src/utils/traceAdapters/__tests__/graphAdapter.test.js
git commit -m "feat: add tree and graph trace adapters"
```

---

### Task 15: DP adapter + variable inspector fallback + dispatcher

**Files:**
- Create: `client/src/utils/traceAdapters/dpAdapter.js`
- Create: `client/src/utils/traceAdapters/variableInspectorAdapter.js`
- Create: `client/src/utils/traceAdapters/index.js`
- Test: `client/src/utils/traceAdapters/__tests__/dpAdapter.test.js`
- Test: `client/src/utils/traceAdapters/__tests__/variableInspectorAdapter.test.js`
- Test: `client/src/utils/traceAdapters/__tests__/index.test.js`

**Interfaces:**
- Consumes: every adapter from Tasks 11-14, plus the two new ones here.
- Produces: `adaptTrace(category: string|null, trace: object[]) -> { frames: frame[], visualizer: string }` — this is the single function the page (Task 22) calls. `visualizer` is one of `sorting|searching|recursion|linked-list|stack-queue|tree|graph|dp|variable-inspector`, and is exactly the value `VisualizerRouter` (Task 18) switches on. Also re-exports `capTrace` (Task 11) for convenience.

- [ ] **Step 1: Write the failing tests**

Create `client/src/utils/traceAdapters/__tests__/dpAdapter.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { adaptDpTrace } from '../dpAdapter.js';

describe('adaptDpTrace', () => {
  it('returns null when no 2D numeric array local is found', () => {
    const trace = [{ line: 1, locals: { x: 1 }, callDepth: 0, event: 'step' }];
    expect(adaptDpTrace(trace)).toBeNull();
  });

  it('tracks a 2D numeric array local as a grid over time', () => {
    const trace = [
      { line: 1, locals: { dp: [[0, 0], [0, 1]] }, callDepth: 0, event: 'step' },
      { line: 2, locals: { dp: [[0, 1], [1, 1]] }, callDepth: 0, event: 'step' },
    ];
    const frames = adaptDpTrace(trace);
    expect(frames).toHaveLength(2);
    expect(frames[1].data).toEqual([[0, 1], [1, 1]]);
    expect(frames[1].type).toBe('done');
  });
});
```

Create `client/src/utils/traceAdapters/__tests__/variableInspectorAdapter.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { adaptVariableInspectorTrace } from '../variableInspectorAdapter.js';

describe('adaptVariableInspectorTrace', () => {
  it('never returns null, even for an empty trace', () => {
    const frames = adaptVariableInspectorTrace([]);
    expect(frames.length).toBeGreaterThanOrEqual(1);
  });

  it('reshapes every trace record into a frame carrying its raw locals', () => {
    const trace = [
      { line: 1, locals: { a: 1 }, callDepth: 0, event: 'step' },
      { line: 2, locals: { a: 2 }, callDepth: 0, event: 'step' },
    ];
    const frames = adaptVariableInspectorTrace(trace);
    expect(frames).toHaveLength(2);
    expect(frames[0].data).toEqual({ a: 1 });
    expect(frames[1].type).toBe('done');
  });
});
```

Create `client/src/utils/traceAdapters/__tests__/index.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { adaptTrace } from '../index.js';

describe('adaptTrace dispatcher', () => {
  it('routes to the matching category adapter when a signal is found', () => {
    const trace = [
      { line: 1, locals: { arr: [2, 1] }, callDepth: 0, event: 'step' },
      { line: 2, locals: { arr: [1, 2] }, callDepth: 0, event: 'step' },
    ];
    const result = adaptTrace('sorting', trace);
    expect(result.visualizer).toBe('sorting');
    expect(result.frames.length).toBeGreaterThan(0);
  });

  it('falls back to the variable inspector when the category adapter finds nothing', () => {
    const trace = [{ line: 1, locals: { unrelated: true }, callDepth: 0, event: 'step' }];
    const result = adaptTrace('graph', trace);
    expect(result.visualizer).toBe('variable-inspector');
    expect(result.frames.length).toBeGreaterThan(0);
  });

  it('falls back to the variable inspector for an unknown/null category', () => {
    const trace = [{ line: 1, locals: { a: 1 }, callDepth: 0, event: 'step' }];
    const result = adaptTrace(null, trace);
    expect(result.visualizer).toBe('variable-inspector');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run (from `client/`): `npm run test -- src/utils/traceAdapters/__tests__/dpAdapter.test.js src/utils/traceAdapters/__tests__/variableInspectorAdapter.test.js src/utils/traceAdapters/__tests__/index.test.js`
Expected: FAIL — none of the three modules exist yet.

- [ ] **Step 3: Implement the DP adapter**

Create `client/src/utils/traceAdapters/dpAdapter.js`:

```js
function is2DNumericArray(value) {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((row) => Array.isArray(row) && row.every((cell) => typeof cell === 'number'))
  );
}

export function adaptDpTrace(trace) {
  if (!Array.isArray(trace) || trace.length === 0) return null;

  let varName = null;
  for (const record of trace) {
    for (const [name, value] of Object.entries(record.locals || {})) {
      if (is2DNumericArray(value)) {
        varName = name;
        break;
      }
    }
    if (varName) break;
  }
  if (!varName) return null;

  const frames = [];
  trace.forEach((record) => {
    const grid = record.locals ? record.locals[varName] : undefined;
    if (!is2DNumericArray(grid)) return;
    frames.push({
      data: grid.map((row) => [...row]),
      states: {},
      log: `Line ${record.line}: updated ${varName}`,
      type: 'info',
    });
  });

  if (frames.length === 0) return null;
  frames[frames.length - 1].type = 'done';
  return frames;
}
```

- [ ] **Step 4: Implement the variable inspector fallback**

Create `client/src/utils/traceAdapters/variableInspectorAdapter.js`:

```js
export function adaptVariableInspectorTrace(trace) {
  if (!Array.isArray(trace) || trace.length === 0) {
    return [{ data: {}, states: {}, log: 'No trace data captured.', type: 'info' }];
  }

  const frames = trace.map((record) => ({
    data: record.locals || {},
    states: {},
    log: `Line ${record.line}${record.functionName ? ` (${record.functionName})` : ''}: ${Object.entries(
      record.locals || {}
    )
      .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
      .join(', ')}`,
    type: 'info',
  }));

  frames[frames.length - 1].type = 'done';
  return frames;
}
```

- [ ] **Step 5: Implement the dispatcher**

Create `client/src/utils/traceAdapters/index.js`:

```js
export { capTrace } from './capTrace.js';

import { adaptArrayTrace } from './sortingSearchingAdapter.js';
import { adaptRecursionTrace } from './recursionAdapter.js';
import { adaptLinkedListTrace } from './linkedListAdapter.js';
import { adaptStackQueueTrace } from './stackQueueAdapter.js';
import { adaptTreeTrace } from './treeAdapter.js';
import { adaptGraphTrace } from './graphAdapter.js';
import { adaptDpTrace } from './dpAdapter.js';
import { adaptVariableInspectorTrace } from './variableInspectorAdapter.js';

const ADAPTERS_BY_CATEGORY = {
  sorting: adaptArrayTrace,
  searching: adaptArrayTrace,
  recursion: adaptRecursionTrace,
  'linked-list': adaptLinkedListTrace,
  'stack-queue': adaptStackQueueTrace,
  tree: adaptTreeTrace,
  graph: adaptGraphTrace,
  dp: adaptDpTrace,
};

export function adaptTrace(category, trace) {
  const adapter = category ? ADAPTERS_BY_CATEGORY[category] : null;
  const result = adapter ? adapter(trace) : null;

  if (result && result.length > 0) {
    return { frames: result, visualizer: category };
  }
  return { frames: adaptVariableInspectorTrace(trace), visualizer: 'variable-inspector' };
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run (from `client/`): `npm run test -- src/utils/traceAdapters/__tests__/dpAdapter.test.js src/utils/traceAdapters/__tests__/variableInspectorAdapter.test.js src/utils/traceAdapters/__tests__/index.test.js`
Expected: PASS, 2 + 2 + 3 tests passed.

- [ ] **Step 7: Run the full adapter test suite together**

Run (from `client/`): `npm run test -- src/utils/traceAdapters`
Expected: all adapter tests (Tasks 11-15) pass together.

- [ ] **Step 8: Commit**

```bash
git add client/src/utils/traceAdapters/dpAdapter.js client/src/utils/traceAdapters/variableInspectorAdapter.js client/src/utils/traceAdapters/index.js client/src/utils/traceAdapters/__tests__/dpAdapter.test.js client/src/utils/traceAdapters/__tests__/variableInspectorAdapter.test.js client/src/utils/traceAdapters/__tests__/index.test.js
git commit -m "feat: add DP adapter, variable-inspector fallback, and adapter dispatcher"
```

---

## Phase 5 — Visualizer components

### Task 16: CallStackViz, LinkedListViz, StackQueueViz

**Files:**
- Create: `client/src/components/visualize/CallStackViz.jsx`
- Create: `client/src/components/visualize/LinkedListViz.jsx`
- Create: `client/src/components/visualize/StackQueueViz.jsx`
- Test: `client/src/components/visualize/__tests__/listBasedVisualizers.test.jsx`

**Interfaces:**
- Consumes: a single `frame` prop shaped like the adapter output frames from Tasks 12-13 (`{ data, states, log, type }`).
- Produces: three components, each rendering `frame.data` (a call-stack array, a value list, or a value list respectively) without crashing on empty data.

- [ ] **Step 1: Write the failing test**

Create `client/src/components/visualize/__tests__/listBasedVisualizers.test.jsx`:

```jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CallStackViz from '../CallStackViz.jsx';
import LinkedListViz from '../LinkedListViz.jsx';
import StackQueueViz from '../StackQueueViz.jsx';

describe('CallStackViz', () => {
  it('shows an empty state with no frame data', () => {
    render(<CallStackViz frame={{ data: [] }} />);
    expect(screen.getByText(/call stack is empty/i)).toBeInTheDocument();
  });

  it('renders each call stack entry with its name and args', () => {
    render(<CallStackViz frame={{ data: [{ name: 'factorial', args: { n: 3 } }] }} />);
    expect(screen.getByText('factorial')).toBeInTheDocument();
    expect(screen.getByText(/n=3/)).toBeInTheDocument();
  });
});

describe('LinkedListViz', () => {
  it('shows an empty state with no values', () => {
    render(<LinkedListViz frame={{ data: [] }} />);
    expect(screen.getByText(/list is empty/i)).toBeInTheDocument();
  });

  it('renders each value in the chain', () => {
    render(<LinkedListViz frame={{ data: [1, 2, 3] }} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});

describe('StackQueueViz', () => {
  it('shows an empty state with no values', () => {
    render(<StackQueueViz frame={{ data: [] }} />);
    expect(screen.getByText(/empty/i)).toBeInTheDocument();
  });

  it('renders each value', () => {
    render(<StackQueueViz frame={{ data: [10, 20] }} />);
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run (from `client/`): `npm run test -- src/components/visualize/__tests__/listBasedVisualizers.test.jsx`
Expected: FAIL — none of the three components exist.

- [ ] **Step 3: Implement CallStackViz**

Create `client/src/components/visualize/CallStackViz.jsx`:

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
      {stack.map((call, i) => (
        <div
          key={i}
          style={{
            padding: '8px 14px', borderRadius: 8, background: 'var(--surface2)',
            border: '1px solid var(--border2)', fontFamily: "'JetBrains Mono', monospace", fontSize: 13,
          }}
        >
          <strong style={{ color: 'var(--cyan)' }}>{call.name}</strong>
          {'('}
          {Object.entries(call.args || {})
            .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
            .join(', ')}
          {')'}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Implement LinkedListViz**

Create `client/src/components/visualize/LinkedListViz.jsx`:

```jsx
export default function LinkedListViz({ frame }) {
  const values = (frame && frame.data) || [];
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
              padding: '10px 16px', borderRadius: 8, background: 'var(--surface2)',
              border: '1px solid var(--cyan)', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
            }}
          >
            {String(v)}
          </div>
          {i < values.length - 1 && <span style={{ color: 'var(--muted)' }}>&rarr;</span>}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Implement StackQueueViz**

Create `client/src/components/visualize/StackQueueViz.jsx`:

```jsx
export default function StackQueueViz({ frame }) {
  const values = (frame && frame.data) || [];
  return (
    <div
      style={{
        display: 'flex', flexDirection: 'column-reverse', gap: 4, padding: 16,
        background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12,
        minHeight: 220, alignItems: 'center',
      }}
    >
      {values.length === 0 && <div style={{ color: 'var(--muted)', fontSize: 13 }}>Empty</div>}
      {values.map((v, i) => (
        <div
          key={i}
          style={{
            padding: '8px 20px', borderRadius: 8, background: 'var(--surface2)',
            border: '1px solid var(--orange)', fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700, minWidth: 60, textAlign: 'center',
          }}
        >
          {String(v)}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 6: Run test to verify it passes**

Run (from `client/`): `npm run test -- src/components/visualize/__tests__/listBasedVisualizers.test.jsx`
Expected: PASS, 6 tests passed.

- [ ] **Step 7: Commit**

```bash
git add client/src/components/visualize/CallStackViz.jsx client/src/components/visualize/LinkedListViz.jsx client/src/components/visualize/StackQueueViz.jsx client/src/components/visualize/__tests__/listBasedVisualizers.test.jsx
git commit -m "feat: add call stack, linked list, and stack/queue visualizer components"
```

---

### Task 17: TreeViz + GraphTraceViz

**Files:**
- Create: `client/src/components/visualize/TreeViz.jsx`
- Create: `client/src/components/visualize/GraphTraceViz.jsx`
- Test: `client/src/components/visualize/__tests__/svgVisualizers.test.jsx`

**Interfaces:**
- Consumes: `frame.data = { nodes, edges }` (Task 14, tree adapter) for `TreeViz`; `frame.data = { nodes }` + `frame.states` (Task 14, graph adapter) for `GraphTraceViz`.

- [ ] **Step 1: Write the failing test**

Create `client/src/components/visualize/__tests__/svgVisualizers.test.jsx`:

```jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TreeViz from '../TreeViz.jsx';
import GraphTraceViz from '../GraphTraceViz.jsx';

describe('TreeViz', () => {
  it('renders a labeled circle for each node', () => {
    const frame = {
      data: {
        nodes: [{ id: 'root', label: '5' }, { id: 'rootL', label: '3' }],
        edges: [{ from: 'root', to: 'rootL' }],
      },
    };
    render(<TreeViz frame={frame} />);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders without crashing when there is no data', () => {
    render(<TreeViz frame={{ data: { nodes: [], edges: [] } }} />);
  });
});

describe('GraphTraceViz', () => {
  it('renders a labeled circle for each node', () => {
    const frame = { data: { nodes: ['a', 'b'] }, states: { a: 'sorted', b: 'info' } };
    render(<GraphTraceViz frame={frame} />);
    expect(screen.getByText('a')).toBeInTheDocument();
    expect(screen.getByText('b')).toBeInTheDocument();
  });

  it('renders without crashing when there is no data', () => {
    render(<GraphTraceViz frame={{ data: { nodes: [] }, states: {} }} />);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run (from `client/`): `npm run test -- src/components/visualize/__tests__/svgVisualizers.test.jsx`
Expected: FAIL — neither component exists.

- [ ] **Step 3: Implement TreeViz**

Create `client/src/components/visualize/TreeViz.jsx`:

```jsx
function computePositions(nodes) {
  const byDepth = {};
  nodes.forEach((n) => {
    const depth = n.id === 'root' ? 0 : n.id.replace('root', '').length;
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
          return (
            <g key={n.id}>
              <circle cx={pos.x} cy={pos.y} r={18} fill="var(--surface2)" stroke="var(--cyan)" strokeWidth={2} />
              <text x={pos.x} y={pos.y + 4} textAnchor="middle" fontSize={11} fontWeight="bold" fontFamily="monospace" fill="var(--text)">
                {n.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
```

- [ ] **Step 4: Implement GraphTraceViz**

Create `client/src/components/visualize/GraphTraceViz.jsx`:

```jsx
export default function GraphTraceViz({ frame }) {
  const nodes = (frame && frame.data && frame.data.nodes) || [];
  const states = (frame && frame.states) || {};
  const radius = 90;
  const cx = 140;
  const cy = 140;

  return (
    <div style={{ padding: 16, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12 }}>
      <svg width={280} height={280}>
        {nodes.map((n, i) => {
          const angle = (2 * Math.PI * i) / Math.max(nodes.length, 1);
          const x = cx + radius * Math.cos(angle);
          const y = cy + radius * Math.sin(angle);
          const visited = states[n] === 'sorted';
          return (
            <g key={n}>
              <circle cx={x} cy={y} r={16} fill={visited ? 'var(--green)' : 'var(--surface2)'} stroke="var(--border2)" strokeWidth={2} />
              <text x={x} y={y + 4} textAnchor="middle" fontSize={10} fontWeight="bold" fontFamily="monospace" fill={visited ? '#fff' : 'var(--text)'}>
                {n}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run (from `client/`): `npm run test -- src/components/visualize/__tests__/svgVisualizers.test.jsx`
Expected: PASS, 4 tests passed.

- [ ] **Step 6: Commit**

```bash
git add client/src/components/visualize/TreeViz.jsx client/src/components/visualize/GraphTraceViz.jsx client/src/components/visualize/__tests__/svgVisualizers.test.jsx
git commit -m "feat: add tree and graph visualizer components"
```

---

### Task 18: DPGridViz, VariableInspectorViz, VisualizerRouter

**Files:**
- Create: `client/src/components/visualize/DPGridViz.jsx`
- Create: `client/src/components/visualize/VariableInspectorViz.jsx`
- Create: `client/src/components/visualize/VisualizerRouter.jsx`
- Test: `client/src/components/visualize/__tests__/gridAndRouter.test.jsx`

**Interfaces:**
- Consumes: `frame.data` as a 2D array (Task 15, DP adapter) for `DPGridViz`; `frame.data` as a plain object of variable values (Task 15, variable-inspector adapter) for `VariableInspectorViz`.
- Produces: `VisualizerRouter({ visualizer, frame })` — routes to `CubeVisualizer` (existing, reused for `sorting`/`searching`) or one of the 7 new components based on the `visualizer` string produced by `adaptTrace` (Task 15).

- [ ] **Step 1: Write the failing test**

Create `client/src/components/visualize/__tests__/gridAndRouter.test.jsx`:

```jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DPGridViz from '../DPGridViz.jsx';
import VariableInspectorViz from '../VariableInspectorViz.jsx';
import VisualizerRouter from '../VisualizerRouter.jsx';

describe('DPGridViz', () => {
  it('renders a table cell for each grid value', () => {
    render(<DPGridViz frame={{ data: [[0, 1], [1, 2]] }} />);
    expect(screen.getAllByText('1')).toHaveLength(2);
  });
});

describe('VariableInspectorViz', () => {
  it('shows an empty state with no variables', () => {
    render(<VariableInspectorViz frame={{ data: {} }} />);
    expect(screen.getByText(/no variables captured/i)).toBeInTheDocument();
  });

  it('renders each variable name and value', () => {
    render(<VariableInspectorViz frame={{ data: { count: 5 } }} />);
    expect(screen.getByText('count')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });
});

describe('VisualizerRouter', () => {
  it('returns null when there is no current frame', () => {
    const { container } = render(<VisualizerRouter visualizer="sorting" frame={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('routes recursion to CallStackViz output', () => {
    render(<VisualizerRouter visualizer="recursion" frame={{ data: [] }} />);
    expect(screen.getByText(/call stack is empty/i)).toBeInTheDocument();
  });

  it('routes an unknown visualizer to the variable inspector', () => {
    render(<VisualizerRouter visualizer="variable-inspector" frame={{ data: {} }} />);
    expect(screen.getByText(/no variables captured/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run (from `client/`): `npm run test -- src/components/visualize/__tests__/gridAndRouter.test.jsx`
Expected: FAIL — none of the three modules exist.

- [ ] **Step 3: Implement DPGridViz**

Create `client/src/components/visualize/DPGridViz.jsx`:

```jsx
export default function DPGridViz({ frame }) {
  const grid = (frame && frame.data) || [];
  return (
    <div style={{ padding: 16, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'auto' }}>
      <table style={{ borderCollapse: 'collapse' }}>
        <tbody>
          {grid.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  style={{
                    border: '1px solid var(--border2)', padding: '6px 10px',
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
                    background: 'var(--surface2)', textAlign: 'center', minWidth: 32,
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 4: Implement VariableInspectorViz**

Create `client/src/components/visualize/VariableInspectorViz.jsx`:

```jsx
export default function VariableInspectorViz({ frame }) {
  const vars = (frame && frame.data) || {};
  const entries = Object.entries(vars);
  return (
    <div style={{ padding: 16, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, minHeight: 160 }}>
      {entries.length === 0 && <div style={{ color: 'var(--muted)', fontSize: 13 }}>No variables captured at this step</div>}
      {entries.map(([name, value]) => (
        <div
          key={name}
          style={{
            display: 'flex', gap: 10, padding: '6px 0', borderBottom: '1px solid var(--border)',
            fontFamily: "'JetBrains Mono', monospace", fontSize: 13,
          }}
        >
          <span style={{ color: 'var(--cyan)', fontWeight: 700, minWidth: 90 }}>{name}</span>
          <span style={{ color: 'var(--text)' }}>{JSON.stringify(value)}</span>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Implement VisualizerRouter**

Create `client/src/components/visualize/VisualizerRouter.jsx`:

```jsx
import CubeVisualizer from '../CubeVisualizer.jsx';
import CallStackViz from './CallStackViz.jsx';
import LinkedListViz from './LinkedListViz.jsx';
import StackQueueViz from './StackQueueViz.jsx';
import TreeViz from './TreeViz.jsx';
import GraphTraceViz from './GraphTraceViz.jsx';
import DPGridViz from './DPGridViz.jsx';
import VariableInspectorViz from './VariableInspectorViz.jsx';

export default function VisualizerRouter({ visualizer, frame }) {
  if (!frame) return null;

  switch (visualizer) {
    case 'sorting':
    case 'searching':
      return <CubeVisualizer array={frame.data} states={frame.states} />;
    case 'recursion':
      return <CallStackViz frame={frame} />;
    case 'linked-list':
      return <LinkedListViz frame={frame} />;
    case 'stack-queue':
      return <StackQueueViz frame={frame} />;
    case 'tree':
      return <TreeViz frame={frame} />;
    case 'graph':
      return <GraphTraceViz frame={frame} />;
    case 'dp':
      return <DPGridViz frame={frame} />;
    default:
      return <VariableInspectorViz frame={frame} />;
  }
}
```

- [ ] **Step 6: Run test to verify it passes**

Run (from `client/`): `npm run test -- src/components/visualize/__tests__/gridAndRouter.test.jsx`
Expected: PASS, 6 tests passed.

- [ ] **Step 7: Run the full visualizer component suite together**

Run (from `client/`): `npm run test -- src/components/visualize`
Expected: all component tests (Tasks 16-18) pass together.

- [ ] **Step 8: Commit**

```bash
git add client/src/components/visualize/DPGridViz.jsx client/src/components/visualize/VariableInspectorViz.jsx client/src/components/visualize/VisualizerRouter.jsx client/src/components/visualize/__tests__/gridAndRouter.test.jsx
git commit -m "feat: add DP grid, variable inspector, and visualizer router components"
```

---

## Phase 6 — Page, sidebar, and route integration

### Task 19: Language detection heuristic + code editor panel

**Files:**
- Create: `client/src/utils/detectLanguage.js`
- Create: `client/src/components/visualize/CodeEditorPanel.jsx`
- Test: `client/src/utils/__tests__/detectLanguage.test.js`
- Test: `client/src/components/visualize/__tests__/CodeEditorPanel.test.jsx`

**Interfaces:**
- Produces: `detectLanguage(code: string) -> 'javascript'|'python'|'unknown'` and `<CodeEditorPanel code={string} onChange={(newCode: string) => void} />`.

- [ ] **Step 1: Write the failing tests**

Create `client/src/utils/__tests__/detectLanguage.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { detectLanguage } from '../detectLanguage.js';

describe('detectLanguage', () => {
  it('detects JavaScript from function/brace/semicolon syntax', () => {
    const code = 'function add(a, b) {\n  return a + b;\n}';
    expect(detectLanguage(code)).toBe('javascript');
  });

  it('detects Python from def/colon/indentation syntax', () => {
    const code = 'def add(a, b):\n    return a + b';
    expect(detectLanguage(code)).toBe('python');
  });

  it('returns unknown for empty input', () => {
    expect(detectLanguage('')).toBe('unknown');
  });

  it('returns unknown for text with no recognizable signal', () => {
    expect(detectLanguage('hello world')).toBe('unknown');
  });
});
```

Create `client/src/components/visualize/__tests__/CodeEditorPanel.test.jsx`:

```jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CodeEditorPanel from '../CodeEditorPanel.jsx';

describe('CodeEditorPanel', () => {
  it('renders the current code in the textarea', () => {
    render(<CodeEditorPanel code="let x = 1;" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toHaveValue('let x = 1;');
  });

  it('renders one line-number row per line', () => {
    render(<CodeEditorPanel code={'a\nb\nc'} onChange={() => {}} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('calls onChange with the new value when edited', () => {
    const onChange = vi.fn();
    render(<CodeEditorPanel code="a" onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'ab' } });
    expect(onChange).toHaveBeenCalledWith('ab');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run (from `client/`): `npm run test -- src/utils/__tests__/detectLanguage.test.js src/components/visualize/__tests__/CodeEditorPanel.test.jsx`
Expected: FAIL — neither module exists.

- [ ] **Step 3: Implement detectLanguage**

Create `client/src/utils/detectLanguage.js`:

```js
export function detectLanguage(code) {
  if (!code || typeof code !== 'string' || !code.trim()) return 'unknown';

  const pythonScore =
    (/\bdef\s+\w+\s*\(.*\):/.test(code) ? 2 : 0) +
    (/:\s*$/m.test(code) ? 1 : 0) +
    (/\bself\b/.test(code) ? 1 : 0) +
    (/\belif\b/.test(code) ? 2 : 0) +
    (code.includes(';') ? -1 : 0) +
    (code.includes('{') ? -1 : 0);

  const jsScore =
    (/\bfunction\s*\w*\s*\(/.test(code) ? 2 : 0) +
    (/\b(const|let|var)\b/.test(code) ? 1 : 0) +
    (/=>/.test(code) ? 1 : 0) +
    (code.includes('{') ? 1 : 0) +
    (code.includes(';') ? 1 : 0);

  if (pythonScore <= 0 && jsScore <= 0) return 'unknown';
  return pythonScore > jsScore ? 'python' : 'javascript';
}
```

- [ ] **Step 4: Implement CodeEditorPanel**

Create `client/src/components/visualize/CodeEditorPanel.jsx`:

```jsx
export default function CodeEditorPanel({ code, onChange }) {
  const lines = code.split('\n');
  return (
    <div
      style={{
        display: 'flex', background: 'var(--surface-container-lowest)',
        border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden',
        fontFamily: "'JetBrains Mono', monospace", fontSize: 13,
      }}
    >
      <div
        style={{
          padding: '12px 8px', textAlign: 'right', color: 'var(--muted)',
          userSelect: 'none', background: 'var(--surface)', minWidth: 36,
        }}
      >
        {lines.map((_, i) => (
          <div key={i} style={{ lineHeight: '1.6' }}>
            {i + 1}
          </div>
        ))}
      </div>
      <textarea
        value={code}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        style={{
          flex: 1, minHeight: 240, padding: 12, background: 'transparent', color: 'var(--text)',
          border: 'none', outline: 'none', resize: 'vertical', lineHeight: '1.6',
          fontFamily: 'inherit', fontSize: 'inherit',
        }}
      />
    </div>
  );
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run (from `client/`): `npm run test -- src/utils/__tests__/detectLanguage.test.js src/components/visualize/__tests__/CodeEditorPanel.test.jsx`
Expected: PASS, 4 + 3 tests passed.

- [ ] **Step 6: Commit**

```bash
git add client/src/utils/detectLanguage.js client/src/components/visualize/CodeEditorPanel.jsx client/src/utils/__tests__/detectLanguage.test.js client/src/components/visualize/__tests__/CodeEditorPanel.test.jsx
git commit -m "feat: add language detection heuristic and code editor panel"
```

---

### Task 20: VisualizeMyCodePage — main integration

**Files:**
- Create: `client/src/pages/visualize/VisualizeMyCodePage.jsx`
- Test: `client/src/pages/visualize/__tests__/VisualizeMyCodePage.test.jsx`

**Interfaces:**
- Consumes: `detectLanguage` (Task 19), `detectAlgorithm` (Task 6), `adaptTrace`/`capTrace` (Task 15), `VisualizerRouter` (Task 18), `CodeEditorPanel` (Task 19), `runJsTrace`/`runPyTrace` (Tasks 9-10, dynamically imported), `AppShell` and `StepLog` (existing components).
- Produces: default-exported `VisualizeMyCodePage` React component, to be wired into routing in Task 24.

**Testing note:** `runJsTrace`/`runPyTrace` are dynamically imported inside the click handler specifically so they can be mocked with `vi.mock` in this test without needing a real Worker — this keeps the page's orchestration logic (state transitions, error handling, playback) fully testable while the actual worker execution remains manually verified (Task 25).

- [ ] **Step 1: Write the failing test**

Create `client/src/pages/visualize/__tests__/VisualizeMyCodePage.test.jsx`:

```jsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import VisualizeMyCodePage from '../VisualizeMyCodePage.jsx';

vi.mock('../../../utils/tracer/runJsTrace.js', () => ({
  runJsTrace: vi.fn(),
}));

import { runJsTrace } from '../../../utils/tracer/runJsTrace.js';

function renderPage() {
  return render(
    <MemoryRouter>
      <VisualizeMyCodePage />
    </MemoryRouter>
  );
}

beforeEach(() => {
  runJsTrace.mockReset();
});

describe('VisualizeMyCodePage', () => {
  it('renders the default starter code in the editor', () => {
    renderPage();
    expect(screen.getByRole('textbox').value).toContain('bubbleSort');
  });

  it('runs detection + tracing and shows playback controls once frames exist', async () => {
    runJsTrace.mockResolvedValue({
      trace: [
        { line: 1, locals: { arr: [3, 1] }, callDepth: 0, event: 'step' },
        { line: 2, locals: { arr: [1, 3] }, callDepth: 0, event: 'step' },
      ],
      truncated: false,
    });

    renderPage();
    fireEvent.click(screen.getByText('Detect & Visualize'));

    await waitFor(() => expect(screen.getByText('▶ Play')).toBeInTheDocument());
    expect(screen.getByText(/Step:/)).toBeInTheDocument();
  });

  it('shows an error message instead of a fake animation when execution fails', async () => {
    runJsTrace.mockRejectedValue(new Error('Unexpected token'));

    renderPage();
    fireEvent.click(screen.getByText('Detect & Visualize'));

    await waitFor(() => expect(screen.getByText('Unexpected token')).toBeInTheDocument());
    expect(screen.queryByText('▶ Play')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run (from `client/`): `npm run test -- src/pages/visualize/__tests__/VisualizeMyCodePage.test.jsx`
Expected: FAIL — `VisualizeMyCodePage.jsx` does not exist.

- [ ] **Step 3: Implement the page**

Create `client/src/pages/visualize/VisualizeMyCodePage.jsx`:

```jsx
import { useState, useCallback, useRef } from 'react';
import AppShell from '../../components/AppShell.jsx';
import StepLog from '../../components/StepLog.jsx';
import VisualizerRouter from '../../components/visualize/VisualizerRouter.jsx';
import CodeEditorPanel from '../../components/visualize/CodeEditorPanel.jsx';
import { detectLanguage } from '../../utils/detectLanguage.js';
import { detectAlgorithm } from '../../utils/algoDetector.js';
import { adaptTrace, capTrace } from '../../utils/traceAdapters/index.js';

const CATEGORY_LABELS = {
  sorting: 'Sorting',
  searching: 'Searching',
  recursion: 'Recursion',
  'linked-list': 'Linked List',
  'stack-queue': 'Stack / Queue',
  tree: 'Tree',
  graph: 'Graph',
  dp: 'Dynamic Programming',
};

const DEFAULT_CODE = `function bubbleSort(arr) {
  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        const temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
  return arr;
}
bubbleSort([5, 2, 8, 1, 9, 3]);`;

export default function VisualizeMyCodePage() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [detection, setDetection] = useState(null);
  const [manualCategory, setManualCategory] = useState(null);
  const [visualizer, setVisualizer] = useState(null);
  const [frames, setFrames] = useState([]);
  const [frameIdx, setFrameIdx] = useState(-1);
  const [truncated, setTruncated] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const playRef = useRef(false);

  const handleDetectAndVisualize = useCallback(async () => {
    setStatus('running');
    setErrorMessage('');
    setFrames([]);
    setFrameIdx(-1);
    setPlaying(false);
    playRef.current = false;

    const lang = detectLanguage(code);
    if (lang !== 'javascript' && lang !== 'python') {
      setStatus('error');
      setErrorMessage(
        'Full visualization currently supports JavaScript and Python. Paste code in one of these languages for the smoothest experience.'
      );
      return;
    }

    const detected = detectAlgorithm(code);
    setDetection(detected);
    const category = manualCategory || detected.category;

    try {
      const runTrace =
        lang === 'javascript'
          ? (await import('../../utils/tracer/runJsTrace.js')).runJsTrace
          : (await import('../../utils/tracer/runPyTrace.js')).runPyTrace;

      const { trace, truncated: wasTruncatedByWorker } = await runTrace(code);
      const { frames: cappedTrace, truncated: wasCapped } = capTrace(trace, 3000);
      const { frames: adaptedFrames, visualizer: chosenVisualizer } = adaptTrace(category, cappedTrace);

      setFrames(adaptedFrames);
      setFrameIdx(0);
      setVisualizer(chosenVisualizer);
      setTruncated(wasTruncatedByWorker || wasCapped);
      setStatus('ready');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err.message || 'Execution failed. Check your code for errors.');
    }
  }, [code, manualCategory]);

  const play = useCallback(async () => {
    if (playing || frames.length === 0) return;
    setPlaying(true);
    playRef.current = true;
    let idx = frameIdx >= frames.length - 1 ? 0 : frameIdx;
    while (idx < frames.length - 1 && playRef.current) {
      idx += 1;
      setFrameIdx(idx);
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => setTimeout(resolve, Math.round(400 / speed)));
    }
    playRef.current = false;
    setPlaying(false);
  }, [playing, frames, frameIdx, speed]);

  const stop = useCallback(() => {
    playRef.current = false;
    setPlaying(false);
  }, []);

  const next = useCallback(() => {
    if (playing || frameIdx >= frames.length - 1) return;
    setFrameIdx(frameIdx + 1);
  }, [playing, frameIdx, frames]);

  const prev = useCallback(() => {
    if (playing || frameIdx <= 0) return;
    setFrameIdx(frameIdx - 1);
  }, [playing, frameIdx]);

  const currentFrame = frameIdx >= 0 ? frames[frameIdx] : null;
  const stepLog = frames.slice(0, frameIdx + 1).map((f) => ({ text: f.log, type: f.type }));

  return (
    <AppShell breadcrumb="Visualize My Code">
      <div className="section-title">Visualize My Code</div>
      <div className="section-sub">
        Paste JavaScript or Python — we&apos;ll detect the algorithm and animate exactly what your code does.
      </div>

      <CodeEditorPanel code={code} onChange={setCode} />

      <div className="controls-bar" style={{ marginTop: 12, marginBottom: 12 }}>
        <button className="btn btn-primary" onClick={handleDetectAndVisualize} disabled={status === 'running'}>
          {status === 'running' ? 'Running...' : 'Detect & Visualize'}
        </button>
        {frames.length > 0 && (
          <>
            <button className="btn btn-primary" onClick={play} disabled={playing}>
              &#9654; Play
            </button>
            <button className="btn btn-danger" onClick={stop} disabled={!playing}>
              &#9632; Stop
            </button>
            <button className="btn btn-ghost" onClick={prev} disabled={playing || frameIdx <= 0}>
              &#9664; Prev
            </button>
            <button className="btn btn-ghost" onClick={next} disabled={playing || frameIdx >= frames.length - 1}>
              Next &#9654;
            </button>
            <label>Speed</label>
            <select className="size-select" value={speed} onChange={(e) => setSpeed(+e.target.value)} disabled={playing}>
              <option value={0.5}>0.5x</option>
              <option value={1}>1x</option>
              <option value={2}>2x</option>
              <option value={4}>4x</option>
            </select>
            <span style={{ marginLeft: 'auto', fontSize: 12 }}>
              Step: <strong style={{ color: 'var(--cyan)' }}>{frameIdx + 1}</strong> / {frames.length}
            </span>
          </>
        )}
      </div>

      {status === 'error' && (
        <div
          style={{
            padding: 14, background: 'var(--surface2)', border: '1px solid var(--red, #e5484d)',
            borderRadius: 10, color: 'var(--red, #e5484d)', marginBottom: 12,
          }}
        >
          {errorMessage}
        </div>
      )}

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

      {truncated && (
        <div
          style={{
            padding: 10, background: 'var(--surface2)', border: '1px solid var(--orange)',
            borderRadius: 8, color: 'var(--orange)', fontSize: 12, marginBottom: 12,
          }}
        >
          Trace truncated at 3000 steps — try a smaller input for a complete animation.
        </div>
      )}

      {currentFrame && (
        <div className="viz-layout-3">
          <div className="viz-left">
            <div style={{ padding: 16, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12 }}>
              <strong>What&apos;s happening</strong>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 8 }}>{currentFrame.log}</p>
            </div>
          </div>
          <div className="viz-center">
            <VisualizerRouter visualizer={visualizer} frame={currentFrame} />
          </div>
          <div className="viz-right">
            <StepLog steps={stepLog} />
          </div>
        </div>
      )}
    </AppShell>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run (from `client/`): `npm run test -- src/pages/visualize/__tests__/VisualizeMyCodePage.test.jsx`
Expected: PASS, 3 tests passed.

- [ ] **Step 5: Commit**

```bash
git add client/src/pages/visualize/VisualizeMyCodePage.jsx client/src/pages/visualize/__tests__/VisualizeMyCodePage.test.jsx
git commit -m "feat: add Visualize My Code page integrating detection, tracing, and playback"
```

---

### Task 21: Sidebar entry

**Files:**
- Modify: `client/src/components/Sidebar.jsx`
- Test: `client/src/components/__tests__/Sidebar.test.jsx`

**Interfaces:**
- Consumes: existing `NAV` export and `Sidebar` default export from `Sidebar.jsx` (unchanged).
- Produces: a new link to `/visualize-my-code` rendered directly after the `NAV.map(...)` block and before `av-sidebar-footer`.

- [ ] **Step 1: Write the failing test**

Create `client/src/components/__tests__/Sidebar.test.jsx`:

```jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from '../Sidebar.jsx';

describe('Sidebar', () => {
  it('renders a link to Visualize My Code below the algorithm categories', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );
    const link = screen.getByRole('link', { name: /visualize my code/i });
    expect(link).toHaveAttribute('href', '/visualize-my-code');
  });

  it('still renders the Documentation and Support footer links', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );
    expect(screen.getByRole('link', { name: /documentation/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /support/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run (from `client/`): `npm run test -- src/components/__tests__/Sidebar.test.jsx`
Expected: FAIL — no "Visualize My Code" link exists yet.

- [ ] **Step 3: Add the sidebar entry**

In `client/src/components/Sidebar.jsx`, find this block (currently right after the `NAV.map` loop, inside `av-nav`):

```jsx
            {NAV.map((section) => (
              <SidebarItem key={section.key} section={section} location={location} />
            ))}
          </nav>
        </div>
```

Replace it with:

```jsx
            {NAV.map((section) => (
              <SidebarItem key={section.key} section={section} location={location} />
            ))}
            <Link
              className="av-nav-link"
              to="/visualize-my-code"
              style={{
                color: location.pathname === "/visualize-my-code" ? "var(--primary)" : undefined,
                fontWeight: location.pathname === "/visualize-my-code" ? 700 : 400,
                textDecoration: "none"
              }}
            >
              <span className="av-nav-icon"><Icon>auto_awesome</Icon></span>
              <span>Visualize My Code</span>
            </Link>
          </nav>
        </div>
```

- [ ] **Step 4: Run test to verify it passes**

Run (from `client/`): `npm run test -- src/components/__tests__/Sidebar.test.jsx`
Expected: PASS, 2 tests passed.

- [ ] **Step 5: Commit**

```bash
git add client/src/components/Sidebar.jsx client/src/components/__tests__/Sidebar.test.jsx
git commit -m "feat: add Visualize My Code sidebar entry"
```

---

### Task 22: Route wiring

**Files:**
- Modify: `client/src/App.jsx`

**Interfaces:**
- Consumes: `VisualizeMyCodePage` default export (Task 20).
- Produces: the app now serves `/visualize-my-code`.

- [ ] **Step 1: Add the import**

In `client/src/App.jsx`, after the existing `MLPage` import:

```js
import MLPage from "./pages/ml/MLPage";
```

add:

```js
import VisualizeMyCodePage from "./pages/visualize/VisualizeMyCodePage";
```

- [ ] **Step 2: Add the route**

In the `<Routes>` block, after the `/ml/:algo` route:

```jsx
      <Route path="/ml" element={<Navigate to="/ml/linear-regression" />} />
      <Route path="/ml/:algo" element={<MLPage />} />
```

add:

```jsx
      <Route path="/visualize-my-code" element={<VisualizeMyCodePage />} />
```

- [ ] **Step 3: Verify the app still builds**

Run (from `client/`): `npm run build`
Expected: build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add client/src/App.jsx
git commit -m "feat: wire up /visualize-my-code route"
```

---

### Task 23: Full automated test suite + lint pass

**Files:** none (verification-only task)

- [ ] **Step 1: Run the full test suite**

Run (from `client/`): `npm run test`
Expected: every test file from Tasks 1-21 passes (no failures, no skipped files).

- [ ] **Step 2: Run lint**

Run (from `client/`): `npm run lint`
Expected: no errors. If Acorn/astring-related or React-hooks lint warnings appear in the new `visualize`/`tracer`/`traceAdapters` files, fix them (e.g. add missing `useCallback` dependencies, remove unused imports) and rerun.

- [ ] **Step 3: Run the production build**

Run (from `client/`): `npm run build`
Expected: build succeeds. Confirm in the output that `pyodideWorker` and `jsWorker` are emitted as separate chunks (not inlined into the main bundle) — this is what keeps Pyodide's weight off every other page.

- [ ] **Step 4: Commit (only if lint fixes were needed)**

```bash
git add -A
git commit -m "chore: fix lint warnings in visualize-my-code feature"
```

---

### Task 24: Manual end-to-end verification

**Files:** none (manual verification task — no automated test can cover real Worker + Pyodide execution, per the testing notes in Tasks 9-10)

- [ ] **Step 1: Start the dev server**

Run (from `client/`): `npm run dev`

- [ ] **Step 2: Verify the sidebar entry and navigation**

Open the app, confirm "Visualize My Code" appears below the algorithm category list in the sidebar, and clicking it navigates to `/visualize-my-code` with the starter bubble sort code pre-filled.

- [ ] **Step 3: Verify JavaScript end-to-end**

Click "Detect & Visualize" with the default bubble sort code. Confirm: detection badge shows "Sorting" with a confidence percentage; Play/Stop/Prev/Next controls appear; clicking Play animates the array with visible swap highlighting; the step log fills in as frames advance; Prev/Next move one frame at a time when stopped.

- [ ] **Step 4: Verify Python end-to-end**

Replace the code with:

```python
def binary_search(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1

binary_search([1, 3, 5, 7, 9, 11], 7)
```

Click "Detect & Visualize". Confirm: a loading state is visible while Pyodide downloads (first run only, check the Network tab for the Pyodide WASM fetch), detection shows "Searching", and the animation reflects real `low`/`high`/`mid` narrowing.

- [ ] **Step 5: Verify unsupported-language handling**

Replace the code with a small Java snippet (e.g. `public class Foo { public static void main(String[] a) {} }`). Click "Detect & Visualize". Confirm the friendly "currently supports JavaScript and Python" message appears — not a crash, not a fake animation.

- [ ] **Step 6: Verify the fallback path**

Paste an unusual snippet with no clear category shape, e.g.:

```javascript
function mystery(x) {
  let total = 0;
  for (let i = 0; i < x; i++) {
    total += i * i;
  }
  return total;
}
mystery(5);
```

Confirm it still visualizes successfully via the `VariableInspectorViz` fallback (showing `total`/`i` changing over time) rather than erroring out.

- [ ] **Step 7: Verify performance/bundle isolation**

In DevTools Network tab, load any other existing page (e.g. `/sorting/bubble-sort`) fresh and confirm neither `pyodide` nor `acorn`/`astring` chunks are fetched. Only navigating to `/visualize-my-code` (and only running Python) should trigger the Pyodide fetch.

- [ ] **Step 8: Note results**

No commit for this task — if any step fails, file it as a fix in a small follow-up commit before proceeding to Phase 7, referencing which verification step caught it.

---

## Phase 7 — Existing-site QA / stabilization pass

### Task 25: Build + lint baseline

**Files:** none (verification-only task, fixes applied as needed)

- [ ] **Step 1: Run a clean build**

Run (from `client/`): `npm run build`
Expected: no errors or warnings. If any appear, fix them in this task before moving on.

- [ ] **Step 2: Run lint across the whole client**

Run (from `client/`): `npm run lint`
Expected: no errors. Fix any that appear.

- [ ] **Step 3: Commit fixes (only if any were needed)**

```bash
git add -A
git commit -m "fix: resolve build/lint issues found during stabilization pass"
```

---

### Task 26: Manual click-through of every existing page

**Files:** none (manual QA task, fixes applied as small follow-up commits per issue found)

**Checklist to walk through in the running dev server (`npm run dev`, from `client/`):**

- [ ] **Step 1: Auth flow** — `/login`, `/register`, `/forgot-password`: forms submit, validation messages are sensible, no console errors.
- [ ] **Step 2: Dashboard** — `/dashboard`: loads without console errors, all category cards link correctly.
- [ ] **Step 3: Every sorting algorithm** — each of the 10 entries under Sorting: Generate/Start/Stop/Prev/Next/Speed all behave as expected, no console errors.
- [ ] **Step 4: Every searching algorithm** — each of the 5 entries under Searching.
- [ ] **Step 5: Recursion, Linked List, Stack & Queue, Tree, Graph, DP, ML pages** — one page per category at minimum, confirm the visualization renders and controls work.
- [ ] **Step 6: Documentation and Support pages** — `/documentation`, `/support`: content renders, support form submits (or shows the expected error if backend isn't running locally).
- [ ] **Step 7: For every issue found in Steps 1-6** — fix it with the smallest correct change, verify the fix manually, and commit separately:

```bash
git add <changed files>
git commit -m "fix: <short description of the specific bug fixed>"
```

If no issues are found in a given step, no commit is needed for that step — note it as verified and move on.

---

## Final check

- [ ] **Confirm all commits are on the `Visualization` branch**

Run: `git log --oneline develop..Visualization`
Expected: every commit from this plan is listed, nothing is missing.
