const form = document.querySelector('#chat-form');
const input = document.querySelector('#message');
const messages = document.querySelector('#messages');
const quick = document.querySelector('#quick');
const welcomeIntro = document.querySelector('#welcome-intro');
const status = document.querySelector('#status');
const handoff = document.querySelector('#handoff');
const whatsappLink = document.querySelector('#whatsapp-link');
const history = [];
const coarse = matchMedia('(pointer: coarse)').matches;
let greetingData;
function updateWelcome() {
  if (!greetingData || history.length) return;
  welcomeIntro.textContent = `Good ${greetingData.period}! I’m Thulani, Matla Life’s virtual assistant. ${greetingData.open ? 'Our team is available now. Ask me anything, and I can help you reach them if needed.' : `Our staff are out of office right now, but I’m here to talk. Ask me any question. If you need their help later, I can guide you to ${greetingData.whatsapp ? 'WhatsApp or email' : 'email'}.`}`;
}
async function updateTime() {
  try {
    const response = await fetch('/api/greeting'); if (!response.ok) return;
    greetingData = await response.json();
    status.textContent = greetingData.open ? 'Office open' : 'Office closed';
    status.classList.toggle('closed', !greetingData.open);
    status.title = `South African time ${greetingData.time} · Mon–Fri 08:00–17:30`;
    handoff.hidden = greetingData.open && !history.some(x=>x.role==='user' && /advisor|human|staff|contact|email|whatsapp|call me|speak to/.test(x.content.toLowerCase()));
    whatsappLink.hidden = !greetingData.whatsapp;
    if (greetingData.whatsapp) whatsappLink.href = `https://wa.me/${greetingData.whatsapp}?text=${encodeURIComponent('Hello Matla Life, I would like help from an advisor.')}`;
    updateWelcome();
  } catch { status.textContent = 'Office hours: Mon–Fri'; }
}
updateTime(); setInterval(updateTime, 60000);
// Turn phone numbers and the email address into tap-to-call / tap-to-email links (built as DOM nodes, never innerHTML).
function setRichText(el, text) {
  el.textContent = '';
  const pattern = /(\+27[\s\d]{9,13}\d|0\d{2}\s?\d{3}\s?\d{4}|[\w.+-]+@[\w-]+\.[\w.]+)/g;
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    el.append(text.slice(last, match.index));
    const value = match[0].replace(/[.,]$/, ''); const link = document.createElement('a');
    link.href = value.includes('@') ? `mailto:${value}` : `tel:${value.replace(/\s/g,'')}`; link.textContent = value;
    el.append(link, match[0].slice(value.length)); last = match.index + match[0].length;
  }
  el.append(text.slice(last));
}
const followUps = [
  [/funeral|family|burial|22/, ['How does the consolidated plan work?','Who can I add to my plan?','Speak to an advisor']],
  [/life cover|life insurance/, ['What does life cover protect?','Do you offer funeral cover too?','Speak to an advisor']],
  [/will|estate/, ['Why should I have a will?','What other products do you offer?','Speak to an advisor']],
  [/insure|vehicle|car|home/, ['What does Matla Insure cover?','What other products do you offer?','Speak to an advisor']],
  [/advisor|contact|call|email|office/, ['What are your office hours?','Tell me about funeral cover','What products do you offer?']],
];
function suggest(question, answer = '') {
  const match = text => followUps.find(([pattern]) => pattern.test(text.toLowerCase()));
  const found = match(question) || match(answer);
  const options = found ? found[1] : ['Tell me about funeral cover','What products do you offer?','Speak to an advisor'];
  quick.replaceChildren(...options.map(label => { const b = document.createElement('button'); b.type = 'button'; b.dataset.prompt = label === 'Speak to an advisor' ? 'How can I contact an advisor?' : label; b.innerHTML = '<span>↗</span>'; b.prepend(label + ' '); return b; }));
  quick.hidden = false; quick.scrollLeft = 0;
}
function addMessage(text, role) {
  const item = document.createElement('div'); item.className = `message ${role}`;
  const bubble = document.createElement('div'); bubble.className = 'bubble'; setRichText(bubble, text);
  const time = document.createElement('time'); time.textContent = new Date().toLocaleTimeString('en-ZA',{hour:'2-digit',minute:'2-digit'});
  item.append(bubble,time); messages.append(item); messages.scrollTop = messages.scrollHeight; return item;
}
async function send(text) {
  text = text.trim(); if (!text || form.dataset.busy) return;
  input.value = ''; quick.hidden = true; form.dataset.busy = 'true'; form.querySelector('button').disabled = true;
  addMessage(text,'user'); const loading = addMessage('','bot'); const dots = loading.querySelector('.bubble');
  dots.classList.add('typing'); dots.setAttribute('aria-label','Thulani is typing'); dots.innerHTML = '<i></i><i></i><i></i>';
  try {
    const response = await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:text,history})});
    if (!response.ok) throw new Error('Connection failed');
    const data = await response.json(); dots.classList.remove('typing'); dots.removeAttribute('aria-label'); setRichText(dots, data.text);
    history.push({role:'user',content:text},{role:'assistant',content:data.text});
    suggest(text, data.text);
    if (/advisor|human|staff|contact|email|whatsapp|call me|speak to/.test(text.toLowerCase())) handoff.hidden = false;
  } catch { dots.classList.remove('typing'); dots.removeAttribute('aria-label'); setRichText(dots, 'I’m having trouble connecting right now. Please try again, or call Matla Life on +27 87 210 0782.'); suggest(''); }
  finally { delete form.dataset.busy; form.querySelector('button').disabled = false; if (!coarse) input.focus(); messages.scrollTop = messages.scrollHeight; }
}
form.addEventListener('submit',event=>{event.preventDefault();send(input.value)});
quick.addEventListener('click',event=>{const button=event.target.closest('button[data-prompt]');if(button)send(button.dataset.prompt)});
