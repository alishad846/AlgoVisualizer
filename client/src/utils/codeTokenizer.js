const BLOCK_COMMENT = /\/\*[\s\S]*?\*\//g;
const STRING_OR_CHAR = /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g;
const LINE_COMMENT = /\/\/.*$|#.*$/gm;
const NUMBER = /\b\d+(\.\d+)?\b/g;

const MULTI_CHAR_OPERATORS = [
  '<=', '>=', '===', '!==', '==', '!=', '&&', '||', '->', '=>',
  '++', '--', '+=', '-=', '*=', '/=', '::',
];

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const OPERATOR_ALTERNATION = MULTI_CHAR_OPERATORS.map(escapeRegExp).join('|');
const TOKEN_PATTERN = new RegExp(
  `([A-Za-z_][A-Za-z0-9_]*)|(${OPERATOR_ALTERNATION})|([{}()\\[\\];,.<>+\\-*/%=!&|^~:])`,
  'g'
);

export function tokenize(code) {
  if (!code || typeof code !== 'string') return [];

  let stripped = code
    .replace(STRING_OR_CHAR, ' __STR__ ')
    .replace(BLOCK_COMMENT, ' ')
    .replace(LINE_COMMENT, ' ')
    .replace(NUMBER, ' __NUM__ ');

  const tokens = [];
  let match;
  TOKEN_PATTERN.lastIndex = 0;
  while ((match = TOKEN_PATTERN.exec(stripped)) !== null) {
    const token = match[1] || match[2] || match[3];
    if (token) tokens.push(token);
  }
  return tokens;
}
