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
