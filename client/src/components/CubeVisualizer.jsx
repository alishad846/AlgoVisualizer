/**
 * CubeVisualizer — renders an array as animated 3D-style cubes.
 * Each cube height is proportional to value.
 * State: "default" | "comparing" | "pivot" | "sorted" | "found" | "current"
 */
export default function CubeVisualizer({ array, states = {}, maxVal }) {
  const max = maxVal || Math.max(...array, 1);
  const MAX_H = 160; // max cube height in px

  return (
    <div className="cubes-arena">
      {array.map((val, i) => {
        const state = states[i] || "default";
        const h = Math.max(18, Math.round((val / max) * MAX_H));
        return (
          <div key={i} className="cube-wrap">
            <div className={`cube-label state-${state}`}>{val}</div>
            <div
              className={`cube state-${state}`}
              style={{ height: h }}
            />
          </div>
        );
      })}
    </div>
  );
}
