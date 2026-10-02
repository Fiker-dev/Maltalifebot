import { localTime } from "./thulani.js";
const site = 'https://www.matlalife.co.za';
const knowledge = `Matla Life offers life cover, funeral cover (including consolidated funeral cover), wills and estate planning, and Matla Insure for vehicle, home and personal insurance. The consolidated funeral plan brings multiple policies into one plan and may cover up to 22 family members. Funeral main cover is described as R10,000 to R150,000, but individual eligibility, premiums and terms require an advisor's confirmation. Contact: +27 87 210 0782 or info@matlalife.co.za. Office: 23 Wellington Road, Parktown, Johannesburg, 2193. Hours: Monday to Friday, 08:00 to 17:30. Website: ${site}. The public funeral page contains conflicting waiting-period statements, so do not state a specific waiting period as certain; refer the visitor to the policy wording or an advisor. Never claim to see a customer's account, policy, claim status or personal information.`;
const system = `You are Thulani, Matla Life's friendly and professional virtual assistant in South Africa. The visitor already sees your name and an opening greeting. After that, have a natural conversation: respond to what they actually said, remember their stated goal, and build on the last answer instead of restarting or repeating a product summary. Use warm, plain South African English. Sound attentive, calm and assured, never salesy or scripted. Vary sentence openings. Do not repeat your name, greetings, thanks, the phone number, or the same disclaimer unless relevant to the new question. Answer first, then add only the detail that helps. Ask one short follow-up only when it moves the conversation forward; do not end every turn with a question or routinely suggest an advisor. Keep replies under 70 words and at most four short sentences in no more than two paragraphs. If the visitor asks something broad, ask one specific clarifying question. If they want a quote, application, claim decision, legal or financial advice, or policy-specific terms, say what you cannot confirm and guide them to Matla Life's published contact number. The handoff button below is a demo only: its WhatsApp and email drafts go to LuliDigital, not Matla Life staff. If you mention it, explain that distinction briefly and clearly. The visitor chooses their contact details, explicitly consents, and reviews a draft before sending it. Do not imply a callback is booked, a message was sent, or details were saved. Use only these verified facts: ${knowledge} Never invent benefits, prices, guarantees, claims timelines, eligibility rules or application outcomes. Do not ask for ID numbers, banking details, medical details or policy numbers in chat. If someone reports a bereavement, lead with empathy and give the contact number. Reply in another language only when the visitor uses it and you can do so accurately. 'Siyabonga' means 'thank you', not 'hello'. Use plain text only, without Markdown, headings or bullets. Never describe a product as cheaper, more affordable, better value or quicker unless those exact words appear in the verified facts.`;

export function fallback(message) {
  const q = message.toLowerCase();
  if (/open now|are you open|office hours|business hours|what time|current time|today/.test(q)) { const t=localTime(); return `It’s ${String(t.hour).padStart(2,'0')}:${String(t.minute).padStart(2,'0')} in South Africa. ${t.open?'Matla Life’s listed office hours suggest the team is open now.':'Matla Life’s office is currently outside its listed hours.'} Hours are Monday to Friday, 08:00–17:30. You can call +27 87 210 0782.`; }
  if (/claim|death|passed away|died|bereav/.test(q)) return `I’m sorry you’re dealing with this. For help with a funeral claim or the documents needed, please call Matla Life on +27 87 210 0782. I can help you make a short list of questions for their team, but I can’t view or submit a claim here.`;
  if (/waiting|period|immediate|suicide/.test(q)) return `Waiting periods depend on the policy terms. Matla Life’s public information is inconsistent on this point, so I don’t want to give you a misleading answer. Please confirm the exact wording with an advisor on +27 87 210 0782.`;
  if (/price|cost|premium|quote|afford/.test(q)) return `An advisor can confirm a current quote and the policy terms for your situation. You can use the advisor handoff button below this chat to prepare a message. Which type of cover are you interested in?`;
  if (/funeral|family|consolidat/.test(q)) return `Matla Life offers funeral cover and a consolidated plan that can bring multiple funeral policies into one. Its site says the plan can cover up to 22 family members, with main cover described from R10,000 to R150,000. An advisor should confirm eligibility, benefits and premiums for your family. What would you like to know?`;
  if (/life cover|life insurance/.test(q)) return `Matla Life offers life cover for financial protection of loved ones. I can explain the general idea, but an advisor should confirm cover amounts, premiums and eligibility for you. You can call +27 87 210 0782.`;
  if (/will|estate/.test(q)) return `Matla Life offers wills and estate planning services. For personal estate advice or to get started, please speak with its team on +27 87 210 0782.`;
  if (/car|vehicle|home|short.term|insure/.test(q)) return `Matla Insure covers vehicle, home and personal insurance needs. For available options and a current quote, please contact Matla Life on +27 87 210 0782.`;
  if (/contact|phone|address|office|hours|human|advisor|email|whatsapp/.test(q)) return `${localTime().open?'The team is within its listed office hours now.':'The team is out of office right now, but I can still help.'} You can call Matla Life on +27 87 210 0782 or email info@matlalife.co.za. The handoff button below is a demo and sends drafts to LuliDigital.`;
  return `I can help with life cover, funeral cover, wills and estate planning, or Matla Insure. What would you like to know?`;
}

function naturalReply(text, message) {
  let cleaned = text.trim();
  const greeting = '(?:hello|hi|hey|good (?:morning|afternoon|evening|day))(?: there)?';
  const visitorGreeted = /^\s*(?:hello|hi|hey|hiya|howzit|good (?:morning|afternoon|evening|day)|sawubona|molo|dumela|avuxeni|ndaa|lotjhani)\b/i.test(message);
  if (!/who are you|what is your name|your name|are you (a|an) (bot|ai|assistant)/i.test(message)) {
    cleaned = cleaned.replace(new RegExp(`^${greeting}[!,. ]*(?:i(?:'|’)m|i am) Thulani,?\\s*(?:a |the )?(?:Matla Life(?:'s|’s)? )?(?:virtual |AI )?assistant[.! ]*`, 'i'), '');
    if (!visitorGreeted) cleaned = cleaned.replace(new RegExp(`^${greeting}\\b[!,.]*\\s*`, 'i'), '');
  }
  cleaned = cleaned.replace(/^(?:thanks for (?:asking|your question)|great question|i(?:'|’)d be happy to help)[!,. ]*/i, '').trim();
  if (!cleaned) return text.trim();
  return limitLength(cleaned[0].toUpperCase() + cleaned.slice(1));
}

// Backstop for over-long replies: keep whole sentences and an optional closing question only when they fit.
function limitLength(text, maxWords = 65) {
  const words = value => value.split(/\s+/).filter(Boolean).length;
  if (words(text) <= maxWords) return text;
  const sentences = text.match(/[^.!?]+[.!?]+["’”)]*\s*|[^.!?]+$/g) || [text];
  const question = sentences.at(-1).trim().endsWith('?') ? sentences.pop().trim() : '';
  let kept = '';
  for (const sentence of sentences) {
    if (words(kept + sentence) > maxWords) break;
    kept += sentence;
  }
  if (!kept) return text;
  kept = kept.trim();
  return question && words(kept) + words(question) <= maxWords ? `${kept} ${question}` : kept;
}

export async function reply(message, history) {
  if (/\b(price|prices|cost|premium|premiums|quote|quotes|afford)\b|per month|monthly payment/i.test(message)) {
    return { text: 'I can’t confirm a current premium here. A Matla Life advisor can check the cover options and policy terms for your situation. You can call +27 87 210 0782 or email info@matlalife.co.za.', mode: 'guided' };
  }
  const input = [...history.slice(-8).filter(x => ['user','assistant'].includes(x.role) && typeof x.content === 'string').map(x => ({ role:x.role, content:x.content.slice(0,1500) })), { role:'user', content:message }];
  const t = localTime();
  const context = `Current South African local time: ${String(t.hour).padStart(2,'0')}:${String(t.minute).padStart(2,'0')} on ${t.weekday}. Listed office is ${t.open?'open':'closed'} now (Monday–Friday 08:00–17:30). Use time-sensitive wording only when relevant.`;
  if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_WORKSPACE_ID) {
    const response = await fetch('https://api.anthropic.com/v1/messages', { method:'POST', headers:{'Content-Type':'application/json','anthropic-version':'2023-06-01','x-api-key':process.env.ANTHROPIC_API_KEY,'anthropic-workspace-id':process.env.ANTHROPIC_WORKSPACE_ID}, body:JSON.stringify({ model:process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001', max_tokens:350, system:`${system}\n${context}`, messages:input }), signal:AbortSignal.timeout(20000) });
    if (!response.ok) { const detail = await response.json().catch(()=>({})); throw new Error(`AI service returned ${response.status}: ${String(detail.error?.message || 'Unknown provider error').slice(0,250)}`); }
    const data = await response.json();
    const text = data.content?.filter(x=>x.type==='text').map(x=>x.text).join('');
    if (!text) throw new Error('Empty AI response');
    return {text:naturalReply(text,message),mode:'ai'};
  }
  if (!process.env.OPENAI_API_KEY) return { text: fallback(message), mode: 'guided' };
  const response = await fetch('https://api.openai.com/v1/responses', { method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${process.env.OPENAI_API_KEY}`}, body:JSON.stringify({ model:process.env.OPENAI_MODEL || 'gpt-4.1-mini', instructions:`${system}\n${context}`, input, max_output_tokens:300, store:false }) });
  if (!response.ok) throw new Error(`AI service returned ${response.status}`);
  const data = await response.json();
  const text = data.output_text || data.output?.flatMap(x => x.content || []).filter(x => x.type === 'output_text').map(x => x.text).join('');
  if (!text) throw new Error('Empty AI response');
  return { text:naturalReply(text,message), mode:'ai' };
}
