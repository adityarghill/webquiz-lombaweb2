import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/utils/supabase";
import { useAuth } from "@/context/authContext";

const SH  = "5px 5px 0px #111";
const SHs = "3px 3px 0px #111";
const SHl = "7px 7px 0px #111";
const BD  = "3px solid #111";
const SECS = 30;

const OPT = {
  a: { idle: "#EEF2FF", active: "#4F46E5", border: "#4F46E5", text: "#3730A3" },
  b: { idle: "#FFF7ED", active: "#EA580C", border: "#EA580C", text: "#9A3412" },
  c: { idle: "#F0FDF4", active: "#16A34A", border: "#16A34A", text: "#14532D" },
  d: { idle: "#FFF1F2", active: "#DC2626", border: "#DC2626", text: "#7F1D1D" },
};

function Ico({ d, size = 18, color = "#111", sw = 2.2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
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
      <p style={{ fontSize: 14, fontWeight: 800, color: "#6B7280" }}>Memuat soal…</p>
    </div>
  );
}

export function QuizPlay() {
  const { quizSlug } = useParams();
  const navigate = useNavigate();
  const { user, refreshUserStats } = useAuth(); // Firebase auth
  const uid = user?.uid ?? null;

  const [questions, setQuestions] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(SECS);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showWarn, setShowWarn] = useState(false);
  const [hovOpt, setHovOpt] = useState(null);
  const [hovBtn, setHovBtn] = useState(null);
  const startTime = useRef(Date.now());
  const timerRef = useRef(null);

  useEffect(() => { fetchData(); return () => clearInterval(timerRef.current); }, [quizSlug]);

  useEffect(() => {
    if (!questions.length) return;
    setTimeLeft(SECS);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setCurrent((i) => (i < questions.length - 1 ? i + 1 : i));
          return SECS;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [current, questions.length]);

  async function fetchData() {
    const { data: qz, error } = await supabase
      .from("quizzes")
      .select("*")
      .eq("slug", quizSlug)
      .single();

    if (error || !qz) {
      setLoading(false);
      return;
    }

    const { data: qs } = await supabase
      .from("questions")
      .select("*")
      .eq("quiz_id", qz.id)
      .order("order_index");

    setQuiz(qz);
    setQuestions(qs || []);
    setLoading(false);
  }

  function pick(opt) {
    const id = questions[current]?.id;
    if (id) { setAnswers((p) => ({ ...p, [id]: opt })); setShowWarn(false); }
  }

  /* ── Submit ─────────────────────────────────────────────── */
  async function submit() {
    // Guard: semua soal wajib dijawab
    const firstUnanswered = questions.findIndex((q) => !answers[q.id]);
    if (firstUnanswered !== -1) {
      setShowWarn(true);
      setCurrent(firstUnanswered);
      return;
    }

    setSubmitting(true);
    clearInterval(timerRef.current);

    const timeTaken = Math.round((Date.now() - startTime.current) / 1000);
    let score = 0;
    questions.forEach((q) => { if (answers[q.id] === q.correct_option) score++; });
    const isPerfect = score === questions.length;
    const expEarned = isPerfect ? (quiz?.exp_reward || 0) : 0;

    // Jika tidak login → langsung ke result tanpa simpan
    if (!uid) {
      navigate(`/dashboard/quiz/${quizSlug}/result`, {
        state: { score, total: questions.length, expEarned: 0, timeTaken, answers, questions, quiz, savedToCloud: false },
      });
      return;
    }

    try {
      const today = new Date().toLocaleDateString("en-CA"); // "YYYY-MM-DD"

      /* Step 1: simpan ke quiz_results */
      const { error: rErr } = await supabase.from("quiz_results").insert({
        firebase_uid:       uid,
        quiz_id:            quiz.id,
        score,
        total_questions:    questions.length,
        time_taken_seconds: timeTaken,
        exp_earned:         expEarned,
      });
      if (rErr) throw new Error(`quiz_results: ${rErr.message}`);

      /* Step 2: upsert user_stats (total akumulatif) */
      const { data: existing, error: readErr } = await supabase
        .from("user_stats")
        .select("total_exp, quizzes_completed, perfect_scores")
        .eq("firebase_uid", uid)
        .maybeSingle();
      if (readErr) throw new Error(`user_stats read: ${readErr.message}`);

      const { error: uErr } = await supabase.from("user_stats").upsert(
        {
          firebase_uid:      uid,
          email:             user.email,
          total_exp:         (existing?.total_exp         ?? 0) + expEarned,
          quizzes_completed: (existing?.quizzes_completed ?? 0) + 1,
          perfect_scores:    (existing?.perfect_scores    ?? 0) + (isPerfect ? 1 : 0),
          updated_at:        new Date().toISOString(),
        },
        { onConflict: "firebase_uid" }
      );
      if (uErr) throw new Error(`user_stats upsert: ${uErr.message}`);

      /* Step 3: upsert activity_log hari ini
         — count: berapa kali quiz diselesaikan hari ini
         — exp_earned: TOTAL exp diperoleh hari ini (diakumulasi)
         Ini yang dibaca oleh QuizList untuk box "XP Diperoleh Hari Ini"
      */
      const { data: existingLog, error: logReadErr } = await supabase
        .from("activity_log")
        .select("count, exp_earned")
        .eq("firebase_uid", uid)
        .eq("log_date", today)
        .maybeSingle();
      if (logReadErr && logReadErr.code !== "PGRST116") {
        throw new Error(`activity_log read: ${logReadErr.message}`);
      }

      const { error: logErr } = await supabase.from("activity_log").upsert(
        {
          firebase_uid: uid,
          log_date:     today,
          count:        (existingLog?.count     ?? 0) + 1,
          exp_earned:   (existingLog?.exp_earned ?? 0) + expEarned, // ← akumulasi XP hari ini
        },
        { onConflict: "firebase_uid,log_date" }
      );
      if (logErr) throw new Error(`activity_log upsert: ${logErr.message}`);

      // Refresh userStats di context agar navbar & QuizList langsung update
      refreshUserStats();

      console.log(`[QuizPlay] ✓ Saved: score=${score}/${questions.length}, exp=${expEarned}`);

      navigate(`/dashboard/quiz/${quizSlug}/result`, {
        state: { score, total: questions.length, expEarned, timeTaken, answers, questions, quiz, savedToCloud: true },
      });

    } catch (err) {
      console.error("[QuizPlay] Save error:", err.message);
      // Tetap navigate walau ada error
      navigate(`/dashboard/quiz/${quizSlug}/result`, {
        state: { score, total: questions.length, expEarned, timeTaken, answers, questions, quiz, savedToCloud: false },
      });
    }
  }

  if (loading) return <Spinner />;
  if (!questions.length) return (
    <div style={{ marginTop: 80, textAlign: "center", fontWeight: 800, color: "#6B7280" }}>
      Tidak ada soal untuk quiz ini.
    </div>
  );

  const q = questions[current];
  const answeredCount = Object.keys(answers).length;
  const curAnswer = answers[q.id];
  const progressPct = ((current + 1) / questions.length) * 100;
  const timerPct = (timeLeft / SECS) * 100;
  const isUrgent = timeLeft <= 10;
  const isWarn   = timeLeft <= 20 && !isUrgent;
  const timerAccent = isUrgent ? "#DC2626" : isWarn ? "#D97706" : "#059669";
  const timerBg     = isUrgent ? "#FFF1F2" : isWarn ? "#FFFBEB" : "#ECFDF5";
  const circumf = 2 * Math.PI * 22;
  const options = [
    { key: "a", label: q.option_a }, { key: "b", label: q.option_b },
    { key: "c", label: q.option_c }, { key: "d", label: q.option_d },
  ];
  const unansweredCount = questions.length - answeredCount;
  const canSubmit = answeredCount === questions.length;

  return (
    <div style={{ marginTop: 36, paddingBottom: 56, maxWidth: 680, margin: "36px auto 56px" }}>

      {/* Guest banner */}
      {!uid && (
        <div style={{ border: "3px solid #D97706", borderRadius: 12, background: "#FFF7ED",
          padding: "10px 16px", boxShadow: "4px 4px 0 #D97706", marginBottom: 16,
          display: "flex", alignItems: "center", gap: 10 }}>
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth={2.5}
            strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <p style={{ fontSize: 12, fontWeight: 800, color: "#92400E", margin: 0 }}>
            Mode tamu — progress tidak tersimpan.{" "}
            <a href="/zooask/auth/sign-in"
              style={{ color: "#D97706", textDecoration: "underline" }}>Login</a> untuk simpan XP.
          </p>
        </div>
      )}

      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
        <div style={{ minWidth: 0 }}>
          <h1 style={{ fontWeight: 900, fontSize: "clamp(14px,3.5vw,18px)", color: "#111",
            margin: "0 0 3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "55vw" }}>
            {quiz?.title}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: "#6B7280" }}>Soal {current + 1} / {questions.length}</span>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#D1D5DB", display: "block" }} />
            <span style={{ fontSize: 12, fontWeight: 900, color: canSubmit ? "#22C55E" : "#D97706" }}>
              {answeredCount}/{questions.length} dijawab
            </span>
          </div>
        </div>

        {/* Timer */}
        <div style={{ border: `3px solid ${timerAccent}`, borderRadius: 14, background: timerBg,
          boxShadow: `4px 4px 0 ${timerAccent}`, padding: "8px 14px",
          display: "flex", alignItems: "center", gap: 10, transition: "all 0.3s" }}>
          <svg width={46} height={46} viewBox="0 0 46 46" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="23" cy="23" r="22" fill="none" stroke={timerAccent} strokeWidth={4} strokeOpacity={0.2} />
            <circle cx="23" cy="23" r="22" fill="none" stroke={timerAccent} strokeWidth={4}
              strokeDasharray={circumf} strokeDashoffset={circumf * (1 - timerPct / 100)}
              strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.9s linear, stroke 0.3s" }} />
          </svg>
          <div>
            <p style={{ fontSize: 22, fontWeight: 900, color: timerAccent, margin: 0, lineHeight: 1 }}>{timeLeft}</p>
            <p style={{ fontSize: 9, fontWeight: 900, color: timerAccent, margin: 0,
              opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.1em" }}>DTK</p>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 12, background: "#F3F4F6", border: BD, borderRadius: 8, marginBottom: 18, overflow: "hidden" }}>
        <div style={{ height: "100%", background: "#111", width: `${progressPct}%`, borderRadius: 5, transition: "width 0.3s ease" }} />
      </div>

      {/* Warning */}
      {showWarn && (
        <div style={{ border: "3px solid #DC2626", borderRadius: 12, background: "#FFF1F2",
          padding: "12px 16px", boxShadow: "4px 4px 0 #DC2626", marginBottom: 16,
          display: "flex", alignItems: "center", gap: 10 }}>
          <Ico d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" size={18} color="#DC2626" sw={2.3} />
          <p style={{ fontSize: 13, fontWeight: 800, color: "#7F1D1D", margin: 0 }}>
            Jawab semua soal dulu! {unansweredCount} soal belum dijawab. Melompat ke soal pertama.
          </p>
        </div>
      )}

      {/* Question card */}
      <div style={{ border: BD, borderRadius: 18, background: "#fff",
        padding: "clamp(16px,4vw,26px)", boxShadow: SHl, marginBottom: 14 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, border: BD,
          borderRadius: 8, background: "#EEF2FF", padding: "4px 12px", marginBottom: 16, boxShadow: SHs }}>
          <Ico d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" size={13} color="#4F46E5" sw={2.4} />
          <span style={{ fontWeight: 900, fontSize: 11, color: "#3730A3", textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Soal {current + 1}
          </span>
        </div>
        <h2 style={{ fontWeight: 900, fontSize: "clamp(14px,3.5vw,19px)", color: "#111", margin: "0 0 20px", lineHeight: 1.45 }}>
          {q.question_text}
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {options.map(({ key, label }) => {
            const isSelected = curAnswer === key;
            const isHov = hovOpt === key && !isSelected;
            const cfg = OPT[key];
            return (
              <button key={key} onClick={() => pick(key)}
                onMouseEnter={() => setHovOpt(key)} onMouseLeave={() => setHovOpt(null)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 14,
                  padding: "clamp(10px,2.5vw,14px) clamp(12px,3vw,16px)",
                  borderRadius: 12, cursor: "pointer", textAlign: "left",
                  border: `3px solid ${isSelected ? cfg.active : cfg.border}`,
                  background: isSelected ? cfg.active : isHov ? cfg.idle : "#fff",
                  boxShadow: isSelected ? `4px 4px 0 ${cfg.active}` : isHov ? `3px 3px 0 ${cfg.border}` : `2px 2px 0 ${cfg.border}`,
                  transform: isSelected ? "translate(1px,1px)" : isHov ? "translate(-1px,-1px)" : "none",
                  transition: "all 0.11s ease" }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, fontWeight: 900, fontSize: 13,
                  textTransform: "uppercase", display: "flex", alignItems: "center", justifyContent: "center",
                  background: isSelected ? "rgba(255,255,255,0.22)" : cfg.idle,
                  border: `2.5px solid ${isSelected ? "rgba(255,255,255,0.5)" : cfg.border}`,
                  color: isSelected ? "#fff" : cfg.text }}>
                  {key}
                </div>
                <span style={{ fontWeight: 700, fontSize: "clamp(12px,2.5vw,14px)",
                  color: isSelected ? "#fff" : "#111", flex: 1, lineHeight: 1.4 }}>
                  {label}
                </span>
                {isSelected && <Ico d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" size={20} color="rgba(255,255,255,0.9)" sw={2.5} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <button disabled={current === 0} onClick={() => setCurrent((i) => Math.max(0, i - 1))}
          onMouseEnter={() => setHovBtn("prev")} onMouseLeave={() => setHovBtn(null)}
          style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 16px", borderRadius: 10, border: BD,
            cursor: current === 0 ? "not-allowed" : "pointer", fontWeight: 900, fontSize: 12,
            letterSpacing: "0.05em", textTransform: "uppercase",
            background: current === 0 ? "#F9FAFB" : hovBtn === "prev" ? "#111" : "#fff",
            color: current === 0 ? "#D1D5DB" : hovBtn === "prev" ? "#FFE566" : "#111",
            boxShadow: current === 0 ? "none" : SHs,
            transform: current === 0 ? "none" : hovBtn === "prev" ? "translate(1px,1px)" : "none",
            opacity: current === 0 ? 0.45 : 1, transition: "all 0.11s" }}>
          <Ico d="M19 12H5M12 5l-7 7 7 7" size={14} color={current === 0 ? "#D1D5DB" : hovBtn === "prev" ? "#FFE566" : "#111"} sw={2.7} />
          Sebelumnya
        </button>

        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", justifyContent: "center", flex: 1, maxWidth: "55%" }}>
          {questions.map((qq, i) => {
            const isCur = i === current, isDone = !!answers[qq.id];
            return (
              <button key={qq.id} onClick={() => { setCurrent(i); setShowWarn(false); }}
                onMouseEnter={() => setHovBtn(`dot${i}`)} onMouseLeave={() => setHovBtn(null)}
                style={{ width: isCur ? 30 : 24, height: 24, borderRadius: 7,
                  border: isCur ? BD : isDone ? "2.5px solid #22C55E" : "2.5px solid #D1D5DB",
                  background: isCur ? "#111" : isDone ? "#22C55E" : hovBtn === `dot${i}` ? "#F3F4F6" : "#fff",
                  color: isCur || isDone ? "#fff" : "#374151", fontWeight: 900, fontSize: 10, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: isCur ? SHs : isDone ? "2px 2px 0 #15803D" : "1px 1px 0 #d1d5db",
                  transition: "all 0.1s" }}>
                {isDone && !isCur
                  ? <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                  : i + 1}
              </button>
            );
          })}
        </div>

        {current < questions.length - 1 ? (
          <button onClick={() => setCurrent((i) => i + 1)}
            onMouseEnter={() => setHovBtn("next")} onMouseLeave={() => setHovBtn(null)}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 16px", borderRadius: 10, border: BD,
              cursor: "pointer", fontWeight: 900, fontSize: 12, letterSpacing: "0.05em", textTransform: "uppercase",
              background: hovBtn === "next" ? "#111" : "#fff", color: hovBtn === "next" ? "#FFE566" : "#111",
              boxShadow: SHs, transform: hovBtn === "next" ? "translate(1px,1px)" : "none", transition: "all 0.11s" }}>
            Selanjutnya
            <Ico d="M5 12h14M12 5l7 7-7 7" size={14} color={hovBtn === "next" ? "#FFE566" : "#111"} sw={2.7} />
          </button>
        ) : (
          <button onClick={submit} disabled={submitting}
            onMouseEnter={() => setHovBtn("submit")} onMouseLeave={() => setHovBtn(null)}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 16px", borderRadius: 10,
              cursor: submitting ? "not-allowed" : "pointer",
              border: canSubmit ? "3px solid #22C55E" : BD, fontWeight: 900, fontSize: 12,
              letterSpacing: "0.05em", textTransform: "uppercase",
              background: canSubmit ? (hovBtn === "submit" ? "#22C55E" : "#F0FDF4") : "#F9FAFB",
              color: canSubmit ? (hovBtn === "submit" ? "#fff" : "#15803D") : "#9CA3AF",
              boxShadow: canSubmit ? "4px 4px 0 #22C55E" : "2px 2px 0 #d1d5db",
              transform: canSubmit && hovBtn === "submit" ? "translate(1px,1px)" : "none",
              transition: "all 0.11s" }}>
            {submitting ? "Menyimpan…" : canSubmit ? "Submit" : `${unansweredCount} belum`}
            <Ico d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              size={14} color={canSubmit ? (hovBtn === "submit" ? "#fff" : "#15803D") : "#9CA3AF"} sw={2.5} />
          </button>
        )}
      </div>

      <p style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: "#9CA3AF", margin: 0 }}>
        Hijau = sudah dijawab · Semua soal harus dijawab sebelum submit
      </p>
    </div>
  );
}

export default QuizPlay;