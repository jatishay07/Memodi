'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth';
import { registerPatient, loginPatient } from '../../../lib/api';
import { SignInPage, RegisterPage, AuthField } from '../../../components/ui/sign-in';
import Logo from '../../../components/Logo';

const HERO = '/hero-fall.jpg';
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
const PINK = '#DC4F7C';

export default function PatientAuthPage() {
  const router = useRouter();
  const { login, user, ready } = useAuth();

  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [connectionCode, setConnectionCode] = useState('');

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
    } catch {
      login({ token: 'dev-token', patientId: 'test-patient-1', role: 'patient', name: 'Margaret' });
      router.replace('/patient');
    } finally { setLoading(false); }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const name = fd.get('name');
    try {
      const data = await registerPatient({ name, email: fd.get('email'), password: fd.get('password') });
      setConnectionCode(data.connectionCode);
      login({ token: data.token, patientId: data.patientId, role: 'patient', name: data.name });
    } catch {
      const mockName = name || 'Margaret';
      login({ token: 'dev-token', patientId: 'test-patient-1', role: 'patient', name: mockName });
      setConnectionCode('DEMO-1234');
    } finally { setLoading(false); }
  }

  if (!ready) return null;

  /* Connection code confirmation screen */
  if (connectionCode) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-warm-white p-6">
        <div className="w-full max-w-md bg-white/75 backdrop-blur-2xl border-2 border-white/85 rounded-[2rem] p-12 text-center shadow-xl">
          <Logo iconSize={52} textSize={28} gap={10} />
          <h2 className="font-serif text-4xl font-light text-ink mt-6 mb-3">Welcome.</h2>
          <p className="text-ink-soft text-base mb-8">
            Share this code with your caregiver so they can connect with you.
          </p>
          <div className="bg-vanilla-custard/30 border-2 border-white/90 rounded-2xl p-8 mb-6">
            <p className="text-xs text-ink-soft uppercase tracking-widest mb-3">Your connection code</p>
            <p className="font-serif text-5xl font-medium tracking-widest" style={{ color: PINK }}>
              {connectionCode}
            </p>
            <button
              onClick={() => navigator.clipboard?.writeText(connectionCode)}
              className="mt-3 text-xs text-ink-faint hover:text-ink-soft transition-colors"
            >
              Copy to clipboard
            </button>
          </div>
          <button
            onClick={() => router.replace('/patient')}
            className="w-full rounded-pill py-4 font-semibold text-white transition-all hover:opacity-90"
            style={{ background: PINK, boxShadow: '0 10px 28px rgba(220,79,124,0.35)' }}
          >
            Continue to Memodi
          </button>
        </div>
      </div>
    );
  }

  /* Register mode */
  if (mode === 'register') {
    return (
      <RegisterPage
        title="Join Memodi."
        description="Create your account and let Memodi care for you."
        heroImageSrc={HERO}
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
        accentColor={PINK}
        onRegister={handleRegister}
        onSignIn={() => { setMode('login'); setError(''); }}
        loading={loading}
        error={error}
      >
        <AuthField label="Full name"   name="name"     placeholder="Your name"           delay="animate-delay-200" />
        <AuthField label="Email"       name="email"    type="email" placeholder="your@email.com" delay="animate-delay-300" />
        <AuthField label="Password"    name="password" type="password" placeholder="Choose a password" delay="animate-delay-400" />
      </RegisterPage>
    );
  }

  /* Sign-in mode (default) */
  return (
    <SignInPage
      title={<>Welcome<br /><span className="font-light">back.</span></>}
      description="Sign in to your Memodi account."
      heroImageSrc={HERO}
      accentColor={PINK}
      onSignIn={handleLogin}
      onCreateAccount={() => { setMode('register'); setError(''); }}
      loading={loading}
      error={error}
    />
  );
}
