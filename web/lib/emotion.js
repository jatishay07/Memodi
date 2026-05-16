const DEEPFACE_URL = (process.env.NEXT_PUBLIC_DEEPFACE_URL || 'http://127.0.0.1:59126').replace(/\/$/, '');

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
export const ANALYZE_INTERVAL_MS = 750;

export function isEmotionEnabled() {
  return process.env.NEXT_PUBLIC_EMOTION_ENABLED !== 'false';
}

export async function checkDeepfaceHealth() {
  try {
    const res = await fetch(`${DEEPFACE_URL}/health`, { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}

export async function analyzeFrame(imageBase64) {
  const res = await fetch(`${DEEPFACE_URL}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64 }),
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
