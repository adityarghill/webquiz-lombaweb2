import { createContext, useState, useContext, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../utils/firebase';
import { supabase } from '../utils/supabase';

const AuthContext = createContext(null);

const RateLimiter = {
  attempts: {},
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000,
  isLimited: (key) => {
    const now = Date.now();
    if (!RateLimiter.attempts[key]) RateLimiter.attempts[key] = [];
    RateLimiter.attempts[key] = RateLimiter.attempts[key].filter((t) => now - t < RateLimiter.windowMs);
    return RateLimiter.attempts[key].length >= RateLimiter.maxAttempts;
  },
  recordAttempt: (key) => {
    if (!RateLimiter.attempts[key]) RateLimiter.attempts[key] = [];
    RateLimiter.attempts[key].push(Date.now());
  },
  getRemainingTime: (key) => {
    if (!RateLimiter.attempts[key]?.length) return 0;
    return Math.ceil((RateLimiter.windowMs - (Date.now() - RateLimiter.attempts[key][0])) / 60000);
  },
};

async function syncUserToSupabase(firebaseUser) {
  if (!firebaseUser) return;
  const { uid, email, displayName } = firebaseUser;
  try {
    const { error: profileErr } = await supabase
      .from('user_profiles')
      .upsert(
        { firebase_uid: uid, email, display_name: displayName || email?.split('@')[0] || 'User', last_seen_at: new Date().toISOString() },
        { onConflict: 'firebase_uid' }
      );
    if (profileErr) console.error('[Auth] user_profiles upsert:', profileErr.message);

    const { data: existing } = await supabase.from('user_stats').select('firebase_uid').eq('firebase_uid', uid).maybeSingle();
    if (!existing) {
      const { error: statsErr } = await supabase.from('user_stats').insert({ firebase_uid: uid, total_exp: 0, quizzes_completed: 0, perfect_scores: 0 });
      if (statsErr) console.error('[Auth] user_stats insert:', statsErr.message);
    }
  } catch (err) {
    console.error('[Auth] syncUserToSupabase:', err.message);
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserStats = async (uid) => {
    if (!uid) { setUserStats(null); return; }
    const { data } = await supabase.from('user_stats').select('total_exp, quizzes_completed, perfect_scores').eq('firebase_uid', uid).maybeSingle();
    setUserStats(data || { total_exp: 0, quizzes_completed: 0, perfect_scores: 0 });
  };

  const refreshUserStats = () => { if (user?.uid) fetchUserStats(user.uid); };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser?.emailVerified) {
        await syncUserToSupabase(firebaseUser);
        setUser(firebaseUser);
        fetchUserStats(firebaseUser.uid);
      } else {
        setUser(null);
        setUserStats(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const signUp = async (email, password) => {
    try {
      setError(null);
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(cred.user);
      await firebaseSignOut(auth);
      setUser(null);
      return { data: { user: cred.user, message: 'Email verifikasi telah dikirim.' }, error: null };
    } catch (err) {
      const msg = err.message || 'Sign up gagal';
      setError(msg);
      return { data: null, error: msg };
    }
  };

  const signIn = async (email, password) => {
    try {
      setError(null);
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = cred.user;
      await firebaseUser.reload();
      if (!firebaseUser.emailVerified) {
        await firebaseSignOut(auth);
        setUser(null);
        const msg = 'Email belum diverifikasi. Cek inbox kamu.';
        setError(msg);
        return { data: null, error: msg };
      }
      await syncUserToSupabase(firebaseUser);
      setUser(firebaseUser);
      await fetchUserStats(firebaseUser.uid);
      return { data: { user: firebaseUser }, error: null };
    } catch (err) {
      const msg = err.message || 'Sign in gagal';
      setError(msg);
      return { data: null, error: msg };
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      await firebaseSignOut(auth);
      setUser(null);
      setUserStats(null);
      return { error: null };
    } catch (err) {
      const msg = err.message || 'Sign out gagal';
      setError(msg);
      return { error: msg };
    }
  };

  const resetPassword = async (email) => {
    const key = `reset_${email}`;
    if (RateLimiter.isLimited(key)) {
      const t = RateLimiter.getRemainingTime(key);
      const msg = `Terlalu banyak permintaan. Coba lagi dalam ${t} menit.`;
      setError(msg);
      return { data: null, error: msg };
    }
    try {
      setError(null);
      RateLimiter.recordAttempt(key);
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/zooask/auth/sign-in`,
        handleCodeInApp: true,
      });
      return { data: { message: 'Email reset password telah dikirim.' }, error: null };
    } catch (err) {
      const msg = err.message || 'Reset gagal';
      setError(msg);
      return { data: null, error: msg };
    }
  };

  const resendVerificationEmail = async () => {
    try {
      setError(null);
      const cu = auth.currentUser;
      if (!cu) throw new Error('User tidak ditemukan');
      await sendEmailVerification(cu);
      return { data: { message: 'Email verifikasi dikirim ulang.' }, error: null };
    } catch (err) {
      const msg = err.message || 'Gagal kirim ulang';
      setError(msg);
      return { data: null, error: msg };
    }
  };

  return (
    <AuthContext.Provider value={{ user, userStats, loading, error, signUp, signIn, signOut, resetPassword, resendVerificationEmail, refreshUserStats }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus digunakan di dalam AuthProvider');
  return ctx;
}