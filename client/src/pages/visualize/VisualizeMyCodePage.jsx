import { useState, useCallback, useRef } from 'react';
import AppShell from '../../components/AppShell.jsx';
import StepLog from '../../components/StepLog.jsx';
import VisualizerRouter from '../../components/visualize/VisualizerRouter.jsx';
import CodeEditorPanel from '../../components/visualize/CodeEditorPanel.jsx';
import { detectLanguage } from '../../utils/detectLanguage.js';
import { detectAlgorithm } from '../../utils/algoDetector.js';
import { adaptTrace, capTrace } from '../../utils/traceAdapters/index.js';

const CATEGORY_LABELS = {
  sorting: 'Sorting',
  searching: 'Searching',
  recursion: 'Recursion',
  'linked-list': 'Linked List',
  'stack-queue': 'Stack / Queue',
  tree: 'Tree',
  graph: 'Graph',
  dp: 'Dynamic Programming',
};

const DEFAULT_CODE = `function bubbleSort(arr) {
  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        const temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
  return arr;
}
bubbleSort([5, 2, 8, 1, 9, 3]);`;

export default function VisualizeMyCodePage() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [detection, setDetection] = useState(null);
  const [manualCategory, setManualCategory] = useState(null);
  const [visualizer, setVisualizer] = useState(null);
  const [frames, setFrames] = useState([]);
  const [frameIdx, setFrameIdx] = useState(-1);
  const [truncated, setTruncated] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const playRef = useRef(false);

  const handleDetectAndVisualize = useCallback(async () => {
    setStatus('running');
    setErrorMessage('');
    setFrames([]);
    setFrameIdx(-1);
    setPlaying(false);
    playRef.current = false;

    const lang = detectLanguage(code);
    if (lang !== 'javascript' && lang !== 'python') {
      setStatus('error');
      setErrorMessage(
        'Full visualization currently supports JavaScript and Python. Paste code in one of these languages for the smoothest experience.'
      );
      return;
    }

    const detected = detectAlgorithm(code);
    setDetection(detected);
    const category = manualCategory || detected.category;

    try {
      const runTrace =
        lang === 'javascript'
          ? (await import('../../utils/tracer/runJsTrace.js')).runJsTrace
          : (await import('../../utils/tracer/runPyTrace.js')).runPyTrace;

      const { trace, truncated: wasTruncatedByWorker } = await runTrace(code);
      const { frames: cappedTrace, truncated: wasCapped } = capTrace(trace, 3000);
      const { frames: adaptedFrames, visualizer: chosenVisualizer } = adaptTrace(category, cappedTrace);

      setFrames(adaptedFrames);
      setFrameIdx(0);
      setVisualizer(chosenVisualizer);
      setTruncated(wasTruncatedByWorker || wasCapped);
      setStatus('ready');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err.message || 'Execution failed. Check your code for errors.');
    }
  }, [code, manualCategory]);

  const play = useCallback(async () => {
    if (playing || frames.length === 0) return;
    setPlaying(true);
    playRef.current = true;
    let idx = frameIdx >= frames.length - 1 ? 0 : frameIdx;
    while (idx < frames.length - 1 && playRef.current) {
      idx += 1;
      setFrameIdx(idx);
      await new Promise((resolve) => setTimeout(resolve, Math.round(400 / speed)));
    }
    playRef.current = false;
    setPlaying(false);
  }, [playing, frames, frameIdx, speed]);

  const stop = useCallback(() => {
    playRef.current = false;
    setPlaying(false);
  }, []);

  const next = useCallback(() => {
    if (playing || frameIdx >= frames.length - 1) return;
    setFrameIdx(frameIdx + 1);
  }, [playing, frameIdx, frames]);

  const prev = useCallback(() => {
    if (playing || frameIdx <= 0) return;
    setFrameIdx(frameIdx - 1);
  }, [playing, frameIdx]);

  const currentFrame = frameIdx >= 0 ? frames[frameIdx] : null;
  const swapsCount = frames.slice(0, frameIdx + 1).filter((f) => f.type === 'swap').length;
  const isSortingActive = visualizer === 'sorting' && frames.length > 0;
  const stepLog = frames.slice(0, frameIdx + 1).map((f) => ({ text: f.log, type: f.type }));

  return (
    <AppShell breadcrumb="Visualize My Code">
      <div className="section-title">Visualize My Code</div>
      <div className="section-sub">
        Paste JavaScript or Python — we&apos;ll detect the algorithm and animate exactly what your code does.
      </div>

      <CodeEditorPanel code={code} onChange={setCode} />

      <div className="controls-bar" style={{ marginTop: 12, marginBottom: 12 }}>
        <button className="btn btn-primary" onClick={handleDetectAndVisualize} disabled={status === 'running'}>
          {status === 'running' ? 'Running...' : 'Detect & Visualize'}
        </button>
        {frames.length > 0 && (
          <>
            <button className="btn btn-primary" onClick={play} disabled={playing}>
              &#9654; Play
            </button>
            <button className="btn btn-danger" onClick={stop} disabled={!playing}>
              &#9632; Stop
            </button>
            <button className="btn btn-ghost" onClick={prev} disabled={playing || frameIdx <= 0}>
              &#9664; Prev
            </button>
            <button className="btn btn-ghost" onClick={next} disabled={playing || frameIdx >= frames.length - 1}>
              Next &#9654;
            </button>
            <label>Speed</label>
            <select className="size-select" value={speed} onChange={(e) => setSpeed(+e.target.value)} disabled={playing}>
              <option value={0.5}>0.5x</option>
              <option value={1}>1x</option>
              <option value={2}>2x</option>
              <option value={4}>4x</option>
            </select>
            <span style={{ marginLeft: 'auto', fontSize: 12 }}>
              {visualizer === 'sorting' && (
                <>
                  Swaps: <strong style={{ color: 'var(--orange)' }}>{swapsCount}</strong>{' '}
                </>
              )}
              Step: <strong style={{ color: 'var(--cyan)' }}>{frameIdx + 1}</strong> / {frames.length}
            </span>
          </>
        )}
      </div>

      {status === 'error' && (
        <div
          style={{
            padding: 14, background: 'var(--surface2)', border: '1px solid var(--red, #e5484d)',
            borderRadius: 10, color: 'var(--red, #e5484d)', marginBottom: 12,
          }}
        >
          {errorMessage}
        </div>
      )}

      {detection && detection.category && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, fontSize: 13 }}>
          <span>
            Detected: <strong style={{ color: 'var(--cyan)' }}>{CATEGORY_LABELS[detection.category] || detection.category}</strong>{' '}
            ({Math.round(detection.confidence * 100)}% confidence)
          </span>
          <select
            className="size-select"
            value={manualCategory || detection.category}
            onChange={(e) => setManualCategory(e.target.value)}
          >
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      )}

      {truncated && (
        <div
          style={{
            padding: 10, background: 'var(--surface2)', border: '1px solid var(--orange)',
            borderRadius: 8, color: 'var(--orange)', fontSize: 12, marginBottom: 12,
          }}
        >
          Trace truncated at 3000 steps — try a smaller input for a complete animation.
        </div>
      )}

      {currentFrame && (
        <div className="viz-layout-3">
          <div className="viz-left">
            <div style={{ padding: 16, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12 }}>
              <strong>What&apos;s happening</strong>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 8 }}>{currentFrame.log}</p>
            </div>
          </div>
          <div className="viz-center">
            <VisualizerRouter visualizer={visualizer} frame={currentFrame} />
            {isSortingActive && (
              <div style={{ textAlign: 'center', color: 'var(--green)', fontWeight: 700, fontSize: 13, padding: '8px 0' }}>
                ✓ Sorted in {frames.length} steps · {swapsCount} swaps
              </div>
            )}
          </div>
          <div className="viz-right">
            <StepLog steps={stepLog} />
          </div>
        </div>
      )}
    </AppShell>
  );
}
