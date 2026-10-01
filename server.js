import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { localTime, opening } from './thulani.js';

const root = path.dirname(fileURLToPath(import.meta.url));
try {
  const env = await fs.readFile(path.join(root, '.env'), 'utf8');
  for (const line of env.split(/\r?\n/)) {
    const match = line.match(/^([A-Z_][A-Z_0-9]*)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
  }
} catch (error) { if (error.code !== 'ENOENT') throw error; }
const port = Number(process.env.PORT || 3000);
const site = 'https://www.matlalife.co.za';
const knowledge = `Matla Life offers life cover, funeral cover (including consolidated funeral cover), wills and estate planning, and Matla Insure for vehicle, home and personal insurance. The consolidated funeral plan brings multiple policies into one plan and may cover up to 22 family members. Funeral main cover is described as R10,000 to R150,000, but individual eligibility, premiums and terms require an advisor's confirmation. Contact: +27 87 210 0782 or info@matlalife.co.za. Office: 23 Wellington Road, Parktown, Johannesburg, 2193. Hours: Monday to Friday, 08:00 to 17:30. Website: ${site}. The public funeral page contains conflicting waiting-period statements, so do not state a specific waiting period as certain; refer the visitor to the policy wording or an advisor. Never claim to see a customer's account, policy, claim status or personal information.`;
const system = `You are Thulani, a friendly, professional virtual assistant for Matla Life in South Africa. Clearly identify yourself as a virtual assistant. Help visitors understand products, find contact details and prepare questions for an advisor. Use only these verified facts: ${knowledge} If a question needs current prices, a quote, policy-specific terms, eligibility, a claim decision, or legal/financial advice, say you cannot confirm it and suggest contacting Matla Life. Never invent benefits, guarantees, claims timelines or application outcomes. Do not ask for ID numbers, bank details, health details or policy numbers in chat. If someone reports a bereavement, lead with empathy and offer the contact number. Keep replies under 110 words, using plain English. The welcome message lists several South African greetings; continue naturally without repeating the list in every reply. Reply in another language only if the visitor uses it and you can do so accurately. 'Siyabonga' means 'thank you', not 'hello'; use it only to thank someone. Use plain text only: no Markdown, asterisks, headings, bullets or link syntax.`;

function fallback(message) {
  const q = message.toLowerCase();
  if (/open now|are you open|office hours|business hours|what time|current time|today/.test(q)) { const t=localTime(); return `It’s ${String(t.hour).padStart(2,'0')}:${String(t.minute).padStart(2,'0')} in South Africa. ${t.open?'Matla Life’s listed office hours suggest the team is open now.':'Matla Life’s office is currently outside its listed hours.'} Hours are Monday to Friday, 08:00–17:30. You can call +27 87 210 0782.`; }
  if (/claim|death|passed away|died|bereav/.test(q)) return `I’m sorry you’re dealing with this. For help with a funeral claim or the documents needed, please call Matla Life on +27 87 210 0782. I can help you make a short list of questions for their team, but I can’t view or submit a claim here.`;
  if (/waiting|period|immediate|suicide/.test(q)) return `Waiting periods depend on the policy terms. Matla Life’s public information is inconsistent on this point, so I don’t want to give you a misleading answer. Please confirm the exact wording with an advisor on +27 87 210 0782.`;
  if (/price|cost|premium|quote|afford/.test(q)) return `Premiums depend on the cover and people you want to include. An advisor can confirm a current quote and the policy terms. Call Matla Life on +27 87 210 0782. Which type of cover are you interested in?`;
  if (/funeral|family|consolidat/.test(q)) return `Matla Life offers funeral cover and a consolidated plan that can bring multiple funeral policies into one. Its site says the plan can cover up to 22 family members, with main cover described from R10,000 to R150,000. An advisor should confirm eligibility, benefits and premiums for your family. What would you like to know?`;
  if (/life cover|life insurance/.test(q)) return `Matla Life offers life cover for financial protection of loved ones. I can explain the general idea, but an advisor should confirm cover amounts, premiums and eligibility for you. You can call +27 87 210 0782.`;
  if (/will|estate/.test(q)) return `Matla Life offers wills and estate planning services. For personal estate advice or to get started, please speak with its team on +27 87 210 0782.`;
  if (/car|vehicle|home|short.term|insure/.test(q)) return `Matla Insure covers vehicle, home and personal insurance needs. For available options and a current quote, please contact Matla Life on +27 87 210 0782.`;
  if (/contact|phone|address|office|hours|human|advisor|email|whatsapp/.test(q)) return `${localTime().open?'The team is within its listed office hours now.':'Our staff are out of office right now, but I’m here to help.'} You can call Matla Life on +27 87 210 0782 or email info@matlalife.co.za. Listed hours are Monday to Friday, 08:00–17:30. ${/^\d{10,15}$/.test(process.env.MATLA_WHATSAPP_NUMBER || '')?'Use the WhatsApp button below if you prefer.':'The email button below will open a message to the team.'}`;
  return `I’m Thulani, Matla Life’s virtual assistant. I can help with life cover, funeral cover, wills and estate planning, or Matla Insure. What would you like to know? For policy-specific help, call +27 87 210 0782.`;
}

async function body(req) {
  let data = '';
  for await (const chunk of req) { data += chunk; if (data.length > 25000) throw new Error('Message too large'); }
  return JSON.parse(data);
}
async function reply(message, history) {
  const input = [...history.slice(-8).filter(x => ['user','assistant'].includes(x.role) && typeof x.content === 'string').map(x => ({ role:x.role, content:x.content.slice(0,1500) })), { role:'user', content:message }];
  const t = localTime();
  const context = `Current South African local time: ${String(t.hour).padStart(2,'0')}:${String(t.minute).padStart(2,'0')} on ${t.weekday}. Listed office is ${t.open?'open':'closed'} now (Monday–Friday 08:00–17:30). Use time-sensitive wording only when relevant.`;
  if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_WORKSPACE_ID) {
    const response = await fetch('https://api.anthropic.com/v1/messages', { method:'POST', headers:{'Content-Type':'application/json','anthropic-version':'2023-06-01','x-api-key':process.env.ANTHROPIC_API_KEY,'anthropic-workspace-id':process.env.ANTHROPIC_WORKSPACE_ID}, body:JSON.stringify({ model:process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001', max_tokens:350, system:`${system}\n${context}`, messages:input }), signal:AbortSignal.timeout(20000) });
    if (!response.ok) { const detail = await response.json().catch(()=>({})); throw new Error(`AI service returned ${response.status}: ${String(detail.error?.message || 'Unknown provider error').slice(0,250)}`); }
    const data = await response.json();
    const text = data.content?.filter(x=>x.type==='text').map(x=>x.text).join('');
    if (!text) throw new Error('Empty AI response');
    return {text,mode:'ai'};
  }
  if (!process.env.OPENAI_API_KEY) return { text: fallback(message), mode: 'guided' };
  const response = await fetch('https://api.openai.com/v1/responses', { method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${process.env.OPENAI_API_KEY}`}, body:JSON.stringify({ model:process.env.OPENAI_MODEL || 'gpt-4.1-mini', instructions:`${system}\n${context}`, input, max_output_tokens:300, store:false }) });
  if (!response.ok) throw new Error(`AI service returned ${response.status}`);
  const data = await response.json();
  const text = data.output_text || data.output?.flatMap(x => x.content || []).filter(x => x.type === 'output_text').map(x => x.text).join('');
  if (!text) throw new Error('Empty AI response');
  return { text, mode:'ai' };
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
