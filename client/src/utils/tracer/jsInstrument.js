import * as acorn from 'acorn';
import { generate } from 'astring';

function identifier(name) {
  return { type: 'Identifier', name };
}

function objectFromNames(names) {
  return {
    type: 'ObjectExpression',
    properties: names.map((name) => ({
      type: 'Property',
      kind: 'init',
      method: false,
      shorthand: true,
      computed: false,
      key: identifier(name),
      value: identifier(name),
    })),
  };
}

function traceCall(line, knownNames) {
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'CallExpression',
      callee: identifier('__trace'),
      arguments: [
        { type: 'Literal', value: line },
        objectFromNames(knownNames),
      ],
    },
  };
}

function enterFrameCall(name, paramNames) {
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'CallExpression',
      callee: identifier('__enterFrame'),
      arguments: [
        { type: 'Literal', value: name },
        objectFromNames(paramNames),
      ],
    },
  };
}

function exitFrameCall() {
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'CallExpression',
      callee: identifier('__exitFrame'),
      arguments: [],
    },
  };
}

function declaredNamesFromPattern(pattern, out) {
  if (!pattern) return;
  if (pattern.type === 'Identifier') out.push(pattern.name);
  else if (pattern.type === 'ArrayPattern') {
    pattern.elements.forEach((el) => declaredNamesFromPattern(el, out));
  } else if (pattern.type === 'ObjectPattern') {
    pattern.properties.forEach((p) => declaredNamesFromPattern(p.value || p.argument, out));
  } else if (pattern.type === 'AssignmentPattern') {
    declaredNamesFromPattern(pattern.left, out);
  } else if (pattern.type === 'RestElement') {
    declaredNamesFromPattern(pattern.argument, out);
  }
}

function instrumentBlockLike(body, known) {
  if (body.type === 'BlockStatement') {
    return { ...body, body: instrumentBlock(body.body, known) };
  }
  return { type: 'BlockStatement', body: instrumentBlock([body], known) };
}

function instrumentBlock(bodyArray, known) {
  const result = [];
  const scopeKnown = [...known];
  bodyArray.forEach((stmt) => {
    const line = stmt.loc ? stmt.loc.start.line : 0;
    result.push(traceCall(line, scopeKnown));
    if (stmt.type === 'ReturnStatement') {
      result.push(exitFrameCall());
    }
    result.push(instrumentStatement(stmt, scopeKnown));
    if (stmt.type === 'VariableDeclaration') {
      stmt.declarations.forEach((d) => declaredNamesFromPattern(d.id, scopeKnown));
    }
  });
  if (bodyArray.length > 0) {
    const lastStmt = bodyArray[bodyArray.length - 1];
    if (lastStmt.type !== 'ReturnStatement') {
      const lastLine = lastStmt.loc ? lastStmt.loc.start.line : 0;
      result.push(traceCall(lastLine, scopeKnown));
    }
  }
  return result;
}

function instrumentStatement(stmt, known) {
  switch (stmt.type) {
    case 'BlockStatement':
      return { ...stmt, body: instrumentBlock(stmt.body, known) };

    case 'ForStatement': {
      const loopKnown = [...known];
      if (stmt.init && stmt.init.type === 'VariableDeclaration') {
        stmt.init.declarations.forEach((d) => declaredNamesFromPattern(d.id, loopKnown));
      }
      return { ...stmt, body: instrumentBlockLike(stmt.body, loopKnown) };
    }

    case 'ForInStatement':
    case 'ForOfStatement': {
      const loopKnown = [...known];
      if (stmt.left.type === 'VariableDeclaration') {
        stmt.left.declarations.forEach((d) => declaredNamesFromPattern(d.id, loopKnown));
      }
      return { ...stmt, body: instrumentBlockLike(stmt.body, loopKnown) };
    }

    case 'WhileStatement':
    case 'DoWhileStatement':
      return { ...stmt, body: instrumentBlockLike(stmt.body, known) };

    case 'IfStatement':
      return {
        ...stmt,
        consequent: instrumentBlockLike(stmt.consequent, known),
        alternate: stmt.alternate ? instrumentBlockLike(stmt.alternate, known) : null,
      };

    case 'FunctionDeclaration':
    case 'FunctionExpression': {
      const paramNames = [];
      stmt.params.forEach((p) => declaredNamesFromPattern(p, paramNames));
      const fnName = stmt.id ? stmt.id.name : 'anonymous';
      const newBody = {
        ...stmt.body,
        body: [enterFrameCall(fnName, paramNames), ...instrumentBlock(stmt.body.body, paramNames)],
      };
      return { ...stmt, body: newBody };
    }

    default:
      return stmt;
  }
}

export function instrumentJsCode(source) {
  const ast = acorn.parse(source, { ecmaVersion: 2020, sourceType: 'script', locations: true });
  const instrumentedBody = instrumentBlock(ast.body, []);
  return generate({ ...ast, body: instrumentedBody });
}
