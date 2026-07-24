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

const FACTORIAL_JS = `function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}`;

const FIBONACCI_PY = `def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)`;

describe('detectAlgorithm', () => {
  it('falls back to recursion for plain (unmemoized) recursion the classifier confuses for DP', () => {
    // factorial/fib have no dp[i]-style array table, so the DP visualizer has nothing
    // to render for them; recursion (call-stack viz) is the only category that works.
    expect(detectAlgorithm(FACTORIAL_JS).category).toBe('recursion');
    expect(detectAlgorithm(FIBONACCI_PY).category).toBe('recursion');
  });

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
