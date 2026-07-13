const PYODIDE_CDN_URL = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.mjs';

let pyodideReadyPromise = null;

async function getPyodide() {
  if (!pyodideReadyPromise) {
    pyodideReadyPromise = import(/* @vite-ignore */ PYODIDE_CDN_URL).then(({ loadPyodide }) => loadPyodide());
  }
  return pyodideReadyPromise;
}

const TRACE_HARNESS_PY = `
import sys, json

__trace_records = []
__depth = [0]
__MAX_STEPS = 3000

def __tracer(frame, event, arg):
    if frame.f_code.co_filename != "<exec>":
        # Don't trace into Pyodide/CPython internals (e.g. the asyncio event
        # loop machinery that runPythonAsync uses under the hood). Tracing
        # those frames can crash mid-construction objects (like
        # asyncio.Handle) and permanently hang the enclosing coroutine.
        return None
    if event not in ("line", "call", "return"):
        return __tracer
    if len(__trace_records) >= __MAX_STEPS:
        raise RuntimeError("__TRACE_STEP_LIMIT__")
    if event == "call":
        __depth[0] += 1
    locals_snapshot = {}
    for k, v in frame.f_locals.items():
        if k.startswith("__"):
            continue
        try:
            json.dumps(v)
            locals_snapshot[k] = v
        except Exception:
            try:
                locals_snapshot[k] = str(v)
            except Exception:
                locals_snapshot[k] = "<unrepresentable>"
    __trace_records.append({
        "line": frame.f_lineno,
        "locals": locals_snapshot,
        "callDepth": __depth[0],
        "event": event,
        "functionName": frame.f_code.co_name,
    })
    if event == "return":
        __depth[0] -= 1
    return __tracer

sys.settrace(__tracer)
`;

self.onmessage = async function handleMessage(event) {
  const { code } = event.data;
  let pyodide;
  try {
    pyodide = await getPyodide();
    await pyodide.runPythonAsync(TRACE_HARNESS_PY);
    try {
      await pyodide.runPythonAsync(code);
    } finally {
      await pyodide.runPythonAsync('sys.settrace(None)');
    }
    const records = pyodide.globals.get('__trace_records').toJs({ dict_converter: Object.fromEntries });
    self.postMessage({ ok: true, trace: records, truncated: false });
  } catch (err) {
    const message = err && err.message ? err.message : String(err);
    if (message.includes('__TRACE_STEP_LIMIT__')) {
      const partialTrace = pyodide
        ? pyodide.globals.get('__trace_records').toJs({ dict_converter: Object.fromEntries })
        : [];
      self.postMessage({ ok: true, trace: partialTrace, truncated: true });
    } else {
      self.postMessage({ ok: false, error: message });
    }
  }
};
