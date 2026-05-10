export default function BoredomBar({ value }) {
  const pct   = Math.round(Math.max(0, Math.min(100, value)));
  const color = pct > 60 ? "#82d63a" : pct > 30 ? "#ffd43b" : "#ff4757";

  return (
    <div
      style={{
        border: "3px solid #111",
        borderRadius: 8,
        background: "#fff8dc",
        overflow: "hidden",
        height: 22,
        width: "100%",
        boxShadow: "2px 2px 0 #111",
        position: "relative",
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: "100%",
          background: color,
          borderRight: pct < 100 ? "2px solid #111" : "none",
          transition: "width 0.5s ease, background 0.5s ease",
        }}
      />
      <span
        style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: 7,
          fontFamily: "'Press Start 2P', monospace",
          color: "#111",
          whiteSpace: "nowrap",
          pointerEvents: "none",
        }}
      >
        {pct}%
      </span>
    </div>
  );
}