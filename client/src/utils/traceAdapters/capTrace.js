export function capTrace(trace, maxFrames = 3000) {
  if (!Array.isArray(trace)) {
    return { frames: [], truncated: false };
  }
  if (trace.length <= maxFrames) {
    return { frames: trace, truncated: false };
  }
  return { frames: trace.slice(0, maxFrames), truncated: true };
}
