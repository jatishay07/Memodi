const LOCAL_DEEPFACE_URL = (process.env.NEXT_PUBLIC_DEEPFACE_URL || 'http://127.0.0.1:59126').replace(/\/$/, '');
const PRODUCTION_PROXY_URL = '/api/emotion';
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1']);

export const EMOTION_ORDER = ['happy', 'neutral', 'sad', 'angry', 'fear', 'surprise', 'disgust'];

export const EMOTION_COLORS = {
  happy: '#F5A623',
  neutral: '#9CA3AF',
  sad: '#60A5FA',
  angry: '#F87171',
  fear: '#A78BFA',
  surprise: '#FBBF24',
  disgust: '#34D399',
};

const NEGATIVE_EMOTIONS = new Set(['sad', 'angry', 'fear', 'disgust']);
export const LOCAL_ANALYZE_INTERVAL_MS = 750;
export const REMOTE_ANALYZE_INTERVAL_MS = 2000;

function isLocalBrowserHost() {
  if (typeof window === 'undefined') return false;
  return LOCAL_HOSTS.has(window.location.hostname);
}

function getEmotionServiceBaseUrl() {
  return isLocalBrowserHost() ? LOCAL_DEEPFACE_URL : PRODUCTION_PROXY_URL;
}

export function usesLocalEmotionService() {
  return isLocalBrowserHost();
}

export function getAnalyzeIntervalMs() {
  return usesLocalEmotionService() ? LOCAL_ANALYZE_INTERVAL_MS : REMOTE_ANALYZE_INTERVAL_MS;
}

export function isEmotionEnabled() {
  return process.env.NEXT_PUBLIC_EMOTION_ENABLED !== 'false';
}

export async function checkDeepfaceHealth() {
  try {
    const res = await fetch(`${getEmotionServiceBaseUrl()}/health`, { method: 'GET', cache: 'no-store' });
    return res.ok;
  } catch {
    return false;
  }
}

export async function analyzeFrame(imageBase64, options = {}) {
  const { width, height } = options;
  const res = await fetch(`${getEmotionServiceBaseUrl()}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, width, height }),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Emotion analysis failed (${res.status}): ${detail}`);
  }
  return res.json();
}

export function isNegativeEmotion(emotion) {
  return NEGATIVE_EMOTIONS.has(emotion);
}

export function formatEmotionLabel(emotion) {
  if (!emotion) return '';
  return emotion.charAt(0).toUpperCase() + emotion.slice(1);
}

export function normalizeScores(scores) {
  if (!scores) return {};
  const total = EMOTION_ORDER.reduce((sum, key) => sum + (scores[key] || 0), 0) || 1;
  const out = {};
  for (const key of EMOTION_ORDER) {
    out[key] = Math.round(((scores[key] || 0) / total) * 100);
  }
  return out;
}
