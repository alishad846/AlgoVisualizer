export function createTraceHarness({ maxSteps = 3000, maxRuntimeMs = 4000 } = {}) {
  const trace = [];
  const callStack = [];
  const startTime = Date.now();
  let truncated = false;

  function checkBudget() {
    if (trace.length >= maxSteps || Date.now() - startTime > maxRuntimeMs) {
      truncated = true;
      throw new Error('__TRACE_BUDGET_EXCEEDED__');
    }
  }

  function jsonReplacer(_key, val) {
    if (val instanceof Set) return Array.from(val);
    if (val instanceof Map) return Object.fromEntries(val);
    return val;
  }

  function safeClone(value) {
    try {
      return JSON.parse(JSON.stringify(value, jsonReplacer));
    } catch {
      return {};
    }
  }

  return {
    __trace(line, locals) {
      checkBudget();
      trace.push({ line, locals: safeClone(locals), callDepth: callStack.length, event: 'step' });
    },
    __enterFrame(name, args) {
      checkBudget();
      callStack.push(name);
      trace.push({
        line: 0,
        locals: safeClone(args),
        callDepth: callStack.length,
        event: 'call',
        functionName: name,
      });
    },
    __exitFrame() {
      const name = callStack.pop();
      trace.push({
        line: 0,
        locals: {},
        callDepth: callStack.length,
        event: 'return',
        functionName: name,
      });
    },
    getTrace() {
      return trace;
    },
    isTruncated() {
      return truncated;
    },
  };
}
