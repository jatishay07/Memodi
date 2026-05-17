'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth';
import { registerCaregiver, loginCaregiver } from '../../../lib/api';
import { SignInPage, RegisterPage, AuthField } from '../../../components/ui/sign-in';

const HERO = '/hero-fall.jpg';

const TESTIMONIALS = [
  {
    avatarSrc: 'https://randomuser.me/api/portraits/women/44.jpg',
    name: 'Sarah L.',
    handle: 'Caregiver',
    text: "Memodi gives me peace of mind. I always know how mum is doing.",
  },
  {
    avatarSrc: 'https://randomuser.me/api/portraits/men/36.jpg',
    name: 'David K.',
    handle: 'Caregiver',
    text: "The alerts are calm and clear — it never feels alarming, just helpful.",
  },
];

export default function CaregiverAuthPage() {
  const router = useRouter();
  const { login, user, ready } = useAuth();

  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // After registration, show a "check your email" screen
  const [verifyEmail, setVerifyEmail] = useState('');
  const [verifyPatientName, setVerifyPatientName] = useState('');

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
        setError('Please verify your email before signing in. Check your inbox for the confirmation link.');
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
          <p style={{ fontSize: 40, margin: '0 0 16px' }}>✉️</p>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 34, fontWeight: 400, color: '#2D2D2D', margin: '0 0 12px' }}>
            Check your email
          </h2>
          {verifyPatientName && (
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 16, color: '#FC8A2D', margin: '0 0 16px', fontWeight: 600 }}>
              Connected to {verifyPatientName}
            </p>
          )}
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, color: '#6B6B6B', lineHeight: 1.6, margin: '0 0 28px' }}>
            We sent a verification link to <strong>{verifyEmail}</strong>. Click it to activate your account, then come back and sign in.
          </p>
          <button
            onClick={() => { setVerifyEmail(''); setMode('login'); }}
            style={{
              width: '100%', padding: '15px 20px', borderRadius: 999, border: 0,
              background: '#FC8A2D', color: '#fff',
              fontSize: 16, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              boxShadow: '0 8px 24px rgba(252,138,45,0.30)',
            }}
          >
            Go to sign in
          </button>
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
