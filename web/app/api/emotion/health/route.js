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

export async function GET() {
  const baseUrl = getEmotionApiBaseUrl();
  if (!baseUrl) {
    return NextResponse.json(
      { status: 'unavailable', engine: 'proxy', error: 'Emotion API base URL is not configured' },
      { status: 503 },
    );
  }

  try {
    const upstream = await fetch(`${baseUrl}/emotion/health`, {
      method: 'GET',
      cache: 'no-store',
    });
    const body = await readJsonSafely(upstream);
    return NextResponse.json(body, { status: upstream.status });
  } catch {
    return NextResponse.json(
      { status: 'unavailable', engine: 'proxy', error: 'Emotion analyzer is unreachable' },
      { status: 503 },
    );
  }
}
