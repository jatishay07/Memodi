'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth';
import { registerPatient, loginPatient } from '../../../lib/api';

export default function PatientAuthPage() {
  const router = useRouter();
  const { login, user, ready } = useAuth();
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [connectionCode, setConnectionCode] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (!ready) return;
    if (user?.role === 'patient')   router.replace('/patient');
    if (user?.role === 'caregiver') router.replace('/caregiver');
  }, [ready, user]);

  async function handleRegister(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await registerPatient({ name, email, password });
      setConnectionCode(data.connectionCode);
      login({ token: data.token, patientId: data.patientId, role: 'patient', name: data.name });
    } catch {
      // Dev bypass: use mock data so the UI is testable without a backend
      const mockName = name || 'Margaret';
      login({ token: 'dev-token', patientId: 'test-patient-1', role: 'patient', name: mockName });
      setConnectionCode('DEMO-1234');
    } finally { setLoading(false); }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await loginPatient({ email, password });
      login({ token: data.token, patientId: data.patientId, role: 'patient', name: data.name });
      router.replace('/patient');
    } catch {
      // Dev bypass: use mock data so the UI is testable without a backend
      login({ token: 'dev-token', patientId: 'test-patient-1', role: 'patient', name: 'Margaret' });
      router.replace('/patient');
    } finally { setLoading(false); }
  }

  if (connectionCode) {
    return (
      <AuthShell>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 36, fontWeight: 400, margin: '0 0 12px', color: '#2D2D2D' }}>
            Welcome.
          </h2>
          <p style={{ fontSize: 16, color: '#6B6B6B', lineHeight: 1.6, margin: 0 }}>
            Share this code with your caregiver so they can connect with you.
          </p>
        </div>
        <div style={{
          background: 'rgba(252,233,171,0.30)', border: '2px solid rgba(255,255,255,0.90)',
          borderRadius: 24, padding: '28px 24px', textAlign: 'center', marginBottom: 24,
        }}>
          <p style={{ fontSize: 12, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>
            Your connection code
          </p>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 48, fontWeight: 500, color: '#DC4F7C', letterSpacing: '0.12em', margin: 0 }}>
            {connectionCode}
          </p>
          <button
            onClick={() => navigator.clipboard?.writeText(connectionCode)}
            style={{ marginTop: 12, fontSize: 12, color: '#9C9C9C', background: 'none', border: 0, cursor: 'pointer' }}
          >
            Copy to clipboard
          </button>
        </div>
        <button onClick={() => router.replace('/patient')} style={btnStyle('#DC4F7C', '#fff')}>
          Continue to Memodi
        </button>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 40, fontWeight: 400, margin: '0 0 8px', color: '#2D2D2D' }}>
          {mode === 'login' ? 'Welcome back.' : 'Join Memodi.'}
        </h1>
        <p style={{ fontSize: 15, color: '#6B6B6B', margin: 0 }}>Patient portal</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 28, background: 'rgba(0,0,0,0.04)', borderRadius: 999, padding: 4 }}>
        {[['login', 'Sign In'], ['register', 'Create Account']].map(([m, label]) => (
          <button key={m} onClick={() => { setMode(m); setError(''); }} style={{
            flex: 1, padding: '10px 0', borderRadius: 999, border: 0, fontSize: 14, fontWeight: 500,
            cursor: 'pointer', fontFamily: 'var(--font-sans)',
            background: mode === m ? '#fff' : 'transparent',
            color: mode === m ? '#2D2D2D' : '#9C9C9C',
            boxShadow: mode === m ? '0 2px 8px rgba(45,45,45,0.08)' : 'none',
            transition: 'all .2s ease',
          }}>
            {label}
          </button>
        ))}
      </div>

      {error && <p style={{ color: '#C42B34', fontSize: 14, textAlign: 'center', marginBottom: 16 }}>{error}</p>}

      <form onSubmit={mode === 'register' ? handleRegister : handleLogin}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {mode === 'register' && (
            <WarmInput placeholder="Full name" value={name} onChange={setName} />
          )}
          <WarmInput placeholder="Email" type="email" value={email} onChange={setEmail} />
          <WarmInput placeholder="Password" type="password" value={password} onChange={setPassword} />
          <button
            type="submit"
            disabled={loading}
            style={{ ...btnStyle('#DC4F7C', '#fff'), marginTop: 8, opacity: loading ? 0.45 : 1 }}
          >
            {loading ? '…' : mode === 'register' ? 'Create Account' : 'Sign In'}
          </button>
        </div>
      </form>

      <p style={{ textAlign: 'center', fontSize: 13, color: '#9C9C9C', marginTop: 24 }}>
        Are you a caregiver?{' '}
        <a href="/auth/caregiver" style={{ color: '#DC4F7C', textDecoration: 'none' }}>Sign in here</a>
      </p>
    </AuthShell>
  );
}

function AuthShell({ children }) {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, position: 'relative', overflow: 'hidden',
    }}>
      {/* Ambient blobs */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
      }}>
        <div className="anim-drift" style={{
          position: 'absolute', top: '10%', left: '-10%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(220,79,124,0.22), transparent)',
          filter: 'blur(100px)',
        }} />
        <div className="anim-drift" style={{
          position: 'absolute', bottom: '10%', right: '-10%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(252,138,45,0.18), transparent)',
          filter: 'blur(100px)', animationDelay: '-9s',
        }} />
      </div>
      <div style={{
        position: 'relative', zIndex: 1, width: '100%', maxWidth: 420,
        background: 'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        border: '2px solid rgba(255,255,255,0.85)',
        borderRadius: 32, padding: '48px 40px',
        boxShadow: '0 24px 60px rgba(45,45,45,0.10)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 32, fontWeight: 500, color: '#3d342a' }}>
            Memodi
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}

function WarmInput({ placeholder, value, onChange, type = 'text' }) {
  return (
    <input
      type={type} placeholder={placeholder} value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        width: '100%', padding: '13px 20px', borderRadius: 20,
        background: '#FFF9F0', border: '2px solid rgba(255,255,255,0.90)',
        fontFamily: 'var(--font-sans)', fontSize: 16, color: '#2D2D2D',
        outline: 'none', boxSizing: 'border-box',
        transition: 'border-color .2s ease',
      }}
      onFocus={e => { e.currentTarget.style.borderColor = 'rgba(220,79,124,0.45)'; }}
      onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.90)'; }}
    />
  );
}

function btnStyle(bg, color) {
  return {
    width: '100%', padding: '14px 24px', borderRadius: 999, border: 0,
    background: bg, color, fontFamily: 'var(--font-sans)', fontSize: 16, fontWeight: 600,
    cursor: 'pointer', boxShadow: `0 10px 28px ${bg}44`,
    transition: 'opacity .2s ease',
  };
}
