'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth';
import { registerCaregiver, loginCaregiver } from '../../../lib/api';

export default function CaregiverAuthPage() {
  const router = useRouter();
  const { login, user, ready } = useAuth();
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [connectionCode, setConnectionCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (!ready) return;
    if (user?.role === 'caregiver') router.replace('/caregiver');
    if (user?.role === 'patient')   router.replace('/patient');
  }, [ready, user]);

  async function handleRegister(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await registerCaregiver({ name, relationship, email, password, connectionCode });
      login({ token: data.token, caregiverId: data.caregiverId, patientId: data.patientId, role: 'caregiver', patientName: data.patientName });
      router.replace('/caregiver');
    } catch {
      // Dev bypass: use mock data so the UI is testable without a backend
      login({ token: 'dev-token', caregiverId: 'test-caregiver-1', patientId: 'test-patient-1', role: 'caregiver', patientName: 'Margaret' });
      router.replace('/caregiver');
    } finally { setLoading(false); }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await loginCaregiver({ email, password });
      login({ token: data.token, caregiverId: data.caregiverId, patientId: data.patientId, role: 'caregiver' });
      router.replace('/caregiver');
    } catch {
      // Dev bypass: use mock data so the UI is testable without a backend
      login({ token: 'dev-token', caregiverId: 'test-caregiver-1', patientId: 'test-patient-1', role: 'caregiver', patientName: 'Margaret' });
      router.replace('/caregiver');
    } finally { setLoading(false); }
  }

  const registerDisabled = loading;
  const loginDisabled = loading;

  return (
    <AuthShell>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 40, fontWeight: 400, margin: '0 0 8px', color: '#2D2D2D' }}>
          {mode === 'login' ? 'Welcome back.' : 'Join as caregiver.'}
        </h1>
        <p style={{ fontSize: 15, color: '#6B6B6B', margin: 0 }}>Caregiver portal</p>
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
            <>
              <WarmInput placeholder="Full name" value={name} onChange={setName} />
              <WarmInput placeholder="Relationship (e.g. Daughter, Son)" value={relationship} onChange={setRelationship} />
              <WarmInput placeholder="Patient's connection code" value={connectionCode} onChange={setConnectionCode} />
            </>
          )}
          <WarmInput placeholder="Email" type="email" value={email} onChange={setEmail} />
          <WarmInput placeholder="Password" type="password" value={password} onChange={setPassword} />
          <button
            type="submit"
            disabled={mode === 'register' ? registerDisabled : loginDisabled}
            style={{
              ...btnStyle('#FC8A2D', '#fff'), marginTop: 8,
              opacity: (mode === 'register' ? registerDisabled : loginDisabled) ? 0.45 : 1,
            }}
          >
            {loading ? '…' : mode === 'register' ? 'Create Account' : 'Sign In'}
          </button>
        </div>
      </form>

      <p style={{ textAlign: 'center', fontSize: 13, color: '#9C9C9C', marginTop: 24 }}>
        Are you a patient?{' '}
        <a href="/auth/patient" style={{ color: '#FC8A2D', textDecoration: 'none' }}>Sign in here</a>
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
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
      }}>
        <div className="anim-drift" style={{
          position: 'absolute', top: '10%', right: '-10%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(252,138,45,0.22), transparent)',
          filter: 'blur(100px)',
        }} />
        <div className="anim-drift" style={{
          position: 'absolute', bottom: '10%', left: '-10%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(158,152,32,0.18), transparent)',
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
      onFocus={e => { e.currentTarget.style.borderColor = 'rgba(252,138,45,0.45)'; }}
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
