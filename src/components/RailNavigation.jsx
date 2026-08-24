'use client';

const NODES = [
  { label: "BOAT", p: 0.02 },
  { label: "OCEAN", p: 0.30 },
  { label: "CATCH", p: 0.50 },
  { label: "FIRE", p: 0.74 },
  { label: "TABLE", p: 0.96 }
];

export default function RailNavigation({ currentScene, progress, onScrollTo }) {
  return (
    <nav className="rail ui-fade" aria-label="journey chapters">
      <div className="rail-track">
        <i style={{ transform: `scaleY(${progress})` }}></i>
      </div>
      {NODES.map((node, i) => (
        <button
          key={node.label}
          className={`rail-node ${currentScene === i ? "on" : ""}`}
          onClick={() => onScrollTo(node.p)}
        >
          <i></i>
          <span>{node.label}</span>
        </button>
      ))}
    </nav>
  );
}