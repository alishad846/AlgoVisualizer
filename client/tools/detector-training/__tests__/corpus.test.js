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
