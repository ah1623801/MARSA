'use client';

export default function DepthMeter({ currentScene, progress }) {
  const inUW = progress > 0.21 && progress < 0.59;
  const isAscending = progress >= 0.487;
  const depthV = !isAscending ? (progress - 0.238) / (0.465 - 0.238) : 1 - (progress - 0.487) / (0.585 - 0.487);
  const depthClamped = Math.max(0, Math.min(1, depthV));
  const sceneNames = ["THE BOAT", "THE OCEAN", "THE CATCH", "THE FIRE", "THE TABLE"];

  return (
    <>
      <div className="chrome-bl ui-fade">
        <span><span>0{currentScene + 1}</span> / 05</span>
        <span className="sn">{sceneNames[currentScene]}</span>
      </div>
      <div className="chrome-br ui-fade">
        A CONTINUOUS JOURNEY<br />SEA · FIRE · TABLE
      </div>
      <div
        className="depth"
        style={{ opacity: inUW ? 1 : 0, visibility: inUW ? 'visible' : 'hidden' }}
      >
        <span className="d-lab">DEPTH</span>
        <span className="d-val">
          −{(depthClamped * 38).toFixed(1).padStart(4, "0")} M {isAscending ? "↑" : "↓"}
        </span>
        <span className="d-line"></span>
      </div>
    </>
  );
}