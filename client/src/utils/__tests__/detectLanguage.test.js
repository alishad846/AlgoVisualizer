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
