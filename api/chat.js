import { fallback, reply } from '../agent.js';

const requests = new Map();

export async function POST(request) {
  const ip = request.headers.get('x-vercel-forwarded-for') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const now = Date.now();
  const hits = (requests.get(ip) || []).filter(time => now - time < 3600000);
  if (hits.length >= 30) return new Response('Please try again later.', { status: 429 });
  hits.push(now);
  requests.set(ip, hits);

  if (Number(request.headers.get('content-length') || 0) > 25000) return new Response('Message too large', { status: 413 });
  let data;
  try { data = await request.json(); } catch { return new Response('Invalid JSON', { status: 400 }); }
  if (typeof data?.message !== 'string' || !data.message.trim() || data.message.length > 1500) return new Response('Invalid message', { status: 400 });

  let result;
  try { result = await reply(data.message.trim(), Array.isArray(data.history) ? data.history : []); }
  catch (error) { console.error(error); result = { text: fallback(data.message), mode: 'guided' }; }
  return Response.json(result, { headers: { 'Cache-Control': 'no-store' } });
}
