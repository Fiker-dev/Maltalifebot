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
function addMessage(text, role) {
  const item = document.createElement('div'); item.className = `message ${role}`;
  const bubble = document.createElement('div'); bubble.className = 'bubble'; bubble.textContent = text;
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
    const data = await response.json(); dots.classList.remove('typing'); dots.removeAttribute('aria-label'); dots.textContent = data.text;
    history.push({role:'user',content:text},{role:'assistant',content:data.text});
    if (/advisor|human|staff|contact|email|whatsapp|call me|speak to/.test(text.toLowerCase())) handoff.hidden = false;
  } catch { dots.classList.remove('typing'); dots.removeAttribute('aria-label'); dots.textContent = 'I’m having trouble connecting right now. Please try again, or call Matla Life on +27 87 210 0782.'; }
  finally { delete form.dataset.busy; form.querySelector('button').disabled = false; if (!coarse) input.focus(); messages.scrollTop = messages.scrollHeight; }
}
form.addEventListener('submit',event=>{event.preventDefault();send(input.value)});
quick.addEventListener('click',event=>{const button=event.target.closest('button[data-prompt]');if(button)send(button.dataset.prompt)});
