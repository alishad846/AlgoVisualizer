import { useEffect, useRef } from "react";
import { playAudioFeedback } from "../utils/sound";

/**
 * Persistent scrolling step log. Accumulates all steps and auto-scrolls.
 * Props: steps = [{text, type}], where type = "info"|"swap"|"compare"|"done"
 */
export default function StepLog({ steps }) {
  const bodyRef = useRef(null);
  const prevLenRef = useRef(steps.length);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
    if (steps.length !== prevLenRef.current && steps.length > 0) {
      const latest = steps[steps.length - 1];
      if (latest && latest.type) {
        playAudioFeedback(latest.type, latest.text);
      }
    }
    prevLenRef.current = steps.length;
  }, [steps]);

  const typeColors = {
    compare: "var(--yellow)",
    swap: "var(--orange)",
    done: "var(--green)",
    info: "var(--cyan)",
    default: "var(--text)",
  };

  return (
    <div className="step-log">
      <div className="step-log-header">
        <div className="step-log-dot pulse" />
        <span>Live Steps</span>
        <span className="step-log-count">{steps.length}</span>
      </div>
      <div className="step-log-body" ref={bodyRef}>
        {steps.length === 0 && (
          <div className="step-log-empty">Steps will appear here as the algorithm runs...</div>
        )}
        {steps.map((s, i) => (
          <div key={i} className="step-log-entry">
            <span className="step-log-num">{i + 1}</span>
            <span className="step-log-text" style={{ color: typeColors[s.type] || typeColors.default }}>
              {s.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
