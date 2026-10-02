export const timeZone = 'Africa/Johannesburg';
const greetings = {
  en: 'Hello', zu: 'Sawubona', xh: 'Molo', st: 'Dumela', ts: 'Avuxeni', ve: 'Ndaa', nr: 'Lotjhani'
};
export function localTime(now = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone, weekday:'short', hour:'2-digit', minute:'2-digit', hourCycle:'h23' }).formatToParts(now).filter(p=>p.type!=='literal').map(p=>[p.type,p.value]));
  const hour = Number(parts.hour), minute = Number(parts.minute);
  return { hour, minute, weekday:parts.weekday, period:hour<12?'morning':hour<17?'afternoon':'evening', open:!['Sat','Sun'].includes(parts.weekday) && (hour*60+minute)>=480 && (hour*60+minute)<1050 };
}
export function greeting(language = 'en', now = new Date()) {
  const t = localTime(now);
  const hello = greetings[language] || greetings.en;
  return language === 'en' ? `Good ${t.period}` : `${hello}! Good ${t.period}`;
}
export function opening(now = new Date()) {
  const t = localTime(now);
  return `${greeting('en',now)}! I’m Thulani, Matla Life’s virtual assistant. ${t.open ? 'The team is within office hours now.' : 'Our staff are out of office right now, but I’m here to talk.'} What can I help you with today?`;
}
