import { useState, useEffect, useCallback } from "react";

// Memory cache for algorithm simulation states
const cache = {};
const listeners = {};

export function getAlgoState(key, initFn) {
  if (!cache[key]) {
    cache[key] = { ...initFn(), stopRef: { current: false } };
  }
  return cache[key];
}

export function updateAlgoState(key, updates) {
  if (!cache[key]) return;
  Object.assign(cache[key], updates);
  notifyListeners(key);
}

export function resetAlgoState(key, initFn) {
  if (cache[key] && cache[key].stopRef) {
    cache[key].stopRef.current = true;
  }
  cache[key] = { ...initFn(), stopRef: { current: false } };
  notifyListeners(key);
  return cache[key];
}

export function stopAlgoState(key) {
  if (cache[key] && cache[key].stopRef) {
    cache[key].stopRef.current = true;
    cache[key].running = false;
    notifyListeners(key);
  }
}

export function subscribe(key, callback) {
  if (!listeners[key]) listeners[key] = new Set();
  listeners[key].add(callback);
  return () => {
    listeners[key].delete(callback);
  };
}

function notifyListeners(key) {
  if (listeners[key]) {
    listeners[key].forEach((cb) => cb(cache[key]));
  }
}

/**
 * Custom React hook to manage algorithm state with persistent background simulation support.
 */
export function useAlgoManager(key, initFn) {
  const [state, setState] = useState(() => getAlgoState(key, initFn));

  useEffect(() => {
    const current = getAlgoState(key, initFn);
    setState({ ...current });

    const unsubscribe = subscribe(key, (updated) => {
      setState({ ...updated });
    });
    return () => unsubscribe();
  }, [key]);

  const update = useCallback(
    (updates) => {
      const current = cache[key];
      if (!current) return;
      const newVals = typeof updates === "function" ? updates(current) : updates;
      updateAlgoState(key, newVals);
    },
    [key]
  );

  const reset = useCallback(() => {
    const s = resetAlgoState(key, initFn);
    setState({ ...s });
    return s;
  }, [key, initFn]);

  const stop = useCallback(() => {
    stopAlgoState(key);
  }, [key]);

  return { state, update, reset, stop, cacheObj: cache[key] };
}
