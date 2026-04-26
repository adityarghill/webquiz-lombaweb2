export default function MusicButton({ playing, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="no-drag flex items-center gap-2 px-3 py-2 hover:opacity-80 transition-opacity active:scale-95"
      style={{
        background: playing ? "#ffd43b" : "#eee",
        border: "3px solid #111",
        borderRadius: 10,
        boxShadow: "3px 3px 0 #111",
        fontFamily: "'Press Start 2P', monospace",
        fontSize: 9,
        color: "#111",
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ fontSize: 14 }}>{playing ? "🎵" : "🔇"}</span>
      <span>{playing ? "ON" : "OFF"}</span>
    </button>
  );
}