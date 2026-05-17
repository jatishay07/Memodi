'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth';
import { registerPatient, loginPatient, verifyEmail as apiVerifyEmail, resendVerificationCode } from '../../../lib/api';
import { SignInPage, RegisterPage, AuthField } from '../../../components/ui/sign-in';

const HERO = '/hero-fall.jpg';

const TESTIMONIALS = [
  {
    avatarSrc: 'https://randomuser.me/api/portraits/women/68.jpg',
    name: 'Eleanor J.',
    handle: 'Memodi user',
    text: "I never feel alone now. Memodi always knows what I need to hear.",
  },
  {
    avatarSrc: 'https://randomuser.me/api/portraits/men/77.jpg',
    name: 'Robert M.',
    handle: 'Memodi user',
    text: "It remembers my family for me. That means the world.",
  },
];

const PINK = '#DC4F7C';

export default function PatientAuthPage() {
  const router = useRouter();
  const { login, user, ready } = useAuth();

  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Post-registration state
  const [verifyEmail, setVerifyEmail] = useState('');
  const [verifyConnectionCode, setVerifyConnectionCode] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyDone, setVerifyDone] = useState(false);

  // Step 3: sign-in after verification
  const [signInLoading, setSignInLoading] = useState(false);
  const [signInError, setSignInError] = useState('');

  useEffect(() => {
    if (!ready) return;
    if (user?.role === 'patient')   router.replace('/patient');
    if (user?.role === 'caregiver') router.replace('/caregiver');
  }, [ready, user]);

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const data = await loginPatient({ email: fd.get('email'), password: fd.get('password') });
      login({ token: data.token, patientId: data.patientId, role: 'patient', name: data.name });
      router.replace('/patient');
    } catch (err) {
      const code = err?.response?.data?.code;
      if (code === 'EMAIL_NOT_VERIFIED') {
        // Transition into the verify flow rather than showing a dead-end error
        setVerifyEmail(fd.get('email') || '');
        setVerifyConnectionCode('');
        setVerifyCode('');
        setVerifyError('');
        setVerifyDone(false);
      } else {
        setError(err?.response?.data?.error || 'Incorrect email or password.');
      }
    } finally { setLoading(false); }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const data = await registerPatient({ name: fd.get('name'), email: fd.get('email'), password: fd.get('password') });
      setVerifyEmail(data.email || fd.get('email'));
      setVerifyConnectionCode(data.connectionCode || '');
    } catch (err) {
      setError(err?.response?.data?.error || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
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
    } finally { setVerifyLoading(false); }
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

  async function handleSignInAfterVerify(e) {
    e.preventDefault();
    setSignInError('');
    setSignInLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const data = await loginPatient({ email: verifyEmail, password: fd.get('password') });
      login({ token: data.token, patientId: data.patientId, role: 'patient', name: data.name });
      router.replace('/patient');
    } catch (err) {
      setSignInError(err?.response?.data?.error || 'Sign-in failed. Check your password.');
    } finally { setSignInLoading(false); }
  }

  if (!ready) return null;

  /* ── Step 2: Verify email ── */
  if (verifyEmail && !verifyDone) {
    return (
      <Shell>
        <p style={{ fontSize: 40, margin: '0 0 16px', textAlign: 'center' }}>✉️</p>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 30, fontWeight: 400, color: '#2D2D2D', margin: '0 0 8px', textAlign: 'center' }}>
          Check your email
        </h2>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: '#6B6B6B', lineHeight: 1.6, margin: '0 0 20px', textAlign: 'center' }}>
          We sent a 6-digit code to <strong>{verifyEmail}</strong>.
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
              border: `2px solid ${verifyError && !verifyError.includes('sent') ? '#C42B34' : `rgba(220,79,124,0.30)`}`,
              background: '#FFF9F0', fontFamily: 'var(--font-serif)',
              fontSize: 32, color: '#2D2D2D', letterSpacing: '0.25em',
              outline: 'none', width: '100%', boxSizing: 'border-box',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = PINK; }}
            onBlur={e => { if (!verifyError || verifyError.includes('sent')) e.currentTarget.style.borderColor = 'rgba(220,79,124,0.30)'; }}
          />
          {verifyError && (
            <p style={{ fontSize: 13, color: verifyError.includes('sent') ? '#6B6B6B' : '#C42B34', margin: 0, textAlign: 'center' }}>
              {verifyError}
            </p>
          )}
          <button
            type="submit"
            disabled={verifyCode.length !== 6 || verifyLoading}
            style={{
              padding: '15px 20px', borderRadius: 999, border: 0,
              background: PINK, color: '#fff', fontSize: 16, fontWeight: 700,
              cursor: verifyCode.length === 6 ? 'pointer' : 'not-allowed',
              opacity: verifyCode.length !== 6 || verifyLoading ? 0.5 : 1,
              fontFamily: 'var(--font-sans)',
              boxShadow: '0 8px 24px rgba(220,79,124,0.28)',
            }}
          >
            {verifyLoading ? 'Verifying…' : 'Verify email'}
          </button>
          <button type="button" onClick={handleResend} style={{
            background: 'none', border: 'none', color: '#9C9C9C',
            fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-sans)',
          }}>
            Didn&apos;t get it? Resend code
          </button>
        </form>
      </Shell>
    );
  }

  /* ── Step 3: Verified — show connection code + sign in ── */
  if (verifyEmail && verifyDone) {
    return (
      <Shell>
        <p style={{ fontSize: 40, margin: '0 0 12px', textAlign: 'center' }}>✅</p>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 30, fontWeight: 400, color: '#2D2D2D', margin: '0 0 16px', textAlign: 'center' }}>
          Email verified!
        </h2>

        {verifyConnectionCode && (
          <div style={{
            background: 'rgba(220,79,124,0.06)',
            border: '2px solid rgba(220,79,124,0.20)',
            borderRadius: 20, padding: '20px 24px', marginBottom: 24, textAlign: 'center',
          }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 700, color: PINK, textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 8px' }}>
              Your connection code
            </p>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: 38, fontWeight: 400, color: '#2D2D2D', margin: '0 0 6px', letterSpacing: '0.18em', lineHeight: 1 }}>
              {verifyConnectionCode}
            </p>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: '#9C9C9C', margin: 0 }}>
              Share this with your caregiver so they can connect.
            </p>
            <button
              onClick={() => navigator.clipboard?.writeText(verifyConnectionCode)}
              style={{ marginTop: 8, background: 'none', border: 'none', color: PINK, fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 600 }}
            >
              Copy code
            </button>
          </div>
        )}

        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: '#6B6B6B', margin: '0 0 16px', textAlign: 'center' }}>
          Sign in to enter Memodi.
        </p>
        <form onSubmit={handleSignInAfterVerify} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            name="password"
            type="password"
            placeholder="Your password"
            required
            style={{
              padding: '13px 16px', borderRadius: 14,
              border: `2px solid rgba(220,79,124,0.20)`,
              background: 'rgba(255,255,255,0.80)',
              fontSize: 16, fontFamily: 'var(--font-sans)', color: '#2D2D2D',
              outline: 'none', width: '100%', boxSizing: 'border-box',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'rgba(220,79,124,0.55)'; }}
            onBlur={e => { e.currentTarget.style.borderColor = 'rgba(220,79,124,0.20)'; }}
          />
          {signInError && <p style={{ color: '#C42B34', fontSize: 13, margin: 0, textAlign: 'center' }}>{signInError}</p>}
          <button
            type="submit"
            disabled={signInLoading}
            style={{
              padding: '15px 20px', borderRadius: 999, border: 0,
              background: PINK, color: '#fff', fontSize: 16, fontWeight: 700,
              cursor: 'pointer', opacity: signInLoading ? 0.6 : 1,
              fontFamily: 'var(--font-sans)',
              boxShadow: '0 8px 24px rgba(220,79,124,0.28)',
            }}
          >
            {signInLoading ? 'Signing in…' : 'Enter Memodi'}
          </button>
        </form>
      </Shell>
    );
  }

  /* ── Register mode ── */
  if (mode === 'register') {
    return (
      <RegisterPage
        title="Join Memodi."
        description="Create your account and let Memodi care for you."
        heroImageSrc={HERO}
        testimonials={TESTIMONIALS}
        accentColor={PINK}
        onRegister={handleRegister}
        onSignIn={() => { setMode('login'); setError(''); }}
        loading={loading}
        error={error}
      >
        <AuthField label="Full name" name="name"     placeholder="Your name"          delay="animate-delay-200" />
        <AuthField label="Email"     name="email"    type="email"    placeholder="your@email.com"   delay="animate-delay-300" />
        <AuthField label="Password"  name="password" type="password" placeholder="Choose a password" delay="animate-delay-400" />
      </RegisterPage>
    );
  }

  /* ── Sign-in mode (default) ── */
  return (
    <SignInPage
      title={<>Welcome<br /><span className="font-light">back.</span></>}
      description="Sign in to your Memodi account."
      heroImageSrc={HERO}
      testimonials={TESTIMONIALS}
      accentColor={PINK}
      onSignIn={handleLogin}
      onCreateAccount={() => { setMode('register'); setError(''); }}
      loading={loading}
      error={error}
    />
  );
}

function Shell({ children }) {
  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
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
        {children}
      </div>
    </div>
  );
}
