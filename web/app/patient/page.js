'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Mic } from 'lucide-react';
import Orb from '../../components/Orb';
import EmotionMonitor from '../../components/EmotionMonitor';
import Ambient from '../../components/Ambient';
import PatientNav from '../../components/PatientNav';
import { useAuth } from '../../lib/auth';
import { getPatient, sendVoiceInput } from '../../lib/api';
import { requestAudioPermission, startRecording, stopRecordingAndGetBase64, playAudioBase64 } from '../../lib/audio';

function greeting(name) {
  const h = new Date().getHours();
  const salutation = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  return `${salutation}, ${name}`;
}

function formatClock() {
  const now = new Date();
  return {
    day: now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
    time: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  };
}

export default function PatientPage() {
  const router = useRouter();
  const { user, ready, logout } = useAuth();

  const [orbState, setOrbState] = useState('idle');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [patient, setPatient] = useState(null);
  const [response, setResponse] = useState('');
  const [textScale, setTextScale] = useState(1);
  const [clock, setClock] = useState(formatClock());
  const [error, setError] = useState('');
  const [emotionDistress, setEmotionDistress] = useState(false);
  const audioRef = useRef(null);

  const handleEmotionDistress = useCallback(distressed => {
    setEmotionDistress(distressed);
  }, []);

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

  const cycleScale = () => setTextScale(s => s === 1 ? 1.2 : s === 1.2 ? 1.4 : 1);

  async function handleMic() {
    if (isProcessing) return;
    setError('');

    if (!isRecording) {
      try {
        await startRecording();
        setIsRecording(true);
        setOrbState('listening');
        setResponse('');
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

  const name = patient?.nickname || patient?.name?.split(' ')[0] || user?.name?.split(' ')[0] || '';
  const hint = isProcessing ? "I'm thinking…" : isRecording ? 'Listening…' : 'Tap to speak with me';
  const micActive = isRecording;
  const displayOrbState =
    orbState === 'idle' && emotionDistress ? 'distress' : orbState;

  return (
    <div style={{
      position: 'relative', minHeight: '100vh', overflow: 'hidden',
      background: 'linear-gradient(135deg, #FFF9F0 0%, #FFFBF7 40%, rgba(252,233,171,0.10) 100%)',
    }}>
      <Ambient particleCount={8} />

      <PatientNav onSignOut={logout} />

      {/* Greeting + clock */}
      <div style={{
        position: 'absolute', top: 24, right: 32, zIndex: 10,
        textAlign: 'right',
      }}>
        {name && (
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 18, color: '#6B6B6B', margin: 0, fontWeight: 400 }}>
            {greeting(name)}
          </p>
        )}
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: 28, color: '#2D2D2D', margin: '2px 0 0', fontWeight: 400 }}>
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
          {/* Orb */}
          <div style={{
            transition: 'transform .8s ease',
            transform: response ? 'translateX(-80px) scale(0.75)' : 'translateX(0) scale(1)',
          }}>
            <Orb state={displayOrbState} size={response ? 260 : 320} />
          </div>

          {/* Response card */}
          {response && (
            <div style={{
              maxWidth: 520, padding: '36px 40px', borderRadius: 32,
              background: 'rgba(255,255,255,0.78)',
              backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
              border: '2px solid rgba(255,255,255,0.9)',
              boxShadow: '0 24px 60px rgba(45,45,45,0.12)',
              animation: 'slideInRight .6s ease',
            }}>
              <p style={{
                margin: '0 0 28px',
                fontSize: 22 * textScale,
                lineHeight: 1.55, color: '#2D2D2D',
                fontFamily: 'var(--font-sans)',
              }}>
                {response}
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button onClick={cycleScale} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '11px 20px', borderRadius: 999, border: 0,
                  background: '#DC4F7C', color: '#fff',
                  fontWeight: 600, fontSize: 15, cursor: 'pointer',
                  boxShadow: '0 8px 20px rgba(220,79,124,0.26)',
                  fontFamily: 'var(--font-sans)',
                }}>
                  {textScale === 1 ? 'Aa' : textScale === 1.2 ? 'Aa+' : 'Aa++'}
                </button>
                <button onClick={reset} style={{
                  padding: '11px 20px', borderRadius: 999,
                  border: '2px solid rgba(255,255,255,0.9)',
                  background: 'rgba(255,255,255,0.6)',
                  backdropFilter: 'blur(10px)',
                  color: '#6B6B6B', fontWeight: 500, fontSize: 15, cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                }}>
                  Speak again
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mic button */}
        {!response && (
          <div style={{ marginTop: 64, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <button
              onClick={handleMic}
              aria-label={hint}
              onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.94)'; }}
              onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
              style={{
                width: 96, height: 96, borderRadius: '50%', border: 0,
                background: micActive ? '#C42B34' : '#DC4F7C',
                color: '#fff', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                animation: micActive ? 'micPulse 1.5s ease-out infinite' : 'none',
                transition: 'background .3s ease, transform .2s ease',
                boxShadow: micActive
                  ? '0 0 0 0 rgba(220,79,124,0.5), 0 8px 28px rgba(220,79,124,0.32)'
                  : '0 8px 28px rgba(220,79,124,0.32)',
              }}
            >
              <Mic size={40} />
            </button>
            <p style={{
              fontSize: 22 * textScale, color: '#6B6B6B',
              fontFamily: 'var(--font-sans)',
            }}>
              {error || hint}
            </p>
          </div>
        )}
      </div>

      <EmotionMonitor active onDistressChange={handleEmotionDistress} />
    </div>
  );
}
