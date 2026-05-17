import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getEmotionApiBaseUrl() {
  return (process.env.EMOTION_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');
}

async function readJsonSafely(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
}

export async function POST(request) {
  const baseUrl = getEmotionApiBaseUrl();
  if (!baseUrl) {
    return NextResponse.json({ error: 'Emotion API base URL is not configured' }, { status: 503 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body?.imageBase64) {
    return NextResponse.json({ error: 'imageBase64 is required' }, { status: 400 });
  }

  try {
    const upstream = await fetch(`${baseUrl}/emotion/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    const payload = await readJsonSafely(upstream);
    return NextResponse.json(payload, { status: upstream.status });
  } catch {
    return NextResponse.json({ error: 'Emotion analyzer is unreachable' }, { status: 503 });
  }
}
