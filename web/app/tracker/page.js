'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, Crosshair, ImageUp, Play, Square, UploadCloud } from 'lucide-react';

const FRAME_INTERVAL_MS = 300;

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function requestJson(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
    ...options,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.detail || body.error || `HTTP ${res.status}`);
  return body;
}

function StatusPill({ status, service }) {
  const offline = status === 'offline' || service?.status === 'offline' || service?.status === 'missing-dependencies';
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px 12px',
      borderRadius: 999,
      background: offline ? 'rgba(196,43,52,0.10)' : 'rgba(158,152,32,0.12)',
      border: `1px solid ${offline ? 'rgba(196,43,52,0.24)' : 'rgba(158,152,32,0.26)'}`,
      color: offline ? '#C42B34' : '#5f5b13',
      fontSize: 13,
      fontWeight: 800,
    }}>
      <span style={{ width: 8, height: 8, borderRadius: 999, background: offline ? '#C42B34' : '#9E9820' }} />
      {offline ? 'Tracker offline' : 'Tracker ready'}
    </div>
  );
}

export default function ObjectTrackerPage() {
  const videoRef = useRef(null);
  const captureRef = useRef(null);
  const overlayRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const busyRef = useRef(false);
  const targetReadyRef = useRef(false);

  const [service, setService] = useState(null);
  const [status, setStatus] = useState('checking');
  const [message, setMessage] = useState('Checking object tracker service...');
  const [targetName, setTargetName] = useState('target');
  const [targetFiles, setTargetFiles] = useState([]);
  const [targetReady, setTargetReady] = useState(false);
  const [cameraLive, setCameraLive] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [targetPreview, setTargetPreview] = useState(null);
  const [detections, setDetections] = useState([]);
  const [frameSize, setFrameSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    targetReadyRef.current = targetReady;
  }, [targetReady]);

  const drawOverlay = useCallback((items, frame) => {
    const canvas = overlayRef.current;
    if (!canvas || !frame?.width || !frame?.height) return;
    canvas.width = frame.width;
    canvas.height = frame.height;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const det of items) {
      const [x1, y1, x2, y2] = det.box;
      const width = x2 - x1;
      const height = y2 - y1;
      ctx.strokeStyle = '#DC4F7C';
      ctx.lineWidth = 4;
      ctx.strokeRect(x1, y1, width, height);

      ctx.fillStyle = 'rgba(45,45,45,0.84)';
      ctx.fillRect(x1, Math.max(0, y1 - 34), Math.max(180, width), 30);
      ctx.fillStyle = '#FFFBF7';
      ctx.font = '700 18px Nunito, sans-serif';
      ctx.fillText(`${det.label} #${det.id} ${Math.round(det.confidence * 100)}%`, x1 + 10, Math.max(22, y1 - 12));

      if (det.trail?.length > 1) {
        ctx.beginPath();
        det.trail.forEach((point, index) => {
          if (index === 0) ctx.moveTo(point.x, point.y);
          else ctx.lineTo(point.x, point.y);
        });
        ctx.strokeStyle = '#FC8A2D';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(det.center.x, det.center.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#FCE9AB';
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(det.center.x, det.center.y);
      ctx.lineTo(det.center.x + (det.velocity?.x ?? 0) * 4, det.center.y + (det.velocity?.y ?? 0) * 4);
      ctx.strokeStyle = '#9E9820';
      ctx.lineWidth = 4;
      ctx.stroke();
    }
  }, []);

  const checkHealth = useCallback(async () => {
    try {
      const data = await requestJson('/api/tracker/health');
      setService(data);
      setStatus(data.status === 'missing-dependencies' ? 'offline' : 'ready');
      setMessage(data.status === 'missing-dependencies'
        ? 'Tracker dependencies are missing. Run npm run tracker:setup, then npm run tracker:up.'
        : 'Upload a picture, or take a target photo with the camera.');
    } catch {
      setService({ status: 'offline' });
      setStatus('offline');
      setMessage('Tracker service offline. Run npm run tracker:up.');
    }
  }, []);

  useEffect(() => {
    checkHealth();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, [checkHealth]);

  const uploadTargets = useCallback(async (targets, files = []) => {
    setTargetFiles(files);
    setTargetReady(false);
    setDetections([]);
    setFrameSize({ width: 0, height: 0 });
    targetReadyRef.current = false;
    if (!targets.length) return;

    setStatus('uploading');
    setMessage('Loading the target picture into Ultralytics...');
    try {
      const data = await requestJson('/api/tracker/targets', {
        method: 'POST',
        body: JSON.stringify({ targets }),
      });
      setTargetReady(Boolean(data.targetReady));
      setTargetName(data.targetName || targetName || 'target');
      setStatus('ready');
      setMessage(data.message || `Target loaded as ${data.targetName || targetName}. Start live tracking and point the camera around the room.`);
    } catch (err) {
      setStatus('error');
      setMessage(err.message);
    }
  }, [targetName]);

  const handleFiles = async event => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setTargetPreview(URL.createObjectURL(files[0]));
    const targets = await Promise.all(files.map(async file => ({
      name: targetName || file.name.replace(/\.[^.]+$/, '') || 'target',
      imageBase64: await fileToBase64(file),
    })));
    await uploadTargets(targets, files);
  };

  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = captureRef.current;
    if (!video || !canvas || video.readyState < 2) return null;
    const width = video.videoWidth;
    const height = video.videoHeight;
    if (!width || !height) return null;
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d').drawImage(video, 0, 0, width, height);
    return { imageBase64: canvas.toDataURL('image/jpeg', 0.72).split(',')[1], width, height };
  }, []);

  const analyzeFrame = useCallback(async () => {
    if (!targetReadyRef.current || busyRef.current) return;
    const frame = captureFrame();
    if (!frame) return;
    setFrameSize({ width: frame.width, height: frame.height });

    busyRef.current = true;
    try {
      const data = await requestJson('/api/tracker/track', {
        method: 'POST',
        body: JSON.stringify({ imageBase64: frame.imageBase64 }),
      });
      setFrameSize(data.frame || { width: frame.width, height: frame.height });
      setDetections(data.detections || []);
      drawOverlay(data.detections || [], data.frame || frame);
      setMessage(data.tracked ? 'Found it. Tracking target movement.' : 'Searching. Move the camera slowly around the area.');
      setStatus(data.tracked ? 'tracking' : 'searching');
    } catch (err) {
      setStatus('error');
      setMessage(err.message);
    } finally {
      busyRef.current = false;
    }
  }, [captureFrame, drawOverlay]);

  const ensureCameraStream = async () => {
    if (streamRef.current && videoRef.current?.srcObject) return true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 960 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;
      await video.play();
      setCameraLive(true);
      return true;
    } catch {
      setStatus('camera-denied');
      setMessage('Allow camera access to use the object tracker.');
      return false;
    }
  };

  const startTargetCamera = async () => {
    const ok = await ensureCameraStream();
    if (!ok) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setIsTracking(false);
    setStatus('target-camera');
    setMessage('Put the object close in the camera, then click "Use current frame as target."');
  };

  const captureTargetPhoto = async () => {
    const frame = captureFrame();
    if (!frame) {
      setMessage('Camera is not ready yet. Try again in a second.');
      return;
    }
    setTargetPreview(`data:image/jpeg;base64,${frame.imageBase64}`);
    await uploadTargets(
      [{ name: targetName || 'target', imageBase64: frame.imageBase64 }],
      [{ name: `${targetName || 'target'} camera frame`, size: Math.round((frame.imageBase64.length * 3) / 4) }],
    );
  };

  const startTrackingCamera = async () => {
    if (!targetReady) {
      setMessage('Upload a picture or capture a target photo before live tracking.');
      return;
    }
    const ok = await ensureCameraStream();
    if (!ok) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(analyzeFrame, FRAME_INTERVAL_MS);
    setIsTracking(true);
    setStatus('searching');
    setMessage('Camera live. Searching for the target...');
    analyzeFrame();
  };

  const stopCamera = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setIsTracking(false);
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    if (overlayRef.current) overlayRef.current.getContext('2d').clearRect(0, 0, overlayRef.current.width, overlayRef.current.height);
    setCameraLive(false);
    setDetections([]);
    setStatus(targetReady ? 'ready' : 'idle');
    setMessage(targetReady ? 'Camera stopped. Start again when ready.' : 'Upload or capture a target picture first.');
  };

  return (
    <main style={{ minHeight: '100vh', padding: 34, background: 'linear-gradient(135deg, #FFF9F0 0%, #FFFBF7 48%, rgba(252,233,171,0.24) 100%)', color: '#2D2D2D', fontFamily: 'var(--font-sans)' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24, marginBottom: 28 }}>
          <div>
            <p style={{ margin: '0 0 10px', color: '#9C9C9C', fontSize: 13, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Ultralytics tracker</p>
            <h1 style={{ fontSize: 56, color: '#3d342a', marginBottom: 12 }}>Find your stuff.</h1>
            <p style={{ margin: 0, maxWidth: 700, color: '#6B6B6B', fontSize: 18, lineHeight: 1.6 }}>Type what you are looking for, upload or take a picture of it, then scan around with the live camera feed. Standard YOLO tracks known classes; YOLO-World is used as a fallback for labels like keys or wallet.</p>
          </div>
          <StatusPill status={status} service={service} />
        </header>

        <section style={{ display: 'grid', gridTemplateColumns: '360px minmax(0, 1fr)', gap: 24, alignItems: 'stretch' }}>
          <aside className="glass" style={{ padding: 24, borderRadius: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <div style={{ width: 44, height: 44, borderRadius: 16, display: 'grid', placeItems: 'center', background: 'rgba(220,79,124,0.12)', color: '#DC4F7C' }}>
                <ImageUp size={22} />
              </div>
              <div>
                <h2 style={{ fontSize: 28, margin: 0 }}>Target picture</h2>
                <p style={{ margin: 0, color: '#9C9C9C', fontSize: 13 }}>Show it what to find</p>
              </div>
            </div>

            <label style={{ display: 'block', marginBottom: 16 }}>
              <span style={{ display: 'block', fontSize: 13, color: '#6B6B6B', fontWeight: 800, marginBottom: 8 }}>Object label</span>
              <input value={targetName} onChange={event => setTargetName(event.target.value)} placeholder="phone, key, wallet..." style={{ width: '100%', border: '1px solid rgba(45,45,45,0.12)', borderRadius: 18, padding: '13px 14px', background: 'rgba(255,255,255,0.72)', outline: 'none', color: '#2D2D2D', fontWeight: 700 }} />
            </label>

            <label style={{ display: 'grid', placeItems: 'center', minHeight: 152, padding: 18, borderRadius: 24, border: '2px dashed rgba(220,79,124,0.34)', background: 'rgba(255,255,255,0.44)', cursor: 'pointer', textAlign: 'center' }}>
              <UploadCloud size={34} color="#DC4F7C" />
              <strong style={{ marginTop: 10 }}>Upload picture</strong>
              <span style={{ color: '#9C9C9C', fontSize: 13 }}>Best: close photo with the object filling most of the image. Type a label first for keys, wallet, charger, or AirPods.</span>
              <input type="file" accept="image/*" capture="environment" multiple onClick={event => { event.currentTarget.value = ''; }} onChange={handleFiles} style={{ display: 'none' }} />
            </label>

            {targetPreview && (
              <div style={{ marginTop: 16, borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(45,45,45,0.10)', background: 'rgba(255,255,255,0.58)' }}>
                <img src={targetPreview} alt="Current target reference" style={{ display: 'block', width: '100%', maxHeight: 180, objectFit: 'cover' }} />
              </div>
            )}

            {targetFiles.length > 0 && (
              <div style={{ marginTop: 14, display: 'grid', gap: 8 }}>
                {targetFiles.map(file => (
                  <div key={`${file.name}-${file.size}`} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '10px 12px', borderRadius: 16, background: 'rgba(255,255,255,0.58)', color: '#6B6B6B', fontSize: 13 }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                    <span>{Math.round(file.size / 1024)} KB</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: 22, display: 'grid', gap: 12 }}>
              <button onClick={startTargetCamera} style={secondaryButtonStyle}><Camera size={18} /> Take target photo</button>
              {cameraLive && !isTracking && <button onClick={captureTargetPhoto} style={secondaryButtonStyle}><ImageUp size={18} /> Use current frame as target</button>}
              {(!cameraLive || !isTracking) ? (
                <button onClick={startTrackingCamera} style={primaryButtonStyle}><Play size={18} /> Start live tracking</button>
              ) : (
                <button onClick={stopCamera} style={{ ...primaryButtonStyle, background: '#C42B34' }}><Square size={18} /> Stop camera</button>
              )}
              {cameraLive && !isTracking && (
                <button onClick={stopCamera} style={{ ...secondaryButtonStyle, color: '#C42B34' }}><Square size={18} /> Stop camera</button>
              )}
              <button onClick={checkHealth} style={secondaryButtonStyle}><Crosshair size={18} /> Recheck service</button>
            </div>

            <p style={{ margin: '18px 0 0', color: status === 'error' || status === 'offline' ? '#C42B34' : '#6B6B6B', fontSize: 14, lineHeight: 1.55 }}>{message}</p>
          </aside>

          <section className="glass-strong" style={{ padding: 18, borderRadius: 32, minHeight: 640 }}>
            <div style={{ position: 'relative', width: '100%', aspectRatio: '4 / 3', overflow: 'hidden', borderRadius: 26, background: '#2D2D2D', border: '2px solid rgba(255,255,255,0.9)' }}>
              <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'fill', display: 'block' }} muted playsInline />
              <canvas ref={overlayRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
              <canvas ref={captureRef} style={{ display: 'none' }} aria-hidden />
              {!cameraLive && (
                <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center', color: '#FFFBF7', background: 'radial-gradient(circle at center, rgba(220,79,124,0.22), rgba(45,45,45,0.86))' }}>
                  <div>
                    <Camera size={54} />
                    <p style={{ margin: '14px 0 0', fontSize: 20, fontWeight: 800 }}>Camera preview</p>
                    <p style={{ margin: '4px 0 0', color: 'rgba(255,251,247,0.70)', fontSize: 14 }}>Upload a target or take a target photo first.</p>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginTop: 16 }}>
              <Metric label="Detections" value={detections.length} />
              <Metric label="Frame" value={frameSize.width ? `${frameSize.width}x${frameSize.height}` : '-'} />
              <Metric label="State" value={status} />
            </div>

            <div style={{ marginTop: 16, display: 'grid', gap: 10 }}>
              {detections.length === 0 ? (
                <p style={{ margin: 0, padding: 16, borderRadius: 20, background: 'rgba(255,255,255,0.58)', color: '#9C9C9C' }}>No tracked object yet. Move slowly, keep the object well lit, and make sure the target photo is close and clear. For non-standard objects, type the object name before uploading.</p>
              ) : detections.map(det => (
                <div key={det.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'center', padding: 16, borderRadius: 20, background: 'rgba(255,255,255,0.62)', border: '1px solid rgba(45,45,45,0.08)' }}>
                  <div>
                    <strong>{det.label} #{det.id}</strong>
                    <p style={{ margin: '2px 0 0', color: '#6B6B6B', fontSize: 14 }}>Moving {det.direction}; center ({Math.round(det.center.x)}, {Math.round(det.center.y)})</p>
                  </div>
                  <span style={{ fontWeight: 900, color: '#DC4F7C' }}>{Math.round(det.confidence * 100)}%</span>
                </div>
              ))}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }) {
  return (
    <div style={{ padding: 14, borderRadius: 18, background: 'rgba(255,255,255,0.58)', border: '1px solid rgba(45,45,45,0.07)' }}>
      <p style={{ margin: 0, color: '#9C9C9C', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.10em' }}>{label}</p>
      <p style={{ margin: '4px 0 0', color: '#2D2D2D', fontSize: 18, fontWeight: 900 }}>{value}</p>
    </div>
  );
}

const primaryButtonStyle = {
  width: '100%',
  border: 0,
  borderRadius: 999,
  padding: '13px 18px',
  background: '#DC4F7C',
  color: '#fff',
  fontWeight: 900,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  boxShadow: '0 12px 28px rgba(220,79,124,0.25)',
};

const secondaryButtonStyle = {
  ...primaryButtonStyle,
  background: 'rgba(255,255,255,0.65)',
  color: '#6B6B6B',
  border: '1px solid rgba(45,45,45,0.10)',
  boxShadow: 'none',
};
