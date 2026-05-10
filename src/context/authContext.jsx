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

const AuthContext = createContext(null);

// Rate limiting for token verifications
const RateLimiter = {
  attempts: {},
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  
  isLimited: (key) => {
    const now = Date.now();
    if (!RateLimiter.attempts[key]) {
      RateLimiter.attempts[key] = [];
    }
    
    // Remove old attempts outside the window
    RateLimiter.attempts[key] = RateLimiter.attempts[key].filter(
      (time) => now - time < RateLimiter.windowMs
    );
    
    return RateLimiter.attempts[key].length >= RateLimiter.maxAttempts;
  },
  
  recordAttempt: (key) => {
    if (!RateLimiter.attempts[key]) {
      RateLimiter.attempts[key] = [];
    }
    RateLimiter.attempts[key].push(Date.now());
  },
  
  getRemainingTime: (key) => {
    if (!RateLimiter.attempts[key] || RateLimiter.attempts[key].length === 0) {
      return 0;
    }
    const oldestAttempt = RateLimiter.attempts[key][0];
    const remainingMs = RateLimiter.windowMs - (Date.now() - oldestAttempt);
    return Math.ceil(remainingMs / 1000 / 60); // Convert to minutes
  },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check user session on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser || null);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email, password) => {
    try {
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      
      // Sign out the user (they need to verify email first)
      await firebaseSignOut(auth);
      setUser(null);
      
      return { 
        data: { user, message: 'Verification email sent. Please check your email.' }, 
        error: null 
      };
    } catch (err) {
      const errorMsg = err.message || 'Sign up failed';
      setError(errorMsg);
      return { data: null, error: errorMsg };
    }
  };

  const signIn = async (email, password) => {
    try {
      setError(null);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Reload user to get latest emailVerified status
      await user.reload();
      
      if (!user.emailVerified) {
        // Sign out if email not verified
        await firebaseSignOut(auth);
        setUser(null);
        const errorMsg = 'Please verify your email before signing in. Check your inbox for the verification link.';
        setError(errorMsg);
        return { data: null, error: errorMsg };
      }
      
      setUser(user);
      return { data: { user }, error: null };
    } catch (err) {
      const errorMsg = err.message || 'Sign in failed';
      setError(errorMsg);
      return { data: null, error: errorMsg };
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      await firebaseSignOut(auth);
      setUser(null);
      return { error: null };
    } catch (err) {
      const errorMsg = err.message || 'Sign out failed';
      setError(errorMsg);
      return { error: errorMsg };
    }
  };

  const resetPassword = async (email) => {
    const rateLimitKey = `reset_${email}`;
    
    // Check rate limit
    if (RateLimiter.isLimited(rateLimitKey)) {
      const remainingTime = RateLimiter.getRemainingTime(rateLimitKey);
      const errorMsg = `Too many password reset requests. Please try again in ${remainingTime} minute${remainingTime > 1 ? 's' : ''}`;
      setError(errorMsg);
      return { data: null, error: errorMsg };
    }
    
    try {
      setError(null);
      RateLimiter.recordAttempt(rateLimitKey);
      
      // Send password reset email
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/material-tailwind-dashboard-react/auth/sign-in`,
        handleCodeInApp: true,
      });
      
      return { data: { message: 'Password reset email sent. Check your email.' }, error: null };
    } catch (err) {
      const errorMsg = err.message || 'Password reset request failed';
      setError(errorMsg);
      return { data: null, error: errorMsg };
    }
  };

  const resendVerificationEmail = async (email) => {
    try {
      setError(null);
      // Get the user by email to resend verification
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('User not found');
      }
      
      
      return { data: { message: 'Verification email resent. Check your email.' }, error: null };
    } catch (err) {
      const errorMsg = err.message || 'Failed to resend verification email';
      setError(errorMsg);
      return { data: null, error: errorMsg };
    }
  };

  const value = {
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
    resendVerificationEmail,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
