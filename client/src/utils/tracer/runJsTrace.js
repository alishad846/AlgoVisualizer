export function runJsTrace(code, { timeoutMs = 6000 } = {}) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./jsWorker.js', import.meta.url), { type: 'module' });

    const timer = setTimeout(() => {
      worker.terminate();
      reject(new Error('Execution timed out. Check for an infinite loop.'));
    }, timeoutMs);

    worker.onmessage = (event) => {
      clearTimeout(timer);
      worker.terminate();
      if (event.data.ok) {
        resolve({ trace: event.data.trace, truncated: !!event.data.truncated });
      } else {
        reject(new Error(event.data.error));
      }
    };

    worker.onerror = (err) => {
      clearTimeout(timer);
      worker.terminate();
      reject(new Error(err.message || 'Worker execution failed.'));
    };

    worker.postMessage({ code });
  });
}
