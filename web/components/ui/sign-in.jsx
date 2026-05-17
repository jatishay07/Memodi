'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Logo from '../Logo';

// ── Shared internals ─────────────────────────────────────────────────────────

function GlassInput({ children }) {
  return (
    <div className="rounded-2xl border-2 border-white/80 bg-cream/60 backdrop-blur-sm
                    transition-all duration-200
                    focus-within:border-blush-rose/40 focus-within:bg-white/70">
      {children}
    </div>
  );
}

function HeroPanel({ heroImageSrc }) {
  if (!heroImageSrc) return null;
  return (
    <section className="hidden md:block flex-1 relative p-4">
      <div
        className="animate-slide-right animate-delay-200 absolute inset-4 rounded-3xl bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImageSrc})` }}
      />
    </section>
  );
}

// ── SignInPage ────────────────────────────────────────────────────────────────

export function SignInPage({
  title = 'Welcome back.',
  description,
  heroImageSrc,
  accentColor = '#DC4F7C',
  onSignIn,
  onGoogleSignIn,
  onResetPassword,
  onCreateAccount,
  loading = false,
  error,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const accent = { color: accentColor };
  const accentBg = { background: accentColor, boxShadow: `0 10px 28px ${accentColor}44` };

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row font-sans bg-warm-white">
      {/* Left: form panel */}
      <section className="flex-1 flex items-center justify-center p-8 md:p-14">
        <div className="w-full max-w-md flex flex-col gap-6">

          <a href="/" className="animate-element animate-delay-0" style={{ textDecoration: 'none', display: 'inline-block' }}>
            <Logo iconSize={48} textSize={26} gap={10} />
          </a>

          <div className="animate-element animate-delay-100">
            <h1 className="font-serif text-4xl md:text-5xl font-light text-ink leading-tight tracking-tight">
              {title}
            </h1>
            {description && <p className="text-ink-soft mt-2 text-base">{description}</p>}
          </div>

          {error && (
            <div className="animate-element animate-delay-100 rounded-xl border border-red-200/60 bg-red-50 px-4 py-3">
              <p className="text-sm" style={{ color: '#C42B34' }}>{error}</p>
            </div>
          )}

          <form className="flex flex-col gap-4" onSubmit={onSignIn}>
            <div className="animate-element animate-delay-200">
              <label className="block text-sm font-medium text-ink-soft mb-1.5">Email Address</label>
              <GlassInput>
                <input name="email" type="email" placeholder="Enter your email address"
                  className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none text-ink placeholder:text-ink-faint" />
              </GlassInput>
            </div>

            <div className="animate-element animate-delay-300">
              <label className="block text-sm font-medium text-ink-soft mb-1.5">Password</label>
              <GlassInput>
                <div className="relative">
                  <input name="password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password"
                    className="w-full bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none text-ink placeholder:text-ink-faint" />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    className="absolute inset-y-0 right-3 flex items-center">
                    {showPassword
                      ? <EyeOff className="w-4 h-4 text-ink-soft hover:text-ink transition-colors" />
                      : <Eye className="w-4 h-4 text-ink-soft hover:text-ink transition-colors" />}
                  </button>
                </div>
              </GlassInput>
            </div>

            <div className="animate-element animate-delay-400 flex items-center justify-between">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input type="checkbox" name="rememberMe" className="custom-checkbox" />
                <span className="text-sm text-ink/80">Keep me signed in</span>
              </label>
              <a href="#" onClick={(e) => { e.preventDefault(); onResetPassword?.(); }}
                className="text-sm font-medium hover:underline transition-colors" style={accent}>
                Reset password
              </a>
            </div>

            <button type="submit" disabled={loading}
              className="animate-element animate-delay-500 w-full rounded-2xl py-4 font-semibold text-white
                         transition-all hover:opacity-90 active:scale-[0.98]
                         disabled:opacity-50 disabled:cursor-not-allowed"
              style={accentBg}>
              {loading ? '…' : 'Sign In'}
            </button>
          </form>

          <p className="animate-element animate-delay-600 text-center text-sm text-ink-soft">
            Don't have an account?{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); onCreateAccount?.(); }}
              className="font-medium hover:underline transition-colors" style={accent}>
              Create Account
            </a>
          </p>
        </div>
      </section>

      <HeroPanel heroImageSrc={heroImageSrc} />
    </div>
  );
}

// ── RegisterPage ──────────────────────────────────────────────────────────────
// Same full-screen split layout but with configurable form fields.

export function RegisterPage({
  title = 'Create account.',
  description,
  heroImageSrc,
  accentColor = '#DC4F7C',
  onRegister,
  onSignIn,
  loading = false,
  error,
  children,
}) {
  const accent = { color: accentColor };
  const accentBg = { background: accentColor, boxShadow: `0 10px 28px ${accentColor}44` };

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row font-sans bg-warm-white">
      <section className="flex-1 flex items-center justify-center p-8 md:p-14 overflow-y-auto">
        <div className="w-full max-w-md flex flex-col gap-6 py-8">

          <a href="/" className="animate-element animate-delay-0" style={{ textDecoration: 'none', display: 'inline-block' }}>
            <Logo iconSize={48} textSize={26} gap={10} />
          </a>

          <div className="animate-element animate-delay-100">
            <h1 className="font-serif text-4xl md:text-5xl font-light text-ink leading-tight tracking-tight">
              {title}
            </h1>
            {description && <p className="text-ink-soft mt-2 text-base">{description}</p>}
          </div>

          {error && (
            <div className="rounded-xl border border-red-200/60 bg-red-50 px-4 py-3">
              <p className="text-sm" style={{ color: '#C42B34' }}>{error}</p>
            </div>
          )}

          <form className="flex flex-col gap-4" onSubmit={onRegister}>
            {children}
            <button type="submit" disabled={loading}
              className="animate-element animate-delay-600 w-full rounded-2xl py-4 font-semibold text-white
                         transition-all hover:opacity-90 active:scale-[0.98]
                         disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              style={accentBg}>
              {loading ? '…' : 'Create Account'}
            </button>
          </form>

          <p className="animate-element animate-delay-700 text-center text-sm text-ink-soft">
            Already have an account?{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); onSignIn?.(); }}
              className="font-medium hover:underline transition-colors" style={accent}>
              Sign In
            </a>
          </p>
        </div>
      </section>

      <HeroPanel heroImageSrc={heroImageSrc} />
    </div>
  );
}

// ── Shared field component (use inside RegisterPage children) ─────────────────

export function AuthField({ label, name, type = 'text', placeholder, delay = 'animate-delay-200' }) {
  return (
    <div className={`animate-element ${delay}`}>
      <label className="block text-sm font-medium text-ink-soft mb-1.5">{label}</label>
      <GlassInput>
        <input name={name} type={type} placeholder={placeholder}
          className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none text-ink placeholder:text-ink-faint" />
      </GlassInput>
    </div>
  );
}
