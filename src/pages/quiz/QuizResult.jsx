import { useLocation, useNavigate, useParams } from "react-router-dom";

/* ── Tokens ─────────────────────────────────────────────── */
const SH  = "5px 5px 0px #111";
const SHs = "3px 3px 0px #111";
const SHl = "7px 7px 0px #111";
const BD  = "3px solid #111";

function Ico({ d, size = 18, color = "#111", sw = 2.2, fill = "none" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
      stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden style={{ flexShrink: 0, display: "block" }}>
      <path d={d} />
    </svg>
  );
}

/* ── Grade config ────────────────────────────────────────── */
function getGrade(pct, isPerfect) {
  if (isPerfect)  return { label: "PERFECT!", bg: "#FFE566", accent: "#111",    shadow: "#111", icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.17.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.64-.381-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z", icoFill: "#111" };
  if (pct >= 80)  return { label: "GREAT JOB!", bg: "#7EEACA", accent: "#065F46", shadow: "#065F46", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", icoFill: "none" };
  if (pct >= 60)  return { label: "GOOD!", bg: "#7EC8F8", accent: "#1E3A8A", shadow: "#1E3A8A", icon: "M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z", icoFill: "none" };
  if (pct >= 40)  return { label: "KEEP GOING!", bg: "#FDBA74", accent: "#7C2D12", shadow: "#7C2D12", icon: "M13 10V3L4 14h7v7l9-11h-7z", icoFill: "none" };
  return           { label: "TRY AGAIN!", bg: "#FF8A8A", accent: "#7F1D1D", shadow: "#7F1D1D", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z", icoFill: "none" };
}

export function QuizResult() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    score = 0, total = 10, expEarned = 0,
    timeTaken = 0, answers = {}, questions = [], quiz = {},
    savedToCloud = false,
  } = location.state || {};

  const isPerfect = score === total;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const grade = getGrade(pct, isPerfect);
  const mins = Math.floor(timeTaken / 60);
  const secs = timeTaken % 60;

  // Arc gauge
  const R = 68;
  const circ = 2 * Math.PI * R;
  const offset = circ * (1 - pct / 100);

  return (
    <div style={{ marginTop: 36, paddingBottom: 64, maxWidth: 680, margin: "36px auto 64px" }}>

      {/* ── Cloud save notice ── */}
      {savedToCloud ? (
        <div style={{
          display: "flex", alignItems: "center", gap: 8, marginBottom: 16,
          padding: "10px 16px", borderRadius: 12, border: "2px solid #22C55E",
          background: "#F0FDF4", boxShadow: "3px 3px 0 #16A34A",
        }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3"/>
          </svg>
          <span style={{ fontSize: 13, fontWeight: 800, color: "#15803D" }}>
            Progress tersimpan ke akunmu ✓
          </span>
        </div>
      ) : (
        <div style={{
          display: "flex", alignItems: "center", gap: 8, marginBottom: 16,
          padding: "10px 16px", borderRadius: 12, border: "2px solid #F59E0B",
          background: "#FFFBEB", boxShadow: "3px 3px 0 #D97706",
        }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          </svg>
          <span style={{ fontSize: 13, fontWeight: 800, color: "#92400E" }}>
            Kamu belum login — hasil quiz tidak tersimpan.{" "}
            <a href="/zooask/auth/sign-in" style={{ color: "#1D4ED8", textDecoration: "underline" }}>
              Login untuk simpan progress
            </a>
          </span>
        </div>
      )}

      {/* ── Hero result card ── */}
      <div style={{
        border: BD, borderRadius: 20, background: grade.bg,
        boxShadow: `7px 7px 0 ${grade.shadow}`,
        padding: "clamp(20px,5vw,36px)", textAlign: "center", marginBottom: 20,
        position: "relative", overflow: "hidden",
      }}>
        {/* Stars decoration for perfect */}
        {isPerfect && (
          <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
            {[...Array(8)].map((_, i) => (
              <div key={i} style={{
                position: "absolute",
                left: `${10 + i * 12}%`, top: `${8 + (i % 3) * 25}%`,
                width: 8, height: 8, borderRadius: "50%",
                background: "#111", opacity: 0.12,
              }} />
            ))}
          </div>
        )}

        {/* Grade icon */}
        <div style={{ width: 64, height: 64, borderRadius: 16, background: "#fff",
          border: BD, boxShadow: SH, margin: "0 auto 14px",
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Ico d={grade.icon} size={32} color={grade.accent} sw={2} fill={grade.icoFill === "#111" ? grade.accent : "none"} />
        </div>

        <h1 style={{ fontWeight: 900, fontSize: "clamp(22px,5vw,32px)", color: grade.accent,
          margin: "0 0 6px", letterSpacing: "-0.5px" }}>
          {grade.label}
        </h1>
        <p style={{ fontWeight: 800, fontSize: 14, color: grade.accent, opacity: 0.7, margin: "0 0 20px" }}>
          {quiz?.title}
        </p>

        {/* Score arc */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <svg width={170} height={170} viewBox="0 0 170 170">
            <circle cx="85" cy="85" r={R} fill="none" stroke={grade.accent} strokeWidth={10} strokeOpacity={0.15} />
            <circle cx="85" cy="85" r={R} fill="none" stroke={grade.accent} strokeWidth={10}
              strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
              style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%",
                transition: "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)" }} />
            <text x="85" y="78" textAnchor="middle" fontSize="30" fontWeight="900" fill={grade.accent}>{pct}%</text>
            <text x="85" y="98" textAnchor="middle" fontSize="13" fontWeight="800" fill={grade.accent} opacity="0.7">
              {score}/{total} correct
            </text>
          </svg>
        </div>

        {/* XP earned */}
        {expEarned > 0 ? (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8,
            background: "#fff", border: BD, borderRadius: 12, padding: "8px 18px", boxShadow: SHs }}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill={grade.accent} stroke={grade.accent} strokeWidth={1.5}
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.17.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.64-.381-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <span style={{ fontWeight: 900, fontSize: 16, color: grade.accent }}>+{expEarned} XP Earned!</span>
          </div>
        ) : (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,0.6)", border: `2px solid ${grade.accent}`, borderRadius: 10,
            padding: "7px 16px", opacity: 0.7 }}>
            <Ico d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              size={16} color={grade.accent} sw={2.2} />
            <span style={{ fontWeight: 800, fontSize: 13, color: grade.accent }}>
              Get all {total} right to earn XP
            </span>
          </div>
        )}
      </div>

      {/* ── 3-stat row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 18 }}>
        {[
          { label: "Correct",  value: score, bg: "#F0FDF4", accent: "#15803D", border: "#22C55E",
            icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
          { label: "Wrong",    value: total - score, bg: "#FFF1F2", accent: "#B91C1C", border: "#DC2626",
            icon: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" },
          { label: "Time",     value: `${mins}:${String(secs).padStart(2,"0")}`, bg: "#EEF2FF", accent: "#3730A3", border: "#6366F1",
            icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
        ].map(({ label, value, bg, accent, border, icon }) => (
          <div key={label} style={{ border: `3px solid ${border}`, borderRadius: 14, background: bg,
            padding: "16px 12px", textAlign: "center", boxShadow: `4px 4px 0 ${border}` }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
              <Ico d={icon} size={22} color={accent} sw={2.2} />
            </div>
            <p style={{ fontSize: "clamp(18px,4vw,24px)", fontWeight: 900, color: accent, margin: "0 0 3px" }}>
              {value}
            </p>
            <p style={{ fontSize: 11, fontWeight: 800, color: accent, opacity: 0.7,
              margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* ── Answer review ── */}
      <div style={{ border: BD, borderRadius: 18, background: "#fff",
        padding: "18px 20px", boxShadow: SH, marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: "#FEF9C3",
            border: BD, boxShadow: SHs, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Ico d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              size={17} color="#D97706" sw={2.3} />
          </div>
          <h2 style={{ fontWeight: 900, fontSize: 15, color: "#111", margin: 0 }}>Answer Review</h2>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 900, color: "#15803D",
              background: "#F0FDF4", border: "2px solid #22C55E", borderRadius: 6,
              padding: "2px 8px", boxShadow: "2px 2px 0 #22C55E" }}>
              {score} ✓
            </span>
            <span style={{ fontSize: 11, fontWeight: 900, color: "#B91C1C",
              background: "#FFF1F2", border: "2px solid #DC2626", borderRadius: 6,
              padding: "2px 8px", boxShadow: "2px 2px 0 #DC2626" }}>
              {total - score} ✗
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {questions.map((q, i) => {
            const ua = answers[q.id];
            const isRight = ua === q.correct_option;
            const opts = { a: q.option_a, b: q.option_b, c: q.option_c, d: q.option_d };
            return (
              <div key={q.id} style={{
                border: `2.5px solid ${isRight ? "#22C55E" : "#DC2626"}`,
                borderRadius: 12,
                background: isRight ? "#F0FDF4" : "#FFF1F2",
                padding: "11px 14px",
                boxShadow: `3px 3px 0 ${isRight ? "#22C55E" : "#DC2626"}`,
                display: "flex", alignItems: "flex-start", gap: 10,
              }}>
                {/* Icon */}
                <div style={{ width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                  background: isRight ? "#22C55E" : "#DC2626", border: "2.5px solid #111",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "2px 2px 0 #111" }}>
                  <Ico d={isRight
                    ? "M20 6L9 17l-5-5"
                    : "M18 6L6 18M6 6l12 12"}
                    size={13} color="#fff" sw={3} />
                </div>

                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 800, color: "#111",
                    margin: "0 0 5px", lineHeight: 1.4 }}>
                    {i + 1}. {q.question_text}
                  </p>
                  {isRight ? (
                    <p style={{ fontSize: 12, fontWeight: 700, color: "#15803D", margin: 0 }}>
                      ({q.correct_option.toUpperCase()}) {opts[q.correct_option]}
                    </p>
                  ) : (
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 700, color: "#B91C1C", margin: "0 0 2px" }}>
                        Your answer: {ua ? `(${ua.toUpperCase()}) ${opts[ua]}` : "Not answered"}
                      </p>
                      <p style={{ fontSize: 12, fontWeight: 800, color: "#15803D", margin: 0 }}>
                        Correct: ({q.correct_option.toUpperCase()}) {opts[q.correct_option]}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Action buttons ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <button
          onClick={() => navigate("/dashboard/quiz")}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
            padding: "14px", borderRadius: 14, border: BD, background: "#fff",
            fontWeight: 900, fontSize: 13, color: "#111", cursor: "pointer",
            letterSpacing: "0.05em", textTransform: "uppercase",
            boxShadow: SH, transition: "all 0.12s" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#111"; e.currentTarget.style.color = "#FFE566"; e.currentTarget.style.transform = "translate(2px,2px)"; e.currentTarget.style.boxShadow = SHs; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#111"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = SH; }}>
          <Ico d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            size={16} color="inherit" sw={2.5} />
          Back Home
        </button>
        <button
          onClick={() => navigate(`/dashboard/quiz/${quizId}`)}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
            padding: "14px", borderRadius: 14, border: BD, background: "#FFE566",
            fontWeight: 900, fontSize: 13, color: "#111", cursor: "pointer",
            letterSpacing: "0.05em", textTransform: "uppercase",
            boxShadow: SH, transition: "all 0.12s" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#111"; e.currentTarget.style.color = "#FFE566"; e.currentTarget.style.transform = "translate(2px,2px)"; e.currentTarget.style.boxShadow = SHs; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#FFE566"; e.currentTarget.style.color = "#111"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = SH; }}>
          <Ico d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            size={16} color="inherit" sw={2.5} />
          Retry Quiz
        </button>
      </div>
    </div>
  );
}

export default QuizResult;