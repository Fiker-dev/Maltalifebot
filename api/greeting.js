import { localTime, opening } from '../thulani.js';

export function GET() {
  const t = localTime();
  const configured = process.env.DEMO_WHATSAPP_NUMBER || '27602551513';
  const whatsapp = /^\d{10,15}$/.test(configured) ? configured : null;
  const email = process.env.DEMO_EMAIL || 'info@lulidigital.com';
  return Response.json({ greeting: opening(), period: t.period, open: t.open, time: `${String(t.hour).padStart(2, '0')}:${String(t.minute).padStart(2, '0')}`, whatsapp, email }, { headers: { 'Cache-Control': 'no-store' } });
}
