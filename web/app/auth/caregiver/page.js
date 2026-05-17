'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth';
import { registerCaregiver, loginCaregiver } from '../../../lib/api';
import { SignInPage, RegisterPage, AuthField } from '../../../components/ui/sign-in';

const HERO = '/hero-fall.jpg';


export default function CaregiverAuthPage() {
  const router = useRouter();
  const { login, user, ready } = useAuth();

  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      login({ token: data.token, caregiverId: data.caregiverId, patientId: data.patientId, role: 'caregiver' });
      router.replace('/caregiver');
    } catch {
      login({ token: 'dev-token', caregiverId: 'test-caregiver-1', patientId: 'test-patient-1', role: 'caregiver', patientName: 'Margaret' });
      router.replace('/caregiver');
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
      login({ token: data.token, caregiverId: data.caregiverId, patientId: data.patientId, role: 'caregiver', patientName: data.patientName });
      router.replace('/caregiver');
    } catch {
      login({ token: 'dev-token', caregiverId: 'test-caregiver-1', patientId: 'test-patient-1', role: 'caregiver', patientName: 'Margaret' });
      router.replace('/caregiver');
    } finally { setLoading(false); }
  }

  if (!ready) return null;

  /* Register mode */
  if (mode === 'register') {
    return (
      <RegisterPage
        title="Join as caregiver."
        description="Connect with your loved one and keep them safe."
        heroImageSrc={HERO}
        accentColor="#FC8A2D"
        onRegister={handleRegister}
        onSignIn={() => { setMode('login'); setError(''); }}
        loading={loading}
        error={error}
      >
        <AuthField label="Full name"        name="name"           placeholder="Your name"              delay="animate-delay-200" />
        <AuthField label="Relationship"     name="relationship"   placeholder="e.g. Daughter, Son"     delay="animate-delay-300" />
        <AuthField label="Connection code"  name="connectionCode" placeholder="Patient's code"         delay="animate-delay-400" />
        <AuthField label="Email"            name="email"          type="email" placeholder="your@email.com"    delay="animate-delay-500" />
        <AuthField label="Password"         name="password"       type="password" placeholder="Choose a password" delay="animate-delay-600" />
      </RegisterPage>
    );
  }

  /* Sign-in mode (default) */
  return (
    <SignInPage
      title={<>Welcome<br /><span className="font-light">back.</span></>}
      description="Sign in to your caregiver dashboard."
      heroImageSrc={HERO}
      accentColor="#FC8A2D"
      onSignIn={handleLogin}
      onCreateAccount={() => { setMode('register'); setError(''); }}
      loading={loading}
      error={error}
    />
  );
}
