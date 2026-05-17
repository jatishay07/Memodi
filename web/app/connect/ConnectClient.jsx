'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth';
import { registerCaregiver, loginCaregiver, verifyEmail as apiVerifyEmail, resendVerificationCode } from '../../lib/api';

const ACCENT = '#FC8A2D';

function Field({ label, name, type = 'text', placeholder, defaultValue }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: '#6B6B6B', fontFamily: 'var(--font-sans)' }}>
        {label}
      </label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        required
        style={{
          padding: '13px 16px', borderRadius: 14,
          border: '2px solid rgba(252,138,45,0.20)',
          background: 'rgba(255,255,255,0.80)',
          fontSize: 16, fontFamily: 'var(--font-sans)', color: '#2D2D2D',
          outline: 'none', width: '100%', boxSizing: 'border-box',
          transition: 'border-color .2s',
        }}
        onFocus={e => { e.currentTarget.style.borderColor = 'rgba(252,138,45,0.55)'; }}
        onBlur={e => { e.currentTarget.style.borderColor = 'rgba(252,138,45,0.20)'; }}
      />
    </div>
  );
}

function Btn({ children, loading, secondary, onClick, type = 'submit' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      style={{
        width: '100%', padding: '15px 20px', borderRadius: 999,
        border: secondary ? `2px solid ${ACCENT}` : 0,
        background: secondary ? 'transparent' : ACCENT,
        color: secondary ? ACCENT : '#fff',
        fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
        fontFamily: 'var(--font-sans)',
        opacity: loading ? 0.6 : 1,
        transition: 'all .2s ease',
        boxShadow: secondary ? 'none' : '0 8px 24px rgba(252,138,45,0.30)',
      }}
    >
      {loading ? 'Please wait…' : children}
    </button>
  );
}

export default function ConnectClient({ code }) {
  const router = useRouter();
  const { user, login, ready } = useAuth();

  const [mode, setMode] = useState('register');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verifyEmail, setVerifyEmail] = useState('');
  const [verifyPatientName, setVerifyPatientName] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyDone, setVerifyDone] = useState(false);

  // Already logged-in caregiver → send to their dashboard (permanent link)
  useEffect(() => {
    if (!ready) return;
    if (user?.role === 'caregiver') router.replace('/caregiver');
    if (user?.role === 'patient') router.replace('/patient');
  }, [ready, user]);

  async function handleRegister(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const data = await registerCaregiver({
        name: fd.get('name'),
        relationship: fd.get('relationship'),
        email: fd.get('email'),
        password: fd.get('password'),
        connectionCode: code,
      });
      setVerifyEmail(data.email || fd.get('email'));
      setVerifyPatientName(data.patientName || '');
    } catch (err) {
      setError(err?.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const data = await loginCaregiver({ email: fd.get('email'), password: fd.get('password') });
      login({ token: data.token, caregiverId: data.caregiverId, patientId: data.patientId, role: 'caregiver', name: data.name });
      router.replace('/caregiver');
    } catch (err) {
      const errCode = err?.response?.data?.code;
      if (errCode === 'EMAIL_NOT_VERIFIED') {
        setError('Please verify your email before signing in. Check your inbox for the confirmation link.');
      } else {
        setError(err?.response?.data?.error || 'Incorrect email or password.');
      }
    } finally {
      setLoading(false);
    }
  }

  if (!ready) return null;

  if (!code) {
    return (
      <Shell>
        <p style={{ color: '#C42B34', textAlign: 'center', fontFamily: 'var(--font-sans)', lineHeight: 1.55 }}>
          No connection code found in this link. Ask your patient to share a fresh invite link from the Memodi app.
        </p>
      </Shell>
    );
  }

  async function handleVerify(e) {
    e.preventDefault();
    setVerifyError('');
    setVerifyLoading(true);
    try {
      await apiVerifyEmail(verifyEmail, verifyCode);
      setVerifyDone(true);
    } catch (err) {
      setVerifyError(err?.response?.data?.error || 'Incorrect code. Try again.');
    } finally {
      setVerifyLoading(false);
    }
  }

  async function handleResend() {
    setVerifyError('');
    try {
      await resendVerificationCode(verifyEmail);
      setVerifyError('New code sent — check your email.');
    } catch {
      setVerifyError('Could not resend. Try again shortly.');
    }
  }

  /* Post-registration: verify email */
  if (verifyEmail) {
    return (
      <Shell>
        <div style={{ textAlign: 'center' }}>
          {verifyDone ? (
            <>
              <p style={{ fontSize: 40, margin: '0 0 16px' }}>✅</p>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: 28, color: '#2D2D2D', margin: '0 0 8px' }}>
                Email verified!
              </p>
              {verifyPatientName && (
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: ACCENT, fontWeight: 600, margin: '0 0 12px' }}>
                  Connected to {verifyPatientName}
                </p>
              )}
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: '#6B6B6B', margin: '0 0 24px' }}>
                Your account is active. Sign in to continue.
              </p>
              <Btn type="button" onClick={() => { setVerifyEmail(''); setVerifyDone(false); setMode('login'); }}>
                Sign in
              </Btn>
            </>
          ) : (
            <>
              <p style={{ fontSize: 40, margin: '0 0 16px' }}>✉️</p>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: 28, color: '#2D2D2D', margin: '0 0 8px' }}>
                Check your email
              </p>
              {verifyPatientName && (
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: ACCENT, fontWeight: 600, margin: '0 0 12px' }}>
                  Connected to {verifyPatientName}
                </p>
              )}
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: '#6B6B6B', lineHeight: 1.6, margin: '0 0 20px' }}>
                We sent a 6-digit code to <strong>{verifyEmail}</strong>. Enter it below.
              </p>
              <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={verifyCode}
                  onChange={e => { setVerifyError(''); setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6)); }}
                  style={{
                    padding: '16px 20px', borderRadius: 16, textAlign: 'center',
                    border: `2px solid ${verifyError ? '#C42B34' : 'rgba(252,138,45,0.30)'}`,
                    background: '#FFF9F0', fontFamily: 'var(--font-serif)',
                    fontSize: 32, color: '#2D2D2D', letterSpacing: '0.25em',
                    outline: 'none', width: '100%', boxSizing: 'border-box',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = ACCENT; }}
                  onBlur={e => { if (!verifyError) e.currentTarget.style.borderColor = 'rgba(252,138,45,0.30)'; }}
                />
                {verifyError && (
                  <p style={{ fontSize: 13, color: verifyError.includes('sent') ? '#6B6B6B' : '#C42B34', margin: 0 }}>
                    {verifyError}
                  </p>
                )}
                <Btn loading={verifyLoading} type="submit">
                  {verifyCode.length === 6 ? 'Verify email' : `Enter ${6 - verifyCode.length} more digits`}
                </Btn>
                <button
                  type="button"
                  onClick={handleResend}
                  style={{
                    background: 'none', border: 'none', color: '#9C9C9C',
                    fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-sans)',
                  }}
                >
                  Didn&apos;t get it? Resend code
                </button>
              </form>
            </>
          )}
        </div>
      </Shell>
    );
  }

  const codeDisplay = code.length === 6 ? `${code.slice(0, 3)} ${code.slice(3)}` : code;

  return (
    <Shell>
      {/* Code badge */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <p style={{
          fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 700,
          color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 8px',
        }}>
          Patient connection code
        </p>
        <p style={{
          fontFamily: 'var(--font-serif)', fontSize: 52, fontWeight: 400,
          color: '#2D2D2D', margin: 0, letterSpacing: '0.15em', lineHeight: 1,
        }}>
          {codeDisplay}
        </p>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: '#9C9C9C', margin: '8px 0 0' }}>
          Your patient has invited you to connect.
        </p>
      </div>

      {/* Register */}
      {mode === 'register' && (
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Full name"    name="name"         placeholder="Your name" />
          <Field label="Relationship" name="relationship" placeholder="e.g. Daughter, Son" />
          <Field label="Email"        name="email"        type="email"     placeholder="your@email.com" />
          <Field label="Password"     name="password"     type="password"  placeholder="Choose a password" />
          {error && <p style={{ color: '#C42B34', fontSize: 14, textAlign: 'center', fontFamily: 'var(--font-sans)', margin: 0 }}>{error}</p>}
          <Btn loading={loading}>Create account &amp; connect</Btn>
          <Btn secondary type="button" onClick={() => { setMode('login'); setError(''); }}>
            Already have an account? Sign in
          </Btn>
        </form>
      )}

      {/* Login */}
      {mode === 'login' && (
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: '#6B6B6B', textAlign: 'center', margin: 0 }}>
            Sign in to your existing caregiver account.
          </p>
          <Field label="Email"    name="email"    type="email"    placeholder="your@email.com" />
          <Field label="Password" name="password" type="password" placeholder="Your password" />
          {error && <p style={{ color: '#C42B34', fontSize: 14, textAlign: 'center', fontFamily: 'var(--font-sans)', margin: 0 }}>{error}</p>}
          <Btn loading={loading}>Sign in</Btn>
          <Btn secondary type="button" onClick={() => { setMode('register'); setError(''); }}>
            New caregiver? Register instead
          </Btn>
        </form>
      )}
    </Shell>
  );
}

function Shell({ children }) {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #FFF9F0 0%, #FFFBF7 40%, rgba(252,233,171,0.10) 100%)',
      padding: '32px 16px',
    }}>
      <div style={{
        width: '100%', maxWidth: 440,
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        border: '2px solid rgba(255,255,255,0.95)',
        borderRadius: 32, padding: '40px 36px',
        boxShadow: '0 24px 60px rgba(45,45,45,0.12)',
      }}>
        <p style={{
          fontFamily: 'var(--font-serif)', fontSize: 32, fontWeight: 400,
          color: '#2D2D2D', margin: '0 0 24px', textAlign: 'center',
        }}>
          Join as caregiver
        </p>
        {children}
      </div>
    </div>
  );
}
