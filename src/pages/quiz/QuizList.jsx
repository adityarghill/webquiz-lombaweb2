import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/utils/supabase";
import { useAuth } from "@/context/authContext";

const SH  = "5px 5px 0px #111";
const SHs = "3px 3px 0px #111";
const SHh = "7px 7px 0px #111";
const BD  = "3px solid #111";

const PALETTE = [
  { bg: "#FFE566", tag: "#111" }, { bg: "#7EEACA", tag: "#064E3B" },
  { bg: "#FF8A8A", tag: "#7F1D1D" }, { bg: "#7EC8F8", tag: "#1E3A8A" },
  { bg: "#C9A0FF", tag: "#4C1D95" }, { bg: "#FDB97D", tag: "#7C2D12" },
  { bg: "#86EFAC", tag: "#14532D" }, { bg: "#F9A8D4", tag: "#831843" },
];
const TOPIC_ICON = "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253";
function topicCfg(t) {
  if (!t) return { ...PALETTE[0], icon: TOPIC_ICON };
  let h = 5381;
  for (let i = 0; i < t.length; i++) h = ((h << 5) + h) ^ t.charCodeAt(i);
  return { ...PALETTE[Math.abs(h) % PALETTE.length], icon: TOPIC_ICON };
}

function Ico({ d, size = 16, color = "#111", sw = 2.3 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden style={{ flexShrink: 0, display: "block" }}>
      <path d={d} />
    </svg>
  );
}
function StarFilled({ size = 16, color = "#D97706" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color}
      strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden style={{ flexShrink: 0, display: "block" }}>
      <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.17.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.64-.381-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}

function Pill({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: "7px 16px", borderRadius: 100, border: BD, cursor: "pointer",
      fontWeight: 900, fontSize: 12, letterSpacing: "0.04em",
      background: active ? "#111" : "#fff", color: active ? "#FFE566" : "#111",
      boxShadow: active ? "2px 2px 0 #111" : SHs,
      transform: active ? "translate(2px,2px)" : "none",
      transition: "all 0.1s ease", whiteSpace: "nowrap",
    }}>{label}</button>
  );
}

function Skel() {
  return (
    <div style={{ border: BD, borderRadius: 16, background: "#f9fafb", boxShadow: SH, overflow: "hidden" }}>
      <div style={{ height: 150, background: "#e5e7eb" }} />
      <div style={{ padding: 16 }}>
        <div style={{ height: 14, borderRadius: 6, background: "#d1d5db", width: "60%", marginBottom: 8 }} />
        <div style={{ height: 11, borderRadius: 6, background: "#e5e7eb", marginBottom: 5 }} />
        <div style={{ height: 11, borderRadius: 6, background: "#e5e7eb", width: "75%", marginBottom: 14 }} />
        <div style={{ height: 38, borderRadius: 10, background: "#d1d5db" }} />
      </div>
    </div>
  );
}

function Card({ quiz, bestScore, expEarned, onClick }) {
  const [hov, setHov] = useState(false);
  const cfg = topicCfg(quiz.topic);
  const total = quiz.question_count || 10;
  const isPassed = bestScore !== null && bestScore === total;
  const hasPlayed = bestScore !== null;

  return (
    <div onClick={() => onClick(quiz)} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ border: BD, borderRadius: 16, background: "#fff", cursor: "pointer", userSelect: "none",
        display: "flex", flexDirection: "column", overflow: "hidden",
        boxShadow: hov ? SHh : SH, transform: hov ? "translate(-2px,-2px)" : "translate(0,0)",
        transition: "transform 0.13s ease, box-shadow 0.13s ease" }}>
      <div style={{ position: "relative", flexShrink: 0, height: 150, background: cfg.bg, overflow: "hidden" }}>
        <img src={quiz.banner_image_url || "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600&q=70"}
          alt={quiz.title}
          style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.72,
            transform: hov ? "scale(1.06)" : "scale(1)", transition: "transform 0.35s ease" }}
          loading="lazy" />
        <div style={{ position: "absolute", top: 10, left: 10, background: cfg.bg, border: BD, borderRadius: 8,
          padding: "3px 10px", display: "flex", alignItems: "center", gap: 5, boxShadow: SHs,
          fontWeight: 900, fontSize: 11, color: cfg.tag, letterSpacing: "0.04em", textTransform: "uppercase", maxWidth: "55%" }}>
          <Ico d={cfg.icon} size={13} color={cfg.tag} sw={2.4} />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{quiz.topic}</span>
        </div>
        <div style={{ position: "absolute", top: 10, right: 10, background: "#FFE566", border: BD, borderRadius: 8,
          padding: "3px 10px", display: "flex", alignItems: "center", gap: 4,
          boxShadow: SHs, fontWeight: 900, fontSize: 11, color: "#111" }}>
          <StarFilled size={12} />{quiz.exp_reward} XP
        </div>
        {isPassed && (
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "#22C55E", borderTop: BD,
            padding: "5px 12px", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            fontWeight: 900, fontSize: 11, color: "#fff", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            <Ico d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" size={13} color="#fff" sw={2.5} />TUNTAS
          </div>
        )}
      </div>
      <div style={{ padding: "14px 16px 0", display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
        <h3 style={{ fontWeight: 900, fontSize: 15, color: "#111", margin: "0 0 5px", lineHeight: 1.3, wordBreak: "break-word" }}>{quiz.title}</h3>
        <p style={{ fontSize: 12, color: "#6B7280", margin: "0 0 12px", lineHeight: 1.6,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {quiz.description}
        </p>
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 12 }}>
          {[
            { d: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z", label: `${total} Soal`, col: "#6366F1", bg: "#EEF2FF" },
            { d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", label: `${quiz.estimated_minutes} menit`, col: "#059669", bg: "#ECFDF5" },
          ].map(({ d, label, col, bg }) => (
            <span key={label} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 800,
              color: col, background: bg, border: `2px solid ${col}`, borderRadius: 7, padding: "3px 9px", boxShadow: `2px 2px 0 ${col}` }}>
              <Ico d={d} size={13} color={col} sw={2.4} />{label}
            </span>
          ))}
          {hasPlayed && !isPassed && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 800,
              color: "#D97706", background: "#FFFBEB", border: "2px solid #D97706", borderRadius: 7,
              padding: "3px 9px", boxShadow: "2px 2px 0 #D97706" }}>
              <Ico d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                size={13} color="#D97706" sw={2.4} />Terbaik: {bestScore}/{total}
            </span>
          )}
          {expEarned > 0 && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 800,
              color: "#92400E", background: "#FEF9C3", border: "2px solid #D97706", borderRadius: 7,
              padding: "3px 9px", boxShadow: "2px 2px 0 #D97706" }}>
              <StarFilled size={12} />+{expEarned} XP didapat
            </span>
          )}
        </div>
      </div>
      <div style={{ flexShrink: 0, borderTop: BD, background: hov ? "#111" : "#F9FAFB",
        padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between",
        transition: "background 0.13s" }}>
        <span style={{ fontWeight: 900, fontSize: 11, textTransform: "uppercase",
          letterSpacing: "0.07em", color: hov ? "#FFE566" : "#111" }}>
          {hasPlayed ? "Main Lagi" : "Mulai Quiz"}
        </span>
        <Ico d="M5 12h14M12 5l7 7-7 7" size={15} color={hov ? "#FFE566" : "#111"} sw={2.8} />
      </div>
    </div>
  );
}

export function QuizList() {
  const [quizzes, setQuizzes]     = useState([]);
  const [topics, setTopics]       = useState(["Semua"]);
  const [scores, setScores]       = useState({});
  const [expMap, setExpMap]       = useState({});
  const [todayExp, setTodayExp]   = useState(0);   // ← EXP hari ini dari activity_log
  const [quizCount, setQuizCount] = useState(0);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState("Semua");
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userStats } = useAuth(); // total EXP ada di userStats.total_exp

  useEffect(() => { init(); }, [location.key, user?.uid]);

  async function init() {
    setLoading(true);
    const uid = user?.uid ?? null;
    const today = new Date().toLocaleDateString("en-CA"); // "YYYY-MM-DD"

    const [{ data: qData }, { data: rData }, { data: todayLog }] = await Promise.all([
      supabase.from("quizzes").select("*, question_count:questions(count)"),

      uid
        ? supabase.from("quiz_results")
            .select("quiz_id, score, exp_earned")
            .eq("firebase_uid", uid)
        : Promise.resolve({ data: [] }),

      // XP hari ini dari activity_log (exp_earned = total exp diperoleh hari ini)
      uid
        ? supabase.from("activity_log")
            .select("exp_earned")
            .eq("firebase_uid", uid)
            .eq("log_date", today)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    if (qData) {
      const formatted = qData.map((q) => ({
        ...q, question_count: q.question_count?.[0]?.count ?? 10,
      }));
      setQuizzes(formatted);
      setQuizCount(formatted.length);
      const unique = ["Semua", ...Array.from(new Set(formatted.map((q) => q.topic).filter(Boolean)))];
      setTopics(unique);
    }

    if (rData?.length > 0) {
      const best = {}, earned = {};
      rData.forEach(({ quiz_id, score, exp_earned }) => {
        if (best[quiz_id] === undefined || score > best[quiz_id]) best[quiz_id] = score;
        earned[quiz_id] = (earned[quiz_id] || 0) + (exp_earned || 0);
      });
      setScores(best);
      setExpMap(earned);
    } else { setScores({}); setExpMap({}); }

    // XP hari ini: dari activity_log.exp_earned kolom hari ini
    setTodayExp(todayLog?.exp_earned ?? 0);
    setLoading(false);
  }

  const filtered = filter === "Semua" ? quizzes : quizzes.filter((q) => q.topic === filter);
  const totalExp = userStats?.total_exp ?? 0; // dari context, fresh setelah refreshUserStats

  return (
    <div style={{ marginTop: 48, paddingBottom: 56 }}>
      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        flexWrap: "wrap", gap: 12, marginBottom: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "#FFE566",
            border: BD, boxShadow: SHs, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Ico d={TOPIC_ICON} size={24} color="#111" sw={2.2} />
          </div>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: "#111", margin: 0 }}>Perpustakaan Quiz</h1>
            <p style={{ fontSize: 12, color: "#555", margin: 0, fontWeight: 700 }}>
              {user ? `Halo, ${user.displayName || user.email?.split("@")[0]}! Terus semangat!` : "Login untuk simpan progress & XP!"}
            </p>
          </div>
        </div>

        {/* ── Stat boxes ── */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {user ? (
            <>
              {/* XP Diperoleh Hari Ini — sumber: activity_log.exp_earned */}
              <div style={{ border: "3px solid #D97706", borderRadius: 14, background: "#FEF9C3",
                boxShadow: "5px 5px 0 #D97706", padding: "12px 20px",
                display: "flex", flexDirection: "column", gap: 2 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <StarFilled size={20} color="#D97706" />
                  <span style={{ fontWeight: 900, fontSize: 24, color: "#92400E", lineHeight: 1 }}>
                    {loading ? "—" : todayExp}
                  </span>
                </div>
                <span style={{ fontSize: 10, fontWeight: 800, color: "#B45309",
                  textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  XP Diperoleh Hari Ini
                </span>
              </div>

              {/* Total XP — sumber: userStats dari authContext (refreshed setelah quiz) */}
              <div style={{ border: "3px solid #7C3AED", borderRadius: 14, background: "#F5F3FF",
                boxShadow: "5px 5px 0 #7C3AED", padding: "12px 20px",
                display: "flex", flexDirection: "column", gap: 2 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width={20} height={20} viewBox="0 0 24 24" fill="#7C3AED" stroke="#7C3AED"
                    strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span style={{ fontWeight: 900, fontSize: 24, color: "#5B21B6", lineHeight: 1 }}>
                    {totalExp}
                  </span>
                </div>
                <span style={{ fontSize: 10, fontWeight: 800, color: "#6D28D9",
                  textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Total XP
                </span>
              </div>
            </>
          ) : (
            <div onClick={() => navigate("/auth/sign-in")}
              style={{ border: "3px solid #D97706", borderRadius: 14, background: "#FFF7ED",
                boxShadow: "5px 5px 0 #D97706", padding: "12px 20px",
                display: "flex", flexDirection: "column", gap: 2, cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth={2.5}
                  strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span style={{ fontWeight: 900, fontSize: 16, color: "#92400E", lineHeight: 1 }}>Login</span>
              </div>
              <span style={{ fontSize: 10, fontWeight: 800, color: "#B45309",
                textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Untuk Simpan XP
              </span>
            </div>
          )}

          {/* Quiz count */}
          <div style={{ border: BD, borderRadius: 14, background: "#fff",
            boxShadow: SH, padding: "12px 20px", display: "flex", flexDirection: "column", gap: 2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Ico d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                size={20} color="#111" sw={2.3} />
              <span style={{ fontWeight: 900, fontSize: 24, color: "#111", lineHeight: 1 }}>
                {loading ? "—" : quizCount}
              </span>
            </div>
            <span style={{ fontSize: 10, fontWeight: 800, color: "#6B7280",
              textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Quiz Tersedia
            </span>
          </div>
        </div>
      </div>

      {/* ── Filter pills ── */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
        {topics.map((t) => <Pill key={t} label={t} active={filter === t} onClick={() => setFilter(t)} />)}
      </div>

      {/* ── Grid ── */}
      {loading ? (
        <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
          {[...Array(6)].map((_, i) => <Skel key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 0" }}>
          <div style={{ width: 72, height: 72, borderRadius: 18, background: "#f3f4f6",
            border: BD, boxShadow: SH, margin: "0 auto 16px",
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Ico d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              size={34} color="#9CA3AF" sw={1.8} />
          </div>
          <p style={{ fontWeight: 900, fontSize: 15, color: "#374151", margin: "0 0 4px" }}>Tidak ada quiz!</p>
          <p style={{ fontSize: 12, color: "#9CA3AF", margin: 0, fontWeight: 600 }}>Coba filter lain</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
          {filtered.map((quiz) => (
            <Card key={quiz.id} quiz={quiz} bestScore={scores[quiz.id] ?? null}
              expEarned={expMap[quiz.id] || 0} onClick={(q) => navigate(`/dashboard/quiz/${q.id}`)} />
          ))}
        </div>
      )}
    </div>
  );
}

export default QuizList;