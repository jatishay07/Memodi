'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Mic } from 'lucide-react';
import Orb from '../../components/Orb';
import Ambient from '../../components/Ambient';
import AtmosphericDepth from '../../components/AtmosphericDepth';
import PatientNav from '../../components/PatientNav';
import PatientWelcome from '../../components/PatientWelcome';
import TutorialBubble from '../../components/TutorialBubble';
import ComfortTray from '../../components/ComfortTray';
import { useAuth } from '../../lib/auth';
import { getPatient, sendVoiceInput } from '../../lib/api';
import { requestAudioPermission, startRecording, stopRecordingAndGetBase64, playAudioBase64 } from '../../lib/audio';

// TODO: connect soft listening chime (glass tone, ~200ms, low volume)
// TODO: connect gentle speech-start sound (warm chime, play on orb → speaking)
// TODO: connect calm alert tone (soft resonance, play on distress state)

function greeting(name) {
  const h = new Date().getHours();
  const salutation = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  return `${salutation}, ${name}`;
}

function formatClock() {
  const now = new Date();
  return {
    day: now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
    time: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
  };
}

const DEFAULT_COMFORT = {
  textScale: 1,
  readingMode: false,
  motion: 'full',
  contrast: 'soft',
  speechSpeed: 'normal',
};

// Placeholder copy shown during tutorial step 3 demo
const DEMO_RESPONSE = 'Your daughter Emily visited this morning. You had tea together by the kitchen window.';

export default function PatientPage() {
  const router = useRouter();
  const { user, ready, logout } = useAuth();

  // Core interaction state — unchanged
  const [orbState, setOrbState] = useState('idle');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [patient, setPatient] = useState(null);
  const [response, setResponse] = useState('');
  const [clock, setClock] = useState(formatClock());
  const [error, setError] = useState('');
  const audioRef = useRef(null);

  // Onboarding phase: 'welcome' | 'tutorial' | 'done'
  const [onboardingPhase, setOnboardingPhase] = useState('welcome');
  const [tutorialStep, setTutorialStep] = useState(0);

  // Comfort / accessibility settings
  const [comfort, setComfort] = useState(DEFAULT_COMFORT);


  useEffect(() => {
    if (!ready) return;
    if (!user) { router.replace('/auth/patient'); return; }
    if (user.role !== 'patient') { router.replace('/caregiver'); return; }

    getPatient(user.patientId)
      .then(setPatient)
      .catch(() => setPatient({ name: user.name || 'Friend', nickname: user.name?.split(' ')[0] || 'Friend' }));

    requestAudioPermission();
    const t = setInterval(() => setClock(formatClock()), 60000);
    return () => clearInterval(t);
  }, [ready, user]);

  function finishOnboarding() {
    setOnboardingPhase('done');
  }

  function skipOnboarding() {
    setOnboardingPhase('done');
  }

  function startTutorial() {
    setOnboardingPhase('tutorial');
    setTutorialStep(0);
  }

  function handleComfortChange(next) {
    setComfort(prev => ({ ...prev, ...next }));
  }

  async function handleMic() {
    if (isProcessing) return;
    setError('');

    if (!isRecording) {
      try {
        await startRecording();
        setIsRecording(true);
        setOrbState('listening');
        setResponse('');
        // TODO: play soft listening chime here
      } catch {
        setError('Microphone unavailable — please allow access in your browser.');
      }
      return;
    }

    setIsRecording(false);
    setIsProcessing(true);
    setOrbState('thinking');

    try {
      const base64 = await stopRecordingAndGetBase64();
      if (!base64) { setOrbState('idle'); setIsProcessing(false); return; }

      const result = await sendVoiceInput(user.patientId, base64);

      setOrbState(result.isDistressed ? 'distress' : 'speaking');
      setResponse(result.response);
      // TODO: play gentle speech-start sound here

      if (audioRef.current) audioRef.current.pause();
      const audio = await playAudioBase64(result.audioResponse);
      audioRef.current = audio;
      audio.onended = () => setOrbState('idle');
    } catch (err) {
      console.error(err);
      setError('Let me try that again.');
      setOrbState('idle');
    } finally {
      setIsProcessing(false);
    }
  }

  function reset() { setResponse(''); setOrbState('idle'); setIsRecording(false); }

  if (!ready) return null;

  const name = patient?.nickname || patient?.name?.split(' ')[0] || user?.name?.split(' ')[0] || 'Margaret';
  const hint = isProcessing ? "I'm thinking…" : isRecording ? 'Listening…' : 'Tap to speak with me';
  const micActive = isRecording;
  const ts = comfort.textScale;
  const reducedMotion = comfort.motion === 'reduced';
  const highContrast = comfort.contrast === 'high';

  // During tutorial step 3 show a demo response so the layout is visible
  const showDemoResponse = onboardingPhase === 'tutorial' && tutorialStep === 2;
  const activeResponse = showDemoResponse ? DEMO_RESPONSE : response;

  // Reading mode padding/line-height modifiers
  const readingStyle = comfort.readingMode
    ? { lineHeight: 1.85, letterSpacing: '0.01em', padding: '44px 52px' }
    : { lineHeight: 1.55, padding: '36px 40px' };

  const inkColor = highContrast ? '#1a1a1a' : '#2D2D2D';
  const softInk  = highContrast ? '#3d3d3d' : '#6B6B6B';

  return (
    <div style={{
      position: 'relative', minHeight: '100vh', overflow: 'hidden',
      background: 'linear-gradient(135deg, #FFF9F0 0%, #FFFBF7 40%, rgba(252,233,171,0.10) 100%)',
    }}>
      {/* Atmospheric layers */}
      <Ambient particleCount={reducedMotion ? 0 : 8} />
      <AtmosphericDepth reduced={reducedMotion} />

      <PatientNav onSignOut={logout} />

      {/* Greeting + clock */}
      <div style={{
        position: 'absolute', top: 24, right: 32, zIndex: 10, textAlign: 'right',
      }}>
        {name && (
          <p style={{
            fontFamily: 'var(--font-serif)', fontSize: 18 * ts,
            color: softInk, margin: 0, fontWeight: 400,
          }}>
            {greeting(name)}
          </p>
        )}
        <p style={{
          fontFamily: 'var(--font-serif)', fontSize: 28 * ts,
          color: inkColor, margin: '2px 0 0', fontWeight: 400,
        }}>
          {clock.time}
        </p>
        <p style={{ fontSize: 13, color: '#9C9C9C', margin: 0 }}>{clock.day}</p>
      </div>

      {/* Main content */}
      <div style={{
        position: 'relative', zIndex: 2,
        minHeight: '100vh', padding: '120px 32px 64px',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 56, width: '100%', maxWidth: 1200,
        }}>
          {/* Orb — dims slightly when tutorial is showing a bubble */}
          <div style={{
            transition: 'transform .8s ease, opacity .5s ease',
            transform: activeResponse ? 'translateX(-80px) scale(0.75)' : 'translateX(0) scale(1)',
            opacity: onboardingPhase === 'tutorial' ? 0.90 : 1,
          }}>
            <Orb state={orbState} size={activeResponse ? 390 : 480} />
          </div>

          {/* Response card */}
          {activeResponse && (
            <div style={{
              maxWidth: 520, borderRadius: 32,
              background: highContrast ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.78)',
              backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
              border: `2px solid ${highContrast ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.9)'}`,
              boxShadow: '0 24px 60px rgba(45,45,45,0.12)',
              animation: 'responseFadeIn .6s ease',
              position: 'relative',
              ...readingStyle,
            }}>
              {showDemoResponse && (
                <p style={{
                  fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 600,
                  color: 'rgba(220,79,124,0.55)', margin: '0 0 10px',
                  textTransform: 'uppercase', letterSpacing: '0.10em',
                }}>
                  Example response
                </p>
              )}

              <p style={{
                margin: '0 0 28px',
                fontSize: 22 * ts,
                color: inkColor,
                fontFamily: 'var(--font-sans)',
                lineHeight: comfort.readingMode ? 1.85 : 1.55,
                fontStyle: showDemoResponse ? 'italic' : 'normal',
              }}>
                {activeResponse}
              </p>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {!showDemoResponse && (
                  <button onClick={reset} style={{
                    padding: '11px 20px', borderRadius: 999,
                    border: '2px solid rgba(255,255,255,0.9)',
                    background: 'rgba(255,255,255,0.6)',
                    backdropFilter: 'blur(10px)',
                    color: softInk, fontWeight: 500, fontSize: 15 * ts, cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                    transition: 'all 0.2s ease',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.9)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.6)'; }}
                  >
                    Speak again
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mic button — hidden during tutorial demo response */}
        {!activeResponse && (
          <div style={{ marginTop: 64, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <button
              onClick={handleMic}
              aria-label={hint}
              onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.94)'; }}
              onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
              onMouseEnter={e => {
                if (!micActive) e.currentTarget.style.boxShadow = '0 0 0 8px rgba(220,79,124,0.10), 0 8px 36px rgba(220,79,124,0.38)';
              }}
              style={{
                width: 140, height: 56, borderRadius: 999, border: 0,
                background: micActive ? '#C42B34' : '#DC4F7C',
                color: '#fff', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                gap: 10,
                animation: micActive && !reducedMotion ? 'micPulse 1.5s ease-out infinite' : 'none',
                transition: 'background .3s ease, transform .2s ease, box-shadow .25s ease',
                boxShadow: micActive
                  ? '0 0 0 0 rgba(220,79,124,0.5), 0 8px 28px rgba(220,79,124,0.32)'
                  : '0 8px 28px rgba(220,79,124,0.32)',
              }}
            >
              <Mic size={22} />
            </button>

            <p style={{
              fontSize: 22 * ts, color: softInk,
              fontFamily: 'var(--font-sans)',
              transition: 'font-size 0.3s ease',
            }}>
              {error || hint}
            </p>
          </div>
        )}
      </div>

      {/* ── Onboarding layers ── */}
      {onboardingPhase === 'welcome' && (
        <PatientWelcome
          name={name}
          onComplete={startTutorial}
          onSkip={skipOnboarding}
        />
      )}

      {onboardingPhase === 'tutorial' && (
        <TutorialBubble
          onComplete={finishOnboarding}
          onSkip={skipOnboarding}
          onStepChange={setTutorialStep}
        />
      )}

      {/* Comfort tray — visible after onboarding */}
      {onboardingPhase === 'done' && (
        <ComfortTray settings={comfort} onChange={handleComfortChange} />
      )}
    </div>
  );
}
