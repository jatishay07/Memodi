const PIPER_URL = (process.env.NEXT_PUBLIC_PIPER_TTS_URL || 'http://127.0.0.1:59125').replace(/\/$/, '');

export async function checkPiperHealth() {
  const res = await fetch(`${PIPER_URL}/health`, { method: 'GET' });
  return res.ok;
}

export async function synthesizeWithPiper(text) {
  let res;
  try {
    res = await fetch(`${PIPER_URL}/synthesize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
  } catch {
    throw new Error('Piper is not running. In the project root run: npm run piper:up');
  }

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Piper TTS failed (${res.status}): ${detail}`);
  }

  const data = await res.json();
  return {
    base64: data.audioBase64,
    mimeType: data.mimeType || 'audio/wav',
  };
}
