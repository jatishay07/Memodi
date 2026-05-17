'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Mic } from 'lucide-react';
import Orb from '../../components/Orb';
import Ambient from '../../components/Ambient';
import AtmosphericDepth from '../../components/AtmosphericDepth';
import PatientNav from '../../components/PatientNav';
import PatientWelcome from '../../components/PatientWelcome';
import TutorialBubble from '../../components/TutorialBubble';
import ComfortTray from '../../components/ComfortTray';
import ConversationRail from '../../components/ConversationRail';
import ChatPanel from '../../components/ChatPanel';
import { useAuth } from '../../lib/auth';
import { getPatient, sendTextInput, synthesizeWithPiper, getMemoryBankPeople } from '../../lib/api';
import { requestAudioPermission, playAudioBase64, startSpeechRecognition, stopSpeechRecognition } from '../../lib/audio';

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

function nowLabel() {
  return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

const DEFAULT_COMFORT = {
  textScale: 1,
  readingMode: false,
  motion: 'full',
  contrast: 'soft',
  speechSpeed: 'normal',
};

export default function PatientPage() {
  const router = useRouter();
  const { user, ready, logout } = useAuth();

  const [orbState, setOrbState] = useState('idle');
  const [patient, setPatient] = useState(null);
  const [clock, setClock] = useState(formatClock());
  const [onboardingPhase, setOnboardingPhase] = useState('welcome');
  const [tutorialStep, setTutorialStep] = useState(0);
  const [comfort, setComfort] = useState(DEFAULT_COMFORT);

  // Conversation state
  const [phase, setPhase] = useState('idle');        // 'idle' | 'listening' | 'thinking' | 'speaking'
  const [history, setHistory] = useState([]);
  const [partialUser, setPartialUser] = useState('');
  const [partialAI, setPartialAI] = useState('');
  const [peopleIndex, setPeopleIndex] = useState(new Map());

  // Refs to avoid stale closures inside timers
  const phaseRef      = useRef('idle');
  const partialAIRef  = useRef('');
  const audioRef      = useRef(null);
  const revealTimer   = useRef(null);

  function setPhaseSync(p) { phaseRef.current = p; setPhase(p); }
  function setPartialAISync(t) { partialAIRef.current = t; setPartialAI(t); }

  const active = phase !== 'idle' || history.length > 0;

  useEffect(() => {
    if (!ready) return;
    if (!user) { router.replace('/auth/patient'); return; }
    if (user.role !== 'patient') { router.replace('/caregiver'); return; }

    getPatient(user.patientId)
      .then(setPatient)
      .catch(() => setPatient({ name: user.name || 'Friend', nickname: user.name?.split(' ')[0] || 'Friend' }));

    getMemoryBankPeople(user.patientId)
      .then(people => setPeopleIndex(new Map(people.map(p => [p.id, p]))))
      .catch(() => {});

    requestAudioPermission();
    const t = setInterval(() => setClock(formatClock()), 60000);
    return () => clearInterval(t);
  }, [ready, user]);

  async function doAITurn(userText) {
    try {
      const result = await sendTextInput(user.patientId, userText);
      const responseText = result.response || result.text || '';
      if (!responseText) { setPhaseSync('idle'); setOrbState('idle'); return; }

      setPhaseSync('speaking');
      setOrbState(result.isDistressed ? 'distress' : 'speaking');

      // Start TTS audio
      let audioDurationMs = null;
      try {
        const tts = await synthesizeWithPiper(responseText);
        const dataUrl = `data:${tts.mimeType};base64,${tts.audioBase64}`;
        const audio = new Audio(dataUrl);
        await new Promise(res => {
          if (isFinite(audio.duration) && audio.duration > 0) { res(); return; }
          audio.addEventListener('loadedmetadata', res, { once: true });
          audio.addEventListener('error', res, { once: true });
          setTimeout(res, 1500);
        });
        audioDurationMs = isFinite(audio.duration) && audio.duration > 0 ? audio.duration * 1000 : null;
        audio.play().catch(() => {});
        audioRef.current = audio;
      } catch {
        // TTS unavailable — text-only mode
      }

      // Word-by-word reveal
      const words = responseText.trim().split(/\s+/);
      const intervalMs = audioDurationMs
        ? Math.min(160, Math.max(80, audioDurationMs / words.length))
        : 105;

      let wordIdx = 0;
      setPartialAISync('');

      revealTimer.current = setInterval(() => {
        if (phaseRef.current !== 'speaking') { clearInterval(revealTimer.current); return; }
        wordIdx++;
        const revealed = words.slice(0, wordIdx).join(' ');
        setPartialAISync(revealed);

        if (wordIdx >= words.length) {
          clearInterval(revealTimer.current);
          setTimeout(() => {
            if (phaseRef.current !== 'speaking') return;
            setHistory(h => [...h, { role: 'ai', text: responseText, t: nowLabel(), voice: true }]);
            setPartialAISync('');
            setPhaseSync('idle');
            setOrbState('idle');
          }, 700);
        }
      }, intervalMs);

    } catch {
      setPhaseSync('idle');
      setOrbState('idle');
    }
  }

  async function handleMic() {
    const p = phaseRef.current;

    if (p === 'thinking') return;

    if (p === 'speaking') {
      // Interrupt
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      clearInterval(revealTimer.current);
      const interrupted = partialAIRef.current.trim();
      if (interrupted) {
        setHistory(h => [...h, { role: 'ai', text: interrupted + ' …', t: nowLabel(), voice: true }]);
      }
      setPartialAISync('');
      setPhaseSync('idle');
      setOrbState('idle');
      return;
    }

    if (p === 'listening') {
      // User taps again to finalize early
      stopSpeechRecognition();
      return;
    }

    // idle → start listening
    setPartialUser('');
    setPhaseSync('listening');
    setOrbState('listening');

    try {
      const text = await startSpeechRecognition({ onInterim: setPartialUser });
      setPartialUser('');

      if (!text.trim()) {
        setPhaseSync('idle');
        setOrbState('idle');
        return;
      }

      setHistory(h => [...h, { role: 'user', text: text.trim(), t: nowLabel() }]);
      setPhaseSync('thinking');
      setOrbState('thinking');
      await doAITurn(text.trim());

    } catch {
      setPartialUser('');
      setPhaseSync('idle');
      setOrbState('idle');
    }
  }

  function handleEndConversation() {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    clearInterval(revealTimer.current);
    stopSpeechRecognition();
    setHistory([]);
    setPartialUser('');
    setPartialAISync('');
    setPhaseSync('idle');
    setOrbState('idle');
  }

  function handleComfortChange(next) {
    setComfort(prev => ({ ...prev, ...next }));
  }

  if (!ready) return null;

  const name = patient?.nickname || patient?.name?.split(' ')[0] || user?.name?.split(' ')[0] || 'Friend';
  const ts = comfort.textScale;
  const reducedMotion = comfort.motion === 'reduced';
  const highContrast = comfort.contrast === 'high';
  const inkColor = highContrast ? '#1a1a1a' : '#2D2D2D';
  const softInk  = highContrast ? '#3d3d3d' : '#6B6B6B';

  return (
    <div style={{
      position: 'relative', minHeight: '100vh', overflow: 'hidden',
      background: 'linear-gradient(135deg, #FFF9F0 0%, #FFFBF7 40%, rgba(252,233,171,0.10) 100%)',
    }}>
      <Ambient particleCount={reducedMotion ? 0 : 8} />
      <AtmosphericDepth reduced={reducedMotion} />
      <PatientNav onSignOut={logout} />

      {/* Greeting + clock — always visible */}
      <div style={{ position: 'absolute', top: 24, right: 32, zIndex: 10, textAlign: 'right' }}>
        {name && (
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 18 * ts, color: softInk, margin: 0, fontWeight: 400 }}>
            {greeting(name)}
          </p>
        )}
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: 28 * ts, color: inkColor, margin: '2px 0 0', fontWeight: 400 }}>
          {clock.time}
        </p>
        <p style={{ fontSize: 13, color: '#9C9C9C', margin: 0 }}>{clock.day}</p>
      </div>

      {/* ── Mode B — conversation view ── */}
      {active && (
        <div style={{
          position: 'relative', zIndex: 2,
          padding: '88px 32px 32px',
          display: 'grid',
          gridTemplateColumns: '300px 1fr',
          gap: 28,
          maxWidth: 300 + 28 + 920 + 64,
          margin: '0 auto',
          opacity: active ? 1 : 0,
          transition: reducedMotion ? 'none' : 'opacity 0.4s ease',
        }}>
          <ConversationRail
            phase={phase}
            orbState={orbState}
            onMic={handleMic}
            onEnd={handleEndConversation}
            textScale={ts}
            reducedMotion={reducedMotion}
          />
          <ChatPanel
            phase={phase}
            history={history}
            partialUser={partialUser}
            partialAI={partialAI}
            textScale={ts}
            reducedMotion={reducedMotion}
            peopleIndex={peopleIndex}
          />
        </div>
      )}

      {/* ── Mode A — idle hero ── */}
      {!active && (
        <div style={{
          position: 'relative', zIndex: 2,
          minHeight: '100vh', padding: '120px 32px 64px',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          opacity: active ? 0 : 1,
          transition: reducedMotion ? 'none' : 'opacity 0.4s ease',
        }}>
          <Orb state={orbState} size={480} />

          <div style={{ marginTop: 64, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <button
              onClick={handleMic}
              aria-label="Tap to speak with me"
              onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.94)'; }}
              onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
              style={{
                width: 140, height: 56, borderRadius: 999, border: 0,
                background: 'linear-gradient(135deg, #FC8A2D 0%, #DC4F7C 100%)',
                color: '#fff', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                transition: 'transform .2s ease, box-shadow .25s ease',
                boxShadow: '0 8px 28px rgba(220,79,124,0.32)',
              }}
            >
              <Mic size={22} />
            </button>
            <p style={{ fontSize: 22 * ts, color: softInk, fontFamily: 'var(--font-body)' }}>
              Tap to speak with me
            </p>
          </div>
        </div>
      )}

      {/* ── Onboarding layers ── */}
      {onboardingPhase === 'welcome' && (
        <PatientWelcome
          name={name}
          onComplete={() => { setOnboardingPhase('tutorial'); setTutorialStep(0); }}
          onSkip={() => setOnboardingPhase('done')}
        />
      )}
      {onboardingPhase === 'tutorial' && (
        <TutorialBubble
          onComplete={() => setOnboardingPhase('done')}
          onSkip={() => setOnboardingPhase('done')}
          onStepChange={setTutorialStep}
        />
      )}
      {onboardingPhase === 'done' && (
        <ComfortTray settings={comfort} onChange={handleComfortChange} />
      )}
    </div>
  );
}
