/**
 * fokusMode.jsx  —  Fokus Mode page (consumed via FokusContext singleton)
 *
 * Changes from previous version:
 *  - No emojis anywhere — icons via inline SVG paths only
 *  - Symmetric 2-column layout (timer | info), fully responsive
 *  - Session history: always visible with white backdrop (empty state inside card)
 *  - Custom duration: free-type input field (not preset chips)
 *  - Styling: cartoony 2D solid-black 3D shadow, unchanged tokens
 */

import { useEffect, useRef, useState } from "react";
import { useAuth }    from "@/context/authContext";
import { useFokus, MODES } from "@/context/FokusContext";

/* ── Design tokens (cartoony 2D) ──────────────────────── */
const BD  = "3px solid #111";
const SH  = "5px 5px 0px #111";
const SHs = "3px 3px 0px #111";
const SHl = "7px 7px 0px #111";
const RAD = { sm: 10, md: 14, lg: 18, xl: 22 };

/* ── Inline SVG icon ──────────────────────────────────── */
function Ico({ d, size = 18, color = "#111", sw = 2.2, fill = "none" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24"
      fill={fill} stroke={color} strokeWidth={sw}
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden style={{ flexShrink: 0, display: "block" }}
    >
      <path d={d} />
    </svg>
  );
}

const ICONS = {
  play:    "M5 3l14 9-14 9V3z",
  pause:   "M6 19h4V5H6v14zm8-14v14h4V5h-4z",
  reset:   "M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15",
  clock:   "M12 2a10 10 0 100 20A10 10 0 0012 2zm0 6v4l3 3",
  book:    "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  check:   "M20 6L9 17l-5-5",
  fire:    "M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z",
  history: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  bolt:    "M13 10V3L4 14h7v7l9-11h-7z",
  coffee:  "M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3",
  target:  "M12 22a10 10 0 100-20 10 10 0 000 20zm0-6a4 4 0 100-8 4 4 0 000 8zm0-2a2 2 0 110-4 2 2 0 010 4z",
  pen:     "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  bars:    "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
};

/* ── Format mm:ss ─────────────────────────────────────── */
function fmt(secs) {
  const m = String(Math.floor(secs / 60)).padStart(2, "0");
  const s = String(secs % 60).padStart(2, "0");
  return `${m}:${s}`;
}

/* ── Stat tile ────────────────────────────────────────── */
function StatTile({ icon, label, value, accent, bg }) {
  return (
    <div style={{
      border: `2.5px solid ${accent}`, borderRadius: RAD.md, background: bg,
      padding: "14px 16px", boxShadow: `4px 4px 0 ${accent}`,
      display: "flex", alignItems: "center", gap: 12,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: RAD.sm, background: "#fff",
        border: `2.5px solid ${accent}`, boxShadow: `2px 2px 0 ${accent}`,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Ico d={icon} size={18} color={accent} sw={2.2} />
      </div>
      <div>
        <p style={{ fontSize: 10, fontWeight: 800, color: accent, margin: "0 0 2px",
          textTransform: "uppercase", letterSpacing: "0.07em", opacity: 0.8 }}>{label}</p>
        <p style={{ fontSize: 20, fontWeight: 900, color: accent, margin: 0, lineHeight: 1 }}>{value}</p>
      </div>
    </div>
  );
}

/* ── Session history row ──────────────────────────────── */
function SessionRow({ session, index }) {
  const mode = MODES[session.modeKey];
  const mins = Math.round(session.duration / 60);
  const time = new Date(session.completedAt).toLocaleTimeString("id-ID", {
    hour: "2-digit", minute: "2-digit",
  });
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "11px 14px", border: BD, borderRadius: RAD.md,
      background: "#FAFAFA", boxShadow: SHs,
    }}>
      {/* Index badge */}
      <div style={{
        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: mode?.accent ?? "#6366F1", color: "#fff",
        border: BD, fontWeight: 900, fontSize: 13,
      }}>
        {index + 1}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 2 }}>
          <span style={{ fontWeight: 800, fontSize: 13, color: "#fff5f5" }}>
            {mode?.label ?? session.modeKey}
          </span>
          <span style={{
            background: mode?.accent ?? "#6366F1", color: "#fff",
            borderRadius: 6, padding: "1px 8px", fontSize: 10, fontWeight: 800, border: "1.5px solid #111",
          }}>
            {mins}m
          </span>
        </div>
        <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0, fontWeight: 700,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {session.material ? session.material : "Sesi fokus"}&nbsp;&middot;&nbsp;{time}
        </p>
      </div>

      {/* Done mark */}
      <div style={{
        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
        background: "#F0FDF4", border: "2px solid #22C55E",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Ico d={ICONS.check} size={14} color="#22C55E" sw={2.8} />
      </div>
    </div>
  );
}

/* ── Section heading helper ───────────────────────────── */
function SectionHead({ icon, iconBg, iconColor, title, right }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <div style={{
        width: 34, height: 34, borderRadius: 9, background: iconBg,
        border: BD, boxShadow: SHs,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Ico d={icon} size={16} color={iconColor} sw={2.3} />
      </div>
      <h2 style={{ fontWeight: 900, fontSize: 14, color: "#111", margin: 0, flex: 1 }}>{title}</h2>
      {right}
    </div>
  );
}

/* ── Label for inputs ─────────────────────────────────── */
function FieldLabel({ children }) {
  return (
    <label style={{
      display: "block", fontWeight: 800, fontSize: 10, color: "#6B7280",
      textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6,
    }}>
      {children}
    </label>
  );
}

/* ═══════════════════════════════════════════════════════
   FokusMode — main page
═══════════════════════════════════════════════════════ */
export function FokusMode() {
  const { user }  = useAuth();
  const { state, dispatch, requestNotifPermission, loadToday } = useFokus();

  // ── Custom duration local state ──────────────────────
  // Tracks what the user is typing; dispatched on Enter or blur.
  const [inputMin, setInputMin] = useState(() => String(Math.round(state.totalSeconds / 60)));

  // Keep input in sync when mode preset changes totalSeconds from context
  useEffect(() => {
    setInputMin(String(Math.round(state.totalSeconds / 60)));
  }, [state.totalSeconds]);

  function applyDuration() {
    const raw = parseInt(inputMin, 10);
    if (isNaN(raw) || raw < 1) { setInputMin("1");   dispatch({ type: "SET_DURATION", minutes: 1   }); return; }
    if (raw > 999)              { setInputMin("999"); dispatch({ type: "SET_DURATION", minutes: 999 }); return; }
    dispatch({ type: "SET_DURATION", minutes: raw });
  }

  // ── Load Supabase data once per user ─────────────────
  const loadedRef = useRef(false);
  useEffect(() => {
    if (user?.uid && !loadedRef.current) {
      loadedRef.current = true;
      loadToday(user.uid);
    }
  }, [user?.uid]);

  useEffect(() => { requestNotifPermission(); }, []);

  // ── Derived ──────────────────────────────────────────
  const mode      = MODES[state.modeKey];
  const R         = 96;
  const circ      = 2 * Math.PI * R;
  const progress  = 1 - state.timeLeft / state.totalSeconds;
  const totalMins = Math.floor(state.totalFocusSecs / 60);
  const DAILY_GOAL = 4;
  const goalPct   = Math.min(100, Math.round((state.completedToday / DAILY_GOAL) * 100));

  // ─────────────────────────────────────────────────────
  return (
    <div style={{ paddingBottom: 60 }}>

      <style>{`
        @keyframes fadePop {
          from { transform: scale(0.95); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1);   }
          50%       { opacity: 0.4; transform: scale(0.7); }
        }
        /* Responsive grid */
        .fokus-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }
        @media (min-width: 768px) {
          .fokus-grid { grid-template-columns: minmax(0, 1fr) 320px; }
        }
        /* Input focus ring */
        .fokus-input:focus {
          outline: none;
          border-color: var(--accent) !important;
          box-shadow: 0 0 0 3px var(--accent-20) !important;
        }
      `}</style>

      {/* ── Page header ──────────────────────────────── */}
      <div style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12, background: "#6366F1",
          border: BD, boxShadow: SHs,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Ico d={ICONS.clock} size={24} color="#fff" sw={2} />
        </div>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#111", margin: 0 }}>Fokus Mode</h1>
          <p style={{ fontSize: 12, color: "#6B7280", margin: 0, fontWeight: 700 }}>
            Pomodoro · Timer berjalan saat pindah tab
          </p>
        </div>
      </div>

      {/* ════════ Main 2-column grid ════════ */}
      <div className="fokus-grid">

        {/* ══ LEFT — Timer column ══════════════════════ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Mode selector */}
          <div style={{ border: BD, borderRadius: RAD.lg, background: "#fff", padding: "16px 20px", boxShadow: SH }}>
            <SectionHead icon={ICONS.bolt} iconBg="#EEF2FF" iconColor="#6366F1" title="Mode Fokus" />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {Object.values(MODES).map((m) => {
                const isActive = state.modeKey === m.key;
                return (
                  <button
                    key={m.key}
                    onClick={() => dispatch({ type: "SET_MODE", key: m.key })}
                    style={{
                      display: "flex", alignItems: "center", gap: 7,
                      padding: "8px 14px",
                      border: isActive ? `3px solid ${m.accent}` : BD,
                      borderRadius: RAD.sm, cursor: "pointer",
                      fontWeight: 900, fontSize: 12,
                      background:  isActive ? m.accent : "#fff",
                      color:       isActive ? "#fff"   : "#374151",
                      boxShadow:   isActive ? `4px 4px 0 ${m.accent}` : SHs,
                      transform:   isActive ? "translate(1px,1px)" : "none",
                      transition:  "all 0.12s",
                    }}
                  >
                    {m.label}
                    <span style={{
                      fontSize: 10, fontWeight: 800,
                      background: isActive ? "rgba(255,255,255,0.25)" : "#F3F4F6",
                      color:      isActive ? "#fff" : "#6B7280",
                      padding: "1px 6px", borderRadius: 4,
                    }}>
                      {m.minutes}m
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Timer ring card (light) */}
          <div style={{
            border: BD, borderRadius: RAD.xl, background: "#fff",
            padding: "28px 24px 24px", boxShadow: SH, textAlign: "center",
          }}>
            {/* SVG arc ring */}
            <div style={{
              position: "relative", display: "inline-flex",
              alignItems: "center", justifyContent: "center", marginBottom: 20,
            }}>
              <svg width={240} height={240} viewBox="0 0 240 240">
                <circle cx="120" cy="120" r={R} fill="none"
                  stroke="rgba(0,0,0,0.08)" strokeWidth={12} />
                <circle cx="120" cy="120" r={R} fill="none"
                  stroke={mode.accent} strokeWidth={12}
                  strokeDasharray={circ}
                  strokeDashoffset={circ * (1 - progress)}
                  strokeLinecap="round"
                  style={{
                    transform: "rotate(-90deg)", transformOrigin: "50% 50%",
                    transition: "stroke-dashoffset 0.9s linear",
                    filter: `drop-shadow(0 0 10px ${mode.accent}88)`,
                  }}
                />
                <circle cx="120" cy="120" r={R - 16} fill="#F9FAFB" />
              </svg>

              {/* Overlay text */}
              <div style={{ position: "absolute", textAlign: "center" }}>
                <p style={{
                  fontSize: 48, fontWeight: 900, color: "#111",
                  margin: 0, lineHeight: 1, letterSpacing: "-2px",
                  fontVariantNumeric: "tabular-nums",
                }}>
                  {fmt(state.timeLeft)}
                </p>
                <p style={{
                  fontSize: 10, fontWeight: 800, color: mode.accent,
                  margin: "8px 0 0", textTransform: "uppercase", letterSpacing: "0.14em",
                }}>
                  {mode.label}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div style={{ display: "flex", justifyContent: "center", gap: 14 }}>
              {/* Reset */}
              <button
                onClick={() => dispatch({ type: "RESET" })}
                style={{
                  width: 56, height: 56, borderRadius: "50%",
                  border: "2.5px solid rgba(0,0,0,0.1)",
                  background: "rgba(0,0,0,0.05)",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.12s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.1)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.05)"; }}
                title="Reset"
              >
                <Ico d={ICONS.reset} size={20} color="#111" sw={2.2} />
              </button>

              {/* Play / Pause */}
              <button
                onClick={() => dispatch({ type: "TOGGLE_RUN" })}
                style={{
                  width: 68, height: 68, borderRadius: "50%",
                  border: `3px solid ${mode.accent}`,
                  background: state.running ? "#fff" : mode.accent,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: `4px 4px 0 ${mode.accent}`,
                  transition: "all 0.12s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.06)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
              >
                {state.running
                  ? <Ico d={ICONS.pause} size={26} color={mode.accent} sw={0} fill={mode.accent} />
                  : <Ico d={ICONS.play}  size={26} color="#fff"        sw={0} fill="#fff" />
                }
              </button>

              {/* Placeholder symmetry button (future: skip) */}
              <button
                onClick={() => dispatch({ type: "PAUSE" })}
                style={{
                  width: 56, height: 56, borderRadius: "50%",
                  border: "2.5px solid rgba(0,0,0,0.1)",
                  background: "rgba(0,0,0,0.05)",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.12s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.1)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.05)"; }}
                title="Pause"
              >
                <Ico d={ICONS.pause} size={20} color="rgba(0,0,0,0.5)" sw={2} fill="rgba(0,0,0,0.5)" />
              </button>
            </div>

            {/* Running status pill */}
            <div style={{
              marginTop: 18, height: 20,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {state.running ? (
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%", background: "#22C55E",
                    animation: "pulseDot 1.2s ease-in-out infinite",
                  }} />
                  <span style={{ fontSize: 10, fontWeight: 800, color: "#22C55E",
                    textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Sedang berjalan
                  </span>
                </div>
              ) : (
                <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(0,0,0,0.3)",
                  textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Siap dimulai
                </span>
              )}
            </div>
          </div>

          {/* Custom duration input */}
          <div style={{ border: BD, borderRadius: RAD.md, background: "#fff", padding: "16px 20px", boxShadow: SH }}>
            <SectionHead icon={ICONS.pen} iconBg="#FEF9C3" iconColor="#D97706" title="Durasi Kustom" />

            <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
              <div style={{ flex: 1, position: "relative" }}>
                <input
                  type="text"
                  inputMode="numeric"
                  value={inputMin}
                  onChange={(e) => {
                    // Allow only digits
                    if (/^\d*$/.test(e.target.value)) setInputMin(e.target.value);
                  }}
                  onKeyDown={(e) => { if (e.key === "Enter") applyDuration(); }}
                  onBlur={applyDuration}
                  placeholder="25"
                  style={{
                    width: "100%", boxSizing: "border-box",
                    padding: "10px 52px 10px 14px",
                    border: BD, borderRadius: RAD.sm,
                    background: "#F9FAFB", fontWeight: 800, fontSize: 15,
                    color: "#111", outline: "none",
                    boxShadow: "inset 2px 2px 0 rgba(0,0,0,0.04)",
                    transition: "border-color 0.15s, box-shadow 0.15s",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = mode.accent;
                    e.target.style.boxShadow = `0 0 0 3px ${mode.accent}33`;
                  }}
                  onBlurCapture={(e) => {
                    e.target.style.borderColor = "#111";
                    e.target.style.boxShadow   = "inset 2px 2px 0 rgba(0,0,0,0.04)";
                  }}
                />
                {/* "min" unit label inside input */}
                <span style={{
                  position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                  fontSize: 11, fontWeight: 800, color: "#9CA3AF", pointerEvents: "none",
                }}>
                  menit
                </span>
              </div>

              {/* Apply button */}
              <button
                onClick={applyDuration}
                disabled={state.running}
                style={{
                  padding: "0 18px", border: BD, borderRadius: RAD.sm,
                  background: state.running ? "#E5E7EB" : mode.accent,
                  color: state.running ? "#9CA3AF" : "#fff",
                  fontWeight: 900, fontSize: 12,
                  cursor: state.running ? "not-allowed" : "pointer",
                  boxShadow: state.running ? "none" : SHs,
                  whiteSpace: "nowrap",
                  transition: "all 0.12s",
                }}
              >
                Set
              </button>
            </div>

            <p style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 600, margin: "8px 0 0" }}>
              Ketik bebas 1&ndash;999 menit · tekan Enter atau klik Set
              {state.running ? " · Pause dulu untuk mengubah durasi" : ""}
            </p>
          </div>
        </div>

        {/* ══ RIGHT — Info column ═══════════════════════ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Study input */}
          <div style={{ border: BD, borderRadius: RAD.lg, background: "#fff", padding: "18px 20px", boxShadow: SH }}>
            <SectionHead icon={ICONS.book} iconBg="#EEF2FF" iconColor="#4F46E5" title="Sedang Belajar Apa?" />

            <div style={{ marginBottom: 14 }}>
              <FieldLabel>Materi Saat Ini</FieldLabel>
              <input
                value={state.material}
                onChange={(e) => dispatch({ type: "SET_MATERIAL", value: e.target.value })}
                placeholder="cth: Bab 3 — Turunan Fungsi"
                style={{
                  width: "100%", boxSizing: "border-box",
                  padding: "10px 12px", border: BD, borderRadius: RAD.sm,
                  background: "#F9FAFB", fontWeight: 700, fontSize: 13, color: "#111",
                  outline: "none", boxShadow: "inset 2px 2px 0 rgba(0,0,0,0.04)",
                  transition: "border-color 0.15s, box-shadow 0.15s",
                }}
                onFocus={(e) => { e.target.style.borderColor = mode.accent; e.target.style.boxShadow = `0 0 0 3px ${mode.accent}33`; }}
                onBlur={(e)  => { e.target.style.borderColor = "#111"; e.target.style.boxShadow = "inset 2px 2px 0 rgba(0,0,0,0.04)"; }}
              />
            </div>

            <div>
              <FieldLabel>Target Sesi Ini</FieldLabel>
              <input
                value={state.target}
                onChange={(e) => dispatch({ type: "SET_TARGET", value: e.target.value })}
                placeholder="cth: Selesaikan 5 soal latihan"
                style={{
                  width: "100%", boxSizing: "border-box",
                  padding: "10px 12px", border: BD, borderRadius: RAD.sm,
                  background: "#F9FAFB", fontWeight: 700, fontSize: 13, color: "#111",
                  outline: "none", boxShadow: "inset 2px 2px 0 rgba(0,0,0,0.04)",
                  transition: "border-color 0.15s, box-shadow 0.15s",
                }}
                onFocus={(e) => { e.target.style.borderColor = mode.accent; e.target.style.boxShadow = `0 0 0 3px ${mode.accent}33`; }}
                onBlur={(e)  => { e.target.style.borderColor = "#111"; e.target.style.boxShadow = "inset 2px 2px 0 rgba(0,0,0,0.04)"; }}
              />
            </div>
          </div>

          {/* Stats 2×2 grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <StatTile icon={ICONS.check}   label="Sesi Selesai" value={state.completedToday} accent="#22C55E" bg="#F0FDF4" />
            <StatTile icon={ICONS.history} label="Total Fokus"  value={`${totalMins}m`}      accent="#6366F1" bg="#EEF2FF" />
            <StatTile icon={ICONS.fire}    label="Streak Sesi"  value={state.sessionCount}   accent="#F59E0B" bg="#FFFBEB" />
            <StatTile icon={ICONS.bars}    label="Goal Harian"  value={`${goalPct}%`}         accent="#EC4899" bg="#FDF2F8" />
          </div>

          {/* Daily goal progress */}
          <div style={{ border: BD, borderRadius: RAD.md, background: "#fff", padding: "14px 18px", boxShadow: SH }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <p style={{ fontWeight: 900, fontSize: 12, color: "#111", margin: 0 }}>Target Harian</p>
              <span style={{
                fontSize: 11, fontWeight: 800, color: "#6B7280",
                background: "#F3F4F6", border: "2px solid #E5E7EB",
                borderRadius: 6, padding: "2px 9px",
              }}>
                {state.completedToday} / {DAILY_GOAL} sesi
              </span>
            </div>
            <div style={{ height: 12, background: "#F3F4F6", border: BD, borderRadius: 8, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 5,
                background: goalPct >= 100 ? "#22C55E" : "#6366F1",
                width: `${goalPct}%`,
                transition: "width 0.5s cubic-bezier(.4,0,.2,1)",
              }} />
            </div>
            {goalPct >= 100 && (
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 6 }}>
                <Ico d={ICONS.check} size={13} color="#22C55E" sw={2.8} />
                <span style={{ fontSize: 11, fontWeight: 800, color: "#22C55E" }}>
                  Target harian tercapai!
                </span>
              </div>
            )}
          </div>

          {/* Insight card (after 1+ session) */}
          {state.sessions.length > 0 && (
            <div style={{
              border: "3px solid #6366F1", borderRadius: RAD.md,
              background: "#EEF2FF", padding: "14px 18px", boxShadow: "5px 5px 0 #6366F1",
              animation: "fadePop 0.3s ease",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 8, background: "#6366F1",
                  border: BD, boxShadow: SHs,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Ico d={ICONS.bolt} size={14} color="#fff" sw={2} />
                </div>
                <p style={{ fontWeight: 900, fontSize: 12, color: "#3730A3", margin: 0 }}>Insight Fokus</p>
              </div>
              <p style={{ fontSize: 12, color: "#4338CA", margin: 0, lineHeight: 1.65, fontWeight: 600 }}>
                Sudah <strong>{state.sessions.length} sesi</strong> fokus, total{" "}
                <strong>{totalMins} menit</strong> hari ini.{" "}
                {DAILY_GOAL - state.completedToday > 0
                  ? `Tambah ${DAILY_GOAL - state.completedToday} sesi lagi untuk target harian!`
                  : "Target harian sudah terpenuhi, kerja bagus!"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ════════ Session history — ALWAYS SHOWN ════════ */}
      <div style={{
        marginTop: 24,
        border: BD, borderRadius: RAD.lg, background: "#fff",
        padding: "20px 22px", boxShadow: SH,
      }}>
        <SectionHead
          icon={ICONS.history} iconBg="#FEFCE8" iconColor="#D97706"
          title="Riwayat Sesi Hari Ini"
          right={
            state.sessions.length > 0 && (
              <span style={{
                fontSize: 11, fontWeight: 800, color: "#9CA3AF",
                background: "#F3F4F6", border: "2px solid #E5E7EB",
                borderRadius: 6, padding: "2px 9px",
              }}>
                {state.sessions.length} sesi
              </span>
            )
          }
        />

        {state.sessions.length === 0 ? (
          /* Empty state — stays inside the white card */
          <div style={{
            background: "#fff",
            border: "2.5px dashed #E5E7EB",
            borderRadius: RAD.md,
            padding: "36px 24px",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              background: "#F3F4F6", border: "2.5px solid #E5E7EB",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Ico d={ICONS.clock} size={26} color="#D1D5DB" sw={1.8} />
            </div>
            <p style={{ fontWeight: 900, fontSize: 14, color: "#374151", margin: 0 }}>
              Belum ada sesi hari ini
            </p>
            <p style={{ fontSize: 12, color: "#9CA3AF", margin: 0, fontWeight: 600, textAlign: "center" }}>
              Mulai timer di atas dan selesaikan sesi agar riwayat muncul di sini.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {state.sessions.map((s, i) => (
              <SessionRow key={s.id} session={s} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FokusMode;
