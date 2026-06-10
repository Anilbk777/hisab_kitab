import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import HisabKitabLogo from '../components/HisabKitabLogo';

/* Brand accent: blue gradient */
const GRAD = 'linear-gradient(90deg, #60A5FA 0%, #3B82F6 50%, #1D4ED8 100%)';
const ACCENT = '#2563EB';
const ACCENT_HOVER = '#1D4ED8';

/* ─── Eye icons ──────────────────────────────────────────────────────────── */
const EyeOpen = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeOff = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

/* ─── Spinner ────────────────────────────────────────────────────────────── */
const Spinner = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"
    style={{ animation: 'spin 0.7s linear infinite' }}>
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
);

/* ─── Input field ────────────────────────────────────────────────────────── */
const InputField = ({ id, label, type = 'text', value, onChange, placeholder, rightEl }) => (
  <div className="flex flex-col gap-1.5">
    <label
      htmlFor={id}
      style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: 13,
        fontWeight: 600,
        color: '#4A4065',
        letterSpacing: '0.02em',
      }}
    >
      {label}
    </label>
    <div className="relative flex items-center">
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete="off"
        style={{
          width: '100%',
          background: '#F5F1FB',
          border: '1.5px solid #E2DAF0',
          borderRadius: 12,
          padding: rightEl ? '12px 44px 12px 16px' : '12px 16px',
          color: '#2D2640',
          fontFamily: "'Inter', sans-serif",
          fontSize: 14,
          outline: 'none',
          transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
        }}
        onFocus={e => {
          e.target.style.borderColor = '#2563EB';
          e.target.style.boxShadow  = '0 0 0 3px rgba(37,99,235,0.12)';
          e.target.style.background = '#FFFFFF';
        }}
        onBlur={e => {
          e.target.style.borderColor = '#E2DAF0';
          e.target.style.boxShadow   = 'none';
          e.target.style.background  = '#F5F1FB';
        }}
      />
      {rightEl && (
        <span className="absolute right-3 cursor-pointer select-none" style={{ color: '#9B8BB8' }}>
          {rightEl}
        </span>
      )}
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════════════════
   LOGIN PAGE
══════════════════════════════════════════════════════════════════════════ */
const LoginPage = () => {
  const navigate = useNavigate();

  const [form,     setForm]     = useState({ phone: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const handleChange = key => e => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    if (!form.phone.trim() || !form.password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append('username', form.phone.trim());
      formData.append('password', form.password);

      const res  = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });

      let data;
      try {
        data = await res.json();
      } catch (e) {
        throw new Error(`Server error (${res.status}). Please check if the backend is running.`);
      }

      if (!res.ok) throw new Error(data?.detail || 'Login failed. Please try again.');

      localStorage.setItem('hk_token', data.access_token);
      if (data.refresh_token) {
        localStorage.setItem('hk_refresh_token', data.refresh_token);
      }
      navigate('/dashboard');
    } catch (err) {
      const msg = err.message === 'Failed to fetch' 
        ? 'Unable to connect to server. Is the backend running?' 
        : err.message;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Decorative blobs */}
      <div style={styles.blobTR} />
      <div style={styles.blobBL} />

      {/* Centered card */}
      <div style={styles.card}>
        {/* Logo */}
        <div className="flex justify-center mb-7">
          <HisabKitabLogo size="md" showTag theme="light" />
        </div>

        {/* Heading */}
        <div className="mb-6 text-center">
          <h1 style={styles.heading}>Welcome back</h1>
          <p style={styles.sub}>Sign in to your ledger account</p>
        </div>

        {/* Error */}
        {error && (
          <div style={styles.errorBox}>⚠ {error}</div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <InputField
            id="login-phone"
            label="Phone Number"
            type="tel"
            value={form.phone}
            onChange={handleChange('phone')}
            placeholder="+977 98XXXXXXXX"
          />

          <InputField
            id="login-password"
            label="Password"
            type={showPass ? 'text' : 'password'}
            value={form.password}
            onChange={handleChange('password')}
            placeholder="Enter your password"
            rightEl={
              <span onClick={() => setShowPass(p => !p)}>
                {showPass ? <EyeOff /> : <EyeOpen />}
              </span>
            }
          />

          {/* Forgot password */}
          {/* <div className="flex justify-end" style={{ marginTop: -6 }}>
            <button type="button" style={styles.textLink}>
              Forgot password?
            </button>
          </div> */}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.gradientBtn,
              opacity: loading ? 0.75 : 1,
              cursor:  loading ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={e => { if (!loading) e.target.style.boxShadow = '0 6px 28px rgba(59, 130, 246, 0.5)'; }}
            onMouseLeave={e => { e.target.style.boxShadow = styles.gradientBtn.boxShadow; }}
          >
            {loading
              ? <span className="flex items-center justify-center gap-2"><Spinner /> Signing in…</span>
              : 'Sign In'
            }
          </button>
        </form>

        {/* Divider */}
        <div style={styles.divider}>
          <span style={styles.dividerLine} />
          <span style={styles.dividerText}>or</span>
          <span style={styles.dividerLine} />
        </div>

        {/* Register link */}
        <p style={styles.bottomText}>
          Don't have an account?{' '}
          <Link to="/register" style={styles.accentLink}>Create one</Link>
        </p>
      </div>
    </div>
  );
};

/* ─── Shared styles (light theme) ───────────────────────────────────────── */
const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    /* warm cream gradient background */
    background: 'linear-gradient(145deg, #FDF8F2 0%, #F7F0FC 50%, #FDF4F8 100%)',
    padding: '24px 16px',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'Inter', sans-serif",
  },
  /* soft blue blob top-right */
  blobTR: {
    position: 'absolute',
    top: '-160px',
    right: '-160px',
    width: '480px',
    height: '480px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(37,99,235,0.10) 0%, transparent 65%)',
    pointerEvents: 'none',
  },
  /* soft blue blob bottom-left */
  blobBL: {
    position: 'absolute',
    bottom: '-160px',
    left: '-120px',
    width: '420px',
    height: '420px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(29, 78, 216, 0.10) 0%, transparent 65%)',
    pointerEvents: 'none',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    background: '#FFFFFF',
    border: '1px solid rgba(37,99,235,0.12)',
    borderRadius: '24px',
    padding: '40px 32px',
    boxShadow: '0 4px 40px rgba(37,99,235,0.10), 0 1px 4px rgba(0,0,0,0.05)',
    position: 'relative',
    zIndex: 1,
  },
  heading: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 24,
    fontWeight: 700,
    color: '#1C1433',
    margin: 0,
    letterSpacing: '-0.02em',
  },
  sub: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    color: '#7B6F96',
    marginTop: 6,
  },
  errorBox: {
    background: '#FFF0F3',
    border: '1px solid #FFCDD6',
    borderRadius: 10,
    padding: '10px 14px',
    color: '#C0304A',
    fontSize: 13,
    fontFamily: "'Inter', sans-serif",
    marginBottom: 4,
  },
  gradientBtn: {
    marginTop: 4,
    width: '100%',
    padding: '14px',
    border: 'none',
    borderRadius: 12,
    background: 'linear-gradient(90deg, #60A5FA 0%, #3B82F6 50%, #1D4ED8 100%)',
    color: '#fff',
    fontFamily: "'Inter', sans-serif",
    fontSize: 15,
    fontWeight: 600,
    letterSpacing: '0.02em',
    boxShadow: '0 4px 20px rgba(59, 130, 246, 0.35)',
    transition: 'opacity 0.2s, box-shadow 0.2s',
  },
  textLink: {
    background: 'none',
    border: 'none',
    fontFamily: "'Inter', sans-serif",
    fontSize: 13,
    color: '#2563EB',
    cursor: 'pointer',
    padding: 0,
    fontWeight: 500,
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    margin: '24px 0 16px',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: '#EDE8F5',
    display: 'block',
  },
  dividerText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 13,
    color: '#B0A3C8',
  },
  bottomText: {
    textAlign: 'center',
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    color: '#7B6F96',
    margin: 0,
  },
  accentLink: {
    color: '#2563EB',
    fontWeight: 600,
    textDecoration: 'none',
  },
};

export default LoginPage;
