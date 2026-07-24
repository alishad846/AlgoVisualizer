import { tokenize } from './codeTokenizer.js';
import { predictCategory } from './naiveBayesPredict.js';
import model from '../data/algoDetectorModel.json';

// The DP visualizer can only render a 1-D/2-D numeric array it finds in the trace
// (see dpAdapter.js's findDpVar). Plain, unmemoized recursion (factorial, naive
// fibonacci, ...) has no such array, so a "dp" prediction for it is a dead end: the
// classifier confuses it with real DP/tabulation because the token patterns
// (self-recursive call, `return`, arithmetic on `n`) heavily overlap. Since
// "recursion" is a strict subset of what "dp" code looks like here, fall back to it
// whenever nothing array-shaped is being built up.
const ARRAY_TABLE_ASSIGNMENT = /[A-Za-z_$][\w$]*(?:\[[^\]\n]+\])+\s*=(?!=)/;

export function detectAlgorithm(code) {
  const tokens = tokenize(code);
  if (tokens.length === 0) {
    return { category: null, confidence: 0, scores: {} };
  }
  const result = predictCategory(tokens, model);
  if (result.category === 'dp' && !ARRAY_TABLE_ASSIGNMENT.test(code)) {
    return { ...result, category: 'recursion' };
  }
  return result;
}
