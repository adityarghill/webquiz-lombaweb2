import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/utils/supabase";

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

function Spinner() {
  return (
    <div style={{ marginTop: 100, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <style>{`@keyframes qs{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: 46, height: 46, border: BD, borderTopColor: "transparent",
        borderRadius: "50%", animation: "qs 0.75s linear infinite" }} />
      <p style={{ fontSize: 14, fontWeight: 800, color: "#6B7280" }}>Loading quiz info…</p>
    </div>
  );
}

/* ── Topic colour (matches QuizList palette) ─────────────── */
const TOPIC_PAL = [
  { bg: "#FFE566", tag: "#111" }, { bg: "#7EEACA", tag: "#064E3B" },
  { bg: "#FF8A8A", tag: "#7F1D1D" }, { bg: "#7EC8F8", tag: "#1E3A8A" },
  { bg: "#C9A0FF", tag: "#4C1D95" }, { bg: "#FDB97D", tag: "#7C2D12" },
];
function topicCfg(topic) {
  if (!topic) return TOPIC_PAL[0];
  let h = 0;
  for (let i = 0; i < topic.length; i++) h = (h * 31 + topic.charCodeAt(i)) % TOPIC_PAL.length;
  return TOPIC_PAL[h];
}

/* ── Compact recommendation card ────────────────────────── */
function MiniCard({ quiz, onClick }) {
  const [hov, setHov] = useState(false);
  const cfg = topicCfg(quiz.topic);
  
  return (
    <div
      onClick={() => onClick(quiz.slug)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        border: BD, borderRadius: 14, background: "#fff", overflow: "hidden",
        cursor: "pointer", userSelect: "none", display: "flex", flexDirection: "column",
        boxShadow: hov ? "6px 6px 0 #111" : SH,
        transform: hov ? "translate(-2px,-2px)" : "translate(0,0)",
        transition: "transform 0.12s ease, box-shadow 0.12s ease",
      }}
    >
      {/* Tiny banner */}
      <div style={{ height: 90, position: "relative", background: cfg.bg, overflow: "hidden", flexShrink: 0 }}>
        <img
          src={quiz.banner_image_url || "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&q=60"}
          alt={quiz.title}
          style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.7,
            transform: hov ? "scale(1.06)" : "scale(1)", transition: "transform 0.3s ease" }}
          loading="lazy"
        />
        {/* Topic pill */}
        <div style={{ position: "absolute", top: 8, left: 8, background: cfg.bg, border: BD,
          borderRadius: 6, padding: "2px 8px", fontSize: 10, fontWeight: 900,
          color: cfg.tag, boxShadow: SHs, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {quiz.topic}
        </div>
        {/* XP */}
        <div style={{ position: "absolute", top: 8, right: 8, background: "#FFE566", border: BD,
          borderRadius: 6, padding: "2px 8px", fontSize: 10, fontWeight: 900,
          color: "#111", boxShadow: SHs, display: "flex", alignItems: "center", gap: 3 }}>
          <svg width={10} height={10} viewBox="0 0 24 24" fill="#111" stroke="#111" strokeWidth={1.5}
            strokeLinecap="round" strokeLinejoin="round">
            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.17.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.64-.381-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          {quiz.exp_reward} XP
        </div>
      </div>
      {/* Body */}
      <div style={{ padding: "10px 12px 0", flex: 1 }}>
        <h4 style={{ fontWeight: 900, fontSize: 13, color: "#111", margin: "0 0 4px", lineHeight: 1.3 }}>
          {quiz.title}
        </h4>
        <p style={{ fontSize: 11, color: "#6B7280", margin: "0 0 10px", lineHeight: 1.5,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {quiz.description}
        </p>
        <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10,
            fontWeight: 800, color: "#6366F1", background: "#EEF2FF",
            border: "2px solid #6366F1", borderRadius: 6, padding: "2px 7px", boxShadow: "2px 2px 0 #6366F1" }}>
            <Ico d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" size={11} color="#6366F1" sw={2.4} />
            {quiz.question_count || 10} Soal
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10,
            fontWeight: 800, color: "#059669", background: "#ECFDF5",
            border: "2px solid #059669", borderRadius: 6, padding: "2px 7px", boxShadow: "2px 2px 0 #059669" }}>
            <Ico d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" size={11} color="#059669" sw={2.4} />
            {quiz.estimated_minutes} menit
          </span>
        </div>
      </div>
      {/* Footer */}
      <div style={{ borderTop: BD, background: hov ? "#111" : "#F9FAFB",
        padding: "8px 12px", display: "flex", alignItems: "center", justifyContent: "space-between",
        transition: "background 0.12s", flexShrink: 0 }}>
        <span style={{ fontWeight: 900, fontSize: 10, textTransform: "uppercase",
          letterSpacing: "0.07em", color: hov ? "#FFE566" : "#111" }}>
          Coba Sekarang
        </span>
        <Ico d="M5 12h14M12 5l7 7-7 7" size={13} color={hov ? "#FFE566" : "#111"} sw={2.8} />
      </div>
    </div>
  );
}
function Stat({ icon, label, value, bg, accent, shadow }) {
  return (
    <div style={{ border: `2.5px solid ${accent}`, borderRadius: 14, background: bg,
      padding: "14px 16px", boxShadow: `4px 4px 0 ${accent}`,
      display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: "#fff",
        border: `2.5px solid ${accent}`, boxShadow: `2px 2px 0 ${accent}`,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: 10, fontWeight: 900, color: accent, margin: "0 0 2px",
          textTransform: "uppercase", letterSpacing: "0.07em", opacity: 0.8 }}>{label}</p>
        <p style={{ fontSize: 13, fontWeight: 900, color: accent, margin: 0, lineHeight: 1.3 }}>{value}</p>
      </div>
    </div>
  );
}

/* ── History row ────────────────────────────────────────── */
function HistoryRow({ result, index, total }) {
  const pct = Math.round((result.score / result.total_questions) * 100);
  const isPerfect = result.score === result.total_questions;
  const mins = Math.floor(result.time_taken_seconds / 60);
  const secs = result.time_taken_seconds % 60;
  const date = new Date(result.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12,
      padding: "10px 14px", border: BD, borderRadius: 12, background: isPerfect ? "#F0FDF4" : "#FFFBEB",
      boxShadow: isPerfect ? "3px 3px 0 #22C55E" : "3px 3px 0 #F59E0B" }}>
      <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, fontWeight: 900,
        fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center",
        background: "#fff", border: BD }}>
        #{index + 1}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontWeight: 900, fontSize: 14, color: "#111" }}>{result.score}/{result.total_questions}</span>
          <span style={{ fontWeight: 700, fontSize: 12, color: "#6B7280" }}>({pct}%)</span>
          {isPerfect && (
            <span style={{ background: "#22C55E", border: "2px solid #111", borderRadius: 6,
              padding: "1px 7px", fontSize: 10, fontWeight: 900, color: "#fff",
              letterSpacing: "0.06em", textTransform: "uppercase", boxShadow: "2px 2px 0 #111" }}>
              PASS
            </span>
          )}
        </div>
        <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0, fontWeight: 700 }}>
          {date} · {mins}:{String(secs).padStart(2, "0")} min
          {result.exp_earned > 0 && ` · +${result.exp_earned} XP`}
        </p>
      </div>
      {/* Mini progress bar */}
      <div style={{ width: 60, height: 8, background: "#E5E7EB", border: "2px solid #111", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: isPerfect ? "#22C55E" : "#F59E0B",
          borderRadius: 2, transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────── */
export function QuizDetail() {
  const { quizSlug } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [history, setHistory] = useState([]);
  const [otherQuizzes, setOtherQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startHov, setStartHov] = useState(false);
  const [backHov, setBackHov] = useState(false);

  useEffect(() => { fetchAll(); }, [quizSlug]);

  async function fetchAll() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch quiz directly by slug
    const { data: q, error } = await supabase
      .from("quizzes")
      .select("*")
      .eq("slug", quizSlug)
      .single();

    if (error || !q) {
      setLoading(false);
      return;
    }

    const [{ count }, { data: hist }, { data: others }] = await Promise.all([
      supabase.from("questions").select("*", { count: "exact", head: true }).eq("quiz_id", q.id),
      user
        ? supabase.from("quiz_results")
            .select("*")
            .eq("user_id", user.id)
            .eq("quiz_id", q.id)
            .order("completed_at", { ascending: false })
            .limit(5)
        : Promise.resolve({ data: [] }),
      // Fetch 3 other quizzes (different from current)
      supabase.from("quizzes").select("*, question_count:questions(count)").neq("id", q.id).limit(3),
    ]);

    setQuiz(q);
    setQuestionCount(count || 10);
    if (hist) setHistory(hist);
    if (others) {
      setOtherQuizzes(others.map((o) => ({
        ...o,
        question_count: o.question_count?.[0]?.count ?? 10,
      })));
    }
    setLoading(false);
  }

  if (loading) return <Spinner />;
  if (!quiz) return (
    <div style={{ marginTop: 80, textAlign: "center" }}>
      <p style={{ fontWeight: 800, color: "#6B7280" }}>Quiz not found.</p>
      <button onClick={() => navigate("/dashboard/quiz")}
        style={{ marginTop: 12, fontWeight: 900, color: "#6366F1", background: "none",
          border: "none", cursor: "pointer", fontSize: 14 }}>
        ← Back to Quizzes
      </button>
    </div>
  );

  const bestScore = history.length > 0 ? Math.max(...history.map(h => h.score)) : null;
  const isPassed = bestScore !== null && bestScore === questionCount;
  const hasPlayed = history.length > 0;

  const stats = [
    { label: "Questions", value: `${questionCount} Questions`, bg: "#EEF2FF", accent: "#4F46E5",
      icon: <Ico d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" size={20} color="#4F46E5" sw={2.2} /> },
    { label: "Est. Time", value: `~${quiz.estimated_minutes} min`, bg: "#ECFDF5", accent: "#059669",
      icon: <Ico d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" size={20} color="#059669" sw={2.2} /> },
    { label: "XP Reward", value: `${quiz.exp_reward} XP (perfect)`, bg: "#FEFCE8", accent: "#D97706",
      icon: <Ico d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.17.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.64-.381-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" size={20} color="#D97706" sw={2.2} /> },
    { label: "Timer", value: "30 sec / question", bg: "#FFF1F2", accent: "#E11D48",
      icon: <Ico d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" size={20} color="#E11D48" sw={2.2} /> },
  ];

  return (
    <div style={{ marginTop: 36, paddingBottom: 56 }}>

      {/* ── Back ── */}
      <button
        onClick={() => navigate("/dashboard/quiz")}
        onMouseEnter={() => setBackHov(true)}
        onMouseLeave={() => setBackHov(false)}
        style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 22,
          background: backHov ? "#111" : "#fff", border: BD, borderRadius: 10,
          padding: "7px 16px", cursor: "pointer", fontWeight: 900, fontSize: 12,
          color: backHov ? "#FFE566" : "#111", letterSpacing: "0.05em", textTransform: "uppercase",
          boxShadow: backHov ? SHs : SH,
          transform: backHov ? "translate(2px,2px)" : "translate(0,0)",
          transition: "all 0.12s ease" }}>
        <Ico d="M19 12H5M12 5l-7 7 7 7" size={14} color={backHov ? "#FFE566" : "#111"} sw={2.6} />
        Back to Quizzes
      </button>

      {/* ── Banner ── */}
      <div style={{ position: "relative", borderRadius: 18, overflow: "hidden",
        border: BD, boxShadow: SHl, height: 220, marginBottom: 22 }}>
        <img src={quiz.banner_image_url || "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=1200&q=80"}
          alt={quiz.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.7) 100%)" }} />
        {/* Topic pill */}
        <div style={{ position: "absolute", top: 14, left: 14, background: "#FFE566",
          border: BD, borderRadius: 8, padding: "4px 12px", fontWeight: 900,
          fontSize: 11, color: "#111", letterSpacing: "0.07em", textTransform: "uppercase",
          boxShadow: SHs }}>
          {quiz.topic}
        </div>
        {/* Pass badge on banner */}
        {isPassed && (
          <div style={{ position: "absolute", top: 14, right: 14, background: "#22C55E",
            border: BD, borderRadius: 8, padding: "4px 12px",
            display: "flex", alignItems: "center", gap: 6,
            fontWeight: 900, fontSize: 11, color: "#fff", boxShadow: "3px 3px 0 #111",
            letterSpacing: "0.06em", textTransform: "uppercase" }}>
            <Ico d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" size={13} color="#fff" sw={2.5} />
            PASSED
          </div>
        )}
        {/* Title on banner */}
        <h1 style={{ position: "absolute", bottom: 0, left: 0, right: 0,
          padding: "0 20px 18px",
          fontSize: "clamp(16px, 4vw, 24px)", fontWeight: 900, color: "#fff",
          margin: 0, lineHeight: 1.25, textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
          {quiz.title}
        </h1>
      </div>

      {/* ── Two-col layout ── */}
      <div style={{ display: "grid", gap: 18 }} className="qd-layout">

        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>

          {/* About */}
          <div style={{ border: BD, borderRadius: 16, background: "#fff",
            padding: "18px 20px", boxShadow: SH }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 11 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: "#EEF2FF",
                border: BD, boxShadow: SHs, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Ico d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" size={16} color="#4F46E5" sw={2.3} />
              </div>
              <h2 style={{ fontWeight: 900, fontSize: 14, color: "#111", margin: 0 }}>About This Quiz</h2>
            </div>
            <p style={{ fontSize: 13, color: "#6B7280", margin: 0, lineHeight: 1.7, fontWeight: 600 }}>
              {quiz.description}
            </p>
          </div>

          {/* Stats 2×2 grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {stats.map((s) => (
              <Stat key={s.label} icon={s.icon} label={s.label}
                value={s.value} bg={s.bg} accent={s.accent} />
            ))}
          </div>

          {/* Guide */}
          {quiz.guide && (
            <div style={{ border: "3px solid #D97706", borderRadius: 16, background: "#FFFBEB",
              padding: "16px 18px", boxShadow: "5px 5px 0 #D97706" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: "#FEF3C7",
                  border: "2.5px solid #D97706", boxShadow: "2px 2px 0 #D97706",
                  display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Ico d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    size={16} color="#92400E" sw={2.3} />
                </div>
                <h2 style={{ fontWeight: 900, fontSize: 14, color: "#92400E", margin: 0 }}>Quiz Guide</h2>
              </div>
              <p style={{ fontSize: 13, color: "#78350F", margin: 0, lineHeight: 1.7, fontWeight: 600 }}>
                {quiz.guide}
              </p>
            </div>
          )}

          {/* Score history */}
          {hasPlayed && (
            <div style={{ border: BD, borderRadius: 16, background: "#fff",
              padding: "18px 20px", boxShadow: SH }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: "#FEF9C3",
                  border: BD, boxShadow: SHs, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Ico d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    size={16} color="#D97706" sw={2.3} />
                </div>
                <div>
                  <h2 style={{ fontWeight: 900, fontSize: 14, color: "#111", margin: 0 }}>Your History</h2>
                  <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0, fontWeight: 700 }}>
                    Best: {bestScore}/{questionCount}
                    {isPassed ? " · ✓ PASSED" : ` · Need ${questionCount - bestScore} more correct`}
                  </p>
                </div>
                {isPassed && (
                  <div style={{ marginLeft: "auto", background: "#22C55E", border: BD, borderRadius: 8,
                    padding: "4px 12px", fontWeight: 900, fontSize: 11, color: "#fff",
                    boxShadow: "3px 3px 0 #111", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                    PASSED
                  </div>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {history.map((r, i) => (
                  <HistoryRow key={r.id} result={r} index={i} total={questionCount} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: start panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* XP reward card */}
          <div style={{ border: BD, borderRadius: 16, background: "#111",
            padding: "22px 20px", boxShadow: SHl, textAlign: "center" }}>
            <div style={{ width: 58, height: 58, borderRadius: 14, background: "#FFE566",
              border: "3px solid #FFE566", margin: "0 auto 12px",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "4px 4px 0 rgba(255,255,255,0.15)" }}>
              <svg width={28} height={28} viewBox="0 0 24 24"
                fill="#111" stroke="#111" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.17.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.64-.381-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <p style={{ fontSize: 11, fontWeight: 900, color: "#9CA3AF", margin: "0 0 4px",
              textTransform: "uppercase", letterSpacing: "0.1em" }}>XP Reward</p>
            <p style={{ fontSize: 40, fontWeight: 900, color: "#FFE566", margin: "0 0 4px", lineHeight: 1 }}>
              {quiz.exp_reward}
            </p>
            <p style={{ fontSize: 12, color: "#9CA3AF", margin: 0, fontWeight: 700 }}>
              Perfect score only
            </p>
          </div>

          {/* Status pill if played */}
          {hasPlayed && (
            <div style={{
              border: isPassed ? "3px solid #22C55E" : "3px solid #D97706",
              borderRadius: 14, padding: "14px 18px",
              background: isPassed ? "#F0FDF4" : "#FFFBEB",
              boxShadow: isPassed ? "5px 5px 0 #22C55E" : "5px 5px 0 #D97706",
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: isPassed ? "#22C55E" : "#F59E0B",
                border: `2.5px solid #111`,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "2px 2px 0 #111" }}>
                <Ico d={isPassed
                  ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  : "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"}
                  size={20} color="#fff" sw={2.4} />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 900, color: "#111", margin: "0 0 2px" }}>
                  {isPassed ? "Quiz Passed!" : "Keep Trying!"}
                </p>
                <p style={{ fontSize: 11, color: "#6B7280", margin: 0, fontWeight: 700 }}>
                  {isPassed
                    ? `Best score: ${bestScore}/${questionCount} (100%)`
                    : `Best: ${bestScore}/${questionCount} — need all correct`}
                </p>
              </div>
            </div>
          )}

          {/* Quick info chips */}
          {[
            { d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", label: "30 sec per question", col: "#059669", bg: "#ECFDF5" },
            { d: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z", label: `${questionCount} questions total`, col: "#4F46E5", bg: "#EEF2FF" },
          ].map(({ d, label, col, bg }) => (
            <div key={label} style={{ border: `2.5px solid ${col}`, borderRadius: 12, background: bg,
              padding: "11px 16px", boxShadow: `3px 3px 0 ${col}`,
              display: "flex", alignItems: "center", gap: 10 }}>
              <Ico d={d} size={17} color={col} sw={2.3} />
              <span style={{ fontWeight: 800, fontSize: 13, color: col }}>{label}</span>
            </div>
          ))}

          {/* Start button */}
          <button
            onClick={() => navigate(`/dashboard/quiz/${quiz.slug}/play`)}
            onMouseEnter={() => setStartHov(true)}
            onMouseLeave={() => setStartHov(false)}
            style={{
              width: "100%", padding: "16px", borderRadius: 14, border: BD,
              background: startHov ? "#fff" : "#111",
              color: startHov ? "#111" : "#FFE566",
              fontWeight: 900, fontSize: 15, letterSpacing: "0.07em", textTransform: "uppercase",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              boxShadow: startHov ? SHs : SHl,
              transform: startHov ? "translate(2px,2px)" : "translate(0,0)",
              transition: "all 0.12s ease",
            }}>
            <Ico d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              size={20} color={startHov ? "#111" : "#FFE566"} sw={2} />
            {hasPlayed ? "Play Again" : "Start Quiz"}
          </button>
          <p style={{ textAlign: "center", fontSize: 11, fontWeight: 700,
            color: "#9CA3AF", margin: 0 }}>
            Answer all questions to submit
          </p>
        </div>
      </div>

      {/* ── More Quizzes recommendation ── */}
      {otherQuizzes.length > 0 && (
        <div style={{ marginTop: 32 }}>
          {/* Section header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "#C9A0FF",
                border: BD, boxShadow: SHs, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Ico d="M13 10V3L4 14h7v7l9-11h-7z" size={18} color="#4C1D95" sw={2.3} />
              </div>
              <div>
                <h2 style={{ fontWeight: 900, fontSize: 16, color: "#111", margin: 0 }}>
                  Quiz Lainnya
                </h2>
                <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0, fontWeight: 700 }}>
                  Coba quiz lain dan kumpulkan lebih banyak XP!
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/dashboard/quiz")}
              style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 16px",
                border: BD, borderRadius: 10, background: "#fff", cursor: "pointer",
                fontWeight: 900, fontSize: 11, color: "#111", textTransform: "uppercase",
                letterSpacing: "0.06em", boxShadow: SHs, transition: "all 0.12s" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#111"; e.currentTarget.style.color = "#FFE566"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#111"; }}
            >
              Lihat Semua
              <Ico d="M5 12h14M12 5l7 7-7 7" size={13} color="inherit" sw={2.7} />
            </button>
          </div>

          {/* Bold divider */}
          <div style={{ height: 3, background: "#111", borderRadius: 2,
            marginBottom: 18, boxShadow: "0 2px 0 #d1d5db" }} />

          {/* Mini cards grid */}
          <div style={{ display: "grid", gap: 16,
            gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))" }}>
            {otherQuizzes.map((q) => (
              <MiniCard
                key={q.id}
                quiz={q}
                onClick={(slug) => navigate(`/dashboard/quiz/${slug}`)}
              />
            ))}
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .qd-layout { grid-template-columns: minmax(0,1fr) 300px !important; }
        }
      `}</style>
    </div>
  );
}

export default QuizDetail;