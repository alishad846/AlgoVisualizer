import { useCallback, useSyncExternalStore } from "react";

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
  // Replace with a new object reference (rather than Object.assign-mutating
  // the existing one in place) so useSyncExternalStore's snapshot comparison
  // can detect the change via referential inequality.
  cache[key] = { ...cache[key], ...updates };
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
    cache[key] = { ...cache[key], running: false };
    notifyListeners(key);
  }
}

// Clears the stop flag for a cache entry. Lives here (rather than callers
// reaching into cacheObj.stopRef.current directly) because stopRef is owned
// by this module's cache, not by any one component.
export function clearStop(key) {
  if (cache[key] && cache[key].stopRef) {
    cache[key].stopRef.current = false;
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
 *
 * Subscribes to the module-level `cache` external store via useSyncExternalStore
 * instead of a manual useState+useEffect+subscribe dance, so React (and the
 * React Compiler) treat this as a proper external-store subscription rather
 * than a component synchronously calling setState from inside an effect.
 */
export function useAlgoManager(key, initFn) {
  const subscribeFn = useCallback((onStoreChange) => subscribe(key, onStoreChange), [key]);
  // Not memoized on purpose: useSyncExternalStore only requires that two
  // calls to getSnapshot() made without an intervening store update return
  // the same value, not that the function itself is referentially stable.
  // getAlgoState(key, initFn) returns the same cache[key] reference until
  // updateAlgoState/resetAlgoState/stopAlgoState replace it, so that holds.
  const getSnapshot = () => getAlgoState(key, initFn);

  const state = useSyncExternalStore(subscribeFn, getSnapshot);

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
    return resetAlgoState(key, initFn);
  }, [key, initFn]);

  const stop = useCallback(() => {
    stopAlgoState(key);
  }, [key]);

  const clearStopFlag = useCallback(() => {
    clearStop(key);
  }, [key]);

  return { state, update, reset, stop, clearStop: clearStopFlag, cacheObj: cache[key] };
}
