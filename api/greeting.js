import { localTime, opening } from '../thulani.js';

export function GET() {
  const t = localTime();
  const whatsapp = /^\d{10,15}$/.test(process.env.MATLA_WHATSAPP_NUMBER || '') ? process.env.MATLA_WHATSAPP_NUMBER : null;
  return Response.json({ greeting: opening(), period: t.period, open: t.open, time: `${String(t.hour).padStart(2, '0')}:${String(t.minute).padStart(2, '0')}`, whatsapp }, { headers: { 'Cache-Control': 'no-store' } });
}
