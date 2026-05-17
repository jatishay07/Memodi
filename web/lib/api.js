const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

function authHeader() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem('memodi_auth');
    const token = raw ? JSON.parse(raw).token : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...authHeader(), ...(options.headers ?? {}) },
    ...options,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(body.error || `HTTP ${res.status}`);
    err.response = { data: body, status: res.status };
    throw err;
  }
  return body;
}

function normalizeEmail(email) {
  return (email || '').trim().toLowerCase();
}

// Auth
export async function registerPatient(data) {
  return request('/auth/patient/register', { method: 'POST', body: JSON.stringify({ ...data, email: normalizeEmail(data.email) }) });
}
export async function loginPatient(data) {
  return request('/auth/patient/login', { method: 'POST', body: JSON.stringify({ ...data, email: normalizeEmail(data.email) }) });
}
export async function registerCaregiver(data) {
  return request('/auth/caregiver/register', { method: 'POST', body: JSON.stringify({ ...data, email: normalizeEmail(data.email) }) });
}
export async function loginCaregiver(data) {
  return request('/auth/caregiver/login', { method: 'POST', body: JSON.stringify({ ...data, email: normalizeEmail(data.email) }) });
}
export async function verifyEmail(email, code) {
  return request('/auth/verify', { method: 'POST', body: JSON.stringify({ email: normalizeEmail(email), code: (code || '').trim() }) });
}
export async function resendVerificationCode(email) {
  return request('/auth/verify', { method: 'POST', body: JSON.stringify({ email: normalizeEmail(email), resend: true }) });
}
export async function requestPasswordReset(email) {
  return request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email: normalizeEmail(email) }) });
}
export async function confirmPasswordReset(email, code, newPassword) {
  return request('/auth/reset-password', { method: 'POST', body: JSON.stringify({ email: normalizeEmail(email), code: code.trim(), newPassword }) });
}

// Patient API
export async function sendVoiceInput(patientId, audioBase64) {
  return request('/voice', { method: 'POST', body: JSON.stringify({ patientId, audioBase64 }) });
}
export async function sendTextInput(patientId, text) {
  return request('/voice/text', { method: 'POST', body: JSON.stringify({ patientId, text }) });
}

const PIPER_URL = process.env.NEXT_PUBLIC_PIPER_URL || 'http://127.0.0.1:59125';
export async function synthesizeWithPiper(text) {
  const res = await fetch(`${PIPER_URL}/synthesize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error(`Piper TTS error: ${res.status}`);
  const data = await res.json();
  return { audioBase64: data.audioBase64, mimeType: data.mimeType || 'audio/wav' };
}
export async function getPatient(patientId) {
  return request(`/patient/${patientId}`);
}
export async function uploadMemory(patientId, memoryType, data, photoBase64 = null) {
  return request('/memory', { method: 'POST', body: JSON.stringify({ patientId, memoryType, data, photoBase64 }) });
}
export async function identifyPhoto(patientId, photoBase64) {
  return request('/identify', { method: 'POST', body: JSON.stringify({ patientId, photoBase64 }) });
}
export async function getAlerts(patientId) {
  return request(`/alerts/${patientId}`);
}
export async function resolveAlert(alertId) {
  return request(`/alerts/${alertId}/resolve`, { method: 'POST', body: JSON.stringify({}) });
}
export async function getInteractions(patientId, limit = 50) {
  return request(`/interactions/${patientId}?limit=${limit}`);
}
