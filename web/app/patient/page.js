'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Orb from '../../components/Orb';
import { useAuth } from '../../lib/auth';
import { getPatient, sendVoiceInput } from '../../lib/api';
import { requestAudioPermission, startRecording, stopRecordingAndGetBase64, playAudioBase64 } from '../../lib/audio';

function greeting(name) {
  const h = new Date().getHours();
  const salutation = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  return `${salutation},\n${name}`;
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
  const { user, ready } = useAuth();

  const [orbState, setOrbState] = useState('idle');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [patient, setPatient] = useState(null);
  const [response, setResponse] = useState('');
  const [showResponse, setShowResponse] = useState(false);
  const [clock, setClock] = useState(formatClock());
  const [error, setError] = useState('');
  const audioRef = useRef(null);

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

  async function handleOrbClick() {
    if (isProcessing) return;
    setError('');

    if (!isRecording) {
      try {
        await startRecording();
        setIsRecording(true);
        setOrbState('listening');
        setShowResponse(false);
      } catch {
        setError('Microphone unavailable — please allow access in your browser.');
      }
      return;
    }

    setIsRecording(false);
    setIsProcessing(true);
    setOrbState('speaking');

    try {
      const base64 = await stopRecordingAndGetBase64();
      if (!base64) { setOrbState('idle'); setIsProcessing(false); return; }

      const result = await sendVoiceInput(user.patientId, base64);

      setOrbState(result.isDistressed ? 'distress' : 'speaking');
      setResponse(result.response);
      setShowResponse(true);

      if (audioRef.current) audioRef.current.pause();
      const audio = await playAudioBase64(result.audioResponse);
      audioRef.current = audio;
      audio.onended = () => setOrbState('idle');
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Try again.');
      setOrbState('idle');
    } finally {
      setIsProcessing(false);
    }
  }

  if (!ready) return null;

  const name = patient?.nickname || patient?.name?.split(' ')[0] || user?.name?.split(' ')[0] || '…';
  const greet = greeting(name);
  const hint = isProcessing ? 'Processing…' : isRecording ? 'Tap to send' : 'Tap to speak';

  return (
    <div className="min-h-screen bg-navy flex flex-col items-center justify-between py-12 px-6 select-none">
      <div className="text-center mt-4">
        <h1 className="text-white text-3xl font-light tracking-wide whitespace-pre-line leading-snug">
          {greet}
        </h1>
      </div>

      <div className="flex flex-col items-center gap-6">
        <Orb state={orbState} size={200} onClick={handleOrbClick} />

        {showResponse && (
          <div className="response-fade-in bg-white/5 rounded-2xl px-6 py-4 max-w-sm text-center">
            <p className="text-gray-300 text-base italic leading-relaxed">{response}</p>
          </div>
        )}

        <p className={`text-sm tracking-wide ${orbState === 'distress' ? 'text-pink' : 'text-gray-500'}`}>
          {error || hint}
        </p>
      </div>

      <div className="text-center pb-4">
        <p className="text-cream text-sm tracking-wide mb-1">{clock.day}</p>
        <p className="text-cream text-4xl font-extralight tracking-widest">{clock.time}</p>
      </div>
    </div>
  );
}
