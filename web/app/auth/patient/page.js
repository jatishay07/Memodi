'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth';
import { isLocalApi, registerPatient, loginPatient } from '../../../lib/api';

const TIMEZONES = [
  'America/New_York', 'America/Chicago', 'America/Denver',
  'America/Los_Angeles', 'America/Phoenix', 'Pacific/Honolulu'
];

export default function PatientAuthPage() {
  const router = useRouter();
  const { login, user, ready } = useAuth();
  const [mode, setMode] = useState('register');

  useEffect(() => {
    if (!ready) return;
    if (user?.role === 'patient') router.replace('/patient');
    if (user?.role === 'caregiver') router.replace('/caregiver');
  }, [ready, user]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [connectionCode, setConnectionCode] = useState('');

  // Register fields
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [timezone, setTimezone] = useState('America/New_York');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleRegister(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await registerPatient({ name, dateOfBirth: dob, timezone, email, password });
      setConnectionCode(data.connectionCode);
      login({ token: data.token, patientId: data.patientId, role: 'patient', name: data.name });
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await loginPatient({ email, password });
      login({ token: data.token, patientId: data.patientId, role: 'patient', name: data.name });
      router.replace('/patient');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // After successful registration show connection code first
  if (connectionCode) {
    return (
      <div className="min-h-screen bg-navy flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <span className="text-amber text-2xl font-semibold">Memodi</span>
            <h2 className="text-white text-xl font-semibold mt-4">Welcome!</h2>
            <p className="text-gray-400 text-sm mt-2">Share this code with your caregiver so they can connect to you.</p>
          </div>

          <div className="bg-navy-card border border-amber rounded-2xl p-6 text-center mb-6">
            <p className="text-gray-400 text-xs uppercase tracking-widest mb-3">Your Connection Code</p>
            <p className="text-amber text-4xl font-bold tracking-[0.3em]">{connectionCode}</p>
            <button
              onClick={() => navigator.clipboard?.writeText(connectionCode)}
              className="mt-4 text-gray-500 text-xs hover:text-gray-300 transition-colors"
            >
              Copy to clipboard
            </button>
          </div>

          <button
            onClick={() => router.replace('/patient')}
            className="w-full py-3 rounded-xl bg-amber text-navy font-semibold text-sm hover:brightness-110 transition-all"
          >
            Continue to Memodi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-amber text-2xl font-semibold">Memodi</span>
          <p className="text-gray-400 text-sm mt-1">Your memory companion</p>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-1 mb-6 bg-[#111827] rounded-xl p-1">
          {['register', 'login'].map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === m ? 'bg-[#1C1408] text-amber' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {m === 'register' ? 'Create Account' : 'Sign In'}
            </button>
          ))}
        </div>

        {error && (
          <p className="text-pink text-sm text-center mb-4">{error}</p>
        )}

        {mode === 'register' ? (
          <form onSubmit={handleRegister} className="flex flex-col gap-3">
            <AuthInput placeholder="Full name *" value={name} onChange={setName} />
            <AuthInput placeholder="Email *" type="email" value={email} onChange={setEmail} />
            <AuthInput placeholder="Password *" type="password" value={password} onChange={setPassword} />
            <AuthInput placeholder="Date of birth (YYYY-MM-DD)" value={dob} onChange={setDob} />
            <select
              value={timezone}
              onChange={e => setTimezone(e.target.value)}
              className="w-full bg-[#1F2937] rounded-xl px-4 py-3 text-white text-sm outline-none"
            >
              {TIMEZONES.map(tz => (
                <option key={tz} value={tz}>{tz.replace('America/', '').replace('Pacific/', 'Pacific/')}</option>
              ))}
            </select>
            <button
              type="submit"
              disabled={loading || !name || !email || !password}
              className="w-full py-3 rounded-xl bg-amber text-navy font-semibold text-sm disabled:opacity-40 hover:brightness-110 transition-all mt-2"
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="flex flex-col gap-3">
            <AuthInput placeholder="Email" type="email" value={email} onChange={setEmail} />
            <AuthInput placeholder="Password" type="password" value={password} onChange={setPassword} />
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-3 rounded-xl bg-amber text-navy font-semibold text-sm disabled:opacity-40 hover:brightness-110 transition-all mt-2"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        )}

        {isLocalApi() && (
          <button
            type="button"
            onClick={() => {
              login({
                token: 'dev-patient-demo',
                patientId: 'patient-demo',
                role: 'patient',
                name: 'Alex',
              });
              router.replace('/patient');
            }}
            className="w-full py-3 rounded-xl border border-amber/40 text-amber text-sm font-medium hover:bg-amber/10 transition-all mt-4"
          >
            Try demo — no signup
          </button>
        )}

        <p className="text-center text-gray-500 text-xs mt-6">
          Are you a caregiver?{' '}
          <a href="/auth/caregiver" className="text-amber hover:underline">Sign in here</a>
        </p>
      </div>
    </div>
  );
}

function AuthInput({ placeholder, value, onChange, type = 'text' }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full bg-[#1F2937] rounded-xl px-4 py-3 text-white text-sm outline-none placeholder-gray-500"
    />
  );
}
