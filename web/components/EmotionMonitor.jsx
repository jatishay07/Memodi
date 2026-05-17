'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  EMOTION_COLORS,
  EMOTION_ORDER,
  analyzeFrame,
  checkDeepfaceHealth,
  formatEmotionLabel,
  getAnalyzeIntervalMs,
  isNegativeEmotion,
  normalizeScores,
  usesLocalEmotionService,
} from '../lib/emotion';

const NEGATIVE_STREAK_THRESHOLD = 2;

function EmotionBars({ scores, dominant }) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {EMOTION_ORDER.map(key => {
        const pct = scores[key] ?? 0;
        const active = key === dominant;
        return (
          <div key={key} className="flex items-center gap-2 text-[10px]">
            <span
              className="w-14 truncate font-medium"
              style={{ color: active ? '#2D2D2D' : '#9C9C9C' }}
            >
              {formatEmotionLabel(key)}
            </span>
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(45,45,45,0.08)' }}>
              <div
                className="h-full rounded-full transition-all duration-300 ease-out"
                style={{
                  width: `${pct}%`,
                  backgroundColor: EMOTION_COLORS[key],
                  opacity: active ? 1 : 0.55,
                }}
              />
            </div>
            <span
              className="w-8 text-right tabular-nums"
              style={{ color: active ? '#2D2D2D' : '#9C9C9C' }}
            >
              {pct}%
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function EmotionMonitor({ onDistressChange, active = true }) {
  const videoRef = useRef(null);
  const captureRef = useRef(null);
  const overlayRef = useRef(null);
  const onDistressRef = useRef(onDistressChange);
  onDistressRef.current = onDistressChange;
  const negativeStreakRef = useRef(0);

  // 'loading' | 'live' | 'camera-denied' | 'analysis-unavailable'
  const [status, setStatus] = useState('loading');
  const [emotion, setEmotion] = useState(null);
  const [scores, setScores] = useState({});
  const [faceDetected, setFaceDetected] = useState(false);

  const runAnalysis = useCallback(async () => {
    const video = videoRef.current;
    const canvas = captureRef.current;
    if (!video || !canvas || video.readyState < 2) return;

    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) return;

    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, w, h);

    const base64 = canvas.toDataURL('image/jpeg', 0.65).split(',')[1];
    const result = await analyzeFrame(base64, { width: w, height: h });

    const overlay = overlayRef.current;
    if (overlay) {
      overlay.width = w;
      overlay.height = h;
      const octx = overlay.getContext('2d');
      octx.clearRect(0, 0, w, h);
      if (result.faceDetected && result.region) {
        const { x, y, w: rw, h: rh } = result.region;
        octx.strokeStyle = EMOTION_COLORS[result.dominantEmotion] || '#DC4F7C';
        octx.lineWidth = 3;
        octx.strokeRect(x, y, rw, rh);
      }
    }

    if (!result.faceDetected) {
      setFaceDetected(false);
      setEmotion(null);
      setScores({});
      negativeStreakRef.current = 0;
      onDistressRef.current?.(false);
      return;
    }

    setFaceDetected(true);
    const dominant = result.dominantEmotion;
    setEmotion(dominant);
    setScores(normalizeScores(result.emotionScores));

    if (isNegativeEmotion(dominant)) {
      negativeStreakRef.current += 1;
    } else {
      negativeStreakRef.current = 0;
    }
    onDistressRef.current?.(negativeStreakRef.current >= NEGATIVE_STREAK_THRESHOLD);
  }, []);

  useEffect(() => {
    if (!active) return undefined;

    let cancelled = false;
    let stream = null;
    let timer = null;
    let busy = false;

    async function start() {
      const waitForVideo = () =>
        new Promise(resolve => {
          const check = () => {
            if (videoRef.current) resolve();
            else requestAnimationFrame(check);
          };
          check();
        });
      await waitForVideo();

      // Start the camera first — always, regardless of analyzer health
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
      } catch {
        if (!cancelled) setStatus('camera-denied');
        return;
      }

      if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }

      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;
      await video.play();
      setStatus('live');

      const analysisOk = await checkDeepfaceHealth();
      if (cancelled) return;
      if (!analysisOk) {
        setStatus('analysis-unavailable');
        return;
      }

      const tick = async () => {
        if (cancelled || busy) return;
        busy = true;
        try {
          await runAnalysis();
        } catch {
          if (timer) clearInterval(timer);
          negativeStreakRef.current = 0;
          setFaceDetected(false);
          setEmotion(null);
          setScores({});
          setStatus('analysis-unavailable');
          onDistressRef.current?.(false);
        } finally {
          busy = false;
        }
      };

      timer = setInterval(tick, getAnalyzeIntervalMs());
      tick();
    }

    start();

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
      if (stream) stream.getTracks().forEach(t => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
      onDistressRef.current?.(false);
    };
  }, [active, runAnalysis]);

  const usesLocalService = usesLocalEmotionService();
  const dominantLabel = faceDetected ? formatEmotionLabel(emotion) : '—';
  const dominantColor = faceDetected ? EMOTION_COLORS[emotion] : '#9C9C9C';
  const showVideo = status === 'live' || status === 'loading' || status === 'analysis-unavailable';
  const unavailableMessage = usesLocalService
    ? 'Emotion analysis is offline. Start the local DeepFace service to see emotions.'
    : 'Emotion analysis is temporarily unavailable.';

  return (
    <Panel>
      <p
        className="text-[10px] uppercase tracking-widest mb-2"
        style={{ color: '#9C9C9C', fontFamily: 'var(--font-sans)' }}
      >
        Live emotions
      </p>

      {showVideo && (
        <div
          className="relative w-full aspect-[4/3] rounded-xl overflow-hidden mb-3"
          style={{ background: '#2D2D2D', border: '2px solid rgba(255,255,255,0.9)' }}
        >
          <video
            ref={videoRef}
            className="w-full h-full object-cover emotion-mirror"
            playsInline
            muted
            style={{ opacity: status === 'loading' ? 0 : 1 }}
          />
          <canvas
            ref={overlayRef}
            className="absolute inset-0 w-full h-full pointer-events-none emotion-mirror"
          />
          <canvas ref={captureRef} className="hidden" aria-hidden />

          {status === 'loading' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <p className="text-white text-sm">Starting camera…</p>
            </div>
          )}

          {status === 'live' && !faceDetected && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/25">
              <p className="text-white text-sm font-medium">Look at the camera</p>
            </div>
          )}

        </div>
      )}

      {status === 'camera-denied' && (
        <p className="text-sm text-center mb-2" style={{ color: '#C42B34' }}>
          Allow camera access to see live emotions.
        </p>
      )}

      {status === 'analysis-unavailable' && (
        <p className="text-sm text-center mb-2" style={{ color: '#6B6B6B' }}>
          {unavailableMessage}
        </p>
      )}

      {status === 'live' && (
        <>
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-3 h-3 rounded-full shrink-0 transition-colors duration-300"
              style={{
                backgroundColor: dominantColor,
                boxShadow: faceDetected ? `0 0 12px ${dominantColor}` : 'none',
              }}
            />
            <p
              className="text-2xl font-light tracking-wide m-0"
              style={{ color: '#2D2D2D', fontFamily: 'var(--font-serif)' }}
            >
              {dominantLabel}
            </p>
            {faceDetected && (
              <span
                className="text-xs ml-auto animate-pulse"
                style={{ color: '#DC4F7C', fontFamily: 'var(--font-sans)' }}
              >
                live
              </span>
            )}
          </div>
          <EmotionBars scores={scores} dominant={emotion} />
        </>
      )}
    </Panel>
  );
}

function Panel({ children }) {
  return (
    <div
      className="fixed bottom-6 left-6 z-30 w-72 max-w-[calc(100vw-3rem)] rounded-2xl p-4 pointer-events-none"
      style={{
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '2px solid rgba(255,255,255,0.95)',
        boxShadow: '0 24px 60px rgba(45,45,45,0.12)',
      }}
    >
      {children}
    </div>
  );
}
