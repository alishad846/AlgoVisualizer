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
