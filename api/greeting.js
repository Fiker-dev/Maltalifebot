import { localTime, opening } from '../thulani.js';

export function GET() {
  const t = localTime();
  const configured = process.env.MATLA_WHATSAPP_NUMBER || '27872100782';
  const whatsapp = /^\d{10,15}$/.test(configured) ? configured : null;
  return Response.json({ greeting: opening(), period: t.period, open: t.open, time: `${String(t.hour).padStart(2, '0')}:${String(t.minute).padStart(2, '0')}`, whatsapp }, { headers: { 'Cache-Control': 'no-store' } });
}
