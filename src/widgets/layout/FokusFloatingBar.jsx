/**
 * FokusFloatingBar.jsx  —  Draggable, closeable floating Pomodoro pill
 *
 * Features:
 *  - Draggable via mouse drag AND touch drag
 *  - X button to close; re-appears automatically when timer starts running
 *  - Compact pill (collapsed) ↔ expanded panel toggle
 *  - Session-complete notification toast
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useFokus, MODES } from "@/context/FokusContext";

/* ── Inline SVG icons ─────────────────────────────────── */
function Ico({ d, size = 16, color = "#111", sw = 2.2, fill = "none" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24"
      fill={fill} stroke={color} strokeWidth={sw}
      strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, display: "block" }}>
      <path d={d} />
    </svg>
  );
}
const IC = {
  play:    "M5 3l14 9-14 9V3z",
  pause:   "M6 19h4V5H6v14zm8-14v14h4V5h-4z",
  close:   "M18 6L6 18M6 6l12 12",
  arrow:   "M5 12h14M12 5l7 7-7 7",
  check:   "M20 6L9 17l-5-5",
  timer:   "M12 2a10 10 0 100 20A10 10 0 0012 2zm0 6v4l3 3",
  grip:    "M9 3h1v1H9zM14 3h1v1h-1zM9 8h1v1H9zM14 8h1v1h-1zM9 13h1v1H9zM14 13h1v1h-1z",
};

/* ── Format mm:ss ─────────────────────────────────────── */
function fmt(secs) {
  return `${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`;
}

/* ═══════════════════════════════════════════════════════
   FokusFloatingBar
═══════════════════════════════════════════════════════ */
export default function FokusFloatingBar() {
  const { state, dispatch, notification, dismissNotif } = useFokus();
  const navigate = useNavigate();

  // ── Visibility state ──────────────────────────────────
  const [dismissed, setDismissed] = useState(false);
  const [expanded,  setExpanded]  = useState(false);

  // ── Position: tracked as { right, bottom } in px ──────
  const [pos, setPos]       = useState({ right: 20, bottom: 80 });
  const [dragging, setDragging] = useState(false);
  const dragOrigin = useRef({ mouseX: 0, mouseY: 0, right: 20, bottom: 80 });
  const barRef     = useRef(null);

  // Re-show bar automatically when timer starts running
  useEffect(() => {
    if (state.running) setDismissed(false);
  }, [state.running]);

  // ── Drag: pointer events (works for both mouse and touch) ──
  const onPointerDown = useCallback((e) => {
    // Don't drag if clicking a button inside the bar
    if (e.target.closest("button")) return;
    e.preventDefault();
    barRef.current?.setPointerCapture?.(e.pointerId);

    dragOrigin.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      right:  pos.right,
      bottom: pos.bottom,
    };
    setDragging(true);
  }, [pos]);

  const onPointerMove = useCallback((e) => {
    if (!dragging) return;
    const dx = e.clientX - dragOrigin.current.mouseX; // +dx = moved right
    const dy = e.clientY - dragOrigin.current.mouseY; // +dy = moved down

    setPos({
      right:  Math.max(0, Math.min(window.innerWidth  - 60, dragOrigin.current.right  - dx)),
      bottom: Math.max(0, Math.min(window.innerHeight - 60, dragOrigin.current.bottom - dy)),
    });
  }, [dragging]);

  const onPointerUp = useCallback(() => {
    setDragging(false);
  }, []);

  // ── Show/hide logic ───────────────────────────────────
  // Bar is visible if: (timer started at least once) AND not dismissed
  const hasStarted = state.running || state.timeLeft < state.totalSeconds;
  const showBar    = hasStarted && !dismissed;

  // Progress ring values
  const mode     = MODES[state.modeKey];
  const progress = 1 - state.timeLeft / state.totalSeconds;
  const circ     = 2 * Math.PI * 16;

  // ─────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes notifSlideIn {
          from { transform: translateX(56px); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes floatPop {
          from { transform: scale(0.88); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1);   }
          50%       { opacity: 0.35; transform: scale(0.65); }
        }
      `}</style>

      {/* ══ Session-complete notification toast ══════════ */}
      {notification && (
        <div style={{
          position: "fixed", top: 76, right: 20, zIndex: 10000,
          width: 310,
          border: "3px solid #111", borderRadius: 16,
          background: "#fff", boxShadow: "6px 6px 0 #111",
          overflow: "hidden",
          animation: "notifSlideIn 0.25s cubic-bezier(.34,1.56,.64,1)",
        }}>
          {/* Green header */}
          <div style={{
            background: "#22C55E", padding: "10px 14px",
            display: "flex", alignItems: "center", gap: 10,
            borderBottom: "2.5px solid #111",
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: "#fff", border: "2px solid #111",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <Ico d={IC.check} size={15} color="#22C55E" sw={2.8} />
            </div>
            <p style={{ fontWeight: 900, fontSize: 13, color: "#fff", margin: 0, flex: 1 }}>
              {notification.title}
            </p>
            <button onClick={dismissNotif} style={{
              background: "none", border: "none", cursor: "pointer",
              color: "#fff", padding: 3, display: "flex",
            }}>
              <Ico d={IC.close} size={14} color="#fff" sw={2.5} />
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: "12px 14px 14px" }}>
            <p style={{ fontSize: 12, color: "#374151", margin: "0 0 12px", lineHeight: 1.6, fontWeight: 600 }}>
              {notification.body}
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => { dismissNotif(); navigate("/dashboard/focus-mode"); }}
                style={{
                  flex: 1, padding: "8px 0", border: "2.5px solid #111",
                  borderRadius: 9, background: "#111", color: "#FFE566",
                  fontWeight: 900, fontSize: 11, cursor: "pointer",
                  boxShadow: "3px 3px 0 #555",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  transition: "all 0.1s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translate(-1px,-1px)"; e.currentTarget.style.boxShadow = "4px 4px 0 #555"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "3px 3px 0 #555"; }}
              >
                <Ico d={IC.arrow} size={13} color="#FFE566" sw={2.2} />
                Ke Fokus Mode
              </button>
              <button
                onClick={dismissNotif}
                style={{
                  padding: "8px 14px", border: "2.5px solid #111",
                  borderRadius: 9, background: "#F3F4F6", color: "#374151",
                  fontWeight: 900, fontSize: 11, cursor: "pointer",
                  boxShadow: "2px 2px 0 #111",
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ Floating pill ════════════════════════════════ */}
      {showBar && (
        <div
          ref={barRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{
            position: "fixed",
            right:    pos.right,
            bottom:   pos.bottom,
            zIndex:   9990,
            userSelect: "none",
            touchAction: "none",
            cursor: dragging ? "grabbing" : "grab",
            animation: "floatPop 0.22s cubic-bezier(.34,1.56,.64,1)",
          }}
        >
          {/* ── Expanded panel ──────────────────────── */}
          {expanded && (
            <div style={{
              border: "3px solid #111",
              borderRadius: 16,
              background: "#fff",
              boxShadow: "6px 6px 0 #111",
              padding: "14px 16px",
              marginBottom: 8,
              width: 220,
              animation: "floatPop 0.2s ease-out",
            }}>
              {/* Panel header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontWeight: 900, fontSize: 11, color: "#111",
                  textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {mode.label}
                </span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => navigate("/dashboard/focus-mode")}
                    style={{
                      width: 26, height: 26, borderRadius: 7, border: "2px solid #111",
                      background: "#F3F4F6", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: "2px 2px 0 #111", transition: "all 0.1s",
                    }}
                    title="Buka Fokus Mode"
                  >
                    <Ico d={IC.arrow} size={12} color="#374151" sw={2.2} />
                  </button>
                </div>
              </div>

              {/* Progress ring */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                <svg width={80} height={80} viewBox="0 0 44 44">
                  <circle cx="22" cy="22" r="16" fill="none"
                    stroke="#F3F4F6" strokeWidth="4" />
                  <circle cx="22" cy="22" r="16" fill="none"
                    stroke={mode.accent} strokeWidth="4"
                    strokeDasharray={circ}
                    strokeDashoffset={circ * (1 - progress)}
                    strokeLinecap="round"
                    style={{
                      transform: "rotate(-90deg)", transformOrigin: "50% 50%",
                      transition: "stroke-dashoffset 0.9s linear",
                    }}
                  />
                  <text x="22" y="27" textAnchor="middle"
                    fontSize="9" fontWeight="900" fill="#111">
                    {fmt(state.timeLeft)}
                  </text>
                </svg>
              </div>

              {/* Material label */}
              {state.material && (
                <p style={{
                  fontSize: 10, color: "#6B7280", fontWeight: 600,
                  margin: "0 0 12px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  display: "flex", alignItems: "center", gap: 5,
                }}>
                  <Ico d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" size={11} color="#9CA3AF" sw={2} />
                  {state.material}
                </p>
              )}

              {/* Controls */}
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={() => dispatch({ type: "TOGGLE_RUN" })}
                  style={{
                    flex: 1, padding: "8px 0",
                    border: "2.5px solid #111", borderRadius: 9,
                    background: state.running ? "#FEF9C3" : "#111",
                    color:      state.running ? "#111"    : "#FFE566",
                    fontWeight: 900, fontSize: 11, cursor: "pointer",
                    boxShadow: "2px 2px 0 #555",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                    transition: "all 0.1s",
                  }}
                >
                  <Ico d={state.running ? IC.pause : IC.play}
                    size={13} color={state.running ? "#111" : "#FFE566"}
                    sw={state.running ? 2.5 : 0}
                    fill={state.running ? "none" : "#FFE566"}
                  />
                  {state.running ? "Pause" : "Lanjut"}
                </button>
              </div>

              {/* Session count */}
              <div style={{
                marginTop: 10, paddingTop: 10,
                borderTop: "2px solid #F3F4F6",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <span style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 700 }}>
                  Sesi hari ini
                </span>
                <span style={{
                  fontSize: 12, fontWeight: 900, color: "#111",
                  background: "#F3F4F6", border: "2px solid #E5E7EB",
                  borderRadius: 6, padding: "1px 8px",
                }}>
                  {state.completedToday}
                </span>
              </div>
            </div>
          )}

          {/* ── Pill button (always visible) ─────────── */}
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            {/* Main pill */}
            <button
              onClick={() => setExpanded((e) => !e)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "9px 14px 9px 12px",
                border: "3px solid #111", borderRadius: 100,
                background: state.running ? mode.accent : "#fff",
                color: state.running ? "#fff" : "#111",
                fontWeight: 900, fontSize: 13,
                cursor: "pointer",
                boxShadow: "4px 4px 0 #111",
                transition: "transform 0.1s, box-shadow 0.1s, background 0.3s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translate(-2px,-2px)"; e.currentTarget.style.boxShadow = "6px 6px 0 #111"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "4px 4px 0 #111"; }}
            >
              {/* Mini ring */}
              <svg width={22} height={22} viewBox="0 0 44 44" style={{ flexShrink: 0 }}>
                <circle cx="22" cy="22" r="16" fill="none"
                  stroke={state.running ? "rgba(255,255,255,0.3)" : "#E5E7EB"} strokeWidth="5" />
                <circle cx="22" cy="22" r="16" fill="none"
                  stroke={state.running ? "#fff" : mode.accent} strokeWidth="5"
                  strokeDasharray={circ}
                  strokeDashoffset={circ * (1 - progress)}
                  strokeLinecap="round"
                  style={{
                    transform: "rotate(-90deg)", transformOrigin: "50% 50%",
                    transition: "stroke-dashoffset 0.9s linear",
                  }}
                />
              </svg>

              {/* Time */}
              <span style={{
                fontVariantNumeric: "tabular-nums",
                fontSize: 13, fontWeight: 900,
              }}>
                {fmt(state.timeLeft)}
              </span>

              {/* Pulse dot when running */}
              {state.running && (
                <span style={{
                  width: 7, height: 7, borderRadius: "50%", background: "#fff",
                  animation: "pulseDot 1s ease-in-out infinite", flexShrink: 0,
                }} />
              )}
            </button>

            {/* ── Close (X) button — sits outside the pill, top-right ── */}
            <button
              onClick={(e) => { e.stopPropagation(); setDismissed(true); setExpanded(false); }}
              style={{
                position: "absolute",
                top: -9,
                right: -9,
                width: 22, height: 22,
                borderRadius: "50%",
                border: "2.5px solid #111",
                background: "#fff",
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "2px 2px 0 #111",
                zIndex: 2,
                transition: "all 0.1s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#111"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; }}
              title="Tutup floating bar"
            >
              <svg width={10} height={10} viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth={3}
                strokeLinecap="round"
                style={{ color: "inherit", transition: "color 0.1s" }}>
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
