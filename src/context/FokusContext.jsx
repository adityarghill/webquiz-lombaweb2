/**
 * FokusContext.jsx  —  Singleton Pomodoro timer at dashboard layout level.
 *
 * Timer survives route navigation. Consumers: FokusMode page + FokusFloatingBar.
 *
 * Timer core uses a stateRef-based interval (not dep-array-based) so it never
 * drifts and completion is detected cleanly without the prevRunning race condition.
 */
import {
  createContext, useContext, useEffect, useRef,
  useState, useCallback, useReducer,
} from "react";
import { supabase } from "@/utils/supabase";

// ── Mode catalogue ─────────────────────────────────────────────────────────
export const MODES = {
  deep:  { key: "deep",  label: "Deep Focus",  minutes: 25, accent: "#6366F1" },
  light: { key: "light", label: "Light Study", minutes: 20, accent: "#F59E0B" },
  break: { key: "break", label: "Break",        minutes:  5, accent: "#10B981" },
};

// Preset quick-select (still shown as hints in UI, but not mandatory)
export const PRESET_DURATIONS = [10, 15, 20, 25, 45, 60, 90];

// ── State shape + reducer ─────────────────────────────────────────────────
const INIT = {
  modeKey:        "deep",
  totalSeconds:   25 * 60,
  timeLeft:       25 * 60,
  running:        false,
  sessionCount:   0,
  totalFocusSecs: 0,
  material:       "",
  target:         "",
  sessions:       [],      // in-memory log (most recent first)
  completedToday: 0,       // hydrated from Supabase
};

function reducer(s, a) {
  switch (a.type) {
    case "SET_MODE": {
      const secs = MODES[a.key].minutes * 60;
      return { ...s, modeKey: a.key, totalSeconds: secs, timeLeft: secs, running: false };
    }
    case "SET_DURATION": {
      const secs = Math.max(60, Math.min(a.minutes * 60, 999 * 60)); // 1-999 min guard
      return { ...s, totalSeconds: secs, timeLeft: secs, running: false };
    }
    case "TOGGLE_RUN":  return { ...s, running: !s.running };
    case "PAUSE":       return { ...s, running: false };
    case "RESET":       return { ...s, timeLeft: s.totalSeconds, running: false };
    case "TICK":        return { ...s, timeLeft: Math.max(0, s.timeLeft - 1) };
    case "COMPLETE": {
      const newSession = {
        id:          Date.now(),
        modeKey:     s.modeKey,
        material:    s.material,
        target:      s.target,
        duration:    s.totalSeconds,
        completedAt: new Date().toISOString(),
      };
      return {
        ...s,
        running:        false,
        timeLeft:       s.totalSeconds,       // reset for next round
        sessionCount:   s.sessionCount + 1,
        totalFocusSecs: s.totalFocusSecs + s.totalSeconds,
        sessions:       [newSession, ...s.sessions].slice(0, 30),
        completedToday: s.completedToday + 1,
      };
    }
    case "SET_MATERIAL":  return { ...s, material: a.value };
    case "SET_TARGET":    return { ...s, target:   a.value };
    case "SET_TODAY":
      return { ...s, completedToday: a.count, totalFocusSecs: a.totalSecs ?? s.totalFocusSecs };
    default: return s;
  }
}

// ── Context ────────────────────────────────────────────────────────────────
const FokusContext = createContext(null);

export function FokusProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, INIT);
  const [notification, setNotification] = useState(null);

  // Always-fresh state reference — safe to read inside setInterval callbacks
  const stateRef      = useRef(state);
  const timerRef      = useRef(null);      // holds the setInterval id
  const notifTimer    = useRef(null);
  const userRef       = useRef(null);      // set by loadToday()

  useEffect(() => { stateRef.current = state; }, [state]);

  // ── Notification helpers ──────────────────────────────────────────────
  const dismissNotif = useCallback(() => {
    clearTimeout(notifTimer.current);
    setNotification(null);
  }, []);

  function showNotif(title, body) {
    setNotification({ title, body });
    clearTimeout(notifTimer.current);
    notifTimer.current = setTimeout(dismissNotif, 9000);
  }

  // ── Supabase persistence ──────────────────────────────────────────────
  async function saveSession(s) {
    const uid = userRef.current;
    if (!uid) return;
    const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD

    try {
      await supabase.from("focus_sessions").insert({
        firebase_uid:  uid,
        mode_key:      s.modeKey,
        duration_secs: s.totalSeconds,
        material:      s.material || null,
        target:        s.target   || null,
        completed_at:  new Date().toISOString(),
      });

      // Upsert daily summary row
      const { data: existing } = await supabase
        .from("focus_daily")
        .select("session_count, total_secs")
        .eq("firebase_uid", uid)
        .eq("log_date", today)
        .maybeSingle();

      await supabase.from("focus_daily").upsert(
        {
          firebase_uid:  uid,
          log_date:      today,
          session_count: (existing?.session_count ?? 0) + 1,
          total_secs:    (existing?.total_secs    ?? 0) + s.totalSeconds,
        },
        { onConflict: "firebase_uid,log_date" }
      );
    } catch (err) {
      console.error("[FokusContext] saveSession:", err.message);
    }
  }

  // ── Load today's data ─────────────────────────────────────────────────
  async function loadToday(uid) {
    if (!uid) return;
    userRef.current = uid;
    const today = new Date().toLocaleDateString("en-CA");

    try {
      const { data } = await supabase
        .from("focus_daily")
        .select("session_count, total_secs")
        .eq("firebase_uid", uid)
        .eq("log_date", today)
        .maybeSingle();

      dispatch({
        type:      "SET_TODAY",
        count:     data?.session_count ?? 0,
        totalSecs: data?.total_secs    ?? 0,
      });
    } catch (err) {
      console.error("[FokusContext] loadToday:", err.message);
    }
  }

  // ── Browser notification permission ───────────────────────────────────
  function requestNotifPermission() {
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }

  // ── Timer: stateRef-based interval (no dep drift, no race condition) ──
  // Only depends on state.running — reads timeLeft via stateRef inside callback.
  useEffect(() => {
    if (state.running) {
      // Don't double-start
      if (timerRef.current) return;

      timerRef.current = setInterval(() => {
        const s = stateRef.current;

        // Safety guard: if paused externally while interval still alive
        if (!s.running) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          return;
        }

        if (s.timeLeft <= 1) {
          // ── Session complete ─────────────────────────────
          clearInterval(timerRef.current);
          timerRef.current = null;

          dispatch({ type: "COMPLETE" });

          // Side effects with fresh snapshot
          const mode = MODES[s.modeKey];
          const mins = Math.round(s.totalSeconds / 60);
          showNotif(
            `${mode.label} selesai!`,
            `${mins} menit fokus tercatat${s.material ? ` — ${s.material}` : ""}.`
          );

          if (typeof Notification !== "undefined" && Notification.permission === "granted") {
            new Notification(`${mode.label} Selesai!`, {
              body: `${mins} menit${s.material ? ` · ${s.material}` : ""}`,
              icon: "/img/logo-ct.png",
            });
          }

          saveSession(s);
        } else {
          dispatch({ type: "TICK" });
        }
      }, 1000);
    } else {
      // Paused / stopped — kill interval
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [state.running]); // ← only running; timeLeft is read via stateRef

  // Cleanup on unmount
  useEffect(() => () => {
    clearInterval(timerRef.current);
    clearTimeout(notifTimer.current);
  }, []);

  return (
    <FokusContext.Provider value={{
      state, dispatch,
      notification, dismissNotif,
      loadToday, requestNotifPermission,
      MODES, PRESET_DURATIONS,
    }}>
      {children}
    </FokusContext.Provider>
  );
}

export function useFokus() {
  const ctx = useContext(FokusContext);
  if (!ctx) throw new Error("useFokus must be used inside <FokusProvider>");
  return ctx;
}
