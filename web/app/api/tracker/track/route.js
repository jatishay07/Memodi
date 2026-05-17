const TRACKER_URL = process.env.TRACKER_URL || 'http://127.0.0.1:59127';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const payload = await request.text();
    const res = await fetch(`${TRACKER_URL}/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
    });
    const body = await res.text();
    return new Response(body, {
      status: res.status,
      headers: { 'Content-Type': res.headers.get('content-type') || 'application/json' },
    });
  } catch {
    return Response.json({ error: 'Object tracker service offline' }, { status: 503 });
  }
}
