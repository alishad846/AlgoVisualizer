import { instrumentJsCode } from './jsInstrument.js';
import { createTraceHarness } from './traceHarness.js';

self.onmessage = function handleMessage(event) {
  const { code } = event.data;
  const harness = createTraceHarness({ maxSteps: 3000, maxRuntimeMs: 4000 });

  try {
    const instrumented = instrumentJsCode(code);
    const runner = new Function('__trace', '__enterFrame', '__exitFrame', instrumented);
    runner(harness.__trace, harness.__enterFrame, harness.__exitFrame);
    self.postMessage({ ok: true, trace: harness.getTrace(), truncated: harness.isTruncated() });
  } catch (err) {
    if (err.message === '__TRACE_BUDGET_EXCEEDED__') {
      self.postMessage({ ok: true, trace: harness.getTrace(), truncated: true });
    } else {
      self.postMessage({ ok: false, error: err.message || String(err) });
    }
  }
};
