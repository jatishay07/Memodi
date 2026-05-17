'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mic } from 'lucide-react';
import Ambient from '../../components/Ambient';
import AtmosphericDepth from '../../components/AtmosphericDepth';
import ChatPanel from '../../components/ChatPanel';
import ComfortTray from '../../components/ComfortTray';
import ConversationRail from '../../components/ConversationRail';
import EmotionMonitor from '../../components/EmotionMonitor';
import Orb from '../../components/Orb';
import PatientNav from '../../components/PatientNav';
import PatientWelcome from '../../components/PatientWelcome';
import TutorialBubble from '../../components/TutorialBubble';
import { useAuth } from '../../lib/auth';
import { generateConnectionCode, getPatient, sendTextInput, synthesizeWithPiper } from '../../lib/api';
import { requestAudioPermission, startSpeechRecognition, stopSpeechRecognition } from '../../lib/audio';

function greeting(name) {
  const hour = new Date().getHours();
  const salutation = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
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

function inferPersonCategory(relationship) {
  const value = (relationship || '').toLowerCase();
  return value.includes('friend') ? 'friend' : 'family';
}

function buildPeopleIndex(patient) {
  const people = (patient?.familyMembers || [])
    .map((person, index) => {
      const fullName = (person?.name || '').trim();
      const nickname = (person?.nickname || '').trim();
      const shortName = nickname || fullName.split(/\s+/)[0] || fullName;
      const portrait = person?.photoUrl || null;
      const description = (person?.story || person?.deceasedMessage || person?.relationship || '').trim();
      if (!shortName || !portrait) return null;

      const aliases = new Set([shortName, fullName, nickname].filter(Boolean));
      const firstName = fullName.split(/\s+/)[0];
      if (firstName) aliases.add(firstName);

      return {
        id: `person-${index}-${fullName || shortName}`.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        name: shortName,
        fullName: fullName || shortName,
        nickname: nickname || shortName,
        aliases: [...aliases],
        relationship: person?.relationship || '',
        category: inferPersonCategory(person?.relationship),
        portrait,
        mediaUrl: portrait,
        description,
        lastSeen: person?.isDeceased ? 'In memory' : '',
      };
    })
    .filter(Boolean);

  return new Map(people.map(person => [person.id, person]));
}

function buildEventsIndex(patient) {
  return (patient?.upcomingEvents || [])
    .map((ev, i) => ({
      id: `event-${i}`,
      description: (ev?.description || '').trim(),
      date: (ev?.date || '').trim(),
      photoUrl: ev?.photoUrl || null,
    }))
    .filter(ev => ev.description);
}

const DEFAULT_COMFORT = {
  textScale: 1,
  readingMode: false,
  motion: 'full',
  contrast: 'soft',
  speechSpeed: 'normal',
};

const DEMO_RESPONSE = 'Your daughter Emily visited this morning. You had tea together by the kitchen window.';

export default function PatientPage() {
  const router = useRouter();
  const { user, ready, logout } = useAuth();

  const [orbState, setOrbState] = useState('idle');
  const [patient, setPatient] = useState(null);
  const [clock, setClock] = useState(formatClock());
  const [error, setError] = useState('');
  const [onboardingPhase, setOnboardingPhase] = useState('welcome');
  const [tutorialStep, setTutorialStep] = useState(0);
  const [comfort, setComfort] = useState(DEFAULT_COMFORT);
  const [emotionDistress, setEmotionDistress] = useState(false);
  const [sharingCode, setSharingCode] = useState('');
  const [codeExpiresAt, setCodeExpiresAt] = useState(null);
  const [codeGenerating, setCodeGenerating] = useState(false);
  const [codeSecondsLeft, setCodeSecondsLeft] = useState(0);
  const [codeCopied, setCodeCopied] = useState(false);
  const [phase, setPhase] = useState('idle');
  const [history, setHistory] = useState([]);
  const [partialUser, setPartialUser] = useState('');
  const [partialAI, setPartialAI] = useState('');
  const [peopleIndex, setPeopleIndex] = useState(new Map());
  const [eventsIndex, setEventsIndex] = useState([]);

  const phaseRef = useRef('idle');
  const partialAIRef = useRef('');
  const audioRef = useRef(null);
  const revealTimerRef = useRef(null);

  const handleEmotionDistress = useCallback(distressed => setEmotionDistress(distressed), []);

  function setPhaseSync(next) {
    phaseRef.current = next;
    setPhase(next);
  }

  function setPartialAISync(next) {
    partialAIRef.current = next;
    setPartialAI(next);
  }

  function stopAllPlayback() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    clearInterval(revealTimerRef.current);
    revealTimerRef.current = null;
  }

  function markOnboardingSeen() {
    const key = `memodi_onboarding_${user?.patientId || user?.email}`;
    localStorage.setItem(key, 'done');
  }

  function finishOnboarding() {
    markOnboardingSeen();
    setOnboardingPhase('done');
  }

  function skipOnboarding() {
    markOnboardingSeen();
    setOnboardingPhase('done');
  }

  function openHelp() {
    setOnboardingPhase('welcome');
    setTutorialStep(0);
  }

  function startTutorial() {
    setOnboardingPhase('tutorial');
    setTutorialStep(0);
  }

  function handleComfortChange(next) {
    setComfort(prev => ({ ...prev, ...next }));
  }

  async function handleGenerateCode() {
    if (!user?.patientId) return;
    setCodeGenerating(true);
    setCodeCopied(false);
    try {
      const { code, expiresAt } = await generateConnectionCode(user.patientId);
      setSharingCode(code);
      setCodeExpiresAt(expiresAt);
      setCodeSecondsLeft(Math.round((new Date(expiresAt) - Date.now()) / 1000));
    } catch (err) {
      console.error('generate code error:', err);
    } finally {
      setCodeGenerating(false);
    }
  }

  function handleCopyLink(code) {
    const url = `${window.location.origin}/connect?code=${code}`;
    navigator.clipboard.writeText(url).then(() => {
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2500);
    });
  }

  useEffect(() => {
    if (!codeExpiresAt) return undefined;
    const timer = setInterval(() => {
      const left = Math.max(0, Math.round((new Date(codeExpiresAt) - Date.now()) / 1000));
      setCodeSecondsLeft(left);
      if (left === 0) {
        setSharingCode('');
        setCodeExpiresAt(null);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [codeExpiresAt]);

  useEffect(() => {
    if (!ready) return undefined;
    if (!user) {
      router.replace('/auth/patient');
      return undefined;
    }
    if (user.role !== 'patient') {
      router.replace('/caregiver');
      return undefined;
    }

    const onboardingKey = `memodi_onboarding_${user.patientId || user.email}`;
    if (localStorage.getItem(onboardingKey) === 'done') {
      setOnboardingPhase('done');
    }

    requestAudioPermission();

    getPatient(user.patientId)
      .then(data => {
        setPatient(data);
        setPeopleIndex(buildPeopleIndex(data));
        setEventsIndex(buildEventsIndex(data));
      })
      .catch(() => {
        const fallback = {
          name: user.name || 'Friend',
          nickname: user.name?.split(' ')[0] || 'Friend',
          familyMembers: [],
        };
        setPatient(fallback);
        setPeopleIndex(buildPeopleIndex(fallback));
        setEventsIndex([]);
      });

    const timer = setInterval(() => setClock(formatClock()), 60000);
    return () => clearInterval(timer);
  }, [ready, router, user]);

  useEffect(() => {
    return () => {
      stopAllPlayback();
      stopSpeechRecognition();
    };
  }, []);

  async function doAITurn(userText) {
    try {
      const result = await sendTextInput(user.patientId, userText);
      const responseText = result.response || result.text || '';

      if (!responseText) {
        setPhaseSync('idle');
        setOrbState('idle');
        return;
      }

      setPhaseSync('speaking');
      setOrbState(result.isDistressed ? 'distress' : 'speaking');
      setPartialAISync('');

      stopAllPlayback();

      let audioDurationMs = null;
      try {
        const { audioBase64, mimeType } = await synthesizeWithPiper(responseText);
        const audio = new Audio(`data:${mimeType};base64,${audioBase64}`);
        audio.preload = 'auto';
        audioRef.current = audio;

        await new Promise(resolve => {
          if (Number.isFinite(audio.duration) && audio.duration > 0) {
            resolve();
            return;
          }
          audio.addEventListener('loadedmetadata', resolve, { once: true });
          audio.addEventListener('canplaythrough', resolve, { once: true });
          audio.addEventListener('error', resolve, { once: true });
          setTimeout(resolve, 1500);
        });

        if (Number.isFinite(audio.duration) && audio.duration > 0) {
          audioDurationMs = audio.duration * 1000;
        }

        audio.play().catch(() => {});
      } catch {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
          const utterance = new SpeechSynthesisUtterance(responseText);
          utterance.rate = comfort.speechSpeed === 'slow' ? 0.85 : comfort.speechSpeed === 'fast' ? 1.04 : 0.92;
          utterance.pitch = 1.05;
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(utterance);
        }
      }

      const words = responseText.trim().split(/\s+/);
      const intervalMs = audioDurationMs
        ? Math.min(160, Math.max(80, audioDurationMs / Math.max(words.length, 1)))
        : 105;

      let wordIndex = 0;
      revealTimerRef.current = setInterval(() => {
        if (phaseRef.current !== 'speaking') {
          clearInterval(revealTimerRef.current);
          revealTimerRef.current = null;
          return;
        }

        wordIndex += 1;
        setPartialAISync(words.slice(0, wordIndex).join(' '));

        if (wordIndex >= words.length) {
          clearInterval(revealTimerRef.current);
          revealTimerRef.current = null;
          setTimeout(() => {
            if (phaseRef.current !== 'speaking') return;
            setHistory(entries => [...entries, { role: 'ai', text: responseText, t: nowLabel(), voice: true }]);
            setPartialAISync('');
            setPhaseSync('idle');
            setOrbState('idle');
          }, 700);
        }
      }, intervalMs);
    } catch (err) {
      console.error(err);
      stopAllPlayback();
      setPartialAISync('');
      setPhaseSync('idle');
      setOrbState('idle');
      setError('Let me try that again.');
    }
  }

  async function handleMic() {
    const currentPhase = phaseRef.current;

    if (currentPhase === 'thinking') return;

    if (currentPhase === 'speaking') {
      const interrupted = partialAIRef.current.trim();
      stopAllPlayback();
      if (interrupted) {
        setHistory(entries => [...entries, { role: 'ai', text: `${interrupted} …`, t: nowLabel(), voice: true }]);
      }
      setPartialAISync('');
      setPhaseSync('idle');
      setOrbState('idle');
      return;
    }

    if (currentPhase === 'listening') {
      stopSpeechRecognition();
      return;
    }

    setError('');
    setPartialUser('');
    setPhaseSync('listening');
    setOrbState('listening');

    try {
      const transcript = await startSpeechRecognition({ onInterim: setPartialUser });
      const text = transcript.trim();
      setPartialUser('');

      if (!text) {
        setPhaseSync('idle');
        setOrbState('idle');
        return;
      }

      setHistory(entries => [...entries, { role: 'user', text, t: nowLabel() }]);
      setPhaseSync('thinking');
      setOrbState('thinking');
      await doAITurn(text);
    } catch (err) {
      console.error('STT error:', err);
      setPartialUser('');
      setPhaseSync('idle');
      setOrbState('idle');
      setError('Microphone unavailable - please allow access in your browser.');
    }
  }

  function handleEndConversation() {
    stopAllPlayback();
    stopSpeechRecognition();
    setHistory([]);
    setPartialUser('');
    setPartialAISync('');
    setPhaseSync('idle');
    setOrbState('idle');
  }

  if (!ready) return null;

  const name = patient?.nickname || patient?.name?.split(' ')[0] || user?.name?.split(' ')[0] || 'Margaret';
  const textScale = comfort.textScale;
  const reducedMotion = comfort.motion === 'reduced';
  const highContrast = comfort.contrast === 'high';
  const inkColor = highContrast ? '#1a1a1a' : '#2D2D2D';
  const softInk = highContrast ? '#3d3d3d' : '#6B6B6B';
  const showDemoConversation = onboardingPhase === 'tutorial' && tutorialStep === 2 && phase === 'idle' && history.length === 0;
  const displayHistory = showDemoConversation
    ? [{ role: 'ai', text: DEMO_RESPONSE, t: nowLabel(), voice: true }]
    : history;
  const displayPhase = showDemoConversation ? 'speaking' : phase;
  const displayOrbState = showDemoConversation
    ? 'speaking'
    : orbState === 'idle' && emotionDistress
      ? 'distress'
      : orbState;
  const conversationActive = displayPhase !== 'idle' || displayHistory.length > 0 || !!partialUser || !!partialAI;
  const hint = error || 'Tap to speak with me';

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #FFF9F0 0%, #FFFBF7 40%, rgba(252,233,171,0.10) 100%)',
      }}
    >
      <Ambient particleCount={reducedMotion ? 0 : 8} />
      <AtmosphericDepth reduced={reducedMotion} />

      <PatientNav onSignOut={logout} onHelp={openHelp} />

      <div style={{ position: 'absolute', top: 24, right: 32, zIndex: 10, textAlign: 'right' }}>
        {name && (
          <p
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 18 * textScale,
              color: softInk,
              margin: 0,
              fontWeight: 400,
            }}
          >
            {greeting(name)}
          </p>
        )}
        <p
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 28 * textScale,
            color: inkColor,
            margin: '2px 0 0',
            fontWeight: 400,
          }}
        >
          {clock.time}
        </p>
        <p style={{ fontSize: 13, color: '#9C9C9C', margin: 0 }}>{clock.day}</p>
      </div>

      {conversationActive ? (
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            padding: '88px 32px 32px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 28,
            maxWidth: 1280,
            margin: '0 auto',
            alignItems: 'start',
          }}
        >
          <ConversationRail
            phase={displayPhase}
            orbState={displayOrbState}
            onMic={handleMic}
            onEnd={handleEndConversation}
            textScale={textScale}
            reducedMotion={reducedMotion}
          />
          <ChatPanel
            phase={displayPhase}
            history={displayHistory}
            partialUser={partialUser}
            partialAI={partialAI}
            textScale={textScale}
            reducedMotion={reducedMotion}
            peopleIndex={peopleIndex}
            eventsIndex={eventsIndex}
          />
        </div>
      ) : (
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            minHeight: '100vh',
            padding: '120px 32px 64px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Orb state={displayOrbState} size={480} />

          <div style={{ marginTop: 64, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <button
              onClick={handleMic}
              aria-label="Tap to speak with me"
              onMouseDown={event => { event.currentTarget.style.transform = 'scale(0.94)'; }}
              onMouseUp={event => { event.currentTarget.style.transform = 'scale(1)'; }}
              onMouseLeave={event => { event.currentTarget.style.transform = 'scale(1)'; }}
              style={{
                width: 140,
                height: 56,
                borderRadius: 999,
                border: 0,
                background: 'linear-gradient(135deg, #FC8A2D 0%, #DC4F7C 100%)',
                color: '#fff',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                transition: 'transform .2s ease, box-shadow .25s ease',
                boxShadow: '0 8px 28px rgba(220,79,124,0.32)',
              }}
            >
              <Mic size={22} />
            </button>
            <p style={{ fontSize: 22 * textScale, color: softInk, fontFamily: 'var(--font-body)' }}>
              {hint}
            </p>
          </div>
        </div>
      )}

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

      {onboardingPhase === 'done' && (
        <ComfortTray settings={comfort} onChange={handleComfortChange} />
      )}

      <EmotionMonitor active onDistressChange={handleEmotionDistress} />

      {onboardingPhase === 'done' && (
        <div style={{ position: 'fixed', bottom: 96, right: 28, zIndex: 30 }}>
          {sharingCode && codeExpiresAt ? (
            <div
              style={{
                borderRadius: 28,
                padding: '28px 32px',
                background: 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '2px solid rgba(220,79,124,0.18)',
                boxShadow: '0 24px 60px rgba(220,79,124,0.16)',
                textAlign: 'center',
                minWidth: 230,
                animation: 'slideUpBounce .4s cubic-bezier(.34,1.56,.64,1)',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#DC4F7C',
                  textTransform: 'uppercase',
                  letterSpacing: '0.11em',
                  margin: '0 0 10px',
                }}
              >
                Share with caregiver
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 46,
                  fontWeight: 400,
                  color: '#2D2D2D',
                  margin: '0 0 6px',
                  letterSpacing: '0.15em',
                  lineHeight: 1,
                }}
              >
                {sharingCode.slice(0, 3)}&thinsp;{sharingCode.slice(3)}
              </p>
              <p style={{ fontSize: 13, color: '#9C9C9C', margin: '0 0 16px' }}>
                Expires in {String(Math.floor(codeSecondsLeft / 60)).padStart(2, '0')}:{String(codeSecondsLeft % 60).padStart(2, '0')}
              </p>
              <button
                onClick={() => handleCopyLink(sharingCode)}
                style={{
                  width: '100%',
                  padding: '11px 16px',
                  borderRadius: 999,
                  marginBottom: 10,
                  border: '2px solid rgba(220,79,124,0.30)',
                  background: codeCopied ? 'rgba(220,79,124,0.12)' : 'rgba(220,79,124,0.06)',
                  color: '#DC4F7C',
                  fontSize: 14,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 600,
                  transition: 'all .2s ease',
                }}
              >
                {codeCopied ? 'Link copied!' : 'Copy invite link'}
              </button>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={handleGenerateCode}
                  disabled={codeGenerating}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    borderRadius: 999,
                    border: '2px solid rgba(220,79,124,0.25)',
                    background: 'rgba(220,79,124,0.06)',
                    color: '#DC4F7C',
                    fontSize: 14,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 500,
                  }}
                >
                  New code
                </button>
                <button
                  onClick={() => {
                    setSharingCode('');
                    setCodeExpiresAt(null);
                  }}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    borderRadius: 999,
                    border: 0,
                    background: '#DC4F7C',
                    color: '#fff',
                    fontSize: 14,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 600,
                    boxShadow: '0 6px 20px rgba(220,79,124,0.28)',
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleGenerateCode}
              disabled={codeGenerating}
              style={{
                padding: '13px 22px',
                borderRadius: 999,
                border: '2px solid rgba(220,79,124,0.28)',
                background: 'rgba(255,255,255,0.78)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                color: '#DC4F7C',
                fontFamily: 'var(--font-sans)',
                fontSize: 15,
                fontWeight: 500,
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(220,79,124,0.10)',
                transition: 'all .25s ease',
              }}
              onMouseEnter={event => { event.currentTarget.style.background = 'rgba(255,255,255,0.96)'; }}
              onMouseLeave={event => { event.currentTarget.style.background = 'rgba(255,255,255,0.78)'; }}
            >
              {codeGenerating ? '...' : '+ Share with caregiver'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
