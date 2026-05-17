const TRACKER_URL = process.env.TRACKER_URL || 'http://127.0.0.1:59127';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const res = await fetch(`${TRACKER_URL}/health`, { cache: 'no-store' });
    const body = await res.text();
    return new Response(body, {
      status: res.status,
      headers: { 'Content-Type': res.headers.get('content-type') || 'application/json' },
    });
  } catch {
    return Response.json({ status: 'offline' }, { status: 503 });
  }
}
