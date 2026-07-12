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
