'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth';
import { registerCaregiver, loginCaregiver, verifyEmail, resendVerificationCode } from '../../../lib/api';

export default function CaregiverAuthPage() {
  const router = useRouter();
  const { login, user, ready } = useAuth();
  const [mode, setMode] = useState('register');
  const [step, setStep] = useState('form'); // 'form' | 'verify'

  useEffect(() => {
    if (!ready) return;
    if (user?.role === 'caregiver') router.replace('/caregiver');
    if (user?.role === 'patient') router.replace('/patient');
  }, [ready, user]);

  useEffect(() => {
    const saved = sessionStorage.getItem('memodi_caregiver_pending_verify');
    if (saved) { setPendingEmail(saved); setStep('verify'); }
  }, []);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [verifyCode, setVerifyCode] = useState('');

  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleRegister(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await registerCaregiver({ name, relationship, email, password });
      const resolvedEmail = data.email || email;
      sessionStorage.setItem('memodi_caregiver_pending_verify', resolvedEmail);
      setPendingEmail(resolvedEmail);
      setStep('verify');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await verifyEmail(pendingEmail, verifyCode);
      sessionStorage.removeItem('memodi_caregiver_pending_verify');
      if (password) {
        const data = await loginCaregiver({ email: pendingEmail, password });
        login({ token: data.token, caregiverId: data.caregiverId, patientId: data.patientId, role: 'caregiver', name: data.name });
        router.replace('/caregiver');
      } else {
        setEmail(pendingEmail);
        setMode('login');
        setStep('form');
        setSuccessMsg('Email verified! Sign in to continue.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError('');
    try {
      await resendVerificationCode(pendingEmail);
    } catch {
      setError('Could not resend code. Please try again.');
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await loginCaregiver({ email, password });
      login({ token: data.token, caregiverId: data.caregiverId, patientId: data.patientId, role: 'caregiver', name: data.name });
      router.replace('/caregiver');
    } catch (err) {
      if (err.response?.data?.code === 'EMAIL_NOT_VERIFIED') {
        setPendingEmail(email);
        setStep('verify');
        return;
      }
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (step === 'verify') {
    return (
      <div className="min-h-screen bg-navy flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <span className="text-amber text-2xl font-semibold">Memodi</span>
            <h2 className="text-white text-lg font-semibold mt-4">Check your email</h2>
            <p className="text-gray-400 text-sm mt-2">
              We sent a 6-digit code to <span className="text-white">{pendingEmail}</span>
            </p>
          </div>

          {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}

          <form onSubmit={handleVerify} className="flex flex-col gap-3">
            <AuthInput placeholder="6-digit code" value={verifyCode} onChange={setVerifyCode} />
            <button
              type="submit"
              disabled={loading || verifyCode.length < 4}
              className="w-full py-3 rounded-xl bg-amber text-navy font-semibold text-sm disabled:opacity-40 hover:brightness-110 transition-all mt-2"
            >
              {loading ? 'Verifying…' : 'Verify Email'}
            </button>
          </form>

          <button
            onClick={handleResend}
            className="w-full text-center text-gray-500 text-xs mt-4 hover:text-gray-300 transition-colors"
          >
            Didn't get it? Resend code
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
          <p className="text-gray-400 text-sm mt-1">Caregiver portal</p>
        </div>

        <div className="flex gap-1 mb-6 bg-[#111827] rounded-xl p-1">
          {['register', 'login'].map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); setStep('form'); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === m ? 'bg-[#1C1408] text-amber' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {m === 'register' ? 'Create Account' : 'Sign In'}
            </button>
          ))}
        </div>

        {successMsg && <p className="text-green-400 text-sm text-center mb-4">{successMsg}</p>}
        {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}

        {mode === 'register' ? (
          <form onSubmit={handleRegister} className="flex flex-col gap-3">
            <AuthInput placeholder="Full name *" value={name} onChange={setName} />
            <AuthInput placeholder="Relationship (e.g. Son, Daughter) *" value={relationship} onChange={setRelationship} />
            <AuthInput placeholder="Email *" type="email" value={email} onChange={setEmail} />
            <AuthInput placeholder="Password *" type="password" value={password} onChange={setPassword} />
            <button
              type="submit"
              disabled={loading || !name || !relationship || !email || !password}
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

        <p className="text-center text-gray-500 text-xs mt-6">
          Are you a patient?{' '}
          <a href="/auth/patient" className="text-amber hover:underline">Sign in here</a>
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
