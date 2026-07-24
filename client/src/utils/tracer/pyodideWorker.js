const PYODIDE_CDN_URL = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.mjs';

let pyodideReadyPromise = null;

async function getPyodide() {
  if (!pyodideReadyPromise) {
    pyodideReadyPromise = import(/* @vite-ignore */ PYODIDE_CDN_URL).then(({ loadPyodide }) => loadPyodide());
  }
  return pyodideReadyPromise;
}

const TRACE_HARNESS_PY = `
# pyodide's execution globals already contain internals (e.g. "_pyodide_core")
# before any of our code runs. Snapshot their names so module-level frames -
# where f_locals IS the global namespace - don't show them as if they were the
# user's own variables. Aliased with a "__" prefix so they're filtered out as
# harness-internal below, same as __trace_records/__depth/etc.
__baseline_names = set(globals().keys())
import sys as __sys, json as __json, copy as __copy

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
        if k.startswith("__") or k in __baseline_names:
            continue
        try:
            __json.dumps(v)
            # Lists/dicts are mutable and referenced (not copied) by frame.f_locals,
            # so storing v directly would let every previously-recorded frame observe
            # later in-place mutations too (all frames converging on the final state).
            # Deep-copy so each frame's snapshot is independent.
            locals_snapshot[k] = __copy.deepcopy(v)
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

__sys.settrace(__tracer)
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
      await pyodide.runPythonAsync('__sys.settrace(None)');
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
