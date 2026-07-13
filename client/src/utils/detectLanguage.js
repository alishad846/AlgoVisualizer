export function detectLanguage(code) {
  if (!code || typeof code !== 'string' || !code.trim()) return 'unknown';

  const pythonScore =
    (/\bdef\s+\w+\s*\(.*\):/.test(code) ? 2 : 0) +
    (/:\s*$/m.test(code) ? 1 : 0) +
    (/\bself\b/.test(code) ? 1 : 0) +
    (/\belif\b/.test(code) ? 2 : 0) +
    (code.includes(';') ? -1 : 0) +
    (code.includes('{') ? -1 : 0);

  // Require at least one JS-specific signal to classify as JavaScript
  const hasJsSignal =
    /\bfunction\s*\w*\s*\(/.test(code) ||
    /\b(const|let|var)\b/.test(code) ||
    /=>/.test(code);

  const jsScore = hasJsSignal
    ? (/\bfunction\s*\w*\s*\(/.test(code) ? 2 : 0) +
      (/\b(const|let|var)\b/.test(code) ? 1 : 0) +
      (/=>/.test(code) ? 1 : 0) +
      (code.includes('{') ? 1 : 0) +
      (code.includes(';') ? 1 : 0)
    : 0;

  if (pythonScore <= 0 && jsScore <= 0) return 'unknown';
  return pythonScore > jsScore ? 'python' : 'javascript';
}
