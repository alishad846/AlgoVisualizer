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

  it('does not corrupt training when a document contains the token "constructor" (Object.prototype collision)', () => {
    const docsWithConstructor = [
      ['class', 'constructor', 'stack', 'push', 'pop'],
      ['class', 'constructor', 'queue', 'enqueue', 'dequeue'],
      ['class', 'constructor', 'stack', 'array'],
    ];
    const otherDocs = [
      ['visited', 'queue', 'neighbor', 'graph', 'bfs'],
      ['visited', 'stack', 'dfs', 'neighbor', 'graph'],
      ['visited', 'adjacency', 'graph', 'queue', 'bfs'],
    ];
    const docs = [...docsWithConstructor, ...otherDocs];
    const labels = ['stack-queue', 'stack-queue', 'stack-queue', 'graph', 'graph', 'graph'];
    const model = trainNaiveBayes(docs, labels);

    // every logProb entry must be a finite number, never NaN/undefined-turned-null
    Object.values(model.logProb).forEach((classLogProbs) => {
      Object.values(classLogProbs).forEach((value) => {
        expect(Number.isFinite(value)).toBe(true);
      });
    });

    const prediction = predictCategory(['class', 'constructor', 'stack', 'push'], model);
    expect(prediction.category).toBe('stack-queue');
    expect(Number.isFinite(prediction.confidence)).toBe(true);
  });
});
