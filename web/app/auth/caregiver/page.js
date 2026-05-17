'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth';
import { registerCaregiver, loginCaregiver, verifyEmail as apiVerifyEmail, resendVerificationCode } from '../../../lib/api';
import { SignInPage, RegisterPage, AuthField } from '../../../components/ui/sign-in';

const HERO = '/hero-fall.jpg';

const TESTIMONIALS = [];

export default function CaregiverAuthPage() {
  const router = useRouter();
  const { login, user, ready } = useAuth();

  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verifyEmail, setVerifyEmail] = useState('');
  const [verifyPatientName, setVerifyPatientName] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyDone, setVerifyDone] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (user?.role === 'caregiver') router.replace('/caregiver');
    if (user?.role === 'patient')   router.replace('/patient');
  }, [ready, user]);

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
      const code = err?.response?.data?.code;
      if (code === 'EMAIL_NOT_VERIFIED') {
        // Transition into the verify flow rather than showing a dead-end error
        setVerifyEmail(fd.get('email') || '');
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
      const data = await registerCaregiver({
        name: fd.get('name'),
        relationship: fd.get('relationship'),
        email: fd.get('email'),
        password: fd.get('password'),
        connectionCode: fd.get('connectionCode'),
      });
      setVerifyEmail(data.email || fd.get('email'));
      setVerifyPatientName(data.patientName || '');
    } catch (err) {
      setError(err?.response?.data?.error || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  }

  if (!ready) return null;

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

  /* Post-registration: verify email screen */
  if (verifyEmail) {
    return (
      <div style={{
        minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #FFF9F0 0%, #FFFBF7 40%, rgba(252,233,171,0.10) 100%)',
        padding: 24,
      }}>
        <div style={{
          width: '100%', maxWidth: 460,
          background: 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          border: '2px solid rgba(255,255,255,0.95)',
          borderRadius: 32, padding: '44px 40px',
          boxShadow: '0 24px 60px rgba(45,45,45,0.12)',
          textAlign: 'center',
        }}>
          {verifyDone ? (
            <>
              <p style={{ fontSize: 40, margin: '0 0 16px' }}>✅</p>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 34, fontWeight: 400, color: '#2D2D2D', margin: '0 0 12px' }}>
                Email verified!
              </h2>
              {verifyPatientName && (
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 16, color: '#FC8A2D', margin: '0 0 16px', fontWeight: 600 }}>
                  Connected to {verifyPatientName}
                </p>
              )}
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, color: '#6B6B6B', margin: '0 0 28px' }}>
                Your account is active. Sign in to access your dashboard.
              </p>
              <button
                onClick={() => { setVerifyEmail(''); setVerifyDone(false); setMode('login'); }}
                style={{
                  width: '100%', padding: '15px 20px', borderRadius: 999, border: 0,
                  background: '#FC8A2D', color: '#fff', fontSize: 16, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'var(--font-sans)',
                  boxShadow: '0 8px 24px rgba(252,138,45,0.30)',
                }}
              >
                Sign in
              </button>
            </>
          ) : (
            <>
              <p style={{ fontSize: 40, margin: '0 0 16px' }}>✉️</p>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 34, fontWeight: 400, color: '#2D2D2D', margin: '0 0 8px' }}>
                Check your email
              </h2>
              {verifyPatientName && (
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: '#FC8A2D', margin: '0 0 12px', fontWeight: 600 }}>
                  Connected to {verifyPatientName}
                </p>
              )}
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: '#6B6B6B', lineHeight: 1.6, margin: '0 0 24px' }}>
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
                  onFocus={e => { e.currentTarget.style.borderColor = '#FC8A2D'; }}
                  onBlur={e => { if (!verifyError) e.currentTarget.style.borderColor = 'rgba(252,138,45,0.30)'; }}
                />
                {verifyError && (
                  <p style={{ fontSize: 13, color: verifyError.includes('sent') ? '#6B6B6B' : '#C42B34', margin: 0 }}>
                    {verifyError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={verifyCode.length !== 6 || verifyLoading}
                  style={{
                    padding: '15px 20px', borderRadius: 999, border: 0,
                    background: '#FC8A2D', color: '#fff', fontSize: 16, fontWeight: 700,
                    cursor: verifyCode.length === 6 ? 'pointer' : 'not-allowed',
                    opacity: verifyCode.length !== 6 || verifyLoading ? 0.5 : 1,
                    fontFamily: 'var(--font-sans)',
                    boxShadow: '0 8px 24px rgba(252,138,45,0.28)',
                  }}
                >
                  {verifyLoading ? 'Verifying…' : 'Verify email'}
                </button>
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
      </div>
    );
  }

  /* Register mode */
  if (mode === 'register') {
    return (
      <RegisterPage
        title="Join as caregiver."
        description="Connect with your loved one and keep them safe."
        heroImageSrc={HERO}
        testimonials={TESTIMONIALS}
        accentColor="#FC8A2D"
        onRegister={handleRegister}
        onSignIn={() => { setMode('login'); setError(''); }}
        loading={loading}
        error={error}
      >
        <AuthField label="Full name"       name="name"           placeholder="Your name"              delay="animate-delay-200" />
        <AuthField label="Relationship"    name="relationship"   placeholder="e.g. Daughter, Son"     delay="animate-delay-300" />
        <AuthField label="Connection code" name="connectionCode" placeholder="6-digit code from patient" delay="animate-delay-400" />
        <AuthField label="Email"           name="email"          type="email" placeholder="your@email.com"    delay="animate-delay-500" />
        <AuthField label="Password"        name="password"       type="password" placeholder="Choose a password" delay="animate-delay-600" />
      </RegisterPage>
    );
  }

  /* Sign-in mode (default) */
  return (
    <SignInPage
      title={<>Welcome<br /><span className="font-light">back.</span></>}
      description="Sign in to your caregiver dashboard."
      heroImageSrc={HERO}
      testimonials={TESTIMONIALS}
      accentColor="#FC8A2D"
      onSignIn={handleLogin}
      onCreateAccount={() => { setMode('register'); setError(''); }}
      loading={loading}
      error={error}
    />
  );
}
