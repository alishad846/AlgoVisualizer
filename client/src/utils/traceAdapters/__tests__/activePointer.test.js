import { describe, it, expect } from 'vitest';
import { detectPointerVar } from '../activePointer.js';

describe('detectPointerVar', () => {
  it('returns null for an empty trace', () => {
    expect(detectPointerVar([], () => true)).toBeNull();
  });

  it('returns null when no scalar variable varies', () => {
    const trace = [
      { line: 1, locals: { x: 5 }, callDepth: 0, event: 'step' },
      { line: 2, locals: { x: 5 }, callDepth: 0, event: 'step' },
    ];
    expect(detectPointerVar(trace, () => true)).toBeNull();
  });

  it('picks the varying scalar whose values are valid keys most often', () => {
    const trace = [
      { line: 1, locals: { i: 0, noise: 10 }, callDepth: 0, event: 'step' },
      { line: 2, locals: { i: 1, noise: 20 }, callDepth: 0, event: 'step' },
      { line: 3, locals: { i: 2, noise: 30 }, callDepth: 0, event: 'step' },
    ];
    const isValidKey = (value) => value === 0 || value === 1 || value === 2;
    expect(detectPointerVar(trace, isValidKey)).toBe('i');
  });

  it('ignores a constant scalar even if it would satisfy isValidKey', () => {
    const trace = [
      { line: 1, locals: { target: 5 }, callDepth: 0, event: 'step' },
      { line: 2, locals: { target: 5 }, callDepth: 0, event: 'step' },
    ];
    expect(detectPointerVar(trace, (value) => value === 5)).toBeNull();
  });

  it('returns null when no candidate ever satisfies isValidKey', () => {
    const trace = [
      { line: 1, locals: { i: 0 }, callDepth: 0, event: 'step' },
      { line: 2, locals: { i: 1 }, callDepth: 0, event: 'step' },
    ];
    expect(detectPointerVar(trace, () => false)).toBeNull();
  });
});
