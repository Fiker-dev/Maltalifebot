import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { localTime, opening } from './thulani.js';
import { fallback, reply } from './agent.js';

const root = path.dirname(fileURLToPath(import.meta.url));
try {
  const env = await fs.readFile(path.join(root, '.env'), 'utf8');
  for (const line of env.split(/\r?\n/)) {
    const match = line.match(/^([A-Z_][A-Z_0-9]*)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
  }
} catch (error) { if (error.code !== 'ENOENT') throw error; }
const port = Number(process.env.PORT || 3000);
async function body(req) {
  let data = '';
  for await (const chunk of req) { data += chunk; if (data.length > 25000) throw new Error('Message too large'); }
  return JSON.parse(data);
}
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png'};
const requests = new Map();
http.createServer(async (req,res) => {
  try {
    if (req.method === 'POST' && req.url === '/api/chat') {
      const ip = req.socket.remoteAddress || 'unknown';
      const now = Date.now();
      const hits = (requests.get(ip) || []).filter(time => now-time < 3600000);
      if (hits.length >= 30) { res.writeHead(429, {'Content-Type':'text/plain; charset=utf-8'}); return res.end('Please try again later.'); }
      hits.push(now); requests.set(ip,hits);
      const data = await body(req);
      if (typeof data.message !== 'string' || !data.message.trim() || data.message.length > 1500) { res.writeHead(400); return res.end('Invalid message'); }
      let result;
      try { result = await reply(data.message.trim(), Array.isArray(data.history) ? data.history : []); }
      catch (err) { console.error(err); result = { text:fallback(data.message), mode:'guided' }; }
      res.writeHead(200, {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}); return res.end(JSON.stringify(result));
    }
    if (req.method === 'GET' && req.url === '/api/greeting') {
      const t = localTime(); const whatsapp = /^\d{10,15}$/.test(process.env.MATLA_WHATSAPP_NUMBER || '') ? process.env.MATLA_WHATSAPP_NUMBER : null; res.writeHead(200, {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}); return res.end(JSON.stringify({greeting:opening(),period:t.period,open:t.open,time:`${String(t.hour).padStart(2,'0')}:${String(t.minute).padStart(2,'0')}`,whatsapp}));
    }
    const url = new URL(req.url, `http://localhost:${port}`);
    const pathname = url.pathname === '/' ? '/index.html' : url.pathname;
    if (!['/index.html','/style.css','/app.js','/matla-logo.png'].includes(pathname)) {res.writeHead(404);return res.end('Not found');}
    const content = await fs.readFile(path.join(root,'public',pathname));
    res.writeHead(200, {'Content-Type':types[path.extname(pathname)]}); res.end(content);
  } catch (err) { console.error(err); res.writeHead(500); res.end('Something went wrong'); }
}).listen(port, () => console.log(`Thulani is ready at http://localhost:${port}`));
