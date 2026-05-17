'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, Plus, Search, Upload, X, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Logo from '../../components/Logo';
import { useAuth } from '../../lib/auth';

const FRAME_INTERVAL_MS = 350;
const TRACKER = 'http://127.0.0.1:59127';

// ─── localStorage helpers ─────────────────────────────────────────────────────

function storageKey(patientId) {
  return `memodi_tracker_objects_${patientId || 'guest'}`;
}

function loadObjects(patientId) {
  try {
    return JSON.parse(localStorage.getItem(storageKey(patientId)) || '[]');
  } catch {
    return [];
  }
}

function saveObjects(patientId, objects) {
  localStorage.setItem(storageKey(patientId), JSON.stringify(objects));
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function trackerRequest(path, options = {}) {
  const res = await fetch(`${TRACKER}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
    ...options,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.detail || body.error || `HTTP ${res.status}`);
  return body;
}

// ─── Home: registered objects grid ───────────────────────────────────────────

function HomeScreen({ objects, onFind, onAdd, onDelete, serviceOnline }) {
  return (
    <div style={{ width: '100%', maxWidth: 800 }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: '#DC4F7C', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Object finder</p>
        <h1 style={{ margin: '0 0 10px', fontSize: 40, color: '#3d342a', lineHeight: 1.15 }}>What can't you find?</h1>
        <p style={{ margin: 0, color: '#9C9C9C', fontSize: 16 }}>Tap something below to start looking for it.</p>
      </div>

      {serviceOnline === false && (
        <div style={{ marginBottom: 24, padding: '14px 20px', borderRadius: 18, background: 'rgba(196,43,52,0.08)', border: '1px solid rgba(196,43,52,0.22)', color: '#C42B34', fontSize: 14, fontWeight: 600, textAlign: 'center' }}>
          Tracker service is offline — run <code style={{ background: 'rgba(196,43,52,0.10)', borderRadius: 6, padding: '2px 6px' }}>npm run tracker:up</code> to start it
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
        {objects.map(obj => (
          <ObjectCard key={obj.id} obj={obj} onFind={onFind} onDelete={onDelete} />
        ))}
        <AddCard onAdd={onAdd} />
      </div>

      {objects.length === 0 && (
        <p style={{ textAlign: 'center', color: '#9C9C9C', fontSize: 15, marginTop: 8, lineHeight: 1.6 }}>
          Register your glasses, keys, remote, or anything you often misplace.<br />
          Tap the card above to add your first item.
        </p>
      )}
    </div>
  );
}

function ObjectCard({ obj, onFind, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div style={{ position: 'relative', borderRadius: 24, overflow: 'hidden', background: 'rgba(255,255,255,0.80)', border: '2px solid rgba(220,79,124,0.14)', boxShadow: '0 4px 20px rgba(45,45,45,0.06)', transition: 'transform .15s ease, box-shadow .2s ease' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 32px rgba(220,79,124,0.14)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(45,45,45,0.06)'; }}
    >
      {obj.photoBase64 ? (
        <img src={`data:image/jpeg;base64,${obj.photoBase64}`} alt={obj.name} style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />
      ) : (
        <div style={{ width: '100%', height: 160, background: 'linear-gradient(135deg, rgba(252,138,45,0.12), rgba(220,79,124,0.12))', display: 'grid', placeItems: 'center' }}>
          <Search size={40} color="rgba(220,79,124,0.4)" />
        </div>
      )}

      <div style={{ padding: '14px 14px 16px' }}>
        <p style={{ margin: '0 0 12px', fontSize: 18, fontWeight: 800, color: '#3d342a' }}>{obj.name}</p>
        <button
          onClick={() => onFind(obj)}
          style={{ width: '100%', padding: '11px', borderRadius: 999, border: 0, background: 'linear-gradient(135deg, #FC8A2D, #DC4F7C)', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: '0 4px 16px rgba(220,79,124,0.28)' }}
        >
          Find it
        </button>
      </div>

      {confirmDelete ? (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.95)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 16 }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#2D2D2D', textAlign: 'center' }}>Remove {obj.name}?</p>
          <div style={{ display: 'flex', gap: 8, width: '100%' }}>
            <button onClick={() => setConfirmDelete(false)} style={smallGhostBtn}>Cancel</button>
            <button onClick={() => onDelete(obj.id)} style={{ ...smallGhostBtn, color: '#C42B34', borderColor: 'rgba(196,43,52,0.3)' }}>Remove</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setConfirmDelete(true)} style={{ position: 'absolute', top: 8, right: 8, width: 30, height: 30, borderRadius: 999, border: 0, background: 'rgba(45,45,45,0.45)', backdropFilter: 'blur(8px)', color: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
          <X size={14} />
        </button>
      )}
    </div>
  );
}

function AddCard({ onAdd }) {
  return (
    <button
      onClick={onAdd}
      style={{ borderRadius: 24, border: '2.5px dashed rgba(220,79,124,0.30)', background: 'rgba(255,255,255,0.50)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 24, minHeight: 240, color: '#DC4F7C', transition: 'background .2s ease, border-color .2s ease' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,79,124,0.06)'; e.currentTarget.style.borderColor = 'rgba(220,79,124,0.55)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.50)'; e.currentTarget.style.borderColor = 'rgba(220,79,124,0.30)'; }}
    >
      <div style={{ width: 52, height: 52, borderRadius: 999, background: 'rgba(220,79,124,0.12)', display: 'grid', placeItems: 'center' }}>
        <Plus size={26} />
      </div>
      <span style={{ fontSize: 15, fontWeight: 700 }}>Register something</span>
    </button>
  );
}

// ─── Register: add a new object ───────────────────────────────────────────────

// mode ('choose' | 'camera') is controlled by the parent so it can flushSync
// before starting the camera, ensuring the <video> element is in the DOM.
function RegisterScreen({ videoRef, captureRef, cameraReady, mode, onCameraMode, onChooseMode, onSave, onBack }) {
  const [name, setName] = useState('');
  const [photoBase64, setPhotoBase64] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileRef = useRef(null);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const b64 = await fileToBase64(file);
    setPhotoBase64(b64);
    setPreview(URL.createObjectURL(file));
  }

  function handleCapture() {
    const video = videoRef.current;
    const canvas = captureRef.current;
    if (!video || !canvas || video.readyState < 2) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    const b64 = canvas.toDataURL('image/jpeg', 0.82).split(',')[1];
    setPhotoBase64(b64);
    setPreview(`data:image/jpeg;base64,${b64}`);
    onChooseMode();
  }

  if (mode === 'camera') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, width: '100%', maxWidth: 600 }}>
        <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#3d342a', textAlign: 'center' }}>
          Put your <span style={{ color: '#DC4F7C' }}>{name || 'item'}</span> in front of the camera
        </p>
        <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', borderRadius: 24, overflow: 'hidden', background: '#2D2D2D', border: '2px solid rgba(220,79,124,0.25)' }}>
          <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} muted playsInline />
          <canvas ref={captureRef} style={{ display: 'none' }} aria-hidden />
          {!cameraReady && (
            <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: '#FFFBF7' }}>
              <p style={{ opacity: 0.7 }}>Starting camera…</p>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 12, width: '100%' }}>
          <button onClick={onChooseMode} style={ghostBtn}>Back</button>
          <button onClick={handleCapture} disabled={!cameraReady} style={{ ...primaryBtn, flex: 2, opacity: cameraReady ? 1 : 0.5 }}>
            <Camera size={18} /> Take photo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, width: '100%', maxWidth: 480 }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: '#DC4F7C', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Register an object</p>
        <h2 style={{ margin: 0, fontSize: 34, color: '#3d342a' }}>What do you want to save?</h2>
      </div>

      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="e.g. glasses, keys, remote…"
        style={{ width: '100%', boxSizing: 'border-box', padding: '16px 22px', borderRadius: 999, border: '2px solid rgba(220,79,124,0.22)', background: 'rgba(255,255,255,0.82)', fontSize: 20, color: '#2D2D2D', fontWeight: 600, outline: 'none', textAlign: 'center' }}
        onFocus={e => { e.target.style.borderColor = 'rgba(220,79,124,0.55)'; }}
        onBlur={e => { e.target.style.borderColor = 'rgba(220,79,124,0.22)'; }}
      />

      {preview ? (
        <div style={{ position: 'relative', width: '100%', borderRadius: 20, overflow: 'hidden', border: '2px solid rgba(220,79,124,0.20)' }}>
          <img src={preview} alt="Object preview" style={{ display: 'block', width: '100%', maxHeight: 220, objectFit: 'cover' }} />
          <button onClick={() => { setPreview(null); setPhotoBase64(null); }} style={{ position: 'absolute', top: 10, right: 10, width: 32, height: 32, borderRadius: 999, border: 0, background: 'rgba(45,45,45,0.55)', backdropFilter: 'blur(8px)', color: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
            <X size={16} />
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%' }}>
          <button onClick={() => fileRef.current?.click()} style={photoOptionBtn}>
            <Upload size={22} />
            <span>Upload photo</span>
          </button>
          <button onClick={onCameraMode} style={photoOptionBtn}>
            <Camera size={22} />
            <span>Take photo</span>
          </button>
        </div>
      )}

      <p style={{ margin: 0, color: '#9C9C9C', fontSize: 14, textAlign: 'center', lineHeight: 1.6 }}>
        A photo helps the camera recognise it later. Close-up, well-lit photos work best.
      </p>

      <div style={{ display: 'flex', gap: 12, width: '100%' }}>
        <button onClick={onBack} style={ghostBtn}>Cancel</button>
        <button onClick={() => { if (name.trim()) onSave({ name: name.trim(), photoBase64 }); }} disabled={!name.trim()} style={{ ...primaryBtn, flex: 2, opacity: name.trim() ? 1 : 0.45 }}>
          Save
        </button>
      </div>

      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} onClick={e => { e.currentTarget.value = ''; }} />
    </div>
  );
}

// ─── Tracking: live camera search ────────────────────────────────────────────

function TrackingScreen({ obj, videoRef, captureRef, overlayRef, detections, found, onStop }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, width: '100%', maxWidth: 900 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 16 }}>
        <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#3d342a' }}>
          {found
            ? <span>Found your <span style={{ color: '#DC4F7C' }}>{obj.name}</span>!</span>
            : <span>Looking for your <span style={{ color: '#DC4F7C' }}>{obj.name}</span>…</span>}
        </p>
        <button onClick={onStop} style={{ ...ghostBtn, gap: 6, whiteSpace: 'nowrap' }}>
          <ArrowLeft size={16} /> My things
        </button>
      </div>

      <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', borderRadius: 28, overflow: 'hidden', background: '#2D2D2D', border: `3px solid ${found ? 'rgba(220,79,124,0.65)' : 'rgba(45,45,45,0.15)'}`, transition: 'border-color .4s ease', boxShadow: found ? '0 0 0 6px rgba(220,79,124,0.12)' : 'none' }}>
        <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'fill', display: 'block' }} muted playsInline />
        <canvas ref={overlayRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
        <canvas ref={captureRef} style={{ display: 'none' }} aria-hidden />

        {obj.photoBase64 && (
          <div style={{ position: 'absolute', top: 14, right: 14, width: 76, height: 76, borderRadius: 14, overflow: 'hidden', border: '3px solid rgba(255,255,255,0.95)', boxShadow: '0 4px 16px rgba(0,0,0,0.35)' }}>
            <img src={`data:image/jpeg;base64,${obj.photoBase64}`} alt={obj.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}

        {!found && (
          <div style={{ position: 'absolute', bottom: 18, left: '50%', transform: 'translateX(-50%)', background: 'rgba(45,45,45,0.72)', backdropFilter: 'blur(8px)', borderRadius: 999, padding: '9px 22px', color: '#FFFBF7', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap' }}>
            Move the camera slowly around the room
          </div>
        )}

        {found && (
          <div style={{ position: 'absolute', bottom: 18, left: '50%', transform: 'translateX(-50%)', background: 'rgba(220,79,124,0.90)', backdropFilter: 'blur(8px)', borderRadius: 999, padding: '9px 22px', color: '#fff', fontSize: 15, fontWeight: 700, whiteSpace: 'nowrap' }}>
            There it is!
          </div>
        )}
      </div>

      {detections.length > 0 && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          {detections.map(det => (
            <div key={det.id} style={{ padding: '9px 20px', borderRadius: 999, background: 'rgba(220,79,124,0.10)', border: '1px solid rgba(220,79,124,0.28)', color: '#DC4F7C', fontWeight: 700, fontSize: 14 }}>
              {Math.round(det.confidence * 100)}% confidence · moving {det.direction}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function TrackerPage() {
  const { user } = useAuth();
  const patientId = user?.patientId;

  const videoRef = useRef(null);
  const captureRef = useRef(null);
  const overlayRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const busyRef = useRef(false);
  const targetReadyRef = useRef(false);

  const [screen, setScreen] = useState('home'); // 'home' | 'register' | 'tracking'
  const [registerMode, setRegisterMode] = useState('choose'); // 'choose' | 'camera'
  const [objects, setObjects] = useState([]);
  const [activeObj, setActiveObj] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [streamTick, setStreamTick] = useState(0); // bumped after stream acquired → forces re-render
  const [detections, setDetections] = useState([]);
  const [found, setFound] = useState(false);
  const [serviceOnline, setServiceOnline] = useState(null);

  useEffect(() => {
    setObjects(loadObjects(patientId));
    trackerRequest('/health')
      .then(d => setServiceOnline(d.status !== 'missing-dependencies'))
      .catch(() => setServiceOnline(false));
  }, [patientId]);

  // ── Camera helpers ──

  const stopCamera = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    if (overlayRef.current) overlayRef.current.getContext('2d')?.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height);
    setCameraReady(false);
    setStreamTick(0);
    busyRef.current = false;
    targetReadyRef.current = false;
  }, []);

  // After every render: if a stream is ready but not yet attached to the video
  // element (e.g. because the element just mounted), attach it now.
  useEffect(() => {
    const video = videoRef.current;
    const stream = streamRef.current;
    if (!video || !stream || video.srcObject === stream) return;
    video.srcObject = stream;
    video.muted = true;
    video.playsInline = true;
    video.play().catch(() => {});
    setCameraReady(true);
  });

  const startCamera = useCallback(async () => {
    if (streamRef.current) return true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 960 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      // streamTick always changes → guaranteed re-render → useEffect attaches stream to video
      setStreamTick(t => t + 1);
      return true;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  // ── Overlay drawing ──

  const drawOverlay = useCallback((items, frame) => {
    const canvas = overlayRef.current;
    if (!canvas || !frame?.width || !frame?.height) return;
    canvas.width = frame.width;
    canvas.height = frame.height;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const det of items) {
      const [x1, y1, x2, y2] = det.box;
      ctx.strokeStyle = '#DC4F7C';
      ctx.lineWidth = 4;
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
      ctx.fillStyle = 'rgba(220,79,124,0.88)';
      ctx.fillRect(x1, Math.max(0, y1 - 30), Math.max(130, x2 - x1), 26);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText(`${det.label}  ${Math.round(det.confidence * 100)}%`, x1 + 8, Math.max(19, y1 - 9));
      if (det.trail?.length > 1) {
        ctx.beginPath();
        det.trail.forEach((pt, i) => i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y));
        ctx.strokeStyle = '#FC8A2D';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(det.center.x, det.center.y, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#FCE9AB';
      ctx.fill();
    }
  }, []);

  // ── Tracking loop ──

  const captureFrameBase64 = useCallback(() => {
    const video = videoRef.current;
    const canvas = captureRef.current;
    if (!video || !canvas || video.readyState < 2) return null;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.72).split(',')[1];
  }, []);

  const analyzeFrame = useCallback(async () => {
    if (!targetReadyRef.current || busyRef.current) return;
    const imageBase64 = captureFrameBase64();
    if (!imageBase64) return;
    busyRef.current = true;
    try {
      const data = await trackerRequest('/track', { method: 'POST', body: JSON.stringify({ imageBase64 }) });
      const items = data.detections || [];
      setDetections(items);
      setFound(items.length > 0);
      drawOverlay(items, data.frame);
    } catch {
      // retry next tick
    } finally {
      busyRef.current = false;
    }
  }, [captureFrameBase64, drawOverlay]);

  const beginTracking = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(analyzeFrame, FRAME_INTERVAL_MS);
    analyzeFrame();
  }, [analyzeFrame]);

  // ── Actions ──

  async function handleFind(obj) {
    setActiveObj(obj);
    setDetections([]);
    setFound(false);
    setScreen('tracking');
    const ok = await startCamera();
    if (!ok) return;
    if (obj.photoBase64) {
      try {
        await trackerRequest('/targets', {
          method: 'POST',
          body: JSON.stringify({ targets: [{ name: obj.name, imageBase64: obj.photoBase64 }] }),
        });
        targetReadyRef.current = true;
      } catch {
        targetReadyRef.current = false;
      }
    }
    beginTracking();
  }

  function handleOpenRegister() {
    stopCamera();
    setRegisterMode('choose');
    setScreen('register');
  }

  async function handleRegisterCameraMode() {
    setRegisterMode('camera'); // renders the <video> element on next React tick
    await startCamera();       // acquires stream; useEffect attaches it once video is mounted
  }

  function handleRegisterChooseMode() {
    stopCamera();
    setRegisterMode('choose');
  }

  function handleSaveObject({ name, photoBase64 }) {
    stopCamera();
    const newObj = { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, name, photoBase64, registeredAt: new Date().toISOString() };
    const updated = [...objects, newObj];
    setObjects(updated);
    saveObjects(patientId, updated);
    setScreen('home');
  }

  function handleDeleteObject(id) {
    const updated = objects.filter(o => o.id !== id);
    setObjects(updated);
    saveObjects(patientId, updated);
  }

  function handleStopTracking() {
    stopCamera();
    setDetections([]);
    setFound(false);
    setActiveObj(null);
    setScreen('home');
  }

  function handleBackFromRegister() {
    stopCamera();
    setRegisterMode('choose');
    setScreen('home');
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #FFF9F0 0%, #FFFBF7 48%, rgba(252,233,171,0.22) 100%)', color: '#2D2D2D', fontFamily: 'var(--font-sans)' }}>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, padding: '18px 28px', display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,249,240,0.80)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', borderBottom: '1px solid rgba(45,45,45,0.06)' }}>
        <Logo iconSize={30} textSize={17} gap={7} />
        <Link href="/patient" style={{ padding: '9px 16px', borderRadius: 999, border: '1.5px solid rgba(45,45,45,0.14)', background: 'rgba(255,255,255,0.60)', color: '#6B6B6B', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
          ← Dashboard
        </Link>
      </nav>

      <div style={{ paddingTop: 88, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: screen === 'home' ? 'flex-start' : 'center', padding: '88px 24px 48px' }}>
        {screen === 'home' && (
          <HomeScreen
            objects={objects}
            onFind={handleFind}
            onAdd={handleOpenRegister}
            onDelete={handleDeleteObject}
            serviceOnline={serviceOnline}
          />
        )}
        {screen === 'register' && (
          <RegisterScreen
            videoRef={videoRef}
            captureRef={captureRef}
            cameraReady={cameraReady}
            mode={registerMode}
            onCameraMode={handleRegisterCameraMode}
            onChooseMode={handleRegisterChooseMode}
            onSave={handleSaveObject}
            onBack={handleBackFromRegister}
          />
        )}
        {screen === 'tracking' && activeObj && (
          <TrackingScreen
            obj={activeObj}
            videoRef={videoRef}
            captureRef={captureRef}
            overlayRef={overlayRef}
            detections={detections}
            found={found}
            onStop={handleStopTracking}
          />
        )}
      </div>
    </div>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const primaryBtn = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  padding: '14px 28px', borderRadius: 999, border: 0,
  background: 'linear-gradient(135deg, #FC8A2D, #DC4F7C)',
  color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer',
  boxShadow: '0 8px 24px rgba(220,79,124,0.28)',
};

const ghostBtn = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  padding: '13px 22px', borderRadius: 999,
  border: '1.5px solid rgba(45,45,45,0.16)',
  background: 'rgba(255,255,255,0.65)',
  color: '#6B6B6B', fontSize: 15, fontWeight: 600, cursor: 'pointer',
};

const smallGhostBtn = {
  flex: 1, padding: '9px 12px', borderRadius: 999,
  border: '1.5px solid rgba(45,45,45,0.16)',
  background: 'rgba(255,255,255,0.70)',
  color: '#6B6B6B', fontSize: 13, fontWeight: 600, cursor: 'pointer',
};

const photoOptionBtn = {
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
  padding: '22px 16px', borderRadius: 20,
  border: '2px dashed rgba(220,79,124,0.30)',
  background: 'rgba(255,255,255,0.50)',
  color: '#DC4F7C', fontSize: 15, fontWeight: 700, cursor: 'pointer',
};
