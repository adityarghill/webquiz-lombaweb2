import { Link } from 'react-router-dom';
import { useAuth } from '@/context/authContext';

/**
 * AuthGate — Bungkus komponen yang butuh login.
 * - Jika loading: tampilkan spinner.
 * - Jika belum login: tampilkan prompt login (tidak bisa akses fitur).
 * - Jika sudah login: render children.
 *
 * Props:
 *   feature  — nama fitur (string) untuk pesan prompt
 *   children — komponen yang dilindungi
 */
export function AuthGate({ children, feature = 'fitur ini' }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 44, height: 44, border: '3px solid #111', borderTopColor: 'transparent',
            borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 12px',
          }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <p style={{ fontWeight: 800, color: '#6B7280', fontSize: 14 }}>Memuat…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{
        maxWidth: 480, margin: '60px auto', padding: '40px 32px',
        border: '3px solid #111', borderRadius: 24,
        boxShadow: '7px 7px 0 #111', background: '#FFFBEB',
        textAlign: 'center',
      }}>
        {/* Lock icon */}
        <div style={{
          width: 72, height: 72, borderRadius: 20, background: '#FFE566',
          border: '3px solid #111', boxShadow: '4px 4px 0 #111',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <svg width={36} height={36} viewBox="0 0 24 24" fill="none"
            stroke="#111" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
        </div>

        <h2 style={{ fontWeight: 900, fontSize: 24, color: '#111', margin: '0 0 8px' }}>
          Login Diperlukan
        </h2>
        <p style={{ color: '#6B7280', fontSize: 15, margin: '0 0 28px', lineHeight: 1.5 }}>
          Kamu perlu login untuk menggunakan <strong>{feature}</strong>.
          Progress dan data kamu akan tersimpan otomatis di akunmu.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/auth/sign-in" style={{ textDecoration: 'none' }}>
            <button style={{
              padding: '12px 28px', borderRadius: 12, border: '3px solid #111',
              background: '#111', color: '#FFE566', fontWeight: 900, fontSize: 14,
              cursor: 'pointer', boxShadow: '4px 4px 0 #555', letterSpacing: '0.04em',
              transition: 'all 0.12s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = '2px 2px 0 #555'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '4px 4px 0 #555'; }}>
              Sign In
            </button>
          </Link>
          <Link to="/auth/sign-up" style={{ textDecoration: 'none' }}>
            <button style={{
              padding: '12px 28px', borderRadius: 12, border: '3px solid #111',
              background: '#fff', color: '#111', fontWeight: 900, fontSize: 14,
              cursor: 'pointer', boxShadow: '4px 4px 0 #111', letterSpacing: '0.04em',
              transition: 'all 0.12s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = '2px 2px 0 #111'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '4px 4px 0 #111'; }}>
              Daftar Gratis
            </button>
          </Link>
        </div>

        <p style={{ marginTop: 20, fontSize: 12, color: '#9CA3AF' }}>
          Kamu tetap bisa mengerjakan quiz tanpa login, tapi progress tidak tersimpan.
        </p>
      </div>
    );
  }

  return children;
}

export default AuthGate;