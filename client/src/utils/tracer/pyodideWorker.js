const PYODIDE_CDN_URL = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';

let pyodideReadyPromise = null;

async function getPyodide() {
  if (!pyodideReadyPromise) {
    self.importScripts(PYODIDE_CDN_URL);
    // eslint-disable-next-line no-undef
    pyodideReadyPromise = loadPyodide();
  }
  return pyodideReadyPromise;
}

const TRACE_HARNESS_PY = `
import sys, json

__trace_records = []
__depth = [0]
__MAX_STEPS = 3000

def __tracer(frame, event, arg):
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
            locals_snapshot[k] = str(v)
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
  try {
    const pyodide = await getPyodide();
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
      self.postMessage({ ok: true, trace: [], truncated: true });
    } else {
      self.postMessage({ ok: false, error: message });
    }
  }
};
